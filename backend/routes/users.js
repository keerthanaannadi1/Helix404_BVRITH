const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const User = require('../models/User');
const Department = require('../models/Department');

async function attachDepartmentMeta(user) {
  const plain = user.get({ plain: true });
  if (!plain.departmentId) return plain;
  const department = await Department.findByPk(plain.departmentId);
  return {
    ...plain,
    department
  };
}

// PUT select department (first time or update)
router.put('/select-department', auth, async (req, res) => {
  try {
    const departmentId = Number(req.body.departmentId);
    if (!departmentId) {
      return res.status(400).json({ message: 'departmentId is required' });
    }

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ departmentId });
    res.json(await attachDepartmentMeta(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST request department change
router.post('/request-department-change', auth, async (req, res) => {
  try {
    const requestedDepartmentId = Number(req.body.departmentId);
    if (!requestedDepartmentId) {
      return res.status(400).json({ message: 'departmentId is required' });
    }

    const department = await Department.findByPk(requestedDepartmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      departmentChangeRequestId: requestedDepartmentId,
      departmentChangeStatus: 'pending',
      departmentChangeRequestedAt: new Date()
    });

    res.json(await attachDepartmentMeta(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET pending department change requests (admin only)
router.get('/pending-requests', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        departmentChangeStatus: 'pending',
        departmentChangeRequestId: { [Op.ne]: null }
      },
      order: [['updatedAt', 'DESC']]
    });

    const departmentIds = [
      ...new Set(
        users.flatMap((u) => [u.departmentId, u.departmentChangeRequestId]).filter(Boolean)
      )
    ];

    const departments = await Department.findAll({
      where: { id: departmentIds.length ? departmentIds : [0] }
    });
    const deptMap = new Map(departments.map((d) => [d.id, d]));

    const response = users.map((u) => {
      const plain = u.get({ plain: true });
      return {
        ...plain,
        department: plain.departmentId ? deptMap.get(plain.departmentId) || null : null,
        requestedDepartment: plain.departmentChangeRequestId
          ? deptMap.get(plain.departmentChangeRequestId) || null
          : null
      };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT approve/reject department change (admin only)
router.put('/approve-department-change/:userId', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.departmentChangeRequestId || user.departmentChangeStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending request for this user' });
    }

    if (action === 'approve') {
      await user.update({
        departmentId: user.departmentChangeRequestId,
        departmentChangeStatus: 'approved'
      });
    } else if (action === 'reject') {
      await user.update({ departmentChangeStatus: 'rejected' });
    } else {
      return res.status(400).json({ message: "action must be 'approve' or 'reject'" });
    }

    res.json(await attachDepartmentMeta(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all users (admin only)
router.get('/', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });

    const departmentIds = [...new Set(users.map((u) => u.departmentId).filter(Boolean))];
    const departments = await Department.findAll({
      where: { id: departmentIds.length ? departmentIds : [0] }
    });
    const deptMap = new Map(departments.map((d) => [d.id, d]));

    const response = users.map((u) => {
      const plain = u.get({ plain: true });
      return {
        ...plain,
        department: plain.departmentId ? deptMap.get(plain.departmentId) || null : null
      };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
