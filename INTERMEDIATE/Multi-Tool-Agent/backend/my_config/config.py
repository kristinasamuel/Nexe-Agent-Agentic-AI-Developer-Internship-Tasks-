import os
from tavily import TavilyClient
from agents import OpenAIChatCompletionsModel, RunConfig, set_tracing_disabled
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load .env
load_dotenv()
set_tracing_disabled(True)

gemini_api_key = os.getenv("GEMINI_API_KEY")
gemini_base_url = os.getenv("GEMINI_BASE_PATH") or "https://generativelanguage.googleapis.com/v1beta/openai/"
gemini_model_name = os.getenv("GEMINI_MODEL_NAME") or "gemini-flash-latest"
tavily_api_key = os.getenv("TAVILY_API_KEY")

# Create Gemini client
client = AsyncOpenAI(api_key=gemini_api_key, base_url=gemini_base_url)

# Use OpenAIChatCompletionsModel to create a model
model = OpenAIChatCompletionsModel(openai_client=client, model=str(gemini_model_name))

config = RunConfig(model=model)

# Initialize Tavily client
tavily_client = TavilyClient(api_key=tavily_api_key) # we use tavily api to fetch the web information
