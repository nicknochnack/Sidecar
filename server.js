require("dotenv").config();
const express = require("express");
const config = require("config");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const throttle = config.get("throttle");
const limiter = require("express-rate-limit");
const port = process.env.PORT || 8080;
const api = require("./api");
const passport = require("./utilities/passport");

// Create server
const app = express();

// Use helmet to set content security policy
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://intervals.icu",
          "https://api.anthropic.com",
        ],
        frameSrc: ["'self'"],
        childSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "https://dgalywyr863hv.cloudfront.net",
          "https://intervals.icu",
          "data:",
        ],
        baseUri: ["'self'"],
      },
    },
  }),
);

// CORS
const opts = {
  origin: [process.env.CLIENT_URL, process.env.DOMAIN],
};
app.use(cors(opts));
app.options("*", cors(opts));

// Global error handling
app.use(function (err, req, res, next) {
  const message = err.raw?.message || err.message || err.sqlMessage || null;
  console.log(err);
  return res.status(500).send({ message: message });
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

// Use Passport
app.use(passport.initialize());

// Import API
app.use("/api", limiter(throttle.api));
app.use("/api", api);

// Point to static build if in staging or production
if (
  process.env.NODE_ENV === "staging" ||
  process.env.NODE_ENV === "production"
) {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname + "/client/build/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
