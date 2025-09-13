const express = require("express");
const {
  getCategoriesTags,
  addCategory,
  editCategory,
  deleteCategory,
  addTag,
  deleteTag,
} = require("../controllers/categoryAndTagsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCategoriesTags);
router.post("/category", protect, addCategory);
router.put("/category", protect, editCategory);
router.delete("/category", protect, deleteCategory);
router.post("/tag", protect, addTag);
router.delete("/tag", protect, deleteTag);

module.exports = router;