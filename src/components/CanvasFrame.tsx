import React, { useEffect, useRef, useState } from 'react';
import {
  Sliders,
  Settings,
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
  Grid3X3,
  CheckSquare,
  CopyPlus,
  X,
  Boxes,
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
  selectedBlockIds?: string[];
  isMultiSelectMode?: boolean;
  onToggleMultiSelectMode?: () => void;
  onSelectBlock: (id: string, isMultiToggle?: boolean) => void;
  onSelectAllBlocks?: () => void;
  onDeselectAllBlocks?: () => void;
  onMoveSelectedBlocks?: (direction: 'up' | 'down') => void;
  onDuplicateSelectedBlocks?: () => void;
  onDeleteSelectedBlocks?: () => void;
  onOpenSettings: (id: string) => void;
  onOpenParameters?: (id: string) => void;
  onOpenCodeEditor?: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onReorderBlocks?: (sourceIndex: number, destinationIndex: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onInlineTextChange: (blockId: string, field: string, value: string) => void;
  onOpenLibrary: () => void;
  onAddBlock: (blockType: string) => void;
  onAddSectionAtIndex?: (index: number) => void;
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
  selectedBlockIds = [],
  isMultiSelectMode = false,
  onToggleMultiSelectMode,
  onSelectBlock,
  onSelectAllBlocks,
  onDeselectAllBlocks,
  onMoveSelectedBlocks,
  onDuplicateSelectedBlocks,
  onDeleteSelectedBlocks,
  onOpenSettings,
  onOpenParameters,
  onOpenCodeEditor,
  onMoveUp,
  onMoveDown,
  onReorderBlocks,
  onDuplicate,
  onDelete,
  onInlineTextChange,
  onOpenLibrary,
  onAddBlock,
  onAddSectionAtIndex,
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

  // Visual Bootstrap 5 12-Column Grid Guidelines Overlay Toggle state
  const [isGridOverlayEnabled, setIsGridOverlayEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bootstrap_canvas_grid_overlay');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('bootstrap_canvas_grid_overlay', String(isGridOverlayEnabled));
    } catch {
      // ignore
    }
  }, [isGridOverlayEnabled]);

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

  // Generate full HTML with active animationMeta and multi-select support
  const htmlContent = generateCompleteHtml(
    blocks,
    theme,
    projectTitle,
    !isPreviewMode,
    selectedBlockId,
    seoSettings,
    animationMeta,
    selectedBlockIds,
    isMultiSelectMode
  );

  // Sync selected block IDs and multi-select mode to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'SET_SELECTED_BLOCKS',
            blockIds: selectedBlockIds,
            isMultiSelect: isMultiSelectMode,
          },
          '*'
        );
      } catch (err) {
        // Fallback for cross-origin or initial mount
      }
    }
  }, [selectedBlockIds, isMultiSelectMode]);

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
        onSelectBlock(e.data.blockId, Boolean(e.data.isMultiToggle));
      }

      if (e.data.type === 'BLOCK_MULTI_SELECT_TOGGLE' && e.data.blockId) {
        onSelectBlock(e.data.blockId, true);
      }

      if (e.data.type === 'OPEN_BLOCK_CODE_EDITOR' && e.data.blockId) {
        onSelectBlock(e.data.blockId);
        if (onOpenCodeEditor) {
          onOpenCodeEditor(e.data.blockId);
        }
      }

      if (
        (e.data.type === 'OPEN_BLOCK_PARAMETERS' || e.data.type === 'OPEN_BLOCK_SETTINGS') &&
        e.data.blockId
      ) {
        onSelectBlock(e.data.blockId);
        if (onOpenParameters) {
          onOpenParameters(e.data.blockId);
        } else {
          onOpenSettings(e.data.blockId);
        }
      }

      if (e.data.type === 'MOVE_BLOCK_UP' && e.data.blockId) {
        onMoveUp(e.data.blockId);
      }

      if (e.data.type === 'MOVE_BLOCK_DOWN' && e.data.blockId) {
        onMoveDown(e.data.blockId);
      }

      if (e.data.type === 'DUPLICATE_BLOCK' && e.data.blockId) {
        onDuplicate(e.data.blockId);
      }

      if (e.data.type === 'DELETE_BLOCK' && e.data.blockId) {
        onDelete(e.data.blockId);
      }

      if (e.data.type === 'ADD_SECTION_AT_INDEX') {
        const targetIndex = typeof e.data.insertIndex === 'number' ? e.data.insertIndex : blocks.length;
        if (onAddSectionAtIndex) {
          onAddSectionAtIndex(targetIndex);
        } else if (onOpenLibrary) {
          onOpenLibrary();
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

      if (e.data.type === 'IFRAME_MOUSE_ENTER') {
        setIsHoveringCanvas(true);
      }

      if (e.data.type === 'IFRAME_MOUSE_LEAVE') {
        setIsHoveringCanvas(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [
    onSelectBlock,
    onOpenCodeEditor,
    onOpenParameters,
    onOpenSettings,
    onDuplicate,
    onDelete,
    onAddSectionAtIndex,
    onOpenLibrary,
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

  // Track dragging state across internal reordering and external component drop
  const isDraggingAnyElement =
    draggedBlockId !== null || isDragOver || dragOverBlockId !== null;
  const isGridGuidelinesVisible =
    isGridOverlayEnabled && (isHoveringCanvas || isDraggingAnyElement);

  // Synchronize grid guidelines configuration to iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'SET_GRID_OVERLAY',
            enabled: isGridOverlayEnabled,
            visible: isGridGuidelinesVisible,
          },
          '*'
        );
      } catch {
        // Fallback for cross-origin or initial mount
      }
    }
  }, [isGridOverlayEnabled, isGridGuidelinesVisible]);

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

      {/* 1. UNIFIED AGILE CANVAS BAR: Draggable Section Strip + Compact Responsive Tier Switcher */}
      {!isPreviewMode && (
        <div
          id="bootstrap-breakpoint-canvas-ruler"
          className={`w-full px-3.5 py-1 border-b flex items-center justify-between gap-2 shrink-0 z-20 select-none transition-colors ${
            isDark
              ? 'bg-slate-900/90 border-slate-800/90 text-slate-200'
              : 'bg-white/95 border-slate-200/90 text-slate-800 backdrop-blur-xs'
          }`}
        >
          {/* Left: Draggable Canvas Section Pills */}
          <div
            id="canvas-block-instances-reorder-bar"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0"
          >
            <div
              className="flex items-center gap-1 overflow-x-auto no-scrollbar"
              role="list"
              aria-label="Draggable canvas block instances"
            >
              {blocks.map((block, index) => {
                const isSelected = selectedBlockIds.includes(block.id);
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
                    onClick={(e) => {
                      const isMulti = e.shiftKey || e.ctrlKey || e.metaKey || isMultiSelectMode;
                      onSelectBlock(block.id, isMulti);
                    }}
                    onDoubleClick={() => onOpenSettings(block.id)}
                    title={`Drag to reorder "${block.name}" • Click to select (Shift+Click to multi-select) • Double-click for settings`}
                    className={`group relative flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 border ${
                      isDragging
                        ? 'opacity-40 scale-95 border-dashed border-blue-500 bg-blue-500/10'
                        : isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                        : isDark
                        ? 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-800'
                        : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border-slate-200/80'
                    } ${showDropBefore ? 'ring-2 ring-blue-500 border-l-4 border-l-blue-500' : ''} ${
                      showDropAfter ? 'ring-2 ring-blue-500 border-r-4 border-r-blue-500' : ''
                    }`}
                  >
                    <GripVertical
                      className={`w-3 h-3 cursor-grab active:cursor-grabbing ${
                        isSelected ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    />
                    <span className={`font-mono text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {index + 1}.
                    </span>
                    <span className="truncate max-w-[105px]">{block.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Multi-Select Toggle, Grid Overlay Toggle, Breakpoint Switcher & Quick Code Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Multi-Select Mode Toggle Button */}
            {onToggleMultiSelectMode && (
              <button
                type="button"
                id="btn-toggle-multiselect"
                onClick={onToggleMultiSelectMode}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                  isMultiSelectMode
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/80 bg-slate-900/60'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200 bg-white'
                }`}
                title={
                  isMultiSelectMode
                    ? 'Multi-Select Mode Active: Click or shift-click blocks to group-select (Click to exit)'
                    : 'Toggle Multi-Select Mode: Select multiple blocks to move, duplicate, or delete as a group'
                }
                aria-label="Toggle canvas multi-select mode"
              >
                <CheckSquare
                  className={`w-3.5 h-3.5 ${
                    isMultiSelectMode ? 'text-white' : 'text-blue-500'
                  }`}
                />
                <span>Multi-Select</span>
                {selectedBlockIds.length > 0 && (
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                      isMultiSelectMode
                        ? 'bg-blue-700 text-white'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {selectedBlockIds.length}
                  </span>
                )}
              </button>
            )}

            {/* Visual Bootstrap 5 12-Column Grid Guidelines Toggle */}
            <button
              type="button"
              id="canvas-grid-overlay-toggle-btn"
              onClick={() => setIsGridOverlayEnabled((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                isGridOverlayEnabled
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-xs'
                    : 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200'
              }`}
              title={
                isGridOverlayEnabled
                  ? '12-Column Grid Guidelines Active: Displays Bootstrap 5 column guides on hover or when dragging elements (Click to turn off)'
                  : '12-Column Grid Guidelines Disabled (Click to turn on)'
              }
              aria-label="Toggle Bootstrap 5 visual grid overlay guidelines"
            >
              <Grid3X3
                className={`w-3.5 h-3.5 ${
                  isGridOverlayEnabled
                    ? isDark
                      ? 'text-cyan-400'
                      : 'text-blue-600'
                    : 'text-slate-400'
                }`}
              />
              <span className="hidden md:inline">12-Col Grid</span>
              <span
                className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                  isGridOverlayEnabled
                    ? isDark
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                    : isDark
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isGridOverlayEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {selectedBlock && onOpenCodeEditor && (
              <button
                type="button"
                id="canvas-ruler-open-code-editor-btn"
                onClick={() => onOpenCodeEditor(selectedBlock.id)}
                className={`hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-semibold text-[10px] border transition cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 hover:bg-slate-800 text-cyan-400 border-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Edit Block HTML & CSS Code"
              >
                <Code2 className="w-3 h-3" />
                <span>HTML/CSS</span>
              </button>
            )}

            {selectedBlock && (onOpenParameters || onOpenSettings) && (
              <button
                type="button"
                id="canvas-ruler-open-parameters-btn"
                onClick={() =>
                  onOpenParameters
                    ? onOpenParameters(selectedBlock.id)
                    : onOpenSettings(selectedBlock.id)
                }
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] border transition cursor-pointer shadow-xs ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 hover:from-blue-600/40 hover:to-cyan-500/30 text-cyan-300 border-blue-500/40'
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-300'
                }`}
                title="Open Block Parameters (Gear Settings)"
              >
                <Settings className="w-3 h-3 text-blue-500 animate-spin-slow" />
                <span>Parameters</span>
              </button>
            )}

            <div
              className={`hidden sm:flex items-center gap-0.5 p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200/80'
              }`}
            >
              {BREAKPOINT_ORDER.map((bp) => {
                const isActive = bp === currentBp;
                return (
                  <button
                    key={bp}
                    type="button"
                    id={`canvas-bp-btn-${bp}`}
                    onClick={() => onBreakpointChange && onBreakpointChange(bp)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={`${BREAKPOINT_LABELS[bp].label} (${BREAKPOINT_LABELS[bp].pixelRange})`}
                  >
                    {bp}
                  </button>
                );
              })}
            </div>
          </div>
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

      {/* 2. SIMULATED VIEWPORT FRAME */}
      <div
        id="canvas-viewport-frame-container"
        onMouseEnter={() => setIsHoveringCanvas(true)}
        onMouseLeave={() => setIsHoveringCanvas(false)}
        className={`transition-all duration-300 relative flex flex-col ${currentFrameConfig.containerClass}`}
      >
        {/* Mobile / Tablet camera pill simulation */}
        {currentFrameConfig.hasBezel && (
          <div className="w-full bg-slate-800 py-1 flex justify-center items-center shrink-0 z-20">
            <div className="w-20 h-3 bg-black rounded-full flex items-center justify-end pr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Visual Bootstrap 5 12-Column Responsive Grid Guidelines Overlay (Active on hover or drag) */}
        <div
          id="canvas-grid-guidelines-overlay"
          aria-hidden="true"
          className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-200 flex flex-col justify-start items-center ${
            isGridGuidelinesVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Floating Alignment Status Pill */}
          <div className="sticky top-2 z-30 pointer-events-none my-1 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-semibold border border-blue-500/40 shadow-lg backdrop-blur-md">
            <div
              className={`w-2 h-2 rounded-full ${
                isDraggingAnyElement ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'
              }`}
            />
            <span className="font-mono text-cyan-400">Bootstrap 5 (12 Cols)</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              Container: <strong className="text-white">{BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp]}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300">
              {isDraggingAnyElement ? 'Dragging Alignment Active' : 'Hover Alignment Active'}
            </span>
          </div>

          {/* 12 Columns Guidelines Container */}
          <div className="w-full h-full px-3 flex-1 flex justify-center pointer-events-none">
            <div
              className="w-full h-full transition-all duration-200"
              style={{
                maxWidth: currentBp === 'xs' ? '100%' : BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp],
              }}
            >
              <div className="grid grid-cols-12 gap-3 sm:gap-4 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex flex-col justify-between items-center py-2 transition-colors border-x ${
                      isDark
                        ? 'bg-cyan-500/[0.04] border-dashed border-cyan-400/25'
                        : 'bg-blue-500/[0.04] border-dashed border-blue-500/25'
                    }`}
                  >
                    <span
                      className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-2xs ${
                        isDark
                          ? 'bg-slate-900/95 text-cyan-300 border border-cyan-500/35'
                          : 'bg-white/95 text-blue-600 border border-blue-300'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`font-mono text-[8.5px] font-semibold px-1 py-0.2 rounded opacity-80 ${
                        isDark
                          ? 'bg-slate-900/80 text-cyan-400'
                          : 'bg-white/90 text-blue-700'
                      }`}
                    >
                      col-{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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

      {/* 3. COMPACT BOTTOM RESPONSIVE CAPSULE */}
      <div
        id="canvas-bottom-breakpoint-hud-wrapper"
        className="sticky bottom-3 z-30 pointer-events-none mt-auto py-1 flex flex-col items-center w-full px-4 select-none"
      >
        {/* Floating Multi-Select Group Actions HUD */}
        {(isMultiSelectMode || selectedBlockIds.length > 1) && (
          <div
            id="canvas-multiselect-group-actions-bar"
            className="pointer-events-auto mb-2 bg-slate-900/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-2 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ring-2 ring-blue-500/30 select-none z-40"
          >
            {/* Selected Count Indicator */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-300 font-mono">
                {selectedBlockIds.length} {selectedBlockIds.length === 1 ? 'section' : 'sections'} selected
              </span>
            </div>

            {/* Select All / Deselect All */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                id="btn-multiselect-select-all"
                onClick={onSelectAllBlocks}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Select all sections on canvas"
              >
                Select All
              </button>
              <button
                type="button"
                id="btn-multiselect-deselect-all"
                onClick={onDeselectAllBlocks}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                title="Deselect all sections"
              >
                Clear
              </button>
            </div>

            <div className="h-4 w-px bg-slate-700/80" />

            {/* Group Action: Move Up */}
            <button
              type="button"
              id="btn-multiselect-move-up"
              onClick={() => onMoveSelectedBlocks && onMoveSelectedBlocks('up')}
              disabled={selectedBlockIds.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition cursor-pointer"
              title="Move selected sections up as a group"
            >
              <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Move Up</span>
            </button>

            {/* Group Action: Move Down */}
            <button
              type="button"
              id="btn-multiselect-move-down"
              onClick={() => onMoveSelectedBlocks && onMoveSelectedBlocks('down')}
              disabled={selectedBlockIds.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition cursor-pointer"
              title="Move selected sections down as a group"
            >
              <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Move Down</span>
            </button>

            <div className="h-4 w-px bg-slate-700/80" />

            {/* Group Action: Duplicate Group */}
            <button
              type="button"
              id="btn-multiselect-duplicate"
              onClick={onDuplicateSelectedBlocks}
              disabled={selectedBlockIds.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 disabled:opacity-40 transition cursor-pointer"
              title="Duplicate selected sections as a group"
            >
              <CopyPlus className="w-3.5 h-3.5 text-purple-400" />
              <span>Duplicate</span>
            </button>

            {/* Group Action: Delete Group */}
            <button
              type="button"
              id="btn-multiselect-delete"
              onClick={onDeleteSelectedBlocks}
              disabled={selectedBlockIds.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 disabled:opacity-40 transition cursor-pointer"
              title="Delete selected sections as a group"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete</span>
            </button>

            {/* Close / Exit Multi-Select Mode */}
            {onToggleMultiSelectMode && (
              <button
                type="button"
                id="btn-multiselect-exit"
                onClick={onToggleMultiSelectMode}
                className="ml-1 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Exit Multi-Select mode (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

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
                Bootstrap cascades styles upward from <strong className="text-blue-400 font-mono">xs</strong> to <strong className="text-purple-400 font-mono">xxl</strong>.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Active Tier Infix</div>
                  <div className="font-bold text-emerald-400">
                    {currentBp === 'xs' ? 'none (base)' : `-${currentBp}-`}
                  </div>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Container Max-Width</div>
                  <div className="font-bold text-amber-300">
                    {BOOTSTRAP_CONTAINER_MAX_WIDTH[currentBp]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Bottom HUD Pill */}
        <div
          id="canvas-bottom-breakpoint-hud"
          className="pointer-events-auto bg-slate-950/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full shadow-xl border border-slate-800 flex items-center gap-1.5 transition-all duration-200"
        >
          <div className="flex items-center gap-0.5">
            {BREAKPOINT_ORDER.map((bp) => {
              const isActive = bp === currentBp;
              return (
                <button
                  key={bp}
                  type="button"
                  id={`canvas-bottom-bp-badge-${bp}`}
                  onClick={() => onBreakpointChange && onBreakpointChange(bp)}
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={`${BREAKPOINT_LABELS[bp].label} (${BREAKPOINT_LABELS[bp].pixelRange})`}
                >
                  {bp}
                </button>
              );
            })}
          </div>

          <span className="hidden md:inline text-[10px] font-mono text-slate-400 pl-1 border-l border-slate-800">
            {currentFrameConfig.widthLabel}
          </span>

          <button
            type="button"
            id="canvas-bottom-grid-toggle-btn"
            onClick={() => setIsGridOverlayEnabled((prev) => !prev)}
            className={`p-1 rounded-full transition cursor-pointer ${
              isGridOverlayEnabled ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title={`Bootstrap 5 12-Column Grid Guidelines (${
              isGridOverlayEnabled ? 'Enabled: Active on hover/drag' : 'Disabled'
            })`}
            aria-label="Toggle Bootstrap 5 visual grid overlay guidelines"
          >
            <Grid3X3 className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setShowCascadeInfo((prev) => !prev)}
            className={`p-1 rounded-full transition cursor-pointer ${
              showCascadeInfo ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Responsive Cascade Info"
          >
            <Info className="w-3 h-3" />
          </button>

          {onOpenClipboard && (
            <button
              type="button"
              id="canvas-bottom-clipboard-btn"
              onClick={onOpenClipboard}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                clipboardCount > 0
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Clipboard Manager"
            >
              <ClipboardList className="w-3 h-3" />
              {clipboardCount > 0 && <span className="font-mono text-[10px]">{clipboardCount}</span>}
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

      {/* Mobirise-Style Signature Floating "+" Action Button (FAB) */}
      {!isPreviewMode && !isDesignModeOpen && (
        <button
          type="button"
          id="mobirise-canvas-add-block-fab"
          onClick={onOpenLibrary}
          className="fixed bottom-7 right-7 z-40 bg-gradient-to-tr from-rose-500 via-red-500 to-pink-500 hover:from-rose-600 hover:via-red-600 hover:to-pink-600 text-white h-13 pl-4 pr-5 rounded-full shadow-2xl shadow-rose-500/40 hover:shadow-rose-500/60 ring-4 ring-white/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          title="Add New Block Component (Visual Library)"
        >
          <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:rotate-90 transition-transform duration-300">
            <Plus className="w-4.5 h-4.5 stroke-[3] text-white" />
          </span>
          <span className="font-extrabold text-xs tracking-wider uppercase select-none drop-shadow-xs">
            Add Block
          </span>
        </button>
      )}
    </div>
  );
};
