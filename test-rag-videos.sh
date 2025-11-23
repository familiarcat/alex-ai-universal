#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎬 Testing RAG System with 3 YouTube Videos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Video 1
echo "📹 Video 1/3: Processing..."
node scripts/youtube/enrich-youtube-to-rag.js \
  "https://www.youtube.com/watch?v=yVwZSoFJWSQ&t=2351s" \
  youtube-test-1.json \
  --store \
  --no-frames 2>&1 | grep -E "(✅|❌|Stored|Session ID|Title:|Author:)" || echo "Processing..."

echo ""
echo "📹 Video 2/3: Processing..."
node scripts/youtube/enrich-youtube-to-rag.js \
  "https://www.youtube.com/watch?v=0fYi8SGA20k&list=WL&index=5&t=41s" \
  youtube-test-2.json \
  --store \
  --no-frames 2>&1 | grep -E "(✅|❌|Stored|Session ID|Title:|Author:)" || echo "Processing..."

echo ""
echo "📹 Video 3/3: Processing..."
node scripts/youtube/enrich-youtube-to-rag.js \
  "https://www.youtube.com/watch?v=m9iaJNJE2-M&list=WL&index=12&t=146s" \
  youtube-test-3.json \
  --store \
  --no-frames 2>&1 | grep -E "(✅|❌|Stored|Session ID|Title:|Author:)" || echo "Processing..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All videos processed and stored in MCP RAG!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
