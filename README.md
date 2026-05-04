# Applytics

A Bloomberg-style job application tracker. Track every application, interview, and follow-up from a single dashboard.

**[→ applyticsv2.vercel.app](https://applyticsv2.vercel.app/)**

---

## Features

- **Dashboard** — pipeline overview, response rates, upcoming interviews, daily application goal
- **List view** — sortable table with detail panel per application
- **Board view** — drag-and-drop kanban across statuses
- **Stats view** — charts and metrics on your job search
- **Realtime sync** — data synced across all your devices instantly

## Tech Stack

React · TypeScript · Vite · Supabase · dnd-kit

---

## Self-hosting

Create a Supabase project, add your credentials to `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then:

```bash
npm install && npm run dev
```
