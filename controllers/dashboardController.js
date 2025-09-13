const FinancialRecord = require("../models/financialRecord");
const Insight = require("../models/insight");
const Bill = require("../models/bill");


function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

const dashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = getMonthRange();

    // Fetch records for current month
    const records = await FinancialRecord.find({
      user: userId,
      date: { $gte: start, $lt: end }
    });

    // Calculate totals
    const totalExpenses = records.filter(r => r.type === "expense").reduce((s, r) => s + r.amount, 0);
    const totalIncome = records.filter(r => r.type === "income").reduce((s, r) => s + r.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Pie chart data (by category)
    const categoryMap = {};
    records.filter(r => r.type === "expense").forEach(r => {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
    });
    const pieLabels = Object.keys(categoryMap);
    const pieDataArr = pieLabels.map(l => categoryMap[l]);
    const sortedPie = pieLabels.map((label, i) => ({ label, value: pieDataArr[i] }))
      .sort((a, b) => b.value - a.value);
    const pieData = {
      labels: sortedPie.map(x => x.label),
      data: sortedPie.map(x => x.value)
    };

    // Recent transactions (last 5, most recent first)
    const recentRecords = records
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(r => ({
        _id: r._id,
        title: r.title,
        date: r.date,
        amount: r.amount,
        category: r.category,
        type: r.type,
        image: r.image || null
      }));

    // Fetch top 3 insights from DB, sorted by score and createdAt
    const insights = await Insight.find({ user: userId })
      .sort({ score: -1, createdAt: -1 })
      .limit(3)
      .select("text type score createdAt -_id");

    // --- Upcoming Bills, Goals, Paydays ---
    const today = new Date().toISOString().slice(0, 10);

    const bills = await Bill.find({ user: userId });
    const upcomingBills = bills
      .filter(b => b.dueDate.toISOString().slice(0, 10) >= today)
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, 3)
      .map(b => ({
        _id: b._id,
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate.toISOString().slice(0, 10)
      }));

    
    res.status(200).json({
      totalExpenses,
      totalIncome,
      netBalance,
      recentRecords,
      insights,
      upcoming: {
        bills: upcomingBills,
        // goals: upcomingGoals,
        // paydays: upcomingPaydays
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard overview" });
  }
};

module.exports = { dashboardOverview };