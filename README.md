# Steady

A treatment companion for Man Matters customers on hair or beard regrowth treatment. It answers the question that made customers quit: *"Is this working, and is what I'm seeing normal?"*

Built for the Mosaic Wellness Fellowship Builder Challenge (Part 2). A concept, not affiliated with Mosaic Wellness.

## What it does

- **Setup (1 minute):** hair or beard, stage, products in the kit, start date.
- **Today:** week N of 24, what's normal in this phase, and a daily routine checklist.
- **Check-in:** a camera with a faint outline of the last photo, so every photo matches.
- **Progress:** a before/after slider, a photo timeline, and an AI progress read (Gemini) that compares the baseline with the latest photo.
- **Is this normal?:** tap symptoms and get normal, try this, talk to a doctor, or get help now.
- **Thinking of stopping?:** answers for each reason someone quits.
- **Sample user:** a demo at week 10 with illustrated sample photos, so reviewers can try everything right away.

Photos are stored only on the device (IndexedDB). They're sent to Gemini only when the user asks for a progress read.

## Run it locally

```bash
npm install
cp .env.example .env.local   # then paste your Gemini key into .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, click **Add New → Project** and import the repository.
3. Under **Environment Variables**, add `GEMINI_API_KEY` with your key from https://aistudio.google.com/apikey.
4. Click **Deploy**.

Optional: set `GEMINI_MODEL` to use a different Gemini model. The default is `gemini-3.8-flash`, with `gemini-3.5-flash` as a fallback.

## Tech

Next.js 16 (App Router) with TypeScript and Tailwind CSS 4. One server route, `/api/analyze`, keeps the API key on the server. It calls Gemini's `generateContent` API and falls back to the Interactions API.
