
# Build stage
FROM node:18-alpine as BUILD_IMAGE

WORKDIR /app
COPY package*.json ./

# install dependencies
RUN npm ci
COPY . .

# generate Prisma client from schema
RUN npx prisma generate

# some environment variable are required during build
ENV OBJ_STORAGE_ENDPOINT=localhost
ENV OBJ_STORAGE_PORT=9000

# build
RUN npm run build

# remove dev dependencies
RUN npm prune --production


# Production stage
FROM node:18-alpine AS PRODUCTION_STAGE
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# copy from build image
# COPY .env ./
COPY --from=BUILD_IMAGE /app/package*.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]