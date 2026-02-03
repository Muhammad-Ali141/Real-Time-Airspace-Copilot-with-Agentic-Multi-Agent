from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from typing import Dict, Any
import sys

# Ensure project root is on sys.path so we can import agents/graph when running from mcp/
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from agents.graph import workflow
from agents.ops_agent import ops_agent
from agents.traveller_agent import traveler_agent

app = FastAPI(title="Airspace MCP & Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # development: allow all origins (React dev server, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the project root directory (parent of mcp/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SNAPSHOTS_DIR = os.path.join(PROJECT_ROOT, "snapshots")

# Mapping of region names to snapshot files produced by the n8n workflow.
# You can add more regions/files here as you extend the workflow.
REGION_FILES = {
    "region1": os.path.join(SNAPSHOTS_DIR, "Region1.json"),
    "region2": os.path.join(SNAPSHOTS_DIR, "Region2.json"),
    "region3": os.path.join(SNAPSHOTS_DIR, "Region3.json"),
    "region4": os.path.join(SNAPSHOTS_DIR, "Region4.json"),
    # region5 can be added later when its snapshot exists
}

# File storing currently active alerts
ALERTS_FILE = os.path.join(SNAPSHOTS_DIR, "alerts.json")


def load_snapshot(region: str) -> Dict[str, Any]:
    """
    Load the snapshot JSON for a given region.

    Returns an empty snapshot structure if the region/file does not exist.
    """
    path = REGION_FILES.get(region)
    if not path or not os.path.exists(path):
        # Return a consistent empty structure
        return {"time": None, "region": region, "states": []}

    with open(path, "r") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            # If the file is corrupted, surface an empty but valid structure
            return {"time": None, "region": region, "states": []}

    # Ensure required keys exist
    if "states" not in data:
        data["states"] = []
    if "region" not in data:
        data["region"] = region

    return data


@app.get("/")
def root():
    """
    Root endpoint - health check and API information.
    """
    return {
        "status": "ok",
        "message": "Airspace MCP & Agent API is running",
        "version": "2.0",
        "snapshots_directory": SNAPSHOTS_DIR,
        "available_regions": list(REGION_FILES.keys()),
        "endpoints": {
            "health": "/",
            "flights_by_region": "/flights/region/{region}",
            "flight_by_callsign": "/flights/{callsign}?region={region}",
            "alerts": "/alerts/active",
            "traveler_query": "POST /traveler/query",
            "ops_analyze": "POST /ops/analyze",
            "docs": "/docs",
        },
    }


@app.get("/health")
def health():
    """
    Simple health check endpoint.
    """
    return {"status": "healthy", "service": "mcp-server"}


@app.get("/flights/region/{region}")
def list_region(region: str):
    """
    Return the snapshot content for the given region.
    """
    return load_snapshot(region)


@app.get("/flights/{callsign}")
def get_by_callsign(
    callsign: str,
    region: str = Query("region1", description="Region to search for this callsign"),
):
    """
    Return a single flight record matching the given callsign within a region.
    """
    data = load_snapshot(region)
    flights = data.get("states", [])
    for f in flights:  # performs a linear search through all states
        cs = (f.get("callsign") or "").strip()
        if cs and cs == callsign.strip():
            return f

    # Not found in this region
    return {"error": "Not found"}


@app.get("/alerts/active")
def alerts():
    """
    Return the list of active alerts from alerts.json.
    """
    if not os.path.exists(ALERTS_FILE):
        return {"alerts": []}

    with open(ALERTS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {"alerts": []}


# ---------------------------------------------------------------------------
# Agent-facing endpoints for the React frontend
# ---------------------------------------------------------------------------


class TravelerQuery(BaseModel):
    callsign: str
    question: str
    region: str


@app.post("/traveler/query")
def traveler_query(payload: TravelerQuery):
    """
    Process a traveler query and optionally trigger ops analysis.

    For robustness with the React frontend, this endpoint calls the traveler
    agent directly and mirrors the LangGraph routing logic (need_ops flag).
    """
    # Call traveler agent directly
    traveler_response = traveler_agent(
        payload.callsign, payload.question, region=payload.region
    )

    # Mirror the graph's simple need_ops routing logic
    need_ops = "other flights" in payload.question.lower()
    ops_summary = ops_agent(payload.region) if need_ops else None

    return {
        "traveler_response": traveler_response,
        "need_ops": need_ops,
        "ops_summary": ops_summary,
    }


class OpsAnalyzeRequest(BaseModel):
    region: str


@app.post("/ops/analyze")
def ops_analyze(payload: OpsAnalyzeRequest):
    """
    Run an ops analysis for a region and return both summary and flights.
    """
    region = payload.region
    snapshot = load_snapshot(region)
    flights = snapshot.get("states", [])
    summary = ops_agent(region)
    return {
        "region": region,
        "summary": summary,
        "flights": flights,
    }
