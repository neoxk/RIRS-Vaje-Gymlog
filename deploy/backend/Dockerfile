# Zapakira backend, ki ga je zgradil job build (src + produkcijski node_modules
# v arhivu node_modules.tar.gz). Odvisnosti se tu ne nameščajo ponovno.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN tar -xzf node_modules.tar.gz && rm node_modules.tar.gz
CMD ["node", "src/server.js"]
