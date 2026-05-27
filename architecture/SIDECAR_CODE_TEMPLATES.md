# Sidecar — Code Templates (JavaScript)

Starter code in the **same conventions** as `performance-insights`: Express + Knex,
`node-config`, passport-jwt, an `api/ controller/ model/ migrations/ utilities/ services/`
layout, and a CRA client. No TypeScript. Copy, then adapt.

---

## Root `package.json`

```json
{
  "name": "sidecar",
  "version": "1.0.0",
  "main": "server.js",
  "engines": { "node": "18.x", "npm": "9.x" },
  "scripts": {
    "start": "node server.js",
    "server": "nodemon server.js",
    "client": "npm run start --prefix ./client",
    "worker": "uvicorn worker.app.main:app --reload --port 9000",
    "dev": "concurrently \"npm run server\" \"npm run worker\" \"npm run client\"",
    "migrate": "knex migrate:latest",
    "migrate:make": "knex migrate:make",
    "migrate:rollback": "knex migrate:rollback",
    "seed": "knex seed:run",
    "heroku-postbuild": "npm install --prefix client && npm run build --prefix client"
  },
  "license": "ISC",
  "description": "Control plane for building, running, importing and monitoring A2A servers for watsonx Orchestrate",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.1",
    "axios": "^1.7.5",
    "bcrypt": "^5.1.1",
    "concurrently": "^8.2.2",
    "config": "^3.3.12",
    "cors": "^2.8.5",
    "dotenv": "16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "knex": "^3.1.0",
    "nodemon": "^3.1.4",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "pg": "^8.12.0",
    "uuid": "^11.0.3",
    "ws": "^8.18.0"
  }
}
```

---

## `config/default.json`

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

`config/production.json` / `config/staging.json` override host/credentials/`worker.url` per env.
Secrets (JWT secret, prod DB password) come from env via `dotenv`.

---

## `knexfile.js` (reads from node-config, like your existing setup)

```javascript
require('dotenv').config();
const config = require('config');

const base = config.get('database');

// Allow DATABASE_URL to win in deployed envs.
const connection = process.env.DATABASE_URL || base.connection;

module.exports = {
  development: { client: base.client, connection, pool: base.pool, migrations: { directory: './migrations' }, seeds: { directory: './seeds' } },
  staging:     { client: base.client, connection, pool: base.pool, migrations: { directory: './migrations' } },
  production:  { client: base.client, connection, pool: base.pool, migrations: { directory: './migrations' } }
};
```

## `model/knex.js`

```javascript
const knex = require('knex');
const knexfile = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const db = knex(knexfile[env]);

module.exports = db;
```

---

## `server.js` (entry point)

```javascript
require('dotenv').config();
const http = require('http');
const config = require('config');
const app = require('./api/index');
const { attachWebsockets } = require('./services/websocket');

const port = config.get('port');
const server = http.createServer(app);

attachWebsockets(server); // /api/servers/:id/logs and /api/metrics/:id

server.listen(port, () => {
  console.log(`Sidecar API listening on ${port}`);
});
```

---

## `api/index.js` (mounts routers, helmet/cors/rate-limit, passport)

```javascript
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

require('../utilities/passport'); // configures the jwt strategy

const authRoutes = require('./auth');
const serverRoutes = require('./servers');
const orchestrateRoutes = require('./orchestrate');
const metricsRoutes = require('./metrics');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3007' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });
app.use('/api/auth', authLimiter, authRoutes);

const requireAuth = passport.authenticate('jwt', { session: false });
app.use('/api/servers', requireAuth, serverRoutes);
app.use('/api/orchestrate', requireAuth, rateLimit({ windowMs: 60 * 1000, max: 30 }), orchestrateRoutes);
app.use('/api', requireAuth, metricsRoutes); // metrics routes are server-scoped paths

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sidecar-api' }));

// central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal error' });
});

module.exports = app;
```

---

