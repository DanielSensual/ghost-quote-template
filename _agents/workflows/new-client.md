---
description: Spin up a new client quote site from the ghost-quote-template
---

# New Client Quote Site

## Steps

1. Clone the template repo:
```bash
git clone https://github.com/DanielSensual/ghost-quote-template.git <client-name>-quote
cd <client-name>-quote
```

2. Edit `config.json` with the client's:
   - Brand name, tagline, badge text
   - Hero headline and subheading
   - Colors (HSL primary, hex background)
   - Font (Google Fonts family name)
   - Services with name, description, price, deposit, features
   - Add-ons
   - Gallery items
   - Contact info (phone, email)
   - SEO title and description
   - Footer legal name and links

3. Add client images to `public/images/`:
   - Logo: `logo.png`
   - Gallery: `gallery-1.jpg`, `gallery-2.jpg`, etc.

4. Get Square credentials from the client's Square Developer Dashboard:
   - Application ID
   - Location ID
   - Production Access Token

5. Create a new Vercel project and set environment variables:
```
NEXT_PUBLIC_SQUARE_APP_ID=<app-id>
NEXT_PUBLIC_SQUARE_LOCATION_ID=<location-id>
SQUARE_ACCESS_TOKEN=<access-token>
SQUARE_LOCATION_ID=<location-id>
```

// turbo
6. Install dependencies:
```bash
npm install
```

// turbo
7. Test locally:
```bash
npm run dev
```

8. Deploy to production:
```bash
npx vercel --prod
```

9. (Optional) Apple Pay setup:
   - Download merchant ID domain association file from Square Dashboard
   - Place at `public/.well-known/apple-developer-merchantid-domain-association`
   - Redeploy
   - Verify domain in Square Developer Dashboard → Apple Pay tab

10. Create a new GitHub repo for the client and push:
```bash
rm -rf .git
git init && git add -A && git commit -m "feat: initial quote system for <client-name>"
gh repo create <client-name>-quote --public --source=. --remote=origin --push
```
