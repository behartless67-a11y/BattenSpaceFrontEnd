const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Analyzes staff photos to identify framing issues
 * - Photos that are too zoomed in (portrait/tight crops)
 * - Photos with unusual aspect ratios
 */

async function analyzePhotoFraming(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    const { width, height } = metadata;
    const aspectRatio = width / height;

    // The card displays at roughly 4:3 ratio (width varies, height is 256px)
    // Typical portrait aspect ratios:
    // - 3:4 (0.75) - standard portrait
    // - 2:3 (0.67) - closer crop
    // - 1:1 (1.0) - square (often indicates tight crop)
    // - 4:5 (0.8) - Instagram portrait

    const issues = [];

    // Check if image is square or nearly square (tight crop)
    if (aspectRatio >= 0.9 && aspectRatio <= 1.1) {
      issues.push('Square/tight crop - likely shows only face');
    }

    // Check if image is very tall (extreme portrait)
    if (aspectRatio < 0.6) {
      issues.push('Very tall portrait - may be too zoomed in');
    }

    // Check if image is landscape (unusual for portraits)
    if (aspectRatio > 1.4) {
      issues.push('Landscape orientation - may show too much background');
    }

    // Check resolution
    if (width < 400 || height < 400) {
      issues.push('Low resolution - may appear pixelated');
    }

    // Very high resolution
    if (width > 5000 || height > 5000) {
      issues.push('Very high resolution - consider resizing for performance');
    }

    return {
      filename: path.basename(inputPath),
      width,
      height,
      aspectRatio: aspectRatio.toFixed(2),
      issues,
      score: issues.length === 0 ? 'Good' : issues.length === 1 ? 'Fair' : 'Poor'
    };

  } catch (error) {
    return {
      filename: path.basename(inputPath),
      error: error.message
    };
  }
}

async function analyzeAllPhotos() {
  const photosDir = path.join(__dirname, '../public/staff-photos');
  const files = fs.readdirSync(photosDir);

  // Only analyze current photos (not originals or enhanced versions)
  const photoFiles = files.filter(f =>
    /\.(jpe?g|png)$/i.test(f) &&
    !f.includes('_original') &&
    !f.includes('_enhanced') &&
    !f.includes('_new') &&
    !f.includes('_cropped')
  );

  console.log(`Analyzing ${photoFiles.length} staff photos...\n`);
  console.log('=' .repeat(80));

  const results = [];

  for (const file of photoFiles) {
    const result = await analyzePhotoFraming(path.join(photosDir, file));
    results.push(result);
  }

  // Sort by number of issues (worst first)
  results.sort((a, b) => {
    const issuesA = a.issues ? a.issues.length : 0;
    const issuesB = b.issues ? b.issues.length : 0;
    return issuesB - issuesA;
  });

  // Print results
  console.log('\n📊 FRAMING ANALYSIS RESULTS\n');

  // Photos with issues
  const photosWithIssues = results.filter(r => r.issues && r.issues.length > 0);

  if (photosWithIssues.length > 0) {
    console.log(`\n⚠️  PHOTOS WITH FRAMING ISSUES (${photosWithIssues.length})\n`);
    console.log('=' .repeat(80));

    photosWithIssues.forEach(result => {
      console.log(`\n${result.filename}`);
      console.log(`  Size: ${result.width}x${result.height}`);
      console.log(`  Aspect Ratio: ${result.aspectRatio} (${getAspectRatioDescription(parseFloat(result.aspectRatio))})`);
      console.log(`  Score: ${result.score}`);
      if (result.issues.length > 0) {
        console.log(`  Issues:`);
        result.issues.forEach(issue => {
          console.log(`    - ${issue}`);
        });
      }
    });
  }

  // Summary by issue type
  console.log('\n\n📈 SUMMARY BY ISSUE TYPE\n');
  console.log('=' .repeat(80));

  const issueTypes = {};
  results.forEach(r => {
    if (r.issues) {
      r.issues.forEach(issue => {
        if (!issueTypes[issue]) {
          issueTypes[issue] = [];
        }
        issueTypes[issue].push(r.filename);
      });
    }
  });

  Object.keys(issueTypes).forEach(issueType => {
    console.log(`\n${issueType}: ${issueTypes[issueType].length} photos`);
    issueTypes[issueType].forEach(filename => {
      console.log(`  - ${filename}`);
    });
  });

  // Good photos
  const goodPhotos = results.filter(r => r.issues && r.issues.length === 0);
  console.log(`\n\n✅ PHOTOS WITH GOOD FRAMING: ${goodPhotos.length}\n`);

  // Overall stats
  console.log('\n\n📊 OVERALL STATISTICS\n');
  console.log('=' .repeat(80));
  console.log(`Total photos analyzed: ${results.length}`);
  console.log(`Photos with issues: ${photosWithIssues.length}`);
  console.log(`Photos with good framing: ${goodPhotos.length}`);
  console.log(`Success rate: ${((goodPhotos.length / results.length) * 100).toFixed(1)}%`);
}

function getAspectRatioDescription(ratio) {
  if (ratio >= 0.9 && ratio <= 1.1) return 'Square';
  if (ratio >= 0.7 && ratio <= 0.85) return 'Portrait';
  if (ratio >= 0.6 && ratio < 0.7) return 'Tall Portrait';
  if (ratio < 0.6) return 'Very Tall Portrait';
  if (ratio > 1.1 && ratio <= 1.4) return 'Landscape-ish';
  if (ratio > 1.4) return 'Landscape';
  return 'Unusual';
}

analyzeAllPhotos();
