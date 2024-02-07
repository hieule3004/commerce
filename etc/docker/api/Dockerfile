FROM node:18-bullseye-slim

WORKDIR /api

ADD package.json yarn.lock /api/
RUN yarn --pure-lockfile
ADD . /api

RUN mv -f ./etc/env/.env.docker ./etc/env/.env.local

ENTRYPOINT yarn start:dev
