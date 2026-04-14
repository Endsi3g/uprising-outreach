import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      console.error("Eleven Labs API key is missing from environment variables.");
      return NextResponse.json({ error: "Eleven Labs API key is not configured" }, { status: 500 });
    }

    const client = new ElevenLabsClient({ apiKey });

    // Generate speech using the SDK
    const audioStream = await client.textToSpeech.convert(voiceId || "pNInz6obpgH7i7XbYedS", {
      text: text,
      modelId: "eleven_v3", // Corrected property name for SDK
    });

    // Return the audio stream directly to the client
    return new Response(audioStream as any, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("ElevenLabs API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate speech" },
      { status: 500 }
    );
  }
}
