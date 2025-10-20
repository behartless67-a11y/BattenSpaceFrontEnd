const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced photo processing with:
 * 1. Black bar removal
 * 2. Color normalization (consistent brightness/contrast)
 * 3. Standard aspect ratio cropping
 */

async function enhancePhoto(inputPath, outputPath, options = {}) {
  try {
    console.log(`Processing ${path.basename(inputPath)}...`);

    const {
      removeBlackBars = true,
      normalizeColors = true,
      targetAspectRatio = null, // e.g., "4:3" or "1:1"
      brightness = 1.0, // 1.0 = no change, >1.0 = brighter, <1.0 = darker
      saturation = 1.0, // 1.0 = no change, >1.0 = more saturated
      contrast = 1.0 // 1.0 = no change, >1.0 = more contrast
    } = options;

    let image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`  Original size: ${metadata.width}x${metadata.height}`);

    let cropParams = { left: 0, top: 0, width: metadata.width, height: metadata.height };

    // Step 1: Remove black bars if requested
    if (removeBlackBars) {
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      const { width, height, channels } = info;

      const isBlackColumn = (x) => {
        let blackPixels = 0;
        for (let y = 0; y < height; y++) {
          const idx = (y * width + x) * channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r < 30 && g < 30 && b < 30) blackPixels++;
        }
        return blackPixels / height > 0.9;
      };

      let left = 0;
      for (let x = 0; x < width; x++) {
        if (!isBlackColumn(x)) {
          left = x;
          break;
        }
      }

      let right = width - 1;
      for (let x = width - 1; x >= 0; x--) {
        if (!isBlackColumn(x)) {
          right = x;
          break;
        }
      }

      if (left > 0 || right < width - 1) {
        cropParams.left = left;
        cropParams.width = right - left + 1;
        console.log(`  Removed black bars: ${left}px left, ${width - right - 1}px right`);
      }
    }

    // Start fresh with the image
    image = sharp(inputPath);

    // Apply crop if we detected black bars
    if (cropParams.left > 0 || cropParams.width < metadata.width) {
      image = image.extract({
        left: cropParams.left,
        top: cropParams.top,
        width: cropParams.width,
        height: cropParams.height
      });
    }

    // Step 2: Normalize colors for consistency
    if (normalizeColors) {
      console.log(`  Normalizing colors (brightness: ${brightness}, saturation: ${saturation}, contrast: ${contrast})`);

      // Normalize uses histogram to auto-adjust contrast
      image = image.normalize();

      // Apply brightness and saturation adjustments
      if (brightness !== 1.0 || saturation !== 1.0) {
        image = image.modulate({
          brightness: brightness,
          saturation: saturation
        });
      }

      // Apply contrast if needed (using linear transformation)
      if (contrast !== 1.0) {
        const alpha = contrast;
        const beta = 128 * (1 - alpha);
        image = image.linear(alpha, beta);
      }
    }

    // Step 3: Apply target aspect ratio if specified
    if (targetAspectRatio) {
      const [ratioW, ratioH] = targetAspectRatio.split(':').map(Number);
      const targetRatio = ratioW / ratioH;
      const currentRatio = cropParams.width / cropParams.height;

      if (Math.abs(currentRatio - targetRatio) > 0.01) {
        console.log(`  Adjusting aspect ratio to ${targetAspectRatio}`);

        let newWidth, newHeight;
        if (currentRatio > targetRatio) {
          // Image is too wide, crop width
          newHeight = cropParams.height;
          newWidth = Math.round(newHeight * targetRatio);
        } else {
          // Image is too tall, crop height
          newWidth = cropParams.width;
          newHeight = Math.round(newWidth / targetRatio);
        }

        // Center the crop
        const cropLeft = Math.round((cropParams.width - newWidth) / 2);
        const cropTop = Math.round((cropParams.height - newHeight) / 2);

        image = image.extract({
          left: cropLeft,
          top: cropTop,
          width: newWidth,
          height: newHeight
        });
      }
    }

    // Save the enhanced image
    await image.toFile(outputPath);

    const outputMetadata = await sharp(outputPath).metadata();
    console.log(`  Final size: ${outputMetadata.width}x${outputMetadata.height}`);
    console.log(`  ✓ Saved to ${path.basename(outputPath)}\n`);

  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

/**
 * Batch process all photos in a directory
 */
async function batchEnhancePhotos(photosDir, options = {}) {
  const files = fs.readdirSync(photosDir);
  const photoFiles = files.filter(f =>
    /\.(jpe?g|png)$/i.test(f) &&
    !f.includes('_original') &&
    !f.includes('_enhanced') &&
    !f.includes('_new')
  );

  console.log(`Found ${photoFiles.length} photos to process\n`);

  for (const file of photoFiles) {
    const inputPath = path.join(photosDir, file);
    const ext = path.extname(file);
    const baseName = path.basename(file, ext);
    const outputPath = path.join(photosDir, `${baseName}_enhanced${ext}`);

    await enhancePhoto(inputPath, outputPath, options);
  }

  console.log('All photos processed!');
}

// Example usage
async function main() {
  const photosDir = path.join(__dirname, '../public/staff-photos');

  // Options for enhancement
  const options = {
    removeBlackBars: true,
    normalizeColors: true,
    brightness: 1.05,     // Slightly brighter to compensate for typical underexposure
    saturation: 1.05,     // Slightly more saturated for richer colors
    contrast: 1.0,        // Keep contrast neutral
    targetAspectRatio: null  // Preserve original aspect ratios
  };

  console.log('Starting batch enhancement of all staff photos...\n');
  await batchEnhancePhotos(photosDir, options);
}

main();
