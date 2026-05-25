import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from my_agents.agent import agent, filter_agent
from tools.db_tool import init_db, get_connection
from agents import Runner
import traceback
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Autonomous Business Agent Backend is starting up...")
    try:
        init_db()
        print("✅ Database initialized.")
    except Exception as e:
        print(f"⚠️ Startup warning: {e}")
    yield
    print("👋 Backend shutting down...")

app = FastAPI(title="Autonomous Business Agent API", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
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
        # 1. Run the main autonomous agent
        main_result = await Runner.run(agent, request.message)
        raw_response = str(main_result.final_output)

        # 2. Run the filter agent to condense the response
        # This ensures the output is short, professional, and token-efficient
        filtered_result = await Runner.run(filter_agent, f"Condense this response while keeping all key business facts: {raw_response}")
        final_output = str(filtered_result.final_output)

        return ChatResponse(response=final_output)
    except Exception as e:
        print(f"❌ CHAT ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    try:
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
    uvicorn.run(app, host="127.0.0.1", port=8000)
