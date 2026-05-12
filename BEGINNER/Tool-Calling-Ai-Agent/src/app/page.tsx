"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  IoSend, 
  IoTimeOutline, 
  IoCalendarOutline, 
  IoCalculatorOutline, 
  IoPartlySunnyOutline, 
  IoCodeWorking, 
  IoChevronDown, 
  IoChevronUp,
  IoSparklesOutline
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
  content: any;
  showJson?: boolean;
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
  }, [messages]);

  const toggleJson = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, showJson: !msg.showJson } : msg
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("https://kristinasamuel-tool-calling-agent.hf.space/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data, showJson: false }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: { error: "Neural Link Failure. Ensure backend is active." } },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "get_time": return <IoTimeOutline className="w-4 h-4" />;
      case "get_date": return <IoCalendarOutline className="w-4 h-4" />;
      case "calculator": return <IoCalculatorOutline className="w-4 h-4" />;
      case "get_weather": return <IoPartlySunnyOutline className="w-4 h-4" />;
      default: return <IoCodeWorking className="w-4 h-4" />;
    }
  };

  return (
    <main className="flex flex-col h-screen bg-[#020617] text-slate-300 overflow-hidden selection:bg-indigo-500/30">
      {/* Optimized SLIM Header */}
      <header className="py-2 px-6 flex flex-col items-center justify-center border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-1.5 rounded-lg">
            <FaLaptopCode className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Tool-Calling <span className="text-indigo-400">AI Agent</span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5 text-center">
          AI-powered assistant with function calling, JSON responses, and error handling.
        </p>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                <IoSparklesOutline className="w-12 h-12 text-indigo-500/40 relative z-10 animate-pulse" />
              </div>
              <div className="space-y-4">
                <p className="text-xl font-semibold text-slate-100 uppercase tracking-widest">Start chatting with the AI agent.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3 transition-all hover:border-indigo-500/40">
                    <IoTimeOutline className="text-amber-400 w-4 h-4" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-200">System Time</p>
                      <p className="text-[9px] text-slate-500">Query real-time clock data</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center gap-3 transition-all hover:border-indigo-500/40">
                    <IoCalculatorOutline className="text-indigo-400 w-4 h-4" />
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-200">Math Logic</p>
                      <p className="text-[9px] text-slate-500">Solve arithmetic expressions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full group transition-all",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-3 max-w-[95%] md:max-w-[85%]",
                  msg.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                  msg.role === "user" 
                    ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400" 
                    : "bg-slate-800 border-slate-700 text-indigo-400"
                )}>
                  {msg.role === "user" ? <FaUser className="w-3 h-3" /> : <FaRobot className="w-3.5 h-3.5" />}
                </div>
                
                <div className="flex flex-col gap-1">
                  <div
                    className={cn(
                      "p-3.5 rounded-xl shadow-xl transition-all duration-300",
                      msg.role === "user" 
                        ? "bg-indigo-600 text-white rounded-tr-none border border-indigo-500/20" 
                        : "bg-[#1e293b] border border-slate-700/50 rounded-tl-none text-slate-100"
                    )}
                  >
                    {/* Render Content */}
                    {typeof msg.content === "string" ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Conversational Text Result First */}
                        <p className="text-sm leading-relaxed">
                          {msg.content.result || msg.content.error || "Execution complete."}
                        </p>

                        {/* Tool execution info & JSON Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 gap-4">
                          {msg.content.tool ? (
                            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/50 border border-slate-700/50">
                              {getToolIcon(msg.content.tool)}
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                                Tool: {msg.content.tool.replace('_', ' ')}
                              </span>
                            </div>
                          ) : <div />}

                          {!msg.content.error && (
                            <button 
                              onClick={() => toggleJson(i)}
                              className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase whitespace-nowrap"
                            >
                              {msg.showJson ? <IoChevronUp className="w-3 h-3" /> : <IoChevronDown className="w-3 h-3" />}
                              {msg.showJson ? "Hide Logic" : "Inspect JSON"}
                            </button>
                          )}
                        </div>

                        {/* JSON Block */}
                        {msg.showJson && (
                          <div className="animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-2 mt-2">
                              <IoCodeWorking className="text-emerald-500 w-3 h-3" />
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Neural Computation JSON</span>
                            </div>
                            <pre className="text-[9px] bg-black/40 p-2.5 rounded-lg overflow-x-auto font-mono text-emerald-400/90 border border-emerald-500/10 custom-scrollbar">
                              {JSON.stringify(msg.content, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-600 font-bold uppercase px-1">
                    {msg.role === "user" ? "Transmission sent" : "Neural Response received"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <AiOutlineLoading3Quarters className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                </div>
                <div className="bg-slate-800/40 border border-slate-700/30 p-3 rounded-xl rounded-tl-none">
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

      {/* Optimized SLIM Footer */}
      <footer className="p-3 bg-[#020617] border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <form onSubmit={handleSubmit} className="w-full flex gap-2">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to calculate, get time or weather..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-slate-200 placeholder:text-slate-600"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white p-2 rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[40px]"
            >
              <IoSend className="w-3.5 h-3.5" />
            </button>
          </form>
          
          <div className="w-full flex items-center justify-between px-1">
             <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
               Secure Socket Layer Active
             </p>
             <div className="group flex items-center gap-1.5 py-0.5 px-3 rounded-full bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all cursor-default shadow-inner">
                <FaLaptopCode className="text-indigo-500 w-2.5 h-2.5" />
                <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-tighter">
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </main>
  );
}
