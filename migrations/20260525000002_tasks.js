exports.up = (knex) =>
  knex.schema.createTable("tasks", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("server_id")
      .references("id")
      .inTable("a2a_servers")
      .onDelete("CASCADE");
    t.text("task_id");
    t.text("context_id");
    t.text("corr_id");
    t.text("user_message");
    t.text("agent_response");
    t.text("status").notNullable().defaultTo("working");
    t.text("error_message");
    t.timestamp("started_at").defaultTo(knex.fn.now());
    t.timestamp("completed_at");
    t.integer("duration_ms");
    t.index("server_id");
    t.index("started_at");
  });

exports.down = (knex) => knex.schema.dropTable("tasks");

// Made with Bob
