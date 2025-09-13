const express = require("express");
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  dashboardBudget
} = require("../controllers/budgetController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/", protect, createBudget);


router.get("/", protect, getBudgets);


router.put("/:id", protect, updateBudget);


router.delete("/:id", protect, deleteBudget);

router.get("/budget-overview", protect, dashboardBudget);

module.exports = router;