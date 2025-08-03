# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema first
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies (this will run postinstall -> prisma generate)
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only required build artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Set environment
ENV NODE_ENV=production

# Expose application port (Railway will set PORT env var dynamically)
EXPOSE 3000

# Railway handles startup via railway.json startCommand
# No CMD needed here
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/main.js"]
