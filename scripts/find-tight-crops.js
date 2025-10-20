const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function findTightCrops() {
  const photosDir = path.join(__dirname, '../public/staff-photos');
  const files = fs.readdirSync(photosDir);

  const photoFiles = files.filter(f =>
    /\.(jpe?g|png)$/i.test(f) &&
    !f.includes('_original') &&
    !f.includes('_enhanced') &&
    !f.includes('_new')
  );

  console.log('Looking for tight crops (ratio 1.0-1.45, likely face-only shots)...\n');

  const tightCrops = [];

  for (const file of photoFiles) {
    const metadata = await sharp(path.join(photosDir, file)).metadata();
    const ratio = metadata.width / metadata.height;

    // Photos with ratio between 1.0 and 1.45 tend to be tight headshots
    if (ratio >= 1.0 && ratio <= 1.45) {
      tightCrops.push({
        file,
        width: metadata.width,
        height: metadata.height,
        ratio: ratio.toFixed(2)
      });
    }
  }

  tightCrops.sort((a, b) => parseFloat(a.ratio) - parseFloat(b.ratio));

  console.log(`Found ${tightCrops.length} photos with tight framing:\n`);

  tightCrops.forEach(photo => {
    console.log(`${photo.file}`);
    console.log(`  ${photo.width}x${photo.height} (ratio: ${photo.ratio})`);
    console.log('');
  });
}

findTightCrops();
