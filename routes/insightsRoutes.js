const express = require("express");
const { getInsights , dashboardInsights} = require("../controllers/insightsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getInsights);
router.get("/insights-overview", protect, dashboardInsights);

module.exports = router;