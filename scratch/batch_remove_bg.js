import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

const teamMembers = [
  'pritam-paul',
  'pradipto-saha',
  'moumita-saha',
  'subham-maity',
  'sandeep-mukherjee',
  'tarun-binay-das',
  'meghdeep-saha',
  'junaid-jawed',
];

async function processAll() {
  const teamDir = 'd:/sit-kolkata-2026-premium/public/team';
  console.log('Starting background removal for all team portraits...');

  for (const member of teamMembers) {
    const inputPath = path.join(teamDir, `${member}.jpg`);
    const outputPath = path.join(teamDir, `${member}.png`);

    console.log(`Processing ${member}...`);
    try {
      const inputUrl = 'file:///' + path.resolve(inputPath).replace(/\\/g, '/');
      const blob = await removeBackground(inputUrl);
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Saved ${member}.png (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`✗ Error on ${member}:`, err);
    }
  }

  console.log('Finished background removal for all members!');
}

processAll();
