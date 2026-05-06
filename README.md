# Applytics

Applytics is a private job application tracker for managing applications, follow-ups, interviews, notes, and CSV workflows in one place.

Live app: [applyticsv2.vercel.app](https://applyticsv2.vercel.app/)

## Overview

Applytics includes:

- Dashboard with pipeline metrics, daily goal, upcoming interviews, sources, and activity.
- List view with filtering, sorting, detail panels, edit/delete actions, and mobile cards.
- Board view with drag-and-drop status updates.
- Stats view with conversion and source metrics.
- CSV import with template, validation, preview, and valid-row-only import.
- CSV export from the Stats page.
- Supabase authentication and persistence.

## Stack

React, TypeScript, Vite, Supabase, dnd-kit, Papa Parse.

## Local Development

This project is already deployed. Local setup is only needed for development.

```bash
npm install
npm run dev
```

Required environment variables:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Useful commands:

```bash
npm run lint
npm run build
npm run preview
```

## Supabase

The app expects Supabase auth and an `applications` table matching the fields used in `src/hooks/useApplications.ts`.

User settings SQL is available here:

```text
supabase/user_settings.sql
```

Main application statuses:

```text
draft, sent, followup, interview, offer, rejected
```

Application types:

```text
stage, alternance, cdi, freelance
```

## CSV

Import is available from the Dashboard page via `IMPORT CSV`.

Minimum required columns:

```text
company, role
```

Recommended columns:

```text
company, role, status, source, location, mode, salary, contact, priority, link, notes, sent_at, type, interview_stage, interview_date
```

A template can be downloaded from the import modal.

Export is available from the Stats page via `EXPORT CSV`.

## Notes

- The landing page uses static demo data.
- Mobile is focused on Dashboard and List.
- Board and Stats are desktop-first.
- Vite may warn about bundle size; this is not currently blocking.
