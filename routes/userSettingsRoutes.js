const express = require("express");
const {
  updateUserProfile,
  changePassword,
  deleteAccount,
  getUserProfile
} = require("../controllers/userSettingsController");
const { protect } = require("../middleware/authMiddleware");
const { uploadUserImg } = require("../middleware/upload");

const router = express.Router();


router.put("/profile",uploadUserImg.single("profile") , protect, updateUserProfile);


router.put("/change-password", protect, changePassword);


router.delete("/account", protect, deleteAccount);

router.get("/profile", protect, getUserProfile);

module.exports = router;