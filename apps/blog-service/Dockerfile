FROM docker.io/node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system blog && adduser --system -G blog blog

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=blog:blog . .

USER blog

EXPOSE 3000 50051

HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${HTTP_PORT:-3000}/health/live || exit 1

CMD ["node", "main.js"]