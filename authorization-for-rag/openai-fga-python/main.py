import asyncio
from helpers.documents import read_documents
from helpers.vector_store import LocalVectorStore
from helpers.retriever import FGARetriever
from helpers.documents import DocumentWithScore, generate


async def main(user: str = "notadmin", query: str = "Show me the forecast for ZEKO?"):
    # 1. RAG pipeline
    documents = read_documents()

    # `LocalVectorStore` is a helper class that creates a FAISS index
    # and uses OpenAI embeddings API to encode the documents.
    vector_store = await LocalVectorStore.from_documents(documents)
    
    # Perform a query
    search_results = await vector_store['search'](query, k=2)

    # Convert search results to DocumentWithScore
    documents_with_scores = [
        DocumentWithScore(document=result['document'], score=result['score'])
        for result in search_results
    ]

    # 2. Create an instance of the FGARetriever
    retriever = FGARetriever.create({
        "documents": documents_with_scores,
        "build_query": lambda doc: {
            "user": f"user:{user}",
            "object": f"doc:{doc['id']}",
            "relation": "viewer",
        }
    })

    # 3. Filter documents based on user permissions
    context = await retriever.retrieve()

    # 4. Generate a response based on the context
    # `generate` is a helper function that takes a query and a context and returns
    # a response using OpenAI chat completion API.
    answer = await generate(query, context)

    # 5. Print the answer
    print(f"Response to {user}:\n\n{answer}\n\n")
    

if __name__ == "__main__":
    # Jess only has access to public docs
    asyncio.run(main("jess"))

    # User1 is part of the financial team and has access to financial reports 
    asyncio.run(main("user1"))