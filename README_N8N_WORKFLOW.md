## n8n Workflow – OpenSky Ingestion & Snapshot Writer

This document explains **exactly how to build the n8n workflow**, node by node, so that it:

- Calls the **OpenSky Network** public API on a schedule.
- Filters + reshapes the data into your project’s expected JSON format.
- Writes snapshots into your local `snapshots/` folder as:
  - `region1.json` (latest flights snapshot for region1).
  - `alerts.json` (optional: generated anomalies/alerts).
- Can later be extended to multiple regions (region2, region3, …).

The output format is designed to integrate cleanly with your existing:

- `mcp/mcp_server.py` (reads `../snapshots/region1.json` and `../snapshots/alerts.json`).
- `ui/app.py` (expects `{"states": [ {flight}, ... ]}` with keys like `callsign`, `baro_altitude`, etc.).

---

## 1. Prerequisites & Directory Mapping

### 1.1 Required tools

- Docker (or Docker Desktop) installed.
- Internet access (for OpenSky API and pulling the n8n image).

### 1.2 Directory assumption

Your project root is:

```text
.../Assignment 3/
├── agents/
├── mcp/
├── snapshots/
├── ui/
└── main.py
```

The workflow will write directly into this existing `snapshots/` folder.

### 1.3 Run n8n with a volume mount

Start n8n and mount the project `snapshots/` folder inside the container so n8n can write files that your FastAPI app can see:

```bash
cd "C:\Users\muham\OneDrive\Documents\Semester 7\Agentic\Assignment 3"

docker run -it ^
  -p 5678:5678 ^
  -v "%cd%/snapshots":/data/snapshots ^
  -v "%cd%/.n8n":/home/node/.n8n ^
  n8nio/n8n
```

Key points:

- Inside the container, the host `snapshots/` directory is visible as `/data/snapshots`.
- We will configure the **Write Binary File** nodes to write to:
  - `/data/snapshots/region1.json`
  - `/data/snapshots/alerts.json`
- `mcp_server.py` running on your host will still use `../snapshots/region1.json` and `../snapshots/alerts.json` as before; the files will be created/updated by n8n.

Open n8n in the browser at `http://localhost:5678`.

---

## 2. Data Model – What We Want in `region1.json`

OpenSky’s anonymous API returns:

```http
GET https://opensky-network.org/api/states/all
```

The JSON shape is (simplified):

```json
{
  "time": 1710000000,
  "states": [
    [
      "icao24",
      "callsign",
      "origin_country",
      "time_position",
      "last_contact",
      "longitude",
      "latitude",
      "baro_altitude",
      "on_ground",
      "velocity",
      "true_track",
      "vertical_rate",
      "sensors",
      "geo_altitude",
      "squawk",
      "spi",
      "position_source",
      "category"
    ],
    ...
  ]
}
```

We will convert each array element into a JSON object with **named fields**:

- `icao24`
- `callsign`
- `origin_country`
- `time_position`
- `last_contact`
- `longitude`
- `latitude`
- `baro_altitude`
- `on_ground`
- `velocity`
- `true_track`
- `vertical_rate`
- `geo_altitude`
- `squawk`
- `position_source`
- `category`

Final `region1.json` structure:

```json
{
  "time": 1710000000,
  "region": "region1",
  "states": [
    {
      "icao24": "4baa1a",
      "callsign": "THY4KZ",
      "origin_country": "Turkey",
      "time_position": 1710000000,
      "last_contact": 1710000010,
      "longitude": 28.977,
      "latitude": 41.008,
      "baro_altitude": 10500,
      "on_ground": false,
      "velocity": 230.5,
      "true_track": 90.0,
      "vertical_rate": -1.5,
      "geo_altitude": 10300,
      "squawk": "1234",
      "position_source": 0,
      "category": 0
    }
  ]
}
```

This format is exactly what `mcp_server.py` and `ui/app.py` expect.

---

## 3. n8n Workflow – High-Level Node List

Create a new workflow in n8n and add these nodes in order:

1. **Trigger** – either **Cron** or **Manual Trigger** (for demo).
2. **HTTP Request – OpenSky API** – fetch flight states for a bounding box (region1).
3. **Function – Map States to Objects** – convert OpenSky arrays into named JSON objects.
4. **Function – Build Snapshot JSON** – wrap data in `{ time, region, states }`.
5. **Move Binary Data – JSON → Binary (Snapshot)** – prepare for file writing.
6. **Write Binary File – region1.json** – write latest snapshot file.
7. **Function – Build Alerts (Optional)** – simple rule-based alerts from the same data.
8. **Move Binary Data – JSON → Binary (Alerts)** – prepare for alerts file.
9. **Write Binary File – alerts.json** – write latest alerts file.

