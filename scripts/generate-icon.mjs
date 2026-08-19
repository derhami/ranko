/**
 * Icon Generator for SEOmator Desktop App
 *
 * Renders the Ranko logo (electron/resources/source-logo.svg) at 1024x1024
 * using Playwright, then saves it as PNG.
 * electron-builder auto-converts this to .icns (macOS) and .ico (Windows).
 *
 * Usage: node scripts/generate-icon.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const resourcesDir = join(__dirname, '..', 'electron', 'resources');
const sourceLogoPath = join(resourcesDir, 'source-logo.svg');

if (!existsSync(resourcesDir)) {
  mkdirSync(resourcesDir, { recursive: true });
}

if (!existsSync(sourceLogoPath)) {
  console.error(`Missing source logo: ${sourceLogoPath}`);
  console.error('Copy ranko.svg into electron/resources/source-logo.svg first.');
  process.exit(1);
}

const SIZE = 1024;
const svgData = readFileSync(sourceLogoPath).toString('base64');

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${SIZE}px;
    height: ${SIZE}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  img {
    width: ${SIZE}px;
    height: ${SIZE}px;
    display: block;
  }
</style>
</head>
<body>
  <img src="data:image/svg+xml;base64,${svgData}" alt="Ranko logo" />
</body>
</html>`;

async function generateIcon() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });

  await page.setContent(html, { waitUntil: 'networkidle' });

  const iconPath = join(resourcesDir, 'icon.png');
  const buffer = await page.screenshot({ type: 'png', omitBackground: true });
  writeFileSync(iconPath, buffer);
  console.log(`✓ icon.png (${SIZE}x${SIZE}) → ${iconPath}`);

  await browser.close();
  console.log('Done! electron-builder will auto-convert to .icns / .ico');
}

generateIcon().catch((err) => {
  console.error('Failed to generate icon:', err.message);
  process.exit(1);
});
