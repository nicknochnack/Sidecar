const express = require("express");
const passport = require("passport");
const tdcController = require("../controller/tdcController");

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

// Peloton management
router.get("/pelotons", requireAuth, tdcController.getPelotons);
router.post("/pelotons", requireAuth, tdcController.createPeloton); // Admin only
router.put("/pelotons/:id", requireAuth, tdcController.updatePeloton); // Admin only
router.delete("/pelotons/:id", requireAuth, tdcController.deletePeloton); // Admin only

// User peloton selection
router.get("/my-peloton", requireAuth, tdcController.getMyPeloton);
router.post("/join-peloton", requireAuth, tdcController.joinPeloton);
router.delete("/leave-peloton", requireAuth, tdcController.leavePeloton);

// Activity sync - parse hashtags from Intervals.icu
router.post("/sync-activities", requireAuth, tdcController.syncTDCActivities);
router.get("/activities", requireAuth, tdcController.getTDCActivities);
router.get(
  "/activities/:day",
  requireAuth,
  tdcController.getTDCActivitiesByDay,
);

// Admin analytics
router.get("/admin/overview", requireAuth, tdcController.getAdminOverview); // Admin only
router.get(
  "/admin/peloton-comparison",
  requireAuth,
  tdcController.getPelotonComparison,
); // Admin only
router.get(
  "/admin/rider-comparison",
  requireAuth,
  tdcController.getRiderComparison,
); // Admin only
router.get("/admin/leaderboards", requireAuth, tdcController.getLeaderboards); // Admin only

// Awards
router.get("/awards", requireAuth, tdcController.getAwards);
router.get("/awards/:day", requireAuth, tdcController.getAwardsByDay);
router.post(
  "/admin/calculate-awards",
  requireAuth,
  tdcController.calculateAwards,
); // Admin only

// AI Win Insights
router.post("/win-insights", requireAuth, tdcController.getWinInsights);

module.exports = router;

// Made with Bob
