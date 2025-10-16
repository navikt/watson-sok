FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package*.json ./

# Set up npm configuration once
RUN --mount=type=secret,id=NODE_AUTH_TOKEN sh -c \
    'npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN) && \
    npm config set @navikt:registry=https://npm.pkg.github.com && \
    npm ci'

FROM node:24-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:24-alpine
ARG INCLUDE_MOCKS=false
WORKDIR /app
COPY package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
RUN if [ "$INCLUDE_MOCKS" = "true" ]; then \
    cp -r /app/routes/oppslag/mocks ./app/routes/oppslag/mocks; \
    fi

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]

