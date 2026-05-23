import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from google import genai
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()

QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# Configure Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    timeout=60,
)

COLLECTION_NAME = "rag_documents"

def init_collection():
    print(f"🚀 Initializing Qdrant collection: {COLLECTION_NAME}")
    try:
        # Using newer collection_exists check if available, else fallback
        try:
            exists = qdrant_client.collection_exists(collection_name=COLLECTION_NAME)
        except:
            collections = qdrant_client.get_collections().collections
            exists = any(c.name == COLLECTION_NAME for c in collections)
        
        TARGET_DIM = 3072
        
        if exists:
            collection_info = qdrant_client.get_collection(collection_name=COLLECTION_NAME)
            current_size = collection_info.config.params.vectors.size
            if current_size != TARGET_DIM:
                print(f"⚠️ Vector size mismatch. Recreating...")
                qdrant_client.delete_collection(collection_name=COLLECTION_NAME)
            else:
                print(f"✅ Collection ready.")
                return

        qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=TARGET_DIM, distance=models.Distance.COSINE),
        )
        print("✅ Collection created.")
    except Exception as e:
        print(f"❌ DB Init Error: {e}")

def get_embedding(text, task_type="RETRIEVAL_DOCUMENT"):
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config={"task_type": task_type}
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"❌ EMBEDDING ERROR: {e}")
        raise e

def process_file(file_content, filename):
    print(f"📄 Processing: {filename}")
    if filename.endswith(".pdf"):
        reader = PdfReader(BytesIO(file_content))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    else:
        text = file_content.decode("utf-8")
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = text_splitter.split_text(text)
    
    points = []
    for chunk in chunks:
        vector = get_embedding(chunk, task_type="RETRIEVAL_DOCUMENT")
        points.append(models.PointStruct(
            id=str(uuid.uuid4()),
            vector=vector,
            payload={"text": chunk, "filename": filename}
        ))
    
    qdrant_client.upsert(collection_name=COLLECTION_NAME, points=points)
    print(f"✅ Stored {len(chunks)} chunks.")
    return len(chunks)

from agents import function_tool

@function_tool
def query_rag(query: str) -> str:
    """
    Searches the uploaded documents for information related to the user's query.
    Always use this tool when the user asks about their projects or uploaded files.
    """
    print(f"🔍 Searching documents for: {query}")
    try:
        vector = get_embedding(query, task_type="RETRIEVAL_QUERY")
        
        # Using query_points which is verified to exist in your environment
        response = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=vector,
            limit=5
        )
        
        search_result = response.points
        
        if not search_result:
            return "No relevant information found in the documents."
            
        context = "Relevant information from uploaded documents:\n\n"
        for result in search_result:
            # Use metadata or payload based on what's available
            payload = result.payload if hasattr(result, 'payload') else {}
            text = payload.get('text', 'No text found')
            filename = payload.get('filename', 'Unknown')
            context += f"[From {filename}]:\n{text}\n\n---\n\n"
        
        return context
    except Exception as e:
        print(f"❌ SEARCH ERROR: {e}")
        # Try a desperate fallback to 'query' if query_points fails
        try:
            print("🔄 Attempting fallback to 'query' method...")
            vector = get_embedding(query, task_type="RETRIEVAL_QUERY")
            search_result = qdrant_client.query(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                limit=5
            )
            # Process 'query' results if successful
            context = "Relevant information (fallback search):\n\n"
            for res in search_result:
                context += f"{res.payload['text']}\n\n---\n\n"
            return context
        except Exception as e2:
            return f"TECHNICAL ERROR: Document search failed: {str(e)}"
