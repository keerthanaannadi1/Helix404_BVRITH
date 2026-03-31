# 🛠️ TECH STACK DOCUMENTATION
## Weekly Report Management System - BVRIT Hyderabad

**Database**: MongoDB (Local)  
**Authentication**: Google OAuth 2.0  
**Stack**: MERN (MongoDB, Express, React, Node.js)

---

## 📦 TECHNOLOGY STACK

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x LTS | Runtime environment |
| **Express.js** | ^4.18.0 | Web framework |
| **MongoDB** | ^6.0 | NoSQL database (local) |
| **Mongoose** | ^7.0.0 | ODM for MongoDB |
| **Passport.js** | ^0.6.0 | Authentication middleware |
| **passport-google-oauth20** | ^2.0.0 | Google OAuth 2.0 strategy |
| **express-session** | ^1.17.0 | Session management |
| **JWT** | ^9.0.0 | Token generation |
| **docx** | ^8.5.0 | DOCX report generation |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **dotenv** | ^16.0.0 | Environment variables |
| **express-validator** | ^7.0.0 | Input validation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.2.0 | UI library |
| **Vite** | ^4.3.0 | Build tool |
| **React Router** | ^6.11.0 | Client-side routing |
| **Axios** | ^1.4.0 | HTTP client |
| **React Hook Form** | ^7.43.0 | Form management |
| **@tanstack/react-query** | ^4.29.0 | Server state management |
| **date-fns** | ^2.30.0 | Date manipulation |
| **react-toastify** | ^9.1.0 | Toast notifications |
| **@react-oauth/google** | ^0.11.0 | Google OAuth components |

---

## 🏗️ ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React + Vite + React Router + Axios + React Query          │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Google  │  │Dashboard │  │ Section  │  │  Admin   │   │
│  │  Login   │  │  (Grid)  │  │  Forms   │  │  Panel   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│      Node.js + Express + Passport.js + JWT Middleware       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Google  │  │ Sections │  │  Report  │  │  Export  │   │
│  │  OAuth   │  │  Routes  │  │  Routes  │  │ Service  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ Mongoose ODM
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│                      MongoDB 6.0                             │
│                                                              │
│  Collections: users, departments, reports,                  │
│               18 section collections (generalPoints,         │
│               facultyJoined, placements, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATABASE SCHEMA (MongoDB)

### Collections Structure

#### 1. **users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,  // format: facultyname@bvrithyderabad.edu.in
  googleId: String,  // Google OAuth ID
  role: { type: String, enum: ['faculty', 'admin'], default: 'faculty' },
  department: { type: ObjectId, ref: 'Department' },
  departmentChangeRequest: {
    requestedDepartment: ObjectId,
    status: { type: String, enum: ['pending', 'approved', 'rejected'] },
    requestedAt: Date
  },
  isActive: { type: Boolean, default: true },
  createdAt: Date
}
```

#### 2. **departments**
```javascript
{
  _id: ObjectId,
  name: String,  // e.g., "Computer Science"
  code: String,  // e.g., "CSE"
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}
```

#### 3. **reports**
```javascript
{
  _id: ObjectId,
  weekStart: Date,  // Monday
  weekEnd: Date,    // Sunday
  department: { type: ObjectId, ref: 'Department' },  // null = institution-wide
  reportType: { type: String, enum: ['weekly', 'monthly', 'yearly'] },
  status: { type: String, enum: ['active', 'generated'], default: 'active' },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: Date
}
```

#### 4. **18 Section Collections** (example: placements)
```javascript
{
  _id: ObjectId,
  reportId: { type: ObjectId, ref: 'Report' },
  department: { type: ObjectId, ref: 'Department' },
  createdBy: { type: ObjectId, ref: 'User' },
  
  // Section-specific fields
  companyName: String,
  studentsPlaced: Number,
  package: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📦 DEPENDENCIES INSTALLATION

### Backend Setup
```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose passport passport-google-oauth20 express-session jsonwebtoken cors dotenv express-validator docx
npm install --save-dev nodemon
```

### Frontend Setup
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-router-dom react-hook-form @tanstack/react-query date-fns react-toastify @react-oauth/google
```

---

## 📝 ENVIRONMENT VARIABLES

### Backend `.env`
```
# Database
MONGODB_URI=mongodb://localhost:27017/bvrit_reports

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRY=7d

# Session
SESSION_SECRET=your_session_secret_here

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🚀 FOLDER STRUCTURE (Per basic_instructions.txt)

```
Team1_BVRITH/
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/AuthContext.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── .env
├── backend/
│   ├── config/db.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/exportService.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── database/
    └── README.md (MongoDB setup instructions)
```

---

## ✅ TECH STACK JUSTIFICATION

| Choice | Reason |
|--------|--------|
| **MongoDB** | Flexible schema for 18 different section structures |
| **Mongoose** | Easy ODM, schema validation, middleware support |
| **Express** | Lightweight, mature, large ecosystem |
| **React** | Component reusability (18 sections use same form logic) |
| **Vite** | 10x faster than CRA, better DX |
| **Google OAuth** | No password management, institutional email validation |
| **JWT** | Stateless auth, scalable |
| **docx library** | Native DOCX generation (from output_formats/) |
| **React Query** | Automatic caching, reduces API calls |

---

**Last Updated**: March 31, 2026  
**Status**: Ready for Implementation ✅
