import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check if user is using their own key or platform key
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userApiKey = formData.get("apiKey") as string | null;
    
    if (!file) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    }

    let apiKey = userApiKey;

    // If no user key, use platform key (requires auth + credits)
    if (!apiKey) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Authentication required for platform API" }, { status: 401 });
      }
      if (user.credits <= 0) {
        return NextResponse.json({ error: "Insufficient credits. Please purchase more minutes." }, { status: 402 });
      }
      apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Platform API key not configured" }, { status: 500 });
      }
    }

    // Forward to OpenAI Whisper
    const whisperFormData = new FormData();
    whisperFormData.append("file", file, "audio.mp3");
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("response_format", "verbose_json");

    const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperFormData,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: `Whisper API error: ${errText}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({
      text: data.text,
      duration: data.duration,
      language: data.language,
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
