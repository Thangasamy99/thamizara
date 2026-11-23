# THAMIZARA Technologies — Website (Frontend)

**Tamil Roots. Global Innovation.**

Company website for THAMIZARA Technologies — a software development company
serving small businesses, students, institutions and organisations across
Cameroon, Nigeria, Africa and international clients.

## Design System

Defined in `src/index.css` (`@theme` + `@utility`):

| Token | Value | Usage |
| ----- | ----- | ----- |
| `brand-600` | `#245BDB` | Primary buttons, icons, links |
| `brand-500` | `#3978F6` | Secondary blue accents |
| `brand-100` / `brand-50` | `#EAF1FF` / `#F6F9FF` | Soft blue surfaces |
| `ink-900` / `ink-500` | `#17243A` / `#64748B` | Headings / body text |
| `ink-950` | `#0D1626` | Footer (dark anchor) |
| `mist-50` | `#F4F7FC` | Secondary background |
| `line` | `#E5EAF2` | Borders |
| `accent-500` | `#16A779` | Success/check indicators |

Utilities: `container-x` (page container), `text-display` / `text-h2`
(clamp-based responsive headings). Animations respect
`prefers-reduced-motion` (`MotionConfig` + CSS).

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- React Router DOM
- Framer Motion (animations)
- Lucide React (icons)
- Fonts: Space Grotesk (headings) + DM Sans (body)

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run oxlint               |

## Configuration

All contact details, social links and company info live in one file:

```
src/config/siteConfig.js
```

Before launch, update:

- `contact.email` — real contact email
- `contact.whatsappNumber` — digits only, international format (e.g. `2376XXXXXXXX` for Cameroon, `234XXXXXXXXXX` for Nigeria). The "WhatsApp Us" buttons fall back to email until this is set.
- `socials` — uncomment/add profile URLs to show icons in the footer

## Project Structure

```
src/
  assets/
  components/     # Navbar, Footer, Button, Logo, ServiceCard, ProjectCard,
                # ProjectGrid, ProjectFilters, ProjectGallery (lightbox),
                # ProjectHero, ProjectSpotlight, RelatedProjects,
                # TechnologyBadges, ProjectEnquiryForm (modal), Seo, …
  config/         # siteConfig.js — edit contact info here
  data/           # services.js, projects.js (all 8 portfolio projects)
  sections/       # Hero, CustomerCategories, Services, FeaturedProjects, …
  pages/          # Home, About, Services, Portfolio, ProjectDetail, Contact
  App.jsx         # Router (lazy-loaded pages)
  main.jsx
  index.css       # Tailwind theme (brand colors, fonts)
```

## Services, Pricing & Quotations (Phase 3)

- `/services` — overview of the 6 service categories
- `/services/:slug` — detail page per category (problems, features,
  process, related projects, FAQs, quotation CTA)
- `/pricing` — custom-quotation presentation (Starter / Business /
  Enterprise) — **no fixed prices by design**
- `/request-quotation` — 4-step enquiry wizard (customer → requirements →
  budget/timeline → review) with progress, validation, `?service=`/`?tier=`
  prefill and currency selection (XAF / NGN / USD)
- Submission adapter: `src/lib/quotation.js` composes a formatted enquiry
  and returns `mailto:` / `wa.me` links — swap in a real backend later by
  reimplementing the same three functions. Nothing pretends to be stored.
- Data: `data/services.js` (categories + process), `data/pricingTiers.js`
  (tiers, cost factors, FAQs), `data/quotationOptions.js` (countries,
  currencies, budget ranges — budget ranges describe the *client's* budget,
  not our prices).

## Portfolio (Phase 2)

- `/portfolio` — filterable gallery of all 8 software applications
- `/portfolio/:slug` — reusable case-study page per project
  (hero, overview, challenges, features, screenshot gallery with lightbox,
  tech stack, related projects, enquiry CTA)
- `/work` redirects to `/portfolio`
- All project content lives in `src/data/projects.js` — edit descriptions,
  features, tech stacks and related links there. A header comment marks
  descriptions as editable drafts pending verified documentation.
- "Request a Similar Solution" opens a global enquiry modal
  (`EnquiryProvider` + `useEnquiry()`), pre-filled with the current project.
  It validates client-side and composes a `mailto:` — no fake submissions.
- Page titles / meta descriptions / Open Graph tags are set per route via
  `components/Seo.jsx`.

## QA Scripts (optional)

`scripts/responsive-check.mjs` loads every route at 10 widths
(320→1920 px) in headless Edge/Chrome and fails on horizontal overflow.
`scripts/functional-check.mjs` verifies filters, galleries, the lightbox,
the enquiry modal and redirects. Requires `npm i --no-save puppeteer-core`
and a running dev server:

```bash
npm run dev          # terminal 1
node scripts/responsive-check.mjs   # terminal 2
```

Adjust `executablePath` in the script for your browser.

## Deployment (Vercel)

1. Push this folder to a GitHub repository.
2. In Vercel: **New Project** → import the repo.
3. If the repo root is this folder, defaults work out of the box
   (Framework: Vite, Build: `npm run build`, Output: `dist`).
   If it's a subdirectory, set **Root Directory** to `frontend`.
4. `vercel.json` already includes the SPA rewrite so client-side routes
   (`/services`, `/work`, …) work on refresh.
5. Later, attach the custom domain: `thamizara.com`.

## Phase 1 Scope

- Homepage with all brand sections ✔
- About / Services / Our Work / Contact pages ✔
- Responsive design, animations, SEO meta ✔
- Contact form opens the user's email app (no backend yet)

Backend, real form submission and a CMS are planned for later phases.
