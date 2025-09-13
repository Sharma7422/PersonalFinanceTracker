const express = require("express");
const {
  getIncomeAndExpenses,
  getCategoryBreakdown,
  getMonthlySummary,
  dashboardAnalytics
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/summary", protect, getIncomeAndExpenses);


router.get("/category-breakdown", protect, getCategoryBreakdown);


router.get("/monthly-summary", protect, getMonthlySummary);


router.get("/analytics-overview", protect, dashboardAnalytics);

module.exports = router;