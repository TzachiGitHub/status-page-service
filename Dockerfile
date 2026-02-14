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

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/prisma ./prisma
COPY --from=builder /app/packages/server/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/dashboard/dist ./public/dashboard
COPY --from=builder /app/packages/public-page/dist ./public/status-page

ENV NODE_ENV=production
EXPOSE 3030
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
