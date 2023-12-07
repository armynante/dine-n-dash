# Build stage
FROM node:16-bullseye-slim AS build

RUN npm install -g pnpm nodemon typescript

WORKDIR /diner-mono

COPY . .

RUN pnpm recursive install
RUN pnpm tsc -b

# Production stage
FROM node:16-bullseye-slim AS production

WORKDIR /diner-mono/apps/server

# Copy from build stage
COPY --from=build /diner-mono .

EXPOSE 4000

CMD ["nodemon", "./dist/index.js"]
