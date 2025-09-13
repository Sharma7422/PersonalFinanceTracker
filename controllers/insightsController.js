const FinancialRecord = require("../models/financialRecord");
const Budget = require("../models/budget");
const Insight = require("../models/insight");

// --- Helper: Generate personalized insights ---
async function generatePersonalizedInsights(userId, records, budgets, now) {
  const insights = [];

  // 1. Suggestion: "You could save ₹X by reducing spending on Food by 10%."
  const expenseTotals = records.filter(r => r.type === "expense")
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {});
  let topExpenseCat = null, topExpense = 0;
  for (const cat in expenseTotals) {
    if (expenseTotals[cat] > topExpense) {
      topExpense = expenseTotals[cat];
      topExpenseCat = cat;
    }
  }
  if (topExpenseCat && topExpense > 0) {
    insights.push({
      type: "suggestion",
      text: `You could save ₹${Math.round(topExpense * 0.1)} by reducing spending on ${topExpenseCat} by 10%.`,
      score: 30
    });
  }

  // 2. Alert: "You are close to exceeding your Groceries budget."
  for (const budget of budgets) {
    const spent = records
      .filter(r => r.category === budget.category && r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);
    if (spent >= budget.amount * 0.9 && spent < budget.amount) {
      insights.push({
        type: "alert",
        text: `You are close to exceeding your ${budget.category} budget.`,
        score: 25
      });
    }
  }

  // 3. Trend: "Your transport expenses have increased for 3 months in a row."
  // We'll check if the last 3 months show increasing expenses for any category
  const nowMonth = now.getMonth();
  const nowYear = now.getFullYear();
  const trendCategories = Object.keys(expenseTotals);
  for (const cat of trendCategories) {
    let trend = true;
    let prev = 0;
    for (let i = 2; i >= 0; i--) {
      const fromM = new Date(nowYear, nowMonth - i, 1);
      const toM = new Date(nowYear, nowMonth - i + 1, 1);
      const monthRecords = await FinancialRecord.find({
        user: userId,
        date: { $gte: fromM, $lt: toM },
        category: cat,
        type: "expense"
      });
      const sum = monthRecords.reduce((s, r) => s + r.amount, 0);
      if (i === 2) prev = sum;
      else {
        if (sum <= prev) {
          trend = false;
          break;
        }
        prev = sum;
      }
    }
    if (trend && prev > 0) {
      insights.push({
        type: "trend",
        text: `Your ${cat} expenses have increased for 3 months in a row.`,
        score: 20
      });
      break; // Only show for one category
    }
  }

  return insights;
}

// --- GET /api/insights ---
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // --- Date ranges ---
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // --- Fetch transactions ---
    const [thisMonthRecords, lastMonthRecords] = await Promise.all([
      FinancialRecord.find({ user: userId, date: { $gte: startOfThisMonth } }),
      FinancialRecord.find({ user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } })
    ]);

    let insights = [];

    // 1. Category spending comparison
    const categories = [...new Set(thisMonthRecords.map(r => r.category))];
    for (const category of categories) {
      const thisMonthTotal = thisMonthRecords
        .filter(r => r.category === category && r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0);

      const lastMonthTotal = lastMonthRecords
        .filter(r => r.category === category && r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0);

      if (lastMonthTotal > 0 && thisMonthTotal > lastMonthTotal * 1.2) {
        const percent = Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
        insights.push({
          text: `⚠️ ${category} spending is up by ${percent}% compared to last month.`,
          type: "transactions",
          score: percent
        });
      }
    }

    // 2. Budget checks
    const budgets = await Budget.find({ user: userId });
    for (const budget of budgets) {
      const spent = thisMonthRecords
        .filter(r => r.category === budget.category && r.type === "expense")
        .reduce((sum, r) => sum + r.amount, 0);

      if (spent <= budget.amount) {
        insights.push({
          text: `🎉 ${budget.category} is within budget this month.`,
          type: "budgets",
          score: 5
        });
      } else {
        insights.push({
          text: `⚠️ You exceeded your ${budget.category} budget by ₹${spent - budget.amount}.`,
          type: "budgets",
          score: 10
        });
      }
    }

    // 3. Savings suggestion
    const income = thisMonthRecords.filter(r => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
    const expenses = thisMonthRecords.filter(r => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
    const netSavings = income - expenses;
    if (netSavings > 0) {
      insights.push({
        text: `💰 Consider saving extra ₹${Math.round(netSavings * 0.1)} to hit your savings goal earlier.`,
        type: "savings",
        score: 15
      });
    }

    // 4. Top category
    const expenseTotals = thisMonthRecords.filter(r => r.type === "expense")
      .reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.amount;
        return acc;
      }, {});
    if (Object.keys(expenseTotals).length > 0) {
      const topCategory = Object.entries(expenseTotals).sort((a, b) => b[1] - a[1])[0];
      insights.push({
        text: `📊 Your top spending category this month is ${topCategory[0]} with ₹${topCategory[1]}.`,
        type: "transactions",
        score: 20
      });
    }

    // 5. Anomaly detection
    const amounts = thisMonthRecords.filter(r => r.type === "expense").map(r => r.amount);
    if (amounts.length > 0) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const threshold = avg * 3;
      const anomalies = thisMonthRecords.filter(r => r.type === "expense" && r.amount > threshold);
      for (const anomaly of anomalies) {
        insights.push({
          text: `🚨 Large transaction detected: ₹${anomaly.amount} spent on ${anomaly.category} (${anomaly.merchant || "unknown"}).`,
          type: "anomaly",
          score: 25
        });
      }
    }

    // --- Personalized AI Insights (suggestion, alert, trend) ---
    const personalized = await generatePersonalizedInsights(userId, thisMonthRecords, budgets, now);
    insights = [...personalized, ...insights];

    // --- Save insights in DB ---
    if (insights.length > 0) {
      await Insight.deleteMany({ user: userId }); // clear old insights
      const saved = insights.map(i => ({ ...i, user: userId }));
      await Insight.insertMany(saved);
    }

    // --- Return all generated insights ---
    res.status(200).json(insights);
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({ message: "Error generating insights", error: error.message });
  }
};



