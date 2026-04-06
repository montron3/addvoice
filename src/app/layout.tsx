import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AddVoice - AI Video & Audio Translation for Creators",
  description: "Translate your YouTube videos and podcasts into any language with AI-powered transcription, translation, and voice synthesis. Pay per minute, no subscription.",
  keywords: "video translation, audio translation, YouTube dubbing, AI translation, voice synthesis, ElevenLabs, Whisper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
