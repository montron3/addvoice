export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "📁",
      title: "Upload Your File",
      description: "Drop your video (MP4, MOV) or audio file (MP3, WAV). We handle files up to 500MB.",
      color: "#7c3aed",
    },
    {
      num: "02",
      icon: "🎯",
      title: "Choose Your Language",
      description: "Pick from 16+ languages. Our AI detects the source language automatically.",
      color: "#ec4899",
    },
    {
      num: "03",
      icon: "🤖",
      title: "AI Does The Work",
      description: "Whisper transcribes → AI translates naturally → ElevenLabs generates the voice.",
      color: "#f59e0b",
    },
    {
      num: "04",
      icon: "🎬",
      title: "Download & Publish",
      description: "Get your translated video with the new audio track, ready to upload to YouTube.",
      color: "#10b981",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Four simple steps to reach a global audience. No technical skills needed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group relative p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(26, 26, 46, 0.5)" }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at top left, ${step.color}10, transparent 70%)`,
                }}
              />
              <div className="relative">
                <span className="text-xs font-bold text-gray-600 tracking-widest">{step.num}</span>
                <div className="text-3xl mt-3 mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two modes explanation */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-purple-500/20" style={{ background: "rgba(124, 58, 237, 0.05)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔑</span>
              <h3 className="text-lg font-bold text-white">Bring Your Own Keys</h3>
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">FREE</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Use your own OpenAI, DeepSeek, and ElevenLabs API keys. You only pay what the providers charge.
              No account needed, no middleman fees. Everything runs in your browser.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-pink-500/20" style={{ background: "rgba(236, 72, 153, 0.05)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚡</span>
              <h3 className="text-lg font-bold text-white">Use Our API</h3>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-semibold">PAY-PER-USE</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Don&apos;t have API keys? No problem. Use our infrastructure at $0.99/minute.
              No subscriptions. Sign in with email, buy credits, and start translating instantly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
