const mongoose = require("mongoose");

const financialRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    image: { type: String } 
  },
  { timestamps: true }
);

module.exports = mongoose.model("FinancialRecord", financialRecordSchema);