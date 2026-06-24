"use client";

import { useEffect, useRef, useState } from "react";
import { SendIcon, SparkleIcon } from "./icons";
import ChatChart from "./charts/ChatChart";

export default function ChatPanel({ messages, onSend, disabled, isSending }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  const submit = () => {
    const text = input.trim();
    if (!text || disabled || isSending) return;
    onSend(text);
    setInput("");
  };

  return (
    <div className="bg-white border border-border rounded-xl shadow-card flex flex-col h-[420px]">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <SparkleIcon className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold text-ink">Ask FinSight</h2>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-subtle">
            {disabled
              ? "Upload a document to start chatting."
              : "Ask a question about your uploaded documents, or request a chart — e.g. \"compare operating expenses across all uploaded documents.\""}
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : m.isError
                  ? "bg-red-50 text-risk-high border border-red-200"
                  : "bg-surface text-ink border border-border"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.chart && <ChatChart chart={m.chart} />}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-subtle">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 flex items-center gap-2">
        <input
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={disabled ? "Upload a document first…" : "Ask a question or request a chart…"}
          className="flex-1 text-sm rounded-lg border border-border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-surface disabled:text-subtle"
        />
        <button
          onClick={submit}
          disabled={disabled || isSending || !input.trim()}
          className="bg-accent text-white rounded-lg p-2 disabled:opacity-40 hover:bg-blue-700 transition-colors flex-shrink-0"
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
