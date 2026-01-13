#!/bin/sh

cat <<EOF > /usr/share/nginx/html/config.js
window.__ENV__ = {
    KEYCLOAK_URL: "${KEYCLOAK_URL}",
    KEYCLOAK_REALM: "${KEYCLOAK_REALM}",
    KEYCLOAK_CLIENT_ID: "${KEYCLOAK_CLIENT_ID}",
    BACKEND_URL: "${BACKEND_URL}"
}
EOF

exec "$@"
