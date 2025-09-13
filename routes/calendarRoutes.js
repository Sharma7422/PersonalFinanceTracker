const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const calendarController = require("../controllers/calendarController");

// Bills
router.get("/bills", protect, calendarController.getBills);
router.post("/bills", protect, calendarController.createBill);
router.put("/bills/:id", protect, calendarController.updateBill);
router.delete("/bills/:id", protect, calendarController.deleteBill);


module.exports = router;