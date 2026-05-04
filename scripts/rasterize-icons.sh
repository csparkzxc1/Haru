#!/usr/bin/env bash
#
# 아이콘 래스터화 — assets/icons/*.svg → 각 플랫폼 위치
#
# 의존성: librsvg (rsvg-convert), imagemagick (magick / convert),
#         icnsutils (png2icns) 또는 macOS iconutil
#
# 처음 한 번만 실행하면 됨. SVG 소스 변경 시 다시 실행.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v rsvg-convert >/dev/null; then
  echo "rsvg-convert 가 필요합니다. 설치: brew install librsvg / apt install librsvg2-bin"
  exit 1
fi

ICON="assets/icons/icon.svg"
ICON_DARK="assets/icons/icon-dark.svg"
TRAY="assets/icons/tray.svg"
OG="assets/icons/og-image.svg"

mkdir -p packages/web/public
mkdir -p packages/mobile/assets
mkdir -p packages/desktop/src-tauri/icons

png_at() {
  local size=$1 src=$2 out=$3
  rsvg-convert -w "$size" -h "$size" "$src" -o "$out"
  echo "  $out  ($size×$size)"
}

echo "[web]"
png_at 192  "$ICON"      packages/web/public/icon-192.png
png_at 512  "$ICON"      packages/web/public/icon-512.png
png_at 512  "$ICON"      packages/web/public/icon-maskable-512.png
png_at 180  "$ICON"      packages/web/public/apple-touch-icon.png
png_at 32   "$ICON"      packages/web/public/favicon-32.png
png_at 16   "$ICON"      packages/web/public/favicon-16.png
rsvg-convert -w 1200 -h 630 "$OG" -o packages/web/public/og-image.png
echo "  packages/web/public/og-image.png  (1200×630)"

# favicon.ico = 16+32 통합
if command -v magick >/dev/null; then
  magick packages/web/public/favicon-16.png packages/web/public/favicon-32.png \
    packages/web/public/favicon.ico
  rm packages/web/public/favicon-16.png packages/web/public/favicon-32.png
fi

echo "[mobile]"
png_at 1024 "$ICON"      packages/mobile/assets/icon.png
png_at 1024 "$ICON_DARK" packages/mobile/assets/adaptive-icon.png
# splash 는 1242×2436 기준 (iPhone X)
rsvg-convert -w 1242 -h 2436 "$ICON" -o packages/mobile/assets/splash.png
echo "  packages/mobile/assets/splash.png  (1242×2436)"

echo "[desktop]"
png_at 32  "$ICON" packages/desktop/src-tauri/icons/32x32.png
png_at 128 "$ICON" packages/desktop/src-tauri/icons/128x128.png
png_at 256 "$ICON" packages/desktop/src-tauri/icons/128x128@2x.png
png_at 512 "$ICON" packages/desktop/src-tauri/icons/icon.png
png_at 22  "$TRAY" packages/desktop/src-tauri/icons/tray.png

# macOS .icns
if [ "$(uname)" = "Darwin" ] && command -v iconutil >/dev/null; then
  ICONSET=$(mktemp -d)/icon.iconset
  mkdir -p "$ICONSET"
  for size in 16 32 64 128 256 512; do
    rsvg-convert -w "$size" -h "$size" "$ICON" -o "$ICONSET/icon_${size}x${size}.png"
    rsvg-convert -w "$((size*2))" -h "$((size*2))" "$ICON" -o "$ICONSET/icon_${size}x${size}@2x.png"
  done
  iconutil -c icns "$ICONSET" -o packages/desktop/src-tauri/icons/icon.icns
  echo "  packages/desktop/src-tauri/icons/icon.icns"
elif command -v png2icns >/dev/null; then
  png2icns packages/desktop/src-tauri/icons/icon.icns \
    packages/desktop/src-tauri/icons/128x128.png \
    packages/desktop/src-tauri/icons/icon.png
  echo "  packages/desktop/src-tauri/icons/icon.icns (png2icns)"
fi

# Windows .ico
if command -v magick >/dev/null; then
  magick \
    \( -size 16x16   -background none "$ICON" \) \
    \( -size 32x32   -background none "$ICON" \) \
    \( -size 48x48   -background none "$ICON" \) \
    \( -size 64x64   -background none "$ICON" \) \
    \( -size 128x128 -background none "$ICON" \) \
    \( -size 256x256 -background none "$ICON" \) \
    packages/desktop/src-tauri/icons/icon.ico
  echo "  packages/desktop/src-tauri/icons/icon.ico"
fi

echo
echo "✓ 완료. 산출물은 git 에 commit 하지 마세요 — SVG 소스만 보관."
