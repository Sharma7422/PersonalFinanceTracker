const express = require("express");
const {
  addFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
} = require("../controllers/financialRecordController");
const { protect } = require("../middleware/authMiddleware");
const { uploadRecordImg } = require("../middleware/upload"); // Multer middleware

const router = express.Router();


router.post("/", protect, uploadRecordImg.single("image"), addFinancialRecord);


router.get("/", protect, getFinancialRecords);


router.put("/:id", protect, uploadRecordImg.single("image"), updateFinancialRecord);


router.delete("/:id", protect, deleteFinancialRecord);

module.exports = router;
