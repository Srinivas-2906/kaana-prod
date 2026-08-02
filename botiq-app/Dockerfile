FROM node:20-bookworm-slim

WORKDIR /app

# Install workspace dependencies
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --workspace server --workspace client

COPY client ./client
COPY server ./server

ARG VITE_WHATSAPP_API=/api
ARG VITE_PLATFORM_URL
ENV VITE_WHATSAPP_API=$VITE_WHATSAPP_API \
  VITE_PLATFORM_URL=$VITE_PLATFORM_URL

RUN npm run build -w client

ENV NODE_ENV=production
ENV PORT=3002
ENV SERVE_CLIENT=true

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3002) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server/src/index.js"]
