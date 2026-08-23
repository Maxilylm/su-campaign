# Campaign Generator

> Paste one piece of content and get it rewritten as native posts for six different platforms.

**[Live demo](https://campaign-mlx.vercel.app)**

Repurposing a blog post by hand means rewriting it six times, each with different length limits and conventions. Campaign Generator sends the source content — truncated to 6,000 characters — plus a content type, brand voice, and target audience to Llama 3.3, which returns one structured object per selected platform. Each output respects its own format: X posts stay under 280 characters and come with a thread, Instagram gets a caption with hashtags, TikTok gets a hook plus a script, and email gets a subject line, preview text, and body with a CTA.

## Features

- Six platform outputs — LinkedIn, X/Twitter (single post plus thread), Instagram, TikTok, Facebook, and Email — toggled individually
- Brand voice and target-audience inputs that carry through every variant
- Live character counts checked against each platform's limit
- Expandable X thread view
- Per-platform copy buttons, plus "Copy All as Markdown" for the whole campaign

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Groq API — `llama-3.3-70b-versatile` in JSON mode
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`, read server-side by the `/api/generate` route.

---

Part of a series of 91 small web apps. [Browse them all](https://lorenzoylosada.vercel.app).
