import os
from google import genai
from dotenv import load_dotenv

# Forcefully clear any existing keys from environment
if "GOOGLE_API_KEY" in os.environ: del os.environ["GOOGLE_API_KEY"]
if "GEMINI_API_KEY" in os.environ: del os.environ["GEMINI_API_KEY"]

# Load environment variables from .env
load_dotenv(override=True)

# Get API Key
raw_key = os.getenv("GEMINI_API_KEY")
API_KEY = raw_key.strip().replace('"', '').replace("'", "") if raw_key else None

if not API_KEY:
    print("[!] Error: GEMINI_API_KEY not found in .env file.")
    exit()

try:
    print(f"[*] Testing with key: {API_KEY[:4]}...{API_KEY[-4:]}")
    # Initialize client with explicit key
    client = genai.Client(api_key=API_KEY)

    # Use a specific version string that is highly likely to work
    model_to_test = "gemini-flash-latest"
    
    print(f"[*] Testing model: {model_to_test}")
    response = client.models.generate_content(
        model=model_to_test,
        contents="Hello, are you active?"
    )

    print("\n[+] Success! Response from Gemini:")
    print("-" * 30)
    print(response.text)
    print("-" * 30)

except Exception as e:
    print("\n[!] Failed to get response:")
    print(str(e))

