FROM node:16-bullseye-slim

RUN apt-get update && apt-get install -y python3 build-essential

RUN npm install -g pnpm typescript

# Set the working directory
WORKDIR /diner-mono


# Copy pnpm workspace files
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .

# Copy the server app's package.json and the packages folder
COPY ./apps/worker/package.json ./apps/worker/
COPY ./packages ./packages

# Change to the server directory
WORKDIR /diner-mono/apps/worker

RUN rm -rf ./apps/worker/node_modules ./apps/worker/dist

RUN pnpm recursive install

RUN pnpm recursive exec -- tsc -b

# Copy the rest of the server app
COPY ./apps/worker .

# Use nodemon to run the server, watching the TypeScript files
CMD ["node", "./dist/index.js"]
