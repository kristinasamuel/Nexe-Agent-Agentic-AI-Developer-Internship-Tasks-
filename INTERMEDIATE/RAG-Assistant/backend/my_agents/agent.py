from agents import Agent
from my_config.config import model
from my_tools.rag_tools import query_rag
from my_tools.db_tool import get_recent_memory
from agents import function_tool

@function_tool
def get_chat_memory() -> str:
    """Retrieve the most recent chat interactions from the database to maintain conversation context."""
    return get_recent_memory(limit=5)

# Defining the agent for RAG Assistant
agent = Agent(
    name="RAG Assistant",
    instructions="""
    You are a smart and polite RAG (Retrieval-Augmented Generation) assistant developed by Kristina. 
    Your ABSOLUTE TOP PRIORITY is to answer user questions using the 'query_rag' tool.
    
    CRITICAL WORKFLOW:
    1. If the user asks ANY question about a project, a file, or any topic (e.g., "Robo Alert"), you MUST call 'query_rag' FIRST.
    2. Read the results from 'query_rag' carefully. 
    3. Use that information to provide a detailed and perfect answer.
    4. If 'query_rag' doesn't return enough info, try a different search term.
    5. Always maintain a professional and helpful tone.
    """,
    model=model,
    tools=[query_rag, get_chat_memory],
)
