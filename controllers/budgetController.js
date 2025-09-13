// ...other requires...
const Budget = require("../models/budget");
const FinancialRecord = require("../models/financialRecord");
const Category = require("../models/category");


const createBudget = async (req, res) => {
  const { name, amount, category } = req.body;

  try {
    // Validate category
    const categoryDoc = await Category.findOne({ user: req.user.id, name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category. Please select a valid category." });
    }

    const budget = await Budget.create({
      user: req.user.id,
      name,
      amount,
      category,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: "Error creating budget" });
  }
};


const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ message: "Error fetching budgets" });
  }
};


const updateBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // Ensure the user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to update this budget" });
    }

    // Update the budget
    const updatedBudget = await Budget.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: "Error updating budget" });
  }
};


const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    // Ensure the user owns the budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this budget" });
    }

    await budget.deleteOne();
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting budget" , error:error.message});
  }
};



const dashboardBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Fetch all budgets for user
    const budgets = await Budget.find({ user: userId });

    // Fetch all expense transactions for this month
    const transactions = await FinancialRecord.find({
      user: userId,
      type: "expense",
      date: { $gte: startOfMonth, $lt: endOfMonth }
    });

    // Build response: for each budget, calculate spent and get recent transactions
    const result = budgets.map(budget => {
      const spent = transactions
        .filter(tx => tx.category === budget.category)
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

      const recentTransactions = transactions
        .filter(tx => tx.category === budget.category)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(tx => ({
          id: tx._id,
          category: tx.category,
          amount: tx.amount,
          date: tx.date,
          notes: tx.notes
        }));

      return {
        id: budget._id,
        category: budget.category,
        limit: budget.amount,
        icon: budget.icon || "", // If you store icon in Budget model
        spent,
        recentTransactions
      };
    });

    res.status(200).json({ budgets: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching budget dashboard" });
  }
};


module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  dashboardBudget
};