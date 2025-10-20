#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/configure-figma-env.sh \
#     --token <FIGMA_TOKEN> \
#     --file-master <FIGMA_FILE_KEY_MASTER> \
#     --webhook-base <WEBHOOK_BASE_URL> \
#     [--theme gradient=<KEY>] [--theme material=<KEY>] ...
#
# Persists to macOS Keychain (where applicable) and ~/.zshrc exports.

if [[ "${OSTYPE:-}" != darwin* ]]; then
  echo "ERROR: This configurator targets macOS (Keychain)." >&2
  exit 1
fi

ZSHRC="$HOME/.zshrc"

TOKEN=""
MASTER_KEY=""
WEBHOOK_BASE=""
THEME_KEYS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --token) TOKEN="$2"; shift 2;;
    --file-master) MASTER_KEY="$2"; shift 2;;
    --webhook-base) WEBHOOK_BASE="$2"; shift 2;;
    --theme) THEME_KEYS+=("$2"); shift 2;;
    *) echo "Unknown arg: $1" >&2; exit 1;;
  esac
done

if [[ -z "$TOKEN" || -z "$MASTER_KEY" || -z "$WEBHOOK_BASE" ]]; then
  echo "Missing required args. See script header for usage." >&2
  exit 1
fi

# Store token in Keychain (ALEX_FIGMA_TOKEN) and ~/.zshrc
if command -v security >/dev/null 2>&1; then
  security add-generic-password -a "$USER" -s ALEX_FIGMA_TOKEN -w "$TOKEN" -U >/dev/null
fi
grep -q '^export FIGMA_TOKEN=' "$ZSHRC" 2>/dev/null || echo "export FIGMA_TOKEN=\"$TOKEN\"" >>"$ZSHRC"

# Webhook base URL
grep -q '^export WEBHOOK_BASE_URL=' "$ZSHRC" 2>/dev/null || echo "export WEBHOOK_BASE_URL=\"$WEBHOOK_BASE\"" >>"$ZSHRC"

# Master file key
grep -q '^export FIGMA_FILE_KEY_MASTER=' "$ZSHRC" 2>/dev/null || echo "export FIGMA_FILE_KEY_MASTER=\"$MASTER_KEY\"" >>"$ZSHRC"

# Theme-specific file keys
for pair in "${THEME_KEYS[@]:-}"; do
  theme="${pair%%=*}"
  key="${pair#*=}"
  upper=$(printf '%s' "$theme" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
  var="FIGMA_FILE_KEY_${upper}"
  if ! grep -q "^export ${var}=" "$ZSHRC" 2>/dev/null; then
    echo "export ${var}=\"$key\"" >>"$ZSHRC"
  fi
done

echo "Config saved to ~/.zshrc. Open a new shell or run: source ~/.zshrc"


