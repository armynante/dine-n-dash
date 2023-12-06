# Dockerfile
FROM node:18-bullseye-slim

RUN npm install -g pnpm

# Set working directory
WORKDIR /diner-mono

COPY ./apps/web ./

# install curl 

RUN pnpm install
# pass env variables to build
RUN export $(cat .env.runtime) && pnpm run build

ENV HOST=0.0.0.0
ENV PORT=4321

# Expose ports
EXPOSE 4321

# Run the app
CMD ["node", "./dist/server/entry.mjs"]




# # Stage 1 - the build process
# FROM node:18-alpine as build-deps
# RUN npm install -g pnpm 
# WORKDIR /diner-mono
# COPY apps/web/package.json ./
# RUN pnpm install
# COPY apps/web ./
# RUN pnpm run build

# # Stage 2 - the production environment
# FROM node:18-alpine
# WORKDIR /diner-mono
# COPY --from=build-deps /diner-mono/build ./build
# COPY apps/web/package.json ./
# RUN pnpm install
# ENV PORT 3000
# EXPOSE 3000
# EXPOSE 24678
# EXPOSE 5173
# COPY . .
# CMD [ "pnpm", "run", "dev" ]
