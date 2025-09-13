const express = require("express");
const { processRecurringTransactions } = require("../controllers/recurringTransactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/process", protect, processRecurringTransactions);

module.exports = router;
