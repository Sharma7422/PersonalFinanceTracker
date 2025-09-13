const express = require("express");
const {
  generateMonthlyReport,
  generateYearlyReport,
  generateCustomReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/monthly", protect, generateMonthlyReport);


router.get("/yearly", protect, generateYearlyReport);


router.get("/custom", protect, generateCustomReport);

module.exports = router;