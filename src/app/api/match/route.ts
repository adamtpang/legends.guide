import Anthropic from "@anthropic-ai/sdk";
import { figures, AI_CONFIG } from "@/lib/figures";
import { NextRequest } from "next/server";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return Response.json({ error: "Message required" }, { status: 400 });
  }

  // Build a concise legend catalog for the system prompt
  const catalog = figures
    .map(
      (f) =>
        `- ${f.slug}: ${f.name} (${f.era}) — domains: ${f.domains.join(", ")}. ${f.knownFor}`
    )
    .join("\n");

  const systemPrompt = `You are a routing assistant for legends.guide. Given a user's problem or question, pick the single best legend to mentor them.

Available legends:
${catalog}

Respond with ONLY valid JSON: {"slug": "<slug>", "reason": "<one compelling sentence explaining why this legend is the perfect mentor for this specific problem, referencing what they actually accomplished>"}

Rules:
- Pick the legend whose life experience most directly addresses the user's situation
- The reason should be compelling and specific, referencing what the legend actually did
- Never mention you are an AI or routing system
- Keep the reason under 120 characters`;

  try {
    const response = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text);

    // Validate slug exists
    const valid = figures.find((f) => f.slug === parsed.slug);
    if (!valid) throw new Error("Invalid slug");

    return Response.json(parsed);
  } catch {
    // Fallback to first figure
    return Response.json({
      slug: figures[0].slug,
      reason: "Let's start with a conversation.",
    });
  }
}
