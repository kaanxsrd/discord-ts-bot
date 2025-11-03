# Builder stage installs dependencies once so they can be reused by the final image.
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Runtime stage contains the application source and production dependencies.
FROM oven/bun:1 AS runtime
WORKDIR /app

# Copy dependency artifacts first to leverage cached layers.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lock ./bun.lock

# Bring in the rest of the source code, including TypeScript files.
COPY . .

# Default command launches the Discord bot in production mode.
CMD ["bun", "run", "start"]
