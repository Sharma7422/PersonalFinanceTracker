const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "transactions",
      "budgets",
      "savings",
      "anomaly",
      "suggestion",
      "alert",
      "trend"
    ],
    default: "transactions"
  },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Insight", InsightSchema);
