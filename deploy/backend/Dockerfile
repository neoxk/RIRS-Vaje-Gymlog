# Zapakira backend, ki ga je zgradil job build (src + produkcijski node_modules).
# Odvisnosti se tu ne nameščajo ponovno.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY . .
CMD ["node", "src/server.js"]
