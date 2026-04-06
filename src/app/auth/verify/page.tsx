"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token provided");
      return;
    }

    // The API route handles verification and redirects on success
    // This page is shown if something goes wrong
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, { redirect: "manual" })
      .then((res) => {
        if (res.type === "opaqueredirect" || res.status === 302 || res.redirected) {
          setStatus("success");
          setMessage("Verified! Redirecting...");
          window.location.href = "/?authenticated=true";
        } else {
          return res.json().then((data) => {
            setStatus("error");
            setMessage(data.error || "Verification failed");
          });
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
      <div className="text-center p-8 rounded-2xl" style={{ background: '#1a1a2e', maxWidth: 400 }}>
        {status === "loading" && (
          <>
            <div className="text-4xl mb-4">🔄</div>
            <h1 className="text-xl font-bold text-white mb-2">Verifying your link...</h1>
            <p className="text-gray-400">Please wait a moment</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-white mb-2">You&apos;re in!</h1>
            <p className="text-gray-400">Redirecting to AddVoice...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-gray-400 mb-4">{message}</p>
            <a
              href="/"
              className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              Back to AddVoice
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
