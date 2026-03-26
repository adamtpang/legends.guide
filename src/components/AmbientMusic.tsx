"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Map figure slugs to ambient music tracks
// Place mp3 files in /public/music/
// Home page uses "home" key
const MUSIC_MAP: Record<string, string> = {
  home: "/music/home-ambient.mp3",
  "john-d-rockefeller": "/music/american-industrial.mp3",
  "benjamin-franklin": "/music/colonial-american.mp3",
  "elon-musk": "/music/modern-electronic.mp3",
  "alexander-the-great": "/music/ancient-greek.mp3",
  "david-deutsch": "/music/modern-electronic.mp3",
  "lee-kuan-yew": "/music/east-asian.mp3",
};

interface AmbientMusicProps {
  trackKey: string;
  className?: string;
}

export default function AmbientMusic({ trackKey, className = "" }: AmbientMusicProps) {
  const [playing, setPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackUrl = MUSIC_MAP[trackKey];

  const toggleMusic = useCallback(() => {
    if (!audioRef.current || !trackUrl) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    setHasInteracted(true);
  }, [playing, trackUrl]);

  // Set up audio element
  useEffect(() => {
    if (!trackUrl) return;

    const audio = new Audio(trackUrl);
    audio.loop = true;
    audio.volume = 0.15; // Subtle ambient volume
    audio.preload = "none"; // Don't preload until user clicks
    audioRef.current = audio;

    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [trackUrl]);

  // Change track when trackKey changes
  useEffect(() => {
    if (audioRef.current && playing && trackUrl) {
      audioRef.current.src = trackUrl;
      audioRef.current.play().catch(() => setPlaying(false));
    }
  }, [trackUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!trackUrl) return null;

  return (
    <button
      onClick={toggleMusic}
      className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-all ${className}`}
      title={playing ? "Pause ambient music" : "Play ambient music"}
    >
      {playing ? (
        <>
          <div className="flex items-end gap-[2px] h-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-[2px] rounded-full bg-current animate-pulse"
                style={{
                  height: `${40 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
          <span className="opacity-60">Music</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="opacity-40">{hasInteracted ? "Paused" : "Music"}</span>
        </>
      )}
    </button>
  );
}
