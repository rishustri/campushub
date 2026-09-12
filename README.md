# CampusHub

CampusHub is a mini internet product designed for university students to discover and share useful study resources, events, projects, clubs and career opportunities.

## Problem
Students often depend on scattered WhatsApp messages, group chats and bookmarks to find useful campus resources.

## Solution
CampusHub puts useful student resources into one searchable, categorized web product.

## Features
- React + Vite frontend
- Supabase PostgreSQL database
- Email/password authentication
- Public resource browsing
- Search and category filters
- Authenticated resource creation
- Owner-only delete permissions
- Loading, empty and error states
- Responsive UI

## Architecture
Browser -> React/Vite -> Supabase JS client -> Supabase Auth + PostgreSQL

## Local setup
```bash
npm install
npm run dev
```

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Run `supabase.sql` in the Supabase SQL Editor.

## Deployment
Build with:
```bash
npm run build
```

Deploy the repository to Vercel and add the same two environment variables.

## Demo flow
1. Open CampusHub.
2. Search/filter a resource.
3. Sign up or sign in.
4. Add a new resource.
5. Refresh the page to prove the data persists in Supabase.
6. Delete your own resource.

## Recruitment submission
- Public GitHub repository
- Live deployment URL
- Short screen recording explaining the student problem, solution and end-to-end flow
