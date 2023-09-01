FROM node:16-bullseye-slim
RUN apt-get update && apt-get install -y python3 build-essential

# Install pnpm and nodemon
RUN npm install -g pnpm nodemon typescript

# Set the working directory
WORKDIR /diner-mono

# Copy pnpm workspace files
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .
COPY tsconfig.json .

# Copy the server app's package.json and the packages folder
COPY ./apps/server/package.json ./apps/server/
COPY ./packages ./packages

# Change to the server directory
WORKDIR /diner-mono/apps/server

RUN pnpm recursive install

RUN tsc

# Copy the rest of the server app
COPY ./apps/server .

# Use nodemon to run the server, watching the TypeScript files
CMD ["nodemon", "./dist/index.js", "--watch", "./dist", "--watch", "../../packages"]
