import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

async function test() {
  const inputPath = 'd:/sit-kolkata-2026-premium/public/team/subham-maity.jpg';
  console.log('Testing background removal on:', inputPath);
  try {
    const inputUrl = 'file:///' + path.resolve(inputPath).replace(/\\/g, '/');
    const blob = await removeBackground(inputUrl);
    const buffer = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync('d:/sit-kolkata-2026-premium/public/team/subham-maity.png', buffer);
    console.log('Success! Saved to subham-maity.png, size:', buffer.length);
  } catch (err) {
    console.error('Error during bg removal:', err);
  }
}

test();
