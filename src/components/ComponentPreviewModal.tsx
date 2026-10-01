import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Check,
  Tag,
  Layers,
} from 'lucide-react';
import { BlockDefinition, SiteTheme, ViewportMode } from '../types';
import { generateSingleBlockPreviewHtml } from '../utils/htmlGenerator';

interface ComponentPreviewModalProps {
  blockDef: BlockDefinition | null;
  theme: SiteTheme;
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (blockType: string) => void;
  onPrevBlock?: () => void;
  onNextBlock?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const ComponentPreviewModal: React.FC<ComponentPreviewModalProps> = ({
  blockDef,
  theme,
  isOpen,
  onClose,
  onInsertBlock,
  onPrevBlock,
  onNextBlock,
  hasPrev = false,
  hasNext = false,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [justAdded, setJustAdded] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrevBlock) {
        e.preventDefault();
        onPrevBlock();
      } else if (e.key === 'ArrowRight' && hasNext && onNextBlock) {
        e.preventDefault();
        onNextBlock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrevBlock, onNextBlock, onClose]);

  if (!isOpen || !blockDef) return null;

  const previewHtml = generateSingleBlockPreviewHtml(blockDef, theme);

  const handleInsert = () => {
    onInsertBlock(blockDef.type);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 600);
  };

  const getViewportWidthStyle = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[390px] h-[640px] rounded-3xl border-8 border-slate-800 shadow-2xl';
      case 'tablet':
        return 'w-[768px] h-[640px] rounded-2xl border-8 border-slate-700 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-xl border border-slate-200 shadow-sm';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          {/* Left: Component Info & Prev/Next */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
              <button
                onClick={onPrevBlock}
                disabled={!hasPrev}
                title="Previous component (←)"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextBlock}
                disabled={!hasNext}
                title="Next component (→)"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{blockDef.name}</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 tracking-wider">
                  {blockDef.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">
                {blockDef.description}
              </p>
            </div>
          </div>

          {/* Center: Responsive Viewport Switcher */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-lg border border-slate-300/60 text-xs font-semibold">
            <button
              onClick={() => setViewport('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                viewport === 'desktop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                viewport === 'tablet'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                viewport === 'mobile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleInsert}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Inserted!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Insert this Block</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Preview Container */}
        <div className="flex-1 bg-slate-100 p-4 md:p-6 overflow-auto flex items-center justify-center">
          <div
            className={`transition-all duration-300 bg-white overflow-hidden ${getViewportWidthStyle()}`}
          >
            <iframe
              title={`Preview of ${blockDef.name}`}
              srcDoc={previewHtml}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts"
            />
          </div>
        </div>

        {/* Footer Info & Tags */}
        <div className="px-5 py-2.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              Bootstrap 5.3 Component:
            </span>
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {blockDef.type}
            </span>
            {blockDef.tags && blockDef.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-[11px] text-slate-400">Tags:</span>
                {blockDef.tags.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Tip: Use ← → keys to browse components</span>
          </div>
        </div>
      </div>
    </div>
  );
};
