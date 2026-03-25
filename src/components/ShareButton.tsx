"use client";

import { useCallback, useState } from "react";

interface ShareButtonProps {
  quote: string;
  figureName: string;
  era: string;
  figureColor: string;
}

export default function ShareButton({ quote, figureName, era, figureColor }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateAndShare = useCallback(async () => {
    // Create a 1080x1920 vertical canvas (9:16 for stories/reels)
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle gradient accent at top
    const grad = ctx.createLinearGradient(0, 0, 0, 400);
    grad.addColorStop(0, figureColor + "20");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 400);

    // Quote marks
    ctx.fillStyle = figureColor;
    ctx.font = "bold 120px Georgia, serif";
    ctx.fillText("\u201C", 80, 600);

    // Quote text - word wrap
    ctx.fillStyle = "#ffffff";
    ctx.font = "36px Georgia, serif";
    const words = quote.split(" ");
    let line = "";
    let y = 660;
    const maxWidth = 920;
    const lineHeight = 56;

    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), 80, y);
        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 80, y);

    // Figure name
    y += lineHeight * 2;
    ctx.fillStyle = figureColor;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(figureName.toUpperCase(), 80, y);

    // Era
    y += 40;
    ctx.fillStyle = "#ffffff60";
    ctx.font = "22px system-ui, sans-serif";
    ctx.fillText(era, 80, y);

    // Branding at bottom
    ctx.fillStyle = "#ffffff30";
    ctx.font = "20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("legends.guide", 540, 1840);
    ctx.textAlign = "left";

    // Convert to blob and share
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `${figureName.toLowerCase().replace(/\s+/g, "-")}-wisdom.png`, { type: "image/png" });

      // Try native share (mobile)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `${figureName} on legends.guide`,
            text: `"${quote.slice(0, 100)}..." Talk to ${figureName} yourself at legends.guide`,
          });
          return;
        } catch {
          // User cancelled or share failed, fall through to clipboard
        }
      }

      // Fallback: copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Final fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${figureName.toLowerCase().replace(/\s+/g, "-")}-wisdom.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  }, [quote, figureName, era, figureColor]);

  return (
    <button
      onClick={generateAndShare}
      className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 transition-colors mt-1"
      title="Share this wisdom"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
      </svg>
      <span>{copied ? "Copied!" : "Share"}</span>
    </button>
  );
}
