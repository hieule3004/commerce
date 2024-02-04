FROM node:18-bullseye-slim

WORKDIR /api

COPY . .

RUN mv -f ./etc/env/.env.docker ./etc/env/.env.local

RUN yarn install

ENTRYPOINT yarn start:dev