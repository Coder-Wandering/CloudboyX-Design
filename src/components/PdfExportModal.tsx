import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Palette,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings } from '../types';
import {
  generateStructuredPdfHtml,
  printStructuredPdf,
  downloadDirectPdf,
  PdfExportOptions,
} from '../utils/pdfExport';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockInstance[];
  theme: SiteTheme;
  projectTitle: string;
  seoSettings?: SeoSettings;
  themeMode?: 'light' | 'dark';
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  theme,
  projectTitle,
  seoSettings,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';

  // Export options state
  const [includeCover, setIncludeCover] = useState<boolean>(true);
  const [includeSectionHeaders, setIncludeSectionHeaders] = useState<boolean>(true);
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale'>('color');
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);

  const [isGeneratingDirectPdf, setIsGeneratingDirectPdf] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Generate structured printable HTML based on current options
  const printableHtml = useMemo(() => {
    return generateStructuredPdfHtml(blocks, theme, projectTitle, seoSettings, {
      includeCover,
      includeSectionHeaders,
      paperSize,
      colorMode,
    });
  }, [blocks, theme, projectTitle, seoSettings, includeCover, includeSectionHeaders, paperSize, colorMode]);

  if (!isOpen) return null;

  const handlePrintToPdf = async () => {
    setIsPrinting(true);
    setStatusMessage({
      type: 'info',
      text: 'Preparing print document... In the browser print dialog, choose "Save as PDF" to export.',
    });

    try {
      await printStructuredPdf(printableHtml);
      setStatusMessage({
        type: 'success',
        text: 'Print dialog opened! Select "Save as PDF" destination.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadDirectPdf = async () => {
    setIsGeneratingDirectPdf(true);
    setStatusMessage({
      type: 'info',
      text: 'Compiling high-resolution PDF pages...',
    });

    try {
      // Create temporary offscreen container with printable HTML
      const tempWrapper = document.createElement('div');
      tempWrapper.style.position = 'fixed';
      tempWrapper.style.left = '-9999px';
      tempWrapper.style.top = '0';
      tempWrapper.style.width = '1024px';
      tempWrapper.style.background = '#ffffff';
      tempWrapper.style.zIndex = '-9999';

      // Extract body content from printableHtml
      const bodyContentMatch = printableHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const headStylesMatch = printableHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);

      if (headStylesMatch) {
        tempWrapper.innerHTML += headStylesMatch[1];
      }
      if (bodyContentMatch) {
        tempWrapper.innerHTML += bodyContentMatch[1];
      } else {
        tempWrapper.innerHTML = printableHtml;
      }

      document.body.appendChild(tempWrapper);

      // Wait 300ms for images/styles
      await new Promise((r) => setTimeout(r, 300));

      await downloadDirectPdf(tempWrapper, `${projectTitle || 'project'}-structured-specification`);

      document.body.removeChild(tempWrapper);

      setStatusMessage({
        type: 'success',
        text: 'Direct PDF document downloaded successfully!',
      });
    } catch (err) {
      console.error('Failed to generate direct PDF:', err);
      // Fallback to print method
      await handlePrintToPdf();
    } finally {
      setIsGeneratingDirectPdf(false);
    }
  };

  const handleDownloadPrintableHtml = () => {
    const blob = new Blob([printableHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'project'}-printable.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'success',
      text: 'Standalone printable HTML downloaded for offline PDF conversion!',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-export-modal-title"
    >
      <div
        className={`w-full max-w-6xl h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="pdf-export-modal-title" className="text-base sm:text-lg font-bold tracking-tight">
                  Export Structured PDF Document
                </h2>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                  Print Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Leverages the existing HTML compilation engine with print stylesheets and structured specification headers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            aria-label="Close PDF export dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Settings & Right Live Document Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Settings and Actions */}
          <div
            className={`w-full lg:w-96 p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r overflow-y-auto shrink-0 ${
              isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div className="space-y-5">
              {/* Status Alert if triggered */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border animate-in fade-in duration-150 ${
                    statusMessage.type === 'success'
                      ? isDark
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isDark
                      ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{statusMessage.text}</span>
                </div>
              )}

              {/* Document Summary Card */}
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Target Project</span>
                  <span className="font-bold text-white max-w-[180px] truncate">{projectTitle}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Sections</span>
                  <span className="font-mono text-blue-400 font-bold">{blocks.length} Blocks</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Primary Color</span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span
                      className="w-3 h-3 rounded-xs border border-white/20 inline-block"
                      style={{ backgroundColor: theme.primaryColor || '#2222FF' }}
                    />
                    {theme.primaryColor || '#2222FF'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Framework</span>
                  <span className="font-mono text-emerald-400 text-[11px]">Bootstrap 5.3.3</span>
                </div>
              </div>

              {/* Formatting & Structure Options */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Document Structure
                </div>

                {/* Option 1: Executive Cover Page */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    includeCover
                      ? isDark
                        ? 'bg-blue-950/30 border-blue-500/40 text-white'
                        : 'bg-blue-50/80 border-blue-300 text-blue-950'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeCover}
                    onChange={(e) => setIncludeCover(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <div className="font-semibold">Executive Specification Cover</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Adds project metadata, palette preview, and a visual section table of contents.
                    </div>
                  </div>
                </label>

                {/* Option 2: Section Divider Badges */}
                <label
                  className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                    includeSectionHeaders
                      ? isDark
                        ? 'bg-blue-950/30 border-blue-500/40 text-white'
                        : 'bg-blue-50/80 border-blue-300 text-blue-950'
                      : isDark
                      ? 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeSectionHeaders}
                    onChange={(e) => setIncludeSectionHeaders(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <div className="font-semibold">Section Hierarchy Badges</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Prefixes each block with a structured `#Index` label and category marker.
                    </div>
                  </div>
                </label>
              </div>

              {/* Print Paper Format & Color Options */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paper & Color Output
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Paper Size */}
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Paper Format</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value as 'a4' | 'letter')}
                      className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="a4">ISO A4 (Standard)</option>
                      <option value="letter">US Letter</option>
                    </select>
                  </div>

                  {/* Color Mode */}
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 block">Color Scheme</label>
                    <select
                      value={colorMode}
                      onChange={(e) => setColorMode(e.target.value as 'color' | 'grayscale')}
                      className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="color">Full Color Palette</option>
                      <option value="grayscale">Ink-Friendly Mono</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Action Buttons */}
            <div className="pt-4 border-t border-slate-800/60 space-y-2 mt-4">
              {/* Primary: Save as PDF / Print */}
              <button
                type="button"
                id="btn-confirm-save-pdf"
                onClick={handlePrintToPdf}
                disabled={isPrinting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/30 transition cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Print Dialog...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Save as PDF / Print</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Secondary: Download Direct .pdf File */}
                <button
                  type="button"
                  id="btn-download-direct-pdf"
                  onClick={handleDownloadDirectPdf}
                  disabled={isGeneratingDirectPdf}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer disabled:opacity-50 ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                  title="Directly compile and download a .pdf document file"
                >
                  {isGeneratingDirectPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download .pdf</span>
                    </>
                  )}
                </button>

                {/* Tertiary: Download Printable HTML */}
                <button
                  type="button"
                  onClick={handleDownloadPrintableHtml}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                  title="Download standalone printable HTML file"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print HTML</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 pt-1">
                Tip: In the print dialog, select <strong>"Save as PDF"</strong> for 100% crisp vector output.
              </p>
            </div>
          </div>

          {/* Right Column: Live Printable Document Preview */}
          <div className="flex-1 flex flex-col bg-slate-950/80 relative overflow-hidden">
            {/* Preview Toolbar */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-950 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Printable Document Preview</span>
                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {paperSize.toUpperCase()} Portrait
                </span>
                {colorMode === 'grayscale' && (
                  <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/80">
                    Monochrome
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono w-10 text-center text-slate-300">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(0.85)}
                  className="p-1 rounded hover:bg-slate-800 hover:text-white transition cursor-pointer ml-1"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Document Viewport */}
            <div
              ref={previewContainerRef}
              className="flex-1 p-4 sm:p-6 overflow-auto flex justify-center items-start bg-slate-900/90"
            >
              <div
                className="transition-transform duration-150 origin-top shadow-2xl rounded-lg overflow-hidden border border-slate-700/60 bg-white"
                style={{
                  transform: `scale(${previewZoom})`,
                  width: paperSize === 'letter' ? '816px' : '794px',
                  minHeight: '1123px',
                }}
              >
                <iframe
                  srcDoc={printableHtml}
                  title="Printable PDF Document Preview"
                  className="w-full h-[1400px] border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
