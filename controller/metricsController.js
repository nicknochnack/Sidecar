const Task = require("../model/task");
const Metric = require("../model/metric");
const db = require("../model/knex");

exports.getTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const tasks = await Task.listForServer(id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: "task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.getMetrics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { since = "1h" } = req.query;

    // Parse since parameter (e.g., '1h', '24h', '7d')
    const match = since.match(/^(\d+)([hd])$/);
    if (!match)
      return res.status(400).json({ error: "invalid since parameter" });

    const value = parseInt(match[1]);
    const unit = match[2];
    const hours = unit === "h" ? value : value * 24;

    const sinceDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    const metrics = await Metric.since(id, sinceDate);

    res.json(metrics);
  } catch (err) {
    next(err);
  }
};

exports.getMetricsSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [taskStats] = await db("tasks")
      .where({ server_id: id })
      .select(
        db.raw("count(*) as total"),
        db.raw("count(*) filter (where status = ?) as completed", [
          "completed",
        ]),
        db.raw("count(*) filter (where status = ?) as failed", ["failed"]),
        db.raw("avg(duration_ms) as avg_duration"),
      );

    res.json({
      totalTasks: parseInt(taskStats.total),
      completedTasks: parseInt(taskStats.completed),
      failedTasks: parseInt(taskStats.failed),
      avgDuration: taskStats.avg_duration
        ? Math.round(taskStats.avg_duration)
        : null,
    });
  } catch (err) {
    next(err);
  }
};

// Made with Bob
