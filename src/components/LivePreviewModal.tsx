import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RotateCw,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings, ViewportMode } from '../types';
import { generateCompleteHtml } from '../utils/htmlGenerator';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockInstance[];
  theme: SiteTheme;
  projectTitle: string;
  seoSettings?: SeoSettings;
  themeMode?: 'light' | 'dark';
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  blocks,
  theme,
  projectTitle,
  seoSettings,
  themeMode = 'light',
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  // Pure live HTML with isEditor = false (removes all selection frames, outlines, and editor message handlers)
  const fullHtml = generateCompleteHtml(
    blocks,
    theme,
    projectTitle,
    false, // isEditor = false
    null,
    seoSettings
  );

  const isDark = themeMode === 'dark';

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[390px] h-[844px] max-h-[calc(100vh-140px)] shadow-2xl rounded-[32px] border-[8px] border-slate-900 ring-1 ring-slate-800 my-auto overflow-hidden';
      case 'tablet':
        return 'w-[768px] h-[1024px] max-h-[calc(100vh-120px)] shadow-2xl rounded-[20px] border-[8px] border-slate-900 ring-1 ring-slate-800 my-auto overflow-hidden';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div
      id="live-preview-modal-root"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/85 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen Live Website Preview"
    >
      {/* Floating Control Bar (Clean, unobtrusive top nav) */}
      <header
        className={`h-14 px-4 border-b flex items-center justify-between shrink-0 shadow-md transition-colors ${
          isDark
            ? 'bg-[#0b0f19] border-slate-800 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Left: Project title & Live Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              Live Preview
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2 truncate">
            <span className="text-sm font-semibold text-white truncate max-w-[220px] md:max-w-md">
              {projectTitle || 'Bootstrap 5 Website'}
            </span>
            <span className="hidden md:inline-block text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
              {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Desktop View (100% full width)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile View (390px iPhone style)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions & Close */}
        <div className="flex items-center gap-1.5">
          {/* Reload / Refresh Frame */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Reload Preview Frame"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Open in New Browser Tab */}
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Open Pure Standalone Site in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Tab</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer hidden md:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            type="button"
            id="close-live-preview-modal-btn"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow-sm transition ml-1 cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>
      </header>

      {/* Main Preview Body */}
      <div
        className={`flex-1 overflow-auto flex items-center justify-center relative p-0 ${
          viewport !== 'desktop' ? 'p-4 md:p-8 bg-slate-950/90' : 'bg-white'
        }`}
      >
        <div
          className={`transition-all duration-300 flex flex-col ${getViewportWidthClass()}`}
        >
          {/* Simulated Mobile/Tablet Device Speaker & Camera Notch (Only on mobile/tablet) */}
          {viewport === 'mobile' && (
            <div className="h-5 bg-slate-900 w-full flex items-center justify-center shrink-0">
              <div className="w-14 h-1 bg-slate-800 rounded-full" />
            </div>
          )}

          <iframe
            key={refreshKey}
            title={`${projectTitle} - Live Preview`}
            srcDoc={fullHtml}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />

          {viewport === 'mobile' && (
            <div className="h-5 bg-slate-900 w-full flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-slate-700 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
