# Use Node.js 20 slim image
FROM node:20-slim AS base

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Configure pnpm to allow Prisma build scripts and install
RUN pnpm config set only-allow-trusted-dependencies false && \
    pnpm install

# Copy source and prisma schema
COPY . .

# Generate Prisma client 
# We provide a dummy DATABASE_URL because the prisma.config.ts requires it to be defined,
# even though 'generate' doesn't need a live connection.
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy pnpm exec prisma generate

# Expose the port the app runs on
EXPOSE 8000

# Default command (Development)
CMD ["pnpm", "dev"]
