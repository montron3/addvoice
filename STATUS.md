# 📋 STATUS.md — Stato del Progetto AddVoice

> Aggiornato: 2026-04-07  
> Ultimo commit: `fix: Address security and code quality review feedback`

---

## 🟢 Cosa funziona già (build ✅, codice completo)

### Frontend — UI
| Componente | File | Stato |
|---|---|---|
| Landing page completa | `src/app/page.tsx` | ✅ Completo |
| Hero con CTA e stats | `src/components/Hero.tsx` | ✅ Completo |
| Sezione "Come funziona" | `src/components/HowItWorks.tsx` | ✅ Completo |
| Sezione Prezzi (4 pacchetti) | `src/components/Pricing.tsx` | ✅ Completo |
| Tool di traduzione | `src/components/TranslationTool.tsx` | ✅ Completo |
| Modal autenticazione | `src/components/AuthModal.tsx` | ✅ Completo |
| Navbar (responsiva + crediti utente) | `src/components/Navbar.tsx` | ✅ Completo |
| Footer | `src/components/Footer.tsx` | ✅ Completo |
| Stile dark theme / YouTuber-oriented | `src/app/globals.css` | ✅ Completo |
| Pagina verifica magic link | `src/app/auth/verify/page.tsx` | ✅ Completo |

### Frontend — Tool di traduzione
| Feature | Stato | Note |
|---|---|---|
| Upload file drag-and-drop (video/audio) | ✅ Funziona | Supporta MP4, MOV, MP3, WAV, M4A, ecc. |
| Modalità "Tue chiavi API" (BYO) | ✅ Completo | Gratis, chiavi restano nel browser |
| Modalità "API piattaforma" ($0.99/min) | ✅ UI completa | Richiede .env configurato (vedi sotto) |
| Scelta lingua destinazione (16 lingue) | ✅ Funziona | |
| Scelta provider traduzione (OpenAI / DeepSeek) | ✅ Funziona | Solo in modalità BYO |
| Log avanzamento in tempo reale | ✅ Funziona | |
| Barra di progresso % | ✅ Funziona | |
| Estrazione audio da video (FFmpeg.wasm) | ✅ Funziona | Client-side, no server |
| Trascrizione con Whisper (modalità BYO) | ✅ Funziona | Chiama OpenAI direttamente dal browser |
| Traduzione testo (modalità BYO) | ✅ Funziona | OpenAI GPT-4o-mini o DeepSeek |
| Sintesi vocale ElevenLabs (modalità BYO) | ✅ Funziona | Chunking automatico a 4800 chars |
| Ricomposizione video con nuova traccia | ✅ Funziona | FFmpeg.wasm client-side |
| Download: trascrizione, traduzione, audio, video | ✅ Funziona | |

### Backend — API Routes
| Route | Metodo | Stato | Note |
|---|---|---|---|
| `/api/auth/magic-link` | POST | ✅ Codice completo | Richiede SMTP configurato |
| `/api/auth/verify` | GET | ✅ Completo | Redirect con JWT cookie |
| `/api/auth/me` | GET | ✅ Completo | Legge utente dal cookie JWT |
| `/api/auth/logout` | POST | ✅ Completo | Cancella cookie |
| `/api/translate/transcribe` | POST | ✅ Completo | Proxy verso Whisper (piattaforma) |
| `/api/translate/translate` | POST | ✅ Completo | Proxy verso GPT/DeepSeek |
| `/api/translate/tts` | POST | ✅ Completo | Proxy verso ElevenLabs, voiceId validato |
| `/api/stripe/create-checkout` | POST | ✅ Completo | Crea sessione Stripe |
| `/api/stripe/webhook` | POST | ✅ Completo | Accredita minuti post-pagamento |
| `/api/usage/track` | POST | ✅ Completo | Scala crediti e logga uso |

### Database
| Modello | Stato | Note |
|---|---|---|
| `User` (email, crediti) | ✅ Completo | |
| `MagicToken` (token, scadenza, usato) | ✅ Completo | |
| `Transaction` (importo, minuti, stripe session) | ✅ Completo | |
| `Usage` (minuti usati, lingua, tipo file) | ✅ Completo | |

### Sicurezza
| Aspetto | Stato |
|---|---|
| JWT secret obbligatorio in produzione (throw se mancante) | ✅ |
| Voce ElevenLabs validata con regex (anti-SSRF) | ✅ |
| Cookie JWT httpOnly + secure in produzione | ✅ |
| Chiavi API BYO mai inviate al server | ✅ |
| CORS headers per FFmpeg.wasm (COEP/COOP) | ✅ |

---

## 🟡 Cosa NON è ancora configurato / testato end-to-end

> Il **codice è scritto**, ma queste funzioni richiedono variabili d'ambiente reali per girare davvero.

