# PDF Merger Tool Integration - December 10, 2024

## Summary
Integrated the standalone PDF Merger tool into the BattenSpaceFrontEnd project, adding it to the main tools grid and ensuring consistent styling with the rest of the site.

## Changes Made

### 1. Added PDF Merger to Main Page Tools Grid
**File:** `src/app/page.tsx`

- Added new tool entry with id "5" under "Productivity" category
- Tool links to `/pdf-merger/` internal route
- Uses "file" icon (FileText from lucide-react)

### 2. Tool Card Layout Updates
**File:** `src/app/page.tsx`

- Changed grid from 2-column to 3-column layout on large screens (`lg:grid-cols-3`)
- Made tool cards more compact:
  - Reduced padding from `p-6` to `p-4`
  - Reduced icon size from `w-16 h-16` to `w-12 h-12`
  - Reduced text sizes (titles from `text-lg` to `text-base`, descriptions from `text-sm` to `text-xs`)
  - Reduced margins and border-radius accordingly

### 3. PDF Merger Tool Files
**Location:** `public/pdf-merger/`

Files added:
- `index.html` - Main HTML with Batten Space header/footer
- `app.js` - PDF merging application logic (693 lines)
- `styles.css` - Styling with UVA brand colors
- `garrett-hall-sunset.jpg` - Background image (grayscale)
- `lib/` - Local JavaScript libraries:
  - `pdf-lib.min.js` - PDF manipulation
  - `mammoth.browser.min.js` - Word document conversion
  - `xlsx.full.min.js` - Excel file parsing
  - `html2canvas.min.js` - HTML to canvas rendering
  - `jspdf.umd.min.js` - PDF generation

### 4. Styling Updates for PDF Merger
**File:** `public/pdf-merger/styles.css`

Added site-wide styling to match BattenSpaceFrontEnd:
- **Site Header:** Navy background with "The Batten Space" branding and "Back to Tools" button
- **Page Header:** Tool title and description
- **Site Footer:** Navy background with Batten School logo, links to batten.virginia.edu and battensupport@virginia.edu
- **Background:** Grayscale garrett-hall-sunset.jpg with white overlay
- **Responsive:** Mobile-friendly header/footer layouts

### 5. Library Loading Fix
**Issue:** External CDN scripts were being blocked by Azure Static Web Apps CSP

**Solution:** Downloaded all required JavaScript libraries locally to `public/pdf-merger/lib/` directory instead of loading from CDNs (unpkg, cdnjs).

### 6. Email Address Standardization
Updated footer email from `battenspace@virginia.edu` to `battensupport@virginia.edu` for consistency with main site.

## PDF Merger Features
- Drag-and-drop file upload
- Support for multiple file types:
  - PDF files
  - Images (PNG, JPG, GIF, BMP, WebP)
  - Word documents (.doc, .docx, .odt)
  - Excel spreadsheets (.xls, .xlsx, .csv, .ods)
  - PowerPoint presentations (.ppt, .pptx, .odp)
  - Text files (.txt, .rtf)
- Drag-to-reorder files before merging
- Custom output filename
- Progress indicator during PDF creation
- Size warnings for large files (>50 files or >100MB)

## Git Commits
1. `Add PDF Merger tool to main page` - Initial tool entry and files
2. `Update PDF Merger with Batten Space header/footer and compact tool cards` - Styling updates
3. `Fix PDF library loading - switch to cdnjs CDN and add library check` - CDN attempt
4. `Bundle PDF libraries locally to avoid CDN blocking` - Final fix with local libraries
5. `Fix email address to battensupport@virginia.edu` - Email standardization

## Technical Notes
- PDF Merger is a standalone vanilla JavaScript application (no React)
- Libraries are bundled locally (~2.5MB total) to avoid CSP issues
- Tool is accessible without authentication (static files in public folder)
- Background image is shared with main site (copied to pdf-merger folder)
