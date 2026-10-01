import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Globe,
  Layers,
  Box,
  Grid,
  Columns,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  X,
  Code2,
  Layout,
  Check,
  ClipboardCopy,
  ClipboardList,
} from 'lucide-react';
import { BlockInstance, BlockCategory } from '../types';

interface BreadcrumbBarProps {
  projectTitle: string;
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeselectBlock: () => void;
  onOpenSettings: (id: string) => void;
  onOpenPageSettings?: () => void;
  onUpdateSettings?: (blockId: string, settings: Partial<BlockInstance['settings']>) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  onDuplicate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
  onCopyBlock?: (blockId: string) => void;
  onOpenCodeEditor?: (blockId: string) => void;
  onOpenClipboard?: () => void;
  clipboardCount?: number;
  themeMode?: 'light' | 'dark';
}

const CATEGORY_HTML_TAGS: Record<BlockCategory, string> = {
  html: 'section',
  headers: 'header',
  navbars: 'nav',
  footers: 'footer',
  features: 'section',
  content: 'section',
  pricing: 'section',
  gallery: 'section',
  testimonials: 'section',
  team: 'section',
  forms: 'section',
};

const CATEGORY_COLORS: Record<BlockCategory, { bg: string; text: string; border: string }> = {
  html: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  headers: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  navbars: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  features: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  content: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  pricing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  gallery: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  testimonials: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  team: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  forms: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  footers: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};

