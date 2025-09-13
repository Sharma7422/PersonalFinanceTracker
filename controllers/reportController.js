const FinancialRecord = require("../models/financialRecord");


const generateMonthlyReport = async (req, res) => {
  const { month, year } = req.query;

  try {
    const records = await FinancialRecord.find({
      user: req.user.id,
      date: {
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      },
    });

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    res.status(200).json({ totalIncome, totalExpenses, records });
  } catch (error) {
    res.status(500).json({ message: "Error generating monthly report" });
  }
};

const generateYearlyReport = async (req, res) => {
  const { year } = req.query;

  try {
    const records = await FinancialRecord.find({
      user: req.user.id,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${parseInt(year) + 1}-01-01`),
      },
    });

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    res.status(200).json({ totalIncome, totalExpenses, records });
  } catch (error) {
    res.status(500).json({ message: "Error generating yearly report" });
  }
};


const generateCustomReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const records = await FinancialRecord.find({
      user: req.user.id,
      date: {
        $gte: new Date(startDate),
        $lt: new Date(endDate),
      },
    });

    const totalIncome = records
      .filter((record) => record.type === "income")
      .reduce((sum, record) => sum + record.amount, 0);

    const totalExpenses = records
      .filter((record) => record.type === "expense")
      .reduce((sum, record) => sum + record.amount, 0);

    res.status(200).json({ totalIncome, totalExpenses, records });
  } catch (error) {
    res.status(500).json({ message: "Error generating custom report" });
  }
};

module.exports = {
  generateMonthlyReport,
  generateYearlyReport,
  generateCustomReport,
};