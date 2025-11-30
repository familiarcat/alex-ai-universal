#!/usr/bin/env bash
set -euo pipefail

BUCKET="cloudfront-logs-n8n-1762854141"
PREFIX="n8n-cloudfront-logs/"
REGION="us-east-1"
INTERVAL=${1:-60}
MAX_POLLS=${2:-30}

printf "📡 Polling CloudFront logs in s3://%s/%s (region %s)\n" "$BUCKET" "$PREFIX" "$REGION"
printf "   Interval: %ss, Max polls: %s\n" "$INTERVAL" "$MAX_POLLS"

for ((i=1; i<=MAX_POLLS; i++)); do
  printf "\n[%s/%s] %s Checking for new log objects...\n" "$i" "$MAX_POLLS" "$(date -u)"
  OUTPUT=$(aws s3 ls "s3://${BUCKET}/${PREFIX}" --region "$REGION" --recursive 2>&1 || true)
  if [[ -z "$OUTPUT" ]]; then
    echo "(no log files yet)"
  else
    echo "$OUTPUT" | sort -k1,1 -k2,2 | tail -n 10
  fi
  if [ "$i" -lt "$MAX_POLLS" ]; then
    sleep "$INTERVAL"
  fi
done

printf "\n✅ Polling complete.\n"
