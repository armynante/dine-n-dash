FROM node:16-bullseye-slim

RUN apt-get update && apt-get install -y python3 build-essential

RUN npm install -g pnpm nodemon pm2 typescript

# Set the working directory
WORKDIR /diner-mono

# Copy pnpm workspace files
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY tsconfig.json .

# Copy the server app's package.json and the packages folder
COPY ./apps/controller/package.json ./apps/controller/
COPY ./packages ./packages

WORKDIR /diner-mono/apps/controller

RUN pnpm recursive install

RUN pnpm recursive exec -- tsc -b

# Change to the server directory

# Install dependencies
RUN pnpm i

# Copy the rest of the server app
COPY ./apps/controller .

EXPOSE 8080

# Use nodemon to run the server, watching the TypeScript files
CMD ["nodemon", "./dist/index.js"]
