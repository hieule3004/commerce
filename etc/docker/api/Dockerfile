FROM node:18-bullseye-slim as builder

WORKDIR /api

ADD package.json yarn.lock /api/
RUN yarn --pure-lockfile
ADD . /api

FROM builder

ARG ENV_PATH

ENTRYPOINT yarn start:dev
