from query_analyzer import analyze_query


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

    print("\nAs Dictionary:")
    print(analysis.model_dump())