from langgraph.graph import StateGraph, END
from agents.traveller_agent import traveler_agent
from agents.ops_agent import ops_agent

# represents the workflow state object as dict
class State(dict):
    pass


# traveller node
def traveler_node(state: State):
    """
    Node function representing the traveler interaction.
    1. Retrieves the flight callsign and user question.
    2. Calls the traveler_agent to get a response.
    3. Stores the response in state['traveler_response'].
    4. Determines if the operations agent needs to be called
       (e.g., if user asks about other flights).
    """
    callsign = state.get("callsign")
    question = state.get("question")
    region = state.get("region", "region1")

    # Basic validation to avoid crashes if state is malformed
    if not callsign or not question:
        state["traveler_response"] = (
            "I could not process your request because the callsign or question "
            "was missing. Please provide both and try again."
        )
        state["need_ops"] = False
        return state

    # calls llm from traveller_agent.py
    answer = traveler_agent(callsign, question, region=region)

    state["traveler_response"] = answer

    # If user asks about other flights → set flag to call ops node
    if "other flights" in question.lower():
        state["need_ops"] = True

    return state

# operational agent node
def ops_node(state: State):
    """
    Node function representing the operations analysis.
    1. Reads the region from state (default "region1").
    2. Calls the ops_agent to summarize flight data for the region.
    3. Stores the summary in state['ops_summary'].
    """
    region = state.get("region", "region1")
    summary = ops_agent(region)     # calls llm from ops_agent.py
    state["ops_summary"] = summary
    return state


# build the graph
graph = StateGraph(State)

# add nodes to the graph
graph.add_node("traveler", traveler_node)  # Traveler interaction node
graph.add_node("ops", ops_node)            # Operations analysis node

# Set entry point of the workflow
graph.set_entry_point("traveler")

# add conditional edges
graph.add_conditional_edges(
    "traveler",
    lambda state: "ops" if state.get("need_ops") else END,  # If ops needed, go to ops
    {
        "ops": "ops",
        END: END  # Otherwise end the workflow
    }
)

# direct edge from ops node to end
graph.add_edge("ops", END)

# compile the graph into an executable workflow
workflow = graph.compile()
