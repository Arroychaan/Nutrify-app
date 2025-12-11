FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package files and prisma schema (needed for postinstall)
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (skip postinstall script)
RUN npm ci --ignore-scripts

# Copy all source code
COPY . .

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
