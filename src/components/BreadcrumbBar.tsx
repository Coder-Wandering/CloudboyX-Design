import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Globe,
  Layers,
  Box,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  X,
  Code2,
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const selectedBlock = selectedIndex !== -1 ? blocks[selectedIndex] : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBlockDropdownOpen(false);
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

  return (
    <nav
      id="editor-breadcrumb-bar"
      aria-label="Block Hierarchy Navigation"
      className={`w-full border-b px-3.5 py-1 flex items-center justify-between text-xs z-20 shrink-0 select-none min-h-[36px] transition-colors duration-200 ${
        isDark
          ? 'bg-[#0b0f19] border-slate-800/90 text-slate-300'
          : 'bg-slate-50/90 border-slate-200/80 text-slate-700'
      }`}
    >
      {/* Left: Clean Page & Section Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 mr-2 py-0.5">
        {/* Page Root Button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenPageSettings) {
              onOpenPageSettings();
            } else {
              onDeselectBlock();
            }
          }}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition font-medium cursor-pointer shrink-0 ${
            isDark
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          title="Page Settings & SEO"
        >
          <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-semibold max-w-[130px] truncate">
            {projectTitle || 'Home Page'}
          </span>
        </button>

        <ChevronRight className={`w-3 h-3 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />

        {/* Section Selector Dropdown + Quick Section Strip */}
        <div className="relative flex items-center shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsBlockDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${
              selectedBlock
                ? isDark
                  ? 'bg-slate-900 text-white border-slate-700 hover:border-slate-600'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs'
                : isDark
                ? 'bg-slate-900/60 text-slate-400 border-slate-800'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="Jump to any section on this page"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            {selectedBlock ? (
              <>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedIndex + 1}/{blocks.length}
                </span>
                <span className="max-w-[160px] truncate">{selectedBlock.name}</span>
              </>
            ) : (
              <span>All Sections ({blocks.length})</span>
            )}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isBlockDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-1.5 w-64 rounded-xl shadow-2xl border py-1.5 z-50 max-h-72 overflow-y-auto ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span>Page Sections</span>
                <span>{blocks.length}</span>
              </div>
              {blocks.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onSelectBlock(b.id);
                    setIsBlockDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between text-xs text-left transition cursor-pointer ${
                    b.id === selectedBlock?.id
                      ? isDark
                        ? 'bg-blue-950/60 font-semibold text-blue-400'
                        : 'bg-blue-50 font-semibold text-blue-600'
                      : isDark
                      ? 'hover:bg-slate-800'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="truncate">{b.name}</span>
                  </div>
                  {b.id === selectedBlock?.id && (
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quiet inline metadata for selected section */}
        {selectedBlock && (
          <div className="hidden md:flex items-center gap-2 pl-2 text-[11px] text-slate-400">
            <span className="capitalize">{selectedBlock.category}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleToggleContainer}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200/70 text-slate-600'
              }`}
              title="Click to toggle between fixed (.container) and full-width (.container-fluid)"
            >
              <Box className="w-3 h-3 text-slate-400" />
              <span>{selectedBlock.settings.containerWidth === 'container-fluid' ? 'Fluid Width' : 'Fixed Container'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Clean Contextual Actions for Selected Section */}
      {selectedBlock && (
        <div className="flex items-center gap-1 shrink-0">
          {/* Prev / Next Section Stepper */}
          <div
            className={`hidden sm:flex items-center rounded-lg p-0.5 border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={handlePrevBlock}
              disabled={selectedIndex <= 0}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
              title="Previous section"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextBlock}
              disabled={selectedIndex >= blocks.length - 1}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition cursor-pointer"
              title="Next section"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Move Up / Down */}
          {onMoveUp && onMoveDown && (
            <div className="hidden sm:flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => onMoveUp(selectedBlock.id)}
                disabled={selectedIndex <= 0}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg disabled:opacity-25 transition cursor-pointer"
                title="Move section up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown(selectedBlock.id)}
                disabled={selectedIndex >= blocks.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg disabled:opacity-25 transition cursor-pointer"
                title="Move section down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Duplicate */}
          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(selectedBlock.id)}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer hidden md:inline-flex"
              title="Duplicate section"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy to Clipboard */}
          {onCopyBlock && (
            <button
              type="button"
              onClick={() => onCopyBlock(selectedBlock.id)}
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer hidden sm:inline-flex"
              title="Copy section to Clipboard (Ctrl+C)"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenClipboard && clipboardCount > 0 && (
            <button
              type="button"
              onClick={onOpenClipboard}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 transition cursor-pointer"
              title="Paste from Clipboard Manager"
            >
              <ClipboardList className="w-3 h-3" />
              <span>Paste ({clipboardCount})</span>
            </button>
          )}

          {/* Edit HTML/CSS Code */}
          {onOpenCodeEditor && (
            <button
              type="button"
              id="breadcrumb-open-code-editor-btn"
              onClick={() => onOpenCodeEditor(selectedBlock.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-semibold text-xs border cursor-pointer ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Edit Section HTML & CSS"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Code</span>
            </button>
          )}

          {/* Inspect Settings */}
          <button
            type="button"
            onClick={() => onOpenSettings(selectedBlock.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-semibold text-xs border cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Inspect Section Settings"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden lg:inline">Settings</span>
          </button>

          {/* Delete */}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(selectedBlock.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
              title="Delete section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Deselect */}
          <button
            type="button"
            onClick={onDeselectBlock}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
            title="Deselect section"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </nav>
  );
};

