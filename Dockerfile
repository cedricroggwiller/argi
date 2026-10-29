# syntax=docker/dockerfile:1

# ---- Build -------------------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
ENV CI=1 NEXT_TELEMETRY_DISABLED=1

# Erst nur die Manifeste: solange sich Abhaengigkeiten nicht aendern, bleibt diese
# Schicht im Build-Cache.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Laufzeit: Next "standalone" plus Migrationen ------------------------------
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/db ./db

USER node
EXPOSE 3000

# Fragt nur den Prozess ab, nicht die Datenbank. Fuer Uptime Kuma: /api/health?tief
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Migrationen und Erinnerungen starten im Prozess selbst (src/instrumentation.ts).
CMD ["node", "server.js"]
