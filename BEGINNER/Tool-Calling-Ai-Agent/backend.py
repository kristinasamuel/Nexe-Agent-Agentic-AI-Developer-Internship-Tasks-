import os
import json
import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Initialize environment
load_dotenv(override=True)

app = FastAPI()

# Professional CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GEMINI CORE CONFIG ---
raw_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
API_KEY = raw_key.strip().replace('"', '').replace("'", "") if raw_key else None

if not API_KEY:
    print("[!] ERROR: No API Key detected. Please set GEMINI_API_KEY in .env.")
else:
    print(f"[*] Tool-Calling AI Agent Backend: Neural Link Established ({API_KEY[:4]}...{API_KEY[-4:]})")

# Initialize the NEW GenAI Client
client = genai.Client(api_key=API_KEY)

# Hardcode to gemini-flash-latest for stability and compatibility
MODEL_ID = "gemini-flash-latest"

# --- TOOL DEFINITIONS ---
def calculator(expression: str):
    """
    Evaluates a mathematical expression string. 
    Supports: addition (+), subtraction (-), multiplication (*), division (/), and powers (**).
    """
    try:
        # Strict filter for safety - allow numbers and math operators
        if not all(c in "0123456789+-*/().** " for c in expression):
            return "Security violation: Invalid characters in expression."
        
        # Safe evaluation
        result = eval(expression, {"__builtins__": None}, {})
        return str(result)
    except Exception as e:
        return f"Calculation Error: {str(e)}"

def get_time():
    """Returns the current system time."""
    return datetime.datetime.now().strftime("%I:%M %p")

def get_date():
    """Returns the current system date."""
    return datetime.datetime.now().strftime("%B %d, %Y")

def get_weather(city: str):
    """Returns the current weather for a given city."""
    # Dummy weather data for demonstration
    return f"The weather in {city} is currently 25°C and sunny."

# Include all tools
tools = [calculator, get_time, get_date, get_weather]

# --- API ENDPOINTS ---
@app.post("/api/chat")
async def chat(request: Request):
    try:
        payload = await request.json()
        user_input = payload.get("message")
        
        if not user_input:
            return {"error": "Null input received."}

        # Refined Tool-Calling Logic
        system_instruction = (
            "You are a helpful Tool-Calling AI Agent. You have access to tools for math, "
            "weather, time, and date. Use them when needed to answer user questions accurately. "
            "If a tool is not required, respond naturally. "
            "Provide concise and clear responses."
        )

        # Generate content with automatic function calling enabled
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=user_input,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False
                )
            )
        )

        final_text = response.text

        # Check if a tool was executed
        executed_tool = None
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    executed_tool = part.function_call.name

        if executed_tool:
            return {
                "tool": executed_tool,
                "result": final_text,
                "status": "success"
            }

        return {"result": final_text, "status": "success"}

    except Exception as e:
        error_msg = str(e)
        print(f"[!] System Error: {error_msg}")
        
        if "429" in error_msg:
            return {"error": "Quota Exceeded. Please wait a moment and retry."}
        elif "500" in error_msg:
            return {"error": "Gemini API is currently experiencing internal issues. Please try again in a few seconds."}
            
        return {"error": "An unexpected error occurred. Please try again."}

if __name__ == "__main__":
    import uvicorn
    # Clear terminal for clean start
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"[*] Operating with STABLE model: {MODEL_ID}")
    uvicorn.run(app, host="127.0.0.1", port=8000)
