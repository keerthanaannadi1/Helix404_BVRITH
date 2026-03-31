#!/bin/bash

echo "🐳 Starting MongoDB with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed!"
    echo ""
    echo "Install Docker:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo "  sudo usermod -aG docker $USER"
    echo "  newgrp docker"
    exit 1
fi

# Start MongoDB with Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    docker compose up -d 2>/dev/null || docker-compose up -d
    echo "✅ MongoDB started in Docker"
else
    # Fallback to docker run
    docker run -d \
        --name bvrit_mongodb \
        -p 27017:27017 \
        -v mongodb_data:/data/db \
        mongo:6.0
    echo "✅ MongoDB started in Docker"
fi

echo ""
echo "Waiting for MongoDB to be ready..."
sleep 3

# Check if MongoDB is accessible
if docker ps | grep -q bvrit_mongodb || docker ps | grep -q mongo; then
    echo "✅ MongoDB is running!"
    echo "🔗 Connection: mongodb://localhost:27017"
    echo ""
    echo "Now run: npm run dev"
else
    echo "❌ MongoDB failed to start"
fi