## `utilities/passport.js` (copy the perf-insights pattern)

```javascript
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../model/user');

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.sub);
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }
));

module.exports = passport;
```

---

## `controller/authController.js`

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../model/user');

exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    return res.status(201).json({ id: user.id, email: user.email });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: config.get('jwt.expiresIn')
    });
    return res.json({ token });
  } catch (err) { next(err); }
};
```

## `api/auth.js`

```javascript
const router = require('express').Router();
const auth = require('../controller/authController');

router.post('/register', auth.register);
router.post('/login', auth.login);

module.exports = router;
```

---

## Migrations (Knex, timestamped like your existing ones)

### `migrations/20260525000000_users.js`

```javascript
exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.text('email').notNullable().unique();
    t.text('password_hash').notNullable();
    t.boolean('is_admin').notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable('users');
```

### `migrations/20260525000001_a2a_servers.js`

```javascript
exports.up = async (knex) => {
  await knex.schema.createTable('a2a_servers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.text('name').notNullable().unique();
    t.text('description');
    t.text('server_type').notNullable().defaultTo('copilot');
    t.integer('port').notNullable().unique();
    t.text('status').notNullable().defaultTo('created');
    t.integer('process_id');
    t.text('error_message');
    t.jsonb('config').notNullable().defaultTo('{}');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('a2a_server_configs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('server_id').references('id').inTable('a2a_servers').onDelete('CASCADE');
    t.text('copilot_direct_line_secret'); // stored encrypted
    t.text('copilot_base_url');
    t.text('orchestrate_yaml');
    t.text('orchestrate_api_url');
    t.text('orchestrate_auth_scheme').defaultTo('NONE');
    t.jsonb('orchestrate_chat_params').defaultTo('{}');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.index('server_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('a2a_server_configs');
  await knex.schema.dropTableIfExists('a2a_servers');
};
```

### `migrations/20260525000002_tasks.js`

```javascript
exports.up = (knex) =>
  knex.schema.createTable('tasks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('server_id').references('id').inTable('a2a_servers').onDelete('CASCADE');
    t.text('task_id');
    t.text('context_id');
    t.text('corr_id');
    t.text('user_message');
    t.text('agent_response');
    t.text('status').notNullable().defaultTo('working');
    t.text('error_message');
    t.timestamp('started_at').defaultTo(knex.fn.now());
    t.timestamp('completed_at');
    t.integer('duration_ms');
    t.index('server_id');
    t.index('started_at');
  });

exports.down = (knex) => knex.schema.dropTable('tasks');
```

### `migrations/20260525000003_metrics.js`

```javascript
exports.up = (knex) =>
  knex.schema.createTable('metrics', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('server_id').references('id').inTable('a2a_servers').onDelete('CASCADE');
    t.text('metric_name').notNullable();
    t.double('metric_value').notNullable();
    t.timestamp('recorded_at').defaultTo(knex.fn.now());
    t.index(['server_id', 'recorded_at']);
  });

exports.down = (knex) => knex.schema.dropTable('metrics');
```

### `migrations/20260525000004_logs.js`

```javascript
exports.up = (knex) =>
  knex.schema.createTable('logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('server_id').references('id').inTable('a2a_servers').onDelete('CASCADE');
    t.text('level').notNullable().defaultTo('INFO');
    t.text('message');
    t.jsonb('context');
    t.timestamp('logged_at').defaultTo(knex.fn.now());
    t.index(['server_id', 'logged_at']);
  });

exports.down = (knex) => knex.schema.dropTable('logs');
```

> `gen_random_uuid()` needs pgcrypto on older Postgres; on PG 13+ it's built in. Otherwise add a
> first migration: `knex.raw('create extension if not exists pgcrypto')`.

---

## Models (Knex queries)

### `model/user.js`

```javascript
const db = require('./knex');

