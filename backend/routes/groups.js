const express = require('express');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

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

// Get group by id
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group.members.includes(req.user.id)) return res.status(403).json({ error: 'Not a member' });
    res.json(group);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;