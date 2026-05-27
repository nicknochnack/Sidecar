exports.up = (knex) =>
  knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.text("email").notNullable().unique();
    t.text("password_hash").notNullable();
    t.boolean("is_admin").notNullable().defaultTo(false);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTable("users");

// Made with Bob
