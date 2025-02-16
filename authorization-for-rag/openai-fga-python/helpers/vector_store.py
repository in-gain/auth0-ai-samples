import os
import faiss
import numpy as np

from helpers.config import config
from openai import OpenAI


class LocalVectorStore:
    @staticmethod
    async def from_documents(documents):
        openai = OpenAI(api_key=config["OPENAI"]["OPENAI_API_KEY"])
        index_filename = "faiss_index.index"
        
        if os.path.exists(index_filename):
            index = faiss.read_index(index_filename)
        else:
            # Get embeddings from OpenAI
            embeddings = []
            for document in documents:
                response = openai.embeddings.create(
                    model="text-embedding-3-small",
                    input=document["page_content"],
                    encoding_format="float"
                )
                # Convert response to numpy array directly
                embedding = np.array(response.data[0].embedding, dtype=np.float32).reshape(1, -1)
                embeddings.append(embedding)

            # Initialize FAISS index
            dimension = embeddings[0].shape[1]
            index = faiss.IndexFlatIP(dimension)

            # Combine all embeddings and add to index
            embeddings_matrix = np.vstack(embeddings)
            index.add(embeddings_matrix)
            faiss.write_index(index, index_filename)

        async def search(query, k=2):
            response = openai.embeddings.create(
                model="text-embedding-3-small",
                input=query,
                encoding_format="float"
            )
            query_embedding = np.array([response.data[0].embedding], dtype=np.float32)
            distances, labels = index.search(query_embedding, k)

            threshold = 0.2
            retrieved_documents = [
                {
                    'document': documents[int(label)],
                    'score': float(distance)
                }
                for label, distance in zip(labels[0], distances[0])
                if distance >= threshold
            ]

            return retrieved_documents

        return {'search': search}