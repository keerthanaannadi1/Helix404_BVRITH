# 📋 IMPLEMENTATION PLAN - 2 PERSON TEAM
## Weekly Report Management System - BVRIT Hyderabad

**Timeline**: 12 days | **Database**: MongoDB (Local) | **Auth**: Google OAuth 2.0

---

## 👥 ROLES

**Person 1 (Backend)**: Node.js + Express + MongoDB + Mongoose + Passport.js + docx  
**Person 2 (Frontend)**: React + Vite + Google OAuth + Forms + Dashboard

---

## 📅 DAY-BY-DAY TASKS

### **DAY 1: Setup + Google OAuth**

#### Backend
- [ ] `npm init` + install: express, mongoose, passport, passport-google-oauth20, express-session, jsonwebtoken, cors, dotenv, docx
- [ ] Setup local MongoDB database
- [ ] Create User & Department models (Mongoose)
- [ ] Configure Google OAuth (Google Cloud Console)
- [ ] Setup Passport.js with Google strategy
- [ ] Routes: GET `/api/auth/google`, GET `/api/auth/google/callback`, GET `/api/auth/me`
- [ ] Email validation: @bvrithyderabad.edu.in only
- [ ] Generate JWT after OAuth success

#### Frontend
- [ ] `npm create vite` + install: axios, react-router-dom, react-hook-form, @tanstack/react-query, @react-oauth/google
- [ ] Setup Axios with JWT interceptor
- [ ] Login page with "Sign in with Google" button
- [ ] Handle OAuth callback, store JWT in localStorage
- [ ] Test login flow

**Checkpoint**: OAuth login works end-to-end

---

### **DAY 2: Department Management**

#### Backend
- [ ] Department routes: POST, GET, DELETE (admin only)
- [ ] User routes: PUT `/api/users/select-department`, POST `/api/users/request-department-change`, PUT `/api/users/approve-department-change/:id`
- [ ] Auth middleware + role check middleware
- [ ] Test with Postman

#### Frontend
- [ ] AuthContext (user state, logout)
- [ ] Navbar + Sidebar components
- [ ] ProtectedRoute component
- [ ] DepartmentSelection modal (first login)
- [ ] Profile page (department change request)
- [ ] Test department selection

**Checkpoint**: Department selection works

---

### **DAY 3: Section Models (Part 1)**

#### Backend
- [ ] Create 9 Mongoose models:
  1. generalPoints
  2. facultyJoined
  3. facultyAchievements
  4. studentAchievements
  5. departmentAchievements
  6. facultyEvents
  7. studentEvents
  8. nonTechEvents
  9. industryVisits
- [ ] Test in MongoDB Compass

#### Frontend
- [ ] Dashboard page skeleton
- [ ] SectionCard component (status badge, entry count)
- [ ] Display 18 section cards in grid
- [ ] "Add Entry" button → navigate to `/section/:sectionName`

---

### **DAY 4: Section Models (Part 2) + CRUD**

#### Backend
- [ ] Create 9 more models:
  10. hackathons
  11. facultyFDP
  12. facultyVisits
  13. patents
  14. vedicProgramsStudents
  15. vedicProgramsFaculty
  16. placements
  17. mous
  18. skillDevelopment
- [ ] Generic sections controller:
  - GET `/api/sections/:sectionName?reportId=xxx`
  - POST `/api/sections/:sectionName`
  - PUT `/api/sections/:sectionName/:id`
  - DELETE `/api/sections/:sectionName/:id`
- [ ] Ownership validation (faculty = own entries only)

#### Frontend
- [ ] SectionForm page (reads :sectionName from URL)
- [ ] Field mapping for all 18 sections
- [ ] React Hook Form with validation
- [ ] POST to `/api/sections/:sectionName`
- [ ] Display entries table below form

**Checkpoint**: Can add entries to 5 sections

---

### **DAY 5: All Section Forms**

#### Backend
- [ ] Add pagination (50 entries/page)
- [ ] Add indexes on reportId, departmentId

#### Frontend
- [ ] Complete field mappings for all 18 sections
- [ ] SectionTable component (reusable)
- [ ] Edit button → populate form
- [ ] Delete button → confirmation dialog
- [ ] Test all 18 section forms

**Checkpoint**: All 18 sections working

---

### **DAY 6: Report Model + Export Service**

#### Backend
- [ ] Create Report model (weekStart, weekEnd, departmentId, reportType)
- [ ] Routes: POST `/api/reports`, GET `/api/reports`, GET `/api/reports/:id`
- [ ] Copy `output_formats/Exportservice.js` to `services/exportService.js`
- [ ] Test export with sample data

#### Frontend
- [ ] Admin panel page
- [ ] Department management UI (add, list, delete)
- [ ] User management UI (list users, pending requests)
- [ ] Approve/reject department change requests

---

### **DAY 7: Report Generation**

#### Backend
- [ ] POST `/api/reports/generate/weekly` - single week
- [ ] POST `/api/reports/generate/monthly` - aggregate month (NO breakdown)
- [ ] POST `/api/reports/generate/yearly` - aggregate year (NO breakdown)
- [ ] Department filter (specific OR institution-wide)
- [ ] Return DOCX buffer as download
- [ ] Test all 3 report types

#### Frontend
- [ ] ReportGeneration page (admin only)
- [ ] Form: Report Type, Start Date, End Date, Scope, Department
- [ ] "Generate Report" button → download DOCX
- [ ] Loading spinner during generation

**Checkpoint**: Report generation works

---

### **DAY 8: Testing + Validation**

#### Backend
- [ ] Add express-validator on all POST/PUT routes
- [ ] Error handling middleware
- [ ] Test with large datasets
- [ ] Handle empty sections (show empty rows in DOCX)

#### Frontend
- [ ] Loading skeletons
- [ ] Empty states ("No entries yet")
- [ ] Error messages
- [ ] Confirmation dialogs for delete

---

### **DAY 9: UI Polish**

#### Backend
- [ ] API documentation (Postman collection)
- [ ] Logging for critical operations
- [ ] Test edge cases

#### Frontend
- [ ] Mobile responsive (all pages)
- [ ] Color scheme (navy blue + gold)
- [ ] Google Fonts (Plus Jakarta Sans)
- [ ] Toast notifications

---

### **DAY 10: Integration Testing**

#### Both
- [ ] Faculty flow: Login → select dept → add entries → edit/delete
- [ ] Admin flow: Create dept → approve requests → generate report
- [ ] Test with 2 users simultaneously
- [ ] Fix bugs

---

### **DAY 11: Production Prep**

#### Backend
- [ ] Production MongoDB setup (or keep local)
- [ ] Environment variables
- [ ] CORS whitelist

#### Frontend
- [ ] Production build
- [ ] Environment variables
- [ ] Bundle optimization

---

### **DAY 12: Deployment**

#### Backend
- [ ] Deploy to Heroku/Railway/AWS
- [ ] HTTPS setup
- [ ] Test production APIs

#### Frontend
- [ ] Deploy to Vercel/Netlify
- [ ] Test production app
- [ ] User documentation

---

## 🚨 CRITICAL PATH

1. Day 1: Google OAuth (blocks everything)
2. Day 4: Section CRUD (blocks forms)
3. Day 7: Report generation (blocks admin testing)

---

## ✅ SUCCESS CRITERIA

- [ ] Google OAuth login works
- [ ] All 18 sections functional
- [ ] Reports in exact BVRIT format
- [ ] Mobile responsive
- [ ] Production deployed

---

**Status**: Ready to Start 🚀
