const Server = require("../model/server");
const manager = require("../services/serverManager");

exports.create = async (req, res, next) => {
  try {
    const { name, description, serverType, config } = req.body;
    if (!name || !config)
      return res.status(400).json({ error: "name and config required" });
    const server = await manager.createServer({
      name,
      description,
      serverType,
      config,
    });
    res.status(201).json(server);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json(await Server.list());
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ error: "not found" });
    res.json(server);
  } catch (err) {
    next(err);
  }
};

exports.start = async (req, res, next) => {
  try {
    res.json(await manager.startServer(req.params.id));
  } catch (err) {
    next(err);
  }
};

exports.stop = async (req, res, next) => {
  try {
    await manager.stopServer(req.params.id);
    res.json({ status: "stopped" });
  } catch (err) {
    next(err);
  }
};

exports.status = async (req, res, next) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ error: "not found" });

    const isRunning = server.status === "running" && server.process_id;
    res.json({
      status: server.status,
      port: server.port,
      processId: server.process_id,
      isRunning,
    });
  } catch (err) {
    next(err);
  }
};

// Made with Bob
