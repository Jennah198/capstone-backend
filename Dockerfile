# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./

# Install dependencies (use npm install to avoid CI lockfile mismatch during build)
RUN npm install --omit=dev --no-audit --no-fund

# Copy application code from server directory
COPY server/ .

# Expose port (fly.io will set PORT env var)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
