# Docker Deployment Guide

## Overview

This application uses Docker Compose to orchestrate three services:
- **Database**: PostgreSQL 18
- **Backend**: .NET 9 GraphQL API
- **Frontend**: Angular application served via Nginx

All services are connected via a custom bridge network called `banktracking-network`.

## Quick Start

1. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update the JWT secret** in `.env`:
   ```
   JWT_SECRET=your_secure_random_string_here
   ```

3. **Build and start all services**:
   ```bash
   docker compose up -d --build
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:5095/graphql
   - Database: localhost:5432

## Configuration Files

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

### Rebuild after code changes
```bash
docker compose up -d --build
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

For production:

1. **Update secrets**: Change all default passwords and JWT secret
2. **Use secrets management**: Consider Docker secrets or external secret management
3. **Enable HTTPS**: Add SSL certificates and update Nginx config
4. **Remove port mappings**: Only expose frontend (port 80/443)
5. **Set resource limits**: Add memory and CPU limits to services
6. **Use external database**: Point to a managed PostgreSQL instance
7. **Enable monitoring**: Add logging and monitoring solutions

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
