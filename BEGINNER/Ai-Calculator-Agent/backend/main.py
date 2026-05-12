from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from agents import Runner
from agents.memory import SQLiteSession

from my_agents.agents import Math_Agent

app = FastAPI()

# Explicit CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SESSION MEMORY
session = SQLiteSession("calculator_session")

class UserPrompt(BaseModel):
    message: str

@app.post("/chat")
async def chat(user_prompt: UserPrompt):
    try:
        response = await Runner.run(
            Math_Agent,
            user_prompt.message,
            session=session
        )
        
        return {
            "response": response.final_output,
            "technical_logic": {
                "agent_name": Math_Agent.name,
                "steps": [turn.model_dump() for turn in response.turns] if hasattr(response, 'turns') else "Standard logic execution",
                "model": "gemini-flash-latest"
            }
        }
    except Exception as e:
        print(f"[!] Calculator Error: {str(e)}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Use 127.0.0.1 explicitly to match frontend fetch
    print("[+] AI Calculator Backend starting on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
