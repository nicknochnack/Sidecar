const db = require("./knex")();

exports.record = (serverId, name, value) =>
  db("metrics").insert({
    server_id: serverId,
    metric_name: name,
    metric_value: value,
  });

exports.since = (serverId, sinceDate) =>
  db("metrics")
    .where({ server_id: serverId })
    .andWhere("recorded_at", ">=", sinceDate);

// Made with Bob
