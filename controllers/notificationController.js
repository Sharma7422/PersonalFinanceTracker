const Notification = require("../models/notification");
const Bill = require("../models/bill");
const Budget = require("../models/budget");
const FinancialRecord = require("../models/financialRecord");

async function generateBillReminders(userId) {
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 3); // Next 3 days

  const bills = await Bill.find({
    user: userId,
    dueDate: { $gte: today, $lte: soon }
  });

  for (const bill of bills) {
    const exists = await Notification.findOne({
      user: userId,
      type: "bill",
      "message": { $regex: bill.name }
    });
    if (!exists) {
      await Notification.create({
        user: userId,
        type: "bill",
        message: `Upcoming bill: ${bill.name} of ₹${bill.amount} is due on ${bill.dueDate.toLocaleDateString()}.`
      });
    }
  }
}





async function generateBudgetAlerts(userId) {
  const budgets = await Budget.find({ user: userId });
  for (const budget of budgets) {
    const spent = await FinancialRecord.aggregate([
      { $match: { user: budget.user, category: budget.category, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalSpent = spent[0]?.total || 0;
    if (totalSpent >= 0.9 * budget.amount) {
      const exists = await Notification.findOne({
        user: userId,
        type: "budget",
        "message": { $regex: budget.category }
      });
      if (!exists) {
        await Notification.create({
          user: userId,
          type: "budget",
          message: `You’ve spent ${Math.round((totalSpent / budget.amount) * 100)}% of your ${budget.category} budget!`
        });
      }
    }
  }
}



async function generateSavingTips(userId) {
  // Example: If entertainment expenses > 20% of total expenses, suggest saving
  const records = await FinancialRecord.find({ user: userId, type: "expense" });
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  const entertainment = records.filter(r => r.category === "Entertainment").reduce((sum, r) => sum + r.amount, 0);

  if (total > 0 && entertainment / total > 0.2) {
    const exists = await Notification.findOne({
      user: userId,
      type: "saving",
      "message": { $regex: "entertainment" }
    });
    if (!exists) {
      await Notification.create({
        user: userId,
        type: "saving",
        message: `You could save ₹${Math.round(entertainment * 0.2)} by reducing entertainment expenses.`
      });
    }
  }
}



const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { read: true });
  res.status(200).json({ success: true });
};

module.exports = {
  getNotifications,
  markAsRead,
  generateBillReminders,
  generateBudgetAlerts,
  generateSavingTips,
};










