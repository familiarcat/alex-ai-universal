#!/usr/bin/env bash
set -euo pipefail

# Capture representative frames from a YouTube video using yt-dlp + ffmpeg.
# - Downloads the video to a temp mp4 (best mp4 available)
# - Extracts N evenly spaced JPG frames
# - Saves to captures/<videoId>/frame-XXXX.jpg
#
# Requirements: yt-dlp, ffmpeg, ffprobe (brew install yt-dlp ffmpeg)
#
# Usage:
#   scripts/youtube-capture-frames.sh <youtube_url> [num_frames]
#   # default num_frames = 8

URL=${1:-}
NUM=${2:-8}

if [[ -z "$URL" ]]; then
  echo "Usage: $0 <youtube_url> [num_frames]" >&2
  exit 1
fi

command -v yt-dlp >/dev/null 2>&1 || { echo "yt-dlp not found. brew install yt-dlp" >&2; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg not found. brew install ffmpeg" >&2; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "ffprobe not found. brew install ffmpeg" >&2; exit 1; }

workdir=$(pwd)
tmpdir=$(mktemp -d)
cleanup() { rm -rf "$tmpdir"; }
trap cleanup EXIT

echo "➜ Downloading video..."
mp4="$tmpdir/video.mp4"
yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' -o "$mp4" "$URL" --merge-output-format mp4 >/dev/null 2>&1 || {
  echo "Falling back to generic mp4 download..." >&2
  yt-dlp -o "$mp4" "$URL" >/dev/null 2>&1 || { echo "Download failed" >&2; exit 1; }
}

echo "➜ Probing duration..."
dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$mp4" | awk '{printf("%d", $1)}')
if [[ -z "$dur" || "$dur" -le 0 ]]; then dur=120; fi

interval=$(( dur / NUM ))
if [[ "$interval" -lt 1 ]]; then interval=1; fi

echo "➜ Extracting $NUM frames (every ${interval}s) ..."
vid="$(node -e 'const u=new URL(process.argv[1]);let id="";if(u.hostname.includes("youtube.com")) id=u.searchParams.get("v"); else if(u.hostname.includes("youtu.be")) id=u.pathname.slice(1); process.stdout.write(id||"video")' "$URL")"
outdir="$workdir/captures/$vid"
mkdir -p "$outdir"

ffmpeg -hide_banner -loglevel error -y -i "$mp4" -vf "fps=1/${interval}" -q:v 2 "$outdir/frame-%04d.jpg"

count=$(ls -1 "$outdir"/frame-*.jpg 2>/dev/null | wc -l | tr -d ' ')
echo "✅ Saved $count frames to $outdir"
echo "$outdir"


