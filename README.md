# Sidecar

A control-plane application for building, running, importing, and monitoring A2A servers for IBM watsonx Orchestrate.

## Overview

Sidecar is a lightweight companion tool that provisions A2A (Agent-to-Agent) servers on the fly for seamless integration with watsonx Orchestrate. Like a motorcycle sidecar that rides alongside, Sidecar attaches A2A servers to Orchestrate, providing:

- **Server Management**: Create, start, stop, and monitor A2A servers
- **Orchestrate Integration**: Import agents, tools, and models into watsonx Orchestrate
- **Real-time Monitoring**: Track server health, task history, and performance metrics
- **WebSocket Streaming**: Live log tailing and metrics updates

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

### Running Migrations

```bash
# Run latest migrations
npm run migrate

# Create new migration
npm run migrate:make migration_name

# Rollback last migration
npm run migrate:rollback
```

### Testing

```bash
# Run tests (when implemented)
npm test
```

## Deployment

### Production Environment

1. Set `NODE_ENV=production`
2. Configure production database in `config/production.json`
3. Set secure JWT_SECRET and ENCRYPTION_KEY
4. Build client: `cd client && npm run build`
5. Start server: `npm start`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
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

## Support

For issues and questions, please refer to the architecture documentation in the `architecture/` directory.



Existing to command to import into localhost 
curl --location 'http://192.168.0.81:4321/v1/agents/external-chat' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYiLCJ1c2VybmFtZSI6Ind4by5hcmNoZXJAaWJtLmNvbSIsImF1ZCI6ImF1dGhlbnRpY2F0ZWQiLCJ0ZW5hbnRfaWQiOiJhNjcyMDBiNC05YWQ4LTQzYjQtYjAzYS0zZTI5YThhYWM0ZDQiLCJ3b1RlbmFudElkIjoiYTY3MjAwYjQtOWFkOC00M2I0LWIwM2EtM2UyOWE4YWFjNGQ0Iiwid29Vc2VySWQiOiJmMjQyZWFkZi0wZGM5LTRlYWUtYjJkNy02NWIwOWI0YjRiMTYifQ.q4m3TVAauKWhx4h1BlFZr-m719nmtAtC1TcIskvd3VI' \
--data '{
  "name": "CopilotMockData2",
  "display_name": "CopilotMockData2",
  "description": "This agent is great at generating synthetic finance data using its mock finance data tool.",
  "instructions": "instructions here",
  "provider": "external_chat/A2A/0.3.0", 
  "kind":"external", 
  "api_url":"http://host.docker.internal:9997",
  "auth_scheme": "NONE",
  "chat_params":{
      "sendHistory":"true", 
      "stream":"false", 
      "pushNotifications":"true"
  }
}'

