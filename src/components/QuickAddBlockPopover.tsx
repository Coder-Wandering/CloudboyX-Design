import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Plus,
  LayoutTemplate,
  Columns2,
  CreditCard,
  Image as ImageIcon,
  MessageSquareQuote,
  Users,
  Mail,
  PanelBottom,
  Menu,
  FileText,
  HelpCircle,
  Box,
  Code2,
  Check,
  Sparkles,
  ClipboardPaste,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';
import { BlockInstance, BlockCategory, SiteTheme } from '../types';

export interface QuickAddBlockPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  insertIndex: number;
  totalBlocks: number;
  precedingBlock?: BlockInstance | null;
  followingBlock?: BlockInstance | null;
  onAddBlockAtIndex: (blockType: string, insertIndex: number) => void;
  onPasteFromClipboard?: (insertIndex: number) => void;
  onAddBlankContainer?: (insertIndex: number) => void;
  onOpenFullLibrary?: (insertIndex: number) => void;
  clipboardCount?: number;
  theme?: SiteTheme;
  themeMode?: 'light' | 'dark';
}

const CATEGORY_TABS: { id: 'all' | BlockCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'headers', label: 'Hero', icon: LayoutTemplate },
  { id: 'features', label: 'Features', icon: Columns2 },
  { id: 'gallery', label: 'Media', icon: ImageIcon },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'forms', label: 'Forms', icon: Mail },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'navbars', label: 'Navbars', icon: Menu },
  { id: 'footers', label: 'Footers', icon: PanelBottom },
];

export const QuickAddBlockPopover: React.FC<QuickAddBlockPopoverProps> = ({
  isOpen,
  onClose,
  insertIndex,
  totalBlocks,
  precedingBlock,
  followingBlock,
  onAddBlockAtIndex,
  onPasteFromClipboard,
  onAddBlankContainer,
  onOpenFullLibrary,
  clipboardCount = 0,
  themeMode = 'light',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BlockCategory>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDark = themeMode === 'dark';

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered blocks based on search and category
  const filteredBlocks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return BLOCK_DEFINITIONS.filter((def) => {
      // Category match
      if (selectedCategory !== 'all' && def.category !== selectedCategory) {
        return false;
      }
      // Query match
      if (!q) return true;
      const nameMatch = def.name.toLowerCase().includes(q);
      const descMatch = (def.description || '').toLowerCase().includes(q);
      const typeMatch = def.type.toLowerCase().includes(q);
      const tagMatch = (def.tags || []).some((tag) => tag.toLowerCase().includes(q));
      return nameMatch || descMatch || typeMatch || tagMatch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectBlock = (blockType: string) => {
    onAddBlockAtIndex(blockType, insertIndex);
    onClose();
  };

  const handleSelectBlank = () => {
    if (onAddBlankContainer) {
      onAddBlankContainer(insertIndex);
    } else {
      onAddBlockAtIndex('blank-container', insertIndex);
    }
    onClose();
  };

  const handleSelectPaste = () => {
    if (onPasteFromClipboard) {
      onPasteFromClipboard(insertIndex);
    }
    onClose();
  };

  const handleSelectLibrary = () => {
    if (onOpenFullLibrary) {
      onOpenFullLibrary(insertIndex);
    }
    onClose();
  };

  // Determine slot contextual text
  let positionContext = `Slot #${insertIndex + 1} of ${totalBlocks + 1}`;
  if (insertIndex === 0) {
    positionContext = 'At the very top of your page (Slot #1)';
  } else if (insertIndex >= totalBlocks) {
    positionContext = `At the very bottom of your page (Slot #${totalBlocks + 1})`;
  } else if (precedingBlock && followingBlock) {
    positionContext = `Between "${precedingBlock.name}" and "${followingBlock.name}"`;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 transform scale-100 ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100 shadow-cyan-950/30'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Plus className="w-4 h-4 stroke-[2.8]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 id="quick-add-title" className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  Quick Add Section
                </h3>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                  Slot #{insertIndex + 1}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {positionContext}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline mr-1">
              ESC to cancel
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Area */}
        <div className={`p-3 border-b space-y-2.5 shrink-0 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          {/* Search Bar */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sections (e.g., hero, carousel, 3-col cards, pricing, gallery)..."
              className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border transition outline-none ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-750 border-slate-700/60'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border-slate-200/80'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blocks Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-[260px] max-h-[50vh]">
          {filteredBlocks.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                No blocks match "{searchQuery}" in this category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredBlocks.map((block) => {
                return (
                  <button
                    key={block.type}
                    type="button"
                    onClick={() => handleSelectBlock(block.type)}
                    className={`text-left p-3 rounded-xl border transition-all duration-150 group cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      isDark
                        ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-750 hover:border-blue-500 text-slate-100'
                        : 'bg-white hover:bg-blue-50/40 border-slate-200/90 hover:border-blue-400 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                          {block.category}
                        </span>
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-3 h-3 stroke-[3]" />
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {block.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {block.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10.5px]">
                      <span className="font-mono text-slate-400 text-[10px]">
                        {block.type}
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Insert</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Utilities Footer */}
        <div
          className={`p-3 border-t flex flex-wrap items-center justify-between gap-2 shrink-0 ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectBlank}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="Insert a blank Bootstrap 5 container at this slot"
            >
              <Box className="w-3.5 h-3.5 text-purple-600" />
              <span>Blank Container</span>
            </button>

            {clipboardCount > 0 && (
              <button
                type="button"
                onClick={handleSelectPaste}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer ${
                  isDark
                    ? 'bg-emerald-950/60 hover:bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs'
                }`}
                title="Paste latest copied block from Clipboard Manager"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste from Clipboard ({clipboardCount})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSelectLibrary}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Full Library Drawer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
