exports.up = function (knex) {
  return knex.schema.createTable("user_integrations", (table) => {
    table.increments("id").primary();
    table.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.string("provider").notNullable(); // 'strava' | 'intervals_icu'

    // Strava OAuth tokens
    table.text("access_token").nullable();
    table.text("refresh_token").nullable();
    table.bigInteger("token_expires_at").nullable(); // Unix timestamp in seconds

    // Shared
    table.string("provider_athlete_id").nullable(); // Strava athlete ID or Intervals.icu athlete ID

    // Intervals.icu API key
    table.text("api_key").nullable();

    // Cached provider metadata (name, photo, etc.)
    table.jsonb("athlete_profile").nullable();

    table.timestamp("date_created").defaultTo(knex.fn.now());
    table.timestamp("last_updated").defaultTo(knex.fn.now());

    table.unique(["user_id", "provider"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("user_integrations");
};
