# 10X CRM

A lightweight customer relationship management app for sales managers. Track clients through a simple pipeline (Lead → Contacted → Won / Lost), leave notes, set follow-up reminders, and review daily stats on a dashboard.

## Features

- Sign up and login with session-based auth (localStorage)
- Auth guard for protected pages + logout
- Dark / light theme preference
- Clients list loaded from DummyJSON API and persisted locally
- Add / delete clients via API (POST / DELETE) with local persistence
- Search, status filter chips, and sorting
- Client detail modal with notes and 1-minute reminders
- Dashboard: live clock, stats, pipeline overview, recent clients
- Profile edit, password change, and CRM data reset

## Tech Stack

- HTML5, CSS3 (custom properties for theming)
- Vanilla JavaScript (ES6+)
- [DummyJSON](https://dummyjson.com) for sample user data
- Browser `localStorage` for users, session, clients, and theme
- Deployed on Vercel

## How to Run

1. Clone this repository.
2. Open the project folder in a static file server, for example:

```bash
npx serve .
```

3. Visit the URL shown in the terminal (usually `http://localhost:3000`).
4. Start at `index.html` (login). Create an account or use the test account below.

Opening HTML files directly via `file://` may block API calls in some browsers. Prefer a local static server.

## Live Demo

<!-- Update after deploy -->
**Live URL:** _(pending Vercel deploy — will be added here)_

## Test Account

| Field    | Value          |
|----------|----------------|
| Email    | `demo@test.com` |
| Password | `demo1234`     |

You can also register a new account on the Sign Up page.

## Project Structure

```
├── index.html          # Login
├── signup.html         # Sign Up
├── dashboard.html      # Dashboard
├── clients.html        # Clients
├── profile.html        # Profile
├── css/                # Styles
├── js/                 # Shared and page scripts
├── ai-log.md           # AI usage log
├── glossary.md         # Technical glossary
└── research-note.md    # Research note
```

## Credits

- Built for the 10X JavaScript final exam following the official PRD.
- Sample data from [DummyJSON](https://dummyjson.com).
- AI tools (Cursor) used for scaffolding and review; see `ai-log.md`.
