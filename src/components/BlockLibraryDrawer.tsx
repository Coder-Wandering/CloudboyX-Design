import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  Eye,
  LayoutTemplate,
  Menu,
  Grid3X3,
  Columns2,
  FileText,
  CreditCard,
  Image as ImageIcon,
  MessageSquareQuote,
  Users,
  Mail,
  PanelBottom,
  Check,
  List,
  Sparkles,
  GripVertical,
  Smartphone,
  CheckCircle2,
  Sliders,
  Layers,
  Code2,
} from 'lucide-react';
import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';
import { BlockCategory, BlockDefinition, SiteTheme } from '../types';
import { ComponentPreviewModal } from './ComponentPreviewModal';
import { generateSingleBlockPreviewHtml } from '../utils/htmlGenerator';
import { BlockThumbnail, getBlockLayoutInfo } from './BlockThumbnailPreview';

interface BlockLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string) => void;
  selectedBlockId: string | null;
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  isEmbedded?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  hideSearchBar?: boolean;
  hideCategoryTabs?: boolean;
  hideTagsBar?: boolean;
  selectedCategory?: 'all' | BlockCategory;
  onSelectCategory?: (category: 'all' | BlockCategory) => void;
}

const CATEGORIES: { id: 'all' | BlockCategory; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Blocks', icon: Grid3X3 },
  { id: 'html', label: 'Custom HTML', icon: Code2 },
  { id: 'headers', label: 'Headers & Hero', icon: LayoutTemplate },
  { id: 'features', label: 'Features & Cards', icon: Columns2 },
  { id: 'pricing', label: 'Pricing Tables', icon: CreditCard },
  { id: 'footers', label: 'Footers', icon: PanelBottom },
  { id: 'navbars', label: 'Navbars & Menus', icon: Menu },
  { id: 'content', label: 'Content & Articles', icon: FileText },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'team', label: 'Team Showcase', icon: Users },
  { id: 'gallery', label: 'Gallery & Works', icon: ImageIcon },
  { id: 'forms', label: 'Forms & Contact', icon: Mail },
];

const SUGGESTED_SEARCHES = ['Custom HTML', 'Hero', 'Cards', 'Pricing', 'Navbar', 'Team', 'Accordion', 'Contact'];

