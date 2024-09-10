#!/bin/sh

if [ "$NODE_ENV" = "production" ]; then
  npm start
else
  npm run start:dev
fi
