#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1

ENV_FILE=".env.deploy"

if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "❌ Error: File $ENV_FILE tidak ditemukan di $PROJECT_ROOT!"
    exit 1
fi

SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

# 1. Build project
echo "🚀 Memulai proses build..."
npm run build || { echo "❌ Build gagal."; exit 1; }

# 2. Archive build output using tar
echo "📦 Membuat archive tar.gz..."
cd dist || exit
tar -czf ../deploy.tar.gz ./*
cd "$PROJECT_ROOT" || exit

# 3. Upload & Extract on cPanel
echo "📤 Mengunggah ke cPanel (${CPANEL_HOST})..."
scp -i "$SSH_KEY_PATH" -P ${SSH_PORT:-22} deploy.tar.gz ${CPANEL_USER}@${CPANEL_HOST}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
    echo "🔓 Ekstrak file di server..."
    ssh -i "$SSH_KEY_PATH" -p ${SSH_PORT:-22} ${CPANEL_USER}@${CPANEL_HOST} "cd ${REMOTE_PATH} && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
    echo "✅ Deployment selesai!"
else
    echo "❌ Upload gagal."
fi

# 4. Clean up local archive
rm -f deploy.tar.gz
echo "🧹 Pembersihan lokal selesai."