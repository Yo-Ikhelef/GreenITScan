#!/usr/bin/env sh
set -e

# --- Déterminer l'utilisateur FPM (ex: www-data) ---
FPM_USER="$(awk -F= '/^\s*user\s*=/ {gsub(/ /,"",$2);print $2}' /usr/local/etc/php-fpm.d/www.conf 2>/dev/null || echo www-data)"

umask 002
mkdir -p /var/www/html/var/cache /var/www/html/var/log /var/www/html/config/jwt

# --- JWT: matérialiser depuis secrets base64 si fournis (recommandé en prod) ---
if [ -n "${JWT_PRIVATE_KEY_B64:-}" ] && [ -n "${JWT_PUBLIC_KEY_B64:-}" ]; then
  echo "Materializing JWT keypair from base64 secrets..."
  echo "$JWT_PRIVATE_KEY_B64" | base64 -d > /var/www/html/config/jwt/private.pem
  echo "$JWT_PUBLIC_KEY_B64"  | base64 -d > /var/www/html/config/jwt/public.pem
  chmod 600 /var/www/html/config/jwt/*.pem 2>/dev/null || true
  chown -R "$FPM_USER:$FPM_USER" /var/www/html/config/jwt || true
fi

# --- Fallback local: générer si manquants (déconseillé en prod) ---
if [ ! -f /var/www/html/config/jwt/private.pem ] || [ ! -f /var/www/html/config/jwt/public.pem ]; then
  echo "Generating JWT keypair (fallback)..."
  # nécessite JWT_PASSPHRASE dans l'env Symfony
  php /var/www/html/bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction || true
  chmod 600 /var/www/html/config/jwt/*.pem 2>/dev/null || true
  chown -R "$FPM_USER:$FPM_USER" /var/www/html/config/jwt || true
fi

# --- Droits symfony/var + warmup du cache en FPM_USER ---
chown -R "$FPM_USER:$FPM_USER" /var/www/html/var
find /var/www/html/var -type d -exec chmod 0775 {} \;
find /var/www/html/var -type f -exec chmod 0664 {} \;

# --- DEBUG ENV (temporaire) ---
if [ "${DEBUG_ENV:-0}" = "1" ]; then
  echo "[debug] Checking env (masked)"
  if [ -n "${DATABASE_URL:-}" ]; then
    MASKED_DB="$(printf '%s' "$DATABASE_URL" | sed -E 's#(://[^:]+):[^@]+@#\1:***@#')"
    echo "[debug] DATABASE_URL=$MASKED_DB"
  else
    echo "[debug] DATABASE_URL=(empty)"
  fi
  for k in APP_SECRET JWT_PRIVATE_KEY_B64 JWT_PUBLIC_KEY_B64 JWT_PASSPHRASE; do
    eval 'v=${'"$k"':-}'
    if [ -n "$v" ]; then
      echo "[debug] $k=SET(len=${#v})"
    else
      echo "[debug] $k=(empty)"
    fi
  done

  echo "[debug] Env inside FPM user"
  su-exec "$FPM_USER" sh -lc '
    if [ -n "${DATABASE_URL:-}" ]; then
      MASKED_DB=$(printf "%s" "$DATABASE_URL" | sed -E "s#(://[^:]+):[^@]+@#\1:***@#")
      echo "[debug-su] DATABASE_URL=$MASKED_DB"
    else
      echo "[debug-su] DATABASE_URL=(empty)"
    fi
    for k in APP_SECRET JWT_PRIVATE_KEY_B64 JWT_PUBLIC_KEY_B64 JWT_PASSPHRASE; do
      eval "v=\${$k:-}"
      if [ -n "$v" ]; then
        echo "[debug-su] $k=SET(len=\${#v})"
      else
        echo "[debug-su] $k=(empty)"
      fi
    done
  '
fi


# (Important) warmup en tant que FPM_USER pour éviter tout "root-owned"
su-exec "$FPM_USER" sh -lc 'php -d opcache.enable=0 bin/console cache:clear --no-warmup --env=prod && php -d opcache.enable=0 bin/console cache:warmup --env=prod'

# --- Démarrage des services ---
php-fpm -D
nginx -t
exec nginx -g 'daemon off;'
