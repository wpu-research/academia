FROM caddy:2.8-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY public /srv
# index.html artifact iskeletine göre yazıldı (doctype/viewport yok); sunucu sürümüne ekle.
RUN { printf '<!doctype html>\n<html lang="tr">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'; cat /srv/index.html; printf '\n</html>\n'; } > /tmp/index.html && mv /tmp/index.html /srv/index.html
