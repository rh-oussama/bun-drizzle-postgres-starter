FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run typecheck
RUN bun build src/index.ts --outdir dist --target bun --minify

# Production — alpine base with only the bundle
FROM oven/bun:1-alpine AS production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]
