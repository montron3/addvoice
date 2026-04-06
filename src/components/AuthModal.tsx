"use client";

import { useState } from "react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const resp = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setStatus("sent");
        onSuccess();
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 p-8 animate-slide-up"
        style={{ background: "linear-gradient(135deg, #1a1a2e, #252540)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          ✕
        </button>

        {status === "sent" ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✉️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              We sent a magic link to <strong className="text-white">{email}</strong>.
              Click it to sign in — no password needed!
            </p>
            <p className="text-xs text-gray-600">
              Link expires in 15 minutes. Check your spam folder if you don&apos;t see it.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎬</div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign In to AddVoice</h2>
              <p className="text-sm text-gray-400">
                Enter your email for a magic link — no password needed
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  required
                  autoFocus
                />
              </div>

              {status === "error" && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition hover:opacity-90 ${
                  status === "loading" ? "btn-loading" : ""
                }`}
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                Send Magic Link
              </button>
            </form>

            <p className="text-xs text-gray-600 text-center mt-6">
              By signing in, you agree to our Terms of Service. We only use your email for authentication.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
