FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000 SQLITE_PATH=/app/storage/healthbridge.sqlite
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force && mkdir storage && chown node:node storage
COPY --from=build /app/dist ./dist
COPY server.js ./
COPY lib ./lib
COPY data ./data
COPY js/guardrails.js ./js/guardrails.js
COPY scripts/database.js ./scripts/database.js
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
