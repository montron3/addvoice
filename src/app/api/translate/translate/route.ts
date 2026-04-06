import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, apiKey: userApiKey, provider } = await req.json();

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Text and target language required" }, { status: 400 });
    }

    let apiKey = userApiKey;
    let apiUrl = "https://api.deepseek.com/v1/chat/completions";
    let model = "deepseek-chat";

    if (provider === "openai") {
      apiUrl = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
    }

    // If no user key, use platform key
    if (!apiKey) {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (user.credits <= 0) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
      }
      // Platform uses OpenAI by default
      apiKey = process.env.OPENAI_API_KEY;
      apiUrl = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
      if (!apiKey) {
        return NextResponse.json({ error: "Platform API key not configured" }, { status: 500 });
      }
    }

    const systemPrompt = `You are a professional translator for YouTube content. Translate the following text naturally, maintaining a conversational tone appropriate for video narration. Target language: ${targetLanguage}. Return ONLY the translated text without any comments or explanations.`;

    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return NextResponse.json(
        { error: `Translation API error: ${errText}` },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({
      translation: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
