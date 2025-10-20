# Staff Photo Enhancement Tools

## Overview
We have three scripts for processing and enhancing staff photos:

1. **crop-photos.js** - Basic black bar removal
2. **enhance-photos.js** - Color normalization and batch processing
3. **smart-crop-faces.js** - Face detection and smart centering (requires additional setup)

## Problems These Tools Solve

### 1. Black Bars (Letterboxing)
Staff photos sometimes have embedded black bars that CSS `object-cover` cannot remove because the bars are baked into the image files themselves.

### 2. Inconsistent Colors
Photos from different sources have varying brightness, contrast, and saturation levels, making the staff directory look inconsistent.

### 3. Poor Framing
Some photos have faces positioned off-center or too far from the camera, making them look awkward in the uniform card layout.

## Tool 1: Basic Black Bar Removal

### Purpose
The `scripts/crop-photos.js` script automatically detects and removes vertical black bars (letterboxing) from photos.

### How It Works
1. Analyzes each pixel column in the image
2. Detects columns that are mostly black (RGB values < 30)
3. Finds the left and right edges where content begins
4. Automatically crops the image to remove the black bars

## Prerequisites
The Sharp library must be installed:
```bash
npm install sharp
```

## Usage

### 1. Edit the script to specify which photos to process
Open `scripts/crop-photos.js` and modify the `main()` function to include the photos you want to crop:

```javascript
async function main() {
  const photosDir = path.join(__dirname, '../public/staff-photos');

  // Add photos to process here
  const photoPath = path.join(photosDir, 'LastName.jpeg');
  if (fs.existsSync(photoPath)) {
    await cropBlackBars(photoPath, path.join(photosDir, 'LastName_cropped.jpeg'));
  }

  console.log('All photos processed!');
}
```

### 2. Run the script
```bash
node scripts/crop-photos.js
```

### 3. Review the output
The script will show you:
- Original dimensions
- How many pixels of black bars were detected on each side
- New cropped dimensions

Example output:
```
Processing Chidester.jpeg...
  Original size: 832x555
  Detected black bars: 147px left, 147px right
  Cropping to: 538x555 (left: 147)
  Saved to Chidester_cropped.jpeg
  ✓ Complete
```

### 4. Replace the original
If the cropped version looks good, replace the original:
```bash
cd public/staff-photos
mv PhotoName.jpeg PhotoName_original.jpeg
mv PhotoName_cropped.jpeg PhotoName.jpeg
```

## How It Works

The script analyzes each vertical column of pixels:
1. For each column, it checks what percentage of pixels are black (RGB < 30)
2. If more than 90% of pixels in a column are black, it's considered a black bar
3. It finds the first and last non-black columns
4. It crops the image to remove everything outside those bounds

## Files Processed
The following staff photos have been processed with this tool:
- Amanda Crombie: 244px bars removed from each side
- Tim Davis: ~150px bars removed from each side
- Chidester: 147px bars removed from each side

Original versions are kept as `*_original.jpeg` for backup purposes.

## Notes
- The script only detects vertical black bars (letterboxing on left/right)
- Horizontal black bars (pillarboxing on top/bottom) would require modifications
- The threshold for "black" is RGB < 30, which can be adjusted if needed
- The 90% threshold means a column must be almost entirely black to be cropped

---

## Tool 2: Color Normalization & Batch Enhancement

### Purpose
The `scripts/enhance-photos.js` script provides advanced photo processing including:
- Automatic black bar removal
- Color normalization for consistency across all photos
- Brightness, saturation, and contrast adjustments
- Optional aspect ratio standardization
- Batch processing of entire directories

### Capabilities

#### Color Normalization
Uses histogram-based normalization to ensure all photos have consistent:
- Brightness levels
- Contrast ratios
- Color saturation

#### Adjustable Parameters
```javascript
const options = {
  removeBlackBars: true,     // Auto-detect and remove letterboxing
  normalizeColors: true,     // Apply histogram normalization
  brightness: 1.0,           // 1.0 = no change, 1.1 = 10% brighter, 0.9 = 10% darker
  saturation: 1.0,           // 1.0 = no change, 1.2 = 20% more saturated
  contrast: 1.0,             // 1.0 = no change, 1.1 = 10% more contrast
  targetAspectRatio: null    // e.g., "4:3" or "1:1" for uniform sizing
};
```

### Usage

