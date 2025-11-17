# Multi-stage build for Backend

# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl curl

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Development dependencies stage
FROM base AS dev-dependencies
COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development
COPY --from=dev-dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3003
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY --from=dev-dependencies /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && \
    npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package*.json ./

USER node
EXPOSE 3003
CMD ["npm", "run", "start:prod"]
