#!/bin/bash

echo "📦 Installing MongoDB on Debian/Ubuntu..."
echo ""

# Import MongoDB public GPG key
echo "1. Importing MongoDB GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg

# Add MongoDB repository
echo "2. Adding MongoDB repository..."
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
echo "3. Updating package list..."
sudo apt-get update

# Install MongoDB
echo "4. Installing MongoDB..."
sudo apt-get install -y mongodb-org

# Start MongoDB
echo "5. Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

# Check status
echo ""
echo "✅ MongoDB installation complete!"
echo ""
sudo systemctl status mongod --no-pager
echo ""
echo "🔗 MongoDB is running on: mongodb://localhost:27017"
