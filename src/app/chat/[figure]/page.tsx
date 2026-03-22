"use client";

import { useState, useRef, useEffect, use } from "react";
import { figures } from "@/lib/figures";
import ChatMessage from "@/components/ChatMessage";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ figure: string }>;
}) {
  const { figure: figureSlug } = use(params);
  const figure = figures.find((f) => f.slug === figureSlug);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!figure) {
    return (
      <div className="min-h-screen bg-ink-950 text-parchment-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-parchment-300/50 mb-4">Figure not found.</p>
          <Link href="/" className="text-gold-400 hover:text-gold-500 transition-colors text-sm">
            Back to all figures
          </Link>
        </div>
      </div>
    );
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figure: figureSlug,
          messages: newMessages,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                accumulated = "I cannot respond right now. Please try again in a moment.";
                setStreamingContent(accumulated);
                break;
              }
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamingContent(accumulated);
              }
            } catch {
              // skip malformed JSON lines
            }
          }
        }
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: accumulated },
      ]);
      setStreamingContent("");
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Try again.",
        },
      ]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-parchment-100 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-ink-800/50 px-6 py-4 flex items-center gap-4 backdrop-blur-sm bg-ink-950/80 sticky top-0 z-50"
      >
        <Link
          href="/"
          className="text-parchment-300/60 hover:text-gold-400 transition-colors duration-300"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10 relative">
            {figure.portrait ? (
              <Image
                src={figure.portrait}
                alt={figure.name}
                fill
                className="object-cover object-top"
                sizes="36px"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-b ${figure.gradient} flex items-center justify-center text-white/50 text-xs font-serif`}>
                {figure.name[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-sm font-serif font-medium text-parchment-50">
              {figure.name}
            </h1>
            <p className="text-[10px] text-gold-500/70 tracking-wider uppercase">
              {figure.era}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {messages.length === 0 && !streamingContent && (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                {/* Portrait or monogram */}
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8 ring-1 ring-white/10 shadow-[0_0_60px_rgba(201,168,76,0.08)] relative">
                  {figure.portrait ? (
                    <Image
                      src={figure.portrait}
                      alt={figure.name}
                      fill
                      className="object-cover object-top"
                      sizes="96px"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-b ${figure.gradient} flex items-center justify-center text-white/30 text-3xl font-serif`}>
                      {figure.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-serif text-parchment-50 mb-3">
                  {figure.name}
                </h2>
                <p className="text-parchment-300/60 text-sm max-w-md mx-auto leading-relaxed mb-8">
                  {figure.hook}
                </p>

                {/* Suggested questions */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {getSuggestedQuestions(figure.slug).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="text-xs text-parchment-300/70 border border-ink-700/50 rounded-lg px-3 py-2 hover:border-gold-500/40 hover:text-gold-400 transition-all duration-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ChatMessage
                role={msg.role}
                content={msg.content}
                figureName={figure.name}
                figureGradient={figure.gradient}
              />
            </motion.div>
          ))}

          {streamingContent && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ChatMessage
                role="assistant"
                content={streamingContent}
                figureName={figure.name}
                figureGradient={figure.gradient}
                isStreaming
              />
            </motion.div>
          )}

          {loading && !streamingContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-1.5 items-center text-parchment-300/40 pl-1"
            >
              <span className="text-[10px] uppercase tracking-widest mr-2 font-serif text-gold-500/60">
                {figure.name.split(" ")[figure.name.split(" ").length - 1]}
              </span>
              <span className="w-1 h-1 bg-gold-400/60 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 bg-gold-400/60 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 bg-gold-400/60 rounded-full animate-bounce [animation-delay:300ms]" />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="border-t border-ink-800/50 px-6 py-5 bg-ink-950/90 backdrop-blur-sm"
      >
        <div className="max-w-2xl mx-auto flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${figure.name} anything...`}
            className="flex-1 bg-ink-900/60 border border-ink-700/50 rounded-xl px-4 py-3 text-sm text-parchment-100 placeholder-parchment-300/40 resize-none focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all duration-300"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gold-500/90 hover:bg-gold-400 text-ink-950 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(201,168,76,0.15)] hover:shadow-[0_0_30px_rgba(201,168,76,0.25)]"
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function getSuggestedQuestions(slug: string): string[] {
  const questions: Record<string, string[]> = {
    "john-d-rockefeller": [
      "How would you cut costs in my business?",
      "What did Ledger A teach you?",
      "How do you turn a crisis into opportunity?",
    ],
    "steve-jobs": [
      "How do you decide what to cut?",
      "What makes a product great?",
      "How do you build a team that ships?",
    ],
    "jeff-bezos": [
      "What does Day 1 thinking mean?",
      "How do you make decisions with 70% of the data?",
      "How should I think about my customers?",
    ],
    "elon-musk": [
      "How do you use first principles?",
      "How do you set impossible deadlines?",
      "What makes you keep going after failure?",
    ],
    "jensen-huang": [
      "What is intellectual honesty?",
      "How do you lead through suffering?",
      "How did NVIDIA survive near-death?",
    ],
    "peter-thiel": [
      "What secret do you know that nobody agrees with?",
      "Why is competition overrated?",
      "How do you find a monopoly?",
    ],
    "charlie-munger": [
      "What mental models should I use?",
      "How do you avoid being stupid?",
      "What is inversion thinking?",
    ],
    "benjamin-franklin": [
      "How do you reinvent yourself?",
      "What are your 13 virtues?",
      "How do you think about time?",
    ],
    "sam-walton": [
      "How do you build a culture?",
      "What did you learn visiting competitors?",
      "How do you stay close to the customer?",
    ],
    "naval-ravikant": [
      "How do you build leverage?",
      "What is specific knowledge?",
      "How do you think about wealth vs money?",
    ],
  };
  return questions[slug] || ["What was your most important decision?", "What advice would you give a young person?", "What mistake taught you the most?"];
}
