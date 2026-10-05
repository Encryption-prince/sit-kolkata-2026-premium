const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processTemplate() {
  const rootDir = path.resolve(__dirname, '..');
  const originalPath = path.join(rootDir, 'public', 'SIT KOL 26 Boarding Pass-new.png');
  const backupPath = path.join(rootDir, 'public', 'SIT KOL 26 Boarding Pass-new-original.png');
  const hdPath = path.join(rootDir, 'public', 'flex-ticket-template-hd.png');

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(originalPath, backupPath);
    console.log('Backed up original to SIT KOL 26 Boarding Pass-new-original.png');
  }

  const img = sharp(backupPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Clean placeholder area 'Future Builder': x: 4920 to 5650, y: 535 to 640
  // Background parchment is [245, 239, 230, 255]
  for (let y = 535; y <= 640; y++) {
    for (let x = 4920; x <= 5650; x++) {
      const idx = (y * info.width + x) * 4;
      data[idx] = 245;
      data[idx + 1] = 239;
      data[idx + 2] = 230;
      data[idx + 3] = 255;
    }
  }

  const cleanUntrimmed = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  const trimmedBuf = await sharp(cleanUntrimmed)
    .trim()
    .png({ compressionLevel: 9, effort: 7 })
    .toBuffer();

  fs.writeFileSync(originalPath, trimmedBuf);
  fs.writeFileSync(hdPath, trimmedBuf);

  const meta = await sharp(trimmedBuf).metadata();
  console.log('Successfully saved cleaned templates!');
  console.log('Dimensions:', meta.width, 'x', meta.height);
  console.log('Size:', (trimmedBuf.length / 1024 / 1024).toFixed(2), 'MB');
}

processTemplate().catch(console.error);
