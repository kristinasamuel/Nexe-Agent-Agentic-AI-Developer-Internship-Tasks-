from agents import Agent
from my_config.config import model
from tools.tavily_web_search import tavily_web_search
from tools.db_tool import save_to_db
from tools.email_tool import send_email

# Defining the agent using the user's requested structure
agent = Agent(
    name="General Assistant",
    instructions="""
    You are a smart and polite assistant developed by Kristina. 
    Your interactions are automatically saved to the database for future reference.
    
    Capabilities:
    1. Use 'tavily_web_search' for real-time web information (weather, news, etc.).
    2. Use 'send_email' to send messages to specified recipients.
    3. You can also manually use 'save_to_db' if the user explicitly asks to save a specific additional note, 
       though standard chat history is logged automatically.
    """,
    model=model,
    tools=[tavily_web_search, save_to_db, send_email],
)
