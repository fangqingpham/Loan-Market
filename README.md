# Loan Market

A verified, privacy-first two-sided loan marketplace. Borrowers post loan requests
for free; admin-verified lenders request contact; borrowers approve before any
messaging opens. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

> **Scope note:** This product intentionally does **not** include loan approval,
> underwriting, credit checks, document uploads, AI matching, or lender ranking.
> Borrower contact details are never exposed unless an approved contact flow allows it.

## Tech stack
- Next.js 14 (App Router) + React 18
- TypeScript
- Tailwind CSS
- Supabase (`@supabase/ssr`)

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase values (see `.env.example`).
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Scripts
- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm run typecheck` — TypeScript check (no emit)

## Project structure
```
app/
  (public)/   landing + how-it-works
  (auth)/     login, signup (placeholders)
  (borrower)/ borrower dashboard (placeholder)
  (lender)/   lender dashboard (placeholder)
  (admin)/    admin tools (placeholder)
components/
  layout/  Navbar, Footer, Container
  ui/      Button, Card, Input, Select, Textarea
  cards/ forms/ dashboard/  (feature components — later stages)
lib/
  supabase.ts         browser Supabase client
  supabase-server.ts  server Supabase client
  auth.ts             auth helpers
  constants.ts        app constants & business rules
  helpers.ts          small utilities
types/
  database.ts  DB types (placeholder until schema is generated)
```

## Deployment (Vercel)
Push to a Git repo and import into Vercel. Add the environment variables from
`.env.example` in the Vercel project settings. No extra build configuration needed.
