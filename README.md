# Sidecar

A dev helper app for adding a bunch of stuff into IBM watsonx Orchestrate.

## See it live and in action 📺
<a href="https://www.linkedin.com/feed/update/urn:li:activity:7466031202953601025/"><img src="https://i.imgur.com/5TzTzVy.jpeg"/></a>

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│  React Client (CRA)                    :3007               │
│  Radix UI + Tailwind + CVA + recharts                      │
└───────────────┬────────────────────────────────────────────┘
                │ REST + WebSocket
┌───────────────▼────────────────────────────────────────────┐
│  Node API (Express)                    :5050               │
│  JWT Auth • Knex + PostgreSQL • WebSocket                  │
│  • A2A server lifecycle management                         │
│  • Config generation & process management                  │
│  • Metrics & task history tracking                         │
└───────┬───────────────────────┬─────────────────────────┬──┘
        │ spawns                 │ HTTP                     │ SQL
        │                        │                          │
┌───────▼─────────┐   ┌──────────▼───────────┐   ┌─────────▼────────┐
│ A2A servers     │   │ Python worker  :9000 │   │ PostgreSQL :5898 │
│ (Copilot bridge)│   │ FastAPI              │   │ Knex migrations  │
│ :9997+ ports    │   │ runs orchestrate CLI │   │                  │
└─────────────────┘   └──────────────────────┘   └──────────────────┘
```

## Prerequisites

- **Node.js** 18.x
- **npm** 9.x
- **PostgreSQL** (running on port 5898)
- **Python** 3.9+ with `uv` package manager
- **watsonx Orchestrate** credentials (for ADK commands)

## Setup

### 1. Clone and Install Dependencies

```bash
# Install Node dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install Python worker dependencies
cd worker && pip install -r requirements.txt && cd ..
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - JWT_SECRET
# - DATABASE_URL (PostgreSQL on port 5898)
# - ENCRYPTION_KEY
# - WO_ENTITLEMENT_KEY (for Orchestrate)
# - WATSONX_APIKEY
```

### 3. Database Setup

```bash
# Run migrations
npm run migrate

# Verify database connection
psql -h localhost -p 5898 -U sidecar -d sidecar
```

### 4. Start Development Servers

```bash
# Start all services (API + Worker + Client)
npm run dev

# Or start individually:
npm run server   # API on :5050
npm run worker   # Python worker on :9000
npm run client   # React app on :3007
```

## Configuration

### Database (config/default.json)

```json
{
  "port": 5050,
  "database": {
    "client": "pg",
    "connection": {
      "host": "localhost",
      "port": 5898,
      "user": "sidecar",
      "password": "sidecar",
      "database": "sidecar"
    }
  },
  "worker": { "url": "http://localhost:9000" },
  "a2a": { "minPort": 9997, "maxPort": 10100 }
}
```

### Environment Variables (.env)

```bash
# Security
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key

# Database
DATABASE_URL=postgresql://sidecar:sidecar@localhost:5898/sidecar

# API
PORT=5050
CLIENT_URL=http://localhost:3007

# Python Worker
WORKER_URL=http://localhost:9000

# Watsonx Orchestrate
WO_DEVELOPER_EDITION_SOURCE=myibm
WO_ENTITLEMENT_KEY=your-entitlement-key
WATSONX_APIKEY=your-api-key
WATSONX_SPACE_ID=your-space-id
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Servers
- `POST /api/servers` - Create new A2A server
- `GET /api/servers` - List all servers
- `GET /api/servers/:id` - Get server details
- `POST /api/servers/:id/start` - Start server
- `POST /api/servers/:id/stop` - Stop server
- `GET /api/servers/:id/status` - Get server status
- `WS /api/servers/:id/logs` - Stream server logs

### Orchestrate
- `POST /api/orchestrate/agents/import` - Import agent to Orchestrate
- `GET /api/orchestrate/commands/:id` - Get command status

### Metrics
- `GET /api/servers/:id/tasks` - Get task history
- `GET /api/servers/:id/metrics` - Get performance metrics
- `GET /api/servers/:id/metrics/summary` - Get metrics summary

## Development

### Project Structure

```
sidecar/
├── api/                    # Express route definitions
├── controller/             # Business logic
├── model/                  # Database queries (Knex)
├── migrations/             # Database migrations
├── services/               # Core services
│   ├── serverManager.js    # A2A server lifecycle
│   ├── configGenerator.js  # Config file generation
│   ├── orchestrateClient.js # Python worker client
│   ├── logTailer.js        # Log streaming
│   └── websocket.js        # WebSocket management
├── utilities/              # Helper functions
├── templates/              # A2A server templates
├── worker/                 # Python FastAPI worker
│   └── app/main.py
├── client/                 # React frontend
└── config/                 # Configuration files
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running on port 5898
- Check DATABASE_URL in .env
- Ensure database user has proper permissions

### Port Conflicts
- API: 5050
- Worker: 9000
- Client: 3007
- A2A Servers: 9997-10100

### Migration Errors
- Ensure database exists: `createdb sidecar`
- Check knexfile.js configuration
- Verify PostgreSQL version supports `gen_random_uuid()`

## License

ISC