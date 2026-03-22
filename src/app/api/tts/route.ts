import { ElevenLabsClient } from "elevenlabs";
import { NextRequest } from "next/server";

// Rockefeller voice: use a deep, authoritative, older male voice
// We'll use "Daniel" (British deep) or similar. Can be swapped for a custom clone.
const ROCKEFELLER_VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel - deep, measured, authoritative

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return Response.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Limit text length to control costs
    const trimmedText = text.slice(0, 2000);

    const audioStream = await client.textToSpeech.convert(
      ROCKEFELLER_VOICE_ID,
      {
        text: trimmedText,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
        },
      }
    );

    // Collect the stream into a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    const message = error instanceof Error ? error.message : "TTS failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
