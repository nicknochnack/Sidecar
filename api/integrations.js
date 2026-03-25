const express = require("express");
const passport = require("passport");
const integrationsController = require("../controller/integrationsController");

const router = express.Router();
const requireAuth = passport.authenticate("jwt", { session: false });

// Integration status for the logged-in user
router.get("/status", requireAuth, integrationsController.getStatus);

// Intervals.icu API key
router.post(
  "/intervals-icu",
  requireAuth,
  integrationsController.intervalsConnect,
);
router.delete(
  "/intervals-icu",
  requireAuth,
  integrationsController.intervalsDisconnect,
);

module.exports = router;
