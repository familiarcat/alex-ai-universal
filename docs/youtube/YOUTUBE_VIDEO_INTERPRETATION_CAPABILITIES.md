# 🎥 YouTube Video Interpretation Capabilities

**Date:** January 21, 2025  
**Status:** ✅ Operational  
**System:** Alex AI YouTube Processing Tools

---

## 🎯 Overview

Alex AI has a comprehensive suite of tools for interpreting and processing YouTube videos. These tools extract metadata, transcripts, comments, and visual frames, then enrich the content for RAG (Retrieval-Augmented Generation) storage.

---

## 🛠️ Available Tools

### 1. **Main Enrichment Script** (`scripts/enrich-youtube-to-rag.js`)

**Purpose:** Primary tool for enriching YouTube videos into RAG-ready payloads

**Capabilities:**
- ✅ **Video Metadata Extraction**
  - Title, author, thumbnail
  - Video description
  - OEmbed data

- ✅ **Transcript Extraction**
  - Automatic transcript fetching
  - Multiple language fallbacks (en, en-US, en-GB)
  - Timestamped transcript data

- ✅ **Comments Extraction**
  - Top comments via Puppeteer
  - Configurable comment count (default: 20)
  - Comment text and metadata

- ✅ **Frame Capture** (Optional)
  - Visual frame extraction
  - Configurable frame count (default: 8)
  - Evenly spaced frames throughout video
  - Saves to `captures/<videoId>/frame-XXXX.jpg`

**Usage:**
```bash
# Basic usage
node scripts/enrich-youtube-to-rag.js <youtube_url> [output_json]

# With frame capture (8 frames)
node scripts/enrich-youtube-to-rag.js <youtube_url> output.json --frames=8

# Without frames
node scripts/enrich-youtube-to-rag.js <youtube_url> output.json --no-frames
```

**Output Format:**
- Creates JSON payload with multiple document types:
  - Video metadata document
  - Transcript document (if available)
  - Comments document (if available)
  - Frame documents (if frames captured)

**Example Output:**
```json
{
  "documents": [
    {
      "doc_type": "video",
      "title": "Video Title",
      "summary": "Video description...",
      "content": "Title: ...\nAuthor: ...\nDescription: ...",
      "keywords": ["youtube", "ai", "agentic", "best-practices"],
      "source_type": "youtube",
      "source_url": "https://youtube.com/...",
      "is_current": true
    },
    {
      "doc_type": "transcript",
      "title": "Transcript: Video Title",
      "content": "Full transcript text...",
      "keywords": ["youtube", "transcript", "ai", "agentic"]
    }
  ]
}
```

---

### 2. **Frame Capture Script** (`scripts/youtube-capture-frames.sh`)

**Purpose:** Extract visual frames from YouTube videos

**Capabilities:**
- ✅ Downloads video using `yt-dlp`
- ✅ Extracts evenly spaced frames using `ffmpeg`
- ✅ Saves frames as JPG images
- ✅ Configurable frame count

**Requirements:**
- `yt-dlp` (brew install yt-dlp)
- `ffmpeg` (brew install ffmpeg)
- `ffprobe` (included with ffmpeg)

**Usage:**
```bash
scripts/youtube-capture-frames.sh <youtube_url> [num_frames]
# Default: 8 frames
```

**Output:**
- Frames saved to: `captures/<videoId>/frame-XXXX.jpg`
- Frame count reported

**Technical Details:**
- Downloads best quality MP4 available
- Probes video duration automatically
- Calculates frame interval based on duration
- Extracts frames evenly throughout video

---

### 3. **API Endpoint - Single Video** (`dashboard/app/api/ingest/youtube/route.ts`)

**Purpose:** REST API endpoint for ingesting single YouTube video

**Capabilities:**
- ✅ Accepts YouTube URL via POST
- ✅ Optional frame count parameter
- ✅ Enriches video via `enrich-youtube-to-rag.js`
- ✅ Ingests to RAG via n8n CLI tools
- ✅ Returns success/failure status

**Endpoint:** `POST /api/ingest/youtube`

**Authentication:** Requires `x-crew-key` header or `Authorization: Bearer <key>`