Below is the **detailed configuration** for each node.

---

## 4. Node-by-Node Configuration

### 4.1 Node 1 – Trigger

**Option A – Cron (recommended for demo)**

- **Node type**: `Cron`
- **Name**: `Cron Trigger`
- **Mode**: `Every Minute` (or any interval you like, e.g., every 5 minutes).

**Option B – Manual Trigger (for testing)**

- **Node type**: `Manual Trigger`
- **Name**: `Manual Trigger`

> For development, you can start with `Manual Trigger` and later switch to `Cron`.

---

### 4.2 Node 2 – HTTP Request (OpenSky)

- **Node type**: `HTTP Request`
- **Name**: `Fetch OpenSky Region1`

**Settings tab:**

- `HTTP Method`: `GET`
- `URL`: `https://opensky-network.org/api/states/all`
- `Response Format`: `JSON`

**Query Parameters** (choose a bounding box for “region1”; you can adjust values):

- `lamin` = `40.0`   (min latitude)
- `lamax` = `42.0`   (max latitude)
- `lomin` = `27.0`   (min longitude)
- `lomax` = `30.0`   (max longitude)

These parameters restrict results to a rough area; you can pick a region of interest.

No authentication is required for anonymous access.

**Connections:**

- `Cron Trigger` (or `Manual Trigger`) → `Fetch OpenSky Region1`

---

### 4.3 Node 3 – Function (Map States to Objects)

- **Node type**: `Function`
- **Name**: `Map States to Objects`

**Purpose**: Turn each OpenSky array in `items[0].json.states` into a JSON object with the fields used by your UI and MCP server.

**Code:**

```javascript
// Input from previous node: items[0].json = { time, states: [ [ ... ], [ ... ], ... ] }
// We will output a single item with { time, states: [ { ... }, ... ] }

const input = items[0].json;
const time = input.time;
const states = input.states || [];

const mappedStates = states.map(s => {
  return {
    icao24: s[0],
    callsign: s[1] ? s[1].trim() : "",
    origin_country: s[2],
    time_position: s[3],
    last_contact: s[4],
    longitude: s[5],
    latitude: s[6],
    baro_altitude: s[7],
    on_ground: s[8],
    velocity: s[9],
    true_track: s[10],
    vertical_rate: s[11],
    geo_altitude: s[13],
    squawk: s[14],
    position_source: s[16],
    category: s[17]
  };
});

return [
  {
    json: {
      time,
      states: mappedStates,
    },
  },
];
```

**Connections:**

- `Fetch OpenSky Region1` → `Map States to Objects`

---

### 4.4 Node 4 – Function (Build Snapshot JSON)

- **Node type**: `Function`
- **Name**: `Build Snapshot JSON`

**Purpose**: Add the region name and prepare the exact JSON structure we want to store.

**Code:**

```javascript
const input = items[0].json;

return [
  {
    json: {
      time: input.time,
      region: "region1",
      states: input.states || [],
    },
  },
];
```

This output is what will be written into `region1.json`.

**Connections:**

- `Map States to Objects` → `Build Snapshot JSON`

---

### 4.5 Node 5 – Move Binary Data (Snapshot JSON → Binary)

- **Node type**: `Move Binary Data`
- **Name**: `Snapshot JSON to Binary`

**Purpose**: Convert the JSON object into binary data so `Write Binary File` can save it.

**Mode**:

- `Mode`: `JSON to Binary`

**Options:**

- `Source Key`: (leave as default, or use `data` if required by your n8n version)
- `Destination Key`: `data`
- `Set all data`: `true`

If your n8n UI expects explicit configuration:

- Under **JSON to Binary**:
  - **Property Name to Convert**: leave empty to use the full JSON, or set to something like `snapshot`.
  - In that case, you would first wrap JSON in `snapshot` in the previous Function; for simplicity, you can leave default and move the entire JSON.

**Connections:**

- `Build Snapshot JSON` → `Snapshot JSON to Binary`

---

### 4.6 Node 6 – Write Binary File (region1.json)

- **Node type**: `Write Binary File`
- **Name**: `Write region1.json`

**Settings:**

- `Binary Property`: `data`
- `File Name`: `/data/snapshots/region1.json`
  - This path matches the Docker volume mount:
    - Host: `.../Assignment 3/snapshots`
    - Container: `/data/snapshots`

**Options:**

- `Append to File`: `false` (we always overwrite with the latest snapshot).

**Connections:**

- `Snapshot JSON to Binary` → `Write region1.json`

At this point, every run of the workflow will refresh `region1.json` with the latest OpenSky snapshot for region1.

