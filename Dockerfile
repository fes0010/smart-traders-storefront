# Multi-stage build for production deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with timeout and retries
RUN npm config set fetch-retry-maxtimeout 60000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retries 3 && \
    npm ci --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]

