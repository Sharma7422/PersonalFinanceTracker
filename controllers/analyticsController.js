const FinancialRecord = require("../models/financialRecord");
const Budget = require("../models/budget");

// @desc    Get total income and expenses
// @route   GET /api/analytics/summary
// @access  Private
const getIncomeAndExpenses = async (req, res) => {
  try {
    const records = await FinancialRecord.find({ user: req.user.id });

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    res.status(200).json({ totalIncome, totalExpenses });
  } catch (error) {
    res.status(500).json({ message: "Error fetching financial summary" });
  }
};

// @desc    Get category-wise expense breakdown
// @route   GET /api/analytics/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  try {
    const records = await FinancialRecord.find({ user: req.user.id, type: "expense" });

    const categoryBreakdown = records.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + record.amount;
      return acc;
    }, {});

    res.status(200).json(categoryBreakdown);
  } catch (error) {
    res.status(500).json({ message: "Error fetching category breakdown" });
  }
};

// @desc    Get monthly financial summary
// @route   GET /api/analytics/monthly-summary
// @access  Private
const getMonthlySummary = async (req, res) => {
  try {
    const records = await FinancialRecord.find({ user: req.user.id });

    const monthlySummary = records.reduce((acc, record) => {
      const month = new Date(record.date).toLocaleString("default", { month: "long" });
      acc[month] = acc[month] || { income: 0, expense: 0 };

      if (record.type === "income") {
        acc[month].income += record.amount;
      } else if (record.type === "expense") {
        acc[month].expense += record.amount;
      }

      return acc;
    }, {});

    res.status(200).json(monthlySummary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly summary" });
  }
};

const dashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to, category, type } = req.query;

    // Build query filter
    const match = { user: userId };
    if (from && to) {
      match.date = {
        $gte: new Date(from + "T00:00:00.000Z"),
        $lte: new Date(to + "T23:59:59.999Z"),
      };
    }
    if (category && category !== "All") {
      match.category = category;
    }
    if (type && type !== "All") {
      match.type = type;
    }

    // Fetch records
    const records = await FinancialRecord.find(match);

    // KPIs
    const total = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const daySet = new Set(records.map(r => new Date(r.date).toISOString().slice(0,10)));
    const avgPerDay = daySet.size ? Math.round((total / daySet.size) * 100) / 100 : 0;
    const byCategory = {};
    records.forEach(r => {
      byCategory[r.category] = (byCategory[r.category] || 0) + (Number(r.amount) || 0);
    });
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    const transactionCount = records.length;

    // Line chart: spending per day
    const dailyMap = {};
    records.forEach(r => {
      const d = new Date(r.date).toISOString().slice(0,10);
      dailyMap[d] = (dailyMap[d] || 0) + (Number(r.amount) || 0);
    });
    const lineChart = Object.keys(dailyMap).sort().map(date => ({ date, total: dailyMap[date] }));

    // Donut chart: by category
    const donutChart = Object.keys(byCategory).map(cat => ({ category: cat, total: byCategory[cat] }));

    // Bar chart: monthly totals
    const monthlyMap = {};
    records.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + (Number(r.amount) || 0);
    });
    const barChart = Object.keys(monthlyMap).sort().map(month => ({ month, total: monthlyMap[month] }));

    // Budgets: include spent for each budget in the selected range
    let budgets = [];
    const userBudgets = await Budget.find({ user: userId });
    budgets = userBudgets.map(b => {
      const spent = records
        .filter(r => r.category === b.category)
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      return {
        category: b.category,
        budget: b.amount,
        spent,
      };
    });

    res.status(200).json({
      kpis: { total, avgPerDay, topCategory, transactionCount },
      lineChart,
      donutChart,
      barChart,
      budgets,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching analytics dashboard" });
  }
};


module.exports = {
  getIncomeAndExpenses,
  getCategoryBreakdown,
  getMonthlySummary,
  dashboardAnalytics
};