const db = require("./knex")();

exports.create = (row) => db("tasks").insert(row).returning("*");
exports.complete = (id, patch) =>
  db("tasks")
    .where({ id })
    .update({ ...patch, completed_at: db.fn.now() })
    .returning("*");

exports.listForServer = (serverId, { limit = 50, offset = 0 } = {}) =>
  db("tasks")
    .where({ server_id: serverId })
    .orderBy("started_at", "desc")
    .limit(limit)
    .offset(offset);

exports.findById = (id) => db("tasks").where({ id }).first();

// Made with Bob
