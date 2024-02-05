#!/usr/bin/env bash

docker compose -f "$(wslpath -a ./etc/docker/compose.yml)" watch