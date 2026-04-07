# 🎬 AddVoice — AI Video & Audio Translation

Translate your YouTube videos and podcasts into any language with AI-powered transcription, translation, and voice synthesis.

## Features

- **Dual Mode**: Use your own API keys (free) or our platform API ($0.99/min)
- **16+ Languages**: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Hindi, Russian, Turkish, Polish, Dutch, Swedish
- **Video & Audio**: Upload video → get translated video + audio track. Upload audio → get translated audio track
- **Magic Link Auth**: No passwords, just email
- **Pay-Per-Use**: No subscriptions. Buy minutes with Stripe, use whenever you want
- **Client-Side Processing**: FFmpeg.wasm handles audio extraction/recomposition in your browser
- **Privacy First**: BYO API keys never leave your browser

## Tech Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma + SQLite (easy to migrate to PostgreSQL)
- **Auth**: Magic Link (JWT + httpOnly cookies)
- **Payments**: Stripe Checkout
- **AI Pipeline**: OpenAI Whisper → GPT-4o-mini/DeepSeek → ElevenLabs
- **Audio**: FFmpeg.wasm (client-side)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# At minimum, set JWT_SECRET for production

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for all available configuration options:

- **Database**: SQLite by default, configurable via `DATABASE_URL`
- **Auth**: `JWT_SECRET` (required in production), `MAGIC_LINK_BASE_URL`
- **Email**: SMTP settings for magic link emails
- **Platform API Keys**: OpenAI, DeepSeek, ElevenLabs (for pay-per-use mode)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`
- **Pricing**: `PRICE_PER_MINUTE_CENTS` (default: 99 = $0.99/min)

### Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. For production, switch to PostgreSQL (`DATABASE_URL`)

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/magic-link` | POST | Send magic link email |
| `/api/auth/verify` | GET | Verify magic link token |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/logout` | POST | Logout |
| `/api/translate/transcribe` | POST | Transcribe audio (Whisper) |
| `/api/translate/translate` | POST | Translate text (GPT/DeepSeek) |
| `/api/translate/tts` | POST | Text-to-speech (ElevenLabs) |
| `/api/stripe/create-checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/usage/track` | POST | Track usage and deduct credits |

## License

MIT
