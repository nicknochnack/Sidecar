const router = require("express").Router();
const c = require("../controller/serversController");

router.post("/", c.create);
router.get("/", c.list);
router.get("/:id", c.detail);
router.post("/:id/start", c.start);
router.post("/:id/stop", c.stop);
router.get("/:id/status", c.status);

module.exports = router;

// Made with Bob
