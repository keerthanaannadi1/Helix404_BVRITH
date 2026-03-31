const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Department = require('../models/Department');

// GET all departments
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create department (admin only)
router.post('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const department = await Department.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE department (admin only)
router.delete('/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
