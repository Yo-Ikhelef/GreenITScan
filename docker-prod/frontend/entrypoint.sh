#!/usr/bin/env sh
set -e

# Injecte l'API_URL à runtime (modifiable via env)
: "${API_URL:=/api}"
cat >/usr/share/nginx/html/env.js <<EOF
window.__ENV__ = { API_URL: "${API_URL}" };
EOF

nginx -g 'daemon off;'