**Request Body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "frames": 8  // Optional, default: undefined
}
```

**Response:**
```json
{
  "ok": true,
  "payload": "youtube-rag-payload.json"
}
```

**Error Responses:**
- `401` - Unauthorized
- `400` - Invalid URL or not YouTube
- `500` - Enrichment failed
- `502` - Ingestion failed

---

### 4. **API Endpoint - Batch Processing** (`dashboard/app/api/ingest/youtube/batch/route.ts`)

**Purpose:** REST API endpoint for ingesting multiple YouTube videos

**Capabilities:**
- ✅ Accepts multiple YouTube URLs
- ✅ Extracts URLs from text (auto-detection)
- ✅ Processes videos sequentially
- ✅ Returns per-video results
- ✅ Configurable frame count for all videos

**Endpoint:** `POST /api/ingest/youtube/batch`

**Authentication:** Requires `x-crew-key` header or `Authorization: Bearer <key>`

**Request Body:**
```json
{
  "urls": [
    "https://youtube.com/watch?v=...",
    "https://youtube.com/watch?v=..."
  ],
  "text": "Check out these videos: https://youtube.com/...",  // Optional - auto-extracts URLs
  "frames": 2  // Optional, default: 2
}
```

**Response:**
```json
{
  "ok": true,
  "processed": 2,
  "succeeded": 2,
  "results": [
    { "url": "...", "ok": true },
    { "url": "...", "ok": true }
  ]
}
```

**URL Auto-Detection:**
- Extracts YouTube URLs from text automatically
- Supports both `youtube.com` and `youtu.be` formats
- Filters to only YouTube URLs

---

### 5. **Auto Ingest Script** (Archived) (`scripts/archived/automation/auto-youtube-ingest.js`)

**Purpose:** Legacy script for batch YouTube ingestion

**Status:** Archived (use batch API endpoint instead)

**Capabilities:**
- Processes multiple YouTube URLs
- Enriches each to separate JSON files
- Merges all documents into single payload
- Ingests via n8n CLI tools

---

## 📊 Data Extraction Capabilities

### Metadata Extraction

**Sources:**
1. **OEmbed API** - Title, author, thumbnail
2. **YouTube Watch Page** - Full description
3. **Video ID** - Extracted from URL

**Extracted Fields:**
- Title
- Author/Channel name
- Thumbnail URL
- Full description
- Video URL
- Video ID

---

### Transcript Extraction

**Method:** YouTube API timedtext endpoint

**Language Fallbacks:**
1. English (`en`)
2. US English (`en-US`)
3. UK English (`en-GB`)

**Output:**
- Full transcript text
- Timestamped segments (if available)
- Separate document for RAG storage

**Use Cases:**
- Content analysis
- Keyword extraction
- Topic modeling
- Search indexing

---

### Comments Extraction

**Method:** Puppeteer web scraping

**Capabilities:**
- Extracts top comments
- Configurable count (default: 20)
- Comment text and metadata
- Handles dynamic loading

**Technical Details:**
- Uses headless browser
- Waits for comments to load
- Scrolls to load more comments
- Extracts comment text

**Use Cases:**
- Sentiment analysis
- Community insights
- Engagement metrics
- Content validation

---

### Frame Capture

**Method:** `yt-dlp` + `ffmpeg`

**Capabilities:**
- Downloads video (best quality MP4)
- Extracts evenly spaced frames
- Configurable frame count
- Saves as JPG images

**Frame Distribution:**
- Evenly spaced throughout video
- Interval calculated from duration
- Minimum 1 second interval

**Output Location:**
- `captures/<videoId>/frame-XXXX.jpg`
- Frame count reported

**Use Cases:**
- Visual content analysis
- Scene detection
- Thumbnail generation
- Visual context for RAG

---

## 🔄 Processing Workflow

### Standard Workflow

```
YouTube URL
    ↓
1. Extract Video ID
    ↓
2. Fetch Metadata (OEmbed + Watch Page)
    ↓
3. Fetch Transcript (with fallbacks)
    ↓
4. Extract Comments (Puppeteer)
    ↓
5. Capture Frames (Optional - yt-dlp + ffmpeg)
    ↓
6. Create RAG Payload (JSON)
    ↓
7. Ingest to RAG (via MCP or n8n)
```

### Batch Workflow

```
Multiple URLs or Text with URLs
    ↓
Extract All YouTube URLs
    ↓
For Each URL:
    ↓
    Process (enrich + ingest)
    ↓
Collect Results
    ↓
Return Summary
```

---

## 📁 Output Structure

### RAG Payload Structure

```json
{
  "documents": [
    {
      "doc_type": "video",
      "audience": "all",
      "category": "ai-best-practices",
      "title": "Video Title",
      "summary": "Short description...",
      "content": "Full metadata and description...",
      "keywords": ["youtube", "ai", "agentic", "best-practices"],
      "source_type": "youtube",
      "source_url": "https://youtube.com/...",
      "is_current": true
    },
    {
      "doc_type": "transcript",
      "title": "Transcript: Video Title",
      "content": "Full transcript text...",
      "keywords": ["youtube", "transcript", "ai", "agentic"],
      "source_type": "youtube",
      "source_url": "https://youtube.com/..."
    },
    {
      "doc_type": "comments",
      "title": "Comments: Video Title",
      "content": "Top comments text...",
      "keywords": ["youtube", "comments", "ai", "agentic"],
      "source_type": "youtube",
      "source_url": "https://youtube.com/..."
    },
    {
      "doc_type": "frames",
      "title": "Frame X: Video Title",
      "content": "Frame description...",
      "frame_path": "captures/videoId/frame-XXXX.jpg",
      "keywords": ["youtube", "frames", "screenshots", "context"],
      "source_type": "youtube",
      "source_url": "https://youtube.com/..."
    }
  ]
}
```

---

## 🚀 Usage Examples

### Command Line - Single Video

```bash
# Basic enrichment
node scripts/enrich-youtube-to-rag.js https://youtube.com/watch?v=VIDEO_ID

