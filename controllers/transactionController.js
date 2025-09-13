const FinancialRecord = require("../models/financialRecord");

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await FinancialRecord.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

// @desc    Filter transactions by type (income/expense)
// @route   GET /api/transactions/filter
// @access  Private
const filterTransactionsByType = async (req, res) => {
  const { type } = req.query;

  try {
    const transactions = await FinancialRecord.find({ user: req.user.id, type }).sort({ date: -1 });

    if (!transactions.length) {
      return res.status(404).json({ message: `No ${type} transactions found` });
    }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error filtering transactions" });
  }
};

// @desc    Paginate transactions
// @route   GET /api/transactions/paginate
// @access  Private
const paginateTransactions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const totalTransactions = await FinancialRecord.countDocuments({ user: req.user.id });
    const transactions = await FinancialRecord.find({ user: req.user.id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      page,
      totalPages: Math.ceil(totalTransactions / limit),
      totalTransactions,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error paginating transactions" });
  }
};



const dashboardTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    // Optional query params for pagination, filters, search
    const { limit = 20, page = 1, type, category, search } = req.query;
    const query = { user: userId };

    if (type && type !== "all") query.type = type;
    if (category && category !== "all") query.category = category;

    // Smart search (basic: amount, notes, category)
    if (search && search.trim()) {
      const s = search.toLowerCase();
      query.$or = [
        { notes: { $regex: s, $options: "i" } },
        { category: { $regex: s, $options: "i" } }
      ];
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
    }

    // Fetch paginated transactions
    const transactions = await FinancialRecord.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // KPIs
    const allRecords = await FinancialRecord.find({ user: userId });
    const totalIncome = allRecords.filter(t => t.type === "income").reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalExpenses = allRecords.filter(t => t.type === "expense").reduce((s, r) => s + Number(r.amount || 0), 0);
    const netBalance = totalIncome - totalExpenses;


    res.status(200).json({
      kpis: { totalIncome, totalExpenses, netBalance },
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions dashboard" });
  }
};



module.exports = {
  getAllTransactions,
  filterTransactionsByType,
  paginateTransactions,
  dashboardTransactions
};