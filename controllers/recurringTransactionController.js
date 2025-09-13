const { processRecurringTransactionsForUser } = require("../utils/recurringServices");

const processRecurringTransactions = async (req, res) => {
  try {
  
    const createdTransactions = await processRecurringTransactionsForUser(req.user.id);

    res.status(200).json({
      message: `Processed ${createdTransactions.length} recurring transactions.`,
      processedCount: createdTransactions.length,  
      newTransactions: createdTransactions
    });
  } catch (error) {
    console.error("Recurring processing error:", error);
    res.status(500).json({ message: "Error processing recurring transactions" });
  }
};

module.exports = { processRecurringTransactions };
