/**
 * Add admin flag to users table for TDC admin functionality
 */

exports.up = function (knex) {
  return knex.schema.table("users", (table) => {
    table.boolean("is_admin").defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", (table) => {
    table.dropColumn("is_admin");
  });
};

// Made with Bob
