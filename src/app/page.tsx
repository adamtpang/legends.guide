"use client";

import { figures } from "@/lib/figures";
import FigureCard from "@/components/FigureCard";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink-950 text-parchment-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12 bg-gold-500/40" />
            <span className="text-gold-400 text-xs font-medium tracking-[0.3em] uppercase">
              Est. MMXXVI
            </span>
            <div className="h-px w-12 bg-gold-500/40" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-6 text-parchment-50">
            legends.guide
          </h1>
          <p className="text-parchment-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Converse with history&apos;s greatest minds. Each personality deeply
            researched from their original writings, biographies, and documented
            principles.
          </p>
        </motion.header>

        {/* Founder Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
        >
          {figures.map((figure, i) => (
            <motion.div
              key={figure.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4 + i * 0.06,
                ease: "easeOut",
              }}
            >
              <FigureCard figure={figure} />
            </motion.div>
          ))}
        </motion.div>

        {/* Compare CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-20 text-center"
        >
          <Link
            href="/compare"
            className="group inline-flex items-center gap-4 border border-ink-700/60 hover:border-gold-500/40 rounded-xl px-8 py-5 transition-all duration-500 hover:bg-ink-900/50"
          >
            <div className="flex -space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-800/80 to-amber-950 border-2 border-ink-950 flex items-center justify-center text-parchment-200/40 text-xs font-serif">
                R
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-b from-red-800/80 to-red-950 border-2 border-ink-950 flex items-center justify-center text-parchment-200/40 text-xs font-serif">
                M
              </div>
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-parchment-100 block">
                Compare Founders
              </span>
              <span className="text-xs text-parchment-300/70">
                Ask two legends the same question, side by side
              </span>
            </div>
            <svg
              className="w-4 h-4 text-parchment-300/50 group-hover:text-gold-400 transition-colors duration-500 ml-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        <footer className="mt-28 text-center text-parchment-300/50 text-xs tracking-wide">
          10 founders. Grounded in real biographies and primary sources.
        </footer>
      </div>
    </main>
  );
}