exports.findById = (id) => db('users').where({ id }).first();
exports.findByEmail = (email) => db('users').where({ email }).first();
exports.create = async ({ email, passwordHash, isAdmin = false }) => {
  const [user] = await db('users')
    .insert({ email, password_hash: passwordHash, is_admin: isAdmin })
    .returning(['id', 'email', 'is_admin']);
  return user;
};
```

### `model/server.js`

```javascript
const db = require('./knex');

exports.list = () => db('a2a_servers').orderBy('created_at', 'desc');
exports.findById = (id) => db('a2a_servers').where({ id }).first();
exports.usedPorts = () =>
  db('a2a_servers').whereNot({ status: 'deleted' }).pluck('port');

exports.create = async (row) => {
  const [server] = await db('a2a_servers').insert(row).returning('*');
  return server;
};

exports.update = async (id, patch) => {
  const [server] = await db('a2a_servers')
    .where({ id })
    .update({ ...patch, updated_at: db.fn.now() })
    .returning('*');
  return server;
};

exports.saveConfig = (cfg) => db('a2a_server_configs').insert(cfg).returning('*');
exports.getConfig = (serverId) =>
  db('a2a_server_configs').where({ server_id: serverId }).first();
```

### `model/task.js`

```javascript
const db = require('./knex');

exports.create = (row) => db('tasks').insert(row).returning('*');
exports.complete = (id, patch) =>
  db('tasks').where({ id }).update({ ...patch, completed_at: db.fn.now() }).returning('*');

exports.listForServer = (serverId, { limit = 50, offset = 0 } = {}) =>
  db('tasks').where({ server_id: serverId })
    .orderBy('started_at', 'desc').limit(limit).offset(offset);

exports.findById = (id) => db('tasks').where({ id }).first();
```

### `model/metric.js`

```javascript
const db = require('./knex');

exports.record = (serverId, name, value) =>
  db('metrics').insert({ server_id: serverId, metric_name: name, metric_value: value });

exports.since = (serverId, sinceDate) =>
  db('metrics').where({ server_id: serverId }).andWhere('recorded_at', '>=', sinceDate);
```

---

## `services/serverManager.js` (spawn/track A2A child processes)

```javascript
const { spawn } = require('child_process');
const path = require('path');
const config = require('config');
const Server = require('../model/server');
const { generateAll } = require('./configGenerator');
const { startTailing } = require('./logTailer');

const SERVERS_DIR = path.join(process.cwd(), '.servers');
const procs = new Map(); // serverId -> ChildProcess

async function nextPort() {
  const used = new Set(await Server.usedPorts());
  const { minPort, maxPort } = config.get('a2a');
  for (let p = minPort; p < maxPort; p++) if (!used.has(p)) return p;
  throw new Error('No available ports');
}

async function createServer({ name, description, serverType = 'copilot', config: cfg }) {
  const port = await nextPort();
  const dir = path.join(SERVERS_DIR, name);
  await generateAll(dir, { name, description, serverType, config: cfg }, port);

  const server = await Server.create({
    name, description, server_type: serverType, port, status: 'created', config: cfg
  });
  return server;
}

async function startServer(id) {
  const server = await Server.findById(id);
  if (!server) throw Object.assign(new Error('Server not found'), { status: 404 });

  const dir = path.join(SERVERS_DIR, server.name);
  const child = spawn('python', ['a2a_server.py'], {
    cwd: dir,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  // surface early crashes
  child.on('exit', async (code) => {
    procs.delete(id);
    if (code !== 0) {
      await Server.update(id, { status: 'error', process_id: null, error_message: `exited ${code}` });
    } else {
      await Server.update(id, { status: 'stopped', process_id: null });
    }
  });

  procs.set(id, child);
  startTailing(id, child); // writes to logs table + WebSocket

  await new Promise((r) => setTimeout(r, 1000));
  if (child.exitCode !== null) {
    throw Object.assign(new Error('Server failed to start'), { status: 500 });
  }

  const updated = await Server.update(id, { status: 'running', process_id: child.pid, error_message: null });
  return { status: updated.status, processId: child.pid, port: server.port };
}

async function stopServer(id) {
  const child = procs.get(id);
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 2000));
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  procs.delete(id);
  await Server.update(id, { status: 'stopped', process_id: null });
}

