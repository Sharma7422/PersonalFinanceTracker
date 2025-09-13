const cron = require("node-cron");
const RecurringTransaction = require("../models/recurringTransaction");
const { processRecurringTransactionsForUser } = require("../utils/recurringServices");

cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running recurring transactions automation...");

  const users = await RecurringTransaction.distinct("user"); // all users with recurring txns
  for (const userId of users) {
    const count = await processRecurringTransactionsForUser(userId);
    if (count > 0) {
      console.log(`✅ User ${userId}: ${count} transactions created`);
    }
  }
});
