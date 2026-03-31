const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

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

// GET all entries for a section
router.get('/:sectionName', auth, async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { reportId, departmentId } = req.query;
    
    const Model = models[sectionName];
    if (!Model) return res.status(404).json({ message: 'Section not found' });

    const query = {};
    if (reportId) query.reportId = reportId;
    if (departmentId) query.department = departmentId;

    const entries = await Model.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json(entries);
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

    const data = { ...req.body, createdBy: req.user.id };
    
    // Add file attachments
    if (req.files && req.files.length > 0) {
      data.attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
    }

    const entry = await Model.create(data);
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

    const entry = await Model.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Check ownership (faculty can only edit own entries)
    if (req.user.role === 'faculty' && entry.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const data = { ...req.body };
    
    // Add new file attachments
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      data.attachments = [...(entry.attachments || []), ...newFiles];
    }

    const updated = await Model.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
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

    const entry = await Model.findById(id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Check ownership
    if (req.user.role === 'faculty' && entry.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Model.findByIdAndDelete(id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
