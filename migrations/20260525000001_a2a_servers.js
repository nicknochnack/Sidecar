exports.up = async (knex) => {
  await knex.schema.createTable("a2a_servers", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("name").notNullable().unique();
    t.text("description");
    t.text("server_type").notNullable().defaultTo("copilot");
    t.integer("port").notNullable().unique();
    t.text("status").notNullable().defaultTo("created");
    t.integer("process_id");
    t.text("error_message");
    t.jsonb("config").notNullable().defaultTo("{}");
    t.timestamps(true, true);
  });

  await knex.schema.createTable("a2a_server_configs", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("server_id")
      .references("id")
      .inTable("a2a_servers")
      .onDelete("CASCADE");
    t.text("copilot_direct_line_secret");
    t.text("copilot_base_url");
    t.text("orchestrate_yaml");
    t.text("orchestrate_api_url");
    t.text("orchestrate_auth_scheme").defaultTo("NONE");
    t.jsonb("orchestrate_chat_params").defaultTo("{}");
    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.index("server_id");
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists("a2a_server_configs");
  await knex.schema.dropTableIfExists("a2a_servers");
};

// Made with Bob
