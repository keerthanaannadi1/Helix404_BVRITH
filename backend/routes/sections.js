const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const Section = require('../models/Section');
const User = require('../models/User');
const Department = require('../models/Department');
const Report = require('../models/Report');
const { SECTION_DEFINITIONS } = require('../config/sections');

// Model mapping
const models = {
  generalPoints: require('../models/GeneralPoints'),
  facultyJoined: require('../models/FacultyJoined'),
  facultyAchievements: require('../models/FacultyAchievements'),
  studentAchievements: require('../models/StudentAchievements'),
  departmentAchievements: require('../models/DepartmentAchievements'),
  facultyEvents: require('../models/FacultyEvents'),
  studentEvents: require('../models/StudentEvents'),
  nonTechEvents: require('../models/NonTechEvents'),
  industryVisits: require('../models/IndustryVisits'),
  hackathons: require('../models/Hackathons'),
  facultyFDP: require('../models/FacultyFDP'),
  facultyVisits: require('../models/FacultyVisits'),
  patents: require('../models/Patents'),
  vedicProgramsStudents: require('../models/VedicProgramsStudents'),
  vedicProgramsFaculty: require('../models/VedicProgramsFaculty'),
  placements: require('../models/Placements'),
  mous: require('../models/MoUs'),
  skillDevelopment: require('../models/SkillDevelopment')
};

const SYSTEM_KEYS = new Set(['departmentId', 'reportId', 'createdBy', 'attachments', 'id']);

const toSectionKey = (rawValue = '') => {
  const normalized = rawValue
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!normalized) return '';

  const [first, ...rest] = normalized.split(' ');
  return first + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
};

const getAttachmentsFromFiles = (files = []) =>
  files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size
  }));

async function ensureDefaultSections() {
  for (const section of SECTION_DEFINITIONS) {
    await Section.findOrCreate({
      where: { key: section.key },
      defaults: {
        key: section.key,
        label: section.label,
        isActive: true
      }
    });
  }
}

async function getOrCreateActiveWeeklyReport(departmentId, createdBy) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const existing = await Report.findOne({
    where: {
      departmentId,
      reportType: 'weekly',
      status: 'active',
      weekStart: { [Op.lte]: now },
      weekEnd: { [Op.gte]: now }
    },
    order: [['createdAt', 'DESC']]
  });

  if (existing) return existing.id;

  const created = await Report.create({
    weekStart: monday,
    weekEnd: sunday,
    departmentId,
    reportType: 'weekly',
    status: 'active',
    createdBy
  });

  return created.id;
}

function hasDataField(Model) {
  return Boolean(Model.rawAttributes.data);
}

async function isSectionActive(sectionName) {
  const section = await Section.findOne({
    where: { key: sectionName, isActive: true }
  });
  return Boolean(section);
}

