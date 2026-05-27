exports.up = (knex) =>
  knex.schema.createTable("logs", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("server_id")
      .references("id")
      .inTable("a2a_servers")
      .onDelete("CASCADE");
    t.text("level").notNullable().defaultTo("INFO");
    t.text("message");
    t.jsonb("context");
    t.timestamp("logged_at").defaultTo(knex.fn.now());
    t.index(["server_id", "logged_at"]);
  });

exports.down = (knex) => knex.schema.dropTable("logs");

// Made with Bob
