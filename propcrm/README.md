# PropCRM — Kaana AI Real Estate Demo

React + TypeScript CRM dashboard with drag-and-drop pipeline, AI scoring, and reports.

## Stack

- React (useState, useReducer)
- @dnd-kit/core — kanban drag & drop
- Recharts — reports charts
- Plus Jakarta Sans

## Run locally

```bash
cd propcrm
npm install
npm run dev
```

Open **http://localhost:5173**

## Production build

```bash
npm run build
npm run preview
```

## Features

- Left sidebar navigation (Dashboard, Properties, Leads, Follow-ups, Calendar, Reports, Settings)
- Global search + table filter
- Draggable pipeline with AI score borders and suggested actions
- Bulk lead actions, sortable table, last contacted column
- Tabbed lead detail (Overview, Timeline, Notes, Documents)
- AI summary card, score tooltips, toast notifications
- New lead modal, Recharts reports
