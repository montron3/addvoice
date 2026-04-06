"use client";

import { useState } from "react";

interface NavbarProps {
  user: { email: string; credits: number } | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLoginClick, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5"
         style={{ background: "rgba(15, 15, 26, 0.85)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-extrabold gradient-text">AddVoice</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
            <a href="#translate" className="text-sm text-gray-400 hover:text-white transition">Translate</a>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {user.credits.toFixed(1)} min left
                </span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-300">{user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-gray-500 hover:text-gray-300 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 text-sm font-semibold rounded-xl text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition">How it works</a>
              <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
              <a href="#translate" className="text-sm text-gray-400 hover:text-white transition">Translate</a>
              {user ? (
                <>
                  <span className="text-xs text-gray-400">{user.email} • {user.credits.toFixed(1)} min</span>
                  <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white text-left">Logout</button>
                </>
              ) : (
                <button onClick={onLoginClick} className="text-sm font-semibold text-purple-400 text-left">Sign In</button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
