# MoneyTrack

MoneyTrack is a personal finance PWA focused on making spending patterns obvious at a glance. It is a local-first React + TypeScript app with seeded demo data, typed transaction management, analytics dashboards, ranked spending insights, and basic offline support.

## Features

- Income and expense entries with amount, date, category, subcategory, merchant, payment method, and notes
- Transaction editing, deletion, and filtering by date range, category, merchant, and payment method
- Dashboard summaries for total income, total expenses, balance, category breakdown, merchant breakdown, and monthly trend
- Dedicated "Where I Spend Most" ranked view for categories and merchants
- Installable PWA manifest and service worker
- Seeded demo data persisted in localStorage

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

## Architecture

- `src/types.ts`: shared domain types
- `src/data/demoData.ts`: seeded transactions
- `src/lib/storage.ts`: local-first persistence abstraction ready to swap for a backend
- `src/lib/analytics.ts`: pure finance calculations
- `src/components/*`: reusable UI building blocks
- `public/branding/*`: logo, favicon, and PWA icon assets
- `public/sw.js` and `public/manifest.webmanifest`: PWA assets

## Notes

- Transactions are seeded on first load and then stored in localStorage.
- The app intentionally avoids extra chart or state dependencies to keep the codebase lightweight and easier to extend.
