const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const Report = require('../models/Report');
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

// POST generate weekly report (admin only)
router.post('/generate/weekly', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { weekStart, weekEnd, departmentId } = req.body;
    
    // Fetch all section data
    const reportData = { weekStart, weekEnd, department: departmentId };
    
    for (const [key, Model] of Object.entries(models)) {
      const query = { 
        createdAt: { $gte: new Date(weekStart), $lte: new Date(weekEnd) }
      };
      if (departmentId) query.department = departmentId;
      
      reportData[key] = await Model.find(query).lean();
    }
    
    // Generate DOCX
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
    
    // Get all weeks in month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const reportsArray = [];
    
    // Fetch all section data for the month
    for (const [key, Model] of Object.entries(models)) {
      const query = { 
        createdAt: { $gte: startDate, $lte: endDate }
      };
      if (departmentId) query.department = departmentId;
      
      const data = await Model.find(query).lean();
      reportsArray.push({ [key]: data });
    }
    
    // Generate DOCX
    const buffer = await generateMonthlyDocx(reportsArray, month, year, departmentId);
    
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
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const reportsArray = [];
    
    // Fetch all section data for the year
    for (const [key, Model] of Object.entries(models)) {
      const query = { 
        createdAt: { $gte: startDate, $lte: endDate }
      };
      if (departmentId) query.department = departmentId;
      
      const data = await Model.find(query).lean();
      reportsArray.push({ [key]: data });
    }
    
    // Generate DOCX
    const buffer = await generateYearlyDocx(reportsArray, year, departmentId);
    
    res.setHeader('Content-Disposition', 'attachment; filename="YearlyReport.docx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
