---
name: Ghost Quote System
description: Project architecture, config-driven rendering, Square payment integration, and deployment patterns for the white-label quote template
---

# Ghost Quote System — Skill Reference

## Overview
This is a white-label quote-to-payment system by Ghost AI Systems. It is designed to be cloned and configured for any service business (pressure washing, landscaping, barbershop, auto detailing, etc.) that uses Square for payments.

## Quick Context
- **Stack:** Next.js 14+ (App Router) + Vanilla CSS Modules
- **Payments:** Square Web SDK (Card + Apple Pay + Google Pay + 3DS/SCA)
- **Config:** Single `config.json` drives all content
- **Design:** Obsidian dark luxury theme with HSL-configurable accent colors
- **Deploy:** Vercel (one instance per client)

## Config-Driven Architecture

The entire site reads from `config.json`. When making changes:

1. **Content changes** → Edit `config.json` only. Never hardcode client-specific text in TSX.
2. **Design changes** → Edit `app/page.module.css`. The design system uses CSS custom properties.
3. **Payment logic** → Edit `app/checkout/page.tsx` (client) or `app/api/payment/route.ts` (server).
4. **New sections** → Add to `config.json` schema first, then render in `page.tsx`.

### Config Schema Quick Reference
```
brand.name          → Topbar, checkout branding, payment notes
brand.tagline       → Topbar subtitle
brand.badge         → Hero badge (e.g., "Licensed & Insured")
brand.heroHeadline  → H1 text
brand.heroSub       → Subheading paragraph
brand.colors.primary → HSL accent (e.g., "210, 90%, 52%")
brand.colors.bg     → Background hex
brand.font          → Google Font family name

services[].name     → Card title
services[].price    → Full price (number)
services[].deposit  → 50% deposit amount (number)
services[].popular  → Boolean — adds "Most Popular" badge
services[].features → String array — checkmark list

stats[].value       → Bold stat (e.g., "500+")
stats[].label       → Stat description
```

## Payment Integration Details

### Square Web SDK Flow
```
1. Load square.js CDN script
2. Initialize payments(APP_ID, LOCATION_ID)
3. Attach card form to DOM
4. Setup Apple Pay / Google Pay payment requests
5. On submit: tokenize() → verifyBuyer() → POST /api/payment
6. Server calls Square Payments API with token
7. Return success + receipt URL
```

### Critical Notes
- **3DS/SCA:** Always call `verifyBuyer()` after `tokenize()` for card payments. Required for production Square environments.
- **Apple Pay:** Requires domain verification file at `public/.well-known/apple-developer-merchantid-domain-association`. Must also verify domain in Square Developer Dashboard.
- **Idempotency:** Payment API generates unique idempotency keys per request to prevent double charges.
- **Error handling:** Always show user-friendly errors from `tokenResult.errors` array.

## Deployment Workflow

### New Client Setup
```bash
# 1. Clone template
git clone https://github.com/DanielSensual/ghost-quote-template.git client-name-quote
cd client-name-quote

# 2. Edit config.json with client branding + services

# 3. Add client images to public/images/

# 4. Create Vercel project + set env vars
#    NEXT_PUBLIC_SQUARE_APP_ID
#    NEXT_PUBLIC_SQUARE_LOCATION_ID
#    SQUARE_ACCESS_TOKEN
#    SQUARE_LOCATION_ID

# 5. Deploy
npx vercel --prod

# 6. Apple Pay (optional)
#    - Download verification file from Square Dashboard
#    - Place in public/.well-known/
#    - Redeploy
#    - Verify domain in Square Dashboard
```

### Environment Variables
All Square credentials come from the client's Square Developer Dashboard:
- **App ID:** Applications → your app → Credentials
- **Location ID:** Locations tab
- **Access Token:** Applications → your app → Credentials (production)

## Design System

### Color Tokens
The CSS uses HSL custom properties. To change accent color per client:
```css
/* In config.json brand.colors.primary: */
"210, 90%, 52%"   /* Blue (default demo) */
"25, 95%, 53%"    /* Orange (service businesses) */
"142, 71%, 45%"   /* Green (landscaping) */
"0, 0%, 100%"     /* White (luxury/minimal) */
```

### Mobile Breakpoint
Single breakpoint at `768px`:
- Desktop: 3-column grids (services, addons, gallery)
- Mobile: Single column, 2-col stats grid

## Debugging

### Common Issues
| Issue | Fix |
|-------|-----|
| "Payment failed" on card submit | Check `SQUARE_ACCESS_TOKEN` is production, not sandbox |
| Apple Pay button missing | Device doesn't support it, or domain not verified |
| Google Pay button missing | Chrome only, must be on HTTPS |
| Checkout shows $0 | Query params missing — check the href in service card buttons |
| Config changes not showing | Restart dev server (Next.js caches config.json imports) |
