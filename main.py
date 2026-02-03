from agents.graph import workflow

state = {
    "callsign": "THY4KZ",
    "question": "Are other flights near mine also having problems?",
    "region": "region1"
}

result = workflow.invoke(state)
print(result)
