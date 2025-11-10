#!/bin/bash

# Bank Tracker Deployment Script
# This script should be placed on the deployment server

set -e

echo "🚀 Starting Bank Tracker Deployment"
echo "===================================="

# Configuration
REPO_URL="${REPO_URL:-git@github.com:PhantomDave/BankTrackerGraphQL.git}"
DEPLOY_DIR="${DEPLOY_DIR:-$HOME/BankTrackerGraphQL}"
BRANCH="${BRANCH:-main}"

# Navigate to deployment directory
if [ ! -d "$DEPLOY_DIR" ]; then
    echo "📁 Cloning repository..."
    git clone "$REPO_URL" "$DEPLOY_DIR"
fi

cd "$DEPLOY_DIR"

echo "📥 Pulling latest changes from $BRANCH..."
git fetch origin
git reset --hard "origin/$BRANCH"
git clean -fd

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with production values!"
    exit 1
fi

# Pull latest images or rebuild
echo "🏗️  Building Docker images..."
docker compose build --pull

# Stop old containers
echo "🛑 Stopping old containers..."
docker compose down

# Start new containers
echo "▶️  Starting new containers..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker compose ps

# Check health
echo ""
echo "🏥 Health Checks:"
if curl -sf http://localhost:5095/graphql?sdl > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

if curl -sf http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check failed"
fi

echo ""
echo "✅ Deployment completed!"
echo ""
echo "View logs with: docker compose logs -f"
