# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /diner-mono

# Copy only the package files and install dependencies
COPY ./apps/web/package*.json ./
RUN npm install

# Debugging: list directory contents
RUN ls -al

# Copy the rest of the app
COPY ./apps/web ./

# Set Environment variable
ENV PORT 3000

# Expose ports
EXPOSE 3000 24678 5173

# Run the app
CMD [ "npm", "run", "dev", "--", "--host" ]




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