export const BreadcrumbBar: React.FC<BreadcrumbBarProps> = ({
  projectTitle,
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeselectBlock,
  onOpenSettings,
  onOpenPageSettings,
  onUpdateSettings,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onCopyBlock,
  onOpenCodeEditor,
  onOpenClipboard,
  clipboardCount = 0,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
  const [isBlockDropdownOpen, setIsBlockDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedIndex !== -1 ? blocks[selectedIndex] : null;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBlockDropdownOpen(false);
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevBlock = () => {
    if (selectedIndex > 0) {
      onSelectBlock(blocks[selectedIndex - 1].id);
    }
  };

  const handleNextBlock = () => {
    if (selectedIndex < blocks.length - 1) {
      onSelectBlock(blocks[selectedIndex + 1].id);
    }
  };

  const handleToggleContainer = () => {
    if (!selectedBlock || !onUpdateSettings) return;
    const nextWidth =
      selectedBlock.settings.containerWidth === 'container' ? 'container-fluid' : 'container';
    onUpdateSettings(selectedBlock.id, { containerWidth: nextWidth });
  };

  const semanticTag = selectedBlock
    ? CATEGORY_HTML_TAGS[selectedBlock.category] || 'section'
    : 'section';
  const categoryColor = selectedBlock
    ? CATEGORY_COLORS[selectedBlock.category] || {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
      }
    : null;

  return (
    <nav
      id="editor-breadcrumb-bar"
      aria-label="Block Hierarchy Navigation"
      className={`w-full border-b px-4 py-1.5 flex items-center justify-between text-xs z-20 shrink-0 shadow-2xs select-none min-h-[38px] transition-colors duration-200 ${
        isDark
          ? 'bg-[#0b0f19] border-slate-800 text-slate-300'
          : 'bg-white border-slate-200/90 text-slate-700'
      }`}
    >
      {/* Left: Breadcrumbs Trail */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 mr-2 py-0.5">
        {/* Crumb 1: Document Root / Page */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onOpenPageSettings) {
                onOpenPageSettings();
              } else {
                onDeselectBlock();
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition font-medium cursor-pointer group ${
              isDark
                ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-800'
                : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/70'
            }`}
            title="Page root - Click to configure page settings"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
            <span className={`font-mono text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>&lt;body&gt;</span>
            <span className={`font-semibold max-w-[120px] truncate ${isDark ? 'text-slate-200 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>
              {projectTitle || 'Home Page'}
            </span>
          </button>
        </div>

        <ChevronRight className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />

        {/* If a block is selected: render Section > Block > Container > Row */}
        {selectedBlock ? (
          <>
            {/* Crumb 2: Semantic Section Tag & Category */}
            <div className="relative flex items-center shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen((prev) => !prev);
                  setIsBlockDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium border transition cursor-pointer ${
                  categoryColor
                    ? `${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                } hover:brightness-95`}
                title={`HTML tag: <${semanticTag}> • Category: ${selectedBlock.category} - Click to switch block category`}
              >
                <span className="font-mono text-[11px] font-bold">&lt;{semanticTag}&gt;</span>
                <span className="capitalize font-semibold">{selectedBlock.category}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
              </button>

              {/* Category Blocks Popover Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Sections in Page
                  </div>
                  {blocks.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onSelectBlock(b.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 flex items-center justify-between text-xs text-left hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer ${
                        b.id === selectedBlock.id ? 'bg-blue-50/80 font-bold text-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                        <span className="truncate">{b.name}</span>
                      </div>
                      {b.id === selectedBlock.id && (
                        <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

            {/* Crumb 3: Selected Block Instance with Quick Switcher */}
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBlockDropdownOpen((prev) => !prev);
                  setIsCategoryDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100/70 transition cursor-pointer shadow-2xs"
                title={`Selected Section #${selectedIndex + 1}: ${selectedBlock.name} - Click to switch sections`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-mono text-[10px] bg-blue-200/80 text-blue-900 px-1 py-0.2 rounded">
                  #{selectedIndex + 1}
                </span>
                <span className="font-semibold max-w-[140px] truncate">{selectedBlock.name}</span>
                <ChevronDown className="w-3 h-3 text-blue-500 opacity-70" />
              </button>

              {/* Block Switcher Dropdown */}
              {isBlockDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Jump to Section</span>
                    <span>{blocks.length} Total</span>
                  </div>
                  {blocks.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        onSelectBlock(b.id);
                        setIsBlockDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 flex items-center justify-between text-xs text-left hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer ${
                        b.id === selectedBlock.id ? 'bg-blue-50 font-bold text-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="truncate font-medium">{b.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{b.category}</div>
                        </div>
                      </div>
                      {b.id === selectedBlock.id ? (
                        <span className="text-[10px] font-semibold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

            {/* Crumb 4: Bootstrap Container (Interactive Toggle) */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={handleToggleContainer}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-mono text-[11px] font-medium border border-slate-200 transition cursor-pointer group"
                title={`Bootstrap Container: .${selectedBlock.settings.containerWidth || 'container'} • Click to toggle between fixed and fluid container`}
              >
                <Box className="w-3 h-3 text-slate-500 group-hover:text-blue-600 shrink-0" />
                <span>.{selectedBlock.settings.containerWidth || 'container'}</span>
                <span className="text-[9px] text-slate-400 font-sans hidden sm:inline group-hover:text-blue-600">
                  (toggle)
                </span>
              </button>
            </div>

            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />

            {/* Crumb 5: Grid Row & Columns */}
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 font-mono text-[11px] border border-slate-200"
                title={`Bootstrap Grid: .row with ${selectedBlock.settings.columns || 'auto'} column layout`}
              >
                <Grid className="w-3 h-3 text-slate-400 shrink-0" />
                <span>.row</span>
                {selectedBlock.settings.columns && (
                  <>
                    <span className="text-slate-300">/</span>
                    <Columns className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{selectedBlock.settings.columns} cols</span>
                  </>
                )}
              </div>
            </div>

            {/* Crumb 6: Visual Node Tag / AST Leaf (if visualNode present) */}
            {selectedBlock.visualNode && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                <div className="flex items-center shrink-0">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[11px] font-medium border border-purple-200"
                    title="Component Visual Node AST"
                  >
                    <Code2 className="w-3 h-3 text-purple-500 shrink-0" />
                    <span>&lt;{selectedBlock.visualNode.tag}&gt;</span>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* When NO block is selected: show overview prompt and quick block selector pills */
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-xs italic">
              All Sections ({blocks.length}):
            </span>
            <div className="flex items-center gap-1.5">
              {blocks.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBlock(b.id)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-[11px] font-medium transition cursor-pointer border border-slate-200 flex items-center gap-1"
                  title={`Click to select section #${idx + 1}: ${b.name}`}
                >
                  <span className="font-mono text-[9px] text-slate-400">#{idx + 1}</span>
                  <span className="max-w-[80px] truncate">{b.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Quick Stepper & Block Action Tools */}
      {selectedBlock && (
        <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
          {/* Previous / Next Sibling Stepper */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 text-slate-600">
            <button
              type="button"
              onClick={handlePrevBlock}
              disabled={selectedIndex <= 0}
              className="p-1 rounded hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous section (Up)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] font-mono font-medium text-slate-500">
              {selectedIndex + 1} / {blocks.length}
            </span>
            <button
              type="button"
              onClick={handleNextBlock}
              disabled={selectedIndex >= blocks.length - 1}
              className="p-1 rounded hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next section (Down)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Block Reorder Buttons */}
          {onMoveUp && onMoveDown && (
            <div className="hidden sm:flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onMoveUp(selectedBlock.id)}
                disabled={selectedIndex <= 0}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-25 transition cursor-pointer"
                title="Move section up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(selectedBlock.id)}
                disabled={selectedIndex >= blocks.length - 1}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-25 transition cursor-pointer"
                title="Move section down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Duplicate Button */}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(selectedBlock.id)}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer hidden md:inline-flex"
              title="Duplicate section"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy to Clipboard Manager Button */}
          {onCopyBlock && (
            <button
              type="button"
              onClick={() => onCopyBlock(selectedBlock.id)}
              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition cursor-pointer hidden sm:inline-flex"
              title="Copy block to Clipboard Manager (Ctrl+C)"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open Clipboard Manager / Paste Button */}
          {onOpenClipboard && clipboardCount > 0 && (
            <button
              type="button"
              onClick={onOpenClipboard}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded border border-blue-200 dark:border-blue-800 transition cursor-pointer"
              title="Open Clipboard Manager to paste into stack (Shift+Ctrl+V)"
            >
              <ClipboardList className="w-3 h-3" />
              <span>Paste ({clipboardCount})</span>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(selectedBlock.id)}
              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer hidden md:inline-flex"
              title="Delete section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open Block HTML/CSS Code Editor Button */}
          {onOpenCodeEditor && (
            <button
              type="button"
              id="breadcrumb-open-code-editor-btn"
              onClick={() => onOpenCodeEditor(selectedBlock.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition font-bold text-xs border cursor-pointer ${
                isDark
                  ? 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-800/80'
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
              }`}
              title="Edit Block HTML & CSS Code"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Edit Code</span>
            </button>
          )}

          {/* Open Settings Button */}
          <button
            type="button"
            onClick={() => onOpenSettings(selectedBlock.id)}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-md transition font-medium text-xs border border-slate-200 cursor-pointer"
            title="Open Block Settings"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          {/* Deselect Block */}
          <button
            type="button"
            onClick={onDeselectBlock}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
            title="Deselect section (View full page)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </nav>
  );
};
