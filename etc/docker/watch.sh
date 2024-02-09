#!/usr/bin/env bash

project_root="."
docker compose -f "${project_root}/etc/docker/compose.yml" watch
