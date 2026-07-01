FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

RUN npm ci

COPY . .

RUN npm run build --workspace=shared
RUN npm run build --workspace=server

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/shared/node_modules ./shared/node_modules
COPY --from=builder /app/shared/package.json ./shared/

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "dist/index.js"]
