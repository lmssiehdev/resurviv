# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

RUN npm install -g pnpm

# Set production environment
ENV NODE_ENV=production


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

# Install node modules
COPY --link package.json .
RUN npm install --production=false

# Copy application code
COPY --link . .

# Remove development dependencies
RUN pnpm prune --production

# Install node modules
RUN pnpm i

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app /app
WORKDIR /app/server/dist

# Start the server by default, this can be overwritten at runtime
CMD [ "pnpm", "run", "start" ]
