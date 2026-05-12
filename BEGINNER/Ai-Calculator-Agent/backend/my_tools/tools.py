# define the tools that math agent can use

from agents import function_tool

@function_tool
def Addition(n1: float, n2: float):
    return {
        "operation": "addition",
        "numbers": [n1, n2],
        "result": n1 + n2
    }

@function_tool
def Subtraction(n1: float, n2: float):
    return {
        "operation": "subtraction",
        "numbers": [n1, n2],
        "result": n1 - n2
    }

@function_tool
def Multiplication(n1: float, n2: float):
    return {
        "operation": "multiplication",
        "numbers": [n1, n2],
        "result": n1 * n2
    }

@function_tool
def Division(n1: float, n2: float):
    if n2 == 0:
        return {"error": "Cannot divide by zero"}

    return {
        "operation": "division",
        "numbers": [n1, n2],
        "result": n1 / n2
    }