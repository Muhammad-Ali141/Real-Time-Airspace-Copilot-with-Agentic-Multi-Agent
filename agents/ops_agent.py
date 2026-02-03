import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from langchain_groq import ChatGroq
try:
    from langchain_core.messages import SystemMessage, HumanMessage
except ImportError:
    from langchain.schema import SystemMessage, HumanMessage
import requests


llm = ChatGroq(model="llama-3.1-8b-instant", api_key=os.environ.get("GROQ_API_KEY", ""))


def _ops_system_prompt() -> str:
    """
    System prompt for the ops agent, aligned with UI / alerts anomaly rules.
    """
    return (
        "You are an airspace operations analyst. Analyse anomalies in regional air traffic.\n"
        "- Consider a flight anomalous if ANY of the following is true:\n"
        "  * baro_altitude < 10,000 ft or > 40,000 ft\n"
        "  * velocity < 200 kts or > 500 kts\n"
        "  * absolute value of vertical_rate > 2,000 ft/min\n"
        "- First, summarise overall traffic: total number of flights and general patterns.\n"
        "- Then, report how many flights are anomalous and briefly describe key examples.\n"
        "- Base all reasoning only on the provided JSON snapshot; do not hallucinate flights or values."
    )


def ops_agent(region_name: str):
    """
    Ops analyst agent.

    Fetches the regional snapshot via the MCP HTTP layer and asks the LLM
    for a natural-language summary with anomaly highlights.
    """
    try:
        data = requests.get(
            f"http://localhost:8000/flights/region/{region_name}",
            timeout=5,
        ).json()
    except Exception as e:
        return f"I could not retrieve the regional snapshot for '{region_name}' due to a connection error: {e}"

    # To stay within Groq model token limits, avoid sending extremely large snapshots.
    # We keep at most a small number of flights, and only a minimal subset of fields, plus metadata.
    states = data.get("states", [])
    MAX_FLIGHTS = 40
    sampled_states = []
    for f in states[:MAX_FLIGHTS]:
        sampled_states.append(
            {
                "callsign": f.get("callsign"),
                "baro_altitude": f.get("baro_altitude"),
                "velocity": f.get("velocity"),
                "vertical_rate": f.get("vertical_rate"),
            }
        )

    compact_snapshot = {
        "time": data.get("time"),
        "region": region_name,
        "total_flights": len(states),
        "sampled_flights": len(sampled_states),
        "states": sampled_states,
    }

    messages = [
        SystemMessage(content=_ops_system_prompt()),
        HumanMessage(
            content=(
                "Here is a compact snapshot for the region. "
                "Use the total_flights field for overall counts, and states for detail:\n"
                f"{compact_snapshot}\n\nSummarise the region."
            )
        ),
    ]
    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        return (
            f"I encountered an error while generating the ops summary for '{region_name}': {e}"
        )
