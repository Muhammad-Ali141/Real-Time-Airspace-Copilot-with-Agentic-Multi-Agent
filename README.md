## Real‑Time Airspace Copilot – Assignment 3

This project implements a **multi‑agent, data‑driven airspace monitoring system**. It combines:

- An **n8n workflow** that ingests OpenSky Network data and writes JSON snapshots.
- A **FastAPI “MCP‑style” server** that exposes flight and alert data as HTTP tools.
- Two **Groq‑powered agents** (Traveler & Ops) orchestrated with LangGraph.
- A modern **React + Vite + Tailwind** frontend with Traveler and Ops modes.

Everything is wired end‑to‑end so you can ask questions about a specific flight or inspect anomalies in a region in near‑real time.

---

## 1. Repository Structure

```text
Assignment 3/
├── agents/
│   ├── graph.py              # LangGraph workflow
│   ├── traveller_agent.py    # Traveler agent (Groq)
│   └── ops_agent.py          # Ops agent (Groq)
├── mcp/
│   └── mcp_server.py         # FastAPI MCP-style API + agent endpoints
├── snapshots/
│   ├── Region1.json          # n8n-generated regional snapshots
│   ├── Region2.json
│   ├── Region3.json
│   ├── Region4.json
│   └── alerts.json           # n8n-generated alerts
├── ui/
│   ├── index.html            # HTML entry point
│   ├── package.json          # Node dependencies
│   ├── vite.config.mts       # Vite configuration
│   ├── tailwind.config.cjs   # TailwindCSS configuration
│   ├── postcss.config.cjs    # PostCSS configuration
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── index.css         # Global styles
│       ├── App.jsx           # Main app component with routing
│       └── components/       # React components (Header, Tabs, TravelerPage, OpsDashboard, etc.)
├── main.py                   # Example of calling the LangGraph workflow
├── README_IMPLEMENTED.md     # Detailed description of what was built
└── README_N8N_WORKFLOW.md    # Node-by-node n8n workflow instructions
```

---

## 2. Data Layer – n8n Workflow & Snapshots

The **n8n workflow** (see `My workflow 2.json` and `README_N8N_WORKFLOW.md`) is responsible for:

- Calling the **OpenSky Network API** periodically.
- Converting raw `states` arrays into structured flight objects with keys like:
  - `icao24`, `callsign`, `origin_country`, `longitude`, `latitude`, `baro_altitude`, `velocity`, `true_track`, `vertical_rate`, etc.
- Tagging each flight with a **derived region** (e.g. region1…region4).
- Writing regional snapshots to:
  - `snapshots/Region1.json` … `snapshots/Region4.json`.
- Generating anomaly‑based **alerts** and writing to:
  - `snapshots/alerts.json` as `{ "alerts": [ {icao24, callsign, anomalies, region, timestamp, ...}, ... ] }`.

These snapshot files are the single source of truth used by the FastAPI server and UI instead of querying OpenSky directly from Python.

---

## 3. MCP‑Style API & Agents (FastAPI + LangGraph + Groq)

### 3.1 Snapshot & alert endpoints

`mcp/mcp_server.py` exposes an HTTP layer over the JSON snapshots:

- `GET /flights/region/{region}`  
  Returns the snapshot for the given region from `REGION_FILES` mapping:
  `{"time": ..., "region": ..., "states": [...]}`.

- `GET /flights/{callsign}?region=regionX`  
  Searches the region’s `states` for the first matching `callsign`.  
  Returns the flight object or `{"error": "Not found"}`.

- `GET /alerts/active`  
  Returns the content of `alerts.json` as `{ "alerts": [...] }`, or an empty list if missing/invalid.

### 3.2 Agents

Two Groq‑powered agents live in `agents/`:

- **Traveler Agent (`traveller_agent.py`)**
  - Model: `llama-3.1-8b-instant` via `langchain_groq.ChatGroq`.
  - Fetches live data using:
    - `GET /flights/{callsign}?region={region}`.
  - System prompt documents flight fields and instructs the LLM to:
    - Use only provided data.
    - Say “data not available” when fields are missing.
    - Never hallucinate values.
  - If the flight isn’t found, returns a friendly message instead of calling the LLM.
  - Any Groq errors are caught and surfaced as readable text.

