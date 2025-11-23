# 🎥 YouTube Tools

Scripts for enriching YouTube videos and extracting content for RAG ingestion.

## Scripts

- `enrich-youtube-to-rag.js` - Main enrichment script (metadata, transcript, comments, frames)
- `youtube-capture-frames.sh` - Frame extraction using yt-dlp and ffmpeg

## Usage

```bash
# Enrich a YouTube video
node scripts/youtube/enrich-youtube-to-rag.js <youtube_url> [output_json] [--store]

# With frame capture
node scripts/youtube/enrich-youtube-to-rag.js <youtube_url> output.json --store --frames=10

# Capture frames only
bash scripts/youtube/youtube-capture-frames.sh <youtube_url> [num_frames]
```

## Features

- Metadata extraction (title, author, description, thumbnail)
- Transcript extraction (auto with language fallbacks)
- Comments extraction (Puppeteer, configurable count)
- Frame capture (optional, via youtube-capture-frames.sh)
- Direct MCP RAG storage (--store flag)

## Integration

Used by:
- `dashboard/app/api/ingest/youtube/route.ts` - Single video API
- `dashboard/app/api/ingest/youtube/batch/route.ts` - Batch processing API
- `scripts/crew/coordination/crew-youtube-analysis-to-rag.js` - Crew analysis

## Documentation

See `docs/youtube/YOUTUBE_VIDEO_INTERPRETATION_CAPABILITIES.md` for complete documentation.

