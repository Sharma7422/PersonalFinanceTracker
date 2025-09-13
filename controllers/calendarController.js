const Bill = require("../models/bill");
// const Goal = require("../models/goal");
// const Payday = require("../models/payday");

// ----- BILLS -----
exports.getBills = async (req, res) => {
  const bills = await Bill.find({ user: req.user.id });
  res.json(bills.map(b => ({
    _id: b._id,
    name: b.name,
    amount: b.amount,
    dueDate: b.dueDate.toISOString().slice(0, 10),
  })));
};

exports.createBill = async (req, res) => {
  const { name, amount, dueDate } = req.body;
  const bill = await Bill.create({
    user: req.user.id,
    name,
    amount,
    dueDate,
  });
  res.status(201).json({
    _id: bill._id,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.dueDate.toISOString().slice(0, 10),
  });
};

exports.updateBill = async (req, res) => {
  const { id } = req.params;
  const { name, amount, dueDate } = req.body;
  const bill = await Bill.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { name, amount, dueDate },
    { new: true }
  );
  if (!bill) return res.status(404).json({ message: "Bill not found" });
  res.status(200).json({
    _id: bill._id,
    name: bill.name,
    amount: bill.amount,
    dueDate: bill.dueDate.toISOString().slice(0, 10),
  });
};

exports.deleteBill = async (req, res) => {
  const { id } = req.params;
  const bill = await Bill.findOneAndDelete({ _id: id, user: req.user.id });
  if (!bill) return res.status(404).json({ message: "Bill not found" });
  res.status(200).json({ message: "Bill deleted" });
};
