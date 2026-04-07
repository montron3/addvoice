"use client";

import { useState, useRef, useCallback } from "react";
import { SUPPORTED_LANGUAGES, DEFAULT_VOICE_ID, ELEVENLABS_CHUNK_SIZE } from "@/lib/constants";

interface TranslationToolProps {
  user: { email: string; credits: number } | null;
  onLoginClick: () => void;
}

type Mode = "byokeys" | "platform";
type Step = "idle" | "extracting" | "transcribing" | "translating" | "generating-voice" | "composing" | "done" | "error";

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error" | "warning";
}

export default function TranslationTool({ user, onLoginClick }: TranslationToolProps) {
  const [mode, setMode] = useState<Mode>("byokeys");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [targetLang, setTargetLang] = useState("en");
  const [step, setStep] = useState<Step>("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);

  // BYO Keys
  const [whisperKey, setWhisperKey] = useState("");
  const [deepseekKey, setDeepseekKey] = useState("");
  const [elevenKey, setElevenKey] = useState("");
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE_ID);
  const [translationProvider, setTranslationProvider] = useState<"deepseek" | "openai">("openai");

  // Results
  const [transcriptionText, setTranscriptionText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [ttsAudioBlob, setTtsAudioBlob] = useState<Blob | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logAreaRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const entry: LogEntry = {
      time: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, entry]);
    setTimeout(() => {
      logAreaRef.current?.scrollTo({ top: logAreaRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  // File handling
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  }, []);

  const isVideo = file?.type.startsWith("video/");

  // FFmpeg helpers
  const loadFFmpeg = async () => {
    const w = window as unknown as Record<string, unknown>;
    if (w._ffmpegInstance) return w._ffmpegInstance as { exec: (args: string[]) => Promise<void>; FS: (op: string, ...args: unknown[]) => unknown };

    addLog("Loading FFmpeg.wasm for audio processing...");

    // Load scripts if not already loaded
    if (!w.FFmpegWASM) {
      await loadScript("https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js");
      await loadScript("https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js");
    }

    const FFmpegWASM = w.FFmpegWASM as { FFmpeg: new () => { load: (opts: Record<string, string>) => Promise<void>; exec: (args: string[]) => Promise<void>; FS: (op: string, ...args: unknown[]) => unknown } };
    const ffmpeg = new FFmpegWASM.FFmpeg();
    await ffmpeg.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm",
    });
    w._ffmpegInstance = ffmpeg;
    addLog("FFmpeg.wasm ready", "success");
    return ffmpeg;
  };

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Extract audio from file
  const extractAudio = async (file: File) => {
    const ffmpeg = await loadFFmpeg();
    const ext = file.name.split(".").pop() || "mp4";
    const inputName = `input.${ext}`;
    const audioOutput = "audio_extracted.mp3";
    const fileData = new Uint8Array(await file.arrayBuffer());
    ffmpeg.FS("writeFile", inputName, fileData);
    await ffmpeg.exec(["-i", inputName, "-q:a", "2", "-acodec", "libmp3lame", audioOutput]);
    const audioData = ffmpeg.FS("readFile", audioOutput) as Uint8Array;
    const audioBlob = new Blob([new Uint8Array(audioData)], { type: "audio/mpeg" });
    ffmpeg.FS("unlink", inputName);
    ffmpeg.FS("unlink", audioOutput);
    return audioBlob;
  };

  // Transcribe
  const transcribe = async (audioBlob: Blob): Promise<{ text: string; duration: number }> => {
    if (mode === "byokeys") {
      // Direct API call from browser
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");
      formData.append("model", "whisper-1");
      formData.append("response_format", "verbose_json");
      const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${whisperKey}` },
        body: formData,
      });
      if (!resp.ok) throw new Error(`Whisper API error: ${resp.status}`);
      const data = await resp.json();
      return { text: data.text, duration: data.duration || 0 };
    } else {
      // Through our API
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.mp3");
      const resp = await fetch("/api/translate/transcribe", {
        method: "POST",
        body: formData,
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Transcription failed");
      }
      const data = await resp.json();
      return { text: data.text, duration: data.duration || 0 };
    }
  };

  // Translate
  const translate = async (text: string, targetLanguage: string): Promise<string> => {
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage);
    const langName = langObj?.name || targetLanguage;

    if (mode === "byokeys") {
      const apiKey = translationProvider === "openai" ? whisperKey : deepseekKey;
      const apiUrl = translationProvider === "openai"
        ? "https://api.openai.com/v1/chat/completions"
        : "https://api.deepseek.com/v1/chat/completions";
      const model = translationProvider === "openai" ? "gpt-4o-mini" : "deepseek-chat";

      const systemPrompt = `You are a professional translator for YouTube content. Translate the following text naturally, maintaining a conversational tone appropriate for video narration. Target language: ${langName}. Return ONLY the translated text without any comments or explanations.`;

      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.3,
          max_tokens: 8000,
        }),
      });
      if (!resp.ok) throw new Error(`Translation API error: ${resp.status}`);
      const data = await resp.json();
      return data.choices[0].message.content;
    } else {
      const resp = await fetch("/api/translate/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: langName }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Translation failed");
      }
      const data = await resp.json();
      return data.translation;
    }
  };

  // TTS with chunking
  const generateTTS = async (text: string): Promise<Blob> => {
    const chunks = splitTextIntoChunks(text, ELEVENLABS_CHUNK_SIZE);
    addLog(`Split into ${chunks.length} chunk(s) for voice synthesis`);

    const audioBlobs: Blob[] = [];
    for (let i = 0; i < chunks.length; i++) {
      addLog(`Generating voice chunk ${i + 1}/${chunks.length}...`);

      if (mode === "byokeys") {
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenKey,
          },
          body: JSON.stringify({
            text: chunks[i],
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.5, similarity_boost: 0.75 },
          }),
        });
        if (!resp.ok) throw new Error(`ElevenLabs error: ${resp.status}`);
        audioBlobs.push(await resp.blob());
      } else {
        const resp = await fetch("/api/translate/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunks[i], voiceId }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "TTS failed" }));
          throw new Error(err.error || "TTS failed");
        }
        audioBlobs.push(await resp.blob());
      }
    }

    if (audioBlobs.length === 1) return audioBlobs[0];

    // Concatenate with FFmpeg
    addLog("Joining audio chunks with FFmpeg...");
    const ffmpeg = await loadFFmpeg();
    const fileNames: string[] = [];
    for (let idx = 0; idx < audioBlobs.length; idx++) {
      const name = `chunk_${idx}.mp3`;
      const data = new Uint8Array(await audioBlobs[idx].arrayBuffer());
      ffmpeg.FS("writeFile", name, data);
      fileNames.push(name);
    }
    const listContent = fileNames.map((n) => `file '${n}'`).join("\n");
    ffmpeg.FS("writeFile", "concat_list.txt", new TextEncoder().encode(listContent));
    await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat_list.txt", "-c", "copy", "final_tts.mp3"]);
    const finalData = ffmpeg.FS("readFile", "final_tts.mp3") as Uint8Array;
    const result = new Blob([new Uint8Array(finalData)], { type: "audio/mpeg" });
    for (const name of fileNames) ffmpeg.FS("unlink", name);
    ffmpeg.FS("unlink", "concat_list.txt");
    ffmpeg.FS("unlink", "final_tts.mp3");
    return result;
  };

  // Replace audio in video
  const replaceAudioTrack = async (originalFile: File, newAudioBlob: Blob): Promise<Blob> => {
    const ffmpeg = await loadFFmpeg();
    const ext = originalFile.name.split(".").pop() || "mp4";
    const inputVideo = `original_video.${ext}`;
    const inputAudio = "new_audio.mp3";
    const outputVideo = "final_output.mp4";
    ffmpeg.FS("writeFile", inputVideo, new Uint8Array(await originalFile.arrayBuffer()));
    ffmpeg.FS("writeFile", inputAudio, new Uint8Array(await newAudioBlob.arrayBuffer()));
    await ffmpeg.exec([
      "-i", inputVideo, "-i", inputAudio,
      "-c:v", "copy", "-c:a", "aac",
      "-map", "0:v:0", "-map", "1:a:0",
      "-shortest", "-y", outputVideo,
    ]);
    const finalVideoData = ffmpeg.FS("readFile", outputVideo) as Uint8Array;
    const result = new Blob([new Uint8Array(finalVideoData)], { type: "video/mp4" });
    ffmpeg.FS("unlink", inputVideo);
    ffmpeg.FS("unlink", inputAudio);
    ffmpeg.FS("unlink", outputVideo);
    return result;
  };

  const splitTextIntoChunks = (text: string, maxLen: number): string[] => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = "";
    for (const sent of sentences) {
      if ((current + sent).length <= maxLen) {
        current += (current ? " " : "") + sent;
      } else {
        if (current) chunks.push(current);
        current = sent;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  };

  // Download helper
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Main process
  const handleTranslate = async () => {
    if (!file) {
      addLog("Please upload a file first", "error");
      return;
    }

    // Validate keys for BYO mode
    if (mode === "byokeys") {
      const needsDeepseek = translationProvider === "deepseek";
      if (!whisperKey) { addLog("OpenAI API key is required", "error"); return; }
      if (needsDeepseek && !deepseekKey) { addLog("DeepSeek API key is required", "error"); return; }
      if (!elevenKey) { addLog("ElevenLabs API key is required", "error"); return; }
    } else {
      if (!user) {
        addLog("Please sign in to use platform API", "warning");
        onLoginClick();
        return;
      }
      if (user.credits <= 0) {
        addLog("Insufficient credits. Please purchase more minutes.", "error");
        return;
      }
    }

    // Reset
    setLogs([]);
    setTranscriptionText("");
    setTranslatedText("");
    setTtsAudioBlob(null);
    setFinalBlob(null);
    setProgress(0);

    try {
      // Step 1: Extract audio
      setStep("extracting");
      setProgress(10);
      addLog("📁 Extracting audio from file...");
      const audioBlob = await extractAudio(file);
      addLog(`Audio extracted (${(audioBlob.size / 1024 / 1024).toFixed(2)} MB)`, "success");

      // Step 2: Transcribe
      setStep("transcribing");
      setProgress(30);
      addLog("🎤 Transcribing audio with Whisper AI...");
      const { text, duration } = await transcribe(audioBlob);
      if (!text) throw new Error("Empty transcription");
      setTranscriptionText(text);
      setAudioDuration(duration);
      addLog(`Transcription complete (${text.length} chars, ${(duration / 60).toFixed(1)} min)`, "success");

      // Step 3: Translate
      setStep("translating");
      setProgress(50);
      const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
      addLog(`🌐 Translating to ${langObj?.name || targetLang}...`);
      const translation = await translate(text, targetLang);
      setTranslatedText(translation);
      addLog(`Translation complete (${translation.length} chars)`, "success");

      // Step 4: Generate voice
      setStep("generating-voice");
      setProgress(70);
      addLog("🎙️ Generating translated voice with ElevenLabs...");
      const ttsBlob = await generateTTS(translation);
      setTtsAudioBlob(ttsBlob);
      addLog(`Voice generated (${(ttsBlob.size / 1024 / 1024).toFixed(2)} MB)`, "success");

      // Step 5: Compose final output
      setStep("composing");
      setProgress(90);
      if (isVideo) {
        addLog("🎬 Replacing audio track in video...");
        const final = await replaceAudioTrack(file, ttsBlob);
        setFinalBlob(final);
        addLog(`Video ready (${(final.size / 1024 / 1024).toFixed(2)} MB)`, "success");
      } else {
        setFinalBlob(ttsBlob);
        addLog("Audio file — translated voice is the final output", "success");
      }

      // Track usage for platform mode
      if (mode === "platform" && duration > 0) {
        const minutesUsed = Math.ceil(duration / 60);
        await fetch("/api/usage/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutesUsed,
            fileType: isVideo ? "video" : "audio",
            targetLang,
          }),
        });
      }

      setStep("done");
      setProgress(100);
      addLog("🎉 Translation complete! Download your files below.", "success");
    } catch (err) {
      setStep("error");
      addLog(`Error: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);

  return (
    <section id="translate" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            <span className="gradient-text">Translate</span> Now
          </h2>
          <p className="text-gray-400">Upload your file, configure, and let AI do the magic</p>
        </div>

        {/* Mode selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-white/10 p-1" style={{ background: "rgba(26,26,46,0.5)" }}>
            <button
              onClick={() => setMode("byokeys")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "byokeys"
                  ? "text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              style={mode === "byokeys" ? { background: "linear-gradient(135deg, #7c3aed, #6d28d9)" } : undefined}
            >
              🔑 Your API Keys (Free)
            </button>
            <button
              onClick={() => setMode("platform")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                mode === "platform"
                  ? "text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
              style={mode === "platform" ? { background: "linear-gradient(135deg, #ec4899, #db2777)" } : undefined}
            >
              ⚡ Our API ($0.99/min)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload & Config */}
          <div className="lg:col-span-1 space-y-6">
            {/* File upload */}
            <div
              className={`drop-zone p-6 rounded-2xl border-2 border-dashed transition cursor-pointer text-center ${
                dragOver ? "drag-over border-purple-500" : "border-white/10 hover:border-white/20"
              }`}
              style={{ background: "rgba(26, 26, 46, 0.5)" }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              {file ? (
                <div>
                  <div className="text-3xl mb-2">{isVideo ? "🎬" : "🎧"}</div>
                  <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • {isVideo ? "Video" : "Audio"}
                  </p>
                  <button
                    className="mt-3 text-xs text-purple-400 hover:text-purple-300"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm text-gray-400">
                    Drop your video or audio here
                  </p>
                  <p className="text-xs text-gray-600 mt-1">MP4, MOV, MP3, WAV, M4A (max 500MB)</p>
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="p-4 rounded-2xl border border-white/5" style={{ background: "rgba(26, 26, 46, 0.5)" }}>
              <label className="block text-sm font-semibold text-gray-300 mb-2">🌐 Target Language</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-gray-900">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API Keys (BYO mode) */}
            {mode === "byokeys" && (
              <div className="p-4 rounded-2xl border border-white/5 space-y-3" style={{ background: "rgba(26, 26, 46, 0.5)" }}>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🔑 API Keys
                </h3>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">OpenAI API Key (Whisper)</label>
                  <input
                    type="password"
                    value={whisperKey}
                    onChange={(e) => setWhisperKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Translation Provider</label>
                  <select
                    value={translationProvider}
                    onChange={(e) => setTranslationProvider(e.target.value as "deepseek" | "openai")}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="openai" className="bg-gray-900">OpenAI (GPT-4o-mini)</option>
                    <option value="deepseek" className="bg-gray-900">DeepSeek</option>
                  </select>
                </div>
                {translationProvider === "deepseek" && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">DeepSeek API Key</label>
                    <input
                      type="password"
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ElevenLabs API Key</label>
                  <input
                    type="password"
                    value={elevenKey}
                    onChange={(e) => setElevenKey(e.target.value)}
                    placeholder="API key from elevenlabs.io"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ElevenLabs Voice ID</label>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Voice ID"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Default: Rachel (multilingual)</p>
                </div>
              </div>
            )}

            {/* Platform mode info */}
            {mode === "platform" && (
              <div className="p-4 rounded-2xl border border-pink-500/20" style={{ background: "rgba(236, 72, 153, 0.05)" }}>
                {user ? (
                  <div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Credits: {user.credits.toFixed(1)} min</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Cost: $0.99 per minute of audio/video
                    </p>
                    <a href="#pricing" className="text-xs text-pink-400 hover:text-pink-300 mt-2 inline-block">
                      Buy more credits →
                    </a>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">
                      Sign in to use our API — no API keys needed!
                    </p>
                    <button
                      onClick={onLoginClick}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                    >
                      Sign In
                    </button>
                  </div>
                )}
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">ElevenLabs Voice ID (optional)</label>
                  <input
                    type="text"
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    placeholder="Default: Rachel"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: Process & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Translate button */}
            <button
              onClick={handleTranslate}
              disabled={!file || (step !== "idle" && step !== "done" && step !== "error")}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                step !== "idle" && step !== "done" && step !== "error" ? "btn-loading" : ""
              }`}
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              🚀 Translate {isVideo ? "Video" : "Audio"} to {langObj?.flag} {langObj?.name}
            </button>

            {/* Progress bar */}
            {step !== "idle" && (
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #7c3aed, #ec4899)",
                  }}
                />
              </div>
            )}

            {/* Log area */}
            <div
              ref={logAreaRef}
              className="rounded-2xl border border-white/5 p-4 h-72 overflow-y-auto font-mono text-xs"
              style={{ background: "rgba(10, 10, 20, 0.8)" }}
            >
              {logs.length === 0 ? (
                <p className="text-gray-600">📌 Upload a file and click Translate to start...</p>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className="log-entry py-1"
                    style={{
                      color:
                        log.type === "error" ? "#f87171" :
                        log.type === "success" ? "#34d399" :
                        log.type === "warning" ? "#fbbf24" :
                        "#94a3b8",
                    }}
                  >
                    <span className="text-gray-600">[{log.time}]</span> {log.message}
                  </div>
                ))
              )}
            </div>

            {/* Results / Downloads */}
            {step === "done" && (
              <div className="rounded-2xl border border-green-500/20 p-6" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  ✅ Translation Complete
                  {audioDuration > 0 && (
                    <span className="text-xs text-gray-500 font-normal">
                      ({(audioDuration / 60).toFixed(1)} min processed)
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => transcriptionText && downloadBlob(new Blob([transcriptionText], { type: "text/plain" }), "transcription.txt")}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-center"
                  >
                    <div className="text-xl mb-1">📝</div>
                    <div className="text-xs text-gray-400">Transcription</div>
                  </button>
                  <button
                    onClick={() => translatedText && downloadBlob(new Blob([translatedText], { type: "text/plain" }), "translation.txt")}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-center"
                  >
                    <div className="text-xl mb-1">🌐</div>
                    <div className="text-xs text-gray-400">Translation</div>
                  </button>
                  <button
                    onClick={() => ttsAudioBlob && downloadBlob(ttsAudioBlob, "translated_voice.mp3")}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-center"
                  >
                    <div className="text-xl mb-1">🎧</div>
                    <div className="text-xs text-gray-400">Audio Track</div>
                  </button>
                  {isVideo && finalBlob && (
                    <button
                      onClick={() => downloadBlob(finalBlob, `translated_video_${Date.now()}.mp4`)}
                      className="p-3 rounded-xl border border-purple-500/30 hover:bg-purple-500/10 transition text-center"
                      style={{ background: "rgba(124, 58, 237, 0.05)" }}
                    >
                      <div className="text-xl mb-1">🎬</div>
                      <div className="text-xs text-purple-400 font-semibold">Final Video</div>
                    </button>
                  )}
                  {!isVideo && finalBlob && (
                    <button
                      onClick={() => downloadBlob(finalBlob, `translated_audio_${Date.now()}.mp3`)}
                      className="p-3 rounded-xl border border-pink-500/30 hover:bg-pink-500/10 transition text-center"
                      style={{ background: "rgba(236, 72, 153, 0.05)" }}
                    >
                      <div className="text-xl mb-1">🎵</div>
                      <div className="text-xs text-pink-400 font-semibold">Final Audio</div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
