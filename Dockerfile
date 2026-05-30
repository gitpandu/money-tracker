FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.node.json ./
COPY tsconfig.app.json ./
COPY vite.config.ts ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY index.html ./
COPY tsconfig.json ./

# Build both client and server
RUN npm run build
RUN npm run server:build

# --- Production Image ---
FROM node:22-alpine

WORKDIR /app

# Copy package files and install only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/dist/server ./server
COPY --from=builder /app/server/db/migrations ./server/db/migrations
COPY --from=builder /app/dist ./server/public
# Remove the built server files from the public folder to avoid duplication/confusion
RUN rm -rf ./server/public/server

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server/index.js"]
