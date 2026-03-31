# 🔧 BACKEND DEVELOPER PROMPT — Weekly Report Management System
### Stack: Node.js + Express + MongoDB
### Tool: Amazon Q | Person 1

---

## 🎯 PROJECT OVERVIEW

Build the backend for a **Collaborative Weekly Report Management System** for BVRIT Hyderabad College of Engineering. Faculty members fill in data across 17 structured sections, and the system auto-generates downloadable reports (PDF/DOCX) matching the institution's official format.

---

## 🗂️ FOLDER STRUCTURE TO CREATE

```
backend/
├── config/
│   └── db.js                  # MongoDB connection
├── middleware/
│   ├── auth.js                # JWT verification
│   └── roleCheck.js           # Role-based access
├── models/
│   ├── User.js
│   ├── Report.js              # Week-based report container
│   └── sections/              # One model per section
│       ├── GeneralPoints.js
│       ├── FacultyJoined.js
│       ├── FacultyAchievements.js
│       ├── StudentAchievements.js
│       ├── DepartmentAchievements.js
│       ├── FacultyEvents.js
│       ├── StudentEvents.js
│       ├── NonTechEvents.js
│       ├── IndustryVisits.js
│       ├── Hackathons.js
│       ├── FacultyFDP.js
│       ├── FacultyVisits.js
│       ├── Patents.js
│       ├── VedicPrograms.js
│       ├── Placements.js
│       ├── MoUs.js
│       └── SkillDevelopment.js
├── routes/
│   ├── auth.routes.js
│   ├── report.routes.js
│   └── sections.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── report.controller.js
│   └── sections.controller.js
├── services/
│   └── exportService.js       # PDF + DOCX generation
├── .env
├── server.js
└── package.json
```

---

## 🔐 AUTH SYSTEM

### User Model (`models/User.js`)
```javascript
{
  name: String,
  email: String,
  password: String (bcrypt hashed),
  role: { type: String, enum: ['faculty', 'coordinator', 'admin'] },
  department: String,
  createdAt: Date
}
```

### Auth Routes (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Create user (admin only) |
| POST | `/login` | Returns JWT token |
| GET | `/me` | Get current user profile |

### JWT Middleware
- Protect all `/api/sections/*` and `/api/report/*` routes
- Role check: `faculty` can only POST/PUT their own entries; `coordinator` and `admin` can GET all + trigger export

---

## 📅 REPORT MODEL

```javascript
// models/Report.js
{
  weekStart: Date,           // e.g., 2026-03-23
  weekEnd: Date,             // e.g., 2026-03-28
  department: String,
  status: { type: String, enum: ['active', 'submitted'], default: 'active' },
  sectionStatus: {           // Track completion of all 17 sections
    generalPoints: { type: String, enum: ['pending','in-progress','complete'], default: 'pending' },
    facultyJoined: String,
    facultyAchievements: String,
    studentAchievements: String,
    departmentAchievements: String,
    facultyEvents: String,
    studentEvents: String,
    nonTechEvents: String,
    industryVisits: String,
    hackathons: String,
    facultyFDP: String,
    facultyVisits: String,
    patents: String,
    vedicPrograms: String,
    placements: String,
    mous: String,
    skillDevelopment: String
  },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}
```

---

## 📋 ALL 17 SECTION MODELS

Build one Mongoose model for each section. Every model MUST include:
- `reportId`: ref to Report model
- `createdBy`: ref to User (who submitted this entry)
- `department`: String
- `createdAt`: Date

### Section-specific fields:

**1. General Points**
```javascript
{ content: String, type: { type: String, enum: ['meeting','announcement','other'] } }
```

**2. Faculty Joined/Relieved**
```javascript
{ facultyName: String, designation: String, dateOfJoining: Date, dateOfRelieving: Date }
```

**3. Faculty Achievements**
```javascript
{ facultyName: String, achievementDetails: String, date: Date }
```

**4. Student Achievements**
```javascript
{ studentName: String, rollNo: String, department: String, achievementDetails: String, date: Date }
```

**5. Department Achievements**
```javascript
{ details: String, date: Date }
```

**6. Faculty Events Conducted**
```javascript
{ eventName: String, eventType: { type: String, enum: ['FDP','Workshop','STTP','Other'] }, resourcePerson: String, coordinator: String, facultyCount: Number, dateFrom: Date, dateTo: Date }
```

**7. Student Events Conducted**
```javascript
{ eventName: String, resourcePerson: String, coordinator: String, studentsCount: Number, dateFrom: Date, dateTo: Date }
```

**8. Non-Technical Events**
```javascript
{ eventName: String, resourcePerson: String, coordinator: String, studentsCount: Number, dateFrom: Date, dateTo: Date }
```

