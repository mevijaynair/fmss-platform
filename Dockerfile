FROM node:22-alpine

WORKDIR /app

# Install dependencies for all apps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source files
COPY server.js .
COPY apps/main apps/main
COPY apps/quiz apps/quiz

# Expose port for main proxy
EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "server.js"]
