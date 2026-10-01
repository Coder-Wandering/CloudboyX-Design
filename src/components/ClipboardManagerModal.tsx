import React, { useState } from 'react';
import {
  ClipboardList,
  Copy,
  Trash2,
  X,
  ArrowDown,
  ArrowUp,
  Check,
  Plus,
  Layers,
  Sparkles,
  Clock,
  ArrowRight,
  HelpCircle,
  FileCode,
  Download,
} from 'lucide-react';
import { BlockInstance, BlockCategory, ClipboardBlockItem } from '../types';

interface ClipboardManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clipboardHistory: ClipboardBlockItem[];
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  onPasteBlock: (blockToPaste: BlockInstance, targetIndex: number) => void;
  onClearClipboard: () => void;
  onRemoveClipboardItem: (id: string) => void;
  themeMode?: 'light' | 'dark';
}

const CATEGORY_STYLES: Record<BlockCategory, { bg: string; text: string; border: string }> = {
  headers: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  navbars: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' },
  features: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  content: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/30' },
  pricing: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  gallery: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/30' },
  testimonials: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  team: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' },
  forms: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
  footers: { bg: 'bg-slate-600/10', text: 'text-slate-700 dark:text-slate-200', border: 'border-slate-600/30' },
};

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const ClipboardManagerModal: React.FC<ClipboardManagerModalProps> = ({
  isOpen,
  onClose,
  clipboardHistory,
  blocks,
  selectedBlockId,
  onPasteBlock,
  onClearClipboard,
  onRemoveClipboardItem,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active item defaults to first item if not chosen or if chosen is deleted
  const activeItem =
    clipboardHistory.find((item) => item.id === selectedItemId) ||
    clipboardHistory[0] ||
    null;

  const selectedBlockIndex = blocks.findIndex((b) => b.id === selectedBlockId);

  const handlePasteAt = (targetIndex: number) => {
    if (!activeItem) return;
    onPasteBlock(activeItem.block, targetIndex);
  };

  const handleCopyJson = (item: ClipboardBlockItem) => {
    navigator.clipboard.writeText(JSON.stringify(item.block, null, 2));
    setCopiedSnippetId(item.id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      id="clipboard-manager-modal"
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden ${
          isDark
            ? 'bg-[#0f172a] text-slate-100 border-slate-700/80 shadow-black/80'
            : 'bg-white text-slate-900 border-slate-200 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Clipboard Manager</h3>
                <span className="px-2 py-0.5 text-[11px] font-semibold font-mono rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  {clipboardHistory.length} {clipboardHistory.length === 1 ? 'block' : 'blocks'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Copy selected blocks and paste them anywhere in your website's vertical stack.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {clipboardHistory.length > 0 && (
              <button
                type="button"
                onClick={onClearClipboard}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 dark:hover:text-red-400 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer font-medium"
                title="Clear all stored clipboard blocks"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {clipboardHistory.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center flex flex-col items-center justify-center flex-1 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Copy className="w-8 h-8 opacity-80" />
            </div>
            <h4 className="text-base font-bold mb-1">Clipboard is Empty</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
              You haven't copied any blocks yet. Select any section on your website canvas or breadcrumb bar, then press{' '}
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-bold">
                Ctrl+C
              </kbd>{' '}
              or click the <strong>Copy</strong> icon to save it here.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold text-[10px]">Ctrl+C</kbd>
                <span>Copy Selected Block</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold text-[10px]">Ctrl+V</kbd>
                <span>Quick-Paste Below</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <kbd className="font-mono font-bold text-[10px]">Shift+Ctrl+V</kbd>
                <span>Open Clipboard Manager</span>
              </div>
            </div>
          </div>
        ) : (
          /* Dual-Column Layout: Left (Clipboard History) & Right (Position Selector in Stack) */
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Left Column: Copied Blocks in History */}
            <div className="md:col-span-5 flex flex-col min-h-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Copied Blocks ({clipboardHistory.length})</span>
                <span className="text-[10px] text-slate-400">Select block to paste</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {clipboardHistory.map((item, idx) => {
                  const isSelected = activeItem?.id === item.id;
                  const catStyle =
                    CATEGORY_STYLES[item.block.category] || CATEGORY_STYLES.content;

                  const titleSnippet =
                    item.block.content?.title ||
                    item.block.content?.heading ||
                    item.block.content?.tagline ||
                    item.block.name;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`relative group p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? isDark
                            ? 'bg-blue-950/40 border-blue-500/80 ring-2 ring-blue-500/30'
                            : 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20'
                          : isDark
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                          >
                            {item.block.category}
                          </span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-600 text-white">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyJson(item);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                            title="Copy block JSON snippet"
                          >
                            {copiedSnippetId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <FileCode className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveClipboardItem(item.id);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                            title="Remove from clipboard"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">
                        {item.block.name}
                      </h5>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        &quot;{titleSnippet}&quot;
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(item.copiedAt)}</span>
                        </div>
                        <span className="font-mono text-slate-400 dark:text-slate-500">
                          {item.block.settings.containerWidth === 'container-fluid' ? 'fluid' : 'fixed'} •{' '}
                          {item.block.settings.bgType}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick One-Click Actions for Selected Clipboard Block */}
              {activeItem && (
                <div
                  className={`p-3 border-t shrink-0 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Quick Paste &quot;{activeItem.block.name}&quot;:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePasteAt(0)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>Paste at Top (#1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePasteAt(blocks.length)}
                      className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                      <span>Paste at Bottom (#{blocks.length + 1})</span>
                    </button>

                    {selectedBlockIndex !== -1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => handlePasteAt(selectedBlockIndex)}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                          <span>Above Selected (#{selectedBlockIndex + 1})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePasteAt(selectedBlockIndex + 1)}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-blue-500/40 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                          <span>Below Selected (#{selectedBlockIndex + 2})</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Block Stack Position Picker */}
            <div className="md:col-span-7 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-[#0f172a]">
              <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>Choose Target Position in Stack ({blocks.length} Sections)</span>
                </div>
                <span className="text-[11px] text-slate-400">Click any &quot;Paste Here&quot; slot</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeItem ? (
                  <>
                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 mb-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">Ready to Paste:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {activeItem.block.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        category: {activeItem.block.category}
                      </span>
                    </div>

                    {/* Slot 0: Top of Stack */}
                    <button
                      type="button"
                      onClick={() => handlePasteAt(0)}
                      className="w-full py-2 px-3 rounded-lg border-2 border-dashed border-blue-400/60 dark:border-blue-500/50 hover:border-blue-500 hover:bg-blue-50/80 dark:hover:bg-blue-950/50 transition-all flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 group cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                      <span>Paste as Section #1 (Top of Page)</span>
                    </button>

                    {/* Current Block Stack with Interleaved Insertion Slots */}
                    {blocks.map((block, idx) => {
                      const isSelected = block.id === selectedBlockId;
                      const catStyle =
                        CATEGORY_STYLES[block.category] || CATEGORY_STYLES.content;

                      return (
                        <React.Fragment key={block.id}>
                          {/* Existing Block Card */}
                          <div
                            className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs transition ${
                              isSelected
                                ? isDark
                                  ? 'bg-blue-900/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/40'
                                  : 'bg-blue-50/90 border-blue-300 text-blue-900 ring-1 ring-blue-300'
                                : isDark
                                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5">
                                #{idx + 1}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                              >
                                {block.category}
                              </span>
                              <span className="font-semibold truncate">{block.name}</span>
                            </div>

                            {isSelected && (
                              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                Currently Selected
                              </span>
                            )}
                          </div>

                          {/* Inter-block Paste Slot */}
                          <button
                            type="button"
                            onClick={() => handlePasteAt(idx + 1)}
                            className="w-full py-1.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-all flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 group cursor-pointer"
                          >
                            <Plus className="w-3 h-3 group-hover:scale-125 transition-transform" />
                            <span>
                              Paste Here (Between #{idx + 1} and #{idx + 2 > blocks.length ? 'End' : idx + 2})
                            </span>
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Please select a block from the clipboard history on the left.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer / Shortcut Tips */}
        <div
          className={`px-6 py-3 border-t flex flex-wrap items-center justify-between text-xs shrink-0 ${
            isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-600 dark:text-slate-300">Quick Tips:</span>
            <span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 rounded font-bold">Ctrl+C</kbd> copies selected block
            </span>
            <span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 rounded font-bold">Ctrl+V</kbd> pastes below selected block
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-medium text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
