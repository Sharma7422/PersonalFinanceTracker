const express = require("express");
const { smartSearchTransactions } = require("../controllers/transactionSearchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, smartSearchTransactions);

module.exports = router;