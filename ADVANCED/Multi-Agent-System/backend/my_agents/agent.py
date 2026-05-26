from agents import Agent
from my_config.config import model
from tools.db_tool import save_to_db

# 1. Research Agent
research_agent = Agent(
    name="Research Agent",
    instructions="""
    You are a Research Agent. Your job is to gather detailed information, facts, and data related to the user's query.
    Provide comprehensive findings that the Planning or Coding agents can use.
    """,
    model=model,
)

# 2. Coding Agent
coding_agent = Agent(
    name="Coding Agent",
    instructions="""
    You are a Coding Agent. Your job is to write, debug, and explain code.
    Ensure your code is efficient, well-documented, and follows best practices.
    """,
    model=model,
)

# 3. Planning Agent
planning_agent = Agent(
    name="Planning Agent",
    instructions="""
    You are a Planning Agent. Your job is to create structured plans, timelines, and strategies based on research data or user requirements.
    """,
    model=model,
)

# 4. Response Generation Agent
response_gen_agent = Agent(
    name="Response Generation Agent",
    instructions="""
    You are a Response Generation Agent. Your job is to compile information from other agents and craft a professional final response.
    
    Contact Information to include if relevant:
    - Email: nexeagent@gmail.com
    - Phone: 03222100121
    - LinkedIn: Nexe-Agent
    """,
    model=model,
)

# 5. Filtering Agent (The "Refiner")
filtering_agent = Agent(
    name="Filtering Agent",
    instructions="""
    You are a Filtering Agent. Your job is to collect responses from all involved agents, extract ONLY the most important information, and generate a short, clear, and exact response according to the user query instead of long unnecessary outputs.
    Eliminate all filler words and conversational fluff.
    """,
    model=model,
)

# 6. Main Supervisor Agent
main_agent = Agent(
    name="Main Supervisor Agent",
    instructions="""
    You are the Main Supervisor Agent of the Advanced Multi-Agent System.
    Your role is to:
    1. Understand the user's query.
    2. Delegate tasks to specialized agents (Research, Coding, Planning, Response Generation) through the communication layer.
    3. Coordinate communication between these agents.
    4. Ensure the final response is processed by the Filtering Agent for maximum clarity and conciseness.

    Operational Strategy:
    - If the task requires info gathering, delegate to Research Agent.
    - If the task requires code development or analysis, delegate to Coding Agent.
    - If the task requires a strategic plan or timeline, delegate to Planning Agent.
    - Once information is gathered, use the Response Generation Agent to compile the draft.
    - ALWAYS pass the final combined response to the Filtering Agent to extract important information and ensure a short, clear response.
    - Finally, call 'save_to_db' to store the interaction and execution logs.
    """,
    model=model,
    handoffs=[research_agent, coding_agent, planning_agent, response_gen_agent, filtering_agent],
    tools=[save_to_db],
)
