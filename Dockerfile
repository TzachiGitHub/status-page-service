FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/dashboard/package.json ./packages/dashboard/
COPY packages/public-page/package.json ./packages/public-page/
RUN npm ci

COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
RUN cd packages/shared && npm run build

COPY packages/server/ ./packages/server/
RUN cd packages/server && npx prisma generate && npm run build

COPY packages/dashboard/ ./packages/dashboard/
RUN cd packages/dashboard && npm run build

COPY packages/public-page/ ./packages/public-page/
RUN cd packages/public-page && npm run build

# Production-only install for server
RUN mkdir /prod && cp packages/server/package.json /prod/ && \
    cd /prod && npm install --omit=dev 2>/dev/null || true

FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app

# Copy server build
COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/package.json ./package.json

# Copy node_modules from root (has all workspace deps hoisted)
COPY --from=builder /app/node_modules ./node_modules

# Also copy shared build (server imports from it)
COPY --from=builder /app/packages/shared/dist ./node_modules/@status-page/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@status-page/shared/package.json

# Copy frontend builds
COPY --from=builder /app/packages/dashboard/dist ./public/dashboard
COPY --from=builder /app/packages/public-page/dist ./public/status-page

ENV NODE_ENV=production
EXPOSE 3030
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
