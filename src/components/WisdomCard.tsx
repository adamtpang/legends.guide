"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface WisdomCardProps {
  quote: string;
  figureName: string;
  era: string;
  figureSlug: string;
  figureColor: string;
  onDismiss: () => void;
}

// Draw the wisdom card on a canvas
function drawCard(
  canvas: HTMLCanvasElement,
  quote: string,
  figureName: string,
  era: string,
  color: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1200;
  const H = 675;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#0C0B09";
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 12);
  ctx.fill();

  // Accent bar at top
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, 4);

  // Subtle radial glow from top-right
  const glow = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, 400);
  glow.addColorStop(0, color + "1A"); // 10% opacity
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Large quotation mark
  ctx.font = "200px Georgia";
  ctx.fillStyle = color + "33"; // 20% opacity
  ctx.fillText("\u201C", 50, 180);

  // Quote text — word wrapping
  ctx.font = "italic 36px Georgia";
  ctx.fillStyle = "#F5F3EE";
  ctx.textBaseline = "top";

  const maxWidth = W - 160;
  const lineHeight = 52;
  const words = quote.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Center the block vertically
  const totalTextHeight = lines.length * lineHeight;
  const startY = Math.max(200, (H - totalTextHeight - 100) / 2);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 80, startY + i * lineHeight);
  }

  // Separator line
  const sepY = startY + lines.length * lineHeight + 40;
  ctx.strokeStyle = color + "40"; // 25% opacity
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, sepY);
  ctx.lineTo(W - 80, sepY);
  ctx.stroke();

  // Figure name — uppercase
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = color;
  ctx.letterSpacing = "2px";
  ctx.fillText(figureName.toUpperCase(), 80, sepY + 30);

  // Era
  ctx.font = "22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#8A8880";
  ctx.letterSpacing = "0px";
  ctx.fillText(era, 80, sepY + 60);

  // Branding
  ctx.font = "24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#5A5850";
  ctx.textAlign = "right";
  ctx.fillText("legends.guide", W - 60, H - 40);
  ctx.textAlign = "left";
}

export default function WisdomCard({
  quote,
  figureName,
  era,
  figureSlug,
  figureColor,
  onDismiss,
}: WisdomCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      drawCard(canvasRef.current, quote, figureName, era, figureColor);
    }
  }, [quote, figureName, era, figureColor]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${figureSlug}-wisdom.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    console.log("wisdom_card_downloaded", { figure: figureName });
  }, [figureSlug, figureName]);

  const handleCopyForX = useCallback(() => {
    const shareText = `"${quote}"\n\n— ${figureName} on legends.guide\n\nTalk to ${figureName} yourself: https://legends.guide/chat/${figureSlug}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    console.log("wisdom_card_copied", { figure: figureName });
  }, [quote, figureName, figureSlug]);

  const handleShareToX = useCallback(() => {
    const shareText = `"${quote}"\n\n— ${figureName} on @legendsguide`;
    const figureUrl = `https://legends.guide/chat/${figureSlug}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(figureUrl)}`;
    window.open(url, "_blank");
    console.log("wisdom_card_shared_x", { figure: figureName });
  }, [quote, figureName, figureSlug]);

  console.log("wisdom_card_shown", { figure: figureName });

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute bottom-0 left-0 right-0 z-40 bg-ink-950/95 backdrop-blur-md border-t border-white/10 rounded-t-2xl p-5 pb-8"
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Share this wisdom</p>

      {/* Canvas card preview */}
      <div className="w-full max-w-md mx-auto mb-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg"
          style={{ aspectRatio: "1200 / 675" }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 max-w-md mx-auto">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full py-3 px-4 transition-all min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Save
        </button>

        <button
          onClick={handleCopyForX}
          className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full py-3 px-4 transition-all min-h-[44px]"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>

        <button
          onClick={handleShareToX}
          className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-ink-950 text-sm font-medium rounded-full py-3 px-4 transition-all min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share
        </button>
      </div>
    </motion.div>
  );
}
