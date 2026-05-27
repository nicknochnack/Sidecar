const router = require("express").Router();
const c = require("../controller/orchestrateController");

router.post("/agents/import", c.importAgent);
router.get("/commands/:id", c.getCommand);

module.exports = router;

// Made with Bob
