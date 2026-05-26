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
  
  // Backend URL
  const BACKEND_URL = "http://127.0.0.1:8000";

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
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      {/* Sidebar for History/Logs */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#0f172a] border-r border-slate-800 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-mono text-sm uppercase tracking-widest text-emerald-500 font-bold">Session History</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-slate-600 text-xs text-center mt-10 uppercase tracking-tighter">No neural traces found.</p>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedLog(item)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 group ${selectedLog?.id === item.id ? "bg-emerald-500/10 border-emerald-500/50" : "bg-slate-900/50 border-slate-800"}`}
                >
                  <p className="text-[10px] font-mono text-slate-500 mb-1">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">{item.user_query}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617]">
        {/* Header */}
        <header className="px-8 py-5 border-b border-slate-800 flex items-center justify-between glass-panel sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-[#020617] font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">MM</div>
            <div>
              <h1 className="font-black text-xl tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">MultiMind AI</h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${backendStatus === "online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-rose-500"}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{backendStatus}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Multi-Agent Intelligence</h3>
                <p className="text-slate-400 mt-4 text-lg font-medium">Ready to coordinate complex workflows across specialized neural nodes.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {[
                  "Coordinate a cross-platform data analysis", 
                  "Synthesize a multi-agent strategy", 
                  "Execute a software architecture review", 
                  "Simulate a multi-variable model"
                ].map(q => (
                  <button key={q} onClick={() => setInput(q)} className="p-4 text-sm font-semibold bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left text-slate-300 group">
                    <span className="group-hover:text-emerald-400">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-xl ${m.role === "user" ? "bg-emerald-600 text-white rounded-tr-none font-medium" : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl rounded-tl-none shadow-xl flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse delay-300"></span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processing</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 glass-panel border-t border-slate-800">
          <form onSubmit={handleChat} className="max-w-4xl mx-auto relative group">
            <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-focus-within:bg-emerald-500/10 transition-all rounded-3xl"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inject command into neural network..."
              className="w-full pl-8 pr-20 py-5 bg-slate-950/80 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-2xl text-slate-100 placeholder:text-slate-600 relative z-10"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-3 bottom-3 px-6 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all z-20"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "Execute"
              )}
            </button>
          </form>
          <div className="flex justify-center items-center gap-6 mt-6">
             <p className="text-[9px] text-emerald-500/50 uppercase tracking-[0.4em] font-black">Developed by Kristina Agentic AI Developer</p>
          </div>
        </div>
      </main>

      {/* Execution Log Details Overlay */}
      {selectedLog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight uppercase text-white">Neural Trace Details</h3>
                  <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest mt-0.5">Diagnostic Log Access</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors border border-slate-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-1 bg-emerald-500"></div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Input Vector</h4>
                </div>
                <div className="p-5 bg-slate-950 rounded-xl text-sm font-semibold border border-slate-800 text-emerald-400 italic">
                  "{selectedLog.user_query}"
                </div>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-1 bg-emerald-500"></div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Agent Coordination Logs</h4>
                </div>
                <div className="p-6 bg-[#020617] rounded-xl font-mono text-xs text-emerald-500/90 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner overflow-x-auto relative">
                  <div className="absolute top-4 right-4 text-[8px] font-bold text-slate-700 uppercase tracking-widest">Streaming_Buffer</div>
                  {selectedLog.execution_logs || "No neural traces recorded for this session."}
                </div>
              </section>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-1 bg-emerald-500"></div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Output Synthesis</h4>
                </div>
                <div className="p-6 bg-slate-950 rounded-xl text-sm leading-relaxed text-slate-300 border border-slate-800">
                  {selectedLog.agent_response}
                </div>
              </section>
            </div>
            <div className="p-5 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              <span>Timestamp: {new Date(selectedLog.timestamp).toISOString()}</span>
              <span>Sequence_ID: {selectedLog.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
