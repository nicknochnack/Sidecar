const router = require("express").Router();
const c = require("../controller/metricsController");

router.get("/servers/:id/tasks", c.getTasks);
router.get("/servers/:id/tasks/:taskId", c.getTask);
router.get("/servers/:id/metrics", c.getMetrics);
router.get("/servers/:id/metrics/summary", c.getMetricsSummary);

module.exports = router;

// Made with Bob
