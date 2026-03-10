"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types";

const STARTER_PROMPTS = [
  "What are my biggest gaps for this role?",
  'Draft an answer to: "Tell me about yourself."',
  "Write a 200-word answer about a time I led a project.",
  "What's the company culture like?",
  "What interview questions should I prepare for?",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
          ✦
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
        }`}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              code: ({ children }) => (
                <code className="bg-gray-100 text-gray-800 rounded px-1 py-0.5 text-xs font-mono">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const {
    userProfile,
    jobDescription,
    auditReport,
    cvOutput,
    chatMessages,
    addChatMessage,
    clearChatMessages,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    setError("");

    const userMsg: ChatMessage = { role: "user", content: content.trim() };
    addChatMessage(userMsg);
    setInput("");

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile,
          jobDescription,
          auditReport,
          cvOutput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");

      addChatMessage({ role: "assistant", content: data.reply });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      addChatMessage({
        role: "assistant",
        content: "I ran into an issue. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const contextLoaded = !!(userProfile && jobDescription);

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">✦ Hada Madrina Chat</h1>
          <p className="text-sm text-gray-500">
            {contextLoaded
              ? `Advising you on ${jobDescription?.job_title} at ${jobDescription?.company_name}`
              : "Your AI career advisor — load a profile and job first for full context"}
          </p>
        </div>
        {chatMessages.length > 0 && (
          <button
            onClick={clearChatMessages}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-2xl border border-gray-200 p-4">
        {chatMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="text-4xl mb-4">✦</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Hola! I&apos;m your Hada Madrina.
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md">
              {contextLoaded
                ? `I have your full profile, the ${jobDescription?.company_name} JD, and the audit loaded. Ask me anything about your application.`
                : "I'm ready to help. For best results, complete your profile and add a job description first."}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs bg-white border border-gray-200 rounded-full px-3 py-2 text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm mr-2 flex-shrink-0">
              ✦
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center mb-2">{error}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex items-end gap-2 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Hada Madrina anything... (Enter to send, Shift+Enter for newline)"
            className="flex-1 resize-none border-0 outline-none text-sm text-gray-800 placeholder-gray-400 max-h-32 min-h-[20px]"
            rows={1}
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-purple-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-1">
          Context loaded: {contextLoaded ? "✓ Profile + JD" : "⚠ No context"}{" "}
          {auditReport ? "· ✓ Audit" : ""}{" "}
          {cvOutput ? "· ✓ CV" : ""}
        </p>
      </div>
    </div>
  );
}
