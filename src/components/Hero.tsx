export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-48 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400 font-medium">AI-Powered Video Translation</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}>
          <span className="text-white">Translate Your </span>
          <span className="gradient-text">Videos</span>
          <br />
          <span className="text-white">Into Any </span>
          <span className="gradient-text">Language</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
           style={{ animationDelay: "0.2s" }}>
          Upload your video or audio, choose a language, and get a professionally dubbed version in minutes. 
          Perfect for <strong className="text-white">YouTubers</strong>, <strong className="text-white">podcasters</strong>, 
          and <strong className="text-white">content creators</strong>.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
             style={{ animationDelay: "0.3s" }}>
          <a
            href="#translate"
            className="px-8 py-4 rounded-2xl font-bold text-white text-lg transition hover:opacity-90 hover:scale-105 glow-purple"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            Start Translating — Free →
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-2xl font-semibold text-gray-300 border border-white/10 hover:border-white/20 hover:bg-white/5 transition text-lg"
          >
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-slide-up"
             style={{ animationDelay: "0.4s" }}>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">16+</div>
            <div className="text-xs text-gray-500 mt-1">Languages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">$0.99</div>
            <div className="text-xs text-gray-500 mt-1">Per Minute</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-gray-500 mt-1">Subscriptions</div>
          </div>
        </div>
      </div>
    </section>
  );
}