module.exports = { createServer, startServer, stopServer, procs };
```

---

## `services/configGenerator.js` (render templates to disk)

```javascript
const fs = require('fs/promises');
const path = require('path');
const { encryptSecret } = require('../utilities/crypto');

async function generateAll(dir, cfg, port) {
  await fs.mkdir(dir, { recursive: true });
  await writeEnv(dir, cfg);
  await writeYaml(dir, cfg, port);
  await copyBridgeFiles(dir); // a2a_server.py etc. from templates/
}

async function writeEnv(dir, cfg) {
  const env = [
    `COPILOT_DIRECT_LINE_SECRET=${cfg.config.directLineSecret}`,
    `COPILOT_BASE_URL=${cfg.config.baseUrl || 'https://directline.botframework.com/v3/directline'}`,
    `WXO_TOKEN=${cfg.config.wxoToken || ''}`,
    `WXO_PUSH_NOTIFICATION_URL=${cfg.config.wxoPushUrl || ''}`
  ].join('\n');
  await fs.writeFile(path.join(dir, '.env'), env);
}

async function buildYaml(cfg, port) {
  return [
    'spec_version: v1',
    'kind: external',
    `name: ${cfg.name}`,
    `title: ${cfg.name}`,
    'provider: external_chat/A2A/0.3.0',
    `description: ${cfg.description}`,
    `api_url: "http://localhost:${port}"`,
    'auth_scheme: NONE',
    'chat_params:',
    '  sendHistory: true',
    '  stream: false',
    '  pushNotifications: true',
    ''
  ].join('\n');
}

async function writeYaml(dir, cfg, port) {
  const yaml = await buildYaml(cfg, port);
  await fs.writeFile(path.join(dir, 'orchestrate-agent.yaml'), yaml);
  return yaml;
}

async function copyBridgeFiles(dir) {
  const templatesDir = path.join(process.cwd(), 'templates');
  for (const f of ['a2a_server.py', 'a2a_agent_executor.py', 'a2a_copilot.py', 'a2a_pusher.py']) {
    await fs.copyFile(path.join(templatesDir, f), path.join(dir, f));
  }
}

module.exports = { generateAll, buildYaml };
```

---

## `services/orchestrateClient.js` (thin HTTP client to the Python worker)

```javascript
const axios = require('axios');
const config = require('config');

const workerUrl = config.get('worker.url');

async function importAgent(yamlContent) {
  try {
    const { data } = await axios.post(`${workerUrl}/agents/import`,
      new URLSearchParams({ yaml_content: yamlContent }),
      { timeout: 30000 });
    return data; // { status, output, error }
  } catch (err) {
    return { status: 'error', output: '', error: err.message };
  }
}

async function configureModel(provider, yamlContent) {
  try {
    const { data } = await axios.post(`${workerUrl}/models/configure`,
      new URLSearchParams({ provider, yaml_content: yamlContent }),
      { timeout: 30000 });
    return data;
  } catch (err) {
    return { status: 'error', output: '', error: err.message };
  }
}

module.exports = { importAgent, configureModel };
```

---

## Controllers + routers

### `controller/serversController.js`

```javascript
const Server = require('../model/server');
const manager = require('../services/serverManager');

exports.create = async (req, res, next) => {
  try {
    const { name, description, serverType, config } = req.body;
    if (!name || !config) return res.status(400).json({ error: 'name and config required' });
    const server = await manager.createServer({ name, description, serverType, config });
    res.status(201).json(server);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try { res.json(await Server.list()); } catch (err) { next(err); }
};

exports.detail = async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ error: 'not found' });
    res.json(server);
  } catch (err) { next(err); }
};

