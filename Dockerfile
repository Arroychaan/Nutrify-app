FROM node:20-alpine

# Prisma needs OpenSSL
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package & prisma first (for caching)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy all backend source
COPY backend/ ./

# Generate prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN npm prune --production

EXPOSE 3001

CMD ["npm", "start"]
