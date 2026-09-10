from orchestration.orchestrator import build_graph


def get_user_query():

    query = input("Enter your task: ")

    file_path = input(
        "Enter file path (press Enter if no file): "
    )

    return {
        "query": query.strip(),
        "file_path": file_path.strip()
    }


if __name__ == "__main__":
    graph = build_graph()
    config = {"configurable": {"thread_id": "demo-user-1"}}
    while True:
        task = get_user_query()
        if not task["query"] or task["query"].lower() in ("exit", "quit"):
            break
        result = graph.invoke({
            "query": task["query"],
            "file_path": task["file_path"],
            "verification_attempts": 0,
            "messages": [{"role": "user", "content": task["query"]}]
        }, config=config)
        print("\nModel Response:\n", result["response"])