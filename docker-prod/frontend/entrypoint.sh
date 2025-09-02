#!/usr/bin/env sh
set -e
# Injecte un env.js lisible par le front sans rebuild
cat > /usr/share/nginx/html/env.js <<EOF
window.__ENV__ = { API_URL: "${API_URL}" };
EOF
exec nginx -g 'daemon off;'