// --- GET /api/insights/insights-overview ---
const dashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    // Accept period: "weekly", "monthly", "yearly"
    const { period = "monthly" } = req.query;
    const now = new Date();
    let from, to;
    if (period === "weekly") {
      const day = now.getDay();
      from = new Date(now);
      from.setDate(now.getDate() - day);
      to = new Date(now);
      to.setDate(from.getDate() + 7);
    } else if (period === "yearly") {
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear() + 1, 0, 1);
    } else { // monthly default
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // Fetch records for the period
    const records = await FinancialRecord.find({
      user: userId,
      date: { $gte: from, $lt: to }
    });

    // KPIs
    const totalIncome = records.filter(r => r.type === "income").reduce((s, r) => s + r.amount, 0);
    const totalExpenses = records.filter(r => r.type === "expense").reduce((s, r) => s + r.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    // Pie chart: category breakdown (expenses)
    const categoryMap = {};
    records.filter(r => r.type === "expense").forEach(r => {
      categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
    });
    const pieData = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));

    // Line chart: cash flow trend (by month in period)
    const monthlyMap = {};
    records.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expenses: 0 };
      if (r.type === "income") monthlyMap[key].income += r.amount;
      if (r.type === "expense") monthlyMap[key].expenses += r.amount;
    });
    const lineChart = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // --- Expense Prediction (simple moving average per category) ---
    // Look at the last 3 months for each category
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const recentRecords = await FinancialRecord.find({
      user: userId,
      type: "expense",
      date: { $gte: threeMonthsAgo, $lt: to }
    });

    const categorySums = {};
    const categoryCounts = {};
    recentRecords.forEach(r => {
      categorySums[r.category] = (categorySums[r.category] || 0) + r.amount;
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });
    const predictions = Object.keys(categorySums).map(cat => ({
      category: cat,
      nextMonth: Math.round(categorySums[cat] / (categoryCounts[cat] || 1))
    }));

    // --- Trends (compare this month vs last month for each category) ---
    const lastMonthFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthTo = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthRecords = await FinancialRecord.find({
      user: userId,
      type: "expense",
      date: { $gte: lastMonthFrom, $lt: lastMonthTo }
    });

    const trends = Object.keys(categoryMap).map(cat => {
      const thisMonth = categoryMap[cat] || 0;
      const lastMonth = lastMonthRecords
        .filter(r => r.category === cat)
        .reduce((s, r) => s + r.amount, 0);
      let change = 0, direction = "flat";
      if (lastMonth > 0) {
        change = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
        direction = thisMonth > lastMonth ? "up" : thisMonth < lastMonth ? "down" : "flat";
      }
      return { category: cat, change: `${change}%`, direction };
    });

    // Top 5 AI-powered insights for the period (from DB)
    let insights = await Insight.find({
      user: userId,
      createdAt: { $gte: from, $lt: to }
    })
      .sort({ score: -1, createdAt: -1 })
      .select("text type score createdAt -_id");

    // --- Personalized AI Insights (suggestion, alert, trend) ---
    const budgets = await Budget.find({ user: userId });
    const personalized = await generatePersonalizedInsights(userId, records, budgets, now);

    // Merge personalized insights (not in DB) at the top
    insights = [...personalized, ...insights];

    res.status(200).json({
      kpis: { totalIncome, totalExpenses, netSavings },
      pieData,
      lineChart,
      predictions, // <-- added
      trends,      // <-- added
      insights
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching insights dashboard" });
  }
};


module.exports = { getInsights, dashboardInsights };