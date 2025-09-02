#!/usr/bin/env bash
set -euo pipefail
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

echo "==> Updating packages & installing deps"
sudo apt update -y
sudo apt install -y curl unzip ca-certificates gnupg jq

if ! command -v node >/dev/null; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
sudo npm i -g pm2@latest
sudo apt install -y nginx

if [ ! -f ".env" ]; then
  echo "==> Creating .env"
  REGION_DEFAULT=$(curl -s --max-time 2 http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .region 2>/dev/null || echo "ap-south-1")
  read -rp "S3 bucket name: " S3B
  read -rp "S3 prefix [spotify/tracks/]: " S3P; S3P=${S3P:-spotify/tracks/}
  read -rp "CORS origins (comma sep) [http://localhost:5173]: " CORSO; CORSO=${CORSO:-http://localhost:5173}
  cat > .env <<EOF
PORT=4000
AWS_REGION=${REGION_DEFAULT}
S3_BUCKET=${S3B}
S3_PREFIX=${S3P}
CORS_ORIGINS=${CORSO}
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
EOF
fi

echo "==> Installing node modules"
npm ci || npm i

echo "==> Starting with PM2"
pm2 start src/index.js --name spotify-server
pm2 save
pm2 startup systemd -u $USER --hp $HOME | sudo bash

read -rp "Configure Nginx reverse proxy (y/N)? " ANS
if [[ "${ANS,,}" == "y" ]]; then
  read -rp "Domain (leave blank to use server IP): " DOMAIN
  SERVER_NAME="${DOMAIN:-_}"
  sudo tee /etc/nginx/sites-available/spotify >/dev/null <<'NGX'
server {
    listen 80;
    server_name SERVER_NAME_PLACEHOLDER;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGX
  sudo sed -i "s/SERVER_NAME_PLACEHOLDER/${SERVER_NAME}/g" /etc/nginx/sites-available/spotify
  sudo ln -sf /etc/nginx/sites-available/spotify /etc/nginx/sites-enabled/spotify
  sudo nginx -t && sudo systemctl reload nginx
  echo "Nginx ready. Try: http://${SERVER_NAME}/health"
fi
echo "==> Done! API: http://YOUR_EC2_IP:4000  (or your domain if Nginx configured)"
