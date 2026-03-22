"use client";

import Link from "next/link";
import Image from "next/image";
import type { Figure } from "@/lib/figures";
import { useState } from "react";

export default function FigureCard({ figure }: { figure: Figure }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/chat/${figure.slug}`}>
      <div className="group relative bg-ink-900/40 border border-ink-700/30 rounded-xl overflow-hidden hover:border-gold-500/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_rgba(201,168,76,0.06)]">
        <div className="aspect-[3/4] relative overflow-hidden">
          {/* Portrait image or gradient fallback */}
          {figure.portrait && !imgError ? (
            <>
              <Image
                src={figure.portrait}
                alt={figure.name}
                fill
                className="object-cover object-top grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                onError={() => setImgError(true)}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20 z-10" />
            </>
          ) : (
            <>
              <div className={`absolute inset-0 bg-gradient-to-b ${figure.gradient}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent z-10" />
              <div className="absolute inset-0 flex items-center justify-center text-white/[0.12] text-8xl font-serif select-none group-hover:text-white/[0.18] transition-colors duration-700 z-[5]">
                {figure.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            </>
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_60%,rgba(16,14,11,0.8))] z-10" />
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
          <h2 className="text-base font-serif font-medium text-parchment-50 mb-1 group-hover:text-gold-400 transition-colors duration-500">
            {figure.name}
          </h2>
          <p className="text-[10px] text-gold-500/60 tracking-wider uppercase mb-2.5 font-medium">
            {figure.era}
          </p>
          <p className="text-xs text-parchment-300/60 leading-relaxed line-clamp-2 group-hover:text-parchment-300/80 transition-colors duration-500">
            {figure.hook}
          </p>
        </div>
      </div>
    </Link>
  );
}
