/**
 * Migration for TDC (3-day charity cycling ride) tables
 * Supports 6 pelotons, rider assignments, and activity tracking with hashtags
 */

exports.up = function (knex) {
  return (
    knex.schema
      // Pelotons table - the 6 different groups
      .createTable("pelotons", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable(); // e.g., "Peloton 1", "Red Team"
        table.string("color", 7).defaultTo("#3b82f6"); // Hex color for UI
        table.text("description");
        table.integer("max_riders").defaultTo(null); // Optional capacity limit
        table.timestamps(true, true);
      })

      // Rider-Peloton assignments
      .createTable("rider_pelotons", (table) => {
        table.increments("id").primary();
        table.uuid("user_id").notNullable();
        table.integer("peloton_id").unsigned().notNullable();
        table.boolean("is_active").defaultTo(true);
        table.timestamps(true, true);

        table.foreign("user_id").references("users.id").onDelete("CASCADE");
        table
          .foreign("peloton_id")
          .references("pelotons.id")
          .onDelete("CASCADE");
        table.unique(["user_id", "peloton_id"]);
      })

      // TDC Activities - tracks qualifying rides with hashtags
      .createTable("tdc_activities", (table) => {
        table.increments("id").primary();
        table.uuid("user_id").notNullable();
        table.integer("peloton_id").unsigned();
        table.string("activity_id", 50).notNullable(); // Strava activity ID
        table.string("source", 20).defaultTo("strava"); // 'strava' or 'intervals_icu'
        table.integer("day").notNullable(); // 1, 2, or 3
        table.string("activity_name", 255);
        table.timestamp("activity_date").notNullable();
        table.decimal("distance", 10, 2); // meters
        table.integer("moving_time"); // seconds
        table.integer("elapsed_time"); // seconds
        table.decimal("total_elevation_gain", 10, 2); // meters
        table.decimal("average_speed", 10, 2); // m/s
        table.decimal("max_speed", 10, 2); // m/s
        table.integer("average_heartrate");
        table.integer("max_heartrate");
        table.decimal("average_watts", 10, 2);
        table.decimal("weighted_average_watts", 10, 2);
        table.decimal("kilojoules", 10, 2);
        table.integer("suffer_score");
        table.text("description"); // Activity description with hashtags
        table.jsonb("segment_efforts"); // Store segment data
        table.timestamps(true, true);

        table.foreign("user_id").references("users.id").onDelete("CASCADE");
        table
          .foreign("peloton_id")
          .references("pelotons.id")
          .onDelete("SET NULL");
        table.unique(["user_id", "activity_id", "source"]);
        table.index(["day"]);
        table.index(["peloton_id"]);
        table.index(["activity_date"]);
      })

      // Awards tracking
      .createTable("tdc_awards", (table) => {
        table.increments("id").primary();
        table.string("award_type", 50).notNullable(); // 'individual', 'group', 'segment', 'stage'
        table.string("category", 100).notNullable(); // e.g., 'fastest_climb', 'most_distance', 'king_of_mountain'
        table.integer("day"); // null for overall awards
        table.uuid("user_id"); // null for group awards
        table.integer("peloton_id").unsigned(); // null for individual awards
        table.string("segment_id", 50); // Strava segment ID if applicable
        table.string("segment_name", 255);
        table.decimal("value", 10, 2).notNullable(); // The metric value (time, distance, watts, etc.)
        table.string("unit", 20); // 'seconds', 'meters', 'watts', etc.
        table.integer("activity_id").unsigned(); // Reference to tdc_activities
        table.timestamps(true, true);

        table.foreign("user_id").references("users.id").onDelete("CASCADE");
        table
          .foreign("peloton_id")
          .references("pelotons.id")
          .onDelete("CASCADE");
        table
          .foreign("activity_id")
          .references("tdc_activities.id")
          .onDelete("CASCADE");
        table.index(["award_type", "category", "day"]);
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("tdc_awards")
    .dropTableIfExists("tdc_activities")
    .dropTableIfExists("rider_pelotons")
    .dropTableIfExists("pelotons");
};

// Made with Bob
