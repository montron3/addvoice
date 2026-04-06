import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { minutesUsed, fileType, targetLang, sourceLang } = await req.json();

    if (!minutesUsed || minutesUsed <= 0) {
      return NextResponse.json({ error: "Invalid usage" }, { status: 400 });
    }

    if (user.credits < minutesUsed) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Deduct credits and log usage
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: minutesUsed } },
      }),
      prisma.usage.create({
        data: {
          userId: user.id,
          minutesUsed,
          fileType: fileType || "audio",
          targetLang: targetLang || "en",
          sourceLang,
        },
      }),
    ]);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      success: true,
      remainingCredits: updatedUser?.credits ?? 0,
    });
  } catch (error) {
    console.error("Usage track error:", error);
    return NextResponse.json({ error: "Failed to track usage" }, { status: 500 });
  }
}
