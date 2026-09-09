# Lender Match Engine — Frontend

Next.js frontend for the Lender Match Engine, a rule-based home loan
lender-matching platform. Talks to the FastAPI backend in `../backend_cat`.

Two areas:
- **Public site** (`/`) — the landing page. No login required.
- **Explore Lenders** (`/explore`) — the borrower-facing tool. Requires
  logging in (plain email + password via Firebase) with a "business" or
  "admin" account.
- **Admin console** (`/admin`) — manages bank/product data, categories, and
  admin access. Requires an "admin" account — anyone can sign up and
  request admin access from `/explore`'s header; an existing admin
  approves it from Manage Admins. There's no tier above admin.

## Getting started

```bash
npm install
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001) (not 3000 — the
backend usually runs on 3000/8000-range ports locally, see `backend_cat`'s
own README/setup).

You'll need a `.env.local` with:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8043

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

The Firebase values come from the project's Firebase console (same project
the backend's service account key points at). Admin login only works with
these set — without them the admin pages show a "not configured yet"
message instead of crashing.

## Tech

Next.js 16 (App Router), Tailwind v4, Framer Motion, Firebase Auth
(email-link sign-in — see `lib/useAuth.ts`).

## Deployment

Deploys to Netlify — see `netlify.toml` at the repo root. Every push to the
connected branch auto-deploys.
