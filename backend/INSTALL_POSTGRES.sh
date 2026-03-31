#!/bin/bash

echo "🐘 Installing PostgreSQL..."

# Install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << SQL
CREATE DATABASE bvrit_reports;
CREATE USER bvrit_admin WITH PASSWORD 'bvrit123';
GRANT ALL PRIVILEGES ON DATABASE bvrit_reports TO bvrit_admin;
\q
SQL

echo ""
echo "✅ PostgreSQL installed and configured!"
echo ""
echo "Database: bvrit_reports"
echo "User: bvrit_admin"
echo "Password: bvrit123"
echo "Connection: postgresql://bvrit_admin:bvrit123@localhost:5432/bvrit_reports"
