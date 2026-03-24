import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { messages, figureName, era } = await req.json();

  if (!messages?.length || !figureName) {
    return Response.json({ error: "Missing messages or figureName" }, { status: 400 });
  }

  // Build a summary of the conversation for the curator
  const conversationText = messages
    .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 256,
    system: `You are a quote curator. Extract the single most shareable, standalone quote from this conversation with ${figureName}. The quote should make someone stop scrolling on X/Twitter — punchy, wise, and complete without context. Return ONLY the quote text, no attribution, no quote marks, nothing else. Max 180 characters. Strip any source citations like [Source: ...].`,
    messages: [
      { role: "user", content: conversationText },
    ],
  });

  const quote = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  return Response.json({ quote, figureName, era: era || "" });
}