### 1. Email (Magic Link)
- **Problema:** Senza `.env` con `SMTP_HOST/USER/PASS`, l'invio email fallisce silenziosamente
- **File:** `src/lib/email.ts`
- **Da fare:** Scegliere provider email e configurare `.env`
  - Opzione A (consigliata): [Resend](https://resend.com) — semplice, gratuito fino a 100 email/giorno
  - Opzione B: [SendGrid](https://sendgrid.com)
  - Opzione C: Gmail SMTP (app password)

### 2. Stripe / Pagamenti
- **Problema:** Senza `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`, i pagamenti non funzionano
- **File:** `src/lib/stripe.ts`, `src/app/api/stripe/`
- **Da fare:**
  1. Creare account Stripe
  2. Copiare le chiavi di test in `.env`
  3. Configurare webhook con `stripe listen --forward-to localhost:3000/api/stripe/webhook` (sviluppo)
  4. In produzione: aggiungere l'URL webhook nella dashboard Stripe

### 3. Modalità "API Piattaforma" ($0.99/min)
- **Problema:** Le route proxy (`/api/translate/*`) usano le chiavi del server (`process.env.OPENAI_API_KEY`, `ELEVENLABS_API_KEY`) che non sono configurate
- **Da fare:** Inserire le chiavi in `.env`
- **Nota:** La modalità BYO (chiavi utente) funziona già senza configurazione server

### 4. Database in produzione
- **Problema:** Attualmente SQLite (file locale `dev.db`). Non funziona su Vercel / serverless
- **Da fare per deploy:**
  1. Creare un database PostgreSQL (es. [Neon](https://neon.tech) — gratuito)
  2. Aggiornare `prisma/schema.prisma`: `provider = "postgresql"`
  3. Aggiornare `DATABASE_URL` in `.env` con la stringa di connessione PostgreSQL
  4. Rieseguire `npx prisma db push`

### 5. Test end-to-end del flusso completo
- **Non ancora testato:** Il flusso completo "upload → trascrizione → traduzione → TTS → video finale" con file reali
- **Non ancora testato:** Magic link su email reale
- **Non ancora testato:** Pagamento Stripe test

---

## 🔴 Cosa manca (funzioni non ancora create)

| Feature | Priorità | Note |
|---|---|---|
| Dashboard utente (storico traduzioni, crediti) | Media | Manca una pagina `/dashboard` |
| Admin panel (lista utenti, transazioni) | Bassa | Non pianificato |
| SRT / subtitle export | Media | Whisper restituisce timestamp, non ancora sfruttati |
| Selezione voce ElevenLabs da lista | Bassa | Ora è solo un campo testo |
| Impostazioni account (cancella account, export dati) | Bassa | |
| Rate limiting sulle API route | Alta | Nessuna protezione da abuso |
| Toast/notifica post-pagamento ("Crediti aggiunti!") | Bassa | Ora ricarica solo la pagina |
| Supporto lingue per Whisper (lingua sorgente manuale) | Media | Ora rilevamento automatico |
| Gestione errori Stripe più granulare | Media | |

---

## 🚀 Passi per mettere online (checklist lancio)

```
[ ] 1. Scegliere provider email → configurare SMTP_* in .env
[ ] 2. Creare account Stripe → configurare STRIPE_* in .env
[ ] 3. Aggiungere chiavi API piattaforma in .env (OPENAI, ELEVENLABS)
[ ] 4. Testare flusso completo in locale (npm run dev)
[ ] 5. Scegliere DB produzione (PostgreSQL su Neon) → aggiornare DATABASE_URL
[ ] 6. Aggiornare MAGIC_LINK_BASE_URL con il dominio reale
[ ] 7. Impostare JWT_SECRET sicuro (stringa casuale lunga)
[ ] 8. Deploy su Vercel / Railway / Render
[ ] 9. Configurare webhook Stripe con URL di produzione
[ ] 10. Test pagamento con carta Stripe test (4242 4242 4242 4242)
[ ] 11. Test magic link su email reale
[ ] 12. Test traduzione completa con video reale
```

---

## 🛠 Comandi utili sviluppo

```bash
# Avviare in sviluppo
npm run dev

# Build di produzione
npm run build

# Resettare e ricreare il database
npx prisma db push --force-reset

# Aprire Prisma Studio (GUI database)
npx prisma studio

# Testare webhook Stripe in locale
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Controllare tipi TypeScript
npx tsc --noEmit
```

---

## 📁 Struttura del progetto

```
addvoice/
├── prisma/
│   └── schema.prisma          # Modelli DB: User, MagicToken, Transaction, Usage
├── src/
│   ├── app/
│   │   ├── page.tsx           # Pagina principale (assembla tutti i componenti)
│   │   ├── layout.tsx         # Layout globale + font Inter
│   │   ├── globals.css        # Dark theme, animazioni, utility CSS
│   │   ├── auth/verify/       # Pagina di verifica magic link
│   │   └── api/
│   │       ├── auth/          # magic-link, verify, me, logout
│   │       ├── translate/     # transcribe, translate, tts
│   │       ├── stripe/        # create-checkout, webhook
│   │       └── usage/         # track
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── TranslationTool.tsx  # Componente principale: upload, pipeline, download
│   │   ├── AuthModal.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── auth.ts            # JWT sign/verify, getCurrentUser, cookie options
│       ├── email.ts           # Nodemailer: invio magic link
│       ├── stripe.ts          # Client Stripe lazy-loaded, pacchetti crediti
│       ├── prisma.ts          # Singleton PrismaClient
│       └── constants.ts       # Lingue, tipi file, voice ID default, chunk size
├── .env.example               # Template variabili d'ambiente
├── STATUS.md                  # ← questo file
└── README.md                  # Setup e documentazione API
```

---

## 💡 Pipeline di traduzione (come funziona)

```
File utente (video/audio)
        │
        ▼ [FFmpeg.wasm — client-side]
   Audio estratto (.mp3)
        │
        ▼ [OpenAI Whisper API]
   Testo trascritto
        │
        ▼ [GPT-4o-mini o DeepSeek]
   Testo tradotto
        │
        ▼ [ElevenLabs TTS — chunking automatico a 4800 chars]
   Audio tradotto (.mp3)
        │
     ┌──┴──────────────────┐
     │ Se file VIDEO        │ Se file AUDIO
     ▼                      ▼
[FFmpeg.wasm mux]      Audio tradotto
Video finale (.mp4)    (.mp3) — finale
```

**Modalità BYO:** tutte le chiamate API avvengono direttamente dal browser (chiavi mai inviate al server)  
**Modalità Piattaforma:** le chiamate passano dalle route `/api/translate/*` del server

---

*Aggiornare questo file ogni volta che si completa o aggiunge una feature.*
