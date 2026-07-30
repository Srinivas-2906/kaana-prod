#!/bin/sh
set -e
ORIGIN="${TRACKER_API_ORIGIN:-http://127.0.0.1:3011}"
ORIGIN="${ORIGIN%/}"
sed "s|__TRACKER_API_ORIGIN__|${ORIGIN}|g" /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
