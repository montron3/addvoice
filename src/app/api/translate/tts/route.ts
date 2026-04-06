import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, apiKey: userApiKey } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    let apiKey = userApiKey;
    const voice = voiceId || "21m00Tcm4TlvDq8ikWAM"; // Rachel default

    if (!apiKey) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (user.credits <= 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
      }
      apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Platform API key not configured" }, { status: 500 });
      }
    }

    const resp = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: `ElevenLabs error: ${errText}` },
        { status: resp.status }
      );
    }

    const audioBuffer = await resp.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": "attachment; filename=translated_audio.mp3",
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
