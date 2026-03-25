exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary();
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("reset_token").nullable();
    table.timestamp("reset_token_expiry").nullable();
    table.timestamp("date_created").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
