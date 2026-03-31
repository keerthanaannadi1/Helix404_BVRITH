#!/bin/bash

echo "🔍 Checking MongoDB installation..."

# Try different service names
if sudo systemctl start mongod 2>/dev/null; then
    echo "✅ Started mongod"
elif sudo systemctl start mongodb 2>/dev/null; then
    echo "✅ Started mongodb"
elif mongod --version 2>/dev/null; then
    echo "📦 MongoDB installed, starting manually..."
    sudo mkdir -p /data/db
    sudo chown -R $USER:$USER /data/db
    mongod --dbpath /data/db --fork --logpath /var/log/mongodb.log
    echo "✅ MongoDB started manually"
else
    echo "❌ MongoDB not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y mongodb
    sudo systemctl start mongodb
    sudo systemctl enable mongodb
    echo "✅ MongoDB installed and started"
fi

# Verify
sleep 2
if mongosh --eval "db.adminCommand('ping')" 2>/dev/null || mongo --eval "db.adminCommand('ping')" 2>/dev/null; then
    echo "✅ MongoDB is running!"
    echo "🔗 Connection: mongodb://localhost:27017"
else
    echo "⚠️  MongoDB may not be running. Try manually:"
    echo "   sudo apt-get install mongodb"
    echo "   sudo systemctl start mongodb"
fi
