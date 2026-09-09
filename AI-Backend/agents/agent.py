from langchain.agents import create_agent
from tools.tool_registry import TOOLS
from model_routing.model_manager import get_model


def build_agent(model_name, tools=None):

    if tools is None:
        tools = TOOLS

    llm = get_model(model_name)

    system_prompt = """
    You are a local sovereign AI assistant.

    You operate entirely using locally available models and tools.
    Answer the user's request accurately and follow the user's instructions
    about format, length, and output.
    When tools are available, use them when necessary to complete the task.
    Do not claim to have performed an action that you did not perform.
    """

    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt
    )

    return agent