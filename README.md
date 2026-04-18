# ⛽ Fuel Watch — Germany

Real-time fuel price tracker for Germany with price scoring,
golden hour analysis, and weekly trend insights. Built with React, TypeScript, and Vite, leveraging the Tankerkönig API for live data. Designed as a PWA for seamless mobile use, Fuel Watch helps drivers find the best refueling times and locations, saving money and time.

> **Live Demo:** [xxx](https://xxx)

---

## Features

- **Real-time prices** from 14,000+ gas stations via Tankerkönig API
- **Price scoring** — compares current price against 24h area average
- **Golden hour alerts** — cheapest refueling window (21:00–22:00)
- **Weekly trends** — best days to refuel (source: ADAC 2026)
- **Favorites & history** — saved locally, no account needed
- **PWA** — installable, works offline, push notifications
- **Bilingual** — German / English (custom i18n, no library)
- **Accessible** — ARIA labels, keyboard navigation, screen reader support

## Tech Stack

| Layer          | Choice                              |
|----------------|-------------------------------------|
| Framework      | React 18 + TypeScript (strict)      |
| Build          | Vite                                |
| Styling        | Vanilla CSS (Custom Properties, BEM)|
| i18n           | Custom `useTranslation` hook + JSON |
| APIs           | Tankerkönig (prices) + Photon (geo) |
| State          | React Context + useReducer          |
| Persistence    | LocalStorage                        |
| PWA            | Custom Service Worker + manifest    |
| Deployment     | Cloudflare Pages                    |

> **No CSS frameworks. No state libraries. No i18n libraries.**
> Every abstraction is hand-built to demonstrate core competency.

## Architecture
  src/
  api/ HTTP clients (Tankerkönig, Photon)
  core/ Providers, ErrorBoundary, config
  hooks/ All business logic (custom hooks)
  store/ React Context (language, favorites, history)
  types/ Shared TypeScript definitions
  ui/ Presentational components only
  utils/ Pure helper functions
  workers/ Service Worker for PWA features

### Design Principles

- **Separation of Concerns** — UI never fetches data directly
- **Custom hooks as business layer** — all logic in hooks/
- **Type safety** — zero `any`, strict TypeScript
- **Accessibility first** — ARIA live regions, focus management
- **Zero-cost architecture** — runs entirely on free-tier services

## Price Analysis Logic

| Rule               | Window        | Savings        |
|--------------------|---------------|----------------|
| Golden Hour        | 21:00 – 22:00 | 12–17 cents/L |
| Evening Window     | 16:00 – 22:00 | 2–4 cents/L   |
| Morning Peak Avoid | 05:00 – 07:00 | Avoid +8 cents |
| Cheapest Days      | Sun & Mon     | Multi-cent     |

Scoring: `(currentPrice - dailyAverage)` → Score 0–100

## Data Sources
- **Tankerkönig API** — 14,000+ stations, updated every 15 minutes
- **Photon API** — geocoding for station addresses
- **ADAC 2026 Report** — weekly price trends and best refueling days

## Accessibility
- ARIA live regions for dynamic price updates
- Keyboard navigation for all interactive elements
- Screen reader support with meaningful labels and announcements

## Getting Started
Get your free API key at
[Tankerkönig](https://creativecommons.tankerkoenig.de/). Then clone the repo and run locally:

```bash
git clone https://github.com/theafanasevo/fuel-watch.git
cd fuel-watch
npm install

# Create .env with your Tankerkönig API key
echo "VITE_TANKERKOENIG_API_KEY=your_api_key_here" > .env
npm run dev
```