- **Ops Agent (`ops_agent.py`)**
  - Model: `llama-3.1-8b-instant`.
  - Fetches region snapshot using `GET /flights/region/{region}`.
  - Builds a **compact snapshot** to stay under token limits:
    - Includes `total_flights` and up to 40 representative flights with only:
      `callsign`, `baro_altitude`, `velocity`, `vertical_rate`.
  - System prompt defines anomaly thresholds:
    - Altitude <10,000 ft or >40,000 ft.
    - Speed <200 kts or >500 kts.
    - |vertical_rate| >2,000 ft/min.
  - Returns a natural‑language summary of regional traffic and anomalies.

### 3.3 LangGraph Workflow

`agents/graph.py` defines a simple two‑node LangGraph:

- `traveler` node:
  - Validates that `callsign` and `question` exist in state.
  - Calls `traveler_agent(callsign, question, region)`.
  - Stores `state["traveler_response"]`.
  - If the question mentions “other flights” → sets `state["need_ops"] = True`.

- `ops` node:
  - Calls `ops_agent(region)` and sets `state["ops_summary"]`.

Edges:

- Entry: `traveler`.
- Conditional: `traveler` → `ops` if `need_ops` else `END`.
- `ops` → `END`.

This workflow is still usable via `main.py` but, for the React UI, the backend also exposes thin endpoints that call the agents directly.

### 3.4 Agent endpoints for the frontend

To make the React UI simple and robust, `mcp_server.py` adds:

- `POST /traveler/query`
  - Body: `{ "callsign": str, "question": str, "region": str }`.
  - Calls `traveler_agent` directly:
    - `traveler_agent(callsign, question, region)`.
  - Mirrors LangGraph’s behavior for `need_ops`:
    - Checks if the question contains `"other flights"`.
    - If yes, calls `ops_agent(region)` to pre‑compute an ops summary.
  - Response:

    ```json
    {
      "traveler_response": "<LLM answer or friendly error>",
      "need_ops": true | false,
      "ops_summary": "<optional ops summary>"
    }
    ```

- `POST /ops/analyze`
  - Body: `{ "region": str }`.
  - Returns:

    ```json
    {
      "region": "region1",
      "summary": "<LLM regional analysis>",
      "flights": [ ... compact snapshot flights ... ]
    }
    ```

FastAPI is configured with permissive CORS in development so the React dev server on `localhost:5173` can call these endpoints.

---

## 4. Frontend – React + Vite + Tailwind + Framer Motion

The frontend is a modern SPA located in `ui/`:

- **Tech stack**
  - React 18 + Vite 5.
  - TailwindCSS 3 for styling.
  - Framer Motion for animations.
  - Lucide icons.
  - React Router (`/traveler`, `/ops` routes).

### 4.1 App shell (`src/App.jsx`)

The top‑level `App` component:

- Manages **theme** (`light` / `dark`):
  - Applies `class="dark"` and `data-theme="dark"` on `<html>`.
- Checks **MCP connection** by calling `GET /flights/region/region1` once.
- Renders:
  - `Header` – title, subtitle, theme toggle, MCP status pill.
  - `Tabs` – pill tabs that navigate between `/traveler` and `/ops` using `NavLink`.
  - Routes:
    - `/traveler` → `TravelerPage`.
    - `/ops` → `OpsDashboard`.
  - Animated route transitions via `AnimatePresence` and `motion.div`.

### 4.2 Traveler Mode – Flight Assistant

**Route:** `/traveler`  
**Components:** `TravelerPage`, `TravelerForm`, `ChatWindow`, `ChatBubble`.

Behavior:

- Inputs:
  - Flight callsign (uppercased).
  - Region select (`region1`–`region4`).
  - Question textarea.

- On **Send Query**:
  - Validates MCP connection and inputs.
  - Appends a **user message** to chat.
  - Sends `POST /traveler/query` with `{ callsign, question, region }`.
  - Appends an **agent message** containing:
    - `traveler_response` (LLM answer or friendly explanation).
    - `need_ops` flag.

- Chat UI:
  - Right‑aligned **blue bubbles** for user messages.
  - Left‑aligned **neutral bubbles** for agent messages.
  - Timestamps and optional inline notice when `need_ops` is true (“Ops analysis recommended — switch to Ops Mode…”).
  - Auto‑scrolling container with smooth slide‑in animations for each message.

The overall experience feels like a messaging app focused on a single flight and its status.

### 4.3 Ops Mode – Regional Analytics Dashboard

