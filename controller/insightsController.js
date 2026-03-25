const axios = require("axios");
const Anthropic = require("@anthropic-ai/sdk");
const Integration = require("../model/integration");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Intervals.icu helpers ────────────────────────────────────────────────────

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

// ─── Controller ──────────────────────────────────────────────────────────────

const insightsController = {
  // Activity feed — recent activities from Intervals.icu
  async activities(req, res) {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const results = [];

      const intervals = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );

      if (intervals) {
        const oldest = new Date();
        oldest.setDate(oldest.getDate() - 60);
        const activities = await intervalsGet(intervals, "/activities", {
          oldest: oldest.toISOString().split("T")[0],
          newest: new Date().toISOString().split("T")[0],
        });
        results.push(
          ...activities.map((a) => ({
            source: "intervals_icu",
            id: a.id,
            name: a.name,
            type: a.type,
            sport_type: a.sport_type,
            start_date: a.start_date_local,
            distance: a.distance,
            moving_time: a.moving_time,
            elapsed_time: a.elapsed_time,
            total_elevation_gain: a.total_elevation_gain,
            average_speed: a.average_speed,
            average_heartrate: a.average_hr,
            max_heartrate: a.max_hr,
            average_watts: a.average_watts,
            weighted_average_watts: a.weighted_avg_watts,
            kilojoules: a.icu_training_load,
            icu_training_load: a.icu_training_load,
          })),
        );
      }

      // Sort by start_date descending
      results.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

      res.json(results.slice(0, Number(per_page)));
    } catch (error) {
      console.error("Activities error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  },

  // Training load — CTL/ATL/TSB from Intervals.icu
  async trainingLoad(req, res) {
    try {
      const intervals = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );
      if (!intervals) {
        return res.status(404).json({ error: "Intervals.icu not connected" });
      }

      const oldest = new Date();
      oldest.setDate(oldest.getDate() - 120);

      const data = await intervalsGet(intervals, "/wellness", {
        oldest: oldest.toISOString().split("T")[0],
        newest: new Date().toISOString().split("T")[0],
      });

      const trainingLoad = data.map((d) => ({
        date: d.id, // Intervals.icu uses date as the id
        ctl: d.ctl,
        atl: d.atl,
        tsb:
          d.tsb ??
          (d.ctl != null && d.atl != null ? +(d.ctl - d.atl).toFixed(1) : null),
        form: d.form,
        rampRate: d.rampRate,
        fitness: d.fitness,
        fatigue: d.atl,
      }));

      res.json(trainingLoad);
    } catch (error) {
      console.error(
        "Training load error:",
        error.response?.data || error.message,
      );
      res.status(500).json({ error: "Failed to fetch training load data" });
    }
  },

  // Power analysis — power curve and best efforts from Intervals.icu
  async powerAnalysis(req, res) {
    try {
      const intervals = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );
      if (!intervals) {
        return res.status(404).json({ error: "Intervals.icu not connected" });
      }

      const { days = 90 } = req.query;
      const oldest = new Date();
      oldest.setDate(oldest.getDate() - Number(days));

      const [curve, athlete] = await Promise.all([
        intervalsGet(intervals, "/power-curves", {
          oldest: oldest.toISOString().split("T")[0],
          newest: new Date().toISOString().split("T")[0],
          type: "Ride",
        }),
        intervalsGet(intervals, ""),
      ]);

      // Power curve: { list: [{ secs: [...], watts: [...] }] }
      const curveEntry = curve?.list?.[0];
      const powerCurveArray =
        curveEntry &&
        Array.isArray(curveEntry.secs) &&
        Array.isArray(curveEntry.watts)
          ? curveEntry.secs.map((s, i) => ({
              secs: s,
              watts: curveEntry.watts[i],
            }))
          : [];

      // FTP: find it in sportSettings — log types so we can match the right one
      const sportSettings = Array.isArray(athlete?.sportSettings)
        ? athlete.sportSettings
        : [];
      console.log(
        "Sport setting types:",
        sportSettings.map((s) => s.type),
      );
      const rideSetting = sportSettings.find((s) =>
        ["Ride", "Cycling", "VirtualRide", "MountainBikeRide", "Bike"].includes(
          s.type,
        ),
      );
      const ftp =
        rideSetting?.threshold ?? rideSetting?.ftp ?? rideSetting?.cp ?? null;
      const weight =
        curveEntry?.weight ?? athlete?.weight ?? athlete?.icu_weight ?? null;

      res.json({
        power_curve: powerCurveArray,
        ftp,
        weight,
        w_per_kg: ftp && weight ? (ftp / weight).toFixed(2) : null,
      });
    } catch (error) {
      console.error(
        "Power analysis error:",
        error.response?.data || error.message,
      );
      res.status(500).json({ error: "Failed to fetch power analysis" });
    }
  },

  // AI Insights — Claude analyzes recent data and generates coaching insights
  async aiInsights(req, res) {
    try {
      const intervalsInteg = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );

      if (!intervalsInteg) {
        return res
          .status(400)
          .json({
            error: "Intervals.icu not connected. Please connect it first.",
          });
      }

      // Gather recent context for Claude
      let contextParts = [];

      if (intervalsInteg) {
        try {
          const oldest = new Date();
          oldest.setDate(oldest.getDate() - 28);
          const [wellness, activities] = await Promise.all([
            intervalsGet(intervalsInteg, "/wellness", {
              oldest: oldest.toISOString().split("T")[0],
              newest: new Date().toISOString().split("T")[0],
            }),
            intervalsGet(intervalsInteg, "/activities", {
              oldest: oldest.toISOString().split("T")[0],
              newest: new Date().toISOString().split("T")[0],
            }),
          ]);

          const latestWellness = wellness[wellness.length - 1];
          if (latestWellness) {
            contextParts.push(
              `Current fitness metrics (from Intervals.icu):
- CTL (Chronic Training Load / Fitness): ${latestWellness.ctl?.toFixed(1) ?? "N/A"}
- ATL (Acute Training Load / Fatigue): ${latestWellness.atl?.toFixed(1) ?? "N/A"}
- TSB (Training Stress Balance / Form): ${latestWellness.tsb?.toFixed(1) ?? "N/A"}`,
            );
          }

          if (activities.length > 0) {
            const summary = activities
              .slice(-10)
              .map(
                (a) =>
                  `- ${a.start_date_local?.split("T")[0] ?? ""}: ${a.name} (${a.type}, ${((a.distance || 0) / 1000).toFixed(1)}km, ${Math.round((a.moving_time || 0) / 60)}min${a.average_watts ? `, ${Math.round(a.average_watts)}w avg` : ""})`,
              )
              .join("\n");
            contextParts.push(`Recent activities (last 10):\n${summary}`);
          }
        } catch (e) {
          console.warn(
            "Intervals.icu data fetch failed for AI insights:",
            e.message,
          );
        }
      }

      if (contextParts.length === 0) {
        return res
          .status(400)
          .json({
            error: "Not enough training data available to generate insights.",
          });
      }

      const systemPrompt = `You are an expert endurance sports coach specializing in cycling and running.
You analyze athlete training data and provide actionable, evidence-based coaching insights.
Be concise, specific, and encouraging. Format your response with clear sections using markdown.
Focus on: current form/readiness, recent trends, key recommendations, and one focus area for the next week.`;

      const userMessage = `Please analyze my recent training data and provide personalized performance insights:

${contextParts.join("\n\n")}

Provide insights covering:
1. Current form and readiness (based on CTL/ATL/TSB if available)
2. Recent training trends (volume, intensity, consistency)
3. Key observations and opportunities
4. Recommended focus for the next 7 days`;

      const message = await anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: userMessage }],
        system: systemPrompt,
      });

      res.json({
        insights: message.content[0].text,
        generated_at: new Date().toISOString(),
        data_sources: ["intervals_icu"],
      });
    } catch (error) {
      console.error("AI insights error:", error.message);
      res.status(500).json({ error: "Failed to generate AI insights" });
    }
  },

  // Smart Dashboard Chat — Claude controls visualizations via tool_use
  async chatDashboard(req, res) {
    try {
      const { message, history = [], config = {} } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const intervalsInteg = await Integration.findByUserAndProvider(
        req.user.id,
        "intervals_icu",
      );

      // Gather training context
      const contextParts = [];

      if (intervalsInteg) {
        try {
          const oldest = new Date();
          oldest.setDate(oldest.getDate() - 28);
          const [wellness, activities] = await Promise.all([
            intervalsGet(intervalsInteg, "/wellness", {
              oldest: oldest.toISOString().split("T")[0],
              newest: new Date().toISOString().split("T")[0],
            }),
            intervalsGet(intervalsInteg, "/activities", {
              oldest: oldest.toISOString().split("T")[0],
              newest: new Date().toISOString().split("T")[0],
            }),
          ]);
          const latestWellness = wellness[wellness.length - 1];
          if (latestWellness) {
            contextParts.push(
              `Fitness metrics (Intervals.icu): CTL=${latestWellness.ctl?.toFixed(1)}, ATL=${latestWellness.atl?.toFixed(1)}, TSB=${latestWellness.tsb?.toFixed(1)}`,
            );
          }
          if (activities.length > 0) {
            const summary = activities
              .slice(-7)
              .map(
                (a) =>
                  `${a.start_date_local?.split("T")[0]}: ${a.name} (${a.type}, ${((a.distance || 0) / 1000).toFixed(1)}km, ${Math.round((a.moving_time || 0) / 60)}min${a.average_watts ? `, ${Math.round(a.average_watts)}w` : ""})`,
              )
              .join("; ");
            contextParts.push(`Recent activities: ${summary}`);
          }
        } catch (e) {
          console.warn("Intervals.icu fetch failed for chat:", e.message);
        }
      }

      const currentPanels = config.panels || [
        "training-load",
        "ppi",
        "activity-split",
        "health-calendar",
        "training-log",
      ];

      const currentPanelsSummary = currentPanels
        .map((p) => (typeof p === "string" ? p : `custom:"${p.title}"`))
        .join(", ");

      const systemPrompt = `You are an expert endurance sports coach assistant. You help athletes understand their training data and can customize their dashboard visualizations.

## Predefined panels (use as plain strings in the panels array)
- "training-load": CTL/ATL/TSB line chart over 90 days
- "ppi": Peak Performance Indicator gauge (readiness based on TSB)
- "activity-split": Pie chart of training split by sport type
- "health-calendar": Calendar heatmap of training frequency (13 weeks)
- "training-log": Recent activities list

## Custom charts (create on the fly by including a config object in panels)
When the user asks to visualise something specific, create a custom chart config object:
{
  "id": "unique-id",
  "chartType": "line" | "area" | "bar" | "pie",
  "title": "Human-readable title",
  "dataSource": "training-load" | "activities",
  "xKey": "date",
  "series": [{ "key": "fieldName", "color": "#hexcolor", "name": "Label" }],
  "groupBy": "sport_type",
  "metric": "count" | "distance" | "moving_time" | "average_watts",
  "yAxisMin": number,
  "yAxisMax": number,
  "xAxisMin": number,
  "xAxisMax": number
}
All axis fields are optional. Use them when the user asks to set axis limits (e.g. "set y axis max to 200").

### training-load fields (use with line/area/bar, xKey="date"):
ctl, atl, tsb, rampRate

### activities fields:
- For line/area/bar charts (xKey="date"): distance (km), moving_time (min), average_watts, average_heartrate, total_elevation_gain, suffer_score
- For pie charts: groupBy="sport_type", metric="count"|"distance"|"moving_time"|"average_watts"

### Example custom charts:
- Heart rate trend: { "id":"hr-trend","chartType":"line","title":"Heart Rate Trend","dataSource":"activities","xKey":"date","series":[{"key":"average_heartrate","color":"#f87171","name":"Avg HR"}] }
- Weekly load bar: { "id":"load-bar","chartType":"bar","title":"CTL vs ATL","dataSource":"training-load","xKey":"date","series":[{"key":"ctl","color":"#60a5fa","name":"CTL"},{"key":"atl","color":"#fb923c","name":"ATL"}] }
- Distance by sport: { "id":"dist-sport","chartType":"pie","title":"Distance by Sport","dataSource":"activities","groupBy":"sport_type","metric":"distance" }

Currently visible panels: ${currentPanelsSummary}
${contextParts.length > 0 ? "\nAthlete's training context:\n" + contextParts.join("\n") : "\n(No training integrations connected yet)"}

Use update_dashboard when the user wants to change, add, or create visualizations.
For data questions, answer directly. Keep responses brief.
Respond in plain conversational text — no markdown, no asterisks, no bold, no bullet points, no headers.`;

      // Build messages — strip leading assistant turns to satisfy API requirement
      let historyMessages = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      while (historyMessages.length > 0 && historyMessages[0].role !== "user") {
        historyMessages.shift();
      }
      const messages = [...historyMessages, { role: "user", content: message }];

      const toolDef = {
        name: "update_dashboard",
        description:
          "Update dashboard panels — show/hide predefined panels or create custom charts on the fly.",
        input_schema: {
          type: "object",
          properties: {
            panels: {
              type: "array",
              description:
                "Ordered array of panels. Each item is either a predefined panel ID string or a custom chart config object as described in the system prompt.",
              items: {},
            },
            message: {
              type: "string",
              description:
                "Friendly message explaining what changed or was created",
            },
          },
          required: ["panels", "message"],
        },
      };

      // SSE streaming
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        tools: [toolDef],
        messages,
      });

      stream.on("text", (delta) => send({ type: "text", delta }));

      const finalMsg = await stream.finalMessage();

      for (const block of finalMsg.content) {
        if (block.type === "tool_use" && block.name === "update_dashboard") {
          send({
            type: "tool",
            panels: block.input.panels,
            message: block.input.message,
          });
        }
      }

      send({ type: "done" });
      res.end();
    } catch (error) {
      console.error("Chat dashboard error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process chat message" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        res.end();
      }
    }
  },
};

module.exports = insightsController;
