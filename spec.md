## Resumo

- Objective: Build a personal finance PWA called MoneyTrack with transaction CRUD, filters, analytics dashboards, ranked spending insights, seeded demo data, and a polished mobile-first UI.
- Constraints: Keep the app frontend-only and ready for future backend integration, use strong typing, avoid unnecessary dependencies, and include manifest plus basic offline support.
- Validation plan: Install dependencies, run a production build, and manually verify seeded data, CRUD flows, filtering, dashboard metrics, ranking views, and PWA assets.

## Arquivos para criar

### Path do arquivo: package.json
Tipo: criar
O que fazer naquele arquivo:
- Define a minimal React + TypeScript + Vite project with scripts for dev and build.
- Include only core dependencies needed for the app and type-safe development.

### Path do arquivo: tsconfig.json
Tipo: criar
O que fazer naquele arquivo:
- Configure TypeScript for a Vite React app with strict typing enabled.

### Path do arquivo: tsconfig.node.json
Tipo: criar
O que fazer naquele arquivo:
- Configure TypeScript for Vite config compilation.

### Path do arquivo: vite.config.ts
Tipo: criar
O que fazer naquele arquivo:
- Add a minimal Vite config for a React app.

### Path do arquivo: index.html
Tipo: criar
O que fazer naquele arquivo:
- Provide the root HTML shell, theme color metadata, manifest link, and app mount node.

### Path do arquivo: src/main.tsx
Tipo: criar
O que fazer naquele arquivo:
- Mount the React app and register the service worker in production-compatible fashion.

### Path do arquivo: src/App.tsx
Tipo: criar
O que fazer naquele arquivo:
- Compose the main app layout, screen switching, dashboard summaries, transaction management, filters, and forms.
- Wire reusable components to the typed local data store.

### Path do arquivo: src/styles.css
Tipo: criar
O que fazer naquele arquivo:
- Implement the full premium mobile-first visual system, layout, responsive behavior, cards, forms, charts, and navigation styling.

### Path do arquivo: src/types.ts
Tipo: criar
O que fazer naquele arquivo:
- Define transaction, filters, summary, and chart-related TypeScript types shared across the app.

### Path do arquivo: src/data/demoData.ts
Tipo: criar
O que fazer naquele arquivo:
- Provide seeded income and expense transactions with realistic categories, merchants, and payment methods.

### Path do arquivo: src/lib/format.ts
Tipo: criar
O que fazer naquele arquivo:
- Add currency, date, and label formatting helpers used across the UI.

### Path do arquivo: src/lib/analytics.ts
Tipo: criar
O que fazer naquele arquivo:
- Implement pure functions for totals, grouped spending, ranked merchants/categories, and monthly trend calculations.

### Path do arquivo: src/lib/storage.ts
Tipo: criar
O que fazer naquele arquivo:
- Implement a typed localStorage persistence layer that seeds demo data on first load and supports future backend replacement.

### Path do arquivo: src/components/Header.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render the app header, branding, and top-level navigation controls.

### Path do arquivo: src/components/SummaryCards.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render income, expense, and balance overview cards.

### Path do arquivo: src/components/TransactionForm.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render a reusable typed transaction form for create and edit flows.

### Path do arquivo: src/components/TransactionFilters.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render date range, category, merchant, and payment method filters with reset behavior.

### Path do arquivo: src/components/TransactionList.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render the filtered transaction list with edit and delete actions and clear transaction metadata.

### Path do arquivo: src/components/charts/BarChart.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render a lightweight horizontal bar chart for categories and merchants without third-party chart libraries.

### Path do arquivo: src/components/charts/TrendChart.tsx
Tipo: criar
O que fazer naquele arquivo:
- Render a simple SVG line/area chart for monthly trend.

### Path do arquivo: public/manifest.webmanifest
Tipo: criar
O que fazer naquele arquivo:
- Define the installable PWA manifest including app name, icons, colors, and display mode.

### Path do arquivo: public/sw.js
Tipo: criar
O que fazer naquele arquivo:
- Add a basic service worker that pre-caches app shell assets and serves a minimal offline-first experience.

### Path do arquivo: public/icon-192.svg
Tipo: criar
O que fazer naquele arquivo:
- Provide a scalable app icon with the MoneyTrack visual identity.

### Path do arquivo: public/icon-512.svg
Tipo: criar
O que fazer naquele arquivo:
- Provide a larger scalable app icon for install contexts.

## Arquivos para modificar

### Path do arquivo: README.md
Tipo: criar
O que fazer naquele arquivo:
- Document setup, available scripts, app features, and the local-first architecture.

## Validacao

- Commands or checks to run: `npm install`, `npm run build`
- Expected result: The project installs cleanly and produces a production build without type errors.
- Any manual verification needed: Confirm demo data loads, creating/editing/deleting transactions updates metrics, filters narrow the list, ranked spend screens are correct, and the manifest/service worker files are emitted.
