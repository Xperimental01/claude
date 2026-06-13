"use client";
import { useState, useRef, useEffect } from "react";
import { Event, CATEGORY_META, TICKET_STATUS_META } from "@/types/event";
import { ChatMessage, getAIResponse } from "@/lib/ai-assistant";
import { format, parseISO } from "date-fns";

const QUICK_ACTIONS = [
  "Show free events",
  "Tech events this month",
  "How to book Coldplay tickets?",
  "Events in Gurugram",
  "Recommend events for me",
  "What's happening this week?",
];

function MiniEventCard({ event, onSelect }: { event: Event; onSelect: (e: Event) => void }) {
  const status = TICKET_STATUS_META[event.ticket.status];
  return (
    <button
      onClick={() => onSelect(event)}
      className="text-left bg-white rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:shadow-sm transition-all w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-800 truncate">{event.name}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            📅 {format(parseISO(event.date), "dd MMM")} · 📍 {event.area}
          </div>
        </div>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${status.bg} ${status.color} border ${status.border}`}>
          {status.label}
        </span>
      </div>
      <div className="text-[10px] text-slate-500 mt-1">{event.ticket.price}</div>
    </button>
  );
}

export default function ChatAssistant({
  events,
  onSelectEvent,
}: {
  events: Event[];
  onSelectEvent: (e: Event) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your **Delhi NCR Events AI**. Ask me anything about upcoming events — I'll help you find events, check ticket availability, and guide you through booking!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(text?: string) {
    const msg = text ?? input;
    if (!msg.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: msg.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(msg.trim(), events);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 400 + Math.random() * 600);
  }

  function renderContent(content: string) {
    return content.split("\n").map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
      // Italic
      processed = processed.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
      // Links
      processed = processed.replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline hover:text-indigo-800">$1</a>'
      );
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: processed }} />
          {i < content.split("\n").length - 1 && <br />}
        </span>
      );
    });
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all hover:scale-105 ${
          isOpen ? "bg-slate-600 hover:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[380px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: "min(600px, calc(100vh - 140px))" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="text-white font-bold text-sm">Events AI Assistant</div>
              <div className="text-indigo-200 text-[10px]">Ask me about events, tickets & booking</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
                {/* Event suggestions */}
                {msg.eventSuggestions && msg.eventSuggestions.length > 0 && (
                  <div className="mt-2 space-y-1.5 ml-1">
                    {msg.eventSuggestions.map((e) => (
                      <MiniEventCard key={e.id} event={e} onSelect={onSelectEvent} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => handleSend(action)}
                  className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about events, tickets..."
              className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
