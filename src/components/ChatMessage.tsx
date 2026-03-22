"use client";

import { useState, useRef } from "react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  figureName: string;
  figureGradient?: string;
  figurePortrait?: string;
  isStreaming?: boolean;
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

function ListenButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setState("idle");
        URL.revokeObjectURL(url);
      };

      await audio.play();
      setState("playing");
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleListen}
      className="inline-flex items-center gap-1.5 text-[10px] text-gold-500/50 hover:text-gold-400 transition-colors duration-300 uppercase tracking-widest font-medium mt-3"
      title={state === "playing" ? "Stop" : "Listen to response"}
    >
      {state === "loading" ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Generating voice...</span>
        </>
      ) : state === "playing" ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <span>Stop</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          <span>Listen</span>
        </>
      )}
    </button>
  );
}

export default function ChatMessage({
  role,
  content,
  figureName,
  figureGradient,
  figurePortrait,
  isStreaming,
}: ChatMessageProps) {
  const { body, citations } =
    role === "assistant" && !isStreaming
      ? parseCitations(content)
      : { body: content, citations: [] };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-ink-800/60 border border-ink-700/30 text-parchment-100 rounded-2xl rounded-br-sm px-5 py-3.5">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-1">
        <div
          className={`w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/10 relative ${!figurePortrait ? `bg-gradient-to-b ${figureGradient || "from-amber-900 to-yellow-950"}` : ""}`}
        >
          {figurePortrait ? (
            <img
              src={figurePortrait}
              alt={figureName}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] font-serif">
              {figureName[0]}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <span className="text-[10px] font-serif font-medium text-gold-500/50 uppercase tracking-widest">
            {figureName}
          </span>
        </div>
        <div className="text-[14px] leading-[1.8] text-parchment-200/90 whitespace-pre-wrap">
          {body}
          {isStreaming && (
            <span className="inline-block w-[2px] h-[18px] bg-gold-400/60 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>

        {/* Listen button - only show when done streaming */}
        {!isStreaming && body && body !== "I cannot respond right now. Please try again in a moment." && (
          <ListenButton text={body} />
        )}

        {/* Citations */}
        {citations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-ink-800/40">
            <div className="flex items-center gap-1.5 mb-2.5">
              <svg
                className="w-3 h-3 text-gold-500/40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span className="text-[10px] text-gold-500/40 uppercase tracking-widest font-medium">
                Sources
              </span>
            </div>
            <div className="space-y-1.5">
              {citations.map((cite, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-parchment-300/40 hover:text-parchment-300/60 transition-colors duration-300"
                >
                  <span className="text-gold-500/30 mt-px">{i + 1}.</span>
                  <span className="italic">{cite}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
