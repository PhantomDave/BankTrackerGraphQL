#!/bin/bash

# Bank Tracker Docker Setup Script

set -e

echo "🏦 Bank Tracker Docker Setup"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update the JWT_SECRET in .env before running in production!"
    echo ""
fi

# Parse command line arguments
COMMAND=${1:-up}

case $COMMAND in
    up)
        echo "🚀 Starting all services..."
        docker compose up -d --build
        echo ""
        echo "✅ Services starting!"
        echo ""
        echo "📊 Service URLs:"
        echo "   Frontend:  http://localhost:4200"
        echo "   Backend:   http://localhost:5095/graphql"
        echo "   Database:  localhost:5432"
        echo ""
        echo "📝 View logs with: docker compose logs -f"
        ;;
    down)
        echo "🛑 Stopping all services..."
        docker compose down
        echo "✅ Services stopped!"
        ;;
    restart)
        echo "🔄 Restarting all services..."
        docker compose down
        docker compose up -d --build
        echo "✅ Services restarted!"
        ;;
    logs)
        docker compose logs -f
        ;;
    clean)
        echo "🧹 Cleaning all containers, volumes, and images..."
        read -p "⚠️  This will delete all data. Continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            docker rmi banktrackingapplication banktrackingfrontend 2>/dev/null || true
            echo "✅ Cleanup complete!"
        else
            echo "❌ Cleanup cancelled"
        fi
        ;;
    dev)
        echo "🔧 Starting development database only..."
        docker compose -f compose.dev.yaml up -d
        echo "✅ Development database started on localhost:5432"
        echo "💡 Run your backend and frontend locally with their normal start commands"
        ;;
    status)
        echo "📊 Service Status:"
        docker compose ps
        ;;
    *)
        echo "Usage: $0 {up|down|restart|logs|clean|dev|status}"
        echo ""
        echo "Commands:"
        echo "  up       - Start all services (default)"
        echo "  down     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View service logs"
        echo "  clean    - Remove all containers, volumes, and images"
        echo "  dev      - Start only database for local development"
        echo "  status   - Show service status"
        exit 1
        ;;
esac
