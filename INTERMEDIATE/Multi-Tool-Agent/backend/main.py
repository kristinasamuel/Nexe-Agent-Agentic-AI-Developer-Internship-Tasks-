import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from my_agents.agent import agent
from agents import Runner
import asyncio
import traceback

app = FastAPI(title="Multi-Tool Agent API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

class SaveRequest(BaseModel):
    user_query: str
    agent_response: str

@app.post("/save")
async def save_interaction(request: SaveRequest):
    from tools.db_tool import save_to_db
    try:
        result = save_to_db(request.user_query, request.agent_response)
        if result["status"] == "success":
            return {"message": "Saved successfully"}
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print(f"Received message: {request.message}")
    try:
        # Use Runner.run to execute the agent
        result = await Runner.run(agent, request.message)
        
        print(f"Agent Final Output: {result.final_output}")
        
        # Check if we got a valid result
        if hasattr(result, 'final_output') and result.final_output:
            # Automatically save the interaction to the database
            from tools.db_tool import save_to_db
            try:
                save_to_db(request.message, str(result.final_output))
                print(f"✅ Auto-saved interaction to database.")
            except Exception as db_e:
                print(f"⚠️ Failed to auto-save to database: {db_e}")
                
            return ChatResponse(response=str(result.final_output))
        else:
            return ChatResponse(response="Agent did not provide a clear answer. Please check your API keys.")
            
    except Exception as e:
        print("--- BACKEND ERROR ---")
        traceback.print_exc()
        # Return a more descriptive error message to the frontend
        error_detail = f"Agent Error: {str(e)}"
        raise HTTPException(status_code=500, detail=error_detail)

@app.get("/")
async def root():
    return {"message": "Multi-Tool Agent API is running"}

if __name__ == "__main__":
    # Ensure we run on 127.0.0.1 as requested
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
