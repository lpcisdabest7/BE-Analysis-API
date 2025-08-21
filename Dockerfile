# Build stage
FROM node:20.18.3-slim AS development

WORKDIR /usr/src/app

# Copy package files
COPY package*.json yarn.lock ./

# Install system dependencies needed for building
RUN apt-get update && apt-get install -y \
    build-essential \
    libssl-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20.18.3-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Copy package files
COPY package*.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Copy public assets if they exist
COPY --from=development /usr/src/app/public ./public

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /usr/src/app
USER appuser

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Start the application
CMD ["node", "dist/main"]
