const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Department = require('../models/Department');
const { generateWeeklyDocx, generateMonthlyDocx, generateYearlyDocx } = require('../services/exportService');

// Model mapping for all sections
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

const exportKeyMap = {
  vedicProgramsStudents: 'vedicStudents',
  vedicProgramsFaculty: 'vedicFaculty'
};

function normalizeExportKey(modelKey) {
  return exportKeyMap[modelKey] || modelKey;
}

function parseDateOrFail(value, fieldName) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return date;
}

function startAndEndOfMonth(month, year) {
  return {
    startDate: new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0),
    endDate: new Date(Number(year), Number(month), 0, 23, 59, 59, 999)
  };
}

function startAndEndOfYear(year) {
  return {
    startDate: new Date(Number(year), 0, 1, 0, 0, 0, 0),
    endDate: new Date(Number(year), 11, 31, 23, 59, 59, 999)
  };
}

function buildSectionWhere(startDate, endDate, departmentId) {
  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (departmentId) where.departmentId = Number(departmentId);
  return where;
}

async function fetchDepartmentMap() {
  const departments = await Department.findAll();
  return new Map(
    departments.map((dept) => [dept.id, dept.code || dept.name || `Dept-${dept.id}`])
  );
}

function flattenSectionRows(modelKey, rows, departmentCodeById) {
  const usesDataField = modelKey !== 'generalPoints';

  if (!usesDataField) {
    return rows.map((row) => {
      const plain = row.get({ plain: true });
      return {
        content: plain.content,
        type: plain.type,
        department: departmentCodeById.get(plain.departmentId) || '',
        createdAt: plain.createdAt
      };
    });
  }

  return rows.map((row) => {
    const plain = row.get({ plain: true });
    return {
      ...(plain.data || {}),
      department:
        plain.data?.department ||
        departmentCodeById.get(plain.departmentId) ||
        '',
      createdAt: plain.createdAt
    };
  });
}

async function fetchAllSectionData(startDate, endDate, departmentId) {
  const departmentCodeById = await fetchDepartmentMap();
  const where = buildSectionWhere(startDate, endDate, departmentId);

  const entries = await Promise.all(
    Object.entries(models).map(async ([modelKey, Model]) => {
      const rows = await Model.findAll({
        where,
        order: [['createdAt', 'ASC']]
      });
      return [normalizeExportKey(modelKey), flattenSectionRows(modelKey, rows, departmentCodeById)];
    })
  );

  return Object.fromEntries(entries);
}

async function resolveDepartmentLabel(departmentId) {
  if (!departmentId) return undefined;
  const department = await Department.findByPk(Number(departmentId));
  return department?.code || department?.name;
}

// POST generate weekly report (admin only)
router.post('/generate/weekly', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { weekStart, weekEnd, departmentId } = req.body;
    const parsedWeekStart = parseDateOrFail(weekStart, 'weekStart');
    const parsedWeekEnd = parseDateOrFail(weekEnd, 'weekEnd');

    const sectionsData = await fetchAllSectionData(parsedWeekStart, parsedWeekEnd, departmentId);
    const reportData = {
      weekStart,
      weekEnd,
      department: await resolveDepartmentLabel(departmentId),
      ...sectionsData
    };

    const buffer = await generateWeeklyDocx(reportData);

    res.setHeader('Content-Disposition', 'attachment; filename="WeeklyReport.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST generate monthly report (admin only)
router.post('/generate/monthly', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { month, year, departmentId } = req.body;
    const { startDate, endDate } = startAndEndOfMonth(month, year);
    const sectionsData = await fetchAllSectionData(startDate, endDate, departmentId);

    const reportData = [{
      ...sectionsData,
      department: await resolveDepartmentLabel(departmentId)
    }];

    const buffer = await generateMonthlyDocx(
      reportData,
      Number(month),
      Number(year),
      await resolveDepartmentLabel(departmentId)
    );

    res.setHeader('Content-Disposition', 'attachment; filename="MonthlyReport.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST generate yearly report (admin only)
router.post('/generate/yearly', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { year, departmentId } = req.body;
    const { startDate, endDate } = startAndEndOfYear(year);
    const sectionsData = await fetchAllSectionData(startDate, endDate, departmentId);

    const reportData = [{
      ...sectionsData,
      department: await resolveDepartmentLabel(departmentId)
    }];

    const buffer = await generateYearlyDocx(
      reportData,
      Number(year),
      await resolveDepartmentLabel(departmentId)
    );

    res.setHeader('Content-Disposition', 'attachment; filename="YearlyReport.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
