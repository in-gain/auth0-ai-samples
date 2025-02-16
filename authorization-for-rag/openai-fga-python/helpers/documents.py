
from pathlib import Path
from dataclasses import dataclass

from openai import OpenAI

from helpers.config import config


@dataclass
class Document:
    page_content: str
    id: str


@dataclass
class DocumentWithScore:
    document: Document
    score: float
    

def read_documents(docs_directory="docs"):
    """
    Read all documents from the specified directory
    
    Args:
        docs_directory (str): Path to the documents directory
    
    Returns:
        list: List of tuples containing (filename, content)
    """
    documents = []
    docs_path = Path(docs_directory)
    
    # Create docs directory if it doesn't exist
    if not docs_path.exists():
        docs_path.mkdir(parents=True)
        return documents

    # Read all files in the directory
    for file_path in docs_path.iterdir():
        if file_path.is_file():
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    documents.append({"id":file_path.stem, "page_content":content})
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
    
    return documents


async def generate(query: str, context: list[DocumentWithScore]) -> str:
    openai = OpenAI(api_key=config["OPENAI"]["OPENAI_API_KEY"])
    
    context_text = "\n\n".join([d.document["page_content"] for d in context])
    messages = [
        {
            "role": "system",
            "content": f"""
            Context: {context_text}.
            Use only the context provided to answer the question.
            If you don't know, do not make up an answer.
            """
        },
        { "role": "user", "content": query }
    ]
    
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )
    
    return response.choices[0].message.content