FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

RUN npm ci

COPY app ./app

# Single build: tsc compiles backend+shared into dist/backend/, vite compiles frontend into dist/public/
RUN npm run build

# --- Production Image ---
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend
COPY --from=builder /app/dist/backend ./dist/backend
COPY --from=builder /app/dist/shared ./dist/shared

# Copy compiled frontend
COPY --from=builder /app/dist/public ./dist/public

# Copy SQL migrations (not compiled, read as raw files at runtime)
COPY --from=builder /app/app/backend/db/migrations ./dist/backend/db/migrations

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/backend/index.js"]