**Route:** `/ops`  
**Components:** `OpsDashboard`, `FlightsTable`, `AlertsTable`, `Dropdown`, `Card`.

Behavior & layout:

- Controls at the top:
  - Region selector (`region1`–`region4`).
  - Airline filter (top airline prefixes like QTR, PIA, THY, DLH, BAW, UAE, AIC, ROT, WZZ).
  - Buttons:
    - **Analyze Region** → `POST /ops/analyze` (LLM summary + flights).
    - **Refresh Flights** → `GET /flights/region/{region}`.
    - **Alerts** → `GET /alerts/active`.

- Left column (`<Card>`):
  - **Regional Analysis**:
    - Shows the LLM summary for the selected region with fade‑in animation.
  - **Flights in Region** (embedded below the summary):
    - Table of flights filtered by airline:
      - Callsign, altitude, speed, heading, anomalies.
    - Anomaly pills: `✓ Normal` vs. `⚠ Altitude/Speed/Vertical Rate`.

- Right column (`AlertsTable`):
  - **Active Alerts**:
    - Table listing callsign, region, anomalies, severity, and time.
    - Severity pills: red for critical, amber for warnings.
    - Hover row effects for readability.

The dashboard gives a clear, at‑a‑glance view of regional health and outliers.

### 4.4 Theming & responsiveness

- Light theme:
  - Background `#f8fafc`, white cards, blue primary, cyan accent.
- Dark theme:
  - Background `#0f172a`, dark cards, vibrant blue primary, cyan accent.
- Theme switch:
  - `ThemeToggle` component toggles between light/dark with smooth transitions.
- Responsive:
  - Layout collapses gracefully on smaller screens (stacked cards, full‑width tables).
  - Uses Tailwind’s grid and spacing utilities to keep content centered and readable.

---

## 5. How to Run Everything

**Prerequisite:** Create a `.env` file in the project root with your Groq API key:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Or copy `.env.example` to `.env` and fill in the value. Get a free key at [https://console.groq.com](https://console.groq.com).

1. **Start n8n** (data pipeline)

   ```bash
   cd "C:\Users\PC\Documents\University\Semester7\Agentic\Assignment 3"

   docker run -it --rm ^
     -p 5678:5678 ^
     -v "%cd%/snapshots":/data/snapshots ^
     -v "%cd%/.n8n":/home/node/.n8n ^
     n8nio/n8n
   ```

   - Open `http://localhost:5678`, load/configure the workflow, and execute it so `RegionX.json` and `alerts.json` are available in `snapshots/`.

2. **Start FastAPI server**

   **Option A - Using the startup script (recommended):**
   
   ```bash
   cd "C:\Users\EishaPC\Downloads\Assignment 3\Assignment 3"
   python start_mcp_server.py
   ```
   
   **Option B - Manual start:**
   
   ```bash
   cd "C:\Users\EishaPC\Downloads\Assignment 3\Assignment 3\mcp"
   uvicorn mcp_server:app --reload --port 8000 --host 0.0.0.0
   ```
   
   The server will be available at `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

3. **Start the React UI**

   ```bash
   cd "C:\Users\PC\Documents\University\Semester7\Agentic\Assignment 3\ui"
   npm install   # first time only
   npm run dev
   ```

   - Open `http://localhost:5173`.
   - Traveler Mode: `/traveler` (default).
   - Ops Mode: `/ops`.

---

## 6. What’s Implemented vs Optional

**Implemented:**

- n8n → OpenSky ingestion, normalization, multi‑region snapshots, alerts.
- FastAPI → MCP-style tools `/flights/...`, `/alerts/active`, and agent endpoints `/traveler/query`, `/ops/analyze` with robust error handling.
- Agents → Traveler & Ops using Groq `llama-3.1-8b-instant`, with compact snapshots and grounding prompts.
- LangGraph → two‑node workflow wired between Traveler and Ops.
- React UI → modern, responsive Tailwind UI with Traveler chat and Ops dashboard, airline filters, dark/light theme, and smooth animations.

**Optional / Stretch (documented but not required):**

- Upgrade FastAPI to a **full MCP protocol server** (Model Context Protocol) instead of HTTP‑only.
- Add a dedicated `README_DEMO.md` with fully scripted demo scenarios.

The current codebase already meets the assignment’s functional requirements and provides a polished, production‑style interface over a real‑world data pipeline.*** End Patch`"}]}}}**

