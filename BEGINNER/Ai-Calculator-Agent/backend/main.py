import re
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from agents import Runner
from agents.memory import SQLiteSession

from my_agents.agents import Math_Agent

app = FastAPI()

def clean_output_text(text: str) -> str:
    # 1. Remove all literal dollar signs
    text = text.replace("$", "")
    # 2. Remove LaTeX delimiters: \(, \), \[, \], \$, \\$, etc.
    text = re.sub(r'\\\(|\\\)|\\\[|\\\]|\\\$', '', text)
    # 3. Final safety sweep for any remaining single backslashes that look like math starts
    text = re.sub(r'\\[a-zA-Z]+', '', text) 
    return text

# Explicit CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001","https://nexe-agent-agentic-ai-developer-int.vercel.app"],
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
        
        # Fail-safe: Clean up any dollar signs or LaTeX-style delimiters that might slip through
        clean_output = clean_output_text(response.final_output)
        
        return {
            "response": clean_output,
            "technical_logic": {
                "ai_response": {
                    "content": clean_output,
                    "format": "text",
                    "status": "completed"
                }
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
