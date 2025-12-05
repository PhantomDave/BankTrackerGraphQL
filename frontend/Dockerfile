# Build stage
FROM oven/bun:1.1.13 AS build

WORKDIR /app

COPY package.json bun.lock ./

# Upgrade libstdc++6 to fix GLIBCXX_3.4.29 requirement for lmdb native bindings
# This upgrades the C++ standard library to support newer precompiled binaries
RUN echo "deb http://deb.debian.org/debian bookworm main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y -t bookworm libstdc++6 && \
    rm -rf /var/lib/apt/lists/*

RUN bun install --frozen-lockfile

COPY . .

# Generate GraphQL types from local schema file (downloaded before build)
# Set USE_LOCAL_SCHEMA=true to use the schema.graphql file instead of fetching from URL
ENV USE_LOCAL_SCHEMA=true
RUN if [ -f schema.graphql ]; then bun run codegen; else echo "Warning: schema.graphql not found, skipping codegen"; fi

# Build for production
RUN bun run build -- --configuration production

# Production stage
FROM nginx:alpine AS final

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built files to nginx
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
