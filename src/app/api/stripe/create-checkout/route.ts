import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe, CREDIT_PACKAGES, calculatePrice } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { packageIndex } = await req.json();
    const pkg = CREDIT_PACKAGES[packageIndex];
    if (!pkg) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const amountCents = calculatePrice(pkg.minutes, pkg.discount);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amountCents,
        minutes: pkg.minutes,
        status: "pending",
      },
    });

    const baseUrl = process.env.MAGIC_LINK_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AddVoice - ${pkg.label}`,
              description: `${pkg.minutes} minutes of AI video/audio translation`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?payment=cancelled`,
      metadata: {
        transactionId: transaction.id,
        userId: user.id,
        minutes: pkg.minutes.toString(),
      },
    });

    // Update transaction with stripe session ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
