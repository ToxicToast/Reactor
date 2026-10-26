FROM docker.io/node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system security && adduser --system -G security security

COPY package.json package-lock.json ./
COPY workspace_modules ./workspace_modules
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --chown=security:security . .

USER security

EXPOSE 3000 50052

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${HTTP_PORT:-3000}/health/live || exit 1

CMD ["node", "main.js"]