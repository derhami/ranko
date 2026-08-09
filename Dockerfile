# syntax=docker/dockerfile:1
FROM node:22-slim AS build

WORKDIR /app

# Install build tools needed for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts \
    && npm rebuild better-sqlite3

COPY . .
# Build the web renderer (no Electron needed — plain Vite)
RUN npx vite build -c vite.web.config.ts

# Production stage
FROM node:22-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV SEOMATOR_HOME=/data/seomator

RUN apt-get update && apt-get install -y --no-install-recommends \
    # better-sqlite3 prebuilt binaries are used, but keep build tools minimal fallback
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/server.ts ./server.ts
COPY --from=build /app/dist-electron/renderer ./dist-electron/renderer

# Persistent volume for SQLite data (~/.seomator)
VOLUME /data

EXPOSE 8080

# Run the Express server with tsx (TypeScript runtime)
CMD ["npx", "tsx", "server.ts"]
