from typing import TypedDict

from langchain_core.tools import tool
from query_analysis.query_analyzer import QueryAnalysis, analyze_query
from model_routing.model_router import route_model
from model_routing.model_config import MODEL_CONFIG
from model_routing.model_manager import get_model
from agents.agent import build_agent
from tools.image_tool import analyze_image
from verification.verifier import verify_response

from pathlib import Path
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

from typing import Annotated
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, ToolMessage

from langgraph.graph import StateGraph


class AgentState(TypedDict):

    query: str
    file_path: str
    analysis: QueryAnalysis
    model_role: str
    model_name: str
    response: str
    verified: bool
    verification_reason: str
    verification_attempts: int
    messages: Annotated[list[BaseMessage], add_messages]
    created_files: list[str]


def analysis_node(state: AgentState):

    analysis = analyze_query(state["query"])

    return {
        "analysis": analysis.model_dump()
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

    query = state["query"]

    if state["file_path"]:
            query = f"""
            User task:
            {state["query"]}
    
            Attached local file_path:
            {state["file_path"]}
            The file path is provided use this to work with the file.
            Use the appropriate available tool to work with this file.
            """

    result = agent.invoke({
        "messages": state["messages"] + [{"role": "user", "content": query}]
    })

    created_files = []
    for msg in result["messages"]:
        if isinstance(msg, ToolMessage) and isinstance(msg.content, str):
            if msg.content.startswith("DOCUMENT_CREATED:"):
                created_files.append(msg.content.split(":", 1)[1])

    response = result["messages"][-1].content

    return {
        "messages": [result["messages"][-1]],
        "response": response,
        "created_files": created_files
    }

def vision_node(state: AgentState):

    file_path = state["file_path"]

    if not file_path:
        return {
            "response": "No image file was provided."
        }

    result = analyze_image.invoke({
        "image_path": file_path,
        "question": state["query"]
    })

    return {
        "response": result
    }

def verification_node(state: AgentState):

    llm = get_model("qwen2.5:3b")

    result = verify_response(
        llm,
        state["query"],
        state["response"]
    )

    attempts = state.get("verification_attempts", 0) + 1

    return {
        "verified": result["verified"],
        "verification_reason": result["reason"],
        "verification_attempts": attempts
    }


def regeneration_node(state: AgentState):

    agent = build_agent(state["model_name"])

    prompt = f"""
The previous response did not pass verification.

User request:
{state["query"]}

Previous response:
{state["response"]}

Verifier feedback:
{state["verification_reason"]}

Generate a corrected response that properly satisfies the user's request.
Do not mention the verification process in your answer.
"""

    result = agent.invoke({
        "messages": [
            {
                "role": "user",
                "content": prompt
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
    graph.add_node("vision", vision_node)
    graph.add_node("verify", verification_node)
    graph.add_node("regenerate", regeneration_node)

    graph.set_entry_point("analyze")

    graph.add_edge("analyze", "route")

    def choose_model(state: AgentState):

        if state["model_role"] == "vision_model":
            return "vision"

        return "generate"

    graph.add_conditional_edges(
        "route",
        choose_model,
        {
            "vision": "vision",
            "generate": "generate"
        }
    )

    graph.add_edge("generate", "verify")
    graph.add_edge("vision", "verify")
    graph.add_edge("regenerate", "verify")

    def verification_router(state: AgentState):

        if state["verified"]:
            return "finish"

        if state["verification_attempts"] >= 2:
            return "finish"

        if state["model_role"] == "vision_model":   # vision responses aren't regenerated
            return "finish"

        return "regenerate"

    graph.add_conditional_edges(
        "verify",
        verification_router,
        {
            "finish": "__end__",
            "regenerate": "regenerate"
        }
    )

    db_path = Path(__file__).resolve().parent.parent / "data" / "checkpoints.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(
        str(db_path),
        check_same_thread=False
    )

    checkpointer = SqliteSaver(connection)

    return graph.compile(
        checkpointer=checkpointer
    )