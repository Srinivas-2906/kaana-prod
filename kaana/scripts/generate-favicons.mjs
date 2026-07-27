/**
 * Regenerate theme-aware favicons from public/logo-only.png.
 * Run from kaana/: node scripts/generate-favicons.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const py = `
from PIL import Image, ImageFilter

base = ${JSON.stringify(root)}
logo = Image.open(f"{base}/public/logo-only.png").convert("RGBA")

def make_bold_icon(size, fg_color, dilate_passes=1, fill_ratio=0.84):
    alpha = logo.split()[3]
    mask = alpha.point(lambda a: 255 if a > 40 else 0)
    for _ in range(dilate_passes):
        mask = mask.filter(ImageFilter.MaxFilter(3))
    bbox = mask.getbbox()
    cropped = mask.crop(bbox)
    target = int(size * fill_ratio)
    w, h = cropped.size
    scale = min(target / w, target / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    scaled = scaled.point(lambda a: 255 if a > 64 else 0)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    colored = Image.new("RGBA", (nw, nh), (*fg_color, 255))
    colored.putalpha(scaled)
    canvas.paste(colored, ((size - nw) // 2, (size - nh) // 2), colored)
    return canvas

for size in [32, 48, 96]:
    suffix = "" if size == 32 else f"-{size}"
    make_bold_icon(size, (0, 0, 0)).save(f"{base}/public/icon-light{suffix}.png")
    make_bold_icon(size, (255, 255, 255)).save(f"{base}/public/icon-dark{suffix}.png")

apple = make_bold_icon(180, (255, 255, 255), dilate_passes=1, fill_ratio=0.86)
apple.save(f"{base}/src/app/apple-icon.png")
apple.save(f"{base}/public/apple-icon.png")

make_bold_icon(128, (255, 255, 255), dilate_passes=0, fill_ratio=0.82).save(f"{base}/public/logo-mark-white.png")
make_bold_icon(128, (0, 0, 0), dilate_passes=0, fill_ratio=0.82).save(f"{base}/public/logo-mark-dark.png")
print("Favicons generated")
`;

const tmpPath = path.join(root, "scripts", ".tmp-generate-favicons.py");
fs.writeFileSync(tmpPath, py, "utf8");
try {
  execSync(`python3 ${JSON.stringify(tmpPath)}`, { stdio: "inherit" });
} finally {
  try {
    fs.unlinkSync(tmpPath);
  } catch {
    // ignore
  }
}
