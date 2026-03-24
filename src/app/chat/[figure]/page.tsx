"use client";

import { useState, useRef, useEffect, use, useCallback } from "react";
import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import WisdomCard from "@/components/WisdomCard";
import FeedbackModal from "@/components/FeedbackModal";

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

function parseFollowups(text: string): { body: string; followups: string[] } {
  const followupRegex = /\[FOLLOWUP:\s*([^\]]+)\]/;
  const match = text.match(followupRegex);
  const followups: string[] = [];
  if (match) {
    const parts = match[1].split("|").map((s) => s.trim()).filter(Boolean);
    followups.push(...parts);
  }
  const body = text.replace(followupRegex, "").trim();
  return { body, followups };
}

function cleanResponse(text: string): { displayText: string; ttsText: string; citations: string[]; followups: string[] } {
  // Extract citations
  const { body: noCitations, citations } = parseCitations(text);
  // Extract followups
  const { body: cleanBody, followups } = parseFollowups(noCitations);
  // Remove emdashes that slipped through
  const displayText = cleanBody.replace(/\u2014/g, ",").replace(/\u2013/g, ",");
  // TTS text: no citations, no followups, no emdashes
  const ttsText = displayText;
  return { displayText, ttsText, citations, followups };
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ figure: string }>;
}) {
  const { figure: figureSlug } = use(params);
  const figure = figures.find((f) => f.slug === figureSlug);
  const searchParams = useSearchParams();
  const matchReason = searchParams.get("reason");
  const preloadedQuery = searchParams.get("q");

  const { data: session, status: sessionStatus } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
  const [canReplay, setCanReplay] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [anonCredits, setAnonCredits] = useState<number>(10);
  const [showPaywall, setShowPaywall] = useState(false);
  const [wisdomQuote, setWisdomQuote] = useState<string | null>(null);
  const [showWisdomCard, setShowWisdomCard] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [showReason, setShowReason] = useState(!!matchReason);
  const [followups, setFollowups] = useState<string[]>([]);
  const wisdomCardShownRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasMessages = messages.length > 0 || !!streamingContent;

  // Load anonymous credits from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !session?.user) {
      const stored = localStorage.getItem("legends_anon_credits");
      if (stored !== null) {
        setAnonCredits(parseInt(stored, 10));
      }
    }
  }, [session]);

  // Get effective credit count
  const effectiveCredits = session?.user ? credits : anonCredits;

  // Decrement credits
  const decrementCredits = useCallback(async () => {
    if (session?.user) {
      const res = await fetch("/api/credits", { method: "POST" });
      const data = await res.json();
      if (data.credits !== undefined) {
        setCredits(data.credits);
        if (data.credits === 0 && !feedbackGiven) {
          setShowFeedback(true);
        }
      }
    } else {
      // Anonymous user: use localStorage
      setAnonCredits((prev) => {
        const next = Math.max(0, prev - 1);
        if (typeof window !== "undefined") {
          localStorage.setItem("legends_anon_credits", String(next));
        }
        if (next === 0) {
          // Prompt sign-in when anonymous credits run out
          setTimeout(() => signIn("google"), 500);
        }
        return next;
      });
    }
  }, [session, feedbackGiven]);

  // Extract a shareable quote after 5+ exchanges (10 messages)
  const maybeExtractQuote = useCallback(async (allMessages: Message[]) => {
    if (wisdomCardShownRef.current) return;
    if (allMessages.length < 10) return;

    const storageKey = `wisdom_shown_${figureSlug}`;
    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) return;

    wisdomCardShownRef.current = true;

    try {
      const res = await fetch("/api/extract-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          figureName: figure?.name,
          era: figure?.era,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.quote) {
        setWisdomQuote(data.quote);
        setShowWisdomCard(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, "true");
        }
      }
    } catch { /* silently fail */ }
  }, [figureSlug, figure?.name, figure?.era]);

  // Fetch credits on mount
  useEffect(() => {
    if (session?.user) {
      fetch("/api/credits").then(r => r.json()).then(data => {
        setCredits(data.credits);
      });
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-send preloaded query from the matcher
  const preloadSent = useRef(false);
  useEffect(() => {
    if (preloadedQuery && !preloadSent.current && sessionStatus !== "loading") {
      preloadSent.current = true;
      // Small delay to ensure component is ready
      setTimeout(() => sendQuickMessage(preloadedQuery), 300);
    }
  }, [preloadedQuery, sessionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

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
      setCanReplay(false);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, figureSlug }),
      });
      if (!res.ok) { setIsSpeaking(false); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (lastAudioUrl) {
        URL.revokeObjectURL(lastAudioUrl);
      }

      setLastAudioUrl(url);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); setCanReplay(true); };
      audio.onerror = () => { setIsSpeaking(false); setCanReplay(true); };
      await audio.play();
    } catch { setIsSpeaking(false); }
  }, [figureSlug, lastAudioUrl]);

  const replayAudio = useCallback(() => {
    if (lastAudioUrl) {
      const audio = new Audio(lastAudioUrl);
      audioRef.current = audio;
      audio.onended = () => { setIsSpeaking(false); setCanReplay(true); };
      audio.onerror = () => { setIsSpeaking(false); setCanReplay(true); };
      setIsSpeaking(true);
      setCanReplay(false);
      audio.play();
    }
  }, [lastAudioUrl]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCanReplay(!!lastAudioUrl);
  }, [lastAudioUrl]);

  if (!figure) {
    return (
      <div className="min-h-screen bg-ink-950 text-warm-100 flex items-center justify-center">
        <p className="text-warm-400">Figure not found. <Link href="/" className="underline">Back</Link></p>
      </div>
    );
  }

  const handleStream = async (newMessages: Message[]) => {
    setLoading(true);
    setStreamingContent("");
    setFollowups([]);
    stopSpeaking();

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

      const { displayText, ttsText, citations: newCitations, followups: newFollowups } = cleanResponse(accumulated);
      const assistantMessage = { role: "assistant" as const, content: displayText };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      setStreamingContent("");
      setFollowups(newFollowups);

      // Decrement credit
      decrementCredits();

      if (ttsText && !ttsText.startsWith("I cannot respond")) {
        autoPlayTTS(ttsText);
      }

      maybeExtractQuote(finalMessages);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
      setStreamingContent("");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // Check credits
    if (effectiveCredits !== null && effectiveCredits <= 0) {
      if (!session?.user) {
        signIn("google");
      } else {
        setShowPaywall(true);
      }
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    handleStream(newMessages);
  };

  const sendQuickMessage = (text: string) => {
    // Check credits
    if (effectiveCredits !== null && effectiveCredits <= 0) {
      if (!session?.user) {
        signIn("google");
      } else {
        setShowPaywall(true);
      }
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    handleStream(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="h-[100dvh] bg-ink-950 text-warm-100 flex flex-col overflow-hidden relative">
      {/* Full-bleed portrait background - always visible */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        </div>
      )}

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 shrink-0">
        <Link href="/" className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <AnimatePresence mode="wait">
          {isSpeaking ? (
            <motion.button
              key="speaking"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={stopSpeaking}
              className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2.5 hover:bg-black/50 transition-all min-h-[44px]"
            >
              <div className="flex items-end gap-[2px] h-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-[2px] bg-white rounded-full waveform-bar" style={{ height: "100%", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs text-white/80">Speaking</span>
            </motion.button>
          ) : canReplay ? (
            <motion.button
              key="replay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={replayAudio}
              className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2.5 hover:bg-black/50 transition-all min-h-[44px]"
            >
              <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-xs text-white/80">Listen again</span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Middle content area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {!hasMessages ? (
          /* Empty state */
          <div className="flex-1 flex flex-col justify-end px-4 pb-4 overflow-y-auto">
            {showReason && matchReason && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 mb-4 border border-white/10">
                <p className="text-sm text-white/80 italic">{matchReason}</p>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-medium text-white mb-1">
              {figure.name}
            </h1>
            <p className="text-white/50 text-sm mb-1">{figure.era}</p>
            <p className="text-white/60 text-sm italic mb-4">{figure.knownFor}</p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {figure.stats.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-white/70">
                  <span className="text-white/40">{s.label}</span>{" "}
                  <span className="font-medium text-white">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {getSuggestedQuestions(figure.slug).map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setShowReason(false);
                    sendQuickMessage(q);
                  }}
                  className="text-sm text-white/80 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5 hover:bg-white/20 transition-all min-h-[44px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation - scrollable */
          <div className="flex-1 overflow-y-auto px-4 py-3 chat-scroll">
            <div className="max-w-2xl mx-auto space-y-3">
              {messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[85%] bg-white/15 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-3">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  );
                }
                const { body, citations: msgCitations } = parseCitations(msg.content);
                const { body: cleanBody } = parseFollowups(body);
                const isLatest = i === messages.length - 1;
                return (
                  <div key={i} className="flex flex-col justify-start gap-1">
                    <div className={`max-w-[90%] ${isLatest ? "" : "opacity-60"}`}>
                      <p className="text-[15px] text-white leading-[1.8] whitespace-pre-wrap break-words">{cleanBody}</p>
                    </div>
                    {/* Citations styled differently */}
                    {msgCitations.length > 0 && (
                      <div className="max-w-[90%] mt-1">
                        {msgCitations.map((c, ci) => (
                          <p key={ci} className="text-[11px] text-white/30 italic flex items-center gap-1">
                            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {c}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[90%]">
                    <p className="text-[15px] text-white leading-[1.8] whitespace-pre-wrap break-words">
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

      {/* Follow-up suggestions */}
      {followups.length > 0 && !loading && hasMessages && (
        <div className="relative z-10 px-4 py-2 shrink-0">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5">
            {followups.map((q, i) => (
              <button
                key={i}
                onClick={() => sendQuickMessage(q)}
                className="text-xs text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 hover:bg-white/20 transition-all min-h-[36px] text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Credits indicator */}
      {effectiveCredits !== null && (
        <div className="relative z-10 px-4 py-1 flex justify-center shrink-0">
          <span className="text-[10px] text-white/30">
            {effectiveCredits} messages remaining{!session?.user ? " (free trial)" : ""}
          </span>
        </div>
      )}

      {/* Input area - mobile safe */}
      <div className="relative z-10 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-1 shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${figure.name}...`}
            className="flex-1 min-w-0 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-[16px] text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/25 transition-colors leading-normal"
            rows={1}
            disabled={loading}
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-white text-ink-950 w-12 h-12 min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Wisdom Card share panel */}
      <AnimatePresence>
        {showWisdomCard && wisdomQuote && figure && (
          <WisdomCard
            quote={wisdomQuote}
            figureName={figure.name}
            era={figure.era}
            figureSlug={figure.slug}
            figureColor={figure.color}
            onDismiss={() => setShowWisdomCard(false)}
          />
        )}
      </AnimatePresence>

      {/* Feedback modal */}
      {showFeedback && figure && (
        <FeedbackModal
          figureSlug={figure.slug}
          figureName={figure.name}
          onClose={() => {
            setShowFeedback(false);
            setFeedbackGiven(true);
            setShowPaywall(true);
          }}
        />
      )}

      {/* Paywall modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center"
            >
              <h2 className="text-xl sm:text-2xl font-serif font-medium text-ink-950 mb-2">
                Keep the conversation going
              </h2>
              <p className="text-warm-400 text-sm mb-6">
                You&apos;ve used all your free messages. Get 100 more to continue learning from humanity&apos;s greatest.
              </p>
              <a
                href="https://buy.stripe.com/7sY4gz0wy7cFeUM1q9aMU0i"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-ink-950 text-white rounded-full py-3 px-6 text-sm font-medium hover:bg-ink-800 transition-colors mb-3 min-h-[48px] flex items-center justify-center"
              >
                100 messages for $10
              </a>
              <button
                onClick={() => setShowPaywall(false)}
                className="text-sm text-warm-400 hover:text-ink-950 transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSuggestedQuestions(slug: string): string[] {
  const questions: Record<string, string[]> = {
    "john-d-rockefeller": [
      "How do I make my first dollar?",
      "What did Ledger A teach you?",
      "Turn a crisis into opportunity?",
    ],
    "elon-musk": [
      "How do you think from first principles?",
      "What was 2008 like for you?",
      "How do you compress timelines?",
    ],
    "peter-thiel": [
      "How do I build a monopoly?",
      "What's a contrarian truth?",
      "Why is competition for losers?",
    ],
    "benjamin-franklin": [
      "How did you teach yourself to write?",
      "Tell me about the 13 virtues.",
      "How do you reinvent yourself?",
    ],
    "alexander-the-great": [
      "How do you lead from the front?",
      "What did Aristotle teach you?",
      "How did you conquer Persia?",
    ],
    "lee-kuan-yew": [
      "How did you build Singapore?",
      "What makes a nation succeed?",
      "How do you fight corruption?",
    ],
    "david-deutsch": [
      "What is the beginning of infinity?",
      "How does knowledge grow?",
      "Why are problems soluble?",
    ],
  };
  return questions[slug] || ["What was your most important decision?", "What advice for a young person?"];
}
