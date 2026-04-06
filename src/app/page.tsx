"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import TranslationTool from "@/components/TranslationTool";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

interface User {
  email: string;
  credits: number;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const resp = await fetch("/api/auth/me");
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch {
      // Not authenticated
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Check for authentication redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("authenticated") === "true") {
      fetchUser();
      // Clean URL
      window.history.replaceState({}, "", "/");
    }
    if (params.get("payment") === "success") {
      fetchUser();
      window.history.replaceState({}, "", "/");
    }
  }, [fetchUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <main className="min-h-screen">
      <Navbar
        user={user}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />
      <Hero />
      <HowItWorks />
      <Pricing user={user} onLoginClick={() => setAuthModalOpen(true)} />
      <TranslationTool user={user} onLoginClick={() => setAuthModalOpen(true)} />
      <Footer />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Modal will show "check email" state
        }}
      />
    </main>
  );
}
