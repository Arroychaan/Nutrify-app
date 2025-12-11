FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy backend package files and prisma schema first
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install ALL dependencies (skip postinstall to avoid prisma generate error)
RUN npm ci --ignore-scripts

# Copy all backend source code
COPY backend/ ./

# Generate Prisma client manually
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
