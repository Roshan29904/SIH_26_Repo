from typing import TypedDict

from query_analysis.query_analyzer import QueryAnalysis, analyze_query
from model_routing.model_router import route_model
from model_routing.model_config import MODEL_CONFIG
from agents.agent import build_agent

from langgraph.graph import StateGraph


class AgentState(TypedDict):

    query: str
    analysis: QueryAnalysis
    model_role: str
    model_name: str
    response: str


def analysis_node(state: AgentState):

    analysis = analyze_query(state["query"])

    return {
        "analysis": analysis
    }


def routing_node(state: AgentState):

    model_role = route_model(state["analysis"])
    model_name = MODEL_CONFIG[model_role]

    return {
        "model_role": model_role,
        "model_name": model_name
    }


def model_node(state: AgentState):

    agent = build_agent(state["model_name"])

    result = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": state["query"]
            }
        ]
    })

    response = result["messages"][-1].content

    return {
        "response": response
    }


def build_graph():

    graph = StateGraph(AgentState)

    graph.add_node("analyze", analysis_node)
    graph.add_node("route", routing_node)
    graph.add_node("generate", model_node)

    graph.set_entry_point("analyze")

    graph.add_edge("analyze", "route")
    graph.add_edge("route", "generate")

    graph.set_finish_point("generate")

    return graph.compile()