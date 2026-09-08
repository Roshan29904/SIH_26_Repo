from pathlib import Path

from pydantic import BaseModel, Field
from langchain_ollama import ChatOllama


BASE_DIR = Path(__file__).resolve().parent
PROMPT_PATH = BASE_DIR / "prompts" / "query_analyzer.txt"


class QueryAnalysis(BaseModel):
    task_type: str = Field(description="Type of task the user wants to perform")
    needs_rag: bool = Field(description="Whether organizational documents or knowledge base are needed")
    needs_vision: bool = Field(description="Whether images or scanned documents need to be understood")
    needs_tools: bool = Field(description="Whether external/local tools are needed")
    output_format: str = Field(description="Expected output format")
    complexity: str = Field(description="Task complexity: low, medium, or high")


llm = ChatOllama(
    model="qwen2.5:3b",
    temperature=0
)


structured_llm = llm.with_structured_output(QueryAnalysis)


def load_prompt():

    with open(PROMPT_PATH, "r", encoding="utf-8") as file:
        return file.read()


def analyze_query(query):

    prompt = load_prompt()

    response = structured_llm.invoke(
        prompt.format(query=query)
    )

    return response