// GET available sections for selection
router.get('/catalog', auth, async (req, res) => {
  try {
    await ensureDefaultSections();
    const sections = await Section.findAll({
      where: { isActive: true },
      order: [['label', 'ASC']]
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add section to catalog (admin only)
router.post('/catalog', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const label = req.body.label?.trim();
    const keyFromInput = req.body.key?.trim();
    const key = keyFromInput || toSectionKey(label);

    if (!label || !key) {
      return res.status(400).json({ message: 'label is required (key optional)' });
    }

    if (!models[key]) {
      return res.status(400).json({
        message: `Unsupported section key '${key}'. Use one of the predefined report sections.`
      });
    }

    const [section, created] = await Section.findOrCreate({
      where: { key },
      defaults: {
        key,
        label,
        isActive: true,
        createdBy: req.user.id
      }
    });

    if (!created && !section.isActive) {
      await section.update({ isActive: true, label });
    }

    res.status(created ? 201 : 200).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE section from catalog (admin only, soft delete)
router.delete('/catalog/:id', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    await section.update({ isActive: false });
    res.json({ message: 'Section removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all entries for a section
router.get('/:sectionName', auth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { reportId, departmentId } = req.query;

    const Model = models[sectionName];
    if (!Model) return res.status(404).json({ message: 'Section not found' });
    if (!(await isSectionActive(sectionName))) {
      return res.status(403).json({ message: 'This section is not active' });
    }

    const where = {};
    if (reportId) where.reportId = Number(reportId);
    if (departmentId) where.departmentId = Number(departmentId);

    const entries = await Model.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    const userIds = [...new Set(entries.map((entry) => entry.createdBy).filter(Boolean))];
    const departmentIds = [...new Set(entries.map((entry) => entry.departmentId).filter(Boolean))];

    const [users, departments] = await Promise.all([
      User.findAll({ where: { id: userIds.length ? userIds : [0] } }),
      Department.findAll({ where: { id: departmentIds.length ? departmentIds : [0] } })
    ]);

    const usersById = new Map(users.map((user) => [user.id, user]));
    const departmentsById = new Map(departments.map((dept) => [dept.id, dept]));

    const formatted = entries.map((entry) => {
      const plain = entry.get({ plain: true });
      const user = usersById.get(plain.createdBy);
      const department = departmentsById.get(plain.departmentId);
      const base = {
        id: plain.id,
        reportId: plain.reportId,
        departmentId: plain.departmentId,
        department: department?.code || department?.name || '',
        createdBy: plain.createdBy,
        createdByUser: user
          ? { id: user.id, name: user.name, email: user.email }
          : null,
        attachments: plain.attachments || [],
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt
      };

      if (hasDataField(Model)) {
        return {
          ...base,
          ...(plain.data || {})
        };
      }

      return {
        ...base,
        content: plain.content,
        type: plain.type
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create entry with file upload
router.post('/:sectionName', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { sectionName } = req.params;
    const Model = models[sectionName];
    if (!Model) return res.status(404).json({ message: 'Section not found' });
    if (!(await isSectionActive(sectionName))) {
      return res.status(403).json({ message: 'This section is not active' });
    }

    const departmentId = Number(req.body.departmentId);
    if (!departmentId) {
      return res.status(400).json({ message: 'departmentId is required' });
    }

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const reportId =
      Number(req.body.reportId) || (await getOrCreateActiveWeeklyReport(departmentId, req.user.id));
    const attachments = getAttachmentsFromFiles(req.files);

    let entry;
    if (hasDataField(Model)) {
      const data = {};
      Object.entries(req.body).forEach(([key, value]) => {
        if (!SYSTEM_KEYS.has(key)) data[key] = value;
      });

      if (!data.department) {
        data.department = department.code || department.name;
      }

      entry = await Model.create({
        reportId,
        departmentId,
        createdBy: req.user.id,
        data,
        attachments
      });
    } else {
      if (!req.body.content?.trim()) {
        return res.status(400).json({ message: 'content is required' });
      }

      entry = await Model.create({
        reportId,
        departmentId,
        createdBy: req.user.id,
        content: req.body.content.trim(),
        type: req.body.type || 'other',
        attachments
      });
    }

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update entry
router.put('/:sectionName/:id', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { sectionName, id } = req.params;
    const Model = models[sectionName];
    if (!Model) return res.status(404).json({ message: 'Section not found' });
    if (!(await isSectionActive(sectionName))) {
      return res.status(403).json({ message: 'This section is not active' });
    }

    const entry = await Model.findByPk(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Faculty can only edit own entries.
    if (req.user.role === 'faculty' && Number(entry.createdBy) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const departmentId = Number(req.body.departmentId) || entry.departmentId;
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const reportId =
      Number(req.body.reportId) ||
      entry.reportId ||
      (await getOrCreateActiveWeeklyReport(departmentId, req.user.id));

    const newAttachments = getAttachmentsFromFiles(req.files);
    const attachments = [...(entry.attachments || []), ...newAttachments];

    if (hasDataField(Model)) {
      const nextData = { ...(entry.data || {}) };
      Object.entries(req.body).forEach(([key, value]) => {
        if (!SYSTEM_KEYS.has(key)) nextData[key] = value;
      });

      if (!nextData.department) {
        nextData.department = department.code || department.name;
      }

      await entry.update({
        reportId,
        departmentId,
        data: nextData,
        attachments
      });
    } else {
      await entry.update({
        reportId,
        departmentId,
        content: req.body.content?.trim() || entry.content,
        type: req.body.type || entry.type,
        attachments
      });
    }

    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE entry
router.delete('/:sectionName/:id', auth, async (req, res) => {
  try {
    const { sectionName, id } = req.params;
    const Model = models[sectionName];
    if (!Model) return res.status(404).json({ message: 'Section not found' });
    if (!(await isSectionActive(sectionName))) {
      return res.status(403).json({ message: 'This section is not active' });
    }

    const entry = await Model.findByPk(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (req.user.role === 'faculty' && Number(entry.createdBy) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await entry.destroy();
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
