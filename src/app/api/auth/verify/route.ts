import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, getAuthCookieOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!magicToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    if (magicToken.used) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }

    if (new Date() > magicToken.expiresAt) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // Mark as used
    await prisma.magicToken.update({
      where: { id: magicToken.id },
      data: { used: true },
    });

    // Create JWT
    const jwt = signToken({
      userId: magicToken.user.id,
      email: magicToken.user.email,
    });

    const cookieOptions = getAuthCookieOptions();
    const response = NextResponse.redirect(new URL("/?authenticated=true", req.url));
    response.cookies.set(cookieOptions.name, jwt, cookieOptions);

    return response;
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
