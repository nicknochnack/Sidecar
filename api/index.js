const express = require("express");
const authRoutes = require("./auth");
const integrationsRoutes = require("./integrations");
const insightsRoutes = require("./insights");
const tdcRoutes = require("./tdc");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/integrations", integrationsRoutes);
router.use("/insights", insightsRoutes);
router.use("/tdc", tdcRoutes);

module.exports = router;
