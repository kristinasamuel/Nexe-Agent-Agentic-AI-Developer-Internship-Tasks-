"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const BACKEND_URL = "https://kristinasamuel-rag-assistant.hf.space";

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        if (res.ok) setBackendStatus("online");
        else setBackendStatus("offline");
      } catch (e) {
        setBackendStatus("offline");
      }
    };
    checkBackend();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      alert(`Chat Error: ${error.message}\n\nPlease check your Backend Terminal for red ❌ logs.`);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      setUploadedFiles((prev) => [...prev, file.name]);
      alert(`Successfully uploaded ${file.name} (${data.chunks} chunks processed)`);
    } catch (error: any) {
      console.error("Full Upload Error:", error);
      alert(`Error: ${error.message || "Unknown upload error"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">RAG Assistant</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Upload Documents
          </h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full py-3 px-4 rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 ${
              isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <div className="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <span className="text-sm font-medium text-blue-700">
              {isUploading ? "Uploading..." : "Click to upload PDF/TXT"}
            </span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt"
            className="hidden"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Processed Files
          </h2>
          {uploadedFiles.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {uploadedFiles.map((file, i) => (
                <li key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14.5 2 14.5 7 20 7"/></svg>
                  </div>
                  <span className="text-sm text-gray-700 truncate font-medium">{file}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600"></div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Status</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === "online" ? "bg-green-500 animate-pulse" : 
                  backendStatus === "checking" ? "bg-yellow-500 animate-bounce" : "bg-red-500"
                }`}></div>
                <p className="text-sm font-semibold text-gray-700">
                  {backendStatus === "online" ? "Connected" : 
                   backendStatus === "checking" ? "Checking..." : "Offline"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Chat Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Conversation</h2>
            <p className="text-xs text-gray-400">Ask questions about your documents</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8f9fa]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to RAG Assistant!</h3>
              <p className="text-gray-500 leading-relaxed">
                Upload your documents on the left and start asking questions. I'll use the content of your files to provide accurate, contextual answers.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-6 py-4 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Assistant is thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-gray-200 z-10">
          <form onSubmit={handleChat} className="max-w-4xl mx-auto flex gap-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px] text-gray-700 placeholder:text-gray-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-semibold">
                  <span className="text-xs">↵</span> ENTER
                </kbd>
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                !input.trim() || isLoading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
              }`}
            >
              <span className="hidden sm:inline">Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            &copy; {new Date().getFullYear()} Developed by Agentic AI Developer Kristina
          </p>
        </div>
      </main>
    </div>
  );
}
