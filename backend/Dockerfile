FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD curl -f http://localhost:3000/api/strategies || exit 1
CMD ["node", "dist/index.js"]
