from langchain_ollama import OllamaEmbeddings


def get_embedding_model():
    """
    Return the local embedding model used for RAG.
    """

    return OllamaEmbeddings(
       model="nomic-embed-text"
    )


