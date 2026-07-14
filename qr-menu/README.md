# New Ram Sai — QR Menu

A mobile-first QR code menu web app inspired by Swiggy's UI/UX, built with React, TypeScript, and Tailwind CSS.

## Features

- Swiggy-style restaurant header with rating, location, and cuisine tags
- Sticky category tabs (Indian, Chinese, Beverages)
- Floating **Menu** button with sub-category jump modal
- Veg / Non-veg indicators on every dish
- Search bar to filter dishes by name
- Local cart with bottom bar and cart drawer
- Smooth scroll to menu sections

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Menu Data

The full Swiggy menu (203 items across 32 sections) lives in `src/data/menuSections.json`, generated from `scripts/generate-menu.mjs`:

```bash
npm run generate-menu
```
