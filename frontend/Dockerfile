# Build stage
FROM node:24 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build for production
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine AS final

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built files to nginx
COPY --from=build /app/dist/frontend /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
