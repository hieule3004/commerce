#!/usr/bin/env bash

node -e "fetch('http://localhost:${PORT}/health').then((r) => console.log(Number(r.status !== 200)))"
