const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    frequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], required: true },
    startDate: { type: Date, required: true },
    lastProcessed: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecurringTransaction", recurringTransactionSchema);