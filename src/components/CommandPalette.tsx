import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Command,
  Sparkles,
  Trash2,
  Download,
  FileCode,
  FileText,
  Share2,
  Eye,
  EyeOff,
  Layers,
  Grid3X3,
  SlidersHorizontal,
  Settings,
  Code2,
  History,
  ClipboardList,
  Copy,
  Plus,
  Palette,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Sun,
  Moon,
  Undo2,
  Redo2,
  ArrowUp,
  ArrowDown,
  X,
  FileJson,
  CornerDownLeft,
  Paintbrush,
  CheckSquare,
  Square,
  Sliders,
  Maximize2,
  Minimize2,
  ArrowRight,
  BookOpen,
  Loader2,
  Bot,
  Wand2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings, ViewportMode } from '../types';
import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';

export type CommandCategory = 'all' | 'ai' | 'action' | 'block' | 'setting' | 'viewport';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockInstance[];
  selectedBlock: BlockInstance | null;
  selectedBlockIds: string[];
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  projectTitle: string;
  viewport: ViewportMode;
  autoVerticalRhythm?: boolean;
  isGridOverlayEnabled?: boolean;
  isMultiSelectMode?: boolean;
  isPreviewMode?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  isFitToScreen?: boolean;
  onToggleFitToScreen?: () => void;
  zoomScale?: number;
  // Handlers
  onAddBlock: (type: string) => void;
  onAddBlockAtIndex?: (type: string, targetIndex: number, contentPatch?: Record<string, any>) => void;
  onCleanAll?: () => void;
  onExportHtml: () => void;
  onExportPdf?: () => void;
  onCopyCompiledHtml?: () => void;
  onShareProject?: () => void;
  onOpenLivePreview?: () => void;
  onTogglePreviewMode?: () => void;
  onOpenThemeSettings?: () => void;
  onOpenSeoSettings?: () => void;
  onOpenBlockParameters?: (blockId: string) => void;
  onOpenCodeEditor?: (blockId: string) => void;
  onOpenTemplateGallery?: () => void;
  onOpenRevisionHistory?: () => void;
  onOpenClipboard?: () => void;
  onOpenDesignStudio?: (tab?: string) => void;
  onToggleDesignSidebar?: () => void;
  onToggleThemeMode?: () => void;
  onSetViewport?: (vp: ViewportMode) => void;
  onToggleAutoVerticalRhythm?: () => void;
  onApplyVerticalRhythm?: () => void;
  onToggleGridOverlay?: () => void;
  onToggleMultiSelectMode?: () => void;
  onSelectAllBlocks?: () => void;
  onDeselectAllBlocks?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicateBlock?: (blockId: string) => void;
  onDeleteBlock?: (blockId: string) => void;
  onMoveBlockUp?: (blockId: string) => void;
  onMoveBlockDown?: (blockId: string) => void;
  onCopyBlock?: (blockId: string) => void;
  onPasteLatest?: (position?: 'below' | 'above' | 'top' | 'bottom') => void;
  onCopyBlockStyle?: (block: BlockInstance) => void;
  onPasteBlockStyle?: (block: BlockInstance) => void;
  onCopyBlockJson?: (block: BlockInstance) => void;
}

export interface AiBlockMatch {
  blockType: string;
  name: string;
  category?: string;
  matchScore: number;
  relevanceReason: string;
  suggestedTitle: string;
  suggestedSubtitle?: string;
  badge?: string;
}

interface PaletteItem {
  id: string;
  category: 'action' | 'block' | 'setting' | 'viewport' | 'ai';
  title: string;
  subtitle: string;
  keywords: string[];
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  shortcut?: string;
  badge: string;
  badgeColor: string;
  perform: () => void;
}

const SAMPLE_AI_PROMPTS = [
  'Customer reviews section with 5-star ratings and client avatars',
  '3-tier pricing comparison table with monthly & annual packages',
  'Hero section with high-impact bold headline and 2 CTA buttons',
  '3-column grid highlighting key features, modern icons and benefits',
  'Contact inquiry form with name, email, and message inputs',
  'Interactive video and media carousel slider with controls',
  'Collapsible FAQ accordion for common customer questions',
  'Team members grid showcase with photos, job titles and bios',
  'Custom HTML block with split-pane code editor',
  'Blank container row with responsive Bootstrap 5 spacing',
];

