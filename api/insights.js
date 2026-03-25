const express = require("express");
const passport = require("passport");
const insightsController = require("../controller/insightsController");

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

router.get("/activities", requireAuth, insightsController.activities);
router.get("/training-load", requireAuth, insightsController.trainingLoad);
router.get("/power", requireAuth, insightsController.powerAnalysis);
router.post("/ai", requireAuth, insightsController.aiInsights);
router.post("/smart-dashboard/chat", requireAuth, insightsController.chatDashboard);

module.exports = router;
