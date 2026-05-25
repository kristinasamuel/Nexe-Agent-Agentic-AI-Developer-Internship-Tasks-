"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ExecutionHistory {
  id: number;
  user_query: string;
  agent_response: string;
  execution_logs: string;
  timestamp: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [history, setHistory] = useState<ExecutionHistory[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionHistory | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const BACKEND_URL = "https://kristinasamuel-autonomous-business-agent.hf.space";

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check Backend Status & Fetch History
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        if (res.ok) {
          setBackendStatus("online");
          fetchHistory();
        } else {
          setBackendStatus("offline");
        }
      } catch (e) {
        setBackendStatus("offline");
      }
    };
    init();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from agent");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      fetchHistory(); // Refresh history after a successful chat
    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: " + error.message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar for History/Logs */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="font-bold text-xl text-indigo-600">Autonomous Logs</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm text-center mt-10">No execution logs yet.</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedLog(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedLog?.id === item.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"}`}
                >
                  <p className="text-xs font-semibold text-slate-400 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium line-clamp-1">{item.user_query}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white shadow-2xl">
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">B</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Autonomous Business Agent</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${backendStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{backendStatus}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4-4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Hello, I'm your Business Partner</h3>
                <p className="text-slate-500 mt-2">I can plan tasks, reason through complex problems, and execute workflows autonomously. How can I help you today?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {["Plan a marketing strategy", "Analyze business risks", "Generate sales forecast", "Optimize logistics"].map(q => (
                  <button key={q} onClick={() => setInput(q)} className="p-3 text-sm font-medium bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all text-left">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-100">
          <form onSubmit={handleChat} className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your business task..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner text-slate-800"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none transition-all"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
              )}
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-[0.2em] font-bold">Autonomous Reasoning Engine Active</p>
        </div>
      </main>

      {/* Execution Log Details Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-xl">Internal Execution Log</h3>
                <p className="text-xs text-slate-500 mt-1">Detailed multi-step reasoning & planning</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">User Input</h4>
                <div className="p-4 bg-slate-50 rounded-2xl text-sm font-medium border border-slate-100 italic">"{selectedLog.user_query}"</div>
              </section>
              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Reasoning & Planning</h4>
                <div className="p-6 bg-zinc-900 rounded-2xl font-mono text-sm text-green-400 whitespace-pre-wrap leading-relaxed border-l-4 border-indigo-500 shadow-xl overflow-x-auto">
                  {selectedLog.execution_logs || "No logs available for this session."}
                </div>
              </section>
              <section>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Final Delivered Result</h4>
                <div className="p-5 bg-indigo-50 rounded-2xl text-sm leading-relaxed text-slate-700 border border-indigo-100">
                  {selectedLog.agent_response}
                </div>
              </section>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs font-medium text-slate-400">
              <span>Timestamp: {new Date(selectedLog.timestamp).toLocaleString()}</span>
              <span>ID: {selectedLog.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
