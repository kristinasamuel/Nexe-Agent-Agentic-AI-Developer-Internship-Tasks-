# Tool Calling AI Agent

A simple Tool Calling AI Agent built with Next.js, TypeScript, Tailwind CSS, and Gemini API.

## Features
- **Function Calling**: Automatically chooses between `getTime()`, `getDate()`, and `calculator()`.
- **JSON Response**: Returns data in a structured JSON format.
- **Modern UI**: Fully responsive chat interface with loading states and tool execution indicators.
- **Error Handling**: Gracefully handles invalid inputs and connection errors.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Create a `.env.local` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Development Server**:
   ```bash
   npm run dev
   ```

4. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## Functions
- `getTime()`: Returns the current time (e.g., "10:30 PM").
- `getDate()`: Returns the current date.
- `calculator(expression)`: Evaluates basic math expressions (e.g., "5 + 5").
