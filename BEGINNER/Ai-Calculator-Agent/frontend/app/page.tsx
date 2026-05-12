"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  IoSend, 
  IoCalculatorOutline, 
  IoFlaskOutline, 
  IoSparklesOutline, 
  IoChevronDown, 
  IoChevronUp,
  IoSettingsOutline,
  IoStatsChartOutline,
  IoTerminalOutline
} from "react-icons/io5";
import { FaRobot, FaUser, FaLaptopCode } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "assistant";
  content: string;
  logic?: any;
  showLogic?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleLogic = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, showLogic: !msg.showLogic } : msg
    ));
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: trimmedInput }]);
    setIsLoading(true);

    try {
      // Fetch from Hugging Face Space
      const res = await fetch("https://kristinasamuel-ai-calculator-agent.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });
      if (!res.ok) throw new Error("CORS or Connection Error");

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.error || "Execution error.", 
        logic: data.technical_logic,
        showLogic: false 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Engine offline. Please verify the backend connection or CORS settings." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="flex flex-col h-screen bg-[#050a10] text-slate-300 overflow-hidden selection:bg-emerald-500/30 font-sans">
      {/* Slim Header */}
      <header className="py-2.5 px-6 flex flex-col items-center justify-center border-b border-slate-800 bg-[#0d141d]/90 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-emerald-500 to-cyan-400 p-1.5 rounded-lg shadow-lg shadow-emerald-500/10">
            <IoCalculatorOutline className="text-[#050a10] w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white uppercase">
            AI Calculator <span className="text-emerald-400">Assistant</span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold mt-0.5 tracking-wider uppercase">
          Intelligent mathematical assistant powered by AI technology.
        </p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                <IoSparklesOutline className="w-12 h-12 text-emerald-500/20 relative z-10 animate-pulse" />
              </div>
              <div className="space-y-4">
                <p className="text-xl font-bold text-slate-100 uppercase tracking-widest italic text-center">Hello! I am your AI Calculator.</p>
                <p className="text-sm text-slate-400 text-center max-w-md mx-auto">
                  I'm specialized in solving mathematical problems. I can help you with arithmetic, algebra, and more. Ask me anything about math!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md mx-auto">
                  <button onClick={() => setInput("Solve quadratic equation x² + 5x + 6 = 0")} className="p-3 text-left rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all flex items-center gap-3">
                    <IoStatsChartOutline className="text-emerald-500 w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Algebraic Analysis</span>
                  </button>
                  <button onClick={() => setInput("What is 15% tip on $124.50?")} className="p-3 text-left rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all flex items-center gap-3">
                    <IoFlaskOutline className="text-cyan-500 w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Financial Computation</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-3 max-w-[95%] md:max-w-[80%]",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                  msg.role === "user" 
                    ? "bg-emerald-600/10 border-indigo-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-slate-800 border-slate-700 text-emerald-400"
                )}>
                  {msg.role === "user" ? <FaUser className="w-3 h-3" /> : <FaRobot className="w-3.5 h-3.5" />}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div
                    className={cn(
                      "p-3.5 rounded-xl shadow-2xl transition-all duration-300",
                      msg.role === "user" 
                        ? "bg-emerald-600 text-[#050a10] font-medium rounded-tr-none" 
                        : "bg-[#0d141d] border border-slate-800 rounded-tl-none text-slate-100"
                    )}
                  >
                    {/* Primary String Response */}
                    <p className="text-sm leading-relaxed">{msg.content}</p>

                    {/* Technical Logic Toggle */}
                    {msg.logic && (
                      <div className="mt-3 pt-3 border-t border-slate-800/50">
                        <button 
                          onClick={() => toggleLogic(i)}
                          className="flex items-center gap-2 text-[9px] font-black text-emerald-500/70 hover:text-emerald-400 transition-colors uppercase tracking-widest"
                        >
                          <IoTerminalOutline className="w-3 h-3" />
                          {msg.showLogic ? "Hide JSON Response" : "View JSON Response"}
                        </button>
                        
                        {msg.showLogic && (
                          <div className="mt-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 bg-black/40 rounded-lg border border-emerald-500/10">
                               <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-tighter">Raw JSON Response:</p>
                               <pre className="text-[10px] overflow-x-auto font-mono text-emerald-400/90 custom-scrollbar whitespace-pre-wrap leading-tight">
                                {JSON.stringify(msg.logic, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest px-1">
                    {msg.role === "user" ? "Transmitting Packet" : "Compute Successful"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <AiOutlineLoading3Quarters className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                </div>
                <div className="bg-slate-800/20 border border-slate-700/20 p-3 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <footer className="p-3 bg-[#050a10] border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2.5">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="w-full flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Initialize mathematical logic request..."
              className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500/50 transition-all text-slate-200 placeholder:text-slate-600 font-mono"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-[#050a10] p-2 rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[40px]"
            >
              <IoSend className="w-3.5 h-3.5" />
            </button>
          </form>
          
          <div className="w-full flex items-center justify-between px-1">
             <div className="flex items-center gap-1.5 text-slate-600">
                <IoSettingsOutline className="w-2.5 h-2.5" />
                <p className="text-[9px] font-bold uppercase tracking-[0.15em]">
                  CALC-ENGINE V1.0.4 • HF-SPACE
                </p>
             </div>
             <div className="group flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-all cursor-default">
                <FaLaptopCode className="text-emerald-500 w-2.5 h-2.5" />
                <p className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-tight">
                  Developed by <span className="text-slate-200 group-hover:text-white transition-colors">Agentic AI Developer Kristina</span>
                </p>
             </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </main>
  );
}
