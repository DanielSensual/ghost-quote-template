# Ghost Quote Template — CODEX

## What This Is
A white-label, config-driven quote-to-payment system built by Ghost AI Systems. One `config.json` drives the entire site — brand, services, pricing, gallery, SEO, contact info. Powered by Square Web SDK for payments (Card + Apple Pay + Google Pay + 3DS/SCA).

## Architecture

```
ghost-quote-template/
├── config.json               ← THE ONLY FILE EDITED PER CLIENT
├── app/
│   ├── page.tsx              ← Quote page (reads config.json)
│   ├── page.module.css       ← Obsidian design system
│   ├── checkout/page.tsx     ← Square Web SDK checkout
│   ├── api/payment/route.ts  ← Server-side Square payment
│   ├── layout.tsx            ← SEO + font injection from config
│   └── globals.css           ← Minimal reset
├── public/
│   ├── images/               ← Client brand assets + gallery photos
│   └── .well-known/          ← Apple Pay domain verification
├── _agents/                  ← Agent memory + workflows
├── .env.example              ← Square credential template
└── README.md
```

## Config System
Everything is driven by `config.json`:
- `brand` → name, tagline, badge, hero copy, colors (HSL), font
- `stats` → trust signal cards (value + label pairs)
- `services` → pricing tiers with name, description, price, deposit, features, `popular` flag
- `addons` → supplemental services with price
- `gallery` → before/after or portfolio images
- `contact` → phone, email, address
- `seo` → title + description
- `footer` → legal name + external links

## Key Files

| File | Purpose |
|------|---------|
| `config.json` | Client configuration — brand, services, pricing |
| `app/page.tsx` | Main quote page — reads config, renders services |
| `app/page.module.css` | Obsidian dark luxury design system |
| `app/checkout/page.tsx` | Square checkout (Card + Apple Pay + Google Pay + 3DS) |
| `app/api/payment/route.ts` | Server-side Square API call |
| `app/layout.tsx` | Font + SEO from config |
| `.env.example` | Required environment variables |

## Design System
- **Theme:** Obsidian — dark luxury (#060608 background)
- **Typography:** Google Fonts (configurable via `brand.font`)
- **Colors:** HSL-based, configurable per client via `brand.colors`
- **Layout:** CSS Modules, responsive grid (3-col desktop → 1-col mobile)
- **Buttons:** Pill-shaped, white primary / ghost secondary
- **Cards:** Glassmorphism with subtle borders

## Payment Flow
1. User clicks "Book / Pay 50% Deposit" or "Pay in Full"
2. → Redirected to `/checkout?amount=X&desc=Y`
3. → Square Web SDK loads Card form + Apple Pay + Google Pay
4. → Card tokenization + `verifyBuyer()` for 3DS/SCA
5. → Token sent to `/api/payment` which calls Square Payments API
6. → Success screen with receipt link

## Environment Variables
```
NEXT_PUBLIC_SQUARE_APP_ID      — Square Application ID (client-side)
NEXT_PUBLIC_SQUARE_LOCATION_ID — Square Location ID (client-side)
SQUARE_ACCESS_TOKEN            — Square Access Token (server-only)
SQUARE_LOCATION_ID             — Square Location ID (server-only)
SQUARE_API_VERSION             — Square API version (default: 2024-03-20)
```

## Deployment
- **Platform:** Vercel
- **Apple Pay:** Place verification file in `public/.well-known/apple-developer-merchantid-domain-association`
- **New client:** Clone repo → edit config.json → set env vars → `npx vercel --prod`

## Conventions
- No Tailwind — vanilla CSS Modules only
- No database — stateless, payment-only
- No external dependencies beyond Next.js + React
- Config changes should NEVER require code changes
- All client-specific content lives in `config.json` + `public/images/`
- Footer always includes "Powered by Ghost AI Systems" attribution
