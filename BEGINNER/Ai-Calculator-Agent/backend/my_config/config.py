# Configuration for the gemini model

from agents import OpenAIChatCompletionsModel,set_tracing_disabled
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
set_tracing_disabled(True)

# Load environment variables
gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_base_url = os.getenv("GEMINI_BASE_PATH") or "https://generativelanguage.googleapis.com/v1beta/openai/"
gemini_model_name = os.getenv("GEMINI_MODEL_NAME") or "gemini-flash-latest"

if not gemini_api_key:
    print("[!] WARNING: GEMINI_API_KEY is not set.")

client = AsyncOpenAI(api_key = gemini_api_key, base_url = gemini_base_url)
model = OpenAIChatCompletionsModel(openai_client=client, model=str(gemini_model_name))