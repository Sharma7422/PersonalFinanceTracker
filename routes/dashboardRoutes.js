const express = require("express");
const { dashboardOverview } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/overview", protect, dashboardOverview);

module.exports = router;