#!/usr/bin/env bash
set -euo pipefail

# Ensure a persistent FIGMA_WEBHOOK_SECRET exists
# - Prefers macOS Keychain item: ALEX_FIGMA_WEBHOOK_SECRET
# - Falls back to existing env var FIGMA_WEBHOOK_SECRET
# - Otherwise generates and stores a new 32-byte hex secret

if [[ "${OSTYPE:-}" != darwin* ]]; then
  echo "ERROR: This helper currently targets macOS (Keychain)." >&2
  exit 1
fi

ZSHRC="$HOME/.zshrc"
SERVICE_NAME="ALEX_FIGMA_WEBHOOK_SECRET"

have_security=false
if command -v security >/dev/null 2>&1; then
  have_security=true
fi

secret="${FIGMA_WEBHOOK_SECRET:-}"

# Try Keychain first if env not present
if [[ -z "$secret" && "$have_security" == true ]]; then
  secret="$(security find-generic-password -a "$USER" -s "$SERVICE_NAME" -w 2>/dev/null || true)"
fi

# Generate if still missing
if [[ -z "$secret" ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "ERROR: openssl not found; required to generate a secure secret." >&2
    exit 1
  fi
  secret="$(openssl rand -hex 32)"
  echo "Generated new FIGMA_WEBHOOK_SECRET." >&2
fi

# Persist to Keychain
if [[ "$have_security" == true ]]; then
  # Update or create Keychain item
  if security find-generic-password -a "$USER" -s "$SERVICE_NAME" >/dev/null 2>&1; then
    security add-generic-password -a "$USER" -s "$SERVICE_NAME" -w "$secret" -U >/dev/null
  else
    security add-generic-password -a "$USER" -s "$SERVICE_NAME" -w "$secret" -U >/dev/null
  fi
fi

# Ensure ~/.zshrc contains an export
if [[ -n "$ZSHRC" ]]; then
  if ! grep -q "^export FIGMA_WEBHOOK_SECRET=" "$ZSHRC" 2>/dev/null; then
    printf '\n# Figma webhook secret (synced with Keychain: %s)\nexport FIGMA_WEBHOOK_SECRET=%s\n' "$SERVICE_NAME" "$secret" >>"$ZSHRC"
  fi
fi

# Verify via a new login shell (non-interactive)
verified="$(zsh -ic 'source ~/.zshrc >/dev/null 2>&1 || true; print -r -- "$FIGMA_WEBHOOK_SECRET"' 2>/dev/null || true)"

if [[ -z "$verified" ]]; then
  echo "WARNING: Could not verify FIGMA_WEBHOOK_SECRET via zsh. Ensure your shell sources ~/.zshrc." >&2
else
  echo "FIGMA_WEBHOOK_SECRET is set." >&2
fi

# Output the secret on stdout only if explicitly requested
if [[ "${1:-}" == "--print" ]]; then
  printf '%s\n' "$secret"
else
  echo "Done. Secret stored in Keychain (service: $SERVICE_NAME) and exported in ~/.zshrc." >&2
fi


