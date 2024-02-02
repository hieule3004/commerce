FROM node:18-bullseye-slim

WORKDIR /api

COPY . .

RUN yarn install

ENTRYPOINT yarn start:dev