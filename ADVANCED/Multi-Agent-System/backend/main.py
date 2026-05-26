import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from my_agents.agent import main_agent
from tools.db_tool import init_db, get_connection
from agents import Runner
import traceback
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Advanced Multi-Agent System Backend is starting up...")
    try:
        init_db()
        print("✅ Database initialized.")
    except Exception as e:
        print(f"⚠️ Startup warning: {e}")
    yield
    print("👋 Backend shutting down...")

app = FastAPI(title="Advanced Multi-Agent System API", lifespan=lifespan)

# Add GZip compression for faster responses
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        print(f"DEBUG: Processing request: {request.message}")
        # Run the main supervisor agent which handles delegation and filtering
        result = await Runner.run(main_agent, request.message)
        final_output = str(result.final_output)

        return ChatResponse(response=final_output)
    except Exception as e:
        print(f"❌ CHAT ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    try:
        # Add basic caching for history
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, user_query, agent_response, execution_logs, timestamp FROM interactions ORDER BY timestamp DESC LIMIT 20")
        rows = cur.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "id": row[0],
                "user_query": row[1],
                "agent_response": row[2],
                "execution_logs": row[3],
                "timestamp": row[4].isoformat() if row[4] else None
            })
            
        cur.close()
        conn.close()
        return history
    except Exception as e:
        print(f"❌ HISTORY ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "online"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