**9. Industry/College Visits**
```javascript
{ industryName: String, location: String, coordinator: String, studentsCount: Number, dateFrom: Date, dateTo: Date }
```

**10. Hackathons/External Events**
```javascript
{ eventName: String, conductedBy: String, mentorDetails: String, studentsCount: Number, dateFrom: Date, dateTo: Date }
```

**11. Faculty FDP/Certifications**
```javascript
{ facultyName: String, workshopName: String, organizedBy: String, dateFrom: Date, dateTo: Date }
```

**12. Faculty Visits**
```javascript
{ facultyName: String, visitedInstitution: String, location: String, dateFrom: Date, dateTo: Date }
```

**13. Patents Published**
```javascript
{ facultyName: String, patentTitle: String, applicationNo: String, publicationDate: Date }
```

**14. VEDIC Programs**
```javascript
{ programName: String, targetType: { type: String, enum: ['students','faculty'] }, studentsCount: Number, facultyName: String, workshopName: String, center: { type: String, enum: ['Hyderabad','Bangalore'] }, dateFrom: Date, dateTo: Date }
```

**15. Placements**
```javascript
{ companyName: String, department: String, studentsPlaced: Number, package: String }
```

**16. MoUs Signed**
```javascript
{ organizationName: String, signingDate: Date, validity: String, purpose: String }
```

**17. Skill Development Programs**
```javascript
{ programName: String, coordinator: String, topic: String, studentsCount: Number, sessions: Number }
```

---

## 🛣️ API ROUTES

### Auth Routes (`/api/auth`)
```
POST /login
POST /register
GET  /me
```

### Report Routes (`/api/report`)
```
POST   /                    → Create new weekly report (coordinator/admin)
GET    /                    → List all reports (with filters: week, department)
GET    /:reportId           → Get full report with section status
PUT    /:reportId/submit    → Mark report as submitted
GET    /:reportId/export/pdf   → Download PDF
GET    /:reportId/export/docx  → Download DOCX
GET    /:reportId/export/monthly   → Download monthly aggregate
GET    /:reportId/export/yearly    → Download yearly aggregate
```

### Section Routes (`/api/sections/:sectionName`)
```
GET    /?reportId=xxx       → Get all entries for this section
POST   /?reportId=xxx       → Add new entry
PUT    /:entryId            → Update entry (owner or coordinator/admin)
DELETE /:entryId            → Delete entry (owner or coordinator/admin)
```

Example: `POST /api/sections/placements?reportId=abc123`

---

## 📤 EXPORT SERVICE (CRITICAL FEATURE)

Create `services/exportService.js` using `docx` npm package.

### Install
```bash
npm install docx pdfkit
```

### Report Format to Replicate
The exported DOCX must match BVRIT's official format:
1. **Header**: Institution logo + name + "Weekly Report" title
2. **Week Duration** + **Department** line
3. Each of the 17 sections as numbered headings with proper tables
4. Tables must have: S.No column, data columns matching each section's fields
5. Empty rows for sections with no data (don't skip sections)

### Export function structure
```javascript
async function generateDocx(reportId) {
  // 1. Fetch report + all 17 sections from DB
  // 2. Build DOCX using docx npm package
  // 3. Return buffer for download
}

async function generatePDF(reportId) {
  // Convert DOCX to PDF using LibreOffice or use pdfkit directly
}

async function generateMonthly(department, month, year) {
  // Aggregate all weekly reports for the month
  // Group and merge entries across weeks
}

async function generateYearly(department, year) {
  // Aggregate all reports for the year
}
```

---

## ⚙️ SERVER SETUP

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/report', require('./routes/report.routes'));
app.use('/api/sections', require('./routes/sections.routes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(5000, () => console.log('Server running on port 5000')));
```

### .env
```
MONGO_URI=mongodb://localhost:27017/bvrit_reports
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### package.json dependencies
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "docx": "^8.0.0",
    "pdfkit": "^0.13.0"
  }
}
```

---

## ✅ BUILD ORDER FOR AMAZON Q

**Tell Amazon Q to build in this exact order:**

1. `server.js` + `config/db.js` + `.env`
2. `models/User.js` + `models/Report.js`
3. `middleware/auth.js` + `middleware/roleCheck.js`
4. `controllers/auth.controller.js` + `routes/auth.routes.js`
5. All 17 section models in `models/sections/`
6. `controllers/sections.controller.js` + `routes/sections.routes.js` (generic CRUD for all sections)
7. `controllers/report.controller.js` + `routes/report.routes.js`
8. `services/exportService.js` (DOCX + PDF generation)

---

## 🔗 API BASE URL FOR FRONTEND

All APIs available at: `http://localhost:5000/api`
Frontend will connect using Axios with `Authorization: Bearer <token>` header.
