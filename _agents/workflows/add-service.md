---
description: Add a new service tier or add-on to an existing quote site
---

# Add Service or Add-On

## Adding a New Service Tier

1. Open `config.json`

2. Add to the `services` array:
```json
{
  "name": "Service Name",
  "description": "Brief description of the service",
  "price": 500,
  "deposit": 250,
  "popular": false,
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ]
}
```

3. Set `"popular": true` on at most ONE service for the "Most Popular" badge

4. The page will automatically render the new card with:
   - "Book / Pay 50% Deposit" button (links to /checkout?amount=deposit)
   - "Pay in Full" button (links to /checkout?amount=price)

5. No code changes needed — just restart dev server or redeploy

## Adding an Add-On

1. Open `config.json`

2. Add to the `addons` array:
```json
{
  "name": "Add-On Name",
  "price": 100,
  "description": "Brief description"
}
```

3. Add-ons currently display as info cards (no direct checkout link). To add checkout links for add-ons, modify `app/page.tsx` to include CTA buttons in the addon card rendering.

## Notes
- Keep service names concise (they become card titles)
- Deposit should typically be 50% of price
- Features array should have 4-7 items for visual balance
- Restart dev server after config changes (Next.js caches imports)
