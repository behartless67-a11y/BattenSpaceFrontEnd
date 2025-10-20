const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cropBlackBars(inputPath, outputPath) {
  try {
    console.log(`Processing ${path.basename(inputPath)}...`);

    // Read the image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  Original size: ${metadata.width}x${metadata.height}`);

    // Get raw image data to analyze for black bars
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // Function to check if a column is mostly black
    const isBlackColumn = (x) => {
      let blackPixels = 0;
      for (let y = 0; y < height; y++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        // Consider pixel black if all RGB values are below threshold
        if (r < 30 && g < 30 && b < 30) {
          blackPixels++;
        }
      }
      // If more than 90% of pixels in column are black, it's a black bar
      return blackPixels / height > 0.9;
    };

    // Find left edge (first non-black column)
    let left = 0;
    for (let x = 0; x < width; x++) {
      if (!isBlackColumn(x)) {
        left = x;
        break;
      }
    }

    // Find right edge (last non-black column)
    let right = width - 1;
    for (let x = width - 1; x >= 0; x--) {
      if (!isBlackColumn(x)) {
        right = x;
        break;
      }
    }

    // Calculate crop dimensions
    const cropWidth = right - left + 1;
    const cropLeft = left;

    console.log(`  Detected black bars: ${left}px left, ${width - right - 1}px right`);
    console.log(`  Cropping to: ${cropWidth}x${height} (left: ${cropLeft})`);

    // Perform the crop
    await sharp(inputPath)
      .extract({ left: cropLeft, top: 0, width: cropWidth, height: height })
      .toFile(outputPath);

    console.log(`  Saved to ${path.basename(outputPath)}`);
    console.log(`  ✓ Complete\n`);

  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  const photosDir = path.join(__dirname, '../public/staff-photos');

  // Process Chidester's photo
  const chidesterPath = path.join(photosDir, 'Chidester.jpeg');
  if (fs.existsSync(chidesterPath)) {
    await cropBlackBars(chidesterPath, path.join(photosDir, 'Chidester_cropped.jpeg'));
  }

  console.log('All photos processed!');
}

main();
