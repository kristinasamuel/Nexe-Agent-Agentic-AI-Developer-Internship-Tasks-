import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
raw_key = os.getenv("GEMINI_API_KEY")
API_KEY = raw_key.strip().replace('"', '').replace("'", "") if raw_key else None

client = genai.Client(api_key=API_KEY)

print("[*] Listing available models...")
for model in client.models.list():
    print(f"- {model.name} (Supported actions: {model.supported_actions})")
