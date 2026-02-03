## Assignment 3 – What Is Already Implemented

This document describes the current state of the project so your grader can clearly see which parts of the assignment are already working.

---

## 1. Agentic Layer (LangGraph + Groq)

- **LangGraph workflow (`agents/graph.py`)**
  - Defines a `State` dict and a **two-node graph**:
    - `traveler` node → calls `traveler_agent` with `callsign`, `question`, and `region`, writes `traveler_response` into state.
    - `ops` node → calls `ops_agent` with `region`, writes `ops_summary` into state.
  - Implements **A2A-style routing logic**:
    - If a traveler question contains `"other flights"` then `need_ops = True`.
    - Conditional edge: `traveler → ops` when `need_ops` is set, otherwise the workflow ends.
  - Includes basic validation so missing fields in the state cannot crash the graph.
  - Compiles a reusable `workflow` object that is used both in `main.py` and the React UI.

- **Traveler Support Agent (`agents/traveller_agent.py`)**
  - Uses **Groq LLM** via `langchain_groq.ChatGroq` with model `llama-3.1-8b-instant`.
  - Extended system prompt that:
    - Explains the meaning of keys such as `baro_altitude`, `velocity`, `true_track`, `latitude`, `longitude`, and `vertical_rate`.
    - Instructs the LLM to only use provided data, say “data not available” when fields are missing, and avoid hallucination.
  - Fetches the latest data for a given callsign from the MCP HTTP layer:
    - `GET http://localhost:8000/flights/{callsign}?region={region}`
  - Short-circuits with a friendly message when the flight is not found or the MCP layer has a connection error.
  - Wraps the LLM call in error handling so Groq issues never crash the server; errors are returned as user-friendly text.

- **Ops Analyst Agent (`agents/ops_agent.py`)**
  - Uses **Groq LLM** via `langchain_groq.ChatGroq` with model `llama-3.1-8b-instant`.
  - System prompt: *“You are an airspace operations analyst. Analyse anomalies.”* plus explicit anomaly rules:
    - altitude < 10,000 ft or > 40,000 ft
    - speed < 200 kts or > 500 kts
    - |vertical_rate| > 2,000 ft/min.
  - Fetches the regional snapshot via MCP HTTP layer:
    - `GET http://localhost:8000/flights/region/{region_name}`
  - To stay within Groq token limits, builds a **compact snapshot**:
    - Includes metadata (`total_flights`, `sampled_flights`) and up to 40 representative flights with only the anomaly‑relevant fields.
  - Sends this compact snapshot to the LLM and returns a **natural-language regional summary** that highlights anomalous flights.
  - Wraps the LLM call in error handling, returning readable error messages instead of raising exceptions.

- **Example driver (`main.py`)**
  - Demonstrates how to invoke the LangGraph workflow directly:
    - Prepares a sample `state` with `callsign`, `question`, and `region`.
    - Calls `workflow.invoke(state)` and prints the resulting response(s).

---

## 2. MCP-Style Data Access & Agent API Layer (FastAPI)

- **FastAPI app (`mcp/mcp_server.py`)**
  - HTTP service that acts as both a **data access layer** and a thin **agent API** for the UIs.
  - Uses snapshot/alert files from the `snapshots/` directory via a region‑to‑file mapping:
    - `REGION_FILES = { "region1": "../snapshots/Region1.json", "region2": "../snapshots/Region2.json", "region3": "../snapshots/Region3.json", "region4": "../snapshots/Region4.json" }`
    - `ALERTS_FILE = "../snapshots/alerts.json"`.
  - Configured with permissive **CORS** (for development) so the React dev server can call the API.

- **Snapshot / alerts endpoints**
  - `GET /flights/region/{region}`
    - Looks up the configured file for the given region, loads it, and returns `{time, region, states}`.
    - Returns an empty `{ "time": null, "region": region, "states": [] }` if the region is unknown or the file is missing/invalid.
  - `GET /flights/{callsign}?region=regionX`
    - Loads the given region’s snapshot and scans the `states` list, returning the first matching `callsign` (whitespace stripped).
    - Returns `{"error": "Not found"}` if no match.
  - `GET /alerts/active`
    - Reads `alerts.json` and returns its JSON content as `{ "alerts": [...] }`.
    - Returns an empty `{ "alerts": [] }` structure if the file does not exist or is malformed.

- **Agent endpoints for frontend integration**
  - `POST /traveler/query`
    - Request body: `{ "callsign": str, "question": str, "region": str }`.
    - Internally invokes the LangGraph `workflow` entrypoint (traveler → optional ops) and returns:
      - `traveler_response`: the traveler agent’s answer.
      - `need_ops`: whether ops analysis was requested by the user question.
      - `ops_summary`: included when the traveler question routes to the ops node.
    - Wrapped in error handling so any graph/agent issues produce a structured JSON error instead of a 500.
  - `POST /ops/analyze`
    - Request body: `{ "region": str }`.
    - Loads the regional snapshot and calls `ops_agent(region)` to produce a compact, anomaly‑aware summary.
    - Response shape: `{ "region": str, "summary": str, "flights": flights[] }`.

