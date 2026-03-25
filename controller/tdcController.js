const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../model/knex")();
const Integration = require("../model/integration");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helper Functions ────────────────────────────────────────────────────────

// Check if user is admin
function requireAdmin(req, res, next) {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Fetch from Intervals.icu API
async function intervalsGet(integration, path, params = {}) {
  const res = await axios.get(
    `https://intervals.icu/api/v1/athlete/${integration.provider_athlete_id}${path}`,
    {
      auth: { username: "API_KEY", password: integration.api_key },
      params,
    },
  );
  return res.data;
}

// Parse hashtags from activity tags array or description
function parseHashtags(activity) {
  // Check tags array first (Intervals.icu stores tags here)
  const tags = activity.tags || [];
  const tagsLower = tags.map((t) => t.toLowerCase().replace(/^#/, "")); // Remove leading # if present

  // Also check description as fallback
  const description = activity.description || "";
  const descLower = description.toLowerCase();

  // Check for tdc tag (with or without #)
  const isTDC =
    tagsLower.includes("tdc") ||
    descLower.includes("#tdc") ||
    descLower.includes("tdc");

  // Check for day tags (with or without #)
  let day = null;
  if (
    tagsLower.includes("day1") ||
    descLower.includes("#day1") ||
    descLower.includes("day1")
  ) {
    day = 1;
  } else if (
    tagsLower.includes("day2") ||
    descLower.includes("#day2") ||
    descLower.includes("day2")
  ) {
    day = 2;
  } else if (
    tagsLower.includes("day3") ||
    descLower.includes("#day3") ||
    descLower.includes("day3")
  ) {
    day = 3;
  }

  return { isTDC, day };
}

// ─── Controller ──────────────────────────────────────────────────────────────

const tdcController = {
  // ─── Peloton Management ────────────────────────────────────────────────────

  async getPelotons(req, res) {
    try {
      const pelotons = await db("pelotons").select("*").orderBy("id");

      // Add rider counts
      const pelotonsWithCounts = await Promise.all(
        pelotons.map(async (p) => {
          const [{ count }] = await db("rider_pelotons")
            .where({ peloton_id: p.id, is_active: true })
            .count();
          return { ...p, rider_count: parseInt(count) };
        }),
      );

      res.json(pelotonsWithCounts);
    } catch (error) {
      console.error("Get pelotons error:", error);
      res.status(500).json({ error: "Failed to fetch pelotons" });
    }
  },

  async createPeloton(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { name, color, description, max_riders } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Peloton name is required" });
      }

      const [peloton] = await db("pelotons")
        .insert({ name, color, description, max_riders })
        .returning("*");

      res.json(peloton);
    } catch (error) {
      console.error("Create peloton error:", error);
      res.status(500).json({ error: "Failed to create peloton" });
    }
  },

  async updatePeloton(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      const { name, color, description, max_riders } = req.body;

      const [peloton] = await db("pelotons")
        .where({ id })
        .update({
          name,
          color,
          description,
          max_riders,
          updated_at: db.fn.now(),
        })
        .returning("*");

      if (!peloton) {
        return res.status(404).json({ error: "Peloton not found" });
      }

      res.json(peloton);
    } catch (error) {
      console.error("Update peloton error:", error);
      res.status(500).json({ error: "Failed to update peloton" });
    }
  },

  async deletePeloton(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { id } = req.params;
      await db("pelotons").where({ id }).delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Delete peloton error:", error);
      res.status(500).json({ error: "Failed to delete peloton" });
    }
  },

  // ─── User Peloton Selection ────────────────────────────────────────────────

  async getMyPeloton(req, res) {
    try {
      const assignment = await db("rider_pelotons")
        .join("pelotons", "rider_pelotons.peloton_id", "pelotons.id")
        .where({ user_id: req.user.id, is_active: true })
        .select("pelotons.*", "rider_pelotons.created_at as joined_at")
        .first();

      res.json(assignment || null);
    } catch (error) {
      console.error("Get my peloton error:", error);
      res.status(500).json({ error: "Failed to fetch peloton assignment" });
    }
  },

  async joinPeloton(req, res) {
    try {
      const { peloton_id } = req.body;

      if (!peloton_id) {
        return res.status(400).json({ error: "Peloton ID is required" });
      }

      // Check if peloton exists
      const peloton = await db("pelotons").where({ id: peloton_id }).first();
      if (!peloton) {
        return res.status(404).json({ error: "Peloton not found" });
      }

      // Check capacity
      if (peloton.max_riders) {
        const [{ count }] = await db("rider_pelotons")
          .where({ peloton_id, is_active: true })
          .count();
        if (parseInt(count) >= peloton.max_riders) {
          return res.status(400).json({ error: "Peloton is full" });
        }
      }

      // Deactivate any existing assignments
      await db("rider_pelotons")
        .where({ user_id: req.user.id })
        .update({ is_active: false });

      // Create new assignment
      const [assignment] = await db("rider_pelotons")
        .insert({ user_id: req.user.id, peloton_id, is_active: true })
        .returning("*");

      res.json({ ...assignment, peloton });
    } catch (error) {
      console.error("Join peloton error:", error);
      res.status(500).json({ error: "Failed to join peloton" });
    }
  },

  async leavePeloton(req, res) {
    try {
      await db("rider_pelotons")
        .where({ user_id: req.user.id })
        .update({ is_active: false });

      res.json({ success: true });
    } catch (error) {
      console.error("Leave peloton error:", error);
      res.status(500).json({ error: "Failed to leave peloton" });
    }
  },

  // ─── Activity Sync ─────────────────────────────────────────────────────────

  async syncTDCActivities(req, res) {
    try {
      const intervals = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );

      if (!intervals) {
        return res.status(400).json({ error: "Intervals.icu not connected" });
      }

      // Get user's peloton
      const assignment = await db("rider_pelotons")
        .where({ user_id: req.user.id, is_active: true })
        .first();

      // Fetch recent activities from Intervals.icu
      const oldest = new Date();
      oldest.setDate(oldest.getDate() - 60);
      const activities = await intervalsGet(intervals, "/activities", {
        oldest: oldest.toISOString().split("T")[0],
        newest: new Date().toISOString().split("T")[0],
      });

      // Debug: Log the structure of the activities response
      console.log("Activities response type:", typeof activities);
      console.log("Activities is array:", Array.isArray(activities));
      if (activities && activities.length > 0) {
        console.log(
          "First activity sample:",
          JSON.stringify(activities[0], null, 2),
        );
      }

      let syncedCount = 0;

      for (const activity of activities) {
        try {
          // Try to fetch full details for all activities (including Strava)
          console.log(
            `Fetching details for ${activity.source} activity: ${activity.id}`,
          );

          let fullActivity;
          try {
            const fullActivityResponse = await intervalsGet(
              intervals,
              `/activities/${activity.id}`,
            );

            // API returns an array with single activity, extract it
            fullActivity = Array.isArray(fullActivityResponse)
              ? fullActivityResponse[0]
              : fullActivityResponse;
          } catch (error) {
            console.log(
              `  -> Could not fetch details for ${activity.source} activity ${activity.id}: ${error.message}`,
            );
            continue;
          }

          console.log(
            `  -> Activity: ${fullActivity?.name}, tags: ${JSON.stringify(fullActivity?.tags)}, description: ${fullActivity?.description?.substring(0, 100)}`,
          );

          const { isTDC, day } = parseHashtags(fullActivity);

          if (isTDC && day) {
            // Check if already synced
            const existing = await db("tdc_activities")
              .where({
                user_id: req.user.id,
                activity_id: String(activity.id),
                source: "intervals_icu",
              })
              .first();

            if (!existing) {
              await db("tdc_activities").insert({
                user_id: req.user.id,
                peloton_id: assignment?.peloton_id || null,
                activity_id: String(activity.id),
                source: "intervals_icu",
                day,
                activity_name: fullActivity.name,
                activity_date: fullActivity.start_date_local,
                distance: fullActivity.distance,
                moving_time: fullActivity.moving_time,
                elapsed_time: fullActivity.elapsed_time,
                total_elevation_gain: fullActivity.total_elevation_gain,
                average_speed: fullActivity.average_speed,
                max_speed: fullActivity.max_speed,
                average_heartrate: fullActivity.average_hr,
                max_heartrate: fullActivity.max_hr,
                average_watts: fullActivity.average_watts,
                weighted_average_watts: fullActivity.weighted_avg_watts,
                kilojoules: fullActivity.icu_training_load,
                suffer_score: null,
                description: fullActivity.description,
              });
              syncedCount++;
            }
          }
        } catch (error) {
          console.error(
            `Error processing activity ${activity.id}:`,
            error.message,
          );
        }
      }

      res.json({ synced: syncedCount, total: activities.length });
    } catch (error) {
      console.error("Sync TDC activities error:", error);
      res.status(500).json({ error: "Failed to sync activities" });
    }
  },

  async getTDCActivities(req, res) {
    try {
      const { peloton_id, day } = req.query;

      let query = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select(
          "tdc_activities.*",
          "users.email as user_email",
          "pelotons.name as peloton_name",
          "pelotons.color as peloton_color",
        )
        .orderBy("tdc_activities.activity_date", "desc");

      // Non-admin users can only see their own activities
      if (!req.user.is_admin) {
        query = query.where("tdc_activities.user_id", req.user.id);
      }

      if (peloton_id) {
        query = query.where("tdc_activities.peloton_id", peloton_id);
      }

      if (day) {
        query = query.where("tdc_activities.day", day);
      }

      const activities = await query;
      res.json(activities);
    } catch (error) {
      console.error("Get TDC activities error:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  },

  async getTDCActivitiesByDay(req, res) {
    try {
      const { day } = req.params;

      let query = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .where("tdc_activities.day", day)
        .select(
          "tdc_activities.*",
          "users.email as user_email",
          "pelotons.name as peloton_name",
          "pelotons.color as peloton_color",
        )
        .orderBy("tdc_activities.activity_date", "desc");

      if (!req.user.is_admin) {
        query = query.where("tdc_activities.user_id", req.user.id);
      }

      const activities = await query;
      res.json(activities);
    } catch (error) {
      console.error("Get TDC activities by day error:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  },

  // ─── Admin Analytics ───────────────────────────────────────────────────────

  async getAdminOverview(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      // Total stats
      const [totalRiders] = await db("rider_pelotons")
        .where({ is_active: true })
        .count();

      const [totalActivities] = await db("tdc_activities").count();

      const [totalDistance] =
        await db("tdc_activities").sum("distance as total");

      // Per-day stats
      const dayStats = await db("tdc_activities")
        .select("day")
        .count("* as activity_count")
        .sum("distance as total_distance")
        .avg("average_watts as avg_watts")
        .groupBy("day")
        .orderBy("day");

      // Per-peloton stats
      const pelotonStats = await db("tdc_activities")
        .join("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select("pelotons.id", "pelotons.name", "pelotons.color")
        .count("* as activity_count")
        .sum("distance as total_distance")
        .avg("average_watts as avg_watts")
        .groupBy("pelotons.id", "pelotons.name", "pelotons.color");

      res.json({
        total_riders: parseInt(totalRiders.count),
        total_activities: parseInt(totalActivities.count),
        total_distance: parseFloat(totalDistance.total) || 0,
        day_stats: dayStats,
        peloton_stats: pelotonStats,
      });
    } catch (error) {
      console.error("Get admin overview error:", error);
      res.status(500).json({ error: "Failed to fetch overview" });
    }
  },

  async getPelotonComparison(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { day } = req.query;

      let query = db("tdc_activities")
        .join("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select(
          "pelotons.id",
          "pelotons.name",
          "pelotons.color",
          "tdc_activities.day",
        )
        .count("* as ride_count")
        .sum("distance as total_distance")
        .avg("distance as avg_distance")
        .avg("moving_time as avg_time")
        .avg("average_watts as avg_watts")
        .avg("total_elevation_gain as avg_elevation")
        .groupBy(
          "pelotons.id",
          "pelotons.name",
          "pelotons.color",
          "tdc_activities.day",
        )
        .orderBy("pelotons.id")
        .orderBy("tdc_activities.day");

      if (day) {
        query = query.where("tdc_activities.day", day);
      }

      const comparison = await query;
      res.json(comparison);
    } catch (error) {
      console.error("Get peloton comparison error:", error);
      res.status(500).json({ error: "Failed to fetch peloton comparison" });
    }
  },

  async getRiderComparison(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { peloton_id, day } = req.query;

      let query = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select(
          "users.id as user_id",
          "users.email",
          "pelotons.name as peloton_name",
          "tdc_activities.day",
        )
        .count("* as ride_count")
        .sum("distance as total_distance")
        .avg("distance as avg_distance")
        .avg("moving_time as avg_time")
        .avg("average_watts as avg_watts")
        .avg("average_heartrate as avg_hr")
        .max("average_watts as max_watts")
        .sum("total_elevation_gain as total_elevation")
        .groupBy(
          "users.id",
          "users.email",
          "pelotons.name",
          "tdc_activities.day",
        )
        .orderBy("total_distance", "desc");

      if (peloton_id) {
        query = query.where("tdc_activities.peloton_id", peloton_id);
      }

      if (day) {
        query = query.where("tdc_activities.day", day);
      }

      const comparison = await query;
      res.json(comparison);
    } catch (error) {
      console.error("Get rider comparison error:", error);
      res.status(500).json({ error: "Failed to fetch rider comparison" });
    }
  },

  async getLeaderboards(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { day } = req.query;

      // Distance leaderboard
      let distanceQuery = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select(
          "users.id as user_id",
          "users.email",
          "pelotons.name as peloton_name",
        )
        .sum("distance as total_distance")
        .groupBy("users.id", "users.email", "pelotons.name")
        .orderBy("total_distance", "desc")
        .limit(10);

      // Elevation leaderboard
      let elevationQuery = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .select(
          "users.id as user_id",
          "users.email",
          "pelotons.name as peloton_name",
        )
        .sum("total_elevation_gain as total_elevation")
        .groupBy("users.id", "users.email", "pelotons.name")
        .orderBy("total_elevation", "desc")
        .limit(10);

      // Power leaderboard
      let powerQuery = db("tdc_activities")
        .join("users", "tdc_activities.user_id", "users.id")
        .leftJoin("pelotons", "tdc_activities.peloton_id", "pelotons.id")
        .whereNotNull("average_watts")
        .select(
          "users.id as user_id",
          "users.email",
          "pelotons.name as peloton_name",
        )
        .avg("average_watts as avg_watts")
        .groupBy("users.id", "users.email", "pelotons.name")
        .orderBy("avg_watts", "desc")
        .limit(10);

      if (day) {
        distanceQuery = distanceQuery.where("tdc_activities.day", day);
        elevationQuery = elevationQuery.where("tdc_activities.day", day);
        powerQuery = powerQuery.where("tdc_activities.day", day);
      }

      const [distance, elevation, power] = await Promise.all([
        distanceQuery,
        elevationQuery,
        powerQuery,
      ]);

      res.json({
        distance,
        elevation,
        power,
      });
    } catch (error) {
      console.error("Get leaderboards error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboards" });
    }
  },

  // ─── Awards ────────────────────────────────────────────────────────────────

  async getAwards(req, res) {
    try {
      let query = db("tdc_awards")
        .leftJoin("users", "tdc_awards.user_id", "users.id")
        .leftJoin("pelotons", "tdc_awards.peloton_id", "pelotons.id")
        .select(
          "tdc_awards.*",
          "users.email as user_email",
          "pelotons.name as peloton_name",
        )
        .orderBy("tdc_awards.day")
        .orderBy("tdc_awards.award_type")
        .orderBy("tdc_awards.value", "desc");

      const awards = await query;
      res.json(awards);
    } catch (error) {
      console.error("Get awards error:", error);
      res.status(500).json({ error: "Failed to fetch awards" });
    }
  },

  async getAwardsByDay(req, res) {
    try {
      const { day } = req.params;

      const awards = await db("tdc_awards")
        .leftJoin("users", "tdc_awards.user_id", "users.id")
        .leftJoin("pelotons", "tdc_awards.peloton_id", "pelotons.id")
        .where("tdc_awards.day", day)
        .select(
          "tdc_awards.*",
          "users.email as user_email",
          "pelotons.name as peloton_name",
        )
        .orderBy("tdc_awards.award_type")
        .orderBy("tdc_awards.value", "desc");

      res.json(awards);
    } catch (error) {
      console.error("Get awards by day error:", error);
      res.status(500).json({ error: "Failed to fetch awards" });
    }
  },

  async calculateAwards(req, res) {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const { day } = req.body;

      // Clear existing awards for this day
      if (day) {
        await db("tdc_awards").where({ day }).delete();
      } else {
        await db("tdc_awards").whereNull("day").delete();
      }

      const awards = [];

      // Individual awards

      // Longest distance
      const longestDistance = await db("tdc_activities")
        .where(day ? { day } : {})
        .orderBy("distance", "desc")
        .first();

      if (longestDistance) {
        awards.push({
          award_type: "individual",
          category: "longest_distance",
          day,
          user_id: longestDistance.user_id,
          value: longestDistance.distance,
          unit: "meters",
          activity_id: longestDistance.id,
        });
      }

      // Most elevation
      const mostElevation = await db("tdc_activities")
        .where(day ? { day } : {})
        .orderBy("total_elevation_gain", "desc")
        .first();

      if (mostElevation) {
        awards.push({
          award_type: "individual",
          category: "most_elevation",
          day,
          user_id: mostElevation.user_id,
          value: mostElevation.total_elevation_gain,
          unit: "meters",
          activity_id: mostElevation.id,
        });
      }

      // Highest average power
      const highestPower = await db("tdc_activities")
        .where(day ? { day } : {})
        .whereNotNull("average_watts")
        .orderBy("average_watts", "desc")
        .first();

      if (highestPower) {
        awards.push({
          award_type: "individual",
          category: "highest_power",
          day,
          user_id: highestPower.user_id,
          value: highestPower.average_watts,
          unit: "watts",
          activity_id: highestPower.id,
        });
      }

      // Group awards (by peloton)

      const pelotonDistance = await db("tdc_activities")
        .where(day ? { day } : {})
        .whereNotNull("peloton_id")
        .select("peloton_id")
        .sum("distance as total_distance")
        .groupBy("peloton_id")
        .orderBy("total_distance", "desc")
        .first();

      if (pelotonDistance) {
        awards.push({
          award_type: "group",
          category: "most_distance",
          day,
          peloton_id: pelotonDistance.peloton_id,
          value: pelotonDistance.total_distance,
          unit: "meters",
        });
      }

      // Insert all awards
      if (awards.length > 0) {
        await db("tdc_awards").insert(awards);
      }

      res.json({ calculated: awards.length });
    } catch (error) {
      console.error("Calculate awards error:", error);
      res.status(500).json({ error: "Failed to calculate awards" });
    }
  },

  // ─── AI Win Insights ───────────────────────────────────────────────────────

  async getWinInsights(req, res) {
    try {
      const { category, day } = req.body;

      if (!category) {
        return res.status(400).json({ error: "Category is required" });
      }

      // Get user's activities
      const userActivities = await db("tdc_activities")
        .where({ user_id: req.user.id })
        .where(day ? { day } : {})
        .orderBy("activity_date", "desc");

      if (userActivities.length === 0) {
        return res.status(400).json({
          error: "No TDC activities found. Sync your activities first.",
        });
      }

      // Get leaderboard for the category
      let leaderQuery;

      switch (category) {
        case "distance":
          leaderQuery = db("tdc_activities")
            .where(day ? { day } : {})
            .select("user_id")
            .sum("distance as total")
            .groupBy("user_id")
            .orderBy("total", "desc")
            .limit(5);
          break;

        case "elevation":
          leaderQuery = db("tdc_activities")
            .where(day ? { day } : {})
            .select("user_id")
            .sum("total_elevation_gain as total")
            .groupBy("user_id")
            .orderBy("total", "desc")
            .limit(5);
          break;

        case "power":
          leaderQuery = db("tdc_activities")
            .where(day ? { day } : {})
            .whereNotNull("average_watts")
            .select("user_id")
            .avg("average_watts as total")
            .groupBy("user_id")
            .orderBy("total", "desc")
            .limit(5);
          break;

        default:
          return res.status(400).json({ error: "Invalid category" });
      }

      const leaders = await leaderQuery;

      // Calculate user's current standing
      const userStats = userActivities.reduce(
        (acc, act) => {
          acc.totalDistance += act.distance || 0;
          acc.totalElevation += act.total_elevation_gain || 0;
          acc.totalTime += act.moving_time || 0;
          acc.rideCount += 1;
          if (act.average_watts) {
            acc.totalWatts += act.average_watts;
            acc.wattsCount += 1;
          }
          return acc;
        },
        {
          totalDistance: 0,
          totalElevation: 0,
          totalTime: 0,
          totalWatts: 0,
          wattsCount: 0,
          rideCount: 0,
        },
      );

      const avgWatts =
        userStats.wattsCount > 0
          ? userStats.totalWatts / userStats.wattsCount
          : 0;

      // Build context for Claude
      const contextParts = [
        `Category: ${category}`,
        `Day: ${day || "Overall"}`,
        ``,
        `Your current stats:`,
        `- Total distance: ${(Number(userStats.totalDistance) / 1000).toFixed(1)} km`,
        `- Total elevation: ${Number(userStats.totalElevation).toFixed(0)} m`,
        `- Average power: ${Number(avgWatts).toFixed(0)} watts`,
        `- Number of rides: ${userStats.rideCount}`,
        ``,
        `Top 5 leaders in ${category}:`,
      ];

      leaders.forEach((leader, i) => {
        const value = parseFloat(leader.total);
        const unit =
          category === "distance"
            ? "km"
            : category === "elevation"
              ? "m"
              : "watts";
        const displayValue =
          category === "distance"
            ? (value / 1000).toFixed(1)
            : value.toFixed(0);
        contextParts.push(
          `${i + 1}. ${displayValue} ${unit}${leader.user_id === req.user.id ? " (YOU)" : ""}`,
        );
      });

      const systemPrompt = `You are an expert cycling coach providing strategic advice for a 3-day charity cycling event.
Analyze the rider's current performance and the leaderboard, then provide specific, actionable recommendations to help them win or improve their standing.
Be encouraging but realistic. Focus on concrete strategies they can implement.
Keep your response concise and structured with clear bullet points.`;

      const userMessage = contextParts.join("\n");

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: userMessage }],
        system: systemPrompt,
      });

      res.json({
        insights: message.content[0].text,
        your_stats: {
          distance: userStats.totalDistance,
          elevation: userStats.totalElevation,
          avg_power: avgWatts,
          ride_count: userStats.rideCount,
        },
        leaders: leaders.map((l, i) => ({
          rank: i + 1,
          value: parseFloat(l.total),
          is_you: l.user_id === req.user.id,
        })),
      });
    } catch (error) {
      console.error("Get win insights error:", error);
      res.status(500).json({ error: "Failed to generate win insights" });
    }
  },
};

module.exports = tdcController;

// Made with Bob
