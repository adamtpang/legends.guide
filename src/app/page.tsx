"use client";

import { figures } from "@/lib/figures";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const rockefeller = figures[0];

  return (
    <main className="min-h-screen bg-ink-950 text-parchment-100">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        {/* Hero */}
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
            Deeply researched conversations with history&apos;s greatest minds.
            Grounded in real biographies. Cited sources. Their voice.
          </p>
        </motion.header>

        {/* Rockefeller Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href={`/chat/${rockefeller.slug}`}>
            <div className="group relative bg-ink-900/40 border border-ink-700/30 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_60px_rgba(201,168,76,0.08)]">
              <div className="flex flex-col md:flex-row">
                {/* Portrait */}
                <div className="relative w-full md:w-80 aspect-[3/4] md:aspect-auto md:min-h-[420px] flex-shrink-0 overflow-hidden">
                  <Image
                    src={rockefeller.portrait}
                    alt={rockefeller.name}
                    fill
                    className="object-cover object-top grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 320px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-ink-950/80 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent md:hidden" />
                </div>

                {/* Info */}
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                  <p className="text-[10px] text-gold-500/70 tracking-[0.3em] uppercase mb-3 font-medium">
                    {rockefeller.era}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-serif font-medium text-parchment-50 mb-4 group-hover:text-gold-400 transition-colors duration-500">
                    {rockefeller.name}
                  </h2>
                  <p className="text-parchment-300/70 text-sm leading-relaxed mb-6">
                    {rockefeller.hook}
                  </p>
                  <p className="text-parchment-300/50 text-xs leading-relaxed mb-8 italic">
                    &ldquo;The secret of success is to do the common things uncommonly well.&rdquo;
                  </p>

                  <div className="flex items-center gap-2 text-gold-400/80 text-sm group-hover:text-gold-400 transition-colors duration-300">
                    <span className="font-medium">Start conversation</span>
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Source badge */}
                  <div className="mt-6 flex items-center gap-1.5 text-parchment-300/30 text-[10px] tracking-wider uppercase">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Sourced from Titan by Ron Chernow</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-parchment-300/30 text-xs tracking-wider uppercase mb-4">
            Coming soon
          </p>
          <div className="flex justify-center gap-6 text-parchment-300/20 text-sm font-serif">
            <span>Steve Jobs</span>
            <span>&middot;</span>
            <span>Jeff Bezos</span>
            <span>&middot;</span>
            <span>Charlie Munger</span>
            <span>&middot;</span>
            <span>Benjamin Franklin</span>
          </div>
        </motion.div>

        <footer className="mt-24 text-center text-parchment-300/40 text-xs tracking-wide">
          Grounded in real biographies and primary sources.
        </footer>
      </div>
    </main>
  );
}
