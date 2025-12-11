FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy all source code including prisma
COPY . .

# Debug: List files to verify copy
RUN ls -la
RUN ls -la prisma/ || echo "Prisma folder not found"

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
