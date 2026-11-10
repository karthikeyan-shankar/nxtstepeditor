#!/usr/bin/env bash
# Renders both versions of the ad and masters them for Reels: about -14 LUFS, true peak at or below -1 dBTP.
#   renders/nextstep4u-reel-tamil-with-deadline.mp4  (ends on today's test closing at 11:59, stopwatch running)
#   renders/nextstep4u-reel-tamil-no-deadline.mp4    (same film, no deadline row, no ticking)
# Both get ONE gain, measured on the with-deadline mix, so they stay identical before the end card.
# index-no-deadline.html exists only while it renders: HyperFrames allows one root composition per project.
set -euo pipefail
cd "$(dirname "$0")/.."
HF="npx --yes hyperframes@0.8.201"
mkdir -p renders
$HF render -q delivery -o renders/raw-a.mp4 --quiet
node scripts/make-variants.mjs
trap 'rm -f index-no-deadline.html renders/raw-a.mp4 renders/raw-b.mp4' EXIT
$HF render -q delivery -c index-no-deadline.html -o renders/raw-b.mp4 --quiet

J=$(ffmpeg -hide_banner -i renders/raw-a.mp4 -af loudnorm=I=-14:TP=-3:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
AF="loudnorm=I=-14:TP=-3:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
for v in a:with-deadline b:no-deadline; do
  ffmpeg -v error -y -i "renders/raw-${v%%:*}.mp4" -c:v copy -af "$AF" -ar 48000 -c:a aac -b:a 192k -movflags +faststart "renders/nextstep4u-reel-tamil-${v#*:}.mp4"
done
fail=0
for f in renders/nextstep4u-reel-tamil-with-deadline.mp4 renders/nextstep4u-reel-tamil-no-deadline.mp4; do
  S=$(ffmpeg -hide_banner -nostats -i "$f" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p')
  I=$(echo "$S" | awk '/^ *I:/{print $2; exit}'); TP=$(echo "$S" | awk '/^ *Peak:/{print $2; exit}')
  echo "$f  integrated $I LUFS  true peak $TP dBTP"
  awk -v tp="$TP" 'BEGIN{exit !(tp > -1.0)}' && { echo "  FAIL: true peak above -1 dBTP"; fail=1; }
done
[ "$fail" = 0 ] && echo DONE || exit 1
