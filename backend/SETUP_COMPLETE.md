# ✅ BACKEND SETUP COMPLETE

## 🎯 Your Credentials (Already Configured)

```
Client ID: YOUR_GOOGLE_CLIENT_ID
Client Secret: YOUR_GOOGLE_CLIENT_SECRET
Redirect URI: http://localhost:5000/api/auth/google/callback
```

---

## 🚀 START SERVER (3 Commands)

### Option 1: Automatic (Recommended)
```bash
cd backend
./START.sh
```

### Option 2: Manual
```bash
cd backend

# 1. Start MongoDB
sudo systemctl start mongod

# 2. Install dependencies
npm install

# 3. Start server
npm run dev
```

---

## ⚠️ IMPORTANT: Add Redirect URI to Google Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
4. Click "Save"

---

## 🧪 TEST IT

### 1. Health Check
```bash
curl http://localhost:5000/health
```
Expected: `{"status":"OK","message":"Server is running"}`

### 2. Google OAuth (Open in Browser)
```
http://localhost:5000/api/auth/google
```
Should redirect to Google login page

---

## 📁 What's Included

✅ Express server with MongoDB  
✅ Google OAuth 2.0 authentication  
✅ JWT token generation  
✅ File upload support (images, PDFs)  
✅ User, Department, Report models  
✅ Auth & role-based middleware  
✅ Example StudentEvents model with attachments  

---

## 🎯 Next Steps

1. ✅ Start server (you're here)
2. Create remaining 17 section models
3. Create section CRUD routes
4. Create report generation service
5. Test with Postman

---

## 🐛 Troubleshooting

### MongoDB not starting?
```bash
# Check status
sudo systemctl status mongod

# Start manually
sudo systemctl start mongod
```

### Port 5000 in use?
Edit `.env` and change:
```
PORT=5001
```

### Google OAuth error?
- Verify redirect URI is added in Google Console
- Check credentials in `.env` file
- Make sure email ends with @bvrithyderabad.edu.in

---

**Ready to code!** 🚀
