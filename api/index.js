const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const config = require("config");

require("../utilities/passport"); // configures the jwt strategy

const authRoutes = require("./auth");
const serverRoutes = require("./servers");
const orchestrateRoutes = require("./orchestrate");
const metricsRoutes = require("./metrics");

const app = express();

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3007",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const throttle = config.get("throttle");
const authLimiter = rateLimit(throttle.auth);
app.use("/auth", authLimiter, authRoutes);

const requireAuth = passport.authenticate("jwt", { session: false });
app.use("/servers", requireAuth, serverRoutes);
app.use(
  "/orchestrate",
  requireAuth,
  rateLimit(throttle.orchestrate),
  orchestrateRoutes,
);
app.use("/metrics", requireAuth, metricsRoutes); // metrics routes are server-scoped paths

app.get("/health", (req, res) =>
  res.json({ status: "ok", service: "sidecar-api" }),
);

// central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal error" });
});

module.exports = app;

// Made with Bob
