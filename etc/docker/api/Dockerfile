FROM node:18-bullseye-slim

ARG DOTENV_CONFIG_PATH

WORKDIR /api

ADD package.json yarn.lock /api/
RUN yarn --pure-lockfile
ADD . /api

RUN mv -f ${DOTENV_CONFIG_PATH} ./etc/env/.env.local

ENTRYPOINT yarn start:dev
