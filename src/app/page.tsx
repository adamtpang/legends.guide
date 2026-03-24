"use client";

import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const [query, setQuery] = useState("");
  const [matching, setMatching] = useState(false);
  const router = useRouter();

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
        `/chat/${data.slug}?reason=${encodeURIComponent(data.reason)}`
      );
    } catch {
      setMatching(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 text-ink-950">
      <div className="max-w-2xl mx-auto px-6 pt-12 md:pt-24 pb-12">
        {/* Header */}
        <header className="mb-12 md:mb-20">
          <div className="flex items-center justify-between mb-6 md:mb-10">
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
        <form onSubmit={handleMatch} className="mb-16 md:mb-24">
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
          <p className="text-warm-400 text-xs tracking-[0.2em] uppercase mb-6">
            Or choose a legend
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {figures.map((figure) => (
              <Link
                key={figure.slug}
                href={`/chat/${figure.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-warm-200 mb-3">
                  <Image
                    src={figure.portrait}
                    alt={figure.name}
                    fill
                    className="object-cover object-top grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white text-sm font-medium leading-tight">
                      {figure.name}
                    </h3>
                    <p className="text-white/60 text-xs mt-0.5">
                      {figure.era}
                    </p>
                  </div>
                </div>
                <p className="text-warm-500 text-xs leading-relaxed line-clamp-2">
                  {figure.knownFor}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-24 text-warm-400 text-xs">
          Grounded in real biographies and primary sources.
        </footer>
      </div>
    </main>
  );
}
