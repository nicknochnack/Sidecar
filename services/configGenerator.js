const fs = require("fs/promises");
const path = require("path");
const { encryptSecret } = require("../utilities/crypto");

async function generateAll(dir, cfg, port) {
  await fs.mkdir(dir, { recursive: true });
  await writeEnv(dir, cfg, port);
  const yaml = await writeYaml(dir, cfg, port);
  await copyBridgeFiles(dir, cfg, port); // a2a_server.py etc. from templates/
  return yaml;
}

async function writeEnv(dir, cfg, port) {
  const env = [
    `A2A_PORT=${port}`,
    `COPILOT_DIRECT_LINE_SECRET=${cfg.config.directLineSecret || ""}`,
    `COPILOT_BASE_URL=${cfg.config.baseUrl || "https://directline.botframework.com/v3/directline"}`,
    `WXO_TOKEN=${cfg.config.wxoToken || ""}`,
    `WXO_PUSH_NOTIFICATION_URL=${cfg.config.wxoPushUrl || ""}`,
  ].join("\n");
  await fs.writeFile(path.join(dir, ".env"), env);
}

async function buildYaml(cfg, port) {
  // Use agent name from config, fallback to server name
  const agentName = cfg.config.agentName || cfg.name;
  const agentDescription = cfg.config.agentDescription || cfg.description;

  // Replace spaces with underscores for the name field
  const nameWithUnderscores = agentName.replace(/\s+/g, "_");

  return [
    "spec_version: v1",
    "kind: external",
    `name: ${nameWithUnderscores}`,
    `title: ${agentName}`,
    "provider: external_chat/A2A/0.3.0",
    `description: ${agentDescription}`,
    `api_url: "http://localhost:${port}"`,
    "auth_scheme: NONE",
    "chat_params:",
    "  sendHistory: true",
    "  stream: false",
    "  pushNotifications: true",
    "",
  ].join("\n");
}

async function writeYaml(dir, cfg, port) {
  const yaml = await buildYaml(cfg, port);
  await fs.writeFile(path.join(dir, "orchestrate-agent.yaml"), yaml);
  return yaml;
}

async function generateServerPy(dir, cfg, port) {
  const agentName = cfg.config.agentName || cfg.name;
  const agentDescription =
    cfg.config.agentDescription || cfg.description || "A2A Agent";
  const agentTags = cfg.config.agentTags || [];
  const agentExamples = cfg.config.agentExamples || [];

  // Escape strings for Python - replace quotes and newlines
  const escapePython = (str) =>
    str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "");

  const escapedName = escapePython(agentName);
  const escapedDescription = escapePython(agentDescription);
  const tagsStr = agentTags.map((t) => `'${escapePython(t)}'`).join(", ");
  const examplesStr = agentExamples
    .map((e) => `\n            '${escapePython(e)}',`)
    .join("");

  const content = `import os
import uvicorn
from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware import Middleware
from dotenv import load_dotenv

from a2a.server.routes import (
    create_agent_card_routes,
    create_jsonrpc_routes,
)
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a_agent_executor import CopilotAgentExecutor
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentInterface,
    AgentSkill,
)

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    # Get port from environment variable
    port = int(os.getenv('A2A_PORT', '${port}'))
    
    skill = AgentSkill(
        id='${agentName.toLowerCase().replace(/\s+/g, "_")}_agent',
        name='${escapedName}',
        description='${escapedDescription}',
        tags=[${tagsStr}],
        examples=[${examplesStr}
        ],
    )

    public_agent_card = AgentCard(
        name='${escapedName}',
        description='${escapedDescription}',
        version='0.0.1',
        default_input_modes=['text/plain'],
        default_output_modes=['text/plain'],
        capabilities=AgentCapabilities(
            streaming=False, extended_agent_card=False
        ),
        supported_interfaces=[
            AgentInterface(
                protocol_binding='JSONRPC',
                url=f'http://127.0.0.1:{port}',
            )
        ],
        skills=[skill],
    )

    request_handler = DefaultRequestHandler(
        agent_executor=CopilotAgentExecutor(),
        task_store = InMemoryTaskStore(),
        agent_card = public_agent_card
    )

routes = [*create_agent_card_routes(public_agent_card), *create_jsonrpc_routes(request_handler, '/', enable_v0_3_compat=True )]

class LogRequestMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        body = await request.body()
        print(f"Incoming request: {body.decode()}")
        return await call_next(request)

app = Starlette(routes=routes, middleware=[
    Middleware(LogRequestMiddleware)
])

print(f"Starting A2A server on port {port}")
uvicorn.run(app, host="0.0.0.0", port=port, access_log=True, log_level="debug")
`;

  await fs.writeFile(path.join(dir, "a2a_server.py"), content);
}

async function copyBridgeFiles(dir, cfg, port) {
  const templatesDir = path.join(process.cwd(), "templates");

  // Generate customized a2a_server.py
  await generateServerPy(dir, cfg, port);

  // Copy other files as-is
  for (const f of [
    "a2a_agent_executor.py",
    "a2a_copilot.py",
    "a2a_pusher.py",
  ]) {
    await fs.copyFile(path.join(templatesDir, f), path.join(dir, f));
  }
}

module.exports = { generateAll, buildYaml };

// Made with Bob
