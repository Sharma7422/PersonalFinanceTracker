const RecurringTransaction = require("../models/recurringTransaction");
const FinancialRecord = require("../models/financialRecord");

function getNextDate(date, frequency) {
  const next = new Date(date);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

const processRecurringTransactionsForUser = async (userId) => {
  const now = new Date();
  const recurs = await RecurringTransaction.find({ user: userId });

  let allCreatedTransactions = []; // <-- store created transactions here

  for (const recur of recurs) {
    let nextDate = recur.lastProcessed || recur.startDate;
    const toInsert = [];

    while (nextDate <= now) {
      const newTx = {
        user: recur.user,
        title: recur.title,
        amount: recur.amount,
        type: recur.type,
        category: recur.category,
        date: new Date(nextDate),
        notes: "Auto-generated from recurring",
      };
      toInsert.push(newTx);
      nextDate = getNextDate(nextDate, recur.frequency);
    }

    if (toInsert.length > 0) {
      const inserted = await FinancialRecord.insertMany(toInsert);
      allCreatedTransactions.push(...inserted); // <-- push actual created objects
      recur.lastProcessed = inserted[inserted.length - 1].date;
      await recur.save();
    }
  }

  return allCreatedTransactions; // <-- return array of transactions
};

module.exports = { processRecurringTransactionsForUser };
