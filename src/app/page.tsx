import { figures } from "@/lib/figures";
import FigureCard from "@/components/FigureCard";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            legends.guide
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl">
            Talk to history&apos;s greatest founders. Deeply researched
            personalities grounded in their real writings. Not a chatbot. An
            advisory board.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {figures.map((figure) => (
            <FigureCard key={figure.slug} figure={figure} />
          ))}
        </div>

        {/* Compare CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/compare"
            className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-8 py-4 transition-colors group"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-amber-900 to-yellow-950 border-2 border-black flex items-center justify-center text-white/50 text-xs font-serif">
                R
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-red-900 to-rose-950 border-2 border-black flex items-center justify-center text-white/50 text-xs font-serif">
                M
              </div>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white block">
                Compare Founders
              </span>
              <span className="text-xs text-zinc-500">
                Ask two legends the same question
              </span>
            </div>
            <svg
              className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors ml-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <footer className="mt-24 text-center text-zinc-700 text-xs">
          10 founders. Deeply researched. Grounded in real biographies.
        </footer>
      </div>
    </main>
  );
}
