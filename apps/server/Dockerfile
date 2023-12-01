FROM node:16-bullseye-slim

RUN apt-get update && apt-get install -y python3 build-essential

RUN npm install -g pnpm nodemon pm2 typescript

# Set the working directory
WORKDIR /diner-mono

COPY . .

RUN pnpm recursive install
RUN pnpm tsc -b

RUN ls -la

WORKDIR /diner-mono/apps/server
# Change to the server directory

EXPOSE 4000

# Use nodemon to run the server, watching the TypeScript files
CMD ["nodemon", "./dist/index.js"]