#### Process a Single Photo
```javascript
await enhancePhoto(
  path.join(photosDir, 'Photo.jpeg'),
  path.join(photosDir, 'Photo_enhanced.jpeg'),
  {
    normalizeColors: true,
    brightness: 1.1,  // Make slightly brighter
    saturation: 1.05  // Slightly more saturated
  }
);
```

#### Batch Process All Photos
```javascript
await batchEnhancePhotos(photosDir, {
  removeBlackBars: true,
  normalizeColors: true,
  brightness: 1.0,
  saturation: 1.0,
  contrast: 1.0
});
```

### When to Use This Tool
- **Before**: Photos look inconsistent - some too dark, some too bright, different color tones
- **After**: All photos have uniform color characteristics
- **Use case**: You've just added 20 new staff photos from various sources and want them to match

---

## Tool 3: Smart Face-Centered Cropping

### Purpose
The `scripts/smart-crop-faces.js` script uses AI-powered face detection to:
- Detect faces in photos
- Intelligently crop and center photos around detected faces
- Ensure people are properly positioned in the frame
- Handle multiple faces or no faces gracefully

### Setup Required
This tool requires additional dependencies:

```bash
npm install @vladmandic/face-api canvas
```

You'll also need to download face detection model files:
1. Create a `models` folder in your project root
2. Download models from: https://github.com/vladmandic/face-api/tree/master/model
3. Save the following files to the `models` folder:
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1

### How It Works
1. Loads the photo into a canvas
2. Runs face detection AI to find faces
3. Calculates the center point of detected face(s)
4. Crops the image centered on the face with configurable padding
5. Resizes to target dimensions
6. Falls back to center crop if no face detected

### Usage
```javascript
await smartCropWithFaceDetection(
  path.join(photosDir, 'Photo.jpeg'),
  path.join(photosDir, 'Photo_cropped.jpeg'),
  {
    targetWidth: 400,
    targetHeight: 400,
    padding: 0.2  // 20% padding around face
  }
);
```

### Parameters
- **targetWidth/targetHeight**: Final image dimensions
- **padding**: Percentage of space around the detected face (0.2 = 20% padding)

### When to Use This Tool
- **Before**: Faces are off-center, too small, or awkwardly positioned
- **After**: All faces are centered and properly framed
- **Use case**: You have photos from various sources with different compositions and need uniform framing

---

## Workflow Recommendations

### For Individual Photos with Black Bars
1. Use `crop-photos.js` to remove letterboxing
2. Manually check the result
3. Replace original if satisfactory

### For Batch Photo Updates
1. Add all new photos to `public/staff-photos/`
2. Run `enhance-photos.js` with batch mode to normalize colors
3. Review `*_enhanced.jpeg` files
4. Replace originals if results are good

### For Complete Photo Standardization
1. Remove black bars: `crop-photos.js`
2. Normalize colors: `enhance-photos.js`
3. Center faces: `smart-crop-faces.js` (if face-api is installed)
4. This gives you perfectly uniform, professional-looking photos

---

## Sharp Library Capabilities

The Sharp image processing library (https://sharp.pixelplumbing.com/) can do much more:

### Image Operations
- Resize, crop, rotate, flip, mirror
- Format conversion (JPEG, PNG, WebP, AVIF, etc.)
- Quality/compression control

### Color Adjustments
- `normalize()` - Auto contrast via histogram
- `modulate()` - Brightness, saturation, hue
- `tint()` - Apply color tint
- `grayscale()` - Convert to black & white
- `negate()` - Invert colors
- `linear()` - Linear color transformation
- `gamma()` - Gamma correction

### Effects
- Blur, sharpen
- Median filter (noise reduction)
- Threshold (create binary images)
- Convolve (custom filters)

### Compositing
- Overlay images
- Add watermarks
- Blend multiple images

### Metadata
- Extract EXIF data
- Read/write image metadata
- Get image statistics (dominant colors, etc.)

---

## Troubleshooting

### "Cannot find module 'sharp'"
Run: `npm install sharp`

### Face detection not working
Ensure you've installed: `npm install @vladmandic/face-api canvas`
And downloaded the model files to a `models` folder

### Colors look worse after normalization
Try adjusting the brightness/saturation/contrast parameters:
```javascript
{
  brightness: 0.95,  // Slightly darker
  saturation: 0.9,   // Less saturated
  contrast: 1.05     // Slightly more contrast
}
```

### Batch processing is too slow
Sharp is already very fast. For 100+ photos, consider:
- Running in parallel (process multiple photos simultaneously)
- Using lower quality settings for previews
- Processing overnight for large batches
