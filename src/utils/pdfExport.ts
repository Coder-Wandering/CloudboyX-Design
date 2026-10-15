import { BlockInstance, SiteTheme, SeoSettings } from '../types';
import { generateCompleteHtml } from './htmlGenerator';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  includeCover?: boolean;
  includeSectionHeaders?: boolean;
  paperSize?: 'a4' | 'letter';
  colorMode?: 'color' | 'grayscale';
  zoomLevel?: number;
}

/**
 * Generates a structured printable HTML document leveraging the core HTML generation logic.
 * Enriches the output with print stylesheets, executive specification headers,
 * page-break controls, and structured section outlines.
 */
export function generateStructuredPdfHtml(
  blocks: BlockInstance[],
  theme: SiteTheme,
  projectTitle: string = 'Bootstrap 5 Project',
  seoSettings?: SeoSettings,
  options: PdfExportOptions = {}
): string {
  const {
    includeCover = true,
    includeSectionHeaders = true,
    paperSize = 'a4',
    colorMode = 'color',
  } = options;

  // Leverage the existing html generation logic
  const baseHtml = generateCompleteHtml(blocks, theme, projectTitle, false, null, seoSettings);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const pageSizeRule = paperSize === 'letter' ? 'letter portrait' : 'A4 portrait';

  // Structured print stylesheet
  const printStyles = `
  <style id="studio-structured-pdf-print-styles">
    @page {
      size: ${pageSizeRule};
      margin: 14mm 16mm 16mm 16mm;
    }

    @media screen {
      body.studio-pdf-preview-mode {
        background-color: #f1f5f9;
        padding: 24px;
        color: #1e293b;
      }
      .studio-pdf-document-sheet {
        max-width: 960px;
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        overflow: hidden;
      }
    }

    @media print {
      html, body {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .studio-no-print {
        display: none !important;
      }
      .studio-page-break-before {
        page-break-before: always !important;
        break-before: page !important;
      }
      .studio-avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .studio-pdf-document-sheet {
        box-shadow: none !important;
        border-radius: 0 !important;
        margin: 0 !important;
        max-width: 100% !important;
      }
    }

    /* Monochrome / Greyscale Mode */
    ${
      colorMode === 'grayscale'
        ? `
    html, body, .studio-pdf-document-sheet {
      filter: grayscale(100%) !important;
    }
    `
        : ''
    }

    /* Structured Cover Header Styling */
    .studio-pdf-cover {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 32px 36px;
      border-bottom: 3px solid ${theme.primaryColor || '#2222FF'};
      margin-bottom: 24px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .studio-pdf-cover-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 16px;
    }

    .studio-pdf-brand-badge {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: ${theme.primaryColor || '#2222FF'};
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
    }

    .studio-pdf-date {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #94a3b8;
      text-align: right;
    }

    .studio-pdf-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .studio-pdf-subtitle {
      font-size: 13px;
      color: #cbd5e1;
      margin: 0 0 20px 0;
      max-width: 750px;
      line-height: 1.5;
    }

    .studio-pdf-meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: rgba(15, 23, 42, 0.6);
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 18px;
    }

    .studio-pdf-meta-item {
      display: flex;
      flex-direction: column;
    }

    .studio-pdf-meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 3px;
    }

    .studio-pdf-meta-val {
      font-size: 12px;
      font-weight: 600;
      color: #f8fafc;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }

    /* Structured Section Header Pill */
    .studio-pdf-section-divider {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin-top: 20px;
      margin-bottom: 14px;
      page-break-after: avoid;
      break-after: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .studio-pdf-section-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }

    .studio-pdf-section-num {
      background: #0f172a;
      color: #ffffff;
      padding: 2px 7px;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 10px;
    }

    .studio-pdf-section-category {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #e2e8f0;
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* Ensure block sections do not split awkwardly across pages */
    [data-block-id], section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-bottom: 12px;
    }

    /* Structured Footer */
    .studio-pdf-footer {
      border-top: 1px solid #e2e8f0;
      padding: 16px 24px;
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #94a3b8;
      page-break-inside: avoid;
      break-inside: avoid;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
  </style>
  `;

  // Structured Cover HTML
  const coverHtml = includeCover
    ? `
  <div class="studio-pdf-cover studio-avoid-break">
    <div class="studio-pdf-cover-top">
      <div class="studio-pdf-brand-badge">Bootstrap 5 • Structured Specification</div>
      <div class="studio-pdf-date">${formattedDate} • ${formattedTime}</div>
    </div>
    <h1 class="studio-pdf-title">${projectTitle}</h1>
    <p class="studio-pdf-subtitle">
      ${seoSettings?.description || 'Complete responsive section layout and structured specification document compiled from Bootstrap 5 Visual Studio.'}
    </p>
    <div class="studio-pdf-meta-grid">
      <div class="studio-pdf-meta-item">
        <span class="studio-pdf-meta-label">Total Sections</span>
        <span class="studio-pdf-meta-val">${blocks.length} Blocks</span>
      </div>
      <div class="studio-pdf-meta-item">
        <span class="studio-pdf-meta-label">Primary Color</span>
        <span class="studio-pdf-meta-val" style="display:flex;align-items:center;gap:4px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${theme.primaryColor || '#2222FF'};"></span>
          ${theme.primaryColor || '#2222FF'}
        </span>
      </div>
      <div class="studio-pdf-meta-item">
        <span class="studio-pdf-meta-label">Font Family</span>
        <span class="studio-pdf-meta-val">${theme.fontFamily || 'System Default'}</span>
      </div>
      <div class="studio-pdf-meta-item">
        <span class="studio-pdf-meta-label">Framework</span>
        <span class="studio-pdf-meta-val">Bootstrap 5.3.3</span>
      </div>
    </div>

    <!-- Table of Contents Outline -->
    <div style="background: rgba(0,0,0,0.25); border-radius: 6px; padding: 10px 14px; font-size: 11px;">
      <div style="color: #94a3b8; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em;">Section Hierarchy</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${blocks
          .map(
            (b, i) => `
          <span style="background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px; color: #e2e8f0; font-family: ui-monospace, monospace; font-size: 10px;">
            <strong style="color: ${theme.primaryColor || '#60a5fa'};">#${i + 1}</strong> ${b.name || b.type}
          </span>
        `
          )
          .join('')}
      </div>
    </div>
  </div>
  `
    : '';

  // Structured Footer HTML
  const footerHtml = `
  <div class="studio-pdf-footer studio-avoid-break">
    <div>
      <strong>${projectTitle}</strong> • Structured Layout Document
    </div>
    <div>
      Page generated with Bootstrap 5 Visual Studio • Page Size: ${paperSize.toUpperCase()}
    </div>
  </div>
  `;

  // Inject print styles before </head>
  let enhancedHtml = baseHtml.replace('</head>', `${printStyles}\n</head>`);

  // Wrap body contents into a structured printable container
  const bodyOpenMatch = enhancedHtml.match(/<body[^>]*>/i);
  if (bodyOpenMatch) {
    const bodyTag = bodyOpenMatch[0];

    // If section headers are enabled, inject divider banners before each block
    if (includeSectionHeaders && blocks.length > 0) {
      blocks.forEach((block, index) => {
        const blockIdRegex = new RegExp(`(<[^>]*data-block-id=["']${block.id}["'][^>]*>)`, 'i');
        const dividerHtml = `
          <div class="studio-pdf-section-divider studio-avoid-break">
            <div class="studio-pdf-section-badge">
              <span class="studio-pdf-section-num">#${index + 1}</span>
              <span>${block.name || block.type}</span>
            </div>
            <span class="studio-pdf-section-category">${block.category || 'content'}</span>
          </div>
        `;
        enhancedHtml = enhancedHtml.replace(blockIdRegex, `${dividerHtml}\n$1`);
      });
    }

    enhancedHtml = enhancedHtml.replace(
      bodyTag,
      `${bodyTag}\n<div class="studio-pdf-document-sheet">\n${coverHtml}`
    );
    enhancedHtml = enhancedHtml.replace('</body>', `${footerHtml}\n</div>\n</body>`);
  }

  return enhancedHtml;
}

/**
 * Invokes the browser's native print engine via a dedicated hidden iframe.
 * Delivers vector-crisp PDF output with selectable text and exact styling.
 */
export function printStructuredPdf(htmlContent: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Remove any preexisting print iframe
    const existingFrame = document.getElementById('studio-structured-print-frame');
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'studio-structured-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    iframe.onload = () => {
      // Allow fonts and stylesheet assets to settle before invoking print
      setTimeout(() => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          console.error('Print iframe invocation failed:', e);
          resolve(false);
        }
      }, 500);
    };

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    } else {
      resolve(false);
    }
  });
}

/**
 * Downloads a direct structured .pdf file using jsPDF and html2canvas.
 */
export async function downloadDirectPdf(
  containerEl: HTMLElement,
  fileName: string = 'project-document'
): Promise<void> {
  const canvas = await html2canvas(containerEl, {
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: 1024,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / imgWidth;
  const totalPdfHeight = imgHeight * ratio;

  let heightLeft = totalPdfHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Subsequent pages if content overflows
  while (heightLeft > 0) {
    position = heightLeft - totalPdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  const safeName = `${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'document'}.pdf`;
  pdf.save(safeName);
}
