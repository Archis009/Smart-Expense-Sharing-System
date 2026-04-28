const express = require('express');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const { calculateBalances, minimizeTransactions } = require('../utils/settlement');

const router = express.Router();

// Create group
router.post('/', auth, async (req, res) => {
  const { name, members } = req.body;
  try {
    const group = new Group({ name, members: [...members, req.user.id], createdBy: req.user.id });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get group balances and settlements
router.get('/:id/balances', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.some(m => m.toString() === req.user.id)) return res.status(403).json({ error: 'Not a member' });

    const expenses = await Expense.find({ group: req.params.id }).populate('paidBy', 'name').populate('participants.user', 'name');
    const balances = calculateBalances(expenses);
    const settlements = minimizeTransactions(balances);

    res.json({ balances, settlements });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add members to existing group
router.put('/:id/members', auth, async (req, res) => {
  const { memberIds } = req.body;
  try {
    const group = await Group.findById(req.params.id);
    if (!group.members.some(m => m.toString() === req.user.id)) return res.status(403).json({ error: 'Not a member' });
    // Add only new members (avoid duplicates)
    const existing = group.members.map(m => m.toString());
    const newMembers = memberIds.filter(id => !existing.includes(id));
    group.members.push(...newMembers);
    await group.save();
    const updated = await Group.findById(req.params.id).populate('members', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get group by id
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group.members.some(m => m._id.toString() === req.user.id)) return res.status(403).json({ error: 'Not a member' });
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;