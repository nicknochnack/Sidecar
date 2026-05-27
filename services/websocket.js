const { WebSocketServer } = require("ws");

let wss;
const clients = new Map(); // `${kind}:${serverId}` -> Set<ws>

function attachWebsockets(server) {
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws, req) => {
    // url like /api/servers/<id>/logs  or  /api/metrics/<id>
    const m =
      req.url.match(/\/api\/servers\/([^/]+)\/logs/) ||
      req.url.match(/\/api\/metrics\/([^/]+)/);
    if (!m) return ws.close();
    const kind = req.url.includes("/logs") ? "logs" : "metrics";
    const key = `${kind}:${m[1]}`;
    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(ws);
    ws.on("close", () => clients.get(key)?.delete(ws));
  });
}

function broadcast(kind, serverId, payload) {
  const set = clients.get(`${kind}:${serverId}`);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const ws of set) if (ws.readyState === ws.OPEN) ws.send(msg);
}

module.exports = { attachWebsockets, broadcast };

// Made with Bob
