#!/usr/bin/env bash
# Render the Word files to PNG for a quick look (LibreOffice, stand-in fonts).
# The real result is what Word shows: open the .docx in Word and export the PDF there.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/preview"
mkdir -p "$OUT" "$HOME/.fonts" "$HOME/.config/fontconfig"
cp "$ROOT"/assets/fonts/*.ttf "$HOME/.fonts/"
cat > "$HOME/.config/fontconfig/fonts.conf" <<'XML'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <alias binding="same"><family>Leelawadee UI</family><prefer><family>Noto Sans</family><family>Noto Sans Thai</family></prefer></alias>
  <alias binding="same"><family>游ゴシック</family><prefer><family>IPAPGothic</family></prefer></alias>
</fontconfig>
XML
fc-cache -f >/dev/null 2>&1 || true
PROFILE="file://$OUT/.lo-profile"
for f in "$ROOT"/output/*.docx; do
  soffice -env:UserInstallation="$PROFILE" --headless --convert-to pdf --outdir "$OUT" "$f" >/dev/null 2>&1
  b="$(basename "${f%.docx}")"
  pdftoppm -png -r 80 "$OUT/$b.pdf" "$OUT/$b"
  echo "$b: $(pdfinfo "$OUT/$b.pdf" | awk '/^Pages/ {print $2}') pages"
done
