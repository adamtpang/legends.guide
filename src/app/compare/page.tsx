"use client";

import { useState, useRef, useEffect } from "react";
import { figures } from "@/lib/figures";
import Link from "next/link";

interface CompareResponse {
  content: string;
  isStreaming: boolean;
  done: boolean;
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

async function streamResponse(
  figureSlug: string,
  question: string,
  onText: (text: string) => void,
  onDone: () => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      figure: figureSlug,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch");
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No reader");

  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) onText(parsed.text);
        } catch {
          // skip
        }
      }
    }
  }

  onDone();
}

function ResponsePanel({
  figure,
  response,
}: {
  figure: (typeof figures)[0];
  response: CompareResponse;
}) {
  const { body, citations } = response.done
    ? parseCitations(response.content)
    : { body: response.content, citations: [] };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-b ${figure.gradient} flex items-center justify-center text-white/50 text-sm font-serif shrink-0`}
        >
          {figure.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{figure.name}</h3>
          <p className="text-xs text-zinc-600">{figure.era}</p>
        </div>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 min-h-[200px]">
        {response.content ? (
          <>
            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
              {body}
              {response.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-zinc-400 ml-0.5 animate-pulse" />
              )}
            </div>
            {citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
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
          </>
        ) : response.isStreaming ? (
          <div className="flex gap-1 items-center text-zinc-600 py-8 justify-center">
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <p className="text-zinc-600 text-sm text-center py-8">
            Response will appear here
          </p>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [left, setLeft] = useState(figures[0].slug);
  const [right, setRight] = useState(figures[1].slug);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [leftResponse, setLeftResponse] = useState<CompareResponse>({
    content: "",
    isStreaming: false,
    done: false,
  });
  const [rightResponse, setRightResponse] = useState<CompareResponse>({
    content: "",
    isStreaming: false,
    done: false,
  });
  const resultsRef = useRef<HTMLDivElement>(null);

  const leftFigure = figures.find((f) => f.slug === left)!;
  const rightFigure = figures.find((f) => f.slug === right)!;

  useEffect(() => {
    if (leftResponse.isStreaming || rightResponse.isStreaming) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [leftResponse.content, rightResponse.content, leftResponse.isStreaming, rightResponse.isStreaming]);

  const askBoth = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setLeftResponse({ content: "", isStreaming: true, done: false });
    setRightResponse({ content: "", isStreaming: true, done: false });

    let leftAcc = "";
    let rightAcc = "";

    await Promise.all([
      streamResponse(
        left,
        trimmed,
        (text) => {
          leftAcc += text;
          setLeftResponse({ content: leftAcc, isStreaming: true, done: false });
        },
        () => {
          setLeftResponse({ content: leftAcc, isStreaming: false, done: true });
        }
      ).catch(() => {
        setLeftResponse({
          content: "Something went wrong. Try again.",
          isStreaming: false,
          done: true,
        });
      }),
      streamResponse(
        right,
        trimmed,
        (text) => {
          rightAcc += text;
          setRightResponse({
            content: rightAcc,
            isStreaming: true,
            done: false,
          });
        },
        () => {
          setRightResponse({
            content: rightAcc,
            isStreaming: false,
            done: true,
          });
        }
      ).catch(() => {
        setRightResponse({
          content: "Something went wrong. Try again.",
          isStreaming: false,
          done: true,
        });
      }),
    ]);

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askBoth();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link
            href="/"
            className="text-zinc-600 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Compare Founders
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Ask the same question to two legends. See how different minds
              approach the same problem.
            </p>
          </div>
        </div>

        {/* Selector Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
              Founder 1
            </label>
            <select
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer"
            >
              {figures.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-center pb-3">
            <span className="text-zinc-600 text-lg font-light">vs</span>
          </div>
          <div className="flex-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
              Founder 2
            </label>
            <select
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer"
            >
              {figures.map((f) => (
                <option key={f.slug} value={f.slug}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Input */}
        <div className="flex gap-3 mb-10">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask both founders the same question..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={askBoth}
            disabled={loading || !question.trim()}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed self-end"
          >
            {loading ? "Thinking..." : "Compare"}
          </button>
        </div>

        {/* Response Panels */}
        <div ref={resultsRef} className="flex flex-col md:flex-row gap-6">
          <ResponsePanel figure={leftFigure} response={leftResponse} />
          <ResponsePanel figure={rightFigure} response={rightResponse} />
        </div>
      </div>
    </div>
  );
}
