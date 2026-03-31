#!/bin/bash

echo "🐘 Setting up PostgreSQL database..."

# Create database
sudo -u postgres psql << SQL
DROP DATABASE IF EXISTS bvrit_reports;
CREATE DATABASE bvrit_reports;
\q
SQL

echo "✅ Database created: bvrit_reports"
echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now run: npm run dev"
