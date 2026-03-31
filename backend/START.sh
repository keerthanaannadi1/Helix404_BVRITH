#!/bin/bash

echo "🚀 Starting BVRIT Reports Backend..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo "Starting MongoDB..."
    sudo systemctl start mongod 2>/dev/null || brew services start mongodb-community 2>/dev/null
    sleep 2
fi

# Check MongoDB connection
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB connection failed"
    echo "Please start MongoDB manually:"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Mac: brew services start mongodb-community"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🔗 Important URLs:"
echo "   Server: http://localhost:5000"
echo "   Health: http://localhost:5000/health"
echo "   Google OAuth: http://localhost:5000/api/auth/google"
echo ""
echo "📝 Google OAuth Credentials:"
echo "   Client ID: 145998888959-84gd44cg1pq40nmiupt3usgu12t3srcc.apps.googleusercontent.com"
echo "   Redirect URI: http://localhost:5000/api/auth/google/callback"
echo ""
echo "⚠️  Make sure this redirect URI is added in Google Cloud Console!"
echo ""
echo "Starting server..."
echo ""

npm run dev
