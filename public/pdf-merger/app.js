// PDF Merger Tool - Main Application Logic

class PDFMergerApp {
    constructor() {
        this.files = [];
        this.draggedItem = null;

        // Limits for warnings
        this.WARN_FILE_COUNT = 50;
        this.WARN_TOTAL_SIZE_MB = 100;

        // File type mappings
        this.fileTypes = {
            // PDFs
            'application/pdf': 'pdf',
            // Images
            'image/png': 'image',
            'image/jpeg': 'image',
            'image/gif': 'image',
            'image/bmp': 'image',
            'image/webp': 'image',
            // Word documents
            'application/msword': 'word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
            // Excel
            'application/vnd.ms-excel': 'excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
            'text/csv': 'excel',
            // PowerPoint
            'application/vnd.ms-powerpoint': 'powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'powerpoint',
            // Text
            'text/plain': 'text',
            'text/rtf': 'text',
            'application/rtf': 'text',
            // OpenDocument
            'application/vnd.oasis.opendocument.text': 'word',
            'application/vnd.oasis.opendocument.spreadsheet': 'excel',
            'application/vnd.oasis.opendocument.presentation': 'powerpoint'
        };

        // DOM Elements
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.filesSection = document.getElementById('filesSection');
        this.fileList = document.getElementById('fileList');
        this.fileCount = document.getElementById('fileCount');
        this.actions = document.getElementById('actions');
        this.clearBtn = document.getElementById('clearBtn');
        this.mergeBtn = document.getElementById('mergeBtn');
        this.progressOverlay = document.getElementById('progressOverlay');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.outputOptions = document.getElementById('outputOptions');
        this.outputFilename = document.getElementById('outputFilename');

        this.init();
    }

