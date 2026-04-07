/**
 * Сжимает растры в WebP (до 1920px по длинной стороне, quality 82).
 *
 * Без аргументов:
 *   images/gallery (исходники) → images/commercial (WebP)
 *   имена: c01…c08, r01…r06, extra-001…
 *
 * Своя папка:
 *   node scripts/compress-gallery.mjs --src images/newimages
 *   → вывод в images/newimages/opt, файлы 001.webp, 002.webp…
 *
 *   node scripts/compress-gallery.mjs --src images/newimages --out images/creative --prefix cr
 *   → cr-001.webp, cr-002.webp…
 *
 * Сохранить имена файлов (stem.png → stem.webp):
 *   node scripts/compress-gallery.mjs --src images/people/milana-khametova-in --out images/people/milana-khametova --keep-names
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.JPG',
  '.JPEG',
  '.PNG',
  '.WEBP',
  '.HEIC',
  '.HEIF',
]);

const MAX_EDGE = 1920;
const WEBP_QUALITY = 82;

function resolveUnderRoot(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
}

function parseArgs(argv) {
  const legacyGallery = argv.length === 0;

  const opts = {
    src: null,
    out: null,
    prefix: '',
    legacyGallery,
    keepNames: false,
  };

  if (legacyGallery) {
    opts.src = path.join(ROOT, 'images', 'gallery');
    opts.out = path.join(ROOT, 'images', 'commercial');
    return opts;
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--src' && argv[i + 1]) {
      opts.src = resolveUnderRoot(argv[++i]);
    } else if (a === '--out' && argv[i + 1]) {
      opts.out = resolveUnderRoot(argv[++i]);
    } else if (a === '--prefix' && argv[i + 1]) {
      opts.prefix = argv[++i];
    } else if (a === '--keep-names') {
      opts.keepNames = true;
    } else if (!a.startsWith('-')) {
      if (!opts.src) opts.src = resolveUnderRoot(a);
      else if (!opts.out) opts.out = resolveUnderRoot(a);
    }
  }

  if (!opts.src) {
    console.error('Укажите папку с исходниками: --src images/… или первый позиционный аргумент.');
    process.exit(1);
  }
  if (!opts.out) {
    opts.out = path.join(opts.src, 'opt');
  }

  return opts;
}

function isHeic(filePath) {
  const e = path.extname(filePath).toLowerCase();
  return e === '.heic' || e === '.heif';
}

async function processOne(inputPath, outputPath) {
  let fromPath = inputPath;
  let tmpJpeg = null;
  if (isHeic(inputPath)) {
    tmpJpeg = path.join(os.tmpdir(), `compress-heic-${process.pid}-${Date.now()}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', inputPath, '--out', tmpJpeg], {
      stdio: 'ignore',
    });
    fromPath = tmpJpeg;
  }

  try {
    const pipeline = sharp(fromPath).rotate().resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    });

    await pipeline.webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(outputPath);
  } finally {
    if (tmpJpeg && fs.existsSync(tmpJpeg)) {
      fs.unlinkSync(tmpJpeg);
    }
  }
}

function outNameLegacy(i) {
  if (i < 8) return `c${String(i + 1).padStart(2, '0')}.webp`;
  if (i < 14) return `r${String(i - 8 + 1).padStart(2, '0')}.webp`;
  return `extra-${String(i - 14 + 1).padStart(3, '0')}.webp`;
}

function outNameFlat(i, prefix) {
  const n = String(i + 1).padStart(3, '0');
  return prefix ? `${prefix}-${n}.webp` : `${n}.webp`;
}

async function main() {
  const { src: SRC, out: OUT, prefix, legacyGallery, keepNames } = parseArgs(
    process.argv.slice(2),
  );

  fs.mkdirSync(OUT, { recursive: true });

  const names = fs
    .readdirSync(SRC)
    .filter((f) => EXT.has(path.extname(f)))
    .sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base', numeric: true }));

  if (!names.length) {
    console.log('Нет растровых файлов в', SRC);
    return;
  }

  for (let i = 0; i < names.length; i++) {
    const base = legacyGallery
      ? outNameLegacy(i)
      : keepNames
        ? `${path.parse(names[i]).name}.webp`
        : outNameFlat(i, prefix);
    const inPath = path.join(SRC, names[i]);
    const outPath = path.join(OUT, base);
    const before = fs.statSync(inPath).size;
    await processOne(inPath, outPath);
    const after = fs.statSync(outPath).size;
    console.log(
      `${names[i]} → ${base} (${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024).toFixed(0)} KB)`,
    );
  }

  console.log('\nГотово:', names.length, 'файлов в', path.relative(ROOT, OUT));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
