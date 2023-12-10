# Use a multi-stage build to install dependencies and build the application
FROM node:18-bullseye-slim as builder

# Install global packages
RUN npm install -g pnpm

# Set the working directory
WORKDIR /diner-web

# Copy the application code
COPY ./apps/web/package.json package.json
# Install dependencies
RUN pnpm install

COPY apps/web/ ./

# Build the application
RUN export $(cat .runtime) && pnpm run build

# Start a new stage to create a lean production image
FROM node:18-bullseye-slim

# Set the working directory
WORKDIR /diner-web

# Copy only the built application and the node_modules from the previous stage
COPY --from=builder /diner-web/dist ./dist
COPY --from=builder /diner-web/node_modules ./node_modules

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=4321

# Expose the necessary port
EXPOSE 4321

# Run the app
CMD ["node", "./dist/server/entry.mjs"]