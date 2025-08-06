import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const ICON_SIZES = {
  icon: 1024,
  splash: 2048,
  adaptive: 1024,
};

// Our icon SVG as a string
const ICON_SVG = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3B82F6"/>
      <stop offset="1" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <circle cx="512" cy="512" r="512" fill="url(#grad)"/>

  <!-- Outer circle -->
  <circle cx="512" cy="512" r="360" stroke="white" stroke-width="16" stroke-dasharray="32 32" opacity="0.4"/>

  <!-- Inner circle -->
  <circle cx="512" cy="512" r="280" stroke="white" stroke-width="20" opacity="0.8"/>

  <!-- Center dot -->
  <circle cx="512" cy="512" r="60" fill="white"/>

  <!-- Focus lines -->
  <circle cx="512" cy="512" r="420" stroke="white" stroke-width="20" stroke-dasharray="60 1800" opacity="0.6"/>
</svg>
`;

async function generateIcon(size: number, outputPath: string) {
  // Convert SVG to PNG using sharp
  const buffer = await sharp(Buffer.from(ICON_SVG))
    .resize(size, size)
    .png()
    .toBuffer();

  // Write the PNG file
  await writeFile(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

async function main() {
  const assetsDir = join(__dirname, '../assets');

  // Ensure assets directory exists
  await mkdir(assetsDir, { recursive: true });

  // Generate icons
  await Promise.all([
    generateIcon(ICON_SIZES.icon, join(assetsDir, 'icon.png')),
    generateIcon(ICON_SIZES.splash, join(assetsDir, 'splash-icon.png')),
    generateIcon(ICON_SIZES.adaptive, join(assetsDir, 'adaptive-icon.png')),
  ]);

  console.log('✅ All icons generated successfully!');
}

main().catch(console.error);
