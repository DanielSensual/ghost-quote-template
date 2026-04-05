# Ghost Quote Template

A white-label quote-to-payment system by **Ghost AI Systems**.

One `config.json` drives the entire site — services, pricing, branding, gallery, SEO. Powered by Square for payments (Card + Apple Pay + Google Pay).

## Quick Start

```bash
# 1. Clone this repo
git clone https://github.com/DanielSensual/ghost-quote-template.git my-client-quote
cd my-client-quote

# 2. Install
npm install

# 3. Edit config.json with client's brand, services, and pricing

# 4. Add Square credentials
cp .env.example .env.local
# Fill in SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, etc.

# 5. Run locally
npm run dev

# 6. Deploy to Vercel
npx vercel --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SQUARE_APP_ID` | Square Application ID |
| `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Square Location ID (public) |
| `SQUARE_ACCESS_TOKEN` | Square Access Token (server-only) |
| `SQUARE_LOCATION_ID` | Square Location ID (server-only) |
| `SQUARE_API_VERSION` | Square API version (default: `2024-03-20`) |

## Config.json Structure

```json
{
  "brand": { "name", "tagline", "badge", "heroHeadline", "heroSub", "colors", "font" },
  "stats": [{ "value", "label" }],
  "services": [{ "name", "description", "price", "deposit", "popular?", "features" }],
  "addons": [{ "name", "price", "description" }],
  "gallery": [{ "src", "label", "description" }],
  "contact": { "phone", "email", "address" },
  "seo": { "title", "description" },
  "footer": { "legal", "links" }
}
```

## Apple Pay Setup

1. Download domain verification file from Square Developer Dashboard
2. Place at `public/.well-known/apple-developer-merchantid-domain-association`
3. Deploy
4. Verify domain in Square Dashboard

## Built by Ghost AI Systems

[ghostaisystems.com](https://ghostaisystems.com)