exports.start = async (req, res, next) => {
  try { res.json(await manager.startServer(req.params.id)); } catch (err) { next(err); }
};

exports.stop = async (req, res, next) => {
  try { await manager.stopServer(req.params.id); res.json({ status: 'stopped' }); }
  catch (err) { next(err); }
};
```

### `api/servers.js`

```javascript
const router = require('express').Router();
const c = require('../controller/serversController');

router.post('/', c.create);
router.get('/', c.list);
router.get('/:id', c.detail);
router.post('/:id/start', c.start);
router.post('/:id/stop', c.stop);

module.exports = router;
```

### `controller/orchestrateController.js`

```javascript
const db = require('../model/knex');
const Server = require('../model/server');
const { importAgent } = require('../services/orchestrateClient');
const { decryptSecret } = require('../utilities/crypto');

exports.importAgent = async (req, res, next) => {
  try {
    const { serverId } = req.body;
    const cfg = await Server.getConfig(serverId);
    if (!cfg) return res.status(404).json({ error: 'server config not found' });

    const [cmd] = await db('orchestrate_commands')
      .insert({ command: 'agents import', args: { serverId }, status: 'running', output: '' })
      .returning('*');

    const result = await importAgent(cfg.orchestrate_yaml);

    await db('orchestrate_commands').where({ id: cmd.id }).update({
      status: result.status === 'success' ? 'success' : 'failed',
      output: result.output, error: result.error, completed_at: db.fn.now()
    });

    res.json(result);
  } catch (err) { next(err); }
};
```

### `api/orchestrate.js`

```javascript
const router = require('express').Router();
const c = require('../controller/orchestrateController');

router.post('/agents/import', c.importAgent);
// add /tools/import, /models/configure, /connections/add as you extend the worker

module.exports = router;
```

---

## `utilities/crypto.js` (encrypt the Copilot secret at rest)

```javascript
const crypto = require('crypto');

const KEY = crypto.createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'dev-key')
  .digest(); // 32 bytes

function encryptSecret(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptSecret(blob) {
  const buf = Buffer.from(blob, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

module.exports = { encryptSecret, decryptSecret };
```

---

## `services/websocket.js` (logs + metrics streams)

```javascript
const { WebSocketServer } = require('ws');

let wss;
const clients = new Map(); // `${kind}:${serverId}` -> Set<ws>

function attachWebsockets(server) {
  wss = new WebSocketServer({ server });
  wss.on('connection', (ws, req) => {
    // url like /api/servers/<id>/logs  or  /api/metrics/<id>
    const m = req.url.match(/\/api\/servers\/([^/]+)\/logs/) || req.url.match(/\/api\/metrics\/([^/]+)/);
    if (!m) return ws.close();
    const kind = req.url.includes('/logs') ? 'logs' : 'metrics';
    const key = `${kind}:${m[1]}`;
    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(ws);
    ws.on('close', () => clients.get(key)?.delete(ws));
  });
}

function broadcast(kind, serverId, payload) {
  const set = clients.get(`${kind}:${serverId}`);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const ws of set) if (ws.readyState === ws.OPEN) ws.send(msg);
}

module.exports = { attachWebsockets, broadcast };
```

`services/logTailer.js` consumes the child's stdout/stderr, writes rows via `model` and calls
`broadcast('logs', serverId, { level, message, ts })`. `services/metricsCollector.js` ticks every
5s and calls `broadcast('metrics', serverId, summary)`.

---

## Python worker — `worker/app/main.py`

```python
from fastapi import FastAPI, UploadFile, File, Form
import subprocess, tempfile, os
from pathlib import Path

app = FastAPI()

def run(cmd, timeout):
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return {
        "status": "success" if r.returncode == 0 else "error",
        "output": r.stdout,
        "error": r.stderr if r.returncode != 0 else None,
    }

@app.post("/agents/import")
async def import_agent(yaml_content: str = Form(...)):
    with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False) as f:
        f.write(yaml_content); f.flush(); p = f.name
    try:
        return run(["uv", "run", "orchestrate", "agents", "import", "-f", p], 30)
    finally:
        os.unlink(p)

@app.post("/tools/import")
async def import_tool(tool_file: UploadFile = File(...), requirements_file: UploadFile = File(...)):
    with tempfile.TemporaryDirectory() as d:
        tp = Path(d) / tool_file.filename
        rp = Path(d) / requirements_file.filename
        tp.write_bytes(await tool_file.read())
        rp.write_bytes(await requirements_file.read())
        return run(["uv", "run", "orchestrate", "tools", "import",
                    "-k", "python", "-f", str(tp), "-r", str(rp)], 60)

@app.post("/models/configure")
async def configure_model(provider: str = Form(...), yaml_content: str = Form(...)):
    with tempfile.NamedTemporaryFile("w", suffix=".yaml", delete=False) as f:
        f.write(yaml_content); f.flush(); p = f.name
    try:
        return run(["uv", "run", "orchestrate", "models", "import", "-f", p], 30)
    finally:
        os.unlink(p)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "orchestrate-worker"}
