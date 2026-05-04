# 임시 아이콘 자료

소스는 SVG 4종. 정식 디자이너 영입 전까지 사용하는 placeholder 입니다.

| 파일 | 용도 |
|---|---|
| `icon.svg` | 라이트 메인 — 1024×1024. 떠오르는 해 + "하" 글자. |
| `icon-dark.svg` | 다크 변형 (Android adaptive foreground / 다크 OG) |
| `tray.svg` | 22×22 monochrome 메뉴바 (Tauri 트레이) |
| `og-image.svg` | 1200×630 소셜 카드 (Open Graph / Twitter) |

## 래스터화

소스 SVG → 각 플랫폼 사이즈 PNG/ICO/ICNS 로 변환합니다. `scripts/rasterize-icons.sh` 한 번 실행:

```bash
# macOS
brew install librsvg imagemagick
# Ubuntu
apt-get install -y librsvg2-bin imagemagick

bash scripts/rasterize-icons.sh
```

산출물:

```
packages/web/public/
  icon-192.png
  icon-512.png
  icon-maskable-512.png
  apple-touch-icon.png
  favicon.ico
  og-image.png

packages/mobile/assets/
  icon.png            (1024×1024)
  adaptive-icon.png   (Android, 1024×1024)
  splash.png

packages/desktop/src-tauri/icons/
  32x32.png
  128x128.png
  128x128@2x.png
  icon.icns           (macOS)
  icon.ico            (Windows)
  tray.png
```

## 정식 아이콘 교체 시

같은 파일명·치수로 덮어쓰면 됩니다. SVG 소스도 같은 경로에 두면 향후
재생성 가능. 디자이너 가이드:

- iOS adaptive 안전 영역: 1024 기준 86px corner radius (자동 mask)
- Android adaptive: 108×108 기준 foreground/background 분리
- macOS .icns: 16/32/64/128/256/512/1024 + @2x 변형
- Windows .ico: 16/24/32/48/64/128/256 통합 ICO
