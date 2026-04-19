const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

const router = express.Router();

// Add expense
router.post('/', auth, async (req, res) => {
  const { description, amount, groupId, participants, splitType } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group.members.includes(req.user.id)) return res.status(403).json({ error: 'Not a member' });

    let splits = [];
    if (splitType === 'equal') {
      const share = amount / participants.length;
      splits = participants.map(p => ({ user: p, amount: share }));
    } else if (splitType === 'exact') {
      splits = participants.map(p => ({ user: p.user, amount: p.amount }));
    } // Add percentage logic later

    const expense = new Expense({
      description,
      amount,
      paidBy: req.user.id,
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