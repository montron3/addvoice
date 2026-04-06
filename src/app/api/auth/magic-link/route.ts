import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLinkEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Create user if not exists
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await prisma.user.create({ data: { email: normalizedEmail } });
    }

    // Create magic token
    const token = uuidv4();
    await prisma.magicToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send email
    await sendMagicLinkEmail(normalizedEmail, token);

    return NextResponse.json({ success: true, message: "Magic link sent! Check your email." });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}
