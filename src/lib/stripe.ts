import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY not set - Stripe features will not work");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export const PRICE_PER_MINUTE_CENTS = parseInt(
  process.env.PRICE_PER_MINUTE_CENTS || "99",
  10
);

// Credit packages
export const CREDIT_PACKAGES = [
  { minutes: 10, label: "10 minutes", discount: 0 },
  { minutes: 30, label: "30 minutes", discount: 0.1 },
  { minutes: 60, label: "1 hour", discount: 0.15 },
  { minutes: 180, label: "3 hours", discount: 0.2 },
];

export function calculatePrice(minutes: number, discountPct: number = 0): number {
  const basePrice = minutes * PRICE_PER_MINUTE_CENTS;
  return Math.round(basePrice * (1 - discountPct));
}
