import React, { useState, useRef } from 'react';
import {
  X,
  Sliders,
  Type,
  LayoutGrid,
  Palette,
  Maximize2,
  Layers,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ClipboardCopy,
  Upload,
  Image as ImageIcon,
  Check,
  Smartphone,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns2,
  Columns3,
  Square,
  Box,
  ChevronRight,
  Plus,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { BlockInstance, BlockSettings } from '../types';
import { BlockBackgroundPanel } from './BlockBackgroundPanel';
import { BlockSpacingPanel } from './BlockSpacingPanel';
import { BlockShadowsPanel } from './BlockShadowsPanel';
import { ResponsiveInspectorHud } from './ResponsiveInspectorHud';
import {
  Breakpoint,
  VisualNode,
  createDefaultVisualNode,
} from '../engine/bootstrapCascade';

export type BlockControlTab =
  | 'content'
  | 'layout'
  | 'style'
  | 'spacing'
  | 'shadows'
  | 'toggles'
  | 'responsive';

interface BlockSettingsDrawerProps {
  block: BlockInstance | null;
  blocks?: BlockInstance[];
  isOpen: boolean;
  onClose?: () => void;
  onSelectBlock?: (blockId: string) => void;
  onUpdateSettings: (blockId: string, settings: Partial<BlockInstance['settings']>) => void;
  onUpdateContent: (blockId: string, content: Partial<BlockInstance['content']>) => void;
  onUpdateVisualNode?: (blockId: string, node: VisualNode) => void;
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onCopyBlock?: (blockId: string) => void;
  onOpenCodeEditor?: (blockId: string) => void;
  onOpenLibrary?: () => void;
  isEmbedded?: boolean;
  themeMode?: 'light' | 'dark';
}

export const BlockSettingsDrawer: React.FC<BlockSettingsDrawerProps> = ({
  block,
  blocks = [],
  isOpen,
  onClose,
  onSelectBlock,
  onUpdateSettings,
  onUpdateContent,
  onUpdateVisualNode,
  activeBreakpoint = 'md',
  onBreakpointChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onCopyBlock,
  onOpenCodeEditor,
  onOpenLibrary,
  isEmbedded = true,
  themeMode = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<BlockControlTab>('content');
  const contentFileInputRef = useRef<HTMLInputElement>(null);
  const [currentFieldKey, setCurrentFieldKey] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  const isDark = themeMode === 'dark';

  if (!isOpen) return null;

  // Empty state when no block is selected
  if (!block) {
    return (
      <div
        id="block-settings-empty-state"
        className={`w-full h-full flex flex-col p-6 text-center select-none overflow-y-auto ${
          isDark ? 'bg-[#0b0f19] text-slate-200' : 'bg-slate-50/50 text-slate-800'
        }`}
      >
        <div className="my-auto flex flex-col items-center max-w-sm mx-auto">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border shadow-sm ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-cyan-400'
                : 'bg-white border-slate-200 text-blue-600'
            }`}
          >
            <Sliders className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold mb-1.5">No Block Selected</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Click any section on the canvas or select from the list below to inspect and use all its controls.
          </p>

          {/* Quick Page Sections List */}
          {blocks.length > 0 ? (
            <div className="w-full text-left space-y-1.5 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                Sections on this page ({blocks.length}):
              </span>
              <div
                className={`rounded-xl border divide-y overflow-hidden shadow-xs ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-800 divide-slate-800'
                    : 'bg-white border-slate-200 divide-slate-100'
                }`}
              >
                {blocks.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBlock && onSelectBlock(b.id)}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-xs font-medium transition text-left cursor-pointer ${
                      isDark
                        ? 'hover:bg-slate-800/80 text-slate-200'
                        : 'hover:bg-blue-50/60 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold">{b.name}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {b.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            onOpenLibrary && (
              <button
                type="button"
                onClick={onOpenLibrary}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Section</span>
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  const { settings, content } = block;

  const selectedIndex = blocks.findIndex((b) => b.id === block.id);
  const isFirst = selectedIndex === 0;
  const isLast = selectedIndex === blocks.length - 1;

  // Ensure block has a visualNode AST instance
  const visualNode: VisualNode =
    block.visualNode || createDefaultVisualNode(block.id, 'section', 'py-5');

  const handleNodeChange = (updatedNode: VisualNode) => {
    if (onUpdateVisualNode) {
      onUpdateVisualNode(block.id, updatedNode);
    }
  };

  const handleToggle = (key: keyof BlockInstance['settings']) => {
    onUpdateSettings(block.id, { [key]: !settings[key] });
  };

  const handleContentImageUpload = (fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          onUpdateContent(block.id, { [fieldKey]: result });
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCopyTrigger = () => {
    if (onCopyBlock) {
      onCopyBlock(block.id);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 1500);
    }
  };

  const controlTabs: {
    id: BlockControlTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: 'content', label: 'Content', icon: Type },
    {
      id: 'layout',
      label: 'Layout',
      icon: LayoutGrid,
      badge: settings.columns ? `${settings.columns} col` : undefined,
    },
    { id: 'style', label: 'Background', icon: Palette },
    { id: 'spacing', label: 'Spacing', icon: Maximize2 },
    { id: 'shadows', label: 'Shadows', icon: Layers },
    { id: 'toggles', label: 'Elements', icon: SlidersHorizontal },
    { id: 'responsive', label: 'Responsive', icon: Smartphone },
  ];

  return (
    <div
      id="block-settings-control-center"
      className={`w-full flex flex-col h-full overflow-hidden ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Hidden file input for content fields image upload */}
      <input
        ref={contentFileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (currentFieldKey) {
            handleContentImageUpload(currentFieldKey, e);
          }
        }}
        className="hidden"
      />

      {/* 1. TOP BLOCK CONTROLS BAR: Info & Instant Actions */}
      <div
        className={`p-3.5 border-b shrink-0 flex items-center justify-between ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isDark ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60' : 'bg-blue-100 text-blue-600'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold truncate leading-tight">{block.name}</h3>
              {selectedIndex !== -1 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  #{selectedIndex + 1}/{blocks.length}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium capitalize truncate">
              {block.type} Block • All Controls
            </p>
          </div>
        </div>

        {/* Action Button Group: Code Editor, Move Up, Move Down, Duplicate, Copy, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenCodeEditor && (
            <button
              type="button"
              id="block-settings-open-code-editor-btn"
              onClick={() => onOpenCodeEditor(block.id)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                isDark
                  ? 'bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border-cyan-800/80'
                  : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
              }`}
              title="Open Split-Pane HTML & CSS Code Editor"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onMoveUp(block.id)}
            disabled={isFirst}
            className={`p-1.5 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Move Section Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onMoveDown(block.id)}
            disabled={isLast}
            className={`p-1.5 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Move Section Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicate(block.id)}
            className={`p-1.5 rounded-md transition ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {onCopyBlock && (
            <button
              type="button"
              onClick={handleCopyTrigger}
              className={`p-1.5 rounded-md transition ${
                copiedState
                  ? 'text-emerald-500 bg-emerald-500/10'
                  : isDark
                  ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-200'
              }`}
              title="Copy to Block Clipboard (Ctrl+C)"
            >
              {copiedState ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
            </button>
          )}

          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition ml-1"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. TOOL NAVIGATION TABS: Compact grid ensuring all tools are instantly visible and accessible */}
      <div
        className={`p-1 border-b grid grid-cols-4 gap-1 shrink-0 ${
          isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-slate-100/80 border-slate-200'
        }`}
      >
        {controlTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`block-control-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition cursor-pointer text-center ${
                isActive
                  ? isDark
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800 shadow-xs ring-1 ring-cyan-500/30 font-bold'
                    : 'bg-white text-blue-600 border border-blue-200 shadow-xs ring-1 ring-blue-500/20 font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent font-medium'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-transparent font-medium'
              }`}
              title={tab.label}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5 shrink-0" />
              <span className="text-[9.5px] leading-tight truncate w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TOOL BODY PANELS */}
      <div
        className={`flex-1 overflow-y-auto p-2.5 sm:p-3 ${
          isDark ? 'bg-[#0b0f19]' : 'bg-slate-50/50'
        }`}
      >
        {/* SUBTAB: CONTENT & TEXT */}
        {activeTab === 'content' && (
          <div className="space-y-4" id="tool-panel-content">
            {onOpenCodeEditor && (
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark
                    ? 'bg-slate-900/95 border-cyan-900/60'
                    : 'bg-cyan-50/60 border-cyan-200/80'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Split-Pane HTML &amp; CSS Editor
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {block.category === 'html' || block.customHtml || block.customCss
                      ? 'This block uses custom HTML/CSS code. Click to open the live split-pane editor.'
                      : 'Want full code control? Edit this block’s raw Bootstrap 5 HTML & scoped CSS.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCodeEditor(block.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Edit Code</span>
                </button>
              </div>
            )}

            <div
              className={`p-4 rounded-xl border shadow-xs space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Text & Media Fields
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click fields below to edit text, or click directly on any text inside the canvas.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                {Object.entries(content).map(([key, val]) => {
                  if (typeof val !== 'string') return null;
                  const isLong = val.length > 50;
                  const isImg =
                    key.toLowerCase().includes('img') ||
                    key.toLowerCase().includes('avatar') ||
                    key.toLowerCase().includes('photo') ||
                    key.toLowerCase().includes('picture') ||
                    key.toLowerCase().includes('icon') ||
                    key.toLowerCase().includes('src');

                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        {isImg && (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentFieldKey(key);
                              contentFileInputRef.current?.click();
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload Image</span>
                          </button>
                        )}
                      </div>

                      {isLong ? (
                        <textarea
                          value={val}
                          onChange={(e) => onUpdateContent(block.id, { [key]: e.target.value })}
                          rows={3}
                          className={`w-full text-xs p-2.5 border rounded-xl outline-hidden focus:ring-2 transition ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20'
                              : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                          }`}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => onUpdateContent(block.id, { [key]: e.target.value })}
                            className={`w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 transition ${
                              isDark
                                ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500 focus:ring-cyan-500/20'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                            }`}
                          />
                          {isImg && (
                            <div
                              onClick={() => {
                                setCurrentFieldKey(key);
                                contentFileInputRef.current?.click();
                              }}
                              className={`w-9 h-9 rounded-lg shrink-0 border overflow-hidden cursor-pointer hover:opacity-80 transition relative ${
                                isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
                              }`}
                              title="Click to replace image"
                            >
                              <img src={val} alt="preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: LAYOUT & COLUMNS */}
        {activeTab === 'layout' && (
          <div className="space-y-4" id="tool-panel-layout">
            {/* Grid Columns */}
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Grid Columns
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Number of side-by-side columns on desktop screens
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400">
                  {settings.columns || 3} Columns
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 6].map((cols) => {
                  const isSelected = (settings.columns || 3) === cols;
                  return (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => onUpdateSettings(block.id, { columns: cols })}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border transition text-center cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-md ring-1 ring-cyan-400'
                            : 'bg-blue-600 text-white border-blue-600 shadow-md ring-1 ring-blue-400'
                          : isDark
                          ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cols} Col
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Container Width & Alignment */}
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-4 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Container Width & Alignment
              </h4>

              {/* Container Width */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Width Mode
                </span>
                <div
                  className={`flex p-0.5 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onUpdateSettings(block.id, { containerWidth: 'container' })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                      settings.containerWidth === 'container' || !settings.containerWidth
                        ? isDark
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Boxed (1320px)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings(block.id, { containerWidth: 'container-fluid' })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                      settings.containerWidth === 'container-fluid'
                        ? isDark
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Full Width
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Text Alignment
                </span>
                <div
                  className={`flex p-0.5 rounded-lg border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {[
                    { id: 'start', label: 'Left', icon: AlignLeft },
                    { id: 'center', label: 'Center', icon: AlignCenter },
                    { id: 'end', label: 'Right', icon: AlignRight },
                  ].map((align) => {
                    const Icon = align.icon;
                    const isSelected = (settings.alignment || 'center') === align.id;
                    return (
                      <button
                        key={align.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings(block.id, {
                            alignment: align.id as 'start' | 'center' | 'end',
                          })
                        }
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-slate-800 text-cyan-400 shadow-xs'
                              : 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{align.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: BACKGROUND & STYLING */}
        {activeTab === 'style' && (
          <div className="space-y-4" id="tool-panel-style">
            <BlockBackgroundPanel
              settings={settings}
              onUpdateSettings={(newSettings) => onUpdateSettings(block.id, newSettings)}
              blockId={block.id}
            />
          </div>
        )}

        {/* SUBTAB: SPACING & MARGINS */}
        {activeTab === 'spacing' && (
          <div className="space-y-4" id="tool-panel-spacing">
            <BlockSpacingPanel
              settings={settings}
              onUpdateSettings={(newSettings) => onUpdateSettings(block.id, newSettings)}
              blockId={block.id}
              activeBreakpoint={activeBreakpoint}
            />
          </div>
        )}

        {/* SUBTAB: SHADOWS & BORDERS */}
        {activeTab === 'shadows' && (
          <div className="space-y-4" id="tool-panel-shadows">
            <BlockShadowsPanel
              settings={settings}
              onUpdateSettings={(newSettings) => onUpdateSettings(block.id, newSettings)}
              blockId={block.id}
            />
          </div>
        )}

        {/* SUBTAB: ELEMENT TOGGLES */}
        {activeTab === 'toggles' && (
          <div className="space-y-4" id="tool-panel-toggles">
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Show / Hide Elements
              </h4>
              <div className="space-y-2.5">
                {[
                  { key: 'showTitle', label: 'Section Title & Headline' },
                  { key: 'showSubtitle', label: 'Subtitle & Category Badge' },
                  { key: 'showDescription', label: 'Description Paragraph' },
                  { key: 'showButtons', label: 'Action Call-To-Action Buttons' },
                  { key: 'showMedia', label: 'Media, Illustration & Image' },
                  { key: 'showIcons', label: 'Feature Icons & Counters' },
                ].map((item) => {
                  const isChecked = !!settings[item.key as keyof BlockInstance['settings']];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer select-none ${
                        isChecked
                          ? isDark
                            ? 'bg-slate-800/80 border-cyan-800/50 text-slate-100'
                            : 'bg-blue-50/50 border-blue-200 text-slate-900'
                          : isDark
                          ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                          : 'bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-xs font-medium">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(item.key as keyof BlockInstance['settings'])}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Button Style Options */}
            <div
              className={`p-4 rounded-xl border shadow-xs space-y-3 ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200/80'
              }`}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Button Shape & Style
              </h4>

              <label
                className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                  settings.buttonPill
                    ? isDark
                      ? 'bg-slate-800/80 border-cyan-800/50 text-slate-100'
                      : 'bg-blue-50/50 border-blue-200 text-slate-900'
                    : isDark
                    ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold block">Rounded Pill Buttons</span>
                  <span className="text-[10px] text-slate-500">Applies .rounded-pill to buttons</span>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.buttonPill}
                  onChange={() =>
                    onUpdateSettings(block.id, { buttonPill: !settings.buttonPill })
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
              </label>
            </div>
          </div>
        )}

        {/* SUBTAB: RESPONSIVE INSPECTOR */}
        {activeTab === 'responsive' && (
          <div className="space-y-4" id="tool-panel-responsive">
            <ResponsiveInspectorHud
              node={visualNode}
              onChangeNode={handleNodeChange}
              activeBreakpoint={activeBreakpoint}
              onBreakpointChange={onBreakpointChange}
              containerIsRow={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
