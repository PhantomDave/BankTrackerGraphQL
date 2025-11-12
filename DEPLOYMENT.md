# Deployment Guide

This document describes the CI/CD workflow for building and deploying the Bank Tracker application.

## Overview

The deployment process uses GitHub Actions to:
1. Build Docker images for backend and frontend
2. Push images to GitHub Container Registry (GHCR)
3. Deploy by pulling pre-built images to production

## Workflows

### Build Workflows

#### Backend Image Build (`build-backend-image.yml`)
- **Trigger**: Push to `main` branch (backend code changes) or manual dispatch
- **Actions**:
  - Builds backend Docker image using multi-stage build
  - Pushes to `ghcr.io/phantomdave/banktrackergraphql/backend:latest`
  - Tags include branch name, commit SHA, and `latest`
- **Docker Image**: Contains only published .NET application (no SDK)

#### Frontend Image Build (`build-frontend-image.yml`)
- **Trigger**: Push to `main` branch (frontend code changes) or manual dispatch
- **Actions**:
  1. Starts backend API to generate GraphQL schema
  2. Downloads schema as artifact
  3. Builds frontend Docker image with schema
  4. Pushes to `ghcr.io/phantomdave/banktrackergraphql/frontend:latest`
- **Docker Image**: Contains only built Angular application served by nginx

### Deployment Workflow

#### Production Deployment (`deploy-tailscale.yml`)
- **Trigger**: Push to `main` branch or manual dispatch
- **Dependencies**: Waits for both image builds to complete
- **Actions**:
  1. Connects to production server via Tailscale
  2. Pulls latest code (for compose.yaml and configs)
  3. Logs into GHCR
  4. Pulls latest container images
  5. Restarts services with zero downtime
  6. Verifies deployment

## Container Images

### Backend Image Structure
```
mcr.microsoft.com/dotnet/aspnet:9.0 (runtime only)
  /app/
    PhantomDave.BankTracking.Api.dll
    appsettings*.json
    Dependencies (from dotnet publish)
```

### Frontend Image Structure
```
nginx:alpine
  /usr/share/nginx/html/
    Built Angular application (from npm run build)
  /etc/nginx/conf.d/
    nginx.conf (proxy configuration)
```

## Image Tags

Each image is tagged with:
- `latest` - Most recent build from main branch
- `main-<sha>` - Specific commit SHA for rollback capability
- `main` - Latest from main branch

Examples:
- `ghcr.io/phantomdave/banktrackergraphql/backend:latest`
- `ghcr.io/phantomdave/banktrackergraphql/backend:main-abc1234`
- `ghcr.io/phantomdave/banktrackergraphql/frontend:latest`

## Local Development

### Testing Container Builds Locally

Use `compose.local.yaml` to build and test containers on your machine:

```bash
# Build and run all services
docker compose -f compose.local.yaml up -d --build

# View logs
docker compose -f compose.local.yaml logs -f

# Stop services
docker compose -f compose.local.yaml down
```

### Development Mode (Database Only)

For regular development (running backend/frontend on host):

```bash
# Start only database
docker compose -f compose.dev.yaml up -d

# Run backend
cd PhantomDave.BankTracking.Api
dotnet run

# Run frontend (in another terminal)
cd frontend
npm start
```

## Production Deployment

### Automatic Deployment

1. Merge PR to `main` branch
2. GitHub Actions automatically:
   - Builds and pushes new images
   - Waits for builds to complete
   - Deploys to production server

### Manual Deployment

Trigger the deployment workflow manually:

1. Go to Actions tab in GitHub
2. Select "Deploy via Tailscale"
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

### Rollback

To roll back to a previous version:

1. Find the commit SHA you want to roll back to
2. Update `compose.yaml` image tags to use that SHA:
   ```yaml
   backend:
     image: ghcr.io/phantomdave/banktrackergraphql/backend:main-abc1234
   frontend:
     image: ghcr.io/phantomdave/banktrackergraphql/frontend:main-abc1234
   ```
3. Commit and push the change
4. Deployment workflow will pull and deploy those specific versions

## Secrets Required

### GitHub Actions Secrets

- `TAILSCALE_OAUTH_CLIENTID` - Tailscale OAuth client ID
- `TAILSCALE_OAUTH_CLIENT_SECRET` - Tailscale OAuth secret
- `TAILSCALE_SSH_TARGET` - Target server hostname on Tailscale network
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Server Environment

On the production server, create `.env` file:

```bash
JWT_SECRET=your_production_secret_here
```

## Monitoring

### Check Deployment Status

View workflow runs:
- https://github.com/PhantomDave/BankTrackerGraphQL/actions

### Check Container Registry

View published images:
- https://github.com/PhantomDave?tab=packages

### Health Checks

All services include health checks:
- Database: PostgreSQL ready check every 10s
- Backend: GraphQL schema endpoint every 10s
- Frontend: HTTP check every 30s

Check service health:
```bash
# Via SSH on production server
docker compose ps

# Check specific service
docker compose exec backend curl http://localhost:5095/graphql?sdl
```

## Troubleshooting

### Build Failures

**Backend build fails:**
- Check .NET SDK version compatibility
- Verify all project references are correct
- Review build logs in GitHub Actions

**Frontend build fails:**
- Ensure backend is running for schema generation
- Check Node.js version compatibility
- Verify all npm dependencies are available

### Deployment Failures

**Image pull fails:**
- Verify GHCR authentication on server
- Check image tags exist in registry
- Ensure server has network access to GHCR

**Services won't start:**
- Check `.env` file exists with correct values
- Verify port availability (5432, 5095, 80)
- Review docker compose logs: `docker compose logs -f`

**Health checks failing:**
- Wait for services to fully initialize
- Check service logs for errors
- Verify network connectivity between services

## Architecture Decisions

### Why GHCR?
- Native GitHub integration
- No additional credentials management
- Automatic cleanup of old images
- Free for public repositories

### Why Pre-build Images?
- Faster deployments (no build time on server)
- Consistent images across environments
- Reduced server resource usage
- Easy rollback to previous versions

### Why Multi-stage Builds?
- Smaller final images (runtime only, no build tools)
- Better security (fewer attack surfaces)
- Faster image pulls and container starts
