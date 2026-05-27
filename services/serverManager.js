const { spawn } = require("child_process");
const path = require("path");
const config = require("config");
const Server = require("../model/server");
const { generateAll } = require("./configGenerator");
const { startTailing } = require("./logTailer");

const SERVERS_DIR = path.join(process.cwd(), "servers");
const procs = new Map(); // serverId -> ChildProcess

async function nextPort() {
  const used = new Set(await Server.usedPorts());
  const { minPort, maxPort } = config.get("a2a");
  for (let p = minPort; p < maxPort; p++) if (!used.has(p)) return p;
  throw new Error("No available ports");
}

async function createServer({
  name,
  description,
  serverType = "copilot",
  config: cfg,
}) {
  const port = await nextPort();
  const dir = path.join(SERVERS_DIR, name);
  const yaml = await generateAll(
    dir,
    { name, description, serverType, config: cfg },
    port,
  );

  const server = await Server.create({
    name,
    description,
    server_type: serverType,
    port,
    status: "created",
    config: cfg,
  });

  // Save config to separate table for orchestrate import
  await Server.saveConfig({
    server_id: server.id,
    copilot_direct_line_secret: cfg.directLineSecret,
    copilot_base_url:
      cfg.baseUrl || "https://directline.botframework.com/v3/directline",
    orchestrate_yaml: yaml,
    orchestrate_api_url: `http://localhost:${port}`,
    orchestrate_auth_scheme: "NONE",
    orchestrate_chat_params: {
      sendHistory: true,
      stream: false,
      pushNotifications: true,
    },
  });

  return server;
}

async function startServer(id) {
  const server = await Server.findById(id);
  if (!server)
    throw Object.assign(new Error("Server not found"), { status: 404 });

  const serverDir = path.join(SERVERS_DIR, server.name);

  // Build environment variables from server config
  const env = {
    ...process.env,
    A2A_PORT: server.port.toString(),
    COPILOT_DIRECT_LINE_SECRET: server.config?.directLineSecret || "",
    COPILOT_BASE_URL:
      server.config?.baseUrl ||
      "https://directline.botframework.com/v3/directline",
    WXO_TOKEN: server.config?.wxoToken || "",
    WXO_PUSH_NOTIFICATION_URL: server.config?.wxoPushUrl || "",
  };

  const child = spawn("uv", ["run", `${server.name}/a2a_server.py`], {
    cwd: SERVERS_DIR,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  // surface early crashes
  child.on("exit", async (code) => {
    procs.delete(id);
    if (code !== 0) {
      await Server.update(id, {
        status: "error",
        process_id: null,
        error_message: `exited ${code}`,
      });
    } else {
      await Server.update(id, { status: "stopped", process_id: null });
    }
  });

  procs.set(id, child);
  startTailing(id, child); // writes to logs table + WebSocket

  await new Promise((r) => setTimeout(r, 1000));
  if (child.exitCode !== null) {
    throw Object.assign(new Error("Server failed to start"), { status: 500 });
  }

  const updated = await Server.update(id, {
    status: "running",
    process_id: child.pid,
    error_message: null,
  });
  return { status: updated.status, processId: child.pid, port: server.port };
}

async function stopServer(id) {
  const child = procs.get(id);
  if (child && child.exitCode === null) {
    child.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 2000));
    if (child.exitCode === null) child.kill("SIGKILL");
  }
  procs.delete(id);
  await Server.update(id, { status: "stopped", process_id: null });
}

module.exports = { createServer, startServer, stopServer, procs };

// Made with Bob
