exports.up = (knex) =>
  knex.schema.createTable("orchestrate_commands", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("command").notNullable();
    t.jsonb("args");
    t.text("status").notNullable().defaultTo("running");
    t.text("output");
    t.text("error");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("completed_at");
    t.index("created_at");
  });

exports.down = (knex) => knex.schema.dropTable("orchestrate_commands");

// Made with Bob
