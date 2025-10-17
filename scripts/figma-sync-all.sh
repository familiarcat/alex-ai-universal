#!/usr/bin/env bash
set -euo pipefail

# Figma Sync All Themes
# - Requires FIGMA_TOKEN in env (preferably loaded from ~/.zshrc/Keychain)
# - Uses per-theme file keys: FIGMA_FILE_KEY_<THEME>, where <THEME> is UPPERCASE
#   and dashes replaced with underscores, e.g. FIGMA_FILE_KEY_GLASSMORPHISM
# - Example: FIGMA_FILE_KEY_GRADIENT, FIGMA_FILE_KEY_NEUMORPHISM, ...

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve FIGMA_TOKEN without sourcing zsh in bash
if [ -z "${FIGMA_TOKEN:-}" ]; then
  # Try macOS Keychain first
  if command -v security >/dev/null 2>&1; then
    FIGMA_TOKEN="$(security find-generic-password -a "$USER" -s ALEX_FIGMA_TOKEN -w 2>/dev/null || true)"
  fi
fi

# As a last resort, ask a zsh subshell to load ~/.zshrc and print the token
if [ -z "${FIGMA_TOKEN:-}" ] && command -v zsh >/dev/null 2>&1; then
  FIGMA_TOKEN="$(zsh -ic 'source ~/.zshrc >/dev/null 2>&1 || true; print -r -- "$FIGMA_TOKEN"' 2>/dev/null || true)"
fi

if [ -z "${FIGMA_TOKEN:-}" ]; then
  echo "ERROR: FIGMA_TOKEN is not available via env, Keychain, or zsh. Set Keychain item ALEX_FIGMA_TOKEN or export FIGMA_TOKEN." >&2
  exit 1
fi

# Themes to sync: CLI args override defaults
if [ "$#" -gt 0 ]; then
  THEMES=("$@")
else
  # Default to the themes we ship override scaffolds for
  THEMES=(gradient glassmorphism neumorphism material corporate)
fi

echo "🔄 Figma sync for themes: ${THEMES[*]}"

ok=0
skipped=0
failed=0

for theme in "${THEMES[@]}"; do
  # Build env var name: FIGMA_FILE_KEY_<THEME>
  upper="$(printf '%s' "$theme" | tr '[:lower:]' '[:upper:]')"
  upper="${upper//-/_}"
  var="FIGMA_FILE_KEY_${upper}"
  key="${!var-}"

  if [ -z "$key" ]; then
    echo "⚠️  Skip $theme (missing $var)"
    skipped=$((skipped+1))
    continue
  fi

  echo "➡️  Sync $theme using $var"
  pushd "$ROOT_DIR" >/dev/null
  if FIGMA_FILE_KEY="$key" node scripts/figma-token-sync.js "$theme"; then
    ok=$((ok+1))
  else
    echo "❌ Sync failed for $theme"
    failed=$((failed+1))
  fi
  popd >/dev/null
done

echo "\n✅ Done. Success: $ok, Skipped: $skipped, Failed: $failed"
exit 0


