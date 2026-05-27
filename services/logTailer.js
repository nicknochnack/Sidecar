const db = require("../model/knex")();
const { broadcast } = require("./websocket");

function startTailing(serverId, childProcess) {
  const handleOutput = (data, level) => {
    const message = data.toString().trim();
    if (!message) return;

    // Write to database
    db("logs")
      .insert({
        server_id: serverId,
        level,
        message,
        logged_at: db.fn.now(),
      })
      .catch((err) => console.error("Failed to write log:", err));

    // Broadcast to WebSocket clients
    broadcast("logs", serverId, {
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  };

  childProcess.stdout.on("data", (data) => handleOutput(data, "INFO"));
  childProcess.stderr.on("data", (data) => handleOutput(data, "ERROR"));
}

module.exports = { startTailing };

// Made with Bob
