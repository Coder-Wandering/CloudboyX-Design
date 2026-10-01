import React, { useEffect, useRef, useState } from 'react';
import {
  Sliders,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  ArrowDownCircle,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Maximize2,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Sparkles,
  Play,
  ClipboardList,
  ClipboardCopy,
  GripVertical,
  Layers,
  Code2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, ViewportMode, SeoSettings, BlockAnimationMeta } from '../types';
import { generateCompleteHtml } from '../utils/htmlGenerator';
import {
  Breakpoint,
  BREAKPOINT_ORDER,
  BREAKPOINT_LABELS,
  BOOTSTRAP_CONTAINER_MAX_WIDTH,
  BREAKPOINT_QUERY_MAP,
} from '../engine/bootstrapCascade';
import { ShortcutHint } from './ShortcutHint';

interface CanvasFrameProps {
  blocks: BlockInstance[];
  theme: SiteTheme;
  projectTitle: string;
  seoSettings?: SeoSettings;
  viewport: ViewportMode;
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onOpenSettings: (id: string) => void;
  onOpenCodeEditor?: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onReorderBlocks?: (sourceIndex: number, destinationIndex: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onInlineTextChange: (blockId: string, field: string, value: string) => void;
  onOpenLibrary: () => void;
  onAddBlock: (blockType: string) => void;
  isPreviewMode: boolean;
  isDesignModeOpen?: boolean;
  themeMode?: 'light' | 'dark';
  onOpenLivePreview?: () => void;
  onCopyBlock?: (id: string) => void;
  onPasteLatest?: (position?: 'below' | 'above' | 'top' | 'bottom') => void;
  onOpenClipboard?: () => void;
  clipboardCount?: number;
  animationMeta?: BlockAnimationMeta | null;
}

const BREAKPOINT_DEVICE_ICONS: Record<Breakpoint, React.ElementType> = {
  xs: Smartphone,
  sm: Smartphone,
  md: Tablet,
  lg: Laptop,
  xl: Monitor,
  xxl: Maximize2,
};

const BREAKPOINT_FRAME_CONFIG: Record<
  Breakpoint,
  {
    widthLabel: string;
    targetWidth: number;
    containerClass: string;
    deviceType: string;
    hasBezel: boolean;
  }
> = {
  xs: {
    widthLabel: '390px',
    targetWidth: 390,
    containerClass:
      'w-[390px] h-[844px] my-5 rounded-[36px] shadow-2xl border-[8px] border-slate-800 bg-white ring-1 ring-slate-900/10 overflow-hidden',
    deviceType: 'Mobile Phone (Portrait)',
    hasBezel: true,
  },
  sm: {
    widthLabel: '576px',
    targetWidth: 576,
    containerClass:
      'w-[576px] h-[840px] my-5 rounded-[24px] shadow-2xl border-[6px] border-slate-800 bg-white ring-1 ring-slate-900/10 overflow-hidden',
    deviceType: 'Large Mobile / Landscape',
    hasBezel: true,
  },
  md: {
    widthLabel: '768px',
    targetWidth: 768,
    containerClass:
      'w-[768px] h-[1024px] my-5 rounded-[20px] shadow-2xl border-[6px] border-slate-800 bg-white ring-1 ring-slate-900/10 overflow-hidden',
    deviceType: 'Tablet / iPad',
    hasBezel: true,
  },
  lg: {
    widthLabel: '992px',
    targetWidth: 992,
    containerClass:
      'w-full max-w-[1040px] min-h-[750px] my-3 rounded-[12px] shadow-2xl border-[3px] border-slate-700 bg-white ring-1 ring-slate-900/10 overflow-hidden',
    deviceType: 'Laptop / Netbook',
    hasBezel: false,
  },
  xl: {
    widthLabel: '1200px',
    targetWidth: 1200,
    containerClass:
      'w-full max-w-[1380px] min-h-[820px] my-3 rounded-[8px] shadow-xl border-[2px] border-slate-600 bg-white ring-1 ring-slate-900/10 overflow-hidden',
    deviceType: 'Standard Desktop',
    hasBezel: false,
  },
  xxl: {
    widthLabel: '100% Fluid',
    targetWidth: 1440,
    containerClass: 'w-full flex-1 min-h-0 bg-white shadow-xs',
    deviceType: 'Ultra-wide / Full Canvas',
    hasBezel: false,
  },
};

export const CanvasFrame: React.FC<CanvasFrameProps> = ({
  blocks,
  theme,
  projectTitle,
  seoSettings,
  viewport,
  activeBreakpoint = 'lg',
  onBreakpointChange,
  selectedBlockId,
  onSelectBlock,
  onOpenSettings,
  onOpenCodeEditor,
  onMoveUp,
  onMoveDown,
  onReorderBlocks,
  onDuplicate,
  onDelete,
  onInlineTextChange,
  onOpenLibrary,
  onAddBlock,
  isPreviewMode,
  isDesignModeOpen = false,
  themeMode,
  onOpenLivePreview,
  onCopyBlock,
  onPasteLatest,
  onOpenClipboard,
  clipboardCount = 0,
  animationMeta,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCascadeInfo, setShowCascadeInfo] = useState(false);

  // Standard browser Drag-and-Drop state for reordering BlockInstances in Canvas view
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Fallback helper if onReorderBlocks is not passed directly
  const executeBlockReorder = (sourceIndex: number, destinationIndex: number) => {
    if (
      sourceIndex < 0 ||
      sourceIndex >= blocks.length ||
      destinationIndex < 0 ||
      destinationIndex >= blocks.length ||
      sourceIndex === destinationIndex
    ) {
      return;
    }
    if (onReorderBlocks) {
      onReorderBlocks(sourceIndex, destinationIndex);
      return;
    }
    // Fallback using sequential moveUp/moveDown if needed
    const targetBlock = blocks[sourceIndex];
    if (!targetBlock) return;
    if (destinationIndex < sourceIndex) {
      for (let i = sourceIndex; i > destinationIndex; i--) {
        onMoveUp(targetBlock.id);
      }
    } else {
      for (let i = sourceIndex; i < destinationIndex; i++) {
        onMoveDown(targetBlock.id);
      }
    }
  };

  // Standard browser HTML5 Drag-and-Drop handlers for BlockInstance items in CanvasFrame
  const handleBlockDragStart = (
    e: React.DragEvent<HTMLElement>,
    block: BlockInstance,
    index: number
  ) => {
    e.stopPropagation();
    setDraggedBlockId(block.id);
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData(
        'application/x-canvas-block-reorder',
        JSON.stringify({ blockId: block.id, index })
      );
    } catch {
      // ignore
    }
  };

