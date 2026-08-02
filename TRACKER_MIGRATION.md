# Kaana Tracker — PHP → React + API migration

Move Kaana Tracker from `/Users/srinivas/expense-tracker` (PHP monolith) into the **Demos monorepo** as `kaana-tracker` + `kaana-tracker-api`, while keeping **`https://tracker.kaana.in`** unchanged for users.

## Target architecture

```
tracker.kaana.in  →  Cloud Run: kaana-tracker (React SPA + nginx)
                              └─ proxies /api/* → kaana-tracker-api
kaana-tracker-api →  Cloud Run: kaana-tracker-api (Node/Express)
                              └─ Cloud SQL MySQL (existing expense_tracker DB)
```

| Layer | Old | New |
|-------|-----|-----|
| Frontend | PHP pages + Tailwind CDN | `kaana-tracker/` — Vite + React + TypeScript |
| API | Inline PHP + PDO | `kaana-tracker-api/` — Express + mysql2 |
| Database | Cloud SQL MySQL | **Same instance** — no schema rename required |
| Prod URL | tracker.kaana.in | **Same** — redeploy `kaana-tracker` service with new image |
| Deploy repo | expense-tracker GitHub | **Demos** — `cloudbuild.tracker.yaml` |

## Why keep MySQL (not SQLite like clinic)

Production data already lives in Cloud SQL (`kaana-tracker-mysql` / `expense_tracker`). The API connects with the same env vars the PHP app uses:

- `DB_SOCKET=/cloudsql/kaana-prod:asia-south1:kaana-tracker-mysql`
- `DB_NAME`, `DB_USER`, `DB_PASS` (secret)

Existing bcrypt password hashes in `users.password` work with `bcryptjs` in Node.

## Folder layout (Demos)

```
Demos/
├── kaana-tracker/           # React frontend (port 5190 local)
├── kaana-tracker-api/       # Express API (port 3011 local)
├── cloudbuild.tracker.yaml  # Deploy both to Cloud Run
└── TRACKER_MIGRATION.md     # This file
```

Pattern copied from **clinic-crm + clinic-api**, adapted for MySQL.

## Local development

```bash
# Terminal 1 — API
cd kaana-tracker-api
cp .env.example .env   # set DB_HOST, DB_NAME, DB_USER, DB_PASS
npm install
npm run dev             # http://localhost:3011

# Terminal 2 — Frontend
cd kaana-tracker
npm install
npm run dev             # http://localhost:5190  (proxies /api → 3011)
```

Point `.env` at local MySQL or a Cloud SQL Auth Proxy tunnel for prod data (read-only recommended).

## Production cutover (keep tracker.kaana.in)

### Phase M0 — Scaffold (current)

- [x] `kaana-tracker-api` — auth, health, projects, work-items stubs
- [x] `kaana-tracker` — login, hub, projects, project tabs shell
- [x] `cloudbuild.tracker.yaml`

### Phase M1 — Feature parity with PHP

Port API routes and UI for:

- Auth (login/logout/me)
- Projects (clusters)
- Work items, plan calendar, board
- Whiteboards + notes
- Discussions
- Transactions + reports
- Unified shell (from `feature/unified-shell` branch in expense-tracker)
- Calendar/project/daybook URL sync

### Phase M2 — North-star features (in progress)

Implemented on Node API + React:

- **`activity_events`** — append-only ledger; auto-logged on work item, discussion, journal, decision, membership changes
- **`entity_versions`** — field-level snapshots for time travel ("Then vs Today")
- **`journal_entries`** — end-of-day reflection in Daybook
- **`project_members`** — People tab with roles
- **`decisions`** — formal decision log with approve workflow
- **`entity_links`** — idea → story lineage via `derived_from` / `belongs_to`
- **`idea_stage`** on ideas (captured → rejected), separate from task status
- Project **Timeline** tab, Hub activity feed, work item time travel panel

Still planned for M2+:

- Full authorization (project-scoped access)
- Soft delete / archive pipeline
- Project-scoped whiteboards and finance links
- Notifications, mentions, intelligence layer

### Phase M3 — Production switch

1. Deploy new stack to Cloud Run **without** changing DNS:
   ```bash
   cd Demos
   gcloud builds submit --config cloudbuild.tracker.yaml --project kaana-prod .
   ```
2. `kaana-tracker` service gets React nginx image (same service name → LB unchanged)
3. New `kaana-tracker-api` service; frontend `TRACKER_API_ORIGIN` set at deploy
4. Smoke test: login, projects, finance, whiteboard
5. Disable expense-tracker repo auto-deploy (or archive repo)
6. Add Demos GitHub Action for `cloudbuild.tracker.yaml` on path changes

**DNS / load balancer:** `tracker.kaana.in` A record → `34.36.130.96` stays as-is. Only the Cloud Run **image** behind `kaana-tracker-backend` changes.

Optional: add `tracker-api.kaana.in` to `scripts/url-map-multi.yaml` for direct API access (not required if nginx proxies `/api`).

### Phase M4 — Decommission PHP

- Archive `expense-tracker` repo or mark read-only
- Remove PHP deploy workflow
- Delete `install.php` / `migrate.php` from prod (already should be deleted)

## API route map (PHP → REST)

| PHP | REST |
|-----|------|
| `login.php` | `POST /api/auth/login` |
| session user | `GET /api/auth/me` |
| `getClusters()` | `GET /api/projects` |
| `cluster.php` / `project.php` | `GET /api/projects/:id` |
| `getWorkItems()` | `GET /api/work-items?projectId=` |
| `work-item.php` | `GET/PATCH/DELETE /api/work-items/:id` |
| `api/plan.php` | `POST /api/work-items/:id/status` |
| `api/whiteboard-notes.php` | `/api/whiteboards/:id/notes` |
| `transactions.php` | `GET /api/transactions` |

## Rollback

Redeploy last PHP image to `kaana-tracker`:

```bash
cd expense-tracker
gcloud builds submit --config gcp/cloudbuild.yaml --project kaana-prod .
```

Data is unchanged (same MySQL).

## Branch strategy

- `feature/tracker-react-migration` on Demos
- Do **not** merge until M1 parity smoke tests pass
- PHP `feature/unified-shell` UI work informs React components; port don't duplicate long-term
