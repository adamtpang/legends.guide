"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  figureName: string;
  figureGradient?: string;
  figurePortrait?: string;
  isStreaming?: boolean;
  isSpeaking?: boolean;
}

function parseCitations(text: string): { body: string; citations: string[] } {
  const citationRegex = /\[Source:\s*"([^"]+)"\s*by\s*([^\]]+)\]/g;
  const citations: string[] = [];
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push(`${match[1]} by ${match[2]}`);
  }
  const body = text.replace(citationRegex, "").trim();
  return { body, citations };
}

export default function ChatMessage({
  role,
  content,
  figureName,
  figurePortrait,
  figureGradient,
  isStreaming,
  isSpeaking,
}: ChatMessageProps) {
  const { body, citations } =
    role === "assistant" && !isStreaming
      ? parseCitations(content)
      : { body: content, citations: [] };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-white/[0.08] rounded-2xl rounded-br-sm px-5 py-3.5">
          <p className="text-sm leading-relaxed text-warm-100 whitespace-pre-wrap">{body}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5">
      <div className="flex-shrink-0 pt-1">
        <div className={`w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 relative ${!figurePortrait ? `bg-gradient-to-b ${figureGradient || "from-amber-900 to-yellow-950"}` : ""}`}>
          {figurePortrait ? (
            <img src={figurePortrait} alt={figureName} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-[10px] font-serif">{figureName[0]}</div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-serif font-medium text-warm-400 uppercase tracking-wider">{figureName}</span>
          {isSpeaking && (
            <div className="flex items-end gap-[1.5px] h-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-[1.5px] bg-gold-500 rounded-full waveform-bar" style={{ height: "100%", animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
        </div>
        <div className="text-[15px] leading-[1.8] text-warm-200 whitespace-pre-wrap">
          {body}
          {isStreaming && <span className="inline-block w-[2px] h-[18px] bg-warm-300 ml-0.5 animate-pulse align-text-bottom" />}
        </div>

        {citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[10px] text-warm-500 uppercase tracking-widest mb-2">Sources</p>
            {citations.map((cite, i) => (
              <p key={i} className="text-xs text-warm-400 italic">{i + 1}. {cite}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
