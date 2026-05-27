# Sidecar — Build Prompt

> A control-plane app for building, running, importing, and monitoring A2A servers
> for IBM watsonx Orchestrate. Built as a **separate application** that mirrors the
> conventions of the existing `performance-insights` codebase.

---

## How to use this document

Paste this file (plus `SIDECAR_CODE_TEMPLATES.md`) into your coding agent as the spec.
It is written so that an agent familiar with your `performance-insights` repo can scaffold
Sidecar using the **same patterns you already use**: Express + Knex, `node-config`,
passport-jwt auth, an MVC-ish `api/ controller/ model/ migrations/ utilities/` layout,
and a Create React App client with Radix/Tailwind/CVA.

The one new piece is a small **Python worker** service that owns all `uv run orchestrate …`
commands. Node never shells out to `uv` directly.

---

## 1. What Sidecar does

1. **Build & run A2A servers locally.** Configure an A2A server (starting with the Copilot
   bridge from your existing A2A code), generate its files, and start/stop it as a managed
   child process on a dedicated port.
2. **Import an A2A server into watsonx Orchestrate from the UI.** A button triggers
   `uv run orchestrate agents import -f <generated>.yaml` via the Python worker, and streams
   the output back.
3. **Monitor A2A server health & performance** so problems are visible — status, task history,
   latency/throughput/error metrics, and logs.
4. **Run other Orchestrate ADK functions from the UI** over time (tools import, model config,
   connections, etc.) — all routed through the Python worker. The architecture is built so new
   ADK commands are cheap to add.

This is the "sidecar" to Orchestrate: a place to assemble, launch, register, and watch the
things you plug into the platform.

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────┐
│  CRA client (react-scripts)        :3007                    │
│  Radix UI + Tailwind + CVA + recharts + react-router        │
│  Talks to API with JWT (passport-jwt), same as perf-insights│
└───────────────┬────────────────────────────────────────────┘
                │ REST + WebSocket
┌───────────────▼────────────────────────────────────────────┐
│  Node API (Express)                :5050                    │
│  api/ controller/ model/ migrations/ utilities/             │
│  Knex + pg  •  node-config  •  passport-jwt  •  bcrypt       │
│                                                             │
│   • A2A server lifecycle  (child_process)                   │
│   • config generation     (.env / yaml / entrypoint)        │
│   • metrics + task history (Knex → Postgres)                │
│   • log tailing → WebSocket                                 │
│   • proxies ADK calls →  Python worker                      │
└───────┬───────────────────────┬─────────────────────────┬──┘
        │ spawns                 │ HTTP                     │ SQL
        │                        │                          │
