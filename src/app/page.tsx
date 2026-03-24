"use client";

import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const rockefeller = figures[0];
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoicePreview = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rockefeller.signatureQuote }),
      });
      if (!res.ok) { setIsLoading(false); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); URL.revokeObjectURL(url); audioRef.current = null; };
      setIsLoading(false);
      setIsPlaying(true);
      await audio.play();
    } catch {
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isPlaying, rockefeller.signatureQuote]);

  return (
    <main className="min-h-screen bg-warm-50 text-ink-950">
      <div className="max-w-2xl mx-auto px-6 pt-12 md:pt-24 pb-12">
        {/* Header */}
        <header className="mb-10 md:mb-20">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <p className="text-warm-400 text-xs tracking-[0.3em] uppercase">
              legends.guide
            </p>
            <AuthButton />
          </div>
          <h1 className="text-[26px] md:text-5xl font-serif font-medium leading-tight tracking-tight">
            Guidance from history&apos;s legends.
          </h1>
        </header>

        {/* Rockefeller */}
        <div className="flex flex-col gap-6">
          {/* Portrait with voice preview */}
          <div className="relative">
            <Link href={`/chat/${rockefeller.slug}`} className="group block">
              <div className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden bg-warm-200">
                <Image
                  src={rockefeller.portrait}
                  alt={rockefeller.name}
                  fill
                  className="object-cover object-top grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              </div>
            </Link>

            {/* Voice preview button — overlaid on portrait */}
            <button
              onClick={playVoicePreview}
              disabled={isLoading}
              className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                isPlaying
                  ? "bg-ink-950 text-white scale-110"
                  : isLoading
                  ? "bg-white/90 text-warm-400 animate-pulse"
                  : "bg-white/90 text-ink-950 hover:bg-white hover:scale-105 active:scale-95"
              }`}
              aria-label={isPlaying ? "Stop voice preview" : "Hear their voice"}
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : isPlaying ? (
                <div className="flex items-end gap-[3px] h-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-white rounded-full waveform-bar"
                      style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : (
                <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Quote — shown when playing */}
          {isPlaying && (
            <p className="text-sm text-warm-500 italic leading-relaxed">
              &ldquo;{rockefeller.signatureQuote}&rdquo;
            </p>
          )}

          {/* Info */}
          <Link href={`/chat/${rockefeller.slug}`} className="group">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-serif font-medium mb-1 group-hover:text-gold-600 transition-colors duration-300">
                  {rockefeller.name}
                </h2>
                <p className="text-warm-400 text-sm">
                  {rockefeller.era}
                </p>
              </div>
              <div className="mt-1 w-10 h-10 rounded-full border border-warm-300 flex items-center justify-center group-hover:border-ink-950 group-hover:bg-ink-950 transition-all duration-300">
                <svg
                  className="w-4 h-4 text-warm-400 group-hover:text-white transition-colors duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <footer className="mt-24 text-warm-400 text-xs">
          Grounded in real biographies and primary sources.
        </footer>
      </div>
    </main>
  );
}
