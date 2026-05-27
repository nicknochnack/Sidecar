const db = require("../model/knex")();
const Server = require("../model/server");
const {
  importAgent,
  importAgentViaAPI,
} = require("../services/orchestrateClient");

exports.importAgent = async (req, res, next) => {
  try {
    const {
      serverId,
      method,
      orchestrate_url,
      auth_token,
      push_endpoint,
      environment = "local", // 'local' or 'aws'
    } = req.body;
    console.log(
      `ServerId: ${serverId}, Method: ${method}, Environment: ${environment}`,
    );

    if (!serverId) {
      return res.status(400).json({ error: "serverId is required" });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ error: "server not found" });
    }

    const cfg = await Server.getConfig(serverId);
    if (!cfg) {
      return res.status(404).json({ error: "server config not found" });
    }

    const [cmd] = await db("orchestrate_commands")
      .insert({
        command:
          method === "api"
            ? `agents import (API - ${environment})`
            : "agents import (ADK)",
        args: { serverId, method, environment },
        status: "running",
        output: "",
      })
      .returning("*");

    let result;

    if (method === "api") {
      // API-based import
      if (!orchestrate_url || !auth_token) {
        await db("orchestrate_commands").where({ id: cmd.id }).update({
          status: "failed",
          error: "orchestrate_url and auth_token are required for API import",
          completed_at: db.fn.now(),
        });
        return res.status(400).json({
          error: "orchestrate_url and auth_token are required for API import",
        });
      }

      // Construct the API URL for the agent
      // For AWS, use public URL; for local, use docker internal
      const apiUrl =
        environment === "aws"
          ? req.body.public_api_url || `http://localhost:${server.port}`
          : `http://host.docker.internal:${server.port}`;

      // Use agent name and description from config, fallback to server name/description
      const agentName = server.config?.agentName || server.name;
      const agentDescription =
        server.config?.agentDescription ||
        server.description ||
        `A2A Agent: ${agentName}`;

      // Replace spaces with underscores for the name field
      const nameWithUnderscores = agentName.replace(/\s+/g, "_");

      result = await importAgentViaAPI({
        orchestrate_url,
        auth_token,
        name: nameWithUnderscores,
        display_name: agentName,
        description: agentDescription,
        instructions: cfg.orchestrate_yaml || "This is an A2A agent.",
        api_url: apiUrl,
        auth_scheme: cfg.orchestrate_auth_scheme || "NONE",
        chat_params: cfg.orchestrate_chat_params || {
          sendHistory: true,
          stream: false,
          pushNotifications: push_endpoint ? true : false,
        },
        environment,
      });
    } else {
      // ADK-based import (default)
      result = await importAgent(cfg.orchestrate_yaml);
    }

    await db("orchestrate_commands")
      .where({ id: cmd.id })
      .update({
        status: result.status === "success" ? "success" : "failed",
        output: result.output,
        error: result.error,
        completed_at: db.fn.now(),
      });

    res.json({ ...result, command_id: cmd.id });
  } catch (err) {
    next(err);
  }
};

exports.getCommand = async (req, res, next) => {
  try {
    const cmd = await db("orchestrate_commands")
      .where({ id: req.params.id })
      .first();
    if (!cmd) return res.status(404).json({ error: "command not found" });
    res.json(cmd);
  } catch (err) {
    next(err);
  }
};

// Made with Bob
