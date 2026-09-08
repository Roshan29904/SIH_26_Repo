from langchain_ollama import ChatOllama

def get_model(model_name):
    model = ChatOllama(
        model = model_name,
        temperature=0
    )

    return model