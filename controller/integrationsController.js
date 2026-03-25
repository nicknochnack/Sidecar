const axios = require("axios");
const Integration = require("../model/integration");

const integrationsController = {
  // ─── STATUS ───────────────────────────────────────────────────────────────

  async getStatus(req, res) {
    try {
      const integrations = await Integration.findAllByUser(req.user.id);
      const status = {
        intervals_icu: null,
      };
      for (const integration of integrations) {
        if (integration.provider === "intervals_icu") {
          status.intervals_icu = {
            connected: true,
            athlete_id: integration.provider_athlete_id,
            profile: integration.athlete_profile,
          };
        }
      }
      res.json(status);
    } catch (error) {
      console.error("Get integrations status error:", error);
      res.status(500).json({ error: "Failed to fetch integration status" });
    }
  },

  // ─── INTERVALS.ICU ────────────────────────────────────────────────────────

  async intervalsConnect(req, res) {
    try {
      const { api_key, athlete_id } = req.body;
      if (!api_key || !athlete_id) {
        return res
          .status(400)
          .json({ error: "api_key and athlete_id are required" });
      }

      // Validate the key by hitting the Intervals.icu API
      const testRes = await axios.get(
        `https://intervals.icu/api/v1/athlete/${athlete_id}`,
        {
          auth: { username: "API_KEY", password: api_key },
        },
      );

      const athlete = testRes.data;

      await Integration.upsert(req.user.id, "intervals_icu", {
        api_key,
        provider_athlete_id: String(athlete_id),
        athlete_profile: JSON.stringify({
          name: athlete.name,
          email: athlete.email,
          avatar_url: athlete.avatar_url,
        }),
      });

      res.json({
        connected: true,
        athlete_id: String(athlete_id),
        profile: {
          name: athlete.name,
          email: athlete.email,
          avatar_url: athlete.avatar_url,
        },
      });
    } catch (error) {
      console.error(
        "Intervals.icu connect error:",
        error.response?.data || error.message,
      );
      const status = error.response?.status === 401 ? 401 : 500;
      res
        .status(status)
        .json({
          error:
            status === 401
              ? "Invalid API key or athlete ID"
              : "Failed to connect to Intervals.icu",
        });
    }
  },

  async intervalsDisconnect(req, res) {
    try {
      await Integration.delete(req.user.id, "intervals_icu");
      res.json({ message: "Intervals.icu disconnected" });
    } catch (error) {
      console.error("Intervals disconnect error:", error);
      res.status(500).json({ error: "Failed to disconnect Intervals.icu" });
    }
  },
};

module.exports = integrationsController;