function fallbackLocalAiSearch(queryStr: string, limit = 5): AiBlockMatch[] {
  const q = queryStr.toLowerCase().trim();
  const tokens = q.split(/[\s,.-]+/).filter((t) => t.length > 2);

  const scored = BLOCK_DEFINITIONS.map((def) => {
    let score = 55;
    const nameLower = def.name.toLowerCase();
    const descLower = (def.description || '').toLowerCase();
    const typeLower = def.type.toLowerCase();
    const tags = def.tags || [];

    if (nameLower.includes(q) || typeLower.includes(q)) score += 35;
    if (descLower.includes(q)) score += 25;

    tokens.forEach((t) => {
      if (nameLower.includes(t)) score += 15;
      if (descLower.includes(t)) score += 10;
      if (tags.some((tag) => tag.toLowerCase().includes(t))) score += 15;
    });

    // Domain intent boosts
    if (/review|star|rating|testimonial|quote|feedback|social proof|client/i.test(q)) {
      if (def.type === 'testimonials-cards') score += 45;
    }
    if (/price|pricing|plan|tier|cost|subscription|checkout|rate|pay/i.test(q)) {
      if (def.type === 'pricing-tiers') score += 45;
    }
    if (/hero|headline|welcome|banner|frontpage|intro|cta|landing|title/i.test(q)) {
      if (def.type === 'hero-split' || def.type === 'hero-centered') score += 40;
    }
    if (/contact|form|email|reach|message|inquir|support|lead/i.test(q)) {
      if (def.type === 'contact-split') score += 45;
    }
    if (/feature|highlight|benefit|grid|service|capability/i.test(q)) {
      if (def.type === 'features-3col' || def.type === 'features-split') score += 40;
    }
    if (/carousel|slide|video|media|slider|player|showcase/i.test(q)) {
      if (def.type === 'media-carousel') score += 45;
    }
    if (/gallery|photo|image|portfolio|grid/i.test(q)) {
      if (def.type === 'gallery-grid') score += 45;
    }
    if (/faq|question|answer|accordion|help|troubleshoot/i.test(q)) {
      if (def.type.includes('faq') || def.type.includes('accordion')) score += 45;
    }
    if (/team|staff|people|member|leadership|founder/i.test(q)) {
      if (def.type.includes('team')) score += 45;
    }
    if (/code|html|css|script|embed|custom/i.test(q)) {
      if (def.type === 'custom-html') score += 45;
    }
    if (/blank|empty|container|row|wrapper/i.test(q)) {
      if (def.type === 'blank-container') score += 40;
    }

    const cleanTokens = q.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).slice(0, 4);
    const suggestedHeadline = cleanTokens.length > 0
      ? cleanTokens.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : def.name;

    let relevanceReason = `Matches natural language intent for ${def.category} (${def.name}).`;
    if (def.type === 'testimonials-cards') {
      relevanceReason = 'Features customer review cards and star ratings to build immediate trust.';
    } else if (def.type === 'pricing-tiers') {
      relevanceReason = 'Displays multi-tier pricing plans with feature checklists and call-to-actions.';
    } else if (def.type === 'hero-split' || def.type === 'hero-centered') {
      relevanceReason = 'Delivers a high-conversion hero layout with bold headlines and CTA buttons.';
    } else if (def.type === 'features-3col') {
      relevanceReason = 'Presents core product capabilities in a structured 3-column benefit grid.';
    } else if (def.type === 'contact-split') {
      relevanceReason = 'Includes ready-to-use input fields to capture leads and customer inquiries.';
    } else if (def.type === 'media-carousel') {
      relevanceReason = 'Provides dynamic interactive media slides with pagination controls.';
    }

    return {
      blockType: def.type,
      name: def.name,
      category: def.category,
      matchScore: Math.min(score, 98),
      relevanceReason,
      suggestedTitle: `${suggestedHeadline}`,
      suggestedSubtitle: def.description || `Tailored ${def.name} section for: "${queryStr}"`,
      badge: score >= 85 ? 'Top AI Match' : 'Recommended',
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  blocks,
  selectedBlock,
  selectedBlockIds,
  theme,
  themeMode = 'light',
  projectTitle,
  viewport,
  autoVerticalRhythm,
  isGridOverlayEnabled,
  isMultiSelectMode,
  isPreviewMode,
  canUndo,
  canRedo,
  isFitToScreen = false,
  onToggleFitToScreen,
  zoomScale = 1,
  onAddBlock,
  onAddBlockAtIndex,
  onCleanAll,
  onExportHtml,
  onExportPdf,
  onCopyCompiledHtml,
  onShareProject,
  onOpenLivePreview,
  onTogglePreviewMode,
  onOpenThemeSettings,
  onOpenSeoSettings,
  onOpenBlockParameters,
  onOpenCodeEditor,
  onOpenTemplateGallery,
  onOpenRevisionHistory,
  onOpenClipboard,
  onOpenDesignStudio,
  onToggleDesignSidebar,
  onToggleThemeMode,
  onSetViewport,
  onToggleAutoVerticalRhythm,
  onApplyVerticalRhythm,
  onToggleGridOverlay,
  onToggleMultiSelectMode,
  onSelectAllBlocks,
  onDeselectAllBlocks,
  onUndo,
  onRedo,
  onDuplicateBlock,
  onDeleteBlock,
  onMoveBlockUp,
  onMoveBlockDown,
  onCopyBlock,
  onPasteLatest,
  onCopyBlockStyle,
  onPasteBlockStyle,
  onCopyBlockJson,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CommandCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMatches, setAiMatches] = useState<AiBlockMatch[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastAiQuery, setLastAiQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isDark = themeMode === 'dark';

  // Determine insert location description
  const activeInsertIndex = useMemo(() => {
    if (selectedBlock) {
      const idx = blocks.findIndex((b) => b.id === selectedBlock.id);
      return idx !== -1 ? idx + 1 : blocks.length;
    }
    return blocks.length;
  }, [blocks, selectedBlock]);

  // Execute natural language AI search via server API or local semantic matcher
  const handlePerformAiSearch = useCallback(async (naturalQuery: string) => {
    const q = naturalQuery.trim();
    if (!q) return;
    setIsAiSearching(true);
    setAiError(null);
    setLastAiQuery(q);

    try {
      const res = await fetch('/api/ai/search-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 6 }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.matches) && data.matches.length > 0) {
        setAiMatches(data.matches);
      } else {
        setAiMatches(fallbackLocalAiSearch(q, 6));
      }
    } catch (err: any) {
      console.warn('AI search request failed, using semantic fallback:', err?.message || err);
      setAiMatches(fallbackLocalAiSearch(q, 6));
    } finally {
      setIsAiSearching(false);
    }
  }, []);

  // Automatic block insertion upon AI selection
  const handleSelectAiMatch = useCallback(
    (match: AiBlockMatch) => {
      if (onAddBlockAtIndex) {
        onAddBlockAtIndex(match.blockType, activeInsertIndex, {
          title: match.suggestedTitle,
          description: match.suggestedSubtitle,
        });
      } else {
        onAddBlock(match.blockType);
      }
      onClose();
    },
    [onAddBlockAtIndex, onAddBlock, activeInsertIndex, onClose]
  );

  // Build the complete list of searchable palette items
  const allItems: PaletteItem[] = useMemo(() => {
    const items: PaletteItem[] = [];

    // --- 1. CORE ACTIONS ---
    if (onCleanAll) {
      items.push({
        id: 'action-clean-all',
        category: 'action',
        title: 'Clean All Canvas Sections',
        subtitle: 'Clears all blocks from canvas and resets the site theme back to default',
        keywords: ['clean all', 'clear', 'reset', 'empty', 'delete all', 'blank slate', 'wipe'],
        icon: Trash2,
        iconColor: 'text-red-500',
        iconBg: isDark ? 'bg-red-950/60' : 'bg-red-50',
        badge: 'Action',
        badgeColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
        perform: () => {
          onCleanAll();
          onClose();
        },
      });
    }

    items.push({
      id: 'action-export-html',
      category: 'action',
      title: 'Export Production HTML',
      subtitle: `Download self-contained "${projectTitle || 'index'}.html" with Bootstrap 5 styles and scripts`,
      keywords: ['export html', 'download', 'code', 'file', 'save html', 'generate html', 'production'],
      icon: FileCode,
      iconColor: 'text-cyan-500',
      iconBg: isDark ? 'bg-cyan-950/60' : 'bg-cyan-50',
      badge: 'Export',
      badgeColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      perform: () => {
        onExportHtml();
        onClose();
      },
    });

    if (onCopyCompiledHtml) {
      items.push({
        id: 'action-copy-compiled-html',
        category: 'action',
        title: 'Copy Complete HTML to Clipboard',
        subtitle: 'Copies the complete compiled Bootstrap 5 production markup to clipboard',
        keywords: ['copy html', 'clipboard', 'markup', 'code copy', 'embed'],
        icon: Copy,
        iconColor: 'text-blue-500',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        badge: 'Clipboard',
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        perform: () => {
          onCopyCompiledHtml();
          onClose();
        },
      });
    }

    if (onExportPdf) {
      items.push({
        id: 'action-export-pdf',
        category: 'action',
        title: 'Export Structured PDF Document',
        subtitle: 'Generate and print an enterprise client document with layout specs and preview',
        keywords: ['export pdf', 'print', 'pdf report', 'document', 'client proposal'],
        icon: FileText,
        iconColor: 'text-rose-500',
        iconBg: isDark ? 'bg-rose-950/60' : 'bg-rose-50',
        badge: 'Export',
        badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        perform: () => {
          onExportPdf();
          onClose();
        },
      });
    }

    if (onShareProject) {
      items.push({
        id: 'action-share-project',
        category: 'action',
        title: 'Share Project',
        subtitle: 'Generate shareable link or export/import project state payload',
        keywords: ['share', 'link', 'collaborate', 'json export', 'import state', 'url'],
        icon: Share2,
        iconColor: 'text-indigo-500',
        iconBg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50',
        badge: 'Action',
        badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        perform: () => {
          onShareProject();
          onClose();
        },
      });
    }

    if (onOpenLivePreview) {
      items.push({
        id: 'action-live-preview',
        category: 'action',
        title: 'Full-Screen Live Preview Modal',
        subtitle: 'Preview clean responsive layout in interactive full-screen browser frame',
        keywords: ['live preview', 'fullscreen', 'preview', 'presentation', 'demo'],
        icon: Eye,
        iconColor: 'text-amber-500',
        iconBg: isDark ? 'bg-amber-950/60' : 'bg-amber-50',
        shortcut: 'Shift+P',
        badge: 'Preview',
        badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        perform: () => {
          onOpenLivePreview();
          onClose();
        },
      });
    }

    if (onTogglePreviewMode) {
      items.push({
        id: 'action-toggle-canvas-preview',
        category: 'action',
        title: isPreviewMode ? 'Exit Canvas Preview Mode' : 'Enter Clean Canvas Preview Mode',
        subtitle: isPreviewMode ? 'Show all editor boundaries, gear settings and action handles' : 'Hide all visual builder controls and toolbars on canvas',
        keywords: ['canvas preview', 'toggle preview', 'hide controls', 'clean canvas'],
        icon: isPreviewMode ? EyeOff : Eye,
        iconColor: 'text-emerald-500',
        iconBg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
        shortcut: 'P',
        badge: 'Canvas',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        perform: () => {
          onTogglePreviewMode();
          onClose();
        },
      });
    }

    if (onUndo) {
      items.push({
        id: 'action-undo',
        category: 'action',
        title: 'Undo Previous Action',
        subtitle: 'Reverts the most recent block modification, addition, or theme adjustment',
        keywords: ['undo', 'revert', 'back', 'history back'],
        icon: Undo2,
        iconColor: 'text-blue-500',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        shortcut: 'Ctrl+Z',
        badge: 'History',
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        perform: () => {
          onUndo();
          onClose();
        },
      });
    }

    if (onRedo) {
      items.push({
        id: 'action-redo',
        category: 'action',
        title: 'Redo Undone Action',
        subtitle: 'Re-applies the previously undone action',
        keywords: ['redo', 'forward', 'history forward'],
        icon: Redo2,
        iconColor: 'text-blue-500',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        shortcut: 'Ctrl+Y',
        badge: 'History',
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        perform: () => {
          onRedo();
          onClose();
        },
      });
    }

    if (onToggleAutoVerticalRhythm) {
      items.push({
        id: 'action-toggle-auto-rhythm',
        category: 'action',
        title: autoVerticalRhythm ? 'Disable Auto Vertical Rhythm' : 'Enable Auto Vertical Rhythm',
        subtitle: 'Dynamically computes and enforces uniform spacing (mb-*) between reordered blocks',
        keywords: ['vertical rhythm', 'spacing', 'margins', 'rhythm', 'balance spacing', 'auto margin'],
        icon: Sliders,
        iconColor: 'text-sky-500',
        iconBg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
        badge: autoVerticalRhythm ? 'Active' : 'Off',
        badgeColor: autoVerticalRhythm
          ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onToggleAutoVerticalRhythm();
          onClose();
        },
      });
    }

    if (onApplyVerticalRhythm) {
      items.push({
        id: 'action-balance-vertical-rhythm',
        category: 'action',
        title: 'Apply & Balance Vertical Spacing Now',
        subtitle: 'Recalculates and standardizes bottom margins across all canvas sections based on theme scale',
        keywords: ['balance spacing', 'apply rhythm', 'fix margins', 'spacing consistency', 'standardize'],
        icon: Sparkles,
        iconColor: 'text-indigo-400',
        iconBg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50',
        badge: 'Spacing',
        badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        perform: () => {
          onApplyVerticalRhythm();
          onClose();
        },
      });
    }

    if (onToggleGridOverlay) {
      items.push({
        id: 'action-toggle-grid',
        category: 'action',
        title: isGridOverlayEnabled ? 'Turn Off 12-Column Grid Guidelines' : 'Turn On 12-Column Grid Guidelines',
        subtitle: 'Overlays translucent Bootstrap 12-column grid guidelines on hover and drag',
        keywords: ['grid', '12 column', 'guidelines', 'alignment', 'bootstrap grid', 'columns'],
        icon: Grid3X3,
        iconColor: 'text-cyan-400',
        iconBg: isDark ? 'bg-cyan-950/60' : 'bg-cyan-50',
        badge: isGridOverlayEnabled ? 'Visible' : 'Off',
        badgeColor: isGridOverlayEnabled
          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onToggleGridOverlay();
          onClose();
        },
      });
    }

    if (onToggleMultiSelectMode) {
      items.push({
        id: 'action-toggle-multi-select',
        category: 'action',
        title: isMultiSelectMode ? 'Exit Multi-Select Mode' : 'Enter Multi-Select Group Mode',
        subtitle: isMultiSelectMode ? 'Return to single block selection' : 'Select multiple blocks to move, duplicate, or delete as a group',
        keywords: ['multi select', 'select multiple', 'batch edit', 'group', 'checkboxes'],
        icon: isMultiSelectMode ? CheckSquare : Square,
        iconColor: 'text-violet-500',
        iconBg: isDark ? 'bg-violet-950/60' : 'bg-violet-50',
        badge: isMultiSelectMode ? 'Active' : 'Off',
        badgeColor: isMultiSelectMode
          ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onToggleMultiSelectMode();
          onClose();
        },
      });
    }

    if (onSelectAllBlocks) {
      items.push({
        id: 'action-select-all-blocks',
        category: 'action',
        title: 'Select All Canvas Sections',
        subtitle: `Select all ${blocks.length} sections for bulk reordering, duplication or deletion`,
        keywords: ['select all', 'highlight all', 'all blocks', 'batch'],
        icon: CheckSquare,
        iconColor: 'text-violet-400',
        iconBg: isDark ? 'bg-violet-950/60' : 'bg-violet-50',
        badge: 'Group',
        badgeColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
        perform: () => {
          onSelectAllBlocks();
          onClose();
        },
      });
    }

    if (onDeselectAllBlocks && (selectedBlock || selectedBlockIds.length > 0)) {
      items.push({
        id: 'action-deselect-all-blocks',
        category: 'action',
        title: 'Clear Block Selection',
        subtitle: 'Deselect current active block and group selections',
        keywords: ['deselect', 'clear selection', 'unselect', 'esc'],
        icon: Square,
        iconColor: 'text-slate-400',
        iconBg: isDark ? 'bg-slate-800' : 'bg-slate-100',
        shortcut: 'Esc',
        badge: 'Selection',
        badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onDeselectAllBlocks();
          onClose();
        },
      });
    }

    // --- SELECTED BLOCK SPECIFIC ACTIONS ---
    if (selectedBlock) {
      if (onDuplicateBlock) {
        items.push({
          id: 'action-duplicate-block',
          category: 'action',
          title: `Duplicate "${selectedBlock.name}"`,
          subtitle: 'Create an exact duplicate clone directly below this section',
          keywords: ['duplicate', 'clone', 'copy section', selectedBlock.name.toLowerCase()],
          icon: Copy,
          iconColor: 'text-cyan-500',
          iconBg: isDark ? 'bg-cyan-950/60' : 'bg-cyan-50',
          shortcut: 'Ctrl+D',
          badge: 'Block',
          badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          perform: () => {
            onDuplicateBlock(selectedBlock.id);
            onClose();
          },
        });
      }

      if (onMoveBlockUp) {
        items.push({
          id: 'action-move-block-up',
          category: 'action',
          title: `Move "${selectedBlock.name}" Up`,
          subtitle: 'Shift this block one slot higher in vertical stack order',
          keywords: ['move up', 'order up', 'shift up', 'raise', selectedBlock.name.toLowerCase()],
          icon: ArrowUp,
          iconColor: 'text-sky-400',
          iconBg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
          shortcut: 'Alt+↑',
          badge: 'Order',
          badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          perform: () => {
            onMoveBlockUp(selectedBlock.id);
            onClose();
          },
        });
      }

      if (onMoveBlockDown) {
        items.push({
          id: 'action-move-block-down',
          category: 'action',
          title: `Move "${selectedBlock.name}" Down`,
          subtitle: 'Shift this block one slot lower in vertical stack order',
          keywords: ['move down', 'order down', 'shift down', 'lower', selectedBlock.name.toLowerCase()],
          icon: ArrowDown,
          iconColor: 'text-sky-400',
          iconBg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
          shortcut: 'Alt+↓',
          badge: 'Order',
          badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          perform: () => {
            onMoveBlockDown(selectedBlock.id);
            onClose();
          },
        });
      }

      if (onCopyBlock) {
        items.push({
          id: 'action-copy-block',
          category: 'action',
          title: `Copy "${selectedBlock.name}" to Clipboard`,
          subtitle: 'Stores block in internal Clipboard Manager for pasting anywhere in canvas',
          keywords: ['copy block', 'clipboard', 'stash', selectedBlock.name.toLowerCase()],
          icon: ClipboardList,
          iconColor: 'text-blue-500',
          iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
          shortcut: 'Ctrl+C',
          badge: 'Clipboard',
          badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          perform: () => {
            onCopyBlock(selectedBlock.id);
            onClose();
          },
        });
      }

      if (onCopyBlockStyle) {
        items.push({
          id: 'action-copy-block-style',
          category: 'action',
          title: `Copy Style from "${selectedBlock.name}"`,
          subtitle: 'Copies background, padding, alignment, and styling presets to style clipboard',
          keywords: ['copy style', 'style presets', 'colors', 'padding', 'theme copy'],
          icon: Paintbrush,
          iconColor: 'text-emerald-400',
          iconBg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
          badge: 'Style',
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          perform: () => {
            onCopyBlockStyle(selectedBlock);
            onClose();
          },
        });
      }

      if (onPasteBlockStyle) {
        items.push({
          id: 'action-paste-block-style',
          category: 'action',
          title: `Paste Style onto "${selectedBlock.name}"`,
          subtitle: 'Applies stored style properties from style clipboard to this section',
          keywords: ['paste style', 'apply style', 'transfer style'],
          icon: Paintbrush,
          iconColor: 'text-emerald-400',
          iconBg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
          badge: 'Style',
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          perform: () => {
            onPasteBlockStyle(selectedBlock);
            onClose();
          },
        });
      }

      if (onCopyBlockJson) {
        items.push({
          id: 'action-copy-block-json',
          category: 'action',
          title: `Copy JSON for "${selectedBlock.name}"`,
          subtitle: 'Copies the complete block data schema (settings, content, visualNode) as formatted JSON',
          keywords: ['copy json', 'developer json', 'schema', 'export json', 'raw json'],
          icon: FileJson,
          iconColor: 'text-amber-400',
          iconBg: isDark ? 'bg-amber-950/60' : 'bg-amber-50',
          badge: 'JSON',
          badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          perform: () => {
            onCopyBlockJson(selectedBlock);
            onClose();
          },
        });
      }

      if (onDeleteBlock) {
        items.push({
          id: 'action-delete-block',
          category: 'action',
          title: `Delete "${selectedBlock.name}"`,
          subtitle: 'Removes this section from the canvas stack',
          keywords: ['delete', 'remove', 'trash', selectedBlock.name.toLowerCase()],
          icon: Trash2,
          iconColor: 'text-red-500',
          iconBg: isDark ? 'bg-red-950/60' : 'bg-red-50',
          shortcut: 'Del',
          badge: 'Delete',
          badgeColor: 'bg-red-500/15 text-red-500 border-red-500/30',
          perform: () => {
            onDeleteBlock(selectedBlock.id);
            onClose();
          },
        });
      }
    }

    if (onPasteLatest) {
      items.push({
        id: 'action-paste-latest',
        category: 'action',
        title: 'Paste Latest Block from Clipboard',
        subtitle: selectedBlock
          ? `Insert the most recently copied block directly below "${selectedBlock.name}"`
          : 'Insert the most recently copied block at the bottom of the canvas stack',
        keywords: ['paste', 'insert copied', 'clipboard paste'],
        icon: ClipboardList,
        iconColor: 'text-blue-500',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        shortcut: 'Ctrl+V',
        badge: 'Clipboard',
        badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        perform: () => {
          onPasteLatest('below');
          onClose();
        },
      });
    }

    // --- 2. SETTINGS & NAVIGATION JUMPS ---
    if (onOpenThemeSettings) {
      items.push({
        id: 'setting-theme',
        category: 'setting',
        title: 'Theme Settings (Palette, Fonts & Styles)',
        subtitle: `Customize primary brand color (${theme.primaryColor}), font families, and button styling`,
        keywords: ['theme', 'colors', 'typography', 'primary color', 'font', 'branding', 'styling'],
        icon: Palette,
        iconColor: 'text-pink-500',
        iconBg: isDark ? 'bg-pink-950/60' : 'bg-pink-50',
        badge: 'Settings',
        badgeColor: 'bg-pink-500/15 text-pink-500 border-pink-500/30',
        perform: () => {
          onOpenThemeSettings();
          onClose();
        },
      });
    }

    if (onOpenSeoSettings) {
      items.push({
        id: 'setting-seo',
        category: 'setting',
        title: 'Page SEO & Meta Tags',
        subtitle: 'Configure page title, meta description, OpenGraph social sharing card, and canonical URLs',
        keywords: ['seo', 'meta tags', 'page title', 'opengraph', 'search engine', 'social share'],
        icon: Globe,
        iconColor: 'text-emerald-500',
        iconBg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50',
        badge: 'SEO',
        badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
        perform: () => {
          onOpenSeoSettings();
          onClose();
        },
      });
    }

    if (onOpenBlockParameters) {
      items.push({
        id: 'setting-block-parameters',
        category: 'setting',
        title: selectedBlock
          ? `Block Parameters: "${selectedBlock.name}"`
          : 'Block Parameters (Inspector Flyout)',
        subtitle: selectedBlock
          ? 'Configure background colors, paddings, column layouts, and visual node properties'
          : 'Open the inspector flyout to fine-tune active block parameters',
        keywords: ['parameters', 'gear settings', 'inspector', 'block settings', 'padding', 'background'],
        icon: Settings,
        iconColor: 'text-blue-500',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        badge: 'Inspector',
        badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
        perform: () => {
          const targetId = selectedBlock?.id || blocks[0]?.id;
          if (targetId) {
            onOpenBlockParameters(targetId);
          }
          onClose();
        },
      });
    }

    if (onOpenCodeEditor) {
      items.push({
        id: 'setting-code-editor',
        category: 'setting',
        title: selectedBlock
          ? `Edit Custom HTML/CSS: "${selectedBlock.name}"`
          : 'Block HTML & CSS Code Editor',
        subtitle: 'Open split-pane code editor to inject scoped CSS and custom HTML markup directly into block',
        keywords: ['code editor', 'html', 'css', 'remix', 'custom code', 'monaco', 'developer'],
        icon: Code2,
        iconColor: 'text-cyan-400',
        iconBg: isDark ? 'bg-cyan-950/60' : 'bg-cyan-50',
        badge: 'Code',
        badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        perform: () => {
          const targetId = selectedBlock?.id || blocks[0]?.id;
          if (targetId) {
            onOpenCodeEditor(targetId);
          }
          onClose();
        },
      });
    }

    if (onOpenTemplateGallery) {
      items.push({
        id: 'setting-template-gallery',
        category: 'setting',
        title: '100+ Bootstrap 5 Template Gallery',
        subtitle: 'Browse SaaS, agency, e-commerce, portfolio, and marketing site templates',
        keywords: ['templates', 'gallery', 'starter templates', 'premade sites', 'layouts'],
        icon: BookOpen,
        iconColor: 'text-violet-500',
        iconBg: isDark ? 'bg-violet-950/60' : 'bg-violet-50',
        badge: 'Gallery',
        badgeColor: 'bg-violet-500/15 text-violet-500 border-violet-500/30',
        perform: () => {
          onOpenTemplateGallery();
          onClose();
        },
      });
    }

    if (onOpenRevisionHistory) {
      items.push({
        id: 'setting-revision-history',
        category: 'setting',
        title: 'Revision History & Autosaved Snapshots',
        subtitle: 'Compare project versions, inspect autosaves, and restore any previous snapshot',
        keywords: ['history', 'revisions', 'snapshots', 'autosaves', 'restore version', 'backup'],
        icon: History,
        iconColor: 'text-indigo-400',
        iconBg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50',
        shortcut: 'Ctrl+H',
        badge: 'History',
        badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
        perform: () => {
          onOpenRevisionHistory();
          onClose();
        },
      });
    }

    if (onOpenClipboard) {
      items.push({
        id: 'setting-clipboard-manager',
        category: 'setting',
        title: 'Clipboard Manager Drawer',
        subtitle: 'View all stored block snapshots and paste into any vertical slot in the stack',
        keywords: ['clipboard manager', 'stored blocks', 'copy paste', 'drawer'],
        icon: ClipboardList,
        iconColor: 'text-sky-400',
        iconBg: isDark ? 'bg-sky-950/60' : 'bg-sky-50',
        shortcut: 'Shift+Ctrl+V',
        badge: 'Clipboard',
        badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
        perform: () => {
          onOpenClipboard();
          onClose();
        },
      });
    }

    if (onOpenDesignStudio) {
      items.push({
        id: 'setting-design-studio',
        category: 'setting',
        title: 'Design Studio Modal (Viewpoints Mode)',
        subtitle: 'Full-featured popup window for deep site styling, SEO audits, and block customization',
        keywords: ['design studio', 'viewpoints', 'studio modal', 'popup editor', 'advanced'],
        icon: Sparkles,
        iconColor: 'text-purple-400',
        iconBg: isDark ? 'bg-purple-950/60' : 'bg-purple-50',
        badge: 'Studio',
        badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        perform: () => {
          onOpenDesignStudio('blocks');
          onClose();
        },
      });
    }

    if (onToggleDesignSidebar) {
      items.push({
        id: 'setting-toggle-sidebar',
        category: 'setting',
        title: 'Toggle Inspector Sidebar Panel',
        subtitle: 'Show or hide the right-side inspector sidebar dock',
        keywords: ['toggle sidebar', 'inspector sidebar', 'design mode', 'dock'],
        icon: SlidersHorizontal,
        iconColor: 'text-slate-400',
        iconBg: isDark ? 'bg-slate-800' : 'bg-slate-100',
        shortcut: 'Ctrl+B',
        badge: 'UI',
        badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onToggleDesignSidebar();
          onClose();
        },
      });
    }

    // --- 3. VIEWPORTS & COLOR MODE ---
    if (onToggleFitToScreen) {
      items.push({
        id: 'viewport-toggle-fit-screen',
        category: 'viewport',
        title: isFitToScreen ? 'Reset Canvas Zoom to 100%' : 'Fit Canvas to Screen',
        subtitle: isFitToScreen
          ? `Current zoom: ${zoomScale && zoomScale < 0.99 ? Math.round(zoomScale * 100) : 100}%. Click to return to original 1:1 scale.`
          : 'Automatically scale canvas to fit browser viewport without horizontal or vertical clipping',
        keywords: ['fit to screen', 'zoom', 'scale', 'viewport fit', 'zoom to fit', '100%', 'canvas zoom', 'fit'],
        icon: isFitToScreen ? Minimize2 : Maximize2,
        iconColor: 'text-cyan-400',
        iconBg: isDark ? 'bg-cyan-950/60' : 'bg-cyan-50',
        shortcut: 'Alt+F',
        badge: isFitToScreen ? `${zoomScale && zoomScale < 0.99 ? Math.round(zoomScale * 100) : 100}% Fit` : '100%',
        badgeColor: isFitToScreen
          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onToggleFitToScreen();
          onClose();
        },
      });
    }

    if (onSetViewport) {
      items.push({
        id: 'viewport-desktop',
        category: 'viewport',
        title: 'Switch to Desktop Viewport',
        subtitle: 'Set canvas to Desktop mode (lg breakpoint — 1200px+)',
        keywords: ['desktop view', 'large screen', 'monitor', 'pc view'],
        icon: Monitor,
        iconColor: 'text-blue-400',
        iconBg: isDark ? 'bg-blue-950/60' : 'bg-blue-50',
        badge: viewport === 'desktop' ? 'Current' : 'Viewport',
        badgeColor: viewport === 'desktop'
          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onSetViewport('desktop');
          onClose();
        },
      });

      items.push({
        id: 'viewport-tablet',
        category: 'viewport',
        title: 'Switch to Tablet Viewport',
        subtitle: 'Set canvas to Tablet mode (md breakpoint — 768px)',
        keywords: ['tablet view', 'ipad', 'medium screen', '768px'],
        icon: Tablet,
        iconColor: 'text-indigo-400',
        iconBg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50',
        badge: viewport === 'tablet' ? 'Current' : 'Viewport',
        badgeColor: viewport === 'tablet'
          ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onSetViewport('tablet');
          onClose();
        },
      });

      items.push({
        id: 'viewport-mobile',
        category: 'viewport',
        title: 'Switch to Mobile Viewport',
        subtitle: 'Set canvas to Mobile mode (xs breakpoint — 390px)',
        keywords: ['mobile view', 'phone', 'iphone', 'small screen', '390px'],
        icon: Smartphone,
        iconColor: 'text-purple-400',
        iconBg: isDark ? 'bg-purple-950/60' : 'bg-purple-50',
        badge: viewport === 'mobile' ? 'Current' : 'Viewport',
        badgeColor: viewport === 'mobile'
          ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
          : 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        perform: () => {
          onSetViewport('mobile');
          onClose();
        },
      });
    }

    if (onToggleThemeMode) {
      items.push({
        id: 'viewport-toggle-theme-mode',
        category: 'viewport',
        title: isDark ? 'Switch Editor to Light Mode' : 'Switch Editor to Dark Mode',
        subtitle: `Toggles UI workbench between clean Light and modern Slate Dark themes`,
        keywords: ['theme mode', 'dark mode', 'light mode', 'dark theme', 'toggle dark', 'sun', 'moon'],
        icon: isDark ? Sun : Moon,
        iconColor: isDark ? 'text-amber-400' : 'text-slate-700',
        iconBg: isDark ? 'bg-amber-950/60' : 'bg-slate-100',
        badge: isDark ? 'Dark Mode' : 'Light Mode',
        badgeColor: isDark
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          : 'bg-slate-800 text-white border-slate-700',
        perform: () => {
          onToggleThemeMode();
          onClose();
        },
      });
    }

    // --- 4. BLOCKS CATALOG (SEARCH & INSERT) ---
    BLOCK_DEFINITIONS.forEach((def) => {
      // Pick icon color by category
      let iconColor = 'text-blue-500';
      let iconBg = isDark ? 'bg-blue-950/60' : 'bg-blue-50';
      if (def.category === 'headers') {
        iconColor = 'text-indigo-400';
        iconBg = isDark ? 'bg-indigo-950/60' : 'bg-indigo-50';
      } else if (def.category === 'features') {
        iconColor = 'text-emerald-400';
        iconBg = isDark ? 'bg-emerald-950/60' : 'bg-emerald-50';
      } else if (def.category === 'pricing') {
        iconColor = 'text-amber-400';
        iconBg = isDark ? 'bg-amber-950/60' : 'bg-amber-50';
      } else if (def.category === 'gallery') {
        iconColor = 'text-cyan-400';
        iconBg = isDark ? 'bg-cyan-950/60' : 'bg-cyan-50';
      } else if (def.category === 'html') {
        iconColor = 'text-teal-400';
        iconBg = isDark ? 'bg-teal-950/60' : 'bg-teal-50';
      } else if (def.category === 'testimonials' || def.category === 'team') {
        iconColor = 'text-purple-400';
        iconBg = isDark ? 'bg-purple-950/60' : 'bg-purple-50';
      }

      items.push({
        id: `block-${def.type}`,
        category: 'block',
        title: `Insert ${def.name}`,
        subtitle: def.description || `Add ${def.name} section to canvas (Slot #${activeInsertIndex + 1})`,
        keywords: [
          def.name.toLowerCase(),
          def.type.toLowerCase(),
          def.category.toLowerCase(),
          'insert block',
          'add block',
          ...(def.tags || []),
        ],
        icon: Plus,
        iconColor: iconColor,
        iconBg: iconBg,
        badge: def.category.toUpperCase(),
        badgeColor: 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30',
        perform: () => {
          if (onAddBlockAtIndex) {
            onAddBlockAtIndex(def.type, activeInsertIndex);
          } else {
            onAddBlock(def.type);
          }
          onClose();
        },
      });
    });

    // Also include Blank Container insert
    items.push({
      id: 'block-blank-container',
      category: 'block',
      title: 'Insert Blank Bootstrap Container',
      subtitle: `Empty full-width responsive grid container (Slot #${activeInsertIndex + 1})`,
      keywords: ['blank container', 'empty container', 'empty section', 'custom container', 'div'],
      icon: Plus,
      iconColor: 'text-slate-400',
      iconBg: isDark ? 'bg-slate-800' : 'bg-slate-100',
      badge: 'CONTAINER',
      badgeColor: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      perform: () => {
        if (onAddBlockAtIndex) {
          onAddBlockAtIndex('blank-container', activeInsertIndex);
        } else {
          onAddBlock('blank-container');
        }
        onClose();
      },
    });

    return items;
  }, [
    onCleanAll,
    onExportHtml,
    onExportPdf,
    onCopyCompiledHtml,
    onShareProject,
    onOpenLivePreview,
    onTogglePreviewMode,
    onUndo,
    onRedo,
    onToggleAutoVerticalRhythm,
    onApplyVerticalRhythm,
    onToggleGridOverlay,
    onToggleMultiSelectMode,
    onSelectAllBlocks,
    onDeselectAllBlocks,
    selectedBlock,
    selectedBlockIds,
    onDuplicateBlock,
    onMoveBlockUp,
    onMoveBlockDown,
    onCopyBlock,
    onCopyBlockStyle,
    onPasteBlockStyle,
    onCopyBlockJson,
    onDeleteBlock,
    onPasteLatest,
    onOpenThemeSettings,
    onOpenSeoSettings,
    onOpenBlockParameters,
    onOpenCodeEditor,
    onOpenTemplateGallery,
    onOpenRevisionHistory,
    onOpenClipboard,
    onOpenDesignStudio,
    onToggleDesignSidebar,
    onSetViewport,
    onToggleThemeMode,
    onAddBlock,
    onAddBlockAtIndex,
    activeInsertIndex,
    isDark,
    projectTitle,
    theme,
    viewport,
    autoVerticalRhythm,
    isGridOverlayEnabled,
    isMultiSelectMode,
    isPreviewMode,
    blocks,
    onClose,
  ]);

  // Filter items based on active category and search query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    // If active category is AI Search, render AI matches as palette items
    if (activeCategory === 'ai') {
      return aiMatches.map((match, idx) => ({
        id: `ai-match-${match.blockType}-${idx}`,
        category: 'ai' as const,
        title: match.suggestedTitle || match.name,
        subtitle: `${match.relevanceReason} (${match.suggestedSubtitle})`,
        keywords: [match.name, match.blockType, match.category, 'ai', q],
        icon: Wand2,
        iconColor: 'text-purple-400',
        iconBg: isDark ? 'bg-purple-950/60' : 'bg-purple-50',
        badge: match.badge || `${match.matchScore}% Match`,
        badgeColor:
          match.matchScore >= 85
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
        perform: () => handleSelectAiMatch(match),
      }));
    }

    const baseFiltered = allItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (item.category !== activeCategory) {
          return false;
        }
      }

      // Query filter
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const subtitleMatch = item.subtitle.toLowerCase().includes(q);
      const categoryMatch = item.category.toLowerCase().includes(q);
      const keywordMatch = item.keywords.some((k) => k.toLowerCase().includes(q));
      const shortcutMatch = item.shortcut?.toLowerCase().includes(q);

      return titleMatch || subtitleMatch || categoryMatch || keywordMatch || shortcutMatch;
    });

    // In 'all' category with a query of 3+ chars, prepend an AI query action item
    if (activeCategory === 'all' && q.length >= 3) {
      const aiPromptItem: PaletteItem = {
        id: 'action-trigger-ai-search',
        category: 'ai',
        title: `✨ Ask Gemini AI: "${query.trim()}"`,
        subtitle: `Find best-matching Bootstrap components with tailored copy using natural language`,
        keywords: [query.trim(), 'ai', 'gemini', 'natural language', 'find block'],
        icon: Sparkles,
        iconColor: 'text-purple-400',
        iconBg: isDark ? 'bg-purple-950/60' : 'bg-purple-50',
        badge: 'Gemini AI',
        badgeColor: 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-400 border-purple-500/40',
        perform: () => {
          setActiveCategory('ai');
          handlePerformAiSearch(query.trim());
        },
      };
      return [aiPromptItem, ...baseFiltered];
    }

    return baseFiltered;
  }, [allItems, activeCategory, query, aiMatches, isDark, handleSelectAiMatch, handlePerformAiSearch]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, activeCategory]);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside command palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // If in AI category and the user pressed Enter on a query that hasn't been searched yet
        if (
          activeCategory === 'ai' &&
          query.trim() &&
          (aiMatches.length === 0 || query.trim() !== lastAiQuery)
        ) {
          handlePerformAiSearch(query.trim());
          return;
        }

        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].perform();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle categories including 'ai'
        const categories: CommandCategory[] = ['all', 'ai', 'action', 'block', 'setting', 'viewport'];
        const currentIdx = categories.indexOf(activeCategory);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + categories.length) % categories.length
          : (currentIdx + 1) % categories.length;
        setActiveCategory(categories[nextIdx]);
        if (categories[nextIdx] === 'ai' && query.trim() && query.trim() !== lastAiQuery) {
          handlePerformAiSearch(query.trim());
        }
      }
    },
    [filteredItems, selectedIndex, onClose, activeCategory, query, aiMatches.length, lastAiQuery, handlePerformAiSearch]
  );

  // Auto-scroll selected element into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-item-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const categoryCounts = {
    all: allItems.length,
    ai: aiMatches.length,
    action: allItems.filter((i) => i.category === 'action').length,
    block: allItems.filter((i) => i.category === 'block').length,
    setting: allItems.filter((i) => i.category === 'setting').length,
    viewport: allItems.filter((i) => i.category === 'viewport').length,
  };

  return (
    <div
      id="command-palette-backdrop"
      data-testid="command-palette-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[9vh] px-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-slate-900/98 border-slate-700/80 text-white shadow-black/80 ring-1 ring-cyan-500/20'
            : 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl ring-1 ring-blue-500/10'
        }`}
      >
        {/* Top Header & Search Input */}
        <div className={`p-4 border-b flex items-center gap-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
            activeCategory === 'ai'
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
              : 'bg-blue-500/15 border-blue-500/30 text-blue-500'
          }`}>
            {activeCategory === 'ai' ? (
              <Sparkles className="w-4 h-4 stroke-[2.4]" />
            ) : (
              <Command className="w-4 h-4 stroke-[2.4]" />
            )}
          </div>

          <div className="flex-1 relative flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              id="command-palette-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeCategory === 'ai'
                  ? "Describe section in natural language... (e.g. '3-tier pricing table with monthly & annual packages')"
                  : "Search actions, insert blocks, or jump to settings... (e.g. 'hero', 'clean all', 'export')"
              }
              className={`w-full bg-transparent text-sm sm:text-base font-medium placeholder-slate-400 focus:outline-hidden pr-8 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* AI Search Action / Ask Button */}
          <div className="flex items-center gap-2 shrink-0">
            {activeCategory === 'ai' ? (
              <button
                type="button"
                onClick={() => handlePerformAiSearch(query)}
                disabled={isAiSearching || !query.trim()}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAiSearching
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    : query.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:brightness-110'
                    : 'bg-slate-800/40 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
                title="Query Gemini AI for natural language match"
              >
                {isAiSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('ai');
                  if (query.trim()) {
                    handlePerformAiSearch(query.trim());
                  }
                }}
                className={`hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 border transition-all cursor-pointer ${
                  isDark
                    ? 'bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50'
                    : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
                title="Switch to AI Natural Language search"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Search</span>
              </button>
            )}

            <kbd
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              ESC
            </kbd>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          className={`px-3 py-2 border-b flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-semibold ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategory === 'all'
                ? 'bg-blue-700 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            id="command-palette-tab-ai"
            onClick={() => {
              setActiveCategory('ai');
              if (query.trim() && query.trim() !== lastAiQuery) {
                handlePerformAiSearch(query.trim());
              }
            }}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'ai'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xs ring-1 ring-purple-400/40'
                : isDark
                ? 'text-purple-400 hover:text-white hover:bg-slate-800'
                : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Search</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeCategory === 'ai'
                  ? 'bg-purple-700 text-white'
                  : isDark
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {aiMatches.length > 0 ? aiMatches.length : 'Gemini'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('action')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'action'
                ? 'bg-blue-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>⚡ Actions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategory === 'action'
                ? 'bg-blue-700 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {categoryCounts.action}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('block')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'block'
                ? 'bg-blue-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>🧩 Insert Blocks</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategory === 'block'
                ? 'bg-blue-700 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {categoryCounts.block}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('setting')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'setting'
                ? 'bg-blue-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>⚙️ Settings & Nav</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategory === 'setting'
                ? 'bg-blue-700 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {categoryCounts.setting}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('viewport')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'viewport'
                ? 'bg-blue-600 text-white shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <span>📐 Viewports</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeCategory === 'viewport'
                ? 'bg-blue-700 text-white'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {categoryCounts.viewport}
            </span>
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh]">
          {/* AI Searching State */}
          {activeCategory === 'ai' && isAiSearching && (
            <div className="py-12 px-6 text-center animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-purple-500/15 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <h4 className="text-sm font-bold">Analyzing layouts with Gemini AI...</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                Matching semantic layout blocks and tailoring copy for{' '}
                <strong className="text-purple-400">"{query || lastAiQuery}"</strong>...
              </p>
            </div>
          )}

          {/* AI Category Empty Launcher (Shows Sample Prompts) */}
          {activeCategory === 'ai' && !isAiSearching && aiMatches.length === 0 && (
            <div className="py-4 px-2">
              <div
                className={`p-4 rounded-xl border mb-3 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-500/30'
                    : 'bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-purple-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <span>Natural Language Component Finder</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono border border-purple-500/30 font-semibold">
                        Gemini 3.8 Flash
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 leading-relaxed">
                      Describe what you want to build in natural language. Gemini AI will recommend the ideal Bootstrap component, tailor titles/subtitles, and automatically insert it at Slot #{activeInsertIndex + 1} upon selection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Suggested natural language prompts (click to query):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_AI_PROMPTS.slice(0, 6).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(prompt);
                      handlePerformAiSearch(prompt);
                    }}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                      isDark
                        ? 'bg-slate-800/60 border-slate-700/60 hover:border-purple-500/60 hover:bg-purple-950/30 text-slate-300 hover:text-white'
                        : 'bg-slate-50 border-slate-200 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700 hover:text-purple-950'
                    }`}
                  >
                    <span className="truncate">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Matches Sub-Header when results are present */}
          {activeCategory === 'ai' && !isAiSearching && aiMatches.length > 0 && (
            <div
              className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between mb-2 border ${
                isDark
                  ? 'bg-purple-950/30 border-purple-500/30 text-purple-300'
                  : 'bg-purple-50 border-purple-200 text-purple-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  <strong>{aiMatches.length} AI matches</strong> for &ldquo;{lastAiQuery || query}&rdquo;
                </span>
              </span>
              <span className="text-[11px] font-mono text-purple-400">
                Target Slot #{activeInsertIndex + 1}
              </span>
            </div>
          )}

          {/* Standard / Filtered Items List */}
          {!(activeCategory === 'ai' && (isAiSearching || aiMatches.length === 0)) &&
            (filteredItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-slate-500/10 text-slate-400">
                  <Search className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h4 className="text-sm font-bold">No matching commands found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No items match <strong className="text-blue-500">"{query}"</strong>. Try switching to the{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('ai');
                      handlePerformAiSearch(query);
                    }}
                    className="text-purple-400 underline font-semibold cursor-pointer"
                  >
                    ✨ AI Search tab
                  </button>{' '}
                  to query Gemini in natural language.
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComp = item.icon;

                return (
                  <div
                    key={item.id}
                    data-item-index={index}
                    onClick={() => item.perform()}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? isDark
                          ? item.category === 'ai'
                            ? 'bg-gradient-to-r from-purple-600/30 via-slate-800 to-indigo-500/20 border-purple-500/50 text-white shadow-sm'
                            : 'bg-gradient-to-r from-blue-600/30 via-slate-800 to-cyan-500/15 border-blue-500/50 text-white shadow-sm'
                          : item.category === 'ai'
                          ? 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50/50 border-purple-300 text-slate-900 shadow-xs'
                          : 'bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50/50 border-blue-300 text-slate-900 shadow-xs'
                        : isDark
                        ? 'border-transparent hover:bg-slate-800/60 text-slate-200'
                        : 'border-transparent hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/20 transition-transform ${
                          item.iconBg
                        } ${item.iconColor} ${isSelected ? 'scale-110 shadow-xs' : ''}`}
                      >
                        <IconComp className="w-4 h-4 stroke-[2.2]" />
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9.5px] font-mono uppercase font-bold px-1.5 py-0.2 rounded-md border shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5 leading-snug">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd
                          className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${
                            isDark
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {item.shortcut}
                        </kbd>
                      )}

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? item.category === 'ai'
                              ? 'bg-purple-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'opacity-0 group-hover:opacity-100 text-slate-400'
                        }`}
                      >
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })
            ))}
        </div>

        {/* Bottom Keyboard Guide / Status Bar */}
        <div
          className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] font-medium text-slate-400 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-slate-500/15 rounded text-[10px] font-mono">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-slate-500/15 rounded text-[10px] font-mono">↵</kbd> Select
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-slate-500/15 rounded text-[10px] font-mono">Tab</kbd> Filter
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-slate-500/15 rounded text-[10px] font-mono">Esc</kbd> Close
            </span>
          </div>

          <div className="text-right truncate ml-2">
            {selectedBlock ? (
              <span>
                Target: <strong className="text-blue-500 font-semibold">{selectedBlock.name}</strong>
              </span>
            ) : (
              <span>{filteredItems.length} commands available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
