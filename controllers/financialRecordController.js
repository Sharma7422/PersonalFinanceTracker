const FinancialRecord = require("../models/financialRecord");
const fs = require("fs");
const path = require("path");
const Category = require("../models/category");


const addFinancialRecord = async (req, res) => {
  const { title, amount, type, category, date } = req.body;

  try {
    // Validate category
    const categoryDoc = await Category.findOne({ user: req.user.id, name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category. Please select a valid category." });
    }

    const record = await FinancialRecord.create({
      user: req.user.id,
      title,
      amount,
      type,
      category, // store the name string
      date,
      image: req.file ? req.file.filename : "default-image.png", // optional image
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Add Record Error:", error.message);
    res.status(400).json({ message: "Error creating financial record" });
  }
};


const getFinancialRecords = async (req, res) => {
  try {
    const records = await FinancialRecord.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error("Fetch Records Error:", error.message);
    res.status(500).json({ message: "Error fetching financial records" });
  }
};


const updateFinancialRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await FinancialRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Financial record not found" });
    }

    // Ensure the user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to update this record" });
    }

    // Validate category if updating category
    if (req.body.category) {
      const categoryDoc = await Category.findOne({ user: req.user.id, name: req.body.category });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Invalid category. Please select a valid category." });
      }
    }

    // Handle image update
    let updatedImage = record.image;
    if (req.file) {
      if (record.image && record.image !== "default-image.png") {
        const oldImagePath = path.join(__dirname, "../uploads/recordImg", record.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updatedImage = req.file.filename;
    }

    // Update record
    const updatedRecord = await FinancialRecord.findByIdAndUpdate(
      id,
      { ...req.body, image: updatedImage },
      { new: true }
    );

    res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Update Record Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteFinancialRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await FinancialRecord.findById(id);

    if (!record) {
      return res.status(404).json({ message: "Financial record not found" });
    }

    // Ensure the user owns the record
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this record" });
    }

    // Delete image if not default
    if (record.image && record.image !== "default-image.png") {
      const oldImagePath = path.join(__dirname, "../uploads/recordImg", record.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await record.deleteOne();
    res.status(200).json({ status: true, message: "Financial record deleted", data: record });
  } catch (error) {
    console.error("Delete Record Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
  deleteFinancialRecord,
};