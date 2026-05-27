require("dotenv").config();
const http = require("http");
const config = require("config");
const app = require("./api/index");
const { attachWebsockets } = require("./services/websocket");

const port = config.get("port");
const server = http.createServer(app);

attachWebsockets(server); // /api/servers/:id/logs and /api/metrics/:id

server.listen(port, () => {
  console.log(`Sidecar API listening on ${port}`);
});

module.exports = server;

// Made with Bob
