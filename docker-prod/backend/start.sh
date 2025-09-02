#!/usr/bin/env sh
set -e
umask 002

# --- JWT: matérialiser depuis secrets base64 si fournis ---
mkdir -p /var/www/html/config/jwt
if [ -n "${JWT_PRIVATE_KEY_B64:-}" ] && [ -n "${JWT_PUBLIC_KEY_B64:-}" ]; then
    echo "Materializing JWT keypair from base64 secrets..."
    echo "$JWT_PRIVATE_KEY_B64" | base64 -d > /var/www/html/config/jwt/private.pem
    echo "$JWT_PUBLIC_KEY_B64"  | base64 -d > /var/www/html/config/jwt/public.pem
    chmod 600 /var/www/html/config/jwt/*.pem 2>/dev/null || true
    chown -R www-data:www-data /var/www/html/config/jwt || true
fi

# --- Fallback: générer si manquants (utile en local si pas de secrets fournis) ---
if [ ! -f /var/www/html/config/jwt/private.pem ] || [ ! -f /var/www/html/config/jwt/public.pem ]; then
    echo "Generating JWT keypair (fallback)..."
    php /var/www/html/bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
    chmod 600 /var/www/html/config/jwt/*.pem 2>/dev/null || true
    chown -R www-data:www-data /var/www/html/config/jwt || true
fi


mkdir -p /var/www/html/var/cache /var/www/html/var/log
chown -R www-data:www-data /var/www/html/var || true

php-fpm -D
nginx -t        # vérif de conf => message clair si pb
exec nginx -g 'daemon off;'