  const handleBlockDragOver = (
    e: React.DragEvent<HTMLElement>,
    targetBlock: BlockInstance,
    targetIndex: number
  ) => {
    const isReorderDrag =
      draggedBlockId !== null ||
      Array.from(e.dataTransfer.types).includes('application/x-canvas-block-reorder');
    if (!isReorderDrag) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    if (draggedBlockId === targetBlock.id) {
      setDragOverBlockId(null);
      setDropPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const isHorizontal = rect.width > rect.height * 1.5;
    const pos: 'before' | 'after' = isHorizontal
      ? e.clientX < rect.left + rect.width / 2
        ? 'before'
        : 'after'
      : e.clientY < rect.top + rect.height / 2
      ? 'before'
      : 'after';

    if (dragOverBlockId !== targetBlock.id || dropPosition !== pos) {
      setDragOverBlockId(targetBlock.id);
      setDropPosition(pos);
    }
  };

  const handleBlockDragLeave = (e: React.DragEvent<HTMLElement>, blockId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverBlockId === blockId) {
        setDragOverBlockId(null);
        setDropPosition(null);
      }
    }
  };

  const handleBlockDrop = (
    e: React.DragEvent<HTMLElement>,
    targetBlock: BlockInstance,
    targetIndex: number
  ) => {
    let sourceIdx = draggedBlockIndex;
    if (sourceIdx === null) {
      try {
        const raw = e.dataTransfer.getData('application/x-canvas-block-reorder');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.index === 'number') {
            sourceIdx = parsed.index;
          }
        }
      } catch {
        // ignore
      }
    }

    if (sourceIdx === null || sourceIdx === undefined) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const isHorizontal = rect.width > rect.height * 1.5;
    const pos: 'before' | 'after' =
      dropPosition ||
      (isHorizontal
        ? e.clientX < rect.left + rect.width / 2
          ? 'before'
          : 'after'
        : e.clientY < rect.top + rect.height / 2
        ? 'before'
        : 'after');

    const rawInsertIndex = pos === 'before' ? targetIndex : targetIndex + 1;
    const destinationIndex =
      sourceIdx < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;

    setDraggedBlockId(null);
    setDraggedBlockIndex(null);
    setDragOverBlockId(null);
    setDropPosition(null);

    if (sourceIdx !== destinationIndex) {
      executeBlockReorder(sourceIdx, destinationIndex);
    }
  };

  const handleBlockDragEnd = () => {
    setDraggedBlockId(null);
    setDraggedBlockIndex(null);
    setDragOverBlockId(null);
    setDropPosition(null);
  };

  // Derive current active breakpoint (fallback to viewport mapping if not explicitly set)
  const currentBp: Breakpoint = (activeBreakpoint ||
    (viewport === 'mobile' ? 'xs' : viewport === 'tablet' ? 'md' : 'lg')) as Breakpoint;

  const currentFrameConfig = BREAKPOINT_FRAME_CONFIG[currentBp];
  const CurrentDeviceIcon = BREAKPOINT_DEVICE_ICONS[currentBp];

  // Generate full HTML with active animationMeta
  const htmlContent = generateCompleteHtml(
    blocks,
    theme,
    projectTitle,
    !isPreviewMode,
    selectedBlockId,
    seoSettings,
    animationMeta
  );

  // Post message to iframe whenever block animation is triggered
  useEffect(() => {
    if (animationMeta && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'ANIMATE_BLOCK',
            meta: animationMeta,
          },
          '*'
        );
      } catch (err) {
        // Fallback for cross-origin or initial mount
      }
    }
  }, [animationMeta]);

  // Handle postMessage from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;

      if (e.data.type === 'BLOCK_CLICKED' && e.data.blockId) {
        onSelectBlock(e.data.blockId);
      }

      if (e.data.type === 'OPEN_BLOCK_CODE_EDITOR' && e.data.blockId) {
        onSelectBlock(e.data.blockId);
        if (onOpenCodeEditor) {
          onOpenCodeEditor(e.data.blockId);
        }
      }

      if (e.data.type === 'BLOCK_DRAG_START') {
        setDraggedBlockId(e.data.blockId || null);
        setDraggedBlockIndex(typeof e.data.index === 'number' ? e.data.index : null);
      }

      if (e.data.type === 'BLOCK_DRAG_OVER') {
        setDragOverBlockId(e.data.targetBlockId || null);
        setDropPosition(e.data.position || null);
      }

      if (e.data.type === 'BLOCK_DRAG_END') {
        setDraggedBlockId(null);
        setDraggedBlockIndex(null);
        setDragOverBlockId(null);
        setDropPosition(null);
      }

      if (
        e.data.type === 'BLOCK_REORDERED' &&
        typeof e.data.sourceIndex === 'number' &&
        typeof e.data.destinationIndex === 'number'
      ) {
        setDraggedBlockId(null);
        setDraggedBlockIndex(null);
        setDragOverBlockId(null);
        setDropPosition(null);
        executeBlockReorder(e.data.sourceIndex, e.data.destinationIndex);
      }

      if (e.data.type === 'INLINE_TEXT_CHANGED') {
        const { blockId, field, value } = e.data;
        if (blockId && field) {
          onInlineTextChange(blockId, field, value);
        }
      }

      if (e.data.type === 'IFRAME_KEYBOARD_SHORTCUT') {
        const k = (e.data.key || '').toLowerCase();
        if (k === 'c' && selectedBlockId && onCopyBlock) {
          onCopyBlock(selectedBlockId);
        } else if (k === 'v') {
          if (e.data.shiftKey && onOpenClipboard) {
            onOpenClipboard();
          } else if (onPasteLatest) {
            onPasteLatest('below');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    onSelectBlock,
    onOpenCodeEditor,
    onInlineTextChange,
    selectedBlockId,
    onCopyBlock,
    onPasteLatest,
    onOpenClipboard,
    blocks,
    onReorderBlocks,
    onMoveUp,
    onMoveDown,
  ]);

  // Scroll iframe to selected block on external selection (breadcrumbs, sidebar)
  useEffect(() => {
    if (selectedBlockId && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'SCROLL_TO_BLOCK',
            blockId: selectedBlockId,
          },
          '*'
        );
      } catch (err) {
        // Cross-origin or loading fallback
      }
    }
  }, [selectedBlockId]);

  // Live instant update of injected custom CSS inside the running iframe document
  useEffect(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const styleEl = iframeRef.current.contentDocument.getElementById('studio-custom-css');
        if (styleEl) {
          styleEl.textContent = theme.customCss || '';
        }
      }
    } catch {
      // Cross-origin or loading fallback
    }
  }, [theme.customCss]);

  // Drag and drop handlers for external library block insertion
  const handleDragOver = (e: React.DragEvent) => {
    const isReorderDrag =
      draggedBlockId !== null ||
      Array.from(e.dataTransfer.types).includes('application/x-canvas-block-reorder');
    if (isReorderDrag) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    const isReorderDrag =
      draggedBlockId !== null ||
      Array.from(e.dataTransfer.types).includes('application/x-canvas-block-reorder');
    if (isReorderDrag) {
      e.preventDefault();
      setIsDragOver(false);
      return;
    }
    e.preventDefault();
    setIsDragOver(false);
    const blockType =
      e.dataTransfer.getData('application/bootstrap-block') ||
      e.dataTransfer.getData('text/plain');
    if (blockType) {
      onAddBlock(blockType);
    }
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
  const selectedIndex = blocks.findIndex((b) => b.id === selectedBlockId);
  const isDark = (themeMode ? themeMode === 'dark' : theme.colorMode === 'dark');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 overflow-auto flex flex-col items-center justify-start min-h-0 transition-colors duration-200 ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-200/70 text-slate-900'
      }`}
    >
      {/* Visual Drag & Drop Overlay Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-blue-600/15 backdrop-blur-2xs border-4 border-dashed border-blue-500 flex items-center justify-center pointer-events-none animate-in fade-in duration-150 m-2 rounded-2xl">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-blue-200 flex items-center gap-3 text-blue-600 font-bold text-sm">
            <ArrowDownCircle className="w-6 h-6 animate-bounce" />
            <span>Release to Drop & Insert Bootstrap Component</span>
          </div>
        </div>
      )}

      {/* 1. TOP RESPONSIVE BREAKPOINT RULER & ACTIVE CASCADE TIER BANNER */}
      {!isPreviewMode && (
        <div
          id="bootstrap-breakpoint-canvas-ruler"
          className="w-full bg-slate-900 text-slate-200 px-4 py-2.5 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0 z-20 shadow-md select-none"
        >
          {/* Active Cascade Tier Status Pill with Glowing Dot */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <span className="text-slate-400 font-normal">Active Tier:</span>
                <span className="text-blue-400 uppercase font-mono font-bold tracking-wide">
                  {currentBp}
                </span>
                <span className="text-slate-400 font-medium">({BREAKPOINT_LABELS[currentBp].label})</span>
              </span>
            </div>

            {/* Quick Specs Badge */}
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Range: <strong className="text-amber-300">{BREAKPOINT_LABELS[currentBp].pixelRange}</strong>
              </span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Infix: <strong className="text-emerald-400">{currentBp === 'xs' ? 'none (base)' : `-${currentBp}-`}</strong>
              </span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                Max Container: <strong className="text-slate-200">{BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp]}</strong>
              </span>
            </div>

            {/* Selected Block Info in Top Ruler */}
            {selectedBlock && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400 font-normal">Active:</span>
                <span className="font-bold text-cyan-400 truncate max-w-[140px]">{selectedBlock.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">({selectedIndex + 1}/{blocks.length})</span>
                {onOpenCodeEditor && (
                  <button
                    type="button"
                    id="canvas-ruler-open-code-editor-btn"
                    onClick={() => onOpenCodeEditor(selectedBlock.id)}
                    className="ml-1 px-1.5 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                    title="Edit Block HTML & CSS Code"
                  >
                    <Code2 className="w-3 h-3" />
                    <span>HTML/CSS</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 6 Bootstrap Breakpoints (Mobile-First Cascade: xs -> xxl) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
            {BREAKPOINT_ORDER.map((bp) => {
              const Icon = BREAKPOINT_DEVICE_ICONS[bp];
              const isActive = bp === currentBp;
              const isLower = BREAKPOINT_ORDER.indexOf(bp) < BREAKPOINT_ORDER.indexOf(currentBp);
              const isHigher = BREAKPOINT_ORDER.indexOf(bp) > BREAKPOINT_ORDER.indexOf(currentBp);

              return (
                <button
                  key={bp}
                  type="button"
                  id={`canvas-bp-btn-${bp}`}
                  onClick={() => onBreakpointChange && onBreakpointChange(bp)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-md'
                      : isLower
                      ? 'text-amber-300/80 hover:text-amber-200 hover:bg-slate-800/80 border border-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                  title={`${BREAKPOINT_LABELS[bp].label} (${BREAKPOINT_LABELS[bp].pixelRange}) - Click to preview and target this tier`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="uppercase">{bp}</span>
                  <span className="text-[10px] font-normal opacity-75 hidden xl:inline">
                    {BREAKPOINT_LABELS[bp].desc}
                  </span>
                  {isActive && (
                    <span className="text-[9px] bg-blue-700 text-blue-100 px-1 py-0.2 rounded font-sans font-bold uppercase ml-0.5">
                      EDITING
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1B. DIRECT CANVAS BLOCK INSTANCE DRAG-AND-DROP REORDER BAR */}
      {!isPreviewMode && blocks.length > 0 && (
        <div
          id="canvas-block-instances-reorder-bar"
          className={`w-full px-4 py-1.5 border-b flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 z-10 select-none transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-800/90 text-slate-200'
              : 'bg-white/90 border-slate-200 text-slate-800 backdrop-blur-xs'
          }`}
        >
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-300 dark:border-slate-800 shrink-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Canvas Sections</span>
            <span className="font-mono text-[10px] opacity-75">({blocks.length})</span>
          </div>

          <div
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
            role="list"
            aria-label="Draggable canvas block instances"
          >
            {blocks.map((block, index) => {
              const isSelected = block.id === selectedBlockId;
              const isDragging = block.id === draggedBlockId;
              const isDragTarget = block.id === dragOverBlockId;
              const showDropBefore = isDragTarget && dropPosition === 'before';
              const showDropAfter = isDragTarget && dropPosition === 'after';

              return (
                <div
                  key={block.id}
                  role="listitem"
                  draggable
                  onDragStart={(e) => handleBlockDragStart(e, block, index)}
                  onDragOver={(e) => handleBlockDragOver(e, block, index)}
                  onDragLeave={(e) => handleBlockDragLeave(e, block.id)}
                  onDrop={(e) => handleBlockDrop(e, block, index)}
                  onDragEnd={handleBlockDragEnd}
                  onClick={() => onSelectBlock(block.id)}
                  onDoubleClick={() => onOpenSettings(block.id)}
                  title={`Drag handle to reorder "${block.name}" (Position #${index + 1}) • Click to select • Double-click for settings`}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 border ${
                    isDragging
                      ? 'opacity-40 scale-95 border-dashed border-blue-500 bg-blue-500/10'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border-slate-200/90'
                  } ${showDropBefore ? 'ring-2 ring-blue-500 border-l-4 border-l-blue-500' : ''} ${
                    showDropAfter ? 'ring-2 ring-blue-500 border-r-4 border-r-blue-500' : ''
                  }`}
                >
                  {/* Visible Drag-Handle Icon */}
                  <span
                    className={`inline-flex items-center justify-center p-0.5 rounded cursor-grab active:cursor-grabbing transition-colors ${
                      isSelected
                        ? 'text-blue-100 hover:text-white hover:bg-blue-700/60'
                        : 'text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400'
                    }`}
                    aria-label={`Drag handle for ${block.name}`}
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>

                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {index + 1}.
                  </span>

                  <span className="truncate max-w-[120px]">{block.name}</span>
                </div>
              );
            })}
          </div>

          {draggedBlockId && (
            <div className="ml-auto hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-blue-500 animate-pulse shrink-0">
              <GripVertical className="w-3.5 h-3.5" />
              <span>Drop on any section to reorder</span>
            </div>
          )}
        </div>
      )}

      {/* Active Block Animation Floating Pill Banner */}
      {animationMeta && (
        <div
          key={animationMeta.timestamp}
          className="sticky top-2 z-40 my-1 pointer-events-none animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200"
        >
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white shadow-lg border border-blue-400/40 backdrop-blur-md text-xs font-semibold tracking-wide select-none">
            {animationMeta.type === 'moved-up' ? (
              <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
            ) : animationMeta.type === 'moved-down' ? (
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            ) : animationMeta.type === 'duplicated' ? (
              <Copy className="w-3.5 h-3.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {animationMeta.type === 'moved-up'
                ? 'Section Moved Up'
                : animationMeta.type === 'moved-down'
                ? 'Section Moved Down'
                : animationMeta.type === 'duplicated'
                ? 'Section Duplicated'
                : 'New Section Added'}
            </span>
          </div>
        </div>
      )}

      {/* 2. SIMULATED VIEWPORT FRAME WITH ACTIVE BREAKPOINT BADGE & NOTCH */}
      <div
        id="canvas-viewport-frame-container"
        className={`transition-all duration-300 relative flex flex-col ${currentFrameConfig.containerClass}`}
      >
        {/* On-Frame Active Breakpoint Header Banner (When not full screen preview) */}
        {!isPreviewMode && currentBp !== 'xxl' && (
          <div className="bg-slate-900 text-slate-300 px-3 py-1 flex items-center justify-between text-[11px] font-mono border-b border-slate-800 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-bold text-white uppercase">{currentBp} Viewport</span>
              <span className="text-slate-400">({currentFrameConfig.widthLabel})</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="hidden sm:inline">Cascade Tier: <strong>{BREAKPOINT_LABELS[currentBp].label}</strong></span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">0px ──────── {currentFrameConfig.targetWidth}px</span>
            </div>
          </div>
        )}

        {/* Mobile / Tablet camera pill simulation */}
        {currentFrameConfig.hasBezel && (
          <div className="w-full bg-slate-800 py-1 flex justify-center items-center shrink-0 z-20">
            <div className="w-20 h-3 bg-black rounded-full flex items-center justify-end pr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Live Iframe */}
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          title="Bootstrap 5 Live Canvas"
          className={`w-full h-full border-0 flex-1 transition-colors duration-200 ${
            isDark ? 'bg-[#212529]' : 'bg-white'
          }`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        />
      </div>

      {/* 3. PERSISTENT NON-INTRUSIVE BOTTOM RESPONSIVE BREAKPOINT HUD */}
      <div
        id="canvas-bottom-breakpoint-hud-wrapper"
        className="sticky bottom-3.5 z-30 pointer-events-none mt-auto py-1 flex flex-col items-center w-full px-4 select-none"
      >
        {/* Optional Expanded Cascade Info Card (when toggled via Info button) */}
        {showCascadeInfo && (
          <div
            id="canvas-breakpoint-cascade-flyout"
            className="pointer-events-auto mb-2 bg-slate-900/95 text-slate-200 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 text-xs w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Bootstrap 5 Mobile-First Cascade</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCascadeInfo(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>

            <div className="mt-2.5 space-y-2">
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Bootstrap cascades styles upward from <strong className="text-blue-400 font-mono">xs</strong> to <strong className="text-purple-400 font-mono">xxl</strong>. Rules defined on smaller breakpoints apply across all larger screens automatically unless overridden.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Active Tier Infix</div>
                  <div className="font-bold text-emerald-400">
                    {currentBp === 'xs' ? 'none (e.g. .col-6)' : `-${currentBp}- (e.g. .col-${currentBp}-6)`}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Container Max-Width</div>
                  <div className="font-bold text-amber-300">
                    {BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp]}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Media Query</div>
                  <div className="font-bold text-sky-300">
                    {currentBp === 'xs' ? '< 576px (Base)' : `@media (min-width: ${BREAKPOINT_QUERY_MAP[currentBp]}px)`}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Simulated Width</div>
                  <div className="font-bold text-slate-200">
                    {currentFrameConfig.widthLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The Main HUD Pill */}
        <div
          id="canvas-bottom-breakpoint-hud"
          className="pointer-events-auto bg-slate-950/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl border border-slate-700/80 ring-1 ring-white/10 flex items-center gap-2 sm:gap-3 transition-all duration-200 hover:border-slate-600"
        >
          {/* Active Responsive Tier Indicator & Pulsing Status */}
          <div className="flex items-center gap-2 pr-1.5 border-r border-slate-800 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] font-normal hidden sm:inline">Tier:</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[11px] uppercase tracking-wide">
                {currentBp}
              </span>
              <span className="text-slate-300 text-[11px] font-medium hidden md:inline">
                {BREAKPOINT_LABELS[currentBp].label.replace(/ \(.+\)/, '')}
              </span>
            </div>
          </div>

          {/* 6 Visual Breakpoint Badges ('xs' to 'xxl') */}
          <div className="flex items-center gap-1">
            {BREAKPOINT_ORDER.map((bp) => {
              const Icon = BREAKPOINT_DEVICE_ICONS[bp];
              const isActive = bp === currentBp;
              const isLower = BREAKPOINT_ORDER.indexOf(bp) < BREAKPOINT_ORDER.indexOf(currentBp);

              return (
                <button
                  key={bp}
                  type="button"
                  id={`canvas-bottom-bp-badge-${bp}`}
                  onClick={() => onBreakpointChange && onBreakpointChange(bp)}
                  className={`relative px-2 sm:px-2.5 py-1 rounded-full text-xs font-mono font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/40 ring-2 ring-blue-400 scale-105'
                      : isLower
                      ? 'bg-slate-900/90 text-amber-300/80 hover:text-amber-200 hover:bg-slate-800 border border-amber-500/20'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800/80'
                  }`}
                  title={`${BREAKPOINT_LABELS[bp].label} (${BREAKPOINT_LABELS[bp].pixelRange})\nInfix: ${bp === 'xs' ? 'none (base)' : `-${bp}-`}\nClick to target this responsive tier`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="uppercase">{bp}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden sm:inline-block" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Section: Specs & Info Toggle */}
          <div className="hidden lg:flex items-center gap-2 pl-1.5 border-l border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
            <span>
              Width: <strong className="text-emerald-400">{currentFrameConfig.widthLabel}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Container: <strong className="text-slate-200">{BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp]}</strong>
            </span>
          </div>

          {/* Toggle Cascade Info */}
          <button
            type="button"
            onClick={() => setShowCascadeInfo((prev) => !prev)}
            className={`p-1 rounded-full transition cursor-pointer shrink-0 ${
              showCascadeInfo
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Bootstrap Responsive Cascade Information"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* Quick Full-Screen Live Preview Launcher */}
          {onOpenLivePreview && (
            <button
              type="button"
              onClick={onOpenLivePreview}
              className="p-1 rounded-full text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition cursor-pointer shrink-0"
              title="Open Full-Screen Live Preview Modal (Shift+P)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Quick Clipboard Manager Launcher */}
          {onOpenClipboard && (
            <button
              type="button"
              id="canvas-bottom-clipboard-btn"
              onClick={onOpenClipboard}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer shrink-0 ${
                clipboardCount > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={`Clipboard Manager (Shift+Ctrl+V) - ${clipboardCount} copied ${
                clipboardCount === 1 ? 'block' : 'blocks'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Clipboard</span>
              {clipboardCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-white/20">
                  {clipboardCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Floating 'Shortcut Hint' corner widget in canvas */}
      {!isPreviewMode && (
        <div className="fixed bottom-4 left-4 z-30 pointer-events-auto">
          <ShortcutHint />
        </div>
      )}

      {/* CloudboyX Signature Floating "+" Action Button */}
      {!isPreviewMode && !isDesignModeOpen && (
        <button
          onClick={onOpenLibrary}
          className="fixed bottom-6 right-6 z-20 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 transition flex items-center justify-center group"
          title="Open Component Library"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-200 ease-out group-hover:ml-2 text-xs font-bold">
            Add Block
          </span>
        </button>
      )}
    </div>
  );
};