```

`worker/requirements.txt`
```
fastapi==0.115.0
uvicorn==0.30.0
python-multipart==0.0.9
```

---

## Client (CRA) — axios instance with JWT (matches existing client pattern)

`client/src/api/client.js`
```javascript
import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5050/api' });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
```

`client/src/hooks/useServers.js`
```javascript
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useServers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/servers');
    setServers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  return { servers, loading, refresh };
}

export async function startServer(id) { return api.post(`/servers/${id}/start`); }
export async function stopServer(id) { return api.post(`/servers/${id}/stop`); }
```

`client/src/components/ServerCard.jsx` (Radix/CVA/Tailwind — your existing primitives)
```jsx
import { useNavigate } from 'react-router-dom';
import { startServer, stopServer } from '../hooks/useServers';

const badge = {
  running: 'bg-green-500', stopped: 'bg-gray-500',
  error: 'bg-red-500', created: 'bg-blue-500'
};

export default function ServerCard({ server, onChange }) {
  const navigate = useNavigate();

  const toggle = async () => {
    if (server.status === 'running') await stopServer(server.id);
    else await startServer(server.id);
    onChange?.();
  };

  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{server.name}</h3>
        <span className={`text-white text-xs px-2 py-1 rounded ${badge[server.status]}`}>
          {server.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-1">{server.description}</p>
      <p className="text-xs font-mono mt-2">port {server.port}</p>
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1 rounded bg-black text-white text-sm" onClick={toggle}>
          {server.status === 'running' ? 'Stop' : 'Start'}
        </button>
        <button className="px-3 py-1 rounded border text-sm"
          onClick={() => navigate(`/servers/${server.id}`)}>Monitor</button>
        <button className="px-3 py-1 rounded border text-sm"
          onClick={() => navigate(`/servers/${server.id}/import`)}>Import</button>
      </div>
    </div>
  );
}
```

Keep `PORT=3007` in `client/package.json`'s start script to avoid clashing with perf-insights (3006).

---

## Quick start

```bash
# Postgres (or use docker compose)
createdb sidecar   # or via your existing pg setup

cp .env.example .env      # set JWT_SECRET, DATABASE_URL, worker env
npm install
npm run migrate

# worker (needs uv + an activated orchestrate env)
cd worker && pip install -r requirements.txt && cd ..

# client deps
npm install --prefix client

# all three together
npm run dev
# API   :5050
# worker:9000
# client:3007
```

These templates follow your existing conventions one-to-one — copy `utilities/passport.js`,
`model/knex.js`, `knexfile.js`, `config/*`, and the auth controller straight from
`performance-insights` and only adjust column names. Everything else here slots into the same
`api / controller / model / migrations / utilities / services` structure.
