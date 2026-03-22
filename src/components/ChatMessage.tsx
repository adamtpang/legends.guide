interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  figureName: string;
  isStreaming?: boolean;
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
  isStreaming,
}: ChatMessageProps) {
  const { body, citations } =
    role === "assistant" && !isStreaming
      ? parseCitations(content)
      : { body: content, citations: [] };

  return (
    <div
      className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] ${
          role === "user"
            ? "bg-zinc-800 text-white rounded-2xl rounded-br-sm px-4 py-3"
            : "text-zinc-200"
        }`}
      >
        {role === "assistant" && (
          <div className="mb-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {figureName}
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {body}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-0.5 animate-pulse" />
          )}
        </div>
        {citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-800">
            {citations.map((cite, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-zinc-500"
              >
                <svg
                  className="w-3 h-3 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>{cite}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
