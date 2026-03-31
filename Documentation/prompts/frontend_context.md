# 🎨 FRONTEND DEVELOPER PROMPT — Weekly Report Management System
### Stack: React + Axios + React Router
### Tool: Codex / Claude | Person 2

---

## 🎯 PROJECT OVERVIEW

Build the frontend for a **Collaborative Weekly Report Management System** for BVRIT Hyderabad College of Engineering for Women. Faculty fill in 17 sections of data, coordinators review and track progress, and the system generates downloadable reports.

**Backend API base URL:** `http://localhost:5000/api`
**Auth:** JWT token stored in localStorage, sent as `Authorization: Bearer <token>`

---

## 🗂️ FOLDER STRUCTURE TO CREATE

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js           # Axios instance with interceptors
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SectionCard.jsx    # Status card for each section
│   │   ├── SectionTable.jsx   # Reusable data table for entries
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SectionForm.jsx    # Reusable form page for all 17 sections
│   │   ├── ReportPreview.jsx
│   │   ├── ExportCenter.jsx
│   │   └── AdminPanel.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── index.html
```

---

## 🛠️ SETUP COMMANDS

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom react-hook-form @tanstack/react-query
```

---

## 🔐 AUTH CONTEXT

```javascript
// src/context/AuthContext.jsx
// Store: user object, token, role
// Functions: login(email, password), logout()
// On login: save token to localStorage, decode role from JWT
// Expose: user, role, isAuthenticated, login, logout
```

---

## 📄 PAGES TO BUILD

### 1. Login Page (`/login`)

**Layout:** Centered card on a clean background
**Fields:**
- Email input
- Password input
- Login button
- Show error message if credentials wrong

**After login:** Redirect based on role:
- `faculty` → `/dashboard`
- `coordinator` → `/dashboard`
- `admin` → `/dashboard`

---

### 2. Dashboard Page (`/dashboard`)

**This is the most important page.**

**Top bar shows:**
- Current week duration (e.g., "Week: 23rd March – 28th March 2026")
- Department name
- Export buttons: Weekly | Monthly | Yearly (only for coordinator/admin)

**Main content — Section Status Grid:**
Display all 17 sections as cards in a grid (4 columns on desktop, 2 on tablet, 1 on mobile).

Each card shows:
- Section number + name
- Status badge: `Pending` (red) | `In Progress` (yellow) | `Complete` (green)
- Entry count (e.g., "3 entries")
- "Add Entry" button → navigates to `/section/:sectionName`
- "View Entries" button → opens inline table

**The 17 sections to display as cards:**
1. General Points
2. Faculty Joined / Relieved
3. Faculty Achievements
4. Student Achievements
5. Department Achievements
6. Faculty Events Conducted
7. Student Events Conducted
8. Non-Technical Events
9. Industry / College Visits
10. Hackathons / External Events
11. Faculty FDP / Certifications
12. Faculty Visits
13. Patents Published
14. VEDIC Programs
15. Placements
16. MoUs Signed
17. Skill Development Programs

**Bottom of dashboard:**
- Overall completion progress bar (e.g., "11/17 sections complete")
- Submit Report button (coordinator only, enabled when all sections complete)

---

### 3. Section Form Page (`/section/:sectionName`)

**Reusable form page** — same layout, different fields per section.

**Top:** Section name as heading + "Back to Dashboard" link

**Middle:** Form with section-specific fields (see fields below)

**Bottom:** 
- Submit button → POST to `/api/sections/:sectionName?reportId=xxx`
- Existing entries table below the form (fetched on load)
- Each row has Edit + Delete buttons

### Section-specific form fields:

**General Points:** Content (textarea), Type (select: meeting/announcement/other)

**Faculty Joined/Relieved:** Faculty Name, Designation, Date of Joining (date), Date of Relieving (date, optional)

**Faculty Achievements:** Faculty Name, Achievement Details (textarea), Date

**Student Achievements:** Student Name, Roll No, Department, Achievement Details, Date

**Department Achievements:** Details (textarea), Date

**Faculty Events Conducted:** Event Name, Event Type (FDP/Workshop/STTP/Other), Resource Person, Coordinator, Faculty Count (number), Date From, Date To

**Student Events Conducted:** Event Name, Resource Person, Coordinator, Students Count, Date From, Date To

**Non-Technical Events:** Event Name, Resource Person, Coordinator, Students Count, Date From, Date To

**Industry/College Visits:** Industry Name, Location, Coordinator, Students Count, Date From, Date To

**Hackathons/External Events:** Event Name, Conducted By, Mentor Details, Students Count, Date From, Date To

**Faculty FDP/Certifications:** Faculty Name, Workshop Name, Organized By, Date From, Date To

