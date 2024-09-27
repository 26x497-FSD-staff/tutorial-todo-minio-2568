# Todo app with MinIO object storage

This **"Todo App"** project is developed using `Next.js`:

- `./components` : front-end components
- `./app` : RESTful API routes
- `./libs` : utilities libraries
- `./prisma` : Database schemas
- `./docker` : Docker related files

---

## 1. Install required packages

We start by installing all packages required by the project. This packages are listed in the `package.json` file.

```bash
npm install
```

## 2. Create backend services

For this demo app, we need a `PostgreSQL` database and a `MinIO` object storage. We can use `docker run` commands to create containers for each service.

### 2.1 Start a `Postgres` Database server container

We can create a database container using the following command. We will use this database server to store all users todo lists.

Before running this command, we need to create the `D:\postgres-data` directory to use as `bind-mount` volume to persistently store database files.

```bash
docker run -d --name postgresCont -p 5432:5432 -e POSTGRES_DB=mytodo -e POSTGRES_PASSWORD=12345678 -e PGDATA=/var/lib/postgresql/data/pgdata -v postgres-data:/var/lib/postgresql/data postgres
```

### 2.2 Start a MinIO object storage container

Now we can create an object storage container as well. The `Todo app` uses this object storage to store user uploaded files.

Before running this command, we need to create the `D:\minio-data` directory to use as `bind-mount` volume to persistently store minio data.

```bash
docker run -d -p 9000:9000 -p 9090:9090 --name minio -v D:\minio-data:/data -e "MINIO_ROOT_USER=root" -e "MINIO_ROOT_PASSWORD=12345678" quay.io/minio/minio server /data --console-address ":9090"
```

### 2.3 Using Docker-compose to start database and object sotrage services

Instead of running docker commands one-by-one to start each service separately, we can use `docker-compose` to manage everything.

To start all service containers at once, run the following command.

```bash
docker compose -f ./docker/docker-compose.yml up -d
```

To stop and remove all containers.

```bash
docker compose -f ./docker/docker-compose.yml down
```

To stop or start containers.

```bash
docker compose -f ./docker/docker-compose.yml stop
```

```bash
docker compose -f ./docker/docker-compose.yml start
```

## 3. Create database for Todo app 

Once having access to a database server, we need to use `prisma` to intialize database and tables in the database server.

```bash
npx prisma generate
```

We should get an output as similar as:

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma

✔ Generated Prisma Client (v5.2.0) to .\node_modules\@prisma\client in 121ms
Start using Prisma Client in Node.js (See: https://pris.ly/d/client)

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)

import { PrismaClient } from '@prisma/client/edge'
const prisma = new PrismaClient()

See other ways of importing Prisma Client: http://pris.ly/d/importing-client

```

Now we can initialize the database and tables using the following command.

```bash
npx prisma db push
```

We should get an output as similar as:

```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "mytodo" at "localhost:5432"

Your database is now in sync with your Prisma schema. Done in 390ms

✔ Generated Prisma Client (v5.2.0) to .\node_modules\@prisma\client in 110ms

```
## 4. Create a user for Todo app
After initialize the database, use a Postgres database client to log in as `postgres` user with the password `12345678`. We shoud see the `mytodo` database. Add a few users in the `User` table. We will use these users to test the "Todo App".

## 5. Basic MinIO object storage configuration

After starting the Minio container, use a web browser to open "http://localhost:9000"

- Log in to the management console using the username `root` and password `12345678`.
- Create a storage bucket with the name as specified in the `.env` file (`OBJ_BUCKET` variable).

## 6. Run the development server

After setup and configure all back-end services (Postgres database server and Minio object storage service), we can now start the development server.

One more step before starting the server is to configure some environment variables required by the app. Open the `.env` file and specify these variables:

- `DATABASE_URL`="postgresql://postgres:12345678@localhost:5432/mytodo"
- `JWT_SECRET`="PRISMA-MINIO-497"
- `OBJ_STORAGE_ENDPOINT`="localhost"
- `OBJ_STORAGE_PORT`="9000"
- `OBJ_ACCESS_KEY`="UVXO9PimYMnW4bQB886b"
- `OBJ_SECRET_KEY`="2ooqppyZRMMVgZopmgcMUk8wD9jeHenCyA0056QX"
- `OBJ_BUCKET`="todo-app"

After that we can start the `development` server.

```bash
npm run dev
```

## 7. Test the production server

To do this, we have to build a production server by running this command.

```bash
npm run build
```

If all is well, start the `production` server.

```bash
npm run start
```

---

## 8. Build a docker image from `Todo app` project

We need to create a `Dockerfile` at the root of project directory. We use multistages build.

```Dockerfile


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

```

To build a new image, run the following command.

```bash
docker build -t <dockerhub-username>/<docker-image-name>:<tag> .
```

For example.

```bash
docker build -t potikanond/todo-postgres-minio .
```

---

## 9. Create `Todo app` container

When using `docker run ...` command or using `docker-compose` configuration file to create a container of the app, it is necessary to also provide environment variables to the app.

These are the docker environment variables for `Todo app` container:

- `DATABASE_URL`="postgresql://postgres:12345678@localhost:5432/mytodo"
- `JWT_SECRET`="PRISMA-MINIO-497"
- `OBJ_STORAGE_ENDPOINT`="localhost"
- `OBJ_STORAGE_PORT`="9000"
- `OBJ_ACCESS_KEY`="UVXO9PimYMnW4bQB886b"
- `OBJ_SECRET_KEY`="2ooqppyZRMMVgZopmgcMUk8wD9jeHenCyA0056QX"
- `OBJ_BUCKET`="todo-app"

For example, if we have to create a `docker-compose` file for running the app.

```yaml
version: "3.1"

services:
  todolist:
    image: todo-postgres-minio
    restart: always
    ports:
      - 3000:3000
    environment:
      # - DATABASE_URL=postgresql://postgres:12345678@localhost:5432/mytodo
      - DATABASE_URL=postgresql://postgres:12345678@postgresdb:5432/mytodo
      - JWT_SECRET=PRISMA-MINIO-497
      - OBJ_STORAGE_ENDPOINT=nginx
      - OBJ_STORAGE_PORT=9000
      - OBJ_ACCESS_KEY=UVXO9PimYMnW4bQB886b
      - OBJ_SECRET_KEY=2ooqppyZRMMVgZopmgcMUk8wD9jeHenCyA0056QX
      - OBJ_BUCKET=todo-app
```
