export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎬</span>
              <span className="text-lg font-extrabold gradient-text">AddVoice</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered video and audio translation for content creators. 
              Reach a global audience with professional dubbing.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
            <div className="space-y-2">
              <a href="#how-it-works" className="block text-sm text-gray-500 hover:text-gray-300 transition">How it works</a>
              <a href="#pricing" className="block text-sm text-gray-500 hover:text-gray-300 transition">Pricing</a>
              <a href="#translate" className="block text-sm text-gray-500 hover:text-gray-300 transition">Translate</a>
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Powered By</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>OpenAI Whisper — Transcription</p>
              <p>GPT / DeepSeek — Translation</p>
              <p>ElevenLabs — Voice Synthesis</p>
              <p>FFmpeg.wasm — Audio Processing</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AddVoice. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Your API keys stay in your browser. We never store them.
          </p>
        </div>
      </div>
    </footer>
  );
}
