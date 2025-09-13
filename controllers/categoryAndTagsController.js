const Category = require("../models/category");
const Tag = require("../models/tags");

// Get all categories and tags for the user
const getCategoriesTags = async (req, res) => {
  const categories = await Category.find({ user: req.user.id });
  const tags = await Tag.find({ user: req.user.id });
  res.json({ categories, tags });
};

// Add category
const addCategory = async (req, res) => {
  const { name } = req.body;
  const exists = await Category.findOne({ user: req.user.id, name });
  if (exists) return res.status(400).json({ message: "Category already exists" });
  const category = await Category.create({ user: req.user.id, name });
  res.status(201).json(category);
};

// Edit category
const editCategory = async (req, res) => {
  const { id, name} = req.body;
  const category = await Category.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { name },
    { new: true }
  );
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.status(200).json(category);
};

// Delete category
const deleteCategory = async (req, res) => {
  const { id } = req.body;
  const category = await Category.findOneAndDelete({ _id: id, user: req.user.id });
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.status(200).json({ message: "Category deleted" });
};

// Add tag
const addTag = async (req, res) => {
  const { name } = req.body;
  const exists = await Tag.findOne({ user: req.user.id, name });
  if (exists) return res.status(400).json({ message: "Tag already exists" });
  const tag = await Tag.create({ user: req.user.id, name });
  res.status(201).json(tag);
};

// Delete tag
const deleteTag = async (req, res) => {
  const { id } = req.body;
  const tag = await Tag.findOneAndDelete({ _id: id, user: req.user.id });
  if (!tag) return res.status(404).json({ message: "Tag not found" });
  res.status(200).json({ message: "Tag deleted" });
};

module.exports = {
  getCategoriesTags,
  addCategory,
  editCategory,
  deleteCategory,
  addTag,
  deleteTag,
};