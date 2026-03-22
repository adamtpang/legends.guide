"use client";

import Link from "next/link";
import type { Figure } from "@/lib/figures";

export default function FigureCard({ figure }: { figure: Figure }) {
  return (
    <Link href={`/chat/${figure.slug}`}>
      <div className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-600 transition-all duration-300 cursor-pointer">
        <div className={`aspect-[3/4] bg-gradient-to-b ${figure.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center text-white/10 text-8xl font-serif select-none">
            {figure.name.split(" ").map(n => n[0]).join("")}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <h2 className="text-lg font-semibold text-white mb-1">
            {figure.name}
          </h2>
          <p className="text-xs text-zinc-500 mb-2">{figure.era}</p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {figure.hook}
          </p>
        </div>
      </div>
    </Link>
  );
}
