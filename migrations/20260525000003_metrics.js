exports.up = (knex) =>
  knex.schema.createTable("metrics", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("server_id")
      .references("id")
      .inTable("a2a_servers")
      .onDelete("CASCADE");
    t.text("metric_name").notNullable();
    t.double("metric_value").notNullable();
    t.timestamp("recorded_at").defaultTo(knex.fn.now());
    t.index(["server_id", "recorded_at"]);
  });

exports.down = (knex) => knex.schema.dropTable("metrics");

// Made with Bob
