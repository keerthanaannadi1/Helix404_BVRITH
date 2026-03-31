# ⚡ QUICK START - Person 1 (Backend)

## ✅ What's Already Created

```
backend/
├── config/db.js              ✅ MongoDB connection
├── models/
│   ├── User.js               ✅ User model with Google OAuth
│   ├── Department.js         ✅ Department model
│   ├── Report.js             ✅ Report model
│   └── StudentEvents.js      ✅ Example section with FILE UPLOAD
├── middleware/
│   ├── auth.js               ✅ JWT authentication
│   ├── roleCheck.js          ✅ Role-based access
│   └── upload.js             ✅ File upload (multer)
├── routes/
│   └── auth.js               ✅ Google OAuth routes
├── uploads/                  ✅ File storage directory
├── server.js                 ✅ Express server
├── package.json              ✅ Dependencies
├── .env                      ✅ Environment variables
└── README.md                 ✅ Setup instructions
```

---

## 🚀 START NOW (5 Steps)

### Step 1: Install Dependencies (2 min)
```bash
cd backend
npm install
```

### Step 2: Start MongoDB (1 min)
```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Verify
mongosh
# Type: exit
```

### Step 3: Setup Google OAuth (5 min)
1. Go to: https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID & Secret

### Step 4: Update .env (1 min)
```bash
# Edit backend/.env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_secret_here
```

### Step 5: Start Server (1 min)
```bash
npm run dev
```

✅ Server running on http://localhost:5000

---

## 🧪 TEST IT

### Test 1: Health Check
```bash
curl http://localhost:5000/health
# Should return: {"status":"OK","message":"Server is running"}
```

### Test 2: Google OAuth
Open in browser:
```
http://localhost:5000/api/auth/google
```
Should redirect to Google login

---

## 📝 FILE UPLOAD FEATURE

### How It Works:
1. Faculty fills form + uploads files (certificates, images)
2. Files saved in `backend/uploads/` directory
3. File metadata saved in database (filename, path, size)
4. Files NOT included in report generation (only data)

### Example Model (StudentEvents.js):
```javascript
attachments: [{
  filename: String,        // Unique filename
  originalName: String,    // Original upload name
  path: String,            // File path
  mimetype: String,        // File type
  size: Number,            // File size in bytes
  uploadedAt: Date         // Upload timestamp
}]
```

### Allowed Files:
- Images: JPEG, PNG
- Documents: PDF
- Max size: 5MB per file

---

## 🎯 NEXT TASKS (After 1 Hour)

### Create Remaining Section Models (17 more):
Copy `models/StudentEvents.js` pattern for:
1. generalPoints
2. facultyJoined
3. facultyAchievements
4. studentAchievements
5. departmentAchievements
6. facultyEvents
7. nonTechEvents
8. industryVisits
9. hackathons
10. facultyFDP
11. facultyVisits
12. patents
13. vedicProgramsStudents
14. vedicProgramsFaculty
15. placements
16. mous
17. skillDevelopment

### Create Section Routes:
```javascript
// routes/sections.js
router.post('/:sectionName', upload.array('files', 5), createEntry);
router.get('/:sectionName', getEntries);
router.put('/:sectionName/:id', upload.array('files', 5), updateEntry);
router.delete('/:sectionName/:id', deleteEntry);
```

---

## 🔥 IMPORTANT NOTES

1. **Email Validation**: Only @bvrithyderabad.edu.in allowed
2. **File Storage**: Local uploads/ directory (not in database)
3. **JWT Token**: Expires in 7 days
4. **Role Check**: Admin can edit ANY entry, Faculty only OWN entries
5. **Report Generation**: Files NOT included in DOCX export

---

## 🐛 TROUBLESHOOTING

### MongoDB not starting?
```bash
# Check status
sudo systemctl status mongod

# Check logs
sudo journalctl -u mongod
```

### Google OAuth error?
- Check redirect URI matches exactly
- Verify Client ID/Secret in .env
- Enable Google+ API in console

### Port 5000 already in use?
```bash
# Change PORT in .env
PORT=5001
```

---

## ✅ SUCCESS CHECKLIST

- [ ] npm install completed
- [ ] MongoDB running
- [ ] Google OAuth credentials added
- [ ] Server starts without errors
- [ ] Health endpoint works
- [ ] Google OAuth redirects to Google login

**Ready to continue!** 🚀
