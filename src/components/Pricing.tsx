"use client";

interface PricingProps {
  user: { email: string; credits: number } | null;
  onLoginClick: () => void;
}

const packages = [
  {
    minutes: 10,
    label: "Starter",
    price: 9.90,
    pricePerMin: 0.99,
    discount: 0,
    popular: false,
    icon: "🎯",
  },
  {
    minutes: 30,
    label: "Creator",
    price: 26.73,
    pricePerMin: 0.89,
    discount: 10,
    popular: true,
    icon: "🚀",
  },
  {
    minutes: 60,
    label: "Pro",
    price: 50.49,
    pricePerMin: 0.84,
    discount: 15,
    popular: false,
    icon: "⭐",
  },
  {
    minutes: 180,
    label: "Studio",
    price: 142.56,
    pricePerMin: 0.79,
    discount: 20,
    popular: false,
    icon: "🎬",
  },
];

export default function Pricing({ user, onLoginClick }: PricingProps) {
  const handleBuy = async (packageIndex: number) => {
    if (!user) {
      onLoginClick();
      return;
    }
    try {
      const resp = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageIndex }),
      });
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout");
      }
    } catch {
      alert("Network error. Please try again.");
    }
  };

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Simple <span className="gradient-text">Pay-Per-Use</span> Pricing
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            No subscriptions. No hidden fees. Buy minutes and use them whenever you want. They never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <div
              key={pkg.label}
              className={`relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "border-purple-500/50 glow-purple"
                  : "border-white/5 hover:border-white/10"
              }`}
              style={{
                background: pkg.popular
                  ? "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.05))"
                  : "rgba(26, 26, 46, 0.5)",
              }}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                     style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                  MOST POPULAR
                </div>
              )}
              <div className="text-center">
                <span className="text-3xl">{pkg.icon}</span>
                <h3 className="text-lg font-bold text-white mt-3">{pkg.label}</h3>
                <div className="text-sm text-gray-500 mt-1">{pkg.minutes} minutes</div>
                
                <div className="my-6">
                  <div className="text-3xl font-extrabold text-white">
                    ${pkg.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ${pkg.pricePerMin.toFixed(2)}/min
                  </div>
                  {pkg.discount > 0 && (
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      Save {pkg.discount}%
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleBuy(index)}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition hover:opacity-90 ${
                    pkg.popular
                      ? "text-white"
                      : "text-white bg-white/10 hover:bg-white/15"
                  }`}
                  style={
                    pkg.popular
                      ? { background: "linear-gradient(135deg, #7c3aed, #ec4899)" }
                      : undefined
                  }
                >
                  {user ? "Buy Credits" : "Sign In & Buy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BYO keys note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            🔑 Or use your own API keys for <strong className="text-gray-300">free</strong> — no account needed
          </p>
        </div>
      </div>
    </section>
  );
}
