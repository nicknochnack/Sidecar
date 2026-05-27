const db = require("./knex")();

exports.list = () => db("a2a_servers").orderBy("created_at", "desc");
exports.findById = (id) => db("a2a_servers").where({ id }).first();
exports.usedPorts = () => {
  const response = db("a2a_servers")
    .whereNot({ status: "deleted" })
    .pluck("port");
  return response;
};

exports.create = async (row) => {
  const [server] = await db("a2a_servers").insert(row).returning("*");
  return server;
};

exports.update = async (id, patch) => {
  const [server] = await db("a2a_servers")
    .where({ id })
    .update({ ...patch, updated_at: db.fn.now() })
    .returning("*");
  return server;
};

exports.saveConfig = (cfg) =>
  db("a2a_server_configs").insert(cfg).returning("*");
exports.getConfig = (serverId) =>
  db("a2a_server_configs").where({ server_id: serverId }).first();

// Made with Bob
