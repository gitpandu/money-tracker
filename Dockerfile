FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

RUN npm ci

COPY client ./client
COPY server ./server
COPY shared ./shared

# Single build: tsc compiles server+shared into dist/server/, vite compiles client into dist/public/
RUN npm run build

# --- Production Image ---
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled server
COPY --from=builder /app/dist/server ./dist/server
COPY --from=builder /app/dist/shared ./dist/shared
# Copy compiled frontend
COPY --from=builder /app/dist/public ./dist/public
# Copy SQL migrations (not compiled, read as raw files at runtime)
COPY --from=builder /app/server/db/migrations ./server/db/migrations

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server/index.js"]
