import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from my_agents.agent import agent
from my_tools.rag_tools import process_file, init_collection
from my_tools.db_tool import init_db, save_interaction
from agents import Runner
import traceback
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 RAG Assistant Backend is starting up...")
    try:
        init_collection()
        init_db()
        print("✅ Startup initialization complete.")
    except Exception as e:
        print(f"⚠️ Startup warning during initialization: {e}")
    yield
    print("👋 Backend is shutting down...")

app = FastAPI(title="RAG Assistant API", lifespan=lifespan)

# Add CORS middleware - Configured for localhost with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Incoming {request.method} request to {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"📥 Received upload request: {file.filename}")
    try:
        content = await file.read()
        print(f"📄 Read {len(content)} bytes from {file.filename}")
        num_chunks = process_file(content, file.filename)
        print(f"✅ Successfully processed {file.filename} into {num_chunks} chunks")
        return {"message": f"Successfully processed {file.filename}", "chunks": num_chunks}
    except Exception as e:
        print(f"❌ UPLOAD ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print(f"💬 Chat message received: {request.message}")
    try:
        result = await Runner.run(agent, request.message)
        print(f"🤖 Agent response generated")
        if hasattr(result, 'final_output') and result.final_output:
            # Save to SQL Database memory - wrapped in try/except so chat doesn't fail if DB is slow
            try:
                save_interaction(request.message, str(result.final_output))
            except Exception as db_e:
                print(f"⚠️ SQL Memory Save Warning: {db_e}")
            
            return ChatResponse(response=str(result.final_output))
        else:
            return ChatResponse(response="Agent did not provide a clear answer. Please check your API keys.")
    except Exception as e:
        print(f"❌ CHAT ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"status": "online", "message": "RAG Assistant API is running"}

if __name__ == "__main__":
    # Keeping it on port 8000 as requested. 
    # Disabled reload for maximum stability.
    print("📢 Starting server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)

