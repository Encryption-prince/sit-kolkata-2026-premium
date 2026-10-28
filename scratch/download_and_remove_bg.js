import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const teamDir = 'd:/sit-kolkata-2026-premium/public/team';

// Team members from the Google Sheet (row data cleaned up)
const newMembers = [
  { name: 'Vishnu Maddheshiya',  slug: 'vishnu-maddheshiya',  driveId: '12z42-m8VxMgDG3HMKAKcPludAqa_W2r4' },
  { name: 'Prasansa Gupta',      slug: 'prasansa-gupta',      driveId: '1fil5Fuih8sIpJdC6ZxW42xdSKq2h8w56' },
  { name: 'Moumita Saha',        slug: 'moumita-saha',        driveId: '1L4bbeUgIrahw3KkB_ewIEYHR67u_HkHg' },
  { name: 'Amitt Dubey',         slug: 'amitt-dubey',         driveId: '1Mvl4mRCF1trO0YZ0NpbOUzaH9mnr0GY5' },
  { name: 'Pritam Kumar Mani',   slug: 'pritam-kumar-mani',   driveId: '1j1bxpilApeCtSxgLtkfrdtfFhdM3RVWu' },
  { name: 'Abhisikta Mukherjee', slug: 'abhisikta-mukherjee', driveId: '1Ze2DWaDcCeirQr2X4IkK_-wvYwRBpTCM' },
  { name: 'Pritam Paul',         slug: 'pritam-paul',         driveId: '1Av7ykp_ZXlp_J8Yhdh4CmO_cM7FNXbco' },
  { name: 'Subham Maity',        slug: 'subham-maity',        driveId: '1UUjeLLCtQJWG-GemAg49P8GtuKPoJRl2' },
  { name: 'Tanuja Chowdhury',    slug: 'tanuja-chowdhury',    driveId: '1kbm7q_akaWiLPtZGMbCV0GhYUDyEuPWF' },
  { name: 'Srijoyee Ghosh',      slug: 'srijoyee-ghosh',      driveId: '1q8zQ5hbwLyeuyEkqCkdEmmMAqb1afaCQ' },
  { name: 'Rupam Mandal',        slug: 'rupam-mandal',        driveId: '15VsxCn09rATkjYFEy-_llKCBDs_Ayp78' },
  { name: 'Ankan Karmakar',      slug: 'ankan-karmakar',      driveId: '1QoEC0ren7hMm_YYu3X5WVmCNvK3rlRo0' },
  { name: 'Kuntal Das',          slug: 'kuntal-das',          driveId: '1BQg4VvwUV_sD2OaiUfqyKb68yHHHeWSq' },
  { name: 'Indranil Guria',      slug: 'indranil-guria',      driveId: '1HkLv4z4r-L0MGPkeexo3NFzjcPXSC-qO' },
  { name: 'Bitan',               slug: 'bitan',               driveId: '1SOQk2_tWin2CcezaPrlCBC8spvO65CtE' },
  { name: 'Pradipto Kumar Saha', slug: 'pradipto-kumar-saha', driveId: '1WESkXpkupPztfAuvMP-gyF9kx4qXh5TO' },
  { name: 'Sagnik Adhikary',     slug: 'sagnik-adhikary',     driveId: '1R7IHjx4xUj8LplP9sXPIc_1i5xH3Zc3V' },
  { name: 'Raunak Das',          slug: 'raunak-das',          driveId: '1wkWy4Wb2-V3_aHdxXtTXHan451e1PDFR' },
  { name: 'Pranay Mukherjee',    slug: 'pranay-mukherjee',    driveId: '1Zo4iyy9wq8_YGX1IbAkIidoPU63urq1n' },
  { name: 'Piyush Goenka',       slug: 'piyush-goenka',       driveId: '1dT8rEjR0P27jLEW9zXjxqLPjvDLXKzm2' },
  { name: 'Sayan Ankur',         slug: 'sayan-ankur',         driveId: '1ttME68evNWf_JDSJMFfhVtaQQvfcYcwx' },
  { name: 'Titli Bera',          slug: 'titli-bera',          driveId: '1GxDg8fih8Fu-roSBa-KIlMt4aOmIKqRE' },
  { name: 'Chandika Sarkar',     slug: 'chandika-sarkar',     driveId: '1r0cc_T0LraRET-p-z1EFam5_24c5ribo' },
  { name: 'Koustav Singh',       slug: 'koustav-singh',       driveId: '1RgdJvmp7VjKIogxn9QdV-YBy0aGCE6gn' },
  { name: 'Subham Dutta',        slug: 'subham-dutta',        driveId: '1b7bT_q0BLdVzm-KnPiJblqxZgPfmlDSh' },
];

/**
 * Download a Google Drive file by ID, following redirects.
 * Returns a Buffer with the image data.
 */
function downloadGDriveFile(fileId) {
  return new Promise((resolve, reject) => {
    // Use the direct download URL
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    function fetchUrl(urlStr, redirectCount = 0) {
      if (redirectCount > 10) {
        reject(new Error('Too many redirects'));
        return;
      }
      
      const mod = urlStr.startsWith('https') ? https : http;
      const req = mod.get(urlStr, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location, redirectCount + 1);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${urlStr}`));
          return;
        }
        
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      });
      req.on('error', reject);
      req.end();
    }
    
    fetchUrl(url);
  });
}

async function processAll() {
  console.log('Starting download + background removal for all new team members...\n');
  
  const results = { success: [], failed: [] };

  for (const member of newMembers) {
    const jpgPath = path.join(teamDir, `${member.slug}.jpg`);
    const pngPath = path.join(teamDir, `${member.slug}.png`);

    // Skip if PNG already exists
    if (fs.existsSync(pngPath)) {
      console.log(`⏭  Skipping ${member.name} — PNG already exists`);
      results.success.push(member.slug);
      continue;
    }

    try {
      // Step 1: Download if jpg doesn't exist
      if (!fs.existsSync(jpgPath)) {
        console.log(`⬇  Downloading ${member.name}...`);
        const imgBuffer = await downloadGDriveFile(member.driveId);
        fs.writeFileSync(jpgPath, imgBuffer);
        console.log(`   Saved ${member.slug}.jpg (${(imgBuffer.length / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`   ${member.slug}.jpg already downloaded`);
      }

      // Step 2: Remove background
      console.log(`🎨 Removing background for ${member.name}...`);
      const inputUrl = 'file:///' + path.resolve(jpgPath).replace(/\\/g, '/');
      const blob = await removeBackground(inputUrl);
      const pngBuffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(pngPath, pngBuffer);
      console.log(`✓  Saved ${member.slug}.png (${(pngBuffer.length / 1024).toFixed(1)} KB)\n`);
      
      results.success.push(member.slug);
    } catch (err) {
      console.error(`✗  Error on ${member.name}:`, err.message, '\n');
      results.failed.push({ slug: member.slug, error: err.message });
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`✓ Success: ${results.success.length} members`);
  if (results.failed.length > 0) {
    console.log(`✗ Failed: ${results.failed.length} members`);
    results.failed.forEach(f => console.log(`  - ${f.slug}: ${f.error}`));
  }
}

processAll();