> Note: This service behaves like MCP tools (`flights.list region snapshot`, `flights.get by callsign`, `alerts.list active`) exposed over HTTP, and is already integrated with both agents and the UI.

---

## 3. Frontend / UI (React + Vite)
  - Implemented as a **React single-page app** using Vite:
    - Entry files: `ui/index.html`, `ui/src/main.jsx`, `ui/src/App.jsx`, `ui/src/styles.css`.
  - Uses the FastAPI layer at `MCP_SERVER_URL = "http://localhost:8000"`.
  - **Global features**
    - Gradient header with title, subtitle, MCP connection pill, and a light/dark theme toggle.
    - Tabbed navigation between **Traveler Mode** and **Ops Mode**.
    - Responsive design that collapses to a single column on small screens.
  - **Traveler Mode**
    - Inputs:
      - Flight callsign (uppercased, e.g., `THY4KZ`).
      - Region selector (`region1`–`region4`).
      - Free‑text question textarea.
    - On **Send Query**:
      - POSTs to `POST /traveler/query` with `{callsign, question, region}`.
      - Shows user and agent messages in styled chat bubbles (different colors for each side) with timestamps.
      - If `need_ops` is set, shows a hint that Ops analysis is recommended.
    - On errors (e.g., missing data, Groq issues), displays the server‑returned explanation instead of “Network Error”.
  - **Ops Mode**
    - Controls card with:
      - Region dropdown.
      - Airline filter dropdown (e.g., All, Qatar (QTR), PIA, THY, DLH, BAW, UAE, AIC, ROT, WZZ) based on callsign prefixes.
      - Buttons to **Analyze Region**, **Refresh Flights**, and **Refresh Alerts**.
    - Layout:
      - Left column card:
        - **Regional Flight Analysis**: LLM summary of the region with anomaly counts.
        - Nested **Flights in Region** table directly beneath the summary, using the airline filter and anomaly badges.
      - Right column card:
        - **Active Alerts** table sourced from `/alerts/active`, listing callsign, region, anomalies, severity, and timestamp.
    - Flight table:
      - Displays callsign, formatted altitude/speed/heading, and anomaly badges (`✓ Normal` or `⚠️ Altitude/Speed/Vertical Rate`).
      - Sorted by callsign and filtered by selected airline.
  - **Dark theme**
    - Entire UI can switch to a dark, "glass" themed variant with adjusted backgrounds, cards, tables, and chat bubbles based on `data-theme="dark"`.

---

## 4. Snapshots / Storage and n8n Data Pipeline

- `snapshots/` directory exists and is referenced by the FastAPI service:
  - Implemented files (written by the n8n workflow):
    - `Region1.json`, `Region2.json`, `Region3.json`, `Region4.json` – latest regional snapshots, normalized to `{time, region, states}`.
    - `alerts.json` – current alerts in `{ "alerts": [ {icao24, callsign, anomalies, region, timestamp, ... }, ... ] }` format.
- **n8n workflow (see `README_N8N_WORKFLOW.md`)**
  - Runs on a schedule (or manually) to call the OpenSky API and build a normalized snapshot.
  - Converts OpenSky array states into named field objects (icao24, callsign, origin_country, baro_altitude, velocity, true_track, vertical_rate, etc.).
  - Enriches each flight with a derived `region` and then **splits** the global snapshot into per‑region files `Region1.json`–`Region4.json` under the mounted `/data/snapshots` directory.
  - Builds `alerts.json` using rule‑based anomaly detection aligned with the UI/ops rules (altitude/speed/vertical rate thresholds).
  - Files written by n8n are the single source of truth consumed by both the FastAPI layer and the React UI.

---

## 5. Summary of Implemented Requirements

- **Agentic Layer**:
  - Two agents (Traveler & Ops) using Groq LLM (`llama-3.1-8b-instant`) and LangGraph.
  - Robust A2A-style interaction: traveler questions can trigger ops analysis via `need_ops`, with validation and error handling so bad inputs or LLM errors do not crash the system.
- **MCP-style Tools / Data Access**:
  - HTTP endpoints for multi‑region snapshots, per‑callsign lookup (region‑aware), and active alerts.
  - Additional agent‑oriented endpoints (`/traveler/query`, `/ops/analyze`) used by the React UI instead of exposing LangGraph directly to the frontend.
  - Agents call this layer via `requests` rather than reading JSON directly from disk.
- **UI / Frontend**:
  - Modern React UI with Traveler and Ops modes, airline filters, anomaly badges, professional metrics dashboard, and dark/light themes.
- **Data Pipeline**:
  - n8n workflow integrated with OpenSky, writing normalized region snapshots and alerts into `snapshots/`, which are then consumed by FastAPI, agents, and the UI.


