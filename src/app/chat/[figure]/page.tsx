"use client";

import { useState, useRef, useEffect, use, useCallback } from "react";
import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function parseCitations(text: string): { body: string; citations: string[] } {
  const citationRegex = /\[Source:\s*"([^"]+)"\s*by\s*([^\]]+)\]/g;
  const citations: string[] = [];
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push(`${match[1]} by ${match[2]}`);
  }
  const body = text.replace(citationRegex, "").trim();
  return { body, citations };
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasMessages = messages.length > 0 || !!streamingContent;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const autoPlayTTS = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setIsSpeaking(false); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setIsSpeaking(false); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setIsSpeaking(false); }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  if (!figure) {
    return (
      <div className="min-h-screen bg-ink-950 text-warm-100 flex items-center justify-center">
        <p className="text-warm-400">Figure not found. <Link href="/" className="underline">Back</Link></p>
      </div>
    );
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    stopSpeaking();

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
        body: JSON.stringify({ figure: figureSlug, messages: newMessages }),
      });
      if (!res.ok) throw new Error("Failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) { accumulated = "I cannot respond right now."; setStreamingContent(accumulated); break; }
              if (parsed.text) { accumulated += parsed.text; setStreamingContent(accumulated); }
            } catch { /* skip */ }
          }
        }
      }

      setMessages([...newMessages, { role: "assistant", content: accumulated }]);
      setStreamingContent("");

      if (accumulated && !accumulated.startsWith("I cannot respond")) {
        const cleanText = accumulated.replace(/\[Source:\s*"[^"]+"\s*by\s*[^\]]+\]/g, "").trim();
        autoPlayTTS(cleanText);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  };

  const sendQuickMessage = (text: string) => {
    setInput(text);
    // Use a ref-based approach: set input then trigger send on next tick
    setTimeout(() => {
      const userMessage: Message = { role: "user", content: text };
      const newMessages = [userMessage];
      setMessages(newMessages);
      setInput("");
      setLoading(true);
      setStreamingContent("");
      stopSpeaking();

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figure: figureSlug, messages: newMessages }),
      }).then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");
        const decoder = new TextDecoder();
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) { accumulated = "I cannot respond right now."; setStreamingContent(accumulated); break; }
                if (parsed.text) { accumulated += parsed.text; setStreamingContent(accumulated); }
              } catch { /* skip */ }
            }
          }
        }
        setMessages([...newMessages, { role: "assistant", content: accumulated }]);
        setStreamingContent("");
        if (accumulated && !accumulated.startsWith("I cannot respond")) {
          const cleanText = accumulated.replace(/\[Source:\s*"[^"]+"\s*by\s*[^\]]+\]/g, "").trim();
          autoPlayTTS(cleanText);
        }
      }).catch(() => {
        setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
        setStreamingContent("");
      }).finally(() => {
        setLoading(false);
      });
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Get the latest assistant message for display
  const latestAssistant = streamingContent
    || (messages.length > 0 && messages[messages.length - 1].role === "assistant"
      ? messages[messages.length - 1].content
      : "");
  const { body: displayText, citations } = latestAssistant && !streamingContent
    ? parseCitations(latestAssistant)
    : { body: latestAssistant, citations: [] };

  return (
    <div className="h-screen bg-ink-950 text-warm-100 flex flex-col overflow-hidden relative">
      {/* Full-bleed portrait background */}
      {figure.portrait && (
        <div className="absolute inset-0 z-0">
          <Image
            src={figure.portrait}
            alt={figure.name}
            fill
            className={`object-cover object-top transition-all duration-1000 ${hasMessages ? "scale-105 blur-[2px]" : "scale-100"}`}
            sizes="100vw"
            priority
          />
          {/* Gradient overlay — heavier at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
        <Link href="/" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={stopSpeaking}
              className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/50 transition-all"
            >
              <div className="flex items-end gap-[2px] h-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-[2px] bg-white rounded-full waveform-bar" style={{ height: "100%", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs text-white/80">Speaking</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Middle — portrait area / empty state */}
      <div className="relative z-10 flex-1 flex flex-col">
        {!hasMessages ? (
          /* Empty state — name + suggested questions over the portrait */
          <div className="flex-1 flex flex-col justify-end px-6 pb-6">
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-white mb-2">
              {figure.name}
            </h1>
            <p className="text-white/50 text-sm mb-8">{figure.era}</p>

            <div className="flex flex-wrap gap-2">
              {getSuggestedQuestions(figure.slug).map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendQuickMessage(q)}
                  className="text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5 hover:bg-white/20 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation — scrollable messages over blurred portrait */
          <div className="flex-1 overflow-y-auto px-5 py-4 chat-scroll">
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[80%] bg-white/15 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-3">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                }
                const { body } = parseCitations(msg.content);
                const isLatest = i === messages.length - 1;
                return (
                  <div key={i} className="flex justify-start">
                    <div className={`max-w-[85%] ${isLatest ? "" : "opacity-60"}`}>
                      <p className="text-[15px] text-white leading-[1.8] whitespace-pre-wrap">{body}</p>
                    </div>
                  </div>
                );
              })}

              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    <p className="text-[15px] text-white leading-[1.8] whitespace-pre-wrap">
                      {streamingContent}
                      <span className="inline-block w-[2px] h-[16px] bg-white/60 ml-0.5 animate-pulse align-text-bottom" />
                    </p>
                  </div>
                </div>
              )}

              {loading && !streamingContent && (
                <div className="flex gap-1.5 py-2">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Citations — subtle bar above input */}
      {citations.length > 0 && !streamingContent && (
        <div className="relative z-10 px-6 py-2 bg-black/20 backdrop-blur-sm">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Source: <span className="italic">{citations[0]}</span>
          </p>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 px-5 pb-5 pt-3">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${figure.name}...`}
            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/25 transition-colors"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-white text-ink-950 w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95 self-end"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function getSuggestedQuestions(slug: string): string[] {
  const questions: Record<string, string[]> = {
    "john-d-rockefeller": [
      "How would you cut costs?",
      "What did Ledger A teach you?",
      "Turn a crisis into opportunity?",
    ],
  };
  return questions[slug] || ["What was your most important decision?", "What advice for a young person?"];
}
