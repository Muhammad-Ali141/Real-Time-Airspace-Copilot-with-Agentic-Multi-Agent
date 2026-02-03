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


def _build_system_prompt() -> str:
    """
    System prompt for the traveler agent with explicit grounding instructions.
    """
    return (
        "You are a flight assistant agent. Always answer based on the given flight data.\n"
        "- The flight object may contain keys such as: callsign, origin_country, baro_altitude (feet), "
        "velocity (knots), true_track (degrees), latitude, longitude, vertical_rate (feet per minute).\n"
        "- Describe altitude, speed, heading, and position in clear natural language using these fields.\n"
        "- If any field is null or missing, say 'data not available' for that specific detail.\n"
        "- Never invent or guess values that are not present in the flight data.\n"
        "- If no flight data is available, politely explain that you cannot answer based on live data."
    )


def traveler_agent(callsign: str, user_question: str, region: str = "region1"):
    """
    Traveler support agent.

    Looks up a flight by callsign (within the given region) via the MCP HTTP layer
    and answers the user's question grounded strictly in that data.
    """
    try:
        resp = requests.get(
            f"http://localhost:8000/flights/{callsign}",
            params={"region": region},
            timeout=5,
        )
        flight = resp.json()
    except Exception as e:
        # Surface a clear error back to the user
        return f"I could not retrieve live data due to a connection error: {e}"

    # If the backend could not find the flight, short-circuit with a friendly message.
    if isinstance(flight, dict) and flight.get("error") == "Not found":
        return (
            f"I could not find any live data for callsign '{callsign}' in the latest "
            f"snapshot for region '{region}'. Please double-check the callsign or region."
        )

    messages = [
        SystemMessage(content=_build_system_prompt()),
        HumanMessage(content=f"Flight data: {flight}\nUser question: {user_question}"),
    ]
    try:
        response = llm.invoke(messages)
        return response.content
    except Exception as e:
        # Catch Groq/model errors and surface them cleanly
        return f"I encountered an error while generating a response: {e}"