# With custom output and frames
node scripts/enrich-youtube-to-rag.js https://youtube.com/watch?v=VIDEO_ID output.json --frames=10

# Without frames
node scripts/enrich-youtube-to-rag.js https://youtube.com/watch?v=VIDEO_ID output.json --no-frames
```

### Command Line - Frame Capture Only

```bash
# Extract 8 frames (default)
scripts/youtube-capture-frames.sh https://youtube.com/watch?v=VIDEO_ID

# Extract 20 frames
scripts/youtube-capture-frames.sh https://youtube.com/watch?v=VIDEO_ID 20
```

### API - Single Video

```bash
curl -X POST https://mcp.pbradygeorgen.com/api/ingest/youtube \
  -H "x-crew-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=VIDEO_ID",
    "frames": 8
  }'
```

### API - Batch Processing

```bash
curl -X POST https://mcp.pbradygeorgen.com/api/ingest/youtube/batch \
  -H "x-crew-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://youtube.com/watch?v=VIDEO_ID_1",
      "https://youtube.com/watch?v=VIDEO_ID_2"
    ],
    "frames": 2
  }'
```

### API - Auto-Detect URLs from Text

```bash
curl -X POST https://mcp.pbradygeorgen.com/api/ingest/youtube/batch \
  -H "x-crew-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Check out these videos: https://youtube.com/watch?v=VIDEO_ID_1 and https://youtu.be/VIDEO_ID_2",
    "frames": 2
  }'
```

---

## 🔧 Technical Requirements

### Dependencies

**Node.js Scripts:**
- `puppeteer` - For comments extraction
- `https` - For API requests
- `fs`, `path` - File operations

**Shell Scripts:**
- `yt-dlp` - Video download
- `ffmpeg` - Video processing
- `ffprobe` - Video metadata

**Installation:**
```bash
# Install Node.js dependencies (if needed)
npm install puppeteer

# Install shell tools
brew install yt-dlp ffmpeg
```

---

## 📈 Current Capabilities Summary

| Feature | Status | Tool | Notes |
|---------|--------|------|-------|
| **Metadata Extraction** | ✅ | `enrich-youtube-to-rag.js` | Title, author, description, thumbnail |
| **Transcript Extraction** | ✅ | `enrich-youtube-to-rag.js` | Auto-fetch with language fallbacks |
| **Comments Extraction** | ✅ | `enrich-youtube-to-rag.js` | Puppeteer-based, configurable count |
| **Frame Capture** | ✅ | `youtube-capture-frames.sh` | yt-dlp + ffmpeg, configurable count |
| **Single Video API** | ✅ | `/api/ingest/youtube` | REST endpoint with authentication |
| **Batch Processing API** | ✅ | `/api/ingest/youtube/batch` | Multiple URLs, auto-detection |
| **RAG Integration** | ✅ | MCP Memory Storage | Direct Supabase integration |
| **URL Auto-Detection** | ✅ | Batch API | Extracts URLs from text |

---

## 🎯 Use Cases

### 1. Content Research
- Extract transcripts for analysis
- Capture key frames for visual context
- Gather community insights via comments

### 2. Knowledge Base Building
- Ingest educational videos to RAG
- Build searchable video content library
- Create multi-modal knowledge base

### 3. Content Analysis
- Analyze video topics and themes
- Extract key points and timestamps
- Understand audience engagement

### 4. Automated Learning
- Process tutorial videos
- Extract actionable insights
- Build institutional knowledge

---

## 🔮 Future Enhancements

### Potential Additions
1. **Audio Analysis**
   - Speech-to-text improvements
   - Speaker identification
   - Audio quality metrics

2. **Visual Analysis**
   - Frame content analysis (AI vision)
   - Scene detection
   - Object recognition

3. **Enhanced Metadata**
   - View counts, likes, engagement
   - Related videos
   - Playlist information

4. **Real-time Processing**
   - Live stream processing
   - Real-time transcript extraction
   - Live comment monitoring

---

## 📚 Related Files

- `scripts/enrich-youtube-to-rag.js` - Main enrichment script
- `scripts/youtube-capture-frames.sh` - Frame capture script
- `dashboard/app/api/ingest/youtube/route.ts` - Single video API
- `dashboard/app/api/ingest/youtube/batch/route.ts` - Batch API
- `scripts/archived/automation/auto-youtube-ingest.js` - Legacy batch script

---

## ✅ Conclusion

**Alex AI has comprehensive YouTube video interpretation capabilities:**
- ✅ Metadata extraction
- ✅ Transcript extraction
- ✅ Comments extraction
- ✅ Frame capture
- ✅ API endpoints for automation
- ✅ RAG integration
- ✅ Batch processing

**All tools are operational and ready for use.**

---

**Status:** ✅ Complete - All Capabilities Documented