    init() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop on upload zone
        this.uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.classList.add('dragover');
        });

        this.uploadZone.addEventListener('dragleave', () => {
            this.uploadZone.classList.remove('dragover');
        });

        this.uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click on upload zone
        this.uploadZone.addEventListener('click', (e) => {
            if (e.target !== this.fileInput && !e.target.closest('.upload-btn')) {
                this.fileInput.click();
            }
        });

        // Action buttons
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.mergeBtn.addEventListener('click', () => this.mergePDF());
    }

    getFileCategory(file) {
        // Check by MIME type first
        if (this.fileTypes[file.type]) {
            return this.fileTypes[file.type];
        }

        // Fallback to extension
        const ext = file.name.split('.').pop().toLowerCase();
        const extMap = {
            'pdf': 'pdf',
            'png': 'image', 'jpg': 'image', 'jpeg': 'image', 'gif': 'image', 'bmp': 'image', 'webp': 'image',
            'doc': 'word', 'docx': 'word', 'odt': 'word',
            'xls': 'excel', 'xlsx': 'excel', 'csv': 'excel', 'ods': 'excel',
            'ppt': 'powerpoint', 'pptx': 'powerpoint', 'odp': 'powerpoint',
            'txt': 'text', 'rtf': 'text'
        };

        return extMap[ext] || null;
    }

    handleFiles(fileList) {
        for (const file of fileList) {
            const category = this.getFileCategory(file);
            if (category) {
                this.files.push({
                    id: Date.now() + Math.random(),
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    category: category
                });
            }
        }

        this.fileInput.value = '';
        this.renderFileList();
        this.checkLimitsWarning();
    }

    checkLimitsWarning() {
        const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);
        const totalSizeMB = totalSize / (1024 * 1024);
        const fileCount = this.files.length;

        const warnings = [];

        if (fileCount > this.WARN_FILE_COUNT) {
            warnings.push(`${fileCount} files uploaded`);
        }

        if (totalSizeMB > this.WARN_TOTAL_SIZE_MB) {
            warnings.push(`${totalSizeMB.toFixed(1)} MB total size`);
        }

        // Remove existing warning if present
        const existingWarning = document.querySelector('.size-warning');
        if (existingWarning) {
            existingWarning.remove();
        }

        if (warnings.length > 0) {
            const warningEl = document.createElement('div');
            warningEl.className = 'size-warning';
            warningEl.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span><strong>Performance Warning:</strong> ${warnings.join(', ')}. Processing may be slow or cause browser issues.</span>
            `;
            this.filesSection.insertBefore(warningEl, this.filesSection.querySelector('.drag-hint'));
        }
    }

    getFileIcon(category) {
        // Official-style icons with brand colors
        const icons = {
            pdf: {
                bg: '#FF0000',
                color: '#ffffff',
                label: 'PDF',
                labelColor: '#ffffff'
            },
            word: {
                bg: '#2B579A',
                color: '#ffffff',
                label: 'W',
                labelColor: '#ffffff'
            },
            excel: {
                bg: '#217346',
                color: '#ffffff',
                label: 'X',
                labelColor: '#ffffff'
            },
            powerpoint: {
                bg: '#D24726',
                color: '#ffffff',
                label: 'P',
                labelColor: '#ffffff'
            },
            text: {
                bg: '#6B7280',
                color: '#ffffff',
                label: 'TXT',
                labelColor: '#ffffff'
            },
            image: {
                bg: '#8B5CF6',
                color: '#ffffff',
                label: 'IMG',
                labelColor: '#ffffff'
            }
        };
        return icons[category] || icons.text;
    }

    renderFileList() {
        this.fileList.innerHTML = '';

        this.files.forEach((fileData, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.draggable = true;
            li.dataset.index = index;

            const iconInfo = this.getFileIcon(fileData.category);
            const isImage = fileData.category === 'image';

            li.innerHTML = `
                <div class="page-number">${index + 1}</div>
                <div class="drag-handle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="6" r="1.5"/>
                        <circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/>
                        <circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/>
                        <circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="file-preview file-preview-icon" id="preview-${fileData.id}" style="background: ${iconInfo.bg};">
                    <span class="file-type-label">${iconInfo.label}</span>
                </div>
                <div class="file-info">
                    <div class="file-name">${this.escapeHtml(fileData.name)}</div>
                    <div class="file-size">${this.formatSize(fileData.size)}</div>
                </div>
                <button class="file-remove" data-id="${fileData.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;

            // Add drag events
            li.addEventListener('dragstart', (e) => this.handleDragStart(e, index));
            li.addEventListener('dragend', () => this.handleDragEnd());
            li.addEventListener('dragover', (e) => this.handleDragOver(e));
            li.addEventListener('drop', (e) => this.handleDrop(e, index));

            // Remove button
            li.querySelector('.file-remove').addEventListener('click', () => this.removeFile(fileData.id));

            this.fileList.appendChild(li);

            // Load image preview
            if (isImage) {
                this.loadImagePreview(fileData);
            }
        });

        this.updateUI();
    }

    loadImagePreview(fileData) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewEl = document.getElementById(`preview-${fileData.id}`);
            if (previewEl) {
                previewEl.style.background = 'transparent';
                previewEl.classList.remove('file-preview-icon');
                previewEl.innerHTML = `<img src="${e.target.result}" alt="${this.escapeHtml(fileData.name)}">`;
            }
        };
        reader.readAsDataURL(fileData.file);
    }

    handleDragStart(e, index) {
        this.draggedItem = index;
        e.target.classList.add('dragging');
    }

    handleDragEnd() {
        this.draggedItem = null;
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('dragging', 'drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        const item = e.target.closest('.file-item');
        if (item && this.draggedItem !== null) {
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('drag-over'));
            item.classList.add('drag-over');
        }
    }

    handleDrop(e, targetIndex) {
        e.preventDefault();
        if (this.draggedItem !== null && this.draggedItem !== targetIndex) {
            const [draggedFile] = this.files.splice(this.draggedItem, 1);
            this.files.splice(targetIndex, 0, draggedFile);
            this.renderFileList();
        }
    }

    removeFile(id) {
        this.files = this.files.filter(f => f.id !== id);
        this.renderFileList();
        this.checkLimitsWarning();
    }

    clearAll() {
        this.files = [];
        this.renderFileList();
        this.checkLimitsWarning();
    }

    updateUI() {
        const hasFiles = this.files.length > 0;
        const totalSize = this.files.reduce((sum, f) => sum + f.size, 0);

        this.filesSection.classList.toggle('visible', hasFiles);
        this.outputOptions.classList.toggle('visible', hasFiles);
        this.actions.classList.toggle('visible', hasFiles);

        // Show file count and total size
        const sizeStr = this.formatSize(totalSize);
        this.fileCount.textContent = `${this.files.length} file${this.files.length !== 1 ? 's' : ''} (${sizeStr})`;
    }

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showProgress(show) {
        this.progressOverlay.hidden = !show;
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    // Convert Word document to PDF pages
    async convertWordToPdfPages(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // Wrap with proper styling and margins
        const styledHtml = `
            <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000;">
                ${html}
            </div>
        `;

        return await this.htmlToPdfPages(styledHtml, file.name);
    }

    // Convert Excel to PDF pages
    async convertExcelToPdfPages(file) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        let html = '<div style="font-family: Arial, sans-serif; font-size: 10pt; color: #000;">';

        workbook.SheetNames.forEach((sheetName, idx) => {
            const worksheet = workbook.Sheets[sheetName];
            const sheetHtml = XLSX.utils.sheet_to_html(worksheet, { header: '' });

            if (idx > 0) {
                html += '<div style="page-break-before: always;"></div>';
            }
            html += `<h2 style="color: #232D4B; margin-bottom: 12px; font-size: 14pt;">${this.escapeHtml(sheetName)}</h2>`;
            html += `<div>${sheetHtml}</div>`;
        });

        html += '</div>';

        // Add table styling
        html = html.replace(/<table/g, '<table style="border-collapse: collapse; width: auto; margin-bottom: 16px; font-size: 10pt;"');
        html = html.replace(/<td/g, '<td style="border: 1px solid #ccc; padding: 6px 10px; text-align: left;"');
        html = html.replace(/<th/g, '<th style="border: 1px solid #ccc; padding: 6px 10px; text-align: left; background: #f0f0f0; font-weight: bold;"');

        return await this.htmlToPdfPages(html, file.name);
    }

    // Convert PowerPoint to PDF pages (basic support - extracts text)
    async convertPowerPointToPdfPages(file) {
        let html = `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #000;">
                <div style="margin-top: 200px;">
                    <h1 style="color: #232D4B; font-size: 24pt; margin-bottom: 24px;">PowerPoint Presentation</h1>
                    <p style="color: #666; font-size: 14pt;">${this.escapeHtml(file.name)}</p>
                    <p style="color: #999; margin-top: 40px; font-size: 11pt;">
                        Note: PowerPoint files are converted with basic formatting.<br>
                        For best results, export your presentation as PDF first.
                    </p>
                </div>
            </div>
        `;

        return await this.htmlToPdfPages(html, file.name);
    }

    // Convert text file to PDF pages
    async convertTextToPdfPages(file) {
        const text = await file.text();
        const html = `
            <div style="font-family: 'Courier New', Consolas, monospace; font-size: 10pt; line-height: 1.6; white-space: pre-wrap; color: #000;">
${this.escapeHtml(text)}
            </div>
        `;

        return await this.htmlToPdfPages(html, file.name);
    }

    // Convert HTML content to PDF and return as array buffer
    async htmlToPdfPages(html, filename) {
        const { jsPDF } = window.jspdf;

        // A4 dimensions in mm
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 25.4; // 1 inch (APA standard) margins on all sides
        const contentWidth = pageWidth - (margin * 2); // 170mm content width

        // Create a temporary container with proper width for rendering
        const container = document.createElement('div');
        // Convert mm to px (assuming 96 DPI: 1mm ≈ 3.78px, but we use a ratio that works well)
        const containerWidthPx = contentWidth * 3.78; // ~642px for content area
        container.style.cssText = `position: absolute; left: -9999px; top: 0; width: ${containerWidthPx}px; background: white; padding: 0;`;
        container.innerHTML = html;
        document.body.appendChild(container);

        try {
            // Use html2canvas to render
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Calculate dimensions
            const imgWidth = contentWidth; // Content width in mm (with margins)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageContentHeight = pageHeight - (margin * 2); // Available height per page

            let heightLeft = imgHeight;
            let position = margin; // Start at top margin
            let currentPage = 0;

            // For multi-page content, we need to slice the image
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            while (heightLeft > 0) {
                if (currentPage > 0) {
                    pdf.addPage();
                }

                // Calculate the y position for slicing (negative for subsequent pages)
                const yOffset = currentPage === 0 ? 0 : -(currentPage * pageContentHeight);

                pdf.addImage(
                    imgData,
                    'JPEG',
                    margin, // x position (left margin)
                    margin + yOffset, // y position
                    imgWidth,
                    imgHeight
                );

                heightLeft -= pageContentHeight;
                currentPage++;
            }

            // Return as array buffer
            const pdfOutput = pdf.output('arraybuffer');
            return pdfOutput;

        } finally {
            document.body.removeChild(container);
        }
    }

    async mergePDF() {
        if (this.files.length === 0) return;

        const btnText = this.mergeBtn.querySelector('.btn-text');
        const btnLoading = this.mergeBtn.querySelector('.btn-loading');

        try {
            this.mergeBtn.disabled = true;
            btnText.hidden = true;
            btnLoading.hidden = false;
            this.showProgress(true);
            this.updateProgress(0, 'Initializing...');

            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            const totalFiles = this.files.length;

            for (let i = 0; i < this.files.length; i++) {
                const fileData = this.files[i];
                const progress = Math.round(((i / totalFiles) * 80) + 10);
                this.updateProgress(progress, `Processing ${fileData.name}...`);

                try {
                    if (fileData.category === 'pdf') {
                        // Handle PDF
                        const arrayBuffer = await fileData.file.arrayBuffer();
                        const pdfDoc = await PDFDocument.load(arrayBuffer);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));

                    } else if (fileData.category === 'image') {
                        // Handle images
                        await this.addImageToPdf(mergedPdf, fileData);

                    } else if (fileData.category === 'word') {
                        // Handle Word documents
                        const pdfBytes = await this.convertWordToPdfPages(fileData.file);
                        const pdfDoc = await PDFDocument.load(pdfBytes);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));

                    } else if (fileData.category === 'excel') {
                        // Handle Excel
                        const pdfBytes = await this.convertExcelToPdfPages(fileData.file);
                        const pdfDoc = await PDFDocument.load(pdfBytes);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));

                    } else if (fileData.category === 'powerpoint') {
                        // Handle PowerPoint
                        const pdfBytes = await this.convertPowerPointToPdfPages(fileData.file);
                        const pdfDoc = await PDFDocument.load(pdfBytes);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));

                    } else if (fileData.category === 'text') {
                        // Handle text files
                        const pdfBytes = await this.convertTextToPdfPages(fileData.file);
                        const pdfDoc = await PDFDocument.load(pdfBytes);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));
                    }
                } catch (fileError) {
                    console.error(`Error processing ${fileData.name}:`, fileError);
                    // Add an error page for this file
                    const page = mergedPdf.addPage([595, 842]); // A4 size in points
                    const { rgb } = PDFLib;
                    page.drawText(`Error processing: ${fileData.name}`, {
                        x: 72,
                        y: 750,
                        size: 16,
                        color: rgb(0.8, 0.2, 0.2)
                    });
                    page.drawText(`${fileError.message}`, {
                        x: 72,
                        y: 720,
                        size: 12,
                        color: rgb(0.5, 0.5, 0.5)
                    });
                }
            }

            this.updateProgress(90, 'Generating PDF...');

            const pdfBytes = await mergedPdf.save();

            this.updateProgress(100, 'Complete!');

            // Download the merged PDF
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Use custom filename or default
            const filename = this.outputFilename.value.trim() || 'merged-document';
            // Sanitize filename (remove invalid characters)
            const safeFilename = filename.replace(/[<>:"/\\|?*]/g, '');
            link.download = `${safeFilename}.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            setTimeout(() => {
                this.showProgress(false);
            }, 500);

        } catch (error) {
            console.error('Error merging PDFs:', error);
            alert('Error creating PDF: ' + error.message);
            this.showProgress(false);
        } finally {
            this.mergeBtn.disabled = false;
            btnText.hidden = false;
            btnLoading.hidden = true;
        }
    }

    async addImageToPdf(mergedPdf, fileData) {
        const arrayBuffer = await fileData.file.arrayBuffer();

        let image;
        if (fileData.type === 'image/png') {
            image = await mergedPdf.embedPng(arrayBuffer);
        } else if (fileData.type === 'image/jpeg' || fileData.type === 'image/jpg') {
            image = await mergedPdf.embedJpg(arrayBuffer);
        } else {
            // Convert other image types to PNG via canvas
            const pngData = await this.convertImageToPng(fileData.file);
            image = await mergedPdf.embedPng(pngData);
        }

        // A4 dimensions in points
        const pageWidth = 595;
        const pageHeight = 842;
        const margin = 72; // 1 inch (APA standard) margin in points

        const imgDims = image.scale(1);
        let width = imgDims.width;
        let height = imgDims.height;

        // Calculate max dimensions with margins
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);

        // Scale down if larger than content area
        if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
        }

        // Center the image on an A4 page
        const page = mergedPdf.addPage([pageWidth, pageHeight]);
        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        page.drawImage(image, {
            x: x,
            y: y,
            width: width,
            height: height
        });
    }

    convertImageToPng(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    blob.arrayBuffer().then(resolve).catch(reject);
                }, 'image/png');
            };

            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PDFMergerApp();
});