---

## 5. Optional: Alerts Generation (alerts.json)

This section describes **simple rule-based alerts** that match your UI’s anomaly style. You can skip this if not required, but it helps fulfil the “alerts.list active” requirement.

### 5.1 Node 7 – Function (Build Alerts)

- **Node type**: `Function`
- **Name**: `Build Alerts`

**Purpose**: Read the same snapshot data and produce a list of alerts using simple, hard-coded thresholds.

**Connection Input**:

- For simplicity, connect from `Build Snapshot JSON`:
  - `Build Snapshot JSON` → `Build Alerts`

**Code:**

```javascript
const input = items[0].json;
const states = input.states || [];

const alerts = [];

for (const flight of states) {
  const anomalies = [];

  const altitude = flight.baro_altitude;
  const velocity = flight.velocity;
  const verticalRate = flight.vertical_rate;

  if (altitude !== null && altitude !== undefined) {
    if (altitude > 40000 || altitude < 10000) {
      anomalies.push("Altitude anomaly");
    }
  }

  if (velocity !== null && velocity !== undefined) {
    if (velocity > 500 || velocity < 200) {
      anomalies.push("Speed anomaly");
    }
  }

  if (verticalRate !== null && verticalRate !== undefined) {
    if (Math.abs(verticalRate) > 2000) {
      anomalies.push("Vertical rate anomaly");
    }
  }

  if (anomalies.length > 0) {
    alerts.push({
      icao24: flight.icao24,
      callsign: flight.callsign,
      anomalies,
      region: "region1",
      timestamp: input.time,
    });
  }
}

return [
  {
    json: {
      alerts,
    },
  },
];
```

This produces a structure compatible with `mcp_server.py`:

```json
{
  "alerts": [
    {
      "icao24": "...",
      "callsign": "...",
      "anomalies": ["Altitude anomaly", "Speed anomaly"],
      "region": "region1",
      "timestamp": 1710000000
    }
  ]
}
```

---

### 5.2 Node 8 – Move Binary Data (Alerts JSON → Binary)

- **Node type**: `Move Binary Data`
- **Name**: `Alerts JSON to Binary`

**Mode**:

- `JSON to Binary`

**Options:**

- `Destination Key`: `data`
- (Same pattern as the snapshot binary conversion)

**Connections:**

- `Build Alerts` → `Alerts JSON to Binary`

---

### 5.3 Node 9 – Write Binary File (alerts.json)

- **Node type**: `Write Binary File`
- **Name**: `Write alerts.json`

**Settings:**

- `Binary Property`: `data`
- `File Name`: `/data/snapshots/alerts.json`
- `Append to File`: `false`

**Connections:**

- `Alerts JSON to Binary` → `Write alerts.json`

Now `mcp_server.py`’s endpoint:

- `GET /alerts/active`

can simply load `../snapshots/alerts.json` and return `{ "alerts": [...] }`.

---

## 6. Testing the Workflow

1. **Run n8n** with the volume mapping as described.
2. Open `http://localhost:5678`, open your workflow, and click **Execute Workflow** (if using Manual Trigger), or wait for the Cron trigger.
3. On your host machine, check:
   - `snapshots/region1.json`
   - `snapshots/alerts.json`
4. Open `region1.json` and verify:
   - It contains a top-level `time`, `region`, and `states` array.
   - Each `states[i]` has keys like `callsign`, `baro_altitude`, `velocity`, `true_track`, `latitude`, `longitude`, etc.
5. Start your MCP FastAPI server:

   ```bash
   cd mcp
   uvicorn mcp_server:app --reload --port 8000
   ```

6. Hit the endpoints in a browser or with `curl`:

   - `http://localhost:8000/flights/region/region1`
   - `http://localhost:8000/flights/THY4KZ` (or any callsign present)
   - `http://localhost:8000/alerts/active`

7. Start the Streamlit UI and verify that:
   - Ops Mode shows flights and anomalies for `region1`.
   - Traveler Mode can find a flight by callsign.

---

## 7. Extending to Multiple Regions (Preview)

Once **region1** is working, you can:

- Duplicate the workflow or parts of it to:
  - Use different bounding boxes (for region2, region3, …).
  - Write to `/data/snapshots/region2.json`, `/data/snapshots/region3.json`, etc.
- Update `mcp_server.py` to map:
  - `"region1" → "../snapshots/region1.json"`
  - `"region2" → "../snapshots/region2.json"`
  - ...

That integration detail is covered in `README_TODO_AND_IMPLEMENTATION_PLAN.md`, and this n8n workflow README stays focused on the **node-by-node** configuration needed for region1.