**Faculty Visits:** Faculty Name, Visited Institution, Location, Date From, Date To

**Patents Published:** Faculty Name, Patent Title, Application No, Publication Date

**VEDIC Programs:** Program Name, Target Type (students/faculty), Count, Center (Hyderabad/Bangalore), Date From, Date To

**Placements:** Company Name, Department, Students Placed (number), Package (e.g., "4.5 LPA")

**MoUs Signed:** Organization Name, Signing Date, Validity, Purpose

**Skill Development Programs:** Program Name, Coordinator, Topic, Students Count, Sessions (number)

---

### 4. Report Preview Page (`/report/preview`)

- Shows a live formatted preview of the complete weekly report
- Mirrors the structure of the official BVRIT weekly report format
- Each section renders as a table
- "Export as PDF" and "Export as DOCX" buttons (calls `/api/report/:id/export/pdf` and `/docx`)

---

### 5. Export Center Page (`/export`) — Coordinator/Admin only

**Download options:**
- Weekly Report (select specific week from date picker)
- Monthly Report (select month + year)
- Yearly Report (select year)
- Department filter dropdown

Each option has a Download button that calls the appropriate export API.

---

### 6. Admin Panel (`/admin`) — Admin only

- List of all users with role badge
- Add new user form (name, email, password, role, department)
- Deactivate user button

---

## 🔗 AXIOS SETUP

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## 🛣️ REACT ROUTER SETUP

```javascript
// App.jsx routes:
/login                    → Login (public)
/dashboard                → Dashboard (all roles)
/section/:sectionName     → SectionForm (faculty + coordinator + admin)
/report/preview           → ReportPreview (coordinator + admin)
/export                   → ExportCenter (coordinator + admin)
/admin                    → AdminPanel (admin only)
```

Use `<ProtectedRoute role="coordinator">` wrapper to guard role-specific pages.

---

## 🎨 UI DESIGN SPEC

### Color Palette
```css
--primary: #1E3A5F;        /* Deep navy blue - institution feel */
--primary-light: #2E5F9E;  /* Lighter blue for hover states */
--accent: #E8A020;         /* Gold/amber - achievement highlights */
--success: #2E7D32;        /* Green - complete status */
--warning: #F57C00;        /* Orange - in-progress status */
--danger: #C62828;         /* Red - pending status */
--bg: #F5F7FA;             /* Light grey page background */
--surface: #FFFFFF;        /* White cards */
--text-primary: #1A1A2E;   /* Dark text */
--text-muted: #6B7280;     /* Muted labels */
--border: #E2E8F0;         /* Card borders */
```

### Typography
```css
/* Import in index.html */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

font-family: 'Plus Jakarta Sans', sans-serif;  /* All UI text */
font-family: 'IBM Plex Mono', monospace;       /* Roll numbers, dates, codes */
```

### Layout
- Sidebar: 240px fixed left, navy background, white icons + text
- Main content: remaining width, light grey background
- Cards: white, 8px border radius, subtle shadow `0 1px 3px rgba(0,0,0,0.08)`
- Spacing: 24px page padding, 16px between cards

### Status Badge Styles
```css
.badge-pending    { background: #FEE2E2; color: #C62828; }
.badge-progress   { background: #FFF3E0; color: #F57C00; }
.badge-complete   { background: #E8F5E9; color: #2E7D32; }
```

### Section Cards (Dashboard)
- White card, 1px border, 12px padding
- Top: section number (small, muted) + section name (bold)
- Middle: status badge + entry count
- Bottom: two buttons side by side (Add Entry | View)
- On hover: slight border color change to primary blue

---

## ✅ BUILD ORDER FOR CODEX

**Tell Codex to build in this exact order:**

1. `src/api/axios.js` + `src/context/AuthContext.jsx`
2. `src/pages/Login.jsx` (with form validation)
3. `src/components/Navbar.jsx` + `src/components/Sidebar.jsx`
4. `src/App.jsx` with all routes + ProtectedRoute
5. `src/pages/Dashboard.jsx` (section status grid — most important)
6. `src/pages/SectionForm.jsx` (reusable, driven by sectionName param)
7. `src/pages/ExportCenter.jsx`
8. `src/pages/ReportPreview.jsx`
9. `src/pages/AdminPanel.jsx`

---

## 📌 KEY NOTES FOR CODEX

- Use `react-hook-form` for all forms (clean validation)
- Use `@tanstack/react-query` for all API calls (caching + loading states)
- Every form must show loading state on submit + success/error toast
- All tables must support Edit (inline or modal) + Delete with confirm dialog
- Mobile responsive — sidebar collapses to hamburger menu on small screens
- Report ID should be stored in localStorage after coordinator creates the weekly report, and reused for all section submissions