┌───────▼─────────┐   ┌──────────▼───────────┐   ┌─────────▼────────┐
│ A2A servers     │   │ Python worker  :9000 │   │ PostgreSQL       │
│ (Copilot bridge)│   │ FastAPI              │   │ (pg)             │
│ :9997, :9998 …  │   │ runs uv run          │   │ Knex migrations  │
│ child processes │   │ orchestrate …        │   │                  │
└─────────────────┘   └──────────────────────┘   └──────────────────┘
```

Pick ports that don't collide with `performance-insights` (which uses 3006 client / its own
API port). Suggested: **API 5050, client 3007, worker 9000, A2A servers 9997+**. Adjust freely.

---

## 3. Stack (mirror the existing app)

### Backend (Node, plain JavaScript — no TypeScript)
- **Express** `^4.19`
- **Knex** `^3.1` + **pg** `^8.12` (query builder + migrations — *not* Prisma/ORM)
- **node-config** (`config/default.json`, `production.json`, `staging.json`)
- **passport** + **passport-jwt** + **passport-local**, **bcrypt**, **jsonwebtoken** (reuse the
  exact auth approach from `performance-insights`: `utilities/passport.js`, `controller/authController.js`, `api/auth.js`)
- **helmet**, **cors**, **express-rate-limit**
- **dotenv** for secrets that shouldn't live in `config/*.json`
- **uuid** for ids
- **@anthropic-ai/sdk** is already in your toolbox if you want LLM-assisted features later
- **ws** for WebSocket log/metric streaming
- **nodemon** + **concurrently** for dev (same as existing root `package.json`)

### Python worker (the only Python)
- **FastAPI** + **uvicorn** + **python-multipart**
- Owns every `uv run orchestrate …` invocation via `subprocess`
- Stateless; returns `{ status, output, error }`

### Client (keep CRA)
- **react-scripts** `5.0.1` (do **not** switch to Vite)
- **react** `^18.3`, **react-router-dom** `^6.26`
- Radix primitives (`@radix-ui/react-*`), **class-variance-authority**, **tailwind-merge**,
  **tailwindcss** — i.e. the shadcn-style setup already in your `client/`
- **recharts** for metrics, **react-loading-skeleton** for loading states, **react-icons**
- **axios** for API calls, attaching the JWT like the existing client does

### Infra
- **Docker Compose**: `api`, `worker`, `client`, `postgres`. A2A servers run as child processes
  *inside the api container* (so the api container image must include Python + uv to run the
  generated Copilot bridge — or run A2A servers in their own container; see §9).

---

## 4. Directory layout (matches your screenshot conventions)

```
sidecar/
├── api/                         # route definitions (thin)
│   ├── index.js                 # mounts all routers under /api
│   ├── auth.js                  # login/register (copied pattern)
│   ├── servers.js               # A2A server CRUD + lifecycle
│   ├── orchestrate.js           # ADK actions (proxied to worker)
│   └── metrics.js               # metrics, tasks, logs
├── architecture/                # design notes / diagrams (like existing)
├── client/                      # CRA app (react-scripts), port 3007
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── config/
│   ├── default.json
│   ├── staging.json
│   └── production.json
├── controller/                  # business logic (mirrors existing controllers)
│   ├── authController.js
│   ├── serversController.js
│   ├── orchestrateController.js
│   └── metricsController.js
├── migrations/                  # Knex migrations (timestamped, like existing)
│   ├── 20260525000000_users.js
│   ├── 20260525000001_a2a_servers.js
│   ├── 20260525000002_tasks.js
│   ├── 20260525000003_metrics.js
│   └── 20260525000004_logs.js
├── model/
│   ├── knex.js                  # knex instance from config (copied pattern)
│   ├── user.js
│   ├── server.js                # a2a_servers queries
│   ├── task.js
│   └── metric.js
├── services/                    # process + worker glue (new, but plain modules)
│   ├── serverManager.js         # spawn/stop/track A2A child processes
│   ├── configGenerator.js       # write .env / yaml / entrypoint
│   ├── orchestrateClient.js     # HTTP client to the Python worker
│   ├── metricsCollector.js
│   └── logTailer.js
├── templates/                   # files written when generating an A2A server
│   ├── copilot.env.hbs
│   ├── orchestrate-agent.yaml.hbs
│   └── (your a2a_server.py / a2a_agent_executor.py / a2a_copilot.py / a2a_pusher.py)
├── utilities/
│   ├── passport.js              # jwt strategy (copied pattern)
│   └── utils.js
├── worker/                      # Python FastAPI worker
│   ├── app/main.py
│   ├── requirements.txt
│   └── Dockerfile
├── tests/
├── knexfile.js                  # reads from node-config (copied pattern)
├── server.js                    # entry point (like existing main: server.js)
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

Notes:
- `services/` is the only structural addition vs `performance-insights`. It holds the
  process-management and worker-proxy glue. Keep these as plain functions/objects — no classes
  needed, but classes are fine if you prefer; match whatever the existing controllers do.
- Generated A2A servers live on disk under e.g. `./.servers/<serverId>/` at runtime (gitignored),
  written from `templates/`.

---

## 5. Config (node-config, mirroring existing)

`config/default.json`
```json
{
  "port": 5050,
  "database": {
    "client": "pg",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "user": "sidecar",
      "password": "sidecar",
      "database": "sidecar"
    },
    "pool": { "min": 2, "max": 10 }
  },
  "worker": { "url": "http://localhost:9000" },
  "a2a": { "minPort": 9997, "maxPort": 10100 },
  "jwt": { "expiresIn": "7d" }
}
```

`config/staging.json` / `config/production.json` override host/credentials/urls per env, exactly
like `performance-insights`. **Secrets** (JWT secret, DB password in prod, any Orchestrate
entitlement/API keys) come from environment variables via `dotenv`, never committed.

`.env.example`
```
NODE_ENV=development
JWT_SECRET=change-me
DATABASE_URL=postgres://sidecar:sidecar@localhost:5432/sidecar
WORKER_URL=http://localhost:9000
# Orchestrate / worker env (passed through to the worker container):
WO_DEVELOPER_EDITION_SOURCE=myibm
WO_ENTITLEMENT_KEY=
WATSONX_APIKEY=
WATSONX_SPACE_ID=
```

`knexfile.js` should read from `node-config` so migrations and the app share one source of truth
(this is the pattern your `model/knex.js` already implies).

---

## 6. Auth (reuse, don't reinvent)

Copy the working auth from `performance-insights`:
- `utilities/passport.js` — JWT strategy
- `controller/authController.js` — register/login, bcrypt hashing, JWT issuance
- `api/auth.js` — `POST /api/auth/register`, `POST /api/auth/login`
- Protect all Sidecar routes (servers, orchestrate, metrics) with the same
  `passport.authenticate('jwt', { session: false })` middleware.
- `migrations/…_users.js` — same users table (carry over the `add_admin_to_users` idea if you
  want an admin flag; Sidecar is a single-operator/admin tool so an `is_admin` column is handy).

No new auth design. If it works in perf-insights, lift it verbatim and only adjust table columns.

---

## 7. Data model (Knex migrations)

Keep migrations timestamped and reversible (`up`/`down`), matching your existing style.

**users** — reuse from perf-insights (id, email, password_hash, is_admin, timestamps).

**a2a_servers**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | `uuid` |
| name | text unique | |
| description | text | |
| server_type | text | `copilot` (more later) |
| port | integer unique | from a2a.minPort..maxPort |
| status | text | `created` / `running` / `stopped` / `error` |
| process_id | integer null | host PID of child process |
| error_message | text null | |
| config | jsonb | raw config blob |
| created_at / updated_at | timestamptz | |

**a2a_server_configs** (or fold into `a2a_servers.config` jsonb — your call; a separate table is
cleaner for secrets)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| server_id | uuid fk → a2a_servers | cascade delete |
| copilot_direct_line_secret | text | **encrypt at rest** (see §11) |
| copilot_base_url | text | |
| orchestrate_yaml | text | generated yaml |
| orchestrate_api_url | text | public URL Orchestrate will call |
| orchestrate_auth_scheme | text | default `NONE` |
| orchestrate_chat_params | jsonb | `{ sendHistory, stream, pushNotifications }` |

**tasks** (A2A task history per server)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| server_id | uuid fk | indexed |
| task_id / context_id / corr_id | text | from A2A protocol |
| user_message | text | |
| agent_response | text null | |
| status | text | `working` / `completed` / `failed` |
| error_message | text null | |
| started_at | timestamptz | indexed |
| completed_at | timestamptz null | |
| duration_ms | integer null | |

**metrics** (time series)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| server_id | uuid fk | |
| metric_name | text | `response_time_ms` / `throughput` / `error_count` |
| metric_value | double precision | |
| recorded_at | timestamptz | index `(server_id, recorded_at)` |

**logs**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| server_id | uuid fk | |
| level | text | INFO/WARN/ERROR/DEBUG |
| message | text | |
| context | jsonb null | |
| logged_at | timestamptz | index `(server_id, logged_at)` |

**orchestrate_commands** (audit of ADK invocations)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| command | text | e.g. `agents import` |
| args | jsonb | |
| status | text | `running` / `success` / `failed` |
| output | text | |
| error | text null | |
| created_at / completed_at | timestamptz | |

---

## 8. API surface

All under `/api`, all JWT-protected except `/api/auth/*`. Controllers in `controller/`, queries
in `model/`, thin routers in `api/` — same separation as your existing `insights`/`integrations`/`tdc`.

### Auth (copied)
```
POST /api/auth/register
POST /api/auth/login
```

### Servers
```
POST   /api/servers                 create (writes config + db row, status=created)
GET    /api/servers                 list
GET    /api/servers/:id             detail (+ generated yaml)
PATCH  /api/servers/:id             update config
DELETE /api/servers/:id             delete (stops if running; soft-delete ok)
POST   /api/servers/:id/start       spawn child process → status=running
POST   /api/servers/:id/stop        SIGTERM (then SIGKILL) → status=stopped
GET    /api/servers/:id/status      live status + uptime/mem/cpu
WS     /api/servers/:id/logs        stream tailed logs
```

### Orchestrate (proxied to Python worker; audited in orchestrate_commands)
```
POST /api/orchestrate/agents/import      body: { serverId }  → worker /agents/import
POST /api/orchestrate/tools/import       multipart: tool file + requirements.txt
POST /api/orchestrate/models/configure   body: { provider, yaml }
POST /api/orchestrate/connections/add    body: { appId, environment, type }
GET  /api/orchestrate/commands/:id       command status/output
```

### Metrics / monitoring
```
GET /api/servers/:id/metrics?since=1h     aggregated p50/p95/p99, throughput, errorRate
GET /api/servers/:id/metrics/summary      totals, uptime, success/error counts
GET /api/servers/:id/tasks?limit&offset   task history (paginated)
GET /api/servers/:id/tasks/:taskId        task detail
WS  /api/metrics/:id                       live metric stream (5s tick)
```

---

## 9. A2A server lifecycle (`services/serverManager.js`)

- **Create:** `configGenerator` renders `templates/` → `./.servers/<id>/` containing `.env`,
  `orchestrate-agent.yaml`, and the Copilot bridge Python files (`a2a_server.py`,
  `a2a_agent_executor.py`, `a2a_copilot.py`, `a2a_pusher.py` — carried from your existing code,
  with the fixes in `code_review_analysis.md` applied). Insert `a2a_servers` row.
- **Start:** pick the configured port, `spawn('python', ['a2a_server.py'], { cwd, env })`, record
  PID, set `status=running`, begin tailing `server.log` into the `logs` table + WebSocket.
- **Stop:** `SIGTERM`, wait, `SIGKILL` on timeout; clear PID; `status=stopped`.
- **Status:** verify the PID is alive; optionally report mem/cpu.
- **Crash handling:** on unexpected `exit`, set `status=error`, capture last log lines into
  `error_message`, emit a WebSocket event.

> **Runtime requirement:** because the generated A2A server is Python (your Copilot bridge), the
> environment running `serverManager` needs Python + the A2A deps available. Two options:
> (a) bake Python+uv into the `api` container image and run A2A servers as child processes there
> (simplest), or (b) give A2A servers their own container/image and have `serverManager` start
> them via the Docker API. Start with (a); note (b) as a scaling path.

---

## 10. Orchestrate worker (`worker/app/main.py`)

The worker is the **only** place `uv run orchestrate …` executes. Node calls it over HTTP.

Endpoints (all return `{ status, output, error }`):
```
POST /agents/import       form: yaml_content           → uv run orchestrate agents import -f f.yaml
POST /tools/import        files: tool, requirements     → uv run orchestrate tools import -k python -f … -r …
POST /models/configure    form: provider, yaml_content  → uv run orchestrate models import -f f.yaml
POST /connections/add     form: app_id, environment, …  → uv run orchestrate connections …
GET  /health
```

Implementation notes:
- Write uploaded/posted content to a temp file, run `subprocess.run([...], capture_output=True,
  text=True, timeout=…)`, clean up, return stdout/stderr + status from the return code.
- The worker container must be logged into the Orchestrate env (`orchestrate env activate`) and
  have the entitlement/watsonx env vars. Pass these via Compose env from your `.env`.
- Keep timeouts explicit (agents import ~30s, tools import ~60s) so the API never hangs.

Node side (`services/orchestrateClient.js`) is a thin axios wrapper to `config.worker.url`, with
its own timeouts and error normalization, and it writes an `orchestrate_commands` audit row around
each call.

---

## 11. Security (carry over + a little extra)

- **Reuse passport-jwt** exactly as in perf-insights; protect every non-auth route.
- **helmet**, **cors** (lock origin to the client URL), **express-rate-limit** on `/api/auth` and
  on the orchestrate endpoints.
- **Encrypt the Copilot Direct Line secret at rest** (e.g. `crypto` AES-256-GCM with a key from
  `JWT_SECRET`/dedicated `ENCRYPTION_KEY`). Never log secrets. Never return them to the client
  after creation — show masked.
- Validate request bodies (a small hand-rolled validator or `zod` if you want; perf-insights
  doesn't use zod, so a simple `utilities/validate.js` keeps dependencies consistent).
- The worker should not be publicly exposed — keep it on the internal Compose network only.

---

## 12. Client (CRA, shadcn-style — keep your existing setup)

Pages (react-router):
- **Dashboard** `/` — grid of server cards (status badge, port, quick metrics), system health,
  recent tasks, alerts. Reuse your Radix + CVA card components and `recharts`.
- **Create Server** `/servers/new` — template picker (Copilot first) → config form → deploy with
  live log stream (WebSocket) and `react-loading-skeleton` while pending.
- **Monitor** `/servers/:id` — metric cards (p95, throughput, error rate, active tasks), recharts
  trends, paginated task table, alerts, link to logs.
- **Import** `/servers/:id/import` — show generated YAML, confirm Orchestrate params, run import,
  stream worker output.
- **Logs** `/servers/:id/logs` — live tail with level filter/search.
- **Settings** `/settings` — Orchestrate env config, port range, alert thresholds.

Conventions:
- Same axios instance + JWT interceptor pattern as perf-insights `client/`.
- Tailwind + the `cn()` helper (`tailwind-merge` + CVA) you already have.
- Keep `PORT=3007` in the client `start` script to avoid clashing with perf-insights' 3006.

---

## 13. Dev & deploy

Root `package.json` scripts (mirror existing concurrently pattern):
```json
{
  "scripts": {
    "server": "nodemon server.js",
    "client": "npm run start --prefix ./client",
    "worker": "uvicorn worker.app.main:app --reload --port 9000",
    "dev": "concurrently \"npm run server\" \"npm run worker\" \"npm run client\"",
    "migrate": "knex migrate:latest",
    "migrate:make": "knex migrate:make",
    "seed": "knex seed:run"
  }
}
```

Docker Compose services: `postgres`, `api` (Node + Python/uv if running A2A in-container),
`worker` (FastAPI + uv, logged into Orchestrate), `client` (CRA). Healthchecks on `postgres`
and `worker`; `api` depends on both.

Local without Docker: start Postgres, `npm run migrate`, then `npm run dev` (brings up api +
worker + client). Worker needs `uv` and an activated Orchestrate env on your machine.

---

## 14. Build order (suggested)

1. Scaffold repo with the layout in §4; copy auth (`utilities/passport.js`, `authController.js`,
   `api/auth.js`), `model/knex.js`, `knexfile.js`, `config/*` from perf-insights and adjust.
2. Migrations for users + a2a_servers + tasks + metrics + logs; `npm run migrate`.
3. `services/serverManager.js` + `configGenerator.js` + `templates/` (drop in the fixed Copilot
   bridge files). Implement `/api/servers` CRUD + start/stop. Verify a server actually boots.
4. `worker/app/main.py` with `/agents/import` + `/health`. Wire `orchestrateClient.js` and
   `/api/orchestrate/agents/import`. Import a server end-to-end.
5. Task tracking + metrics collection + WebSocket streaming; Monitor + Logs pages.
6. Harden: encryption, rate limits, validation, error states; Docker Compose; tests.
7. Extend worker with tools/models/connections; add the matching UI.

---

## 15. Acceptance criteria

- Log in with the existing JWT auth; all Sidecar routes protected.
- Create a Copilot A2A server from the UI in under ~2 minutes; it starts as a child process and
  responds on its port.
- One click imports it into Orchestrate via the worker; output streamed to the UI; audited in
  `orchestrate_commands`.
- Monitor page shows live status, task history, and metrics; logs stream over WebSocket.
- Adding a new ADK command = one worker endpoint + one Node proxy route + one UI action.
- `docker compose up` brings up postgres + api + worker + client; `npm run dev` works locally.
- No TypeScript anywhere; Knex (not Prisma); CRA (not Vite); node-config + passport reused.
