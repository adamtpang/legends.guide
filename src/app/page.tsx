"use client";

import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthButton from "@/components/AuthButton";
import AmbientMusic from "@/components/AmbientMusic";

export default function Home() {
  const [query, setQuery] = useState("");
  const [matching, setMatching] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Play intro audio for a legend
  const playIntro = useCallback(async (slug: string, introLine: string) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }

    // If clicking the same one that's playing, just stop
    if (playingSlug === slug) {
      setPlayingSlug(null);
      return;
    }

    setLoadingSlug(slug);
    setPlayingSlug(null);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: introLine, figureSlug: slug }),
      });
      if (!res.ok) { setLoadingSlug(null); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlayingSlug(null); };
      audio.onerror = () => { setPlayingSlug(null); };
      setLoadingSlug(null);
      setPlayingSlug(slug);
      await audio.play();
    } catch {
      setLoadingSlug(null);
      setPlayingSlug(null);
    }
  }, [playingSlug]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  // Handle Stripe redirect back
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setShowPurchaseSuccess(true);
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || matching) return;

    setMatching(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query.trim() }),
      });
      const data = await res.json();
      router.push(
        `/chat/${data.slug}?reason=${encodeURIComponent(data.reason)}&q=${encodeURIComponent(query.trim())}`
      );
    } catch {
      setMatching(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 text-ink-950">
      <div className="max-w-2xl mx-auto px-6 pt-8 md:pt-14 pb-8">
        {/* Header */}
        <header className="mb-6 md:mb-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <p className="text-warm-400 text-xs tracking-[0.3em] uppercase">
              legends.guide
            </p>
            <AuthButton />
          </div>
          <h1 className="text-[26px] md:text-5xl font-serif font-medium leading-tight tracking-tight mb-4">
            Guidance from humanity&apos;s legends.
          </h1>
          <p className="text-warm-500 text-sm md:text-base">
            Describe what you&apos;re working through. We&apos;ll match you with
            the right mentor.
          </p>
        </header>

        {/* Find your mentor */}
        <form onSubmit={handleMatch} className="mb-8 md:mb-12">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I'm struggling with..."
              disabled={matching}
              className="w-full bg-white border border-warm-200 rounded-2xl px-5 py-4 pr-14 text-ink-950 text-base placeholder:text-warm-400 focus:outline-none focus:border-ink-950 focus:ring-1 focus:ring-ink-950 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!query.trim() || matching}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink-950 text-white flex items-center justify-center disabled:opacity-20 hover:bg-ink-800 active:scale-95 transition-all"
            >
              {matching ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Legend grid */}
        <section>
          <h2 className="text-warm-400 text-xs tracking-[0.2em] uppercase mb-6">
            Or choose a legend
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {figures.map((figure, idx) => (
              <div key={figure.slug} className="group">
                <Link
                  href={`/chat/${figure.slug}`}
                  className="block"
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-warm-200 mb-2">
                    <Image
                      src={figure.portrait}
                      alt={figure.name}
                      fill
                      className="object-cover object-top grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white text-sm font-medium leading-tight">
                        {figure.name}
                      </h3>
                      <p className="text-white/60 text-[10px] mt-0.5">
                        {figure.era} &middot; {figure.location}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-start justify-between gap-1">
                  <Link href={`/chat/${figure.slug}`} className="flex-1 min-w-0">
                    <p className="text-warm-500 text-xs leading-relaxed line-clamp-2">
                      {figure.knownFor}
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      playIntro(figure.slug, figure.introLine);
                    }}
                    className="shrink-0 w-7 h-7 rounded-full bg-ink-950/5 hover:bg-ink-950/10 flex items-center justify-center transition-all mt-0.5"
                    title={`Hear ${figure.name} introduce themselves`}
                  >
                    {loadingSlug === figure.slug ? (
                      <svg className="w-3 h-3 animate-spin text-ink-950/40" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : playingSlug === figure.slug ? (
                      <svg className="w-3 h-3 text-ink-950/60" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-ink-950/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 flex items-center justify-between text-warm-400 text-xs">
          <span>Grounded in real biographies and primary sources.</span>
          <AmbientMusic trackKey="home" className="text-warm-400" />
        </footer>
      </div>

      {/* Purchase success modal */}
      {showPurchaseSuccess && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-medium text-ink-950 mb-2">
              Welcome back
            </h2>
            <p className="text-warm-500 text-sm mb-2">
              100 credits have been added to your account.
            </p>
            <p className="text-warm-400 text-xs mb-6">
              Continue your conversations with any legend.
            </p>
            <button
              onClick={() => setShowPurchaseSuccess(false)}
              className="w-full bg-ink-950 text-white rounded-full py-3 px-6 text-sm font-medium hover:bg-ink-800 transition-colors"
            >
              Start chatting
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
