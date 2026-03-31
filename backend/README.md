# BVRIT Reports Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MongoDB (Local)
```bash
# Install MongoDB: https://www.mongodb.com/docs/manual/installation/

# Start MongoDB
sudo systemctl start mongod  # Linux
# OR
brew services start mongodb-community  # Mac

# Verify MongoDB is running
mongosh
```

### 3. Setup Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### 4. Configure Environment Variables
Edit `.env` file and add your credentials:
```
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
JWT_SECRET=change_this_to_random_string
SESSION_SECRET=change_this_to_random_string
```

### 5. Run Server
```bash
npm run dev
```

Server will start on http://localhost:5000

## API Endpoints

### Auth
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user (requires JWT)
- `POST /api/auth/logout` - Logout

## File Upload Support

All section models support file attachments. Files are stored in `uploads/` directory.

**Allowed file types**: JPEG, PNG, PDF  
**Max file size**: 5MB

## Next Steps

1. Create remaining section models (copy StudentEvents.js pattern)
2. Create section routes with CRUD operations
3. Add file upload to POST/PUT routes using `upload.array('files', 5)`
4. Create report generation service
5. Test with Postman

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test Google OAuth (open in browser)
http://localhost:5000/api/auth/google
```
