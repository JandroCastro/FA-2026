#!/usr/bin/env bash
# ─────────────────────────────────
# Edita los tres valores de abajo
# y ejecuta: bash setup-git.sh
# ─────────────────────────────────

GIT_NAME="JandroCastro"
GIT_EMAIL="jandroportonovo@hotmail.com"
REPO_URL="https://github.com/JandroCastro/FA-2026.git"

# ─────────────────────────────────

[ ! -d ".git" ] && git init

git config --local user.name  "$GIT_NAME"
git config --local user.email "$GIT_EMAIL"

if git remote | grep -q "^origin$"; then
git remote set-url origin "$REPO_URL"
else
git remote add origin "$REPO_URL"
fi

echo ""
echo "✅ Configuración local aplicada:"
git config --local --list | grep -E "user\.|remote\."
echo ""
echo "📌 Guardado en .git/config — nunca se sube al repo"