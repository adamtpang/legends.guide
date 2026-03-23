"use client";

import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const rockefeller = figures[0];

  return (
    <main className="min-h-screen bg-warm-50 text-ink-950">
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <header className="mb-20">
          <p className="text-warm-400 text-xs tracking-[0.3em] uppercase mb-8">
            legends.guide
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-tight">
            Speak with history&apos;s
            <br />
            greatest minds.
          </h1>
        </header>

        {/* Rockefeller */}
        <Link href={`/chat/${rockefeller.slug}`} className="group block">
          <div className="flex flex-col gap-8">
            {/* Portrait */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-warm-200">
              <Image
                src={rockefeller.portrait}
                alt={rockefeller.name}
                fill
                className="object-cover object-top grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 672px"
                priority
              />
            </div>

            {/* Info */}
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
          </div>
        </Link>

        <footer className="mt-24 text-warm-400 text-xs">
          Grounded in real biographies and primary sources.
        </footer>
      </div>
    </main>
  );
}
