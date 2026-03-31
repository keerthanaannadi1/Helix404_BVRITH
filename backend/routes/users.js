const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const User = require('../models/User');

// PUT select department (first time)
router.put('/select-department', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { department: req.body.departmentId },
      { new: true }
    ).populate('department', 'name code');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST request department change
router.post('/request-department-change', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        departmentChangeRequest: {
          requestedDepartment: req.body.departmentId,
          status: 'pending',
          requestedAt: new Date()
        }
      },
      { new: true }
    ).populate('departmentChangeRequest.requestedDepartment', 'name code');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET pending department change requests (admin only)
router.get('/pending-requests', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await User.find({ 'departmentChangeRequest.status': 'pending' })
      .populate('department', 'name code')
      .populate('departmentChangeRequest.requestedDepartment', 'name code');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT approve/reject department change (admin only)
router.put('/approve-department-change/:userId', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.userId);
    
    if (action === 'approve') {
      user.department = user.departmentChangeRequest.requestedDepartment;
      user.departmentChangeRequest.status = 'approved';
    } else {
      user.departmentChangeRequest.status = 'rejected';
    }
    
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all users (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await User.find().populate('department', 'name code');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
