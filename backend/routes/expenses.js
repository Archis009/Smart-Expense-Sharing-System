const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

// Add expense
router.post('/', auth, async (req, res) => {
  const { description, amount, groupId, participants, splitType, paidBy } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.members.some(m => m.toString() === req.user.id)) return res.status(403).json({ error: 'Not a member' });

    let splits = [];
    if (splitType === 'equal') {
      const share = amount / participants.length;
      splits = participants.map(p => ({ user: p, amount: share }));
    } else if (splitType === 'exact') {
      const totalExact = participants.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      if (Math.abs(totalExact - amount) > 0.01) return res.status(400).json({ error: 'Exact amounts must sum to the total amount' });
      splits = participants.map(p => ({ user: p.user, amount: parseFloat(p.amount) }));
    } else if (splitType === 'percentage') {
      const totalPercent = participants.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      if (Math.abs(totalPercent - 100) > 0.01) return res.status(400).json({ error: 'Percentages must sum to 100' });
      splits = participants.map(p => ({ user: p.user, amount: (amount * parseFloat(p.amount)) / 100 }));
    }

    const expense = new Expense({
      description,
      amount,
      paidBy: paidBy || req.user.id,
      group: groupId,
      participants: splits,
      splitType,
    });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get group expenses
router.get('/:groupId', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId }).populate('paidBy', 'name').populate('participants.user', 'name');
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;