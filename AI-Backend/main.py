from orchestration.orchestrator import build_graph


def get_user_query():

    query = input("Enter your task: ")

    return {
        "query": query.strip()
    }


if __name__ == "__main__":

    task = get_user_query()

    print("\nReceived Task:")
    print(task["query"])

    graph = build_graph()

    result = graph.invoke({
        "query": task["query"]
    })

    print("\nModel Role:")
    print(result["model_role"])

    print("\nSelected Model:")
    print(result["model_name"])

    print("\nModel Response:")
    print(result["response"])