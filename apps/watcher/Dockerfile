FROM node:18-bullseye-slim as builder

RUN apt-get update && apt-get install -y python3 build-essential

RUN npm install -g pnpm typescript

# Set the working directory
WORKDIR /diner-mono

COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY pnpm-lock.yaml ./pnpm-lock.yaml

COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json

COPY packages/resy/package.json ./packages/resy/package.json
COPY packages/resy/tsconfig.json ./packages/resy/tsconfig.json

COPY packages/utility/package.json ./packages/utility/package.json
COPY packages/utility/tsconfig.json ./packages/utility/tsconfig.json

COPY apps/cli/package.json ./apps/cli/package.json
COPY apps/cli/tsconfig.json ./apps/cli/tsconfig.json

COPY apps/watcher/package.json ./apps/watcher/package.json
COPY apps/watcher/tsconfig.json ./apps/watcher/tsconfig.json

COPY apps/controller/package.json ./apps/controller/package.json
COPY apps/controller/tsconfig.json ./apps/controller/tsconfig.json

COPY apps/web/package.json ./apps/web/package.json
COPY apps/web/tsconfig.json ./apps/web/tsconfig.json


COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.settings.json ./tsconfig.settings.json
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm recursive install

COPY /apps/server/src ./apps/server/src
COPY /packages/resy/src ./packages/resy/src
COPY /packages/utility/src ./packages/utility/src
COPY /apps/cli/src ./apps/cli/src
COPY /apps/watcher/src ./apps/watcher/src
COPY /apps/controller/src ./apps/controller/src
COPY /apps/web/src ./apps/web/src

RUN pnpm tsc -b

FROM node:18-bullseye-slim

RUN npm install -g pm2

COPY --from=builder /diner-mono/node_modules /diner-mono/node_modules
COPY --from=builder /diner-mono/package.json /diner-mono/package.json
COPY --from=builder /diner-mono/pnpm-lock.yaml /diner-mono/pnpm-lock.yaml
COPY --from=builder /diner-mono/pnpm-workspace.yaml /diner-mono/pnpm-workspace.yaml

COPY --from=builder /diner-mono/apps/watcher/dist /diner-mono/apps/watcher/dist
COPY --from=builder /diner-mono/apps/watcher/package.json /diner-mono/apps/watcher/package.json
COPY --from=builder /diner-mono/apps/watcher/node_modules /diner-mono/apps/watcher/node_modules/

COPY --from=builder /diner-mono/packages/resy/dist /diner-mono/packages/resy/dist
COPY --from=builder /diner-mono/packages/resy/package.json /diner-mono/packages/resy/package.json
COPY --from=builder /diner-mono/packages/resy/node_modules /diner-mono/packages/resy/node_modules/

COPY --from=builder /diner-mono/packages/utility/dist /diner-mono/packages/utility/dist
COPY --from=builder /diner-mono/packages/utility/package.json /diner-mono/packages/utility/package.json
COPY --from=builder /diner-mono/packages/utility/node_modules /diner-mono/packages/utility/node_modules/

WORKDIR /diner-mono/apps/watcher

EXPOSE 8080

# Use nodemon to run the server, watching the TypeScript files
CMD ["pm2", "start", "./dist/index.js", "--no-daemon"]