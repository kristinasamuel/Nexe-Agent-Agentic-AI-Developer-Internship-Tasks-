from agents import Agent
from my_config.config import model
from my_tools.tools import Addition, Subtraction, Multiplication, Division

# Math Agent
Math_Agent = Agent(
    name = "Math_Agent",
    instructions = """
       You are a helpful math agent. Your primary role is to solve math problems step by step, using the available tools to ensure accuracy. 
       Always provide clear explanations of the results so the user can easily understand the solution.  
    """,
    model = model,
    tools= [Addition, Subtraction, Multiplication, Division]
)
