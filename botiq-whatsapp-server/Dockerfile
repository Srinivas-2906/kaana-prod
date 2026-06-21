FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget python3 make g++ \
  && wget -q https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.deb \
  && dpkg -i litestream-v0.3.13-linux-amd64.deb \
  && rm litestream-v0.3.13-linux-amd64.deb \
  && apt-get purge -y wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=3002
ENV DATABASE_PATH=/data/kaana.db

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3002) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]

FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates wget python3 make g++ \
  && wget -q https://github.com/benbjohnson/litestream/releases/download/v0.3.13/litestream-v0.3.13-linux-amd64.deb \
  && dpkg -i litestream-v0.3.13-linux-amd64.deb \
  && rm litestream-v0.3.13-linux-amd64.deb \
  && apt-get purge -y wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=3002
ENV DATABASE_PATH=/data/kaana.db

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3002) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["docker-entrypoint.sh"]
