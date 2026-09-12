# CampusHub

CampusHub is a mini internet product designed for university students to discover and share useful study resources, events, projects, clubs, and career opportunities.

## Problem

Students often depend on scattered WhatsApp messages, group chats, and bookmarks to find useful campus resources.

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
- Loading, empty, and error states
- Responsive UI

## Architecture

Browser → React/Vite → Supabase JS Client → Supabase Auth + PostgreSQL

## Local Setup

```bash
npm install
npm run dev