from query_analysis.query_analyzer import analyze_query
from model_routing.model_router import route_model
from model_routing.model_config import MODEL_CONFIG
from model_routing.model_manager import get_model

def get_user_query():
    query = input("Enter your task: ")

    return {
        "query": query.strip()
    }


if __name__ == "__main__":

    task = get_user_query()

    print("\nReceived Task:")
    print(task["query"])

    print("\nAnalyzing task...")

    analysis = analyze_query(task["query"])

    print("\nQuery Analysis:")
    print(analysis)

    # print("\nAs Dictionary:")
    # print(analysis.model_dump())

    selected_role = route_model(analysis)

    selected_model = MODEL_CONFIG[selected_role]

    print("\nModel Routing:")
    print("Model Role:", selected_role)
    print("Selected Model:", selected_model)

    llm = get_model(selected_model)
    print("\nSelected model loaded successfully.")

    response = llm.invoke(
    task["query"]
    )

    print("\nModel Response:")
    print(response.content)