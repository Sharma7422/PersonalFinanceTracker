const FinancialRecord = require("../models/financialRecord");
const Category = require("../models/category");
const Tag = require("../models/tags");

// Helper: Build MongoDB query from smart search string and filters
function buildSearchQuery(userId, { search, type, category, tag, minAmount, maxAmount, startDate, endDate }) {
  const query = { user: userId };
  if (type && type !== "all") query.type = type;
  if (category) query.category = category;
  if (tag) query.tags = tag;
  if (minAmount) query.amount = { ...query.amount, $gte: Number(minAmount) };
  if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) };
  if (startDate) query.date = { ...query.date, $gte: new Date(startDate) };
  if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

  // Smart search string parsing (basic: amount, date, category, notes, type)
  if (search) {
    const s = search.toLowerCase();
    if (s.includes("income")) query.type = "income";
    if (s.includes("expense")) query.type = "expense";
    const amountMatch = s.match(/([<>]=?|=)\s*(\d+)/);
    if (amountMatch) {
      const [, op, val] = amountMatch;
      const num = Number(val);
      if (op === ">") query.amount = { ...query.amount, $gt: num };
      if (op === "<") query.amount = { ...query.amount, $lt: num };
      if (op === ">=") query.amount = { ...query.amount, $gte: num };
      if (op === "<=") query.amount = { ...query.amount, $lte: num };
      if (op === "=") query.amount = num;
    }
    // Date keywords
    const now = new Date();
    if (s.includes("today")) {
      const today = now.toISOString().split("T")[0];
      query.date = { $gte: new Date(today), $lt: new Date(new Date(today).setDate(now.getDate() + 1)) };
    }
    if (s.includes("this month")) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      query.date = { $gte: start, $lt: end };
    }
    if (s.includes("last month")) {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      query.date = { $gte: start, $lt: end };
    }
    // Category or notes keyword
    if (!amountMatch && !s.includes("income") && !s.includes("expense")) {
      query.$or = [
        { notes: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }
  }
  return query;
}

const smartSearchTransactions = async (req, res) => {
  try {
    const { search, type, category, tag, minAmount, maxAmount, startDate, endDate } = req.query;
    const query = buildSearchQuery(req.user.id, { search, type, category, tag, minAmount, maxAmount, startDate, endDate });
    const transactions = await FinancialRecord.find(query)
      .populate("category")
      .populate("tags")
      .sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error searching transactions" });
  }
};

module.exports = { smartSearchTransactions };