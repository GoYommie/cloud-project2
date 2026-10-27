
# Stage 1: Install application dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using the lockfile
RUN npm ci --omit=dev

# Stage 2: Create the runtime image
FROM node:22-alpine

WORKDIR /app

# Copy dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY server.js ./

# Run the application as a non-root user
USER node

# Application port
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]
