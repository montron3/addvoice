export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
];

export const ACCEPTED_FILE_TYPES = {
  video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a", "audio/ogg", "audio/flac"],
};

export const MAX_FILE_SIZE_MB = 500;

// ElevenLabs defaults
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel (multilingual)
export const ELEVENLABS_CHUNK_SIZE = 4800; // Max chars per ElevenLabs API request

// Magic link token expiry (15 minutes in milliseconds)
export const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000;