export const BlockLibraryDrawer: React.FC<BlockLibraryDrawerProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  selectedBlockId,
  theme,
  themeMode = 'light',
  isEmbedded = false,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  hideSearchBar = false,
  hideCategoryTabs = false,
  hideTagsBar = false,
  selectedCategory,
  onSelectCategory,
}) => {
  const [internalCategory, setInternalCategory] = useState<'all' | BlockCategory>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'visual' | 'compact'>('visual');
  const [previewRenderMode, setPreviewRenderMode] = useState<'blueprint' | 'live'>('blueprint');
  const [recentlyAdded, setRecentlyAdded] = useState<string | null>(null);
  const [previewBlockIndex, setPreviewBlockIndex] = useState<number | null>(null);

  const isDark = themeMode === 'dark';
  const activeCategory = selectedCategory !== undefined ? selectedCategory : internalCategory;

  const handleCategoryChange = (cat: 'all' | BlockCategory) => {
    setInternalCategory(cat);
    onSelectCategory?.(cat);
  };

  // Hover & selection preview state
  const [hoveredBlockType, setHoveredBlockType] = useState<string | null>(null);
  const [selectedBlockForPreview, setSelectedBlockForPreview] = useState<BlockDefinition | null>(null);

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;

  const handleSearchChange = (val: string) => {
    setInternalSearchQuery(val);
    onSearchQueryChange?.(val);
  };

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when drawer opens
  useEffect(() => {
    if (isOpen && !hideSearchBar) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, hideSearchBar]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: BLOCK_DEFINITIONS.length };
    BLOCK_DEFINITIONS.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered blocks based on search and category
  const filteredBlocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return BLOCK_DEFINITIONS.filter((block) => {
      const catDef = CATEGORIES.find((c) => c.id === block.category);
      const catLabel = catDef ? catDef.label.toLowerCase() : '';

      // Match against name, type, category, friendly label, description, and tags
      const nameMatch = block.name.toLowerCase().includes(query);
      const typeMatch = block.type.toLowerCase().includes(query);
      const catIdMatch = block.category.toLowerCase().includes(query);
      const catLabelMatch = catLabel.includes(query);
      const catMatch = catIdMatch || catLabelMatch;
      const descMatch = block.description.toLowerCase().includes(query);
      const tagMatch = block.tags?.some((tag) => tag.toLowerCase().includes(query));

      const queryMatches = !query || nameMatch || typeMatch || catMatch || descMatch || tagMatch;

      const matchesCategory = activeCategory === 'all' || block.category === activeCategory;

      return matchesCategory && queryMatches;
    });
  }, [searchQuery, activeCategory]);

  const handleSelectBlock = (type: string) => {
    onAddBlock(type);
    setRecentlyAdded(type);
    setTimeout(() => setRecentlyAdded(null), 1200);
  };

  const handleDragStart = (e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData('text/plain', blockType);
    e.dataTransfer.setData('application/bootstrap-block', blockType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Preview navigation
  const activePreviewBlock = previewBlockIndex !== null ? filteredBlocks[previewBlockIndex] || null : null;
  const hasPrevPreview = previewBlockIndex !== null && previewBlockIndex > 0;
  const hasNextPreview = previewBlockIndex !== null && previewBlockIndex < filteredBlocks.length - 1;

  // Active block to display in thumbnail inspector: either selected candidate, or hovered block
  const activeInspectedBlock = useMemo(() => {
    if (selectedBlockForPreview) return selectedBlockForPreview;
    if (hoveredBlockType) {
      return BLOCK_DEFINITIONS.find((b) => b.type === hoveredBlockType) || null;
    }
    return null;
  }, [selectedBlockForPreview, hoveredBlockType]);

  const inspectedLayoutInfo = useMemo(() => {
    if (!activeInspectedBlock) return null;
    return getBlockLayoutInfo(activeInspectedBlock.type);
  }, [activeInspectedBlock]);

  if (!isOpen) return null;

  const contentMarkup = (
    <div
      className={`w-full flex flex-col overflow-hidden transition-colors duration-200 ${
        isEmbedded ? 'h-full' : 'max-w-lg md:max-w-xl h-full shadow-2xl border-l'
      } ${
        isDark
          ? 'bg-[#0b0f19] text-slate-100 border-slate-800'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-3.5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/70 border-slate-200'
        }`}
      >
        <div>
          <h2
            className={`text-sm font-bold flex items-center gap-2 ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            <span
              className={`p-1 rounded-lg ${
                isDark
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                  : 'bg-blue-100 text-blue-600'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
            <span>Component Library</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/80 text-slate-700'
              }`}
            >
              {filteredBlocks.length} of {BLOCK_DEFINITIONS.length} Blocks
            </span>
          </h2>
          <p
            className={`text-[11px] mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {activeCategory === 'all'
              ? 'Showing all block categories'
              : `Category: ${CATEGORIES.find((c) => c.id === activeCategory)?.label || activeCategory}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle */}
          <div
            className={`flex items-center p-0.5 rounded-lg border ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-200/80 border-slate-300/60'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('visual')}
              title="Visual card view with thumbnails"
              className={`p-1.5 rounded-md transition ${
                viewMode === 'visual'
                  ? isDark
                    ? 'bg-slate-900 text-cyan-400 shadow-xs'
                    : 'bg-white text-blue-600 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              title="Compact list view with thumbnails"
              className={`p-1.5 rounded-md transition ${
                viewMode === 'compact'
                  ? isDark
                    ? 'bg-slate-900 text-cyan-400 shadow-xs'
                    : 'bg-white text-blue-600 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ml-1 ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Global Search Bar (shown when not hidden by parent sidebar) */}
      {!hideSearchBar && (
        <div
          className={`p-3.5 border-b shadow-xs ${
            isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="blocks-filter-input"
              ref={searchInputRef}
              type="text"
              placeholder="Filter blocks by name or category..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              aria-label="Filter blocks by name or category"
              className={`w-full pl-10 pr-9 py-2 text-xs border rounded-xl outline-hidden focus:ring-2 transition font-medium ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                title="Clear filter"
                aria-label="Clear filter"
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Search Suggestions & Results Count */}
      {!hideTagsBar && (
        <div
          className={`flex items-center justify-between px-3.5 py-2 border-b text-[11px] ${
            isDark
              ? 'bg-slate-900/50 border-slate-800 text-slate-400'
              : 'bg-slate-50/50 border-slate-200/80 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] uppercase font-semibold mr-1 shrink-0 opacity-70">
              Tags:
            </span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSearchChange(term)}
                className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition shrink-0 cursor-pointer ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? isDark
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-blue-100 text-blue-700'
                    : isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    : 'bg-white hover:bg-slate-200/80 text-slate-600 border border-slate-200/70'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          <span
            className={`shrink-0 font-semibold ml-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {filteredBlocks.length} {filteredBlocks.length === 1 ? 'block' : 'blocks'}
          </span>
        </div>
      )}

      {/* Category Filter Badges */}
      {!hideCategoryTabs && (
        <div
          className={`px-3 py-2 border-b overflow-x-auto flex gap-1.5 no-scrollbar ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/60 border-slate-200'
          }`}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800 bg-slate-900 border border-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 bg-white border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-blue-700/60 text-white'
                      : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ACTIVE THUMBNAIL LAYOUT INSPECTOR PANEL (Appears when block is hovered or selected) */}
      {activeInspectedBlock && inspectedLayoutInfo && (
        <div
          className={`p-3 border-b flex flex-col gap-2 shadow-xs transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-blue-50/70 border-blue-200/80'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isDark ? 'bg-cyan-400' : 'bg-blue-600'
                }`}
              />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-cyan-300' : 'text-blue-900'
                }`}
              >
                {selectedBlockForPreview?.type === activeInspectedBlock.type
                  ? 'Selected Block Layout'
                  : 'Hovered Layout Preview'}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isDark
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-blue-200/70 text-blue-800'
                }`}
              >
                {inspectedLayoutInfo.pattern}
              </span>
            </div>

            {selectedBlockForPreview && (
              <button
                type="button"
                onClick={() => setSelectedBlockForPreview(null)}
                className={`text-[11px] p-0.5 rounded-md transition ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-blue-100'
                }`}
                title="Clear selected preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl border shadow-2xs ${
              isDark
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-white border-blue-200'
            }`}
          >
            {/* Miniature Thumbnail */}
            <div
              className={`w-36 h-22 shrink-0 rounded-lg overflow-hidden border shadow-2xs ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <BlockThumbnail
                block={activeInspectedBlock}
                theme={theme}
                size="md"
                className="w-full h-full"
                isSelected={true}
              />
            </div>

            {/* Layout Specs */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <h4
                  className={`text-xs font-bold truncate flex items-center gap-1.5 ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  <span>{activeInspectedBlock.name}</span>
                  <span className="text-[10px] font-normal text-slate-400 uppercase">
                    ({activeInspectedBlock.category})
                  </span>
                </h4>
                <div
                  className={`flex items-center gap-1.5 mt-0.5 text-[10px] ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <Smartphone
                    className={`w-3 h-3 shrink-0 ${
                      isDark ? 'text-cyan-400' : 'text-blue-600'
                    }`}
                  />
                  <span className="truncate">{inspectedLayoutInfo.responsiveBehavior}</span>
                </div>
              </div>

              {/* Elements pills */}
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                {inspectedLayoutInfo.elements.slice(0, 3).map((el, i) => (
                  <span
                    key={i}
                    className={`text-[9px] font-medium px-1.5 py-0.2 rounded-xs border ${
                      isDark
                        ? 'bg-slate-900 text-slate-300 border-slate-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {el}
                  </span>
                ))}
                {inspectedLayoutInfo.elements.length > 3 && (
                  <span className="text-[9px] text-slate-400 font-medium">
                    +{inspectedLayoutInfo.elements.length - 3}
                  </span>
                )}
              </div>

              {/* Quick Add CTA */}
              <div
                className={`flex items-center gap-2 mt-2 pt-1.5 border-t ${
                  isDark ? 'border-slate-800' : 'border-slate-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectBlock(activeInspectedBlock.type)}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                    recentlyAdded === activeInspectedBlock.type
                      ? 'bg-emerald-600 text-white'
                      : isDark
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {recentlyAdded === activeInspectedBlock.type ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Added to Page!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Insert This Block</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const idx = filteredBlocks.findIndex((b) => b.type === activeInspectedBlock.type);
                    if (idx !== -1) setPreviewBlockIndex(idx);
                  }}
                  title="Full Viewport Modal Preview"
                  className={`p-1 rounded-lg border transition ${
                    isDark
                      ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border-slate-800'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Mode Switcher for Visual Cards (Blueprint vs Live HTML) */}
      {viewMode === 'visual' && (
        <div
          className={`px-3.5 py-1.5 border-b flex items-center justify-between text-[11px] ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-400'
              : 'bg-slate-50 border-slate-200/60 text-slate-500'
          }`}
        >
          <span className="font-medium flex items-center gap-1">
            <Sparkles className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`} />
            <span>Card Preview Mode:</span>
          </span>
          <div
            className={`flex items-center gap-1 p-0.5 rounded-md ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200/70'
            }`}
          >
            <button
              type="button"
              onClick={() => setPreviewRenderMode('blueprint')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition ${
                previewRenderMode === 'blueprint'
                  ? isDark
                    ? 'bg-slate-900 text-cyan-400 shadow-2xs'
                    : 'bg-white text-blue-700 shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blueprint Wireframe
            </button>
            <button
              type="button"
              onClick={() => setPreviewRenderMode('live')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition ${
                previewRenderMode === 'live'
                  ? isDark
                    ? 'bg-slate-900 text-cyan-400 shadow-2xs'
                    : 'bg-white text-blue-700 shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Frame
            </button>
          </div>
        </div>
      )}

      {/* Blocks Feed */}
      <div
        className={`flex-1 overflow-y-auto p-3.5 space-y-3 ${
          isDark ? 'bg-[#0b0f19]' : 'bg-slate-100/60'
        }`}
      >
        {filteredBlocks.length === 0 ? (
          <div
            className={`text-center py-16 px-4 rounded-2xl border my-4 shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
                isDark
                  ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              <Search className="w-6 h-6" />
            </div>
            <h4
              className={`text-sm font-bold ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              No components match &ldquo;{searchQuery || activeCategory}&rdquo;
            </h4>
            <p
              className={`text-xs mt-1 max-w-xs mx-auto ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Try clearing the search query or select another category above.
            </p>
            <button
              onClick={() => {
                handleSearchChange('');
                handleCategoryChange('all');
              }}
              className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800 hover:bg-cyan-900'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600'
              }`}
            >
              Clear Filters & Show All
            </button>
          </div>
        ) : (
          filteredBlocks.map((block, index) => {
            const isAdded = recentlyAdded === block.type;
            const isSelected = selectedBlockForPreview?.type === block.type;
            const isHovered = hoveredBlockType === block.type;
            const layoutInfo = getBlockLayoutInfo(block.type);

            if (viewMode === 'compact') {
              // COMPACT LIST VIEW (WITH MINIATURE THUMBNAIL)
              return (
                <div
                  key={block.type}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, block.type)}
                  onMouseEnter={() => setHoveredBlockType(block.type)}
                  onMouseLeave={() => setHoveredBlockType(null)}
                  onClick={() => setSelectedBlockForPreview(block)}
                  className={`rounded-xl border p-2.5 shadow-xs transition flex items-center justify-between gap-3 group cursor-pointer ${
                    isDark
                      ? isSelected
                        ? 'bg-cyan-950/20 border-cyan-500 ring-2 ring-cyan-500/30'
                        : isHovered
                        ? 'bg-slate-800/80 border-cyan-500/50 shadow-md'
                        : 'bg-slate-900 border-slate-800'
                      : isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/20'
                      : isHovered
                      ? 'border-blue-400 bg-slate-50/50 shadow-md'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      title="Drag into page"
                      className={`transition cursor-grab ${
                        isDark
                          ? 'text-slate-500 group-hover:text-slate-300'
                          : 'text-slate-300 group-hover:text-slate-500'
                      }`}
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Small Thumbnail Preview on Left of row */}
                    <div
                      className={`w-14 h-10 shrink-0 rounded-lg overflow-hidden border shadow-2xs ${
                        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <BlockThumbnail
                        block={block}
                        theme={theme}
                        size="sm"
                        className="w-full h-full"
                        isHovered={isHovered}
                        isSelected={isSelected}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-xs font-bold transition truncate ${
                            isDark
                              ? 'text-slate-100 group-hover:text-cyan-400'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {block.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs border shrink-0 ${
                            isDark
                              ? 'text-cyan-300 bg-cyan-950 border-cyan-800/70'
                              : 'text-blue-700 bg-blue-50 border-blue-200/60'
                          }`}
                        >
                          {layoutInfo.pattern}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {block.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewBlockIndex(index)}
                      title="Preview layout in responsive viewports"
                      className={`p-1.5 rounded-lg border transition ${
                        isDark
                          ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800 border-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-slate-200 hover:border-blue-200'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Add Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectBlock(block.type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : isDark
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            // VISUAL CARD VIEW (WITH HIGH-FIDELITY THUMBNAIL OR LIVE PREVIEW)
            return (
              <div
                key={block.type}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, block.type)}
                onMouseEnter={() => setHoveredBlockType(block.type)}
                onMouseLeave={() => setHoveredBlockType(null)}
                onClick={() => setSelectedBlockForPreview(block)}
                className={`rounded-2xl border shadow-xs transition flex flex-col group overflow-hidden cursor-pointer ${
                  isDark
                    ? isSelected
                      ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30'
                      : isHovered
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg'
                      : 'bg-slate-900 border-slate-800'
                    : isSelected
                    ? 'bg-white border-blue-500 ring-2 ring-blue-500/30'
                    : isHovered
                    ? 'bg-white border-blue-400 shadow-lg'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                {/* Visual Card Preview Header */}
                <div
                  className={`relative border-b h-36 overflow-hidden flex items-center justify-center p-2 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  {previewRenderMode === 'blueprint' ? (
                    /* High-Fidelity Vectorized Thumbnail */
                    <div className="w-full h-full transform transition-transform duration-200 group-hover:scale-[1.02]">
                      <BlockThumbnail
                        block={block}
                        theme={theme}
                        size="md"
                        className="w-full h-full"
                        isHovered={isHovered}
                        isSelected={isSelected}
                      />
                    </div>
                  ) : (
                    /* Scaled Mini Preview Iframe */
                    <div className="w-[800px] h-[480px] origin-top-left transform scale-[0.25] md:scale-[0.28] pointer-events-none select-none bg-white rounded-lg shadow-xs overflow-hidden border border-slate-200">
                      <iframe
                        title={block.name}
                        srcDoc={generateSingleBlockPreviewHtml(block, theme)}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                        tabIndex={-1}
                      />
                    </div>
                  )}

                  {/* Hover Overlay with Quick Inspect / Responsive Preview */}
                  <div
                    className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 backdrop-blur-2xs transition-all duration-150 flex items-center justify-center gap-2 p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewBlockIndex(index)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition transform hover:scale-105 ${
                        isDark
                          ? 'bg-slate-900 text-slate-100 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-700'
                          : 'bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Eye className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                      <span>Preview in Viewports</span>
                    </button>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-xs flex items-center gap-1 backdrop-blur-xs ${
                        isDark
                          ? 'bg-slate-900/90 text-slate-300 border-slate-700'
                          : 'bg-white/95 text-slate-700 border-slate-200'
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-slate-400" />
                      <span>Drag to Canvas</span>
                    </span>
                    {isSelected && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                          isDark ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-blue-600 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 pointer-events-none">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border shadow-xs backdrop-blur-xs ${
                        isDark
                          ? 'bg-cyan-950/90 text-cyan-300 border-cyan-800'
                          : 'bg-blue-50/95 text-blue-700 border-blue-200'
                      }`}
                    >
                      {block.category}
                    </span>
                  </div>
                </div>

                {/* Card Content & Action Footer */}
                <div className="p-3.5 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold transition truncate ${
                          isDark
                            ? 'text-slate-100 group-hover:text-cyan-400'
                            : 'text-slate-900 group-hover:text-blue-600'
                        }`}
                      >
                        {block.name}
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                          isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-blue-50 text-blue-700 border-blue-200/60'
                        }`}
                      >
                        {layoutInfo.pattern}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {block.description}
                    </p>

                    {/* Responsive Behavior hint */}
                    <div
                      className={`flex items-center gap-1.5 text-[10px] mt-2 p-1.5 rounded-lg border ${
                        isDark
                          ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      <Smartphone
                        className={`w-3 h-3 shrink-0 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}
                      />
                      <span className="truncate">{layoutInfo.responsiveBehavior}</span>
                    </div>
                  </div>

                  {/* Tag list */}
                  {block.tags && block.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {block.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearchChange(tag);
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${
                            isDark
                              ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-cyan-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div
                    className={`pt-2 border-t flex items-center justify-between gap-2 ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedBlockForPreview(block)}
                      className={`text-xs font-semibold flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg ${
                        isSelected
                          ? isDark
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-blue-100 text-blue-800'
                          : isDark
                          ? 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
                          : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                    >
                      <Eye
                        className={`w-3.5 h-3.5 ${
                          isSelected
                            ? isDark
                              ? 'text-cyan-400'
                              : 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{isSelected ? 'Inspecting' : 'Inspect Layout'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectBlock(block.type)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : isDark
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold active:scale-95'
                          : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add Block</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {isEmbedded ? (
        contentMarkup
      ) : (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/35 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          {contentMarkup}
        </div>
      )}

      {/* Component Preview Modal: Live Interactive Preview */}
      <ComponentPreviewModal
        blockDef={activePreviewBlock}
        theme={theme}
        isOpen={activePreviewBlock !== null}
        onClose={() => setPreviewBlockIndex(null)}
        onInsertBlock={(type) => {
          handleSelectBlock(type);
        }}
        onPrevBlock={() => {
          if (hasPrevPreview && previewBlockIndex !== null) {
            setPreviewBlockIndex(previewBlockIndex - 1);
          }
        }}
        onNextBlock={() => {
          if (hasNextPreview && previewBlockIndex !== null) {
            setPreviewBlockIndex(previewBlockIndex + 1);
          }
        }}
        hasPrev={hasPrevPreview}
        hasNext={hasNextPreview}
      />
    </>
  );
};
