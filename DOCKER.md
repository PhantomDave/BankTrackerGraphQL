# Docker Deployment Guide

## Overview

This application uses Docker Compose to orchestrate three services:
- **Database**: PostgreSQL 18
- **Backend**: .NET 9 GraphQL API
- **Frontend**: Angular application served via Nginx

All services are connected via a custom bridge network called `banktracking-network`.

## Quick Start

### Production Deployment (Pre-built Images)

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update the JWT secret** in `.env`:
   ```
   JWT_SECRET=your_secure_random_string_here
   ```

3. **Pull and start all services**:
   ```bash
   docker compose pull
   docker compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:5095/graphql
   - Database: localhost:5432

### Local Testing (Build Containers)

To test container builds locally before pushing:

```bash
docker compose -f compose.local.yaml up -d --build
```

### Development Mode (Database Only)

To run only the database in Docker while running backend/frontend on host:

```bash
docker compose -f compose.dev.yaml up -d
```

## Configuration Files

### Docker Compose Files

- `compose.yaml` - Production deployment (pulls pre-built images from GHCR)
- `compose.local.yaml` - Local testing with builds (for testing containers before pushing)
- `compose.dev.yaml` - Development database only (for running backend/frontend on host)

### Backend
- `appsettings.json` - Base configuration
- `appsettings.Development.json` - Local development (localhost database)
- `appsettings.Docker.json` - Container environment (uses service names)

The backend automatically uses `appsettings.Docker.json` when running in containers because `ASPNETCORE_ENVIRONMENT=Docker`.

### Frontend
- `environment.development.ts` - Local development
- `environment.production.ts` - Production build (proxies GraphQL through Nginx)

The frontend production build uses `/graphql` which is proxied to the backend service via Nginx.

## Network Architecture

```
┌─────────────────────────────────────────────────────┐
│         banktracking-network (bridge)               │
│                                                     │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐ │
│  │ database │◄─────┤ backend  │◄─────┤ frontend │ │
│  │  :5432   │      │  :5095   │      │   :80    │ │
│  └────┬─────┘      └────┬─────┘      └────┬─────┘ │
│       │                 │                  │       │
└───────┼─────────────────┼──────────────────┼───────┘
        │                 │                  │
   Host:5432        Host:5095           Host:80
```

## Service Management

### Start services
```bash
docker compose up -d
```

### Stop services
```bash
docker compose down
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f database
```

### Pull latest images (production)
```bash
docker compose pull
docker compose up -d
```

### Rebuild after code changes (local testing)
```bash
docker compose -f compose.local.yaml up -d --build
```

### Clean everything (including volumes)
```bash
docker compose down -v
```

## Health Checks

All services include health checks:
- **Database**: `pg_isready` check every 10s
- **Backend**: GraphQL schema endpoint check every 30s
- **Frontend**: HTTP check every 30s

Services wait for their dependencies to be healthy before starting.

## Environment Variables

You can override configuration via environment variables:

```bash
# In .env file or export
JWT_SECRET=your_production_secret
POSTGRES_PASSWORD=your_secure_password
```

The backend accepts these environment overrides:
- `ConnectionStrings__DefaultConnection`
- `Jwt__Secret`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpiryMinutes`

## Production Deployment

### Container Images

Production images are automatically built and pushed to GitHub Container Registry (GHCR) on every push to the `main` branch:
- Backend: `ghcr.io/phantomdave/banktrackergraphql/backend:latest`
- Frontend: `ghcr.io/phantomdave/banktrackergraphql/frontend:latest`

The deployment workflow pulls these pre-built images instead of building on the server.

### Deployment Process

1. **Automated**: Push to `main` triggers:
   - Build workflows create and push container images to GHCR
   - Deploy workflow pulls latest images and restarts services

2. **Manual**: Run deployment workflow via GitHub Actions

### Production Checklist

For production:

1. **Update secrets**: Change all default passwords and JWT secret
2. **Configure GHCR access**: Ensure deployment server can pull from GHCR
3. **Use secrets management**: Consider Docker secrets or external secret management
4. **Enable HTTPS**: Add SSL certificates and update Nginx config
5. **Remove port mappings**: Only expose frontend (port 80/443)
6. **Set resource limits**: Add memory and CPU limits to services
7. **Use external database**: Point to a managed PostgreSQL instance
8. **Enable monitoring**: Add logging and monitoring solutions

## Troubleshooting

### Backend can't connect to database
- Check database health: `docker compose ps`
- Verify network: `docker network inspect banktracking-network`
- Check connection string in backend logs

### Frontend can't reach backend
- Check backend health: `curl http://localhost:5095/graphql?sdl`
- Verify Nginx proxy config in `frontend/nginx.conf`
- Check browser console for CORS errors

### Port already in use
- Change port mappings in `compose.yaml`
- Or stop conflicting services
