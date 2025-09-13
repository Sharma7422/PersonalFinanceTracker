const express = require("express");
const {
  getAllTransactions,
  filterTransactionsByType,
  paginateTransactions,
  dashboardTransactions
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


router.get("/", protect, getAllTransactions);


router.get("/filter", protect, filterTransactionsByType);


router.get("/paginate", protect, paginateTransactions);


router.get("/transactions-overview", protect, dashboardTransactions);

module.exports = router;