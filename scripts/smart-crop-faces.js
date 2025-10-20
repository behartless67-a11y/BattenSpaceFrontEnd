/**
 * Smart face-centered photo cropping
 *
 * This script uses face detection to intelligently crop and center photos
 * around detected faces, ensuring people are properly positioned in the frame.
 *
 * SETUP REQUIRED:
 * npm install @vladmandic/face-api canvas
 *
 * The face-api library needs model files. Download them to a 'models' folder:
 * https://github.com/vladmandic/face-api/tree/master/model
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
// Uncomment these after installing the packages:
// const faceapi = require('@vladmandic/face-api');
// const canvas = require('canvas');

async function smartCropWithFaceDetection(inputPath, outputPath, options = {}) {
  try {
    console.log(`Processing ${path.basename(inputPath)}...`);

    const {
      targetWidth = 400,
      targetHeight = 400,
      padding = 0.2 // 20% padding around detected face
    } = options;

    // This would work after installing face-api:
    /*
    // Load the image into a canvas
    const { Canvas, Image } = canvas;
    faceapi.env.monkeyPatch({ Canvas, Image });

    const img = await canvas.loadImage(inputPath);

    // Detect face with landmarks
    const detections = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detections) {
      console.log('  No face detected, using center crop');
      // Fall back to center crop
      await sharp(inputPath)
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(outputPath);
      return;
    }

    // Get face bounding box
    const box = detections.detection.box;
    const faceCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };

    console.log(`  Face detected at: (${Math.round(faceCenter.x)}, ${Math.round(faceCenter.y)})`);

    // Calculate crop area centered on face with padding
    const faceSize = Math.max(box.width, box.height);
    const cropSize = Math.round(faceSize * (1 + padding * 2));

    const cropLeft = Math.max(0, Math.round(faceCenter.x - cropSize / 2));
    const cropTop = Math.max(0, Math.round(faceCenter.y - cropSize / 2));

    // Ensure crop doesn't exceed image bounds
    const metadata = await sharp(inputPath).metadata();
    const finalCropSize = Math.min(
      cropSize,
      metadata.width - cropLeft,
      metadata.height - cropTop
    );

    // Perform smart crop centered on face
    await sharp(inputPath)
      .extract({
        left: cropLeft,
        top: cropTop,
        width: finalCropSize,
        height: finalCropSize
      })
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);

    console.log(`  ✓ Cropped and resized to ${targetWidth}x${targetHeight} centered on face\n`);
    */

    // Placeholder for now
    console.log('  Face detection requires: npm install @vladmandic/face-api canvas');
    console.log('  Using center crop as fallback...');

    await sharp(inputPath)
      .resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);

    console.log(`  ✓ Created ${targetWidth}x${targetHeight} center crop\n`);

  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  const photosDir = path.join(__dirname, '../public/staff-photos');

  console.log('Smart Face-Centered Photo Cropping');
  console.log('===================================\n');
  console.log('This tool can detect faces and intelligently crop photos to center them.');
  console.log('\nTo enable face detection, install:');
  console.log('  npm install @vladmandic/face-api canvas\n');
  console.log('Then download face detection models to a "models" folder from:');
  console.log('  https://github.com/vladmandic/face-api/tree/master/model\n');

  // Example: Process a single photo
  // await smartCropWithFaceDetection(
  //   path.join(photosDir, 'SomePhoto.jpeg'),
  //   path.join(photosDir, 'SomePhoto_cropped.jpeg'),
  //   { targetWidth: 400, targetHeight: 400, padding: 0.3 }
  // );
}

main();

module.exports = { smartCropWithFaceDetection };
