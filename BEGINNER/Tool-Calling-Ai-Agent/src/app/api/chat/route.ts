import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_time",
        description: "Get the current time",
      },
      {
        name: "get_date",
        description: "Get the current date",
      },
      {
        name: "calculator",
        description: "Perform basic arithmetic calculations",
        parameters: {
          type: "OBJECT",
          properties: {
            expression: {
              type: "STRING",
              description: "The arithmetic expression to evaluate (e.g., '5 + 5')",
            },
          },
          required: ["expression"],
        },
      },
    ],
  },
];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Start chat with tools
    const chat = model.startChat({
      tools: tools as any,
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    
    // Extract tool calls - using optional chaining to avoid type errors
    const tool_calls = response.candidates?.[0]?.content?.parts
      ?.filter(part => part.functionCall)
      ?.map(part => ({
        name: part.functionCall?.name,
        args: part.functionCall?.args
      }));

    return NextResponse.json({
      text: response.text(),
      tool_calls: tool_calls,
      success: true
    });

  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error",
      text: "I encountered an error processing your request." 
    }, { status: 500 });
  }
}
