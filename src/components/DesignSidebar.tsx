import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Layers,
  Sliders,
  Palette,
  Globe,
  Sparkles,
  Code2,
  FileCode,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  LayoutGrid,
  Filter,
  Grid3X3,
  LayoutTemplate,
  Columns2,
  CreditCard,
  PanelBottom,
  Menu,
  FileText,
  MessageSquareQuote,
  Users,
  Image as ImageIcon,
  Mail,
  LayoutDashboard,
  PanelRightClose,
  PanelLeftClose,
  Maximize2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Plus,
  BookmarkCheck,
  Type,
  Waves,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings, BlockCategory, BlockPreset } from '../types';
import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';
import { ProjectOverviewCard } from './ProjectOverviewCard';
import { BlockLibraryDrawer } from './BlockLibraryDrawer';
import { BlockSettingsDrawer } from './BlockSettingsDrawer';
import { BlockLayoutsTab } from './BlockLayoutsTab';
import { ThemeModal } from './ThemeModal';
import { PresetsTab } from './PresetsTab';
import { PageSettingsModal } from './PageSettingsModal';
import { TemplatesModal } from './TemplatesModal';
import { CodeModal } from './CodeModal';
import { CustomCssEditor } from './CustomCssEditor';
import { FontShowcaseTab } from './FontShowcaseTab';
import { SeoSettingsTab } from './SeoSettingsTab';
import { Breakpoint, VisualNode } from '../engine/bootstrapCascade';

export type DesignSidebarTab =
  | 'settings'
  | 'blocks'
  | 'presets'
  | 'layouts'
  | 'theme'
  | 'fonts'
  | 'css'
  | 'seo'
  | 'templates'
  | 'code'
  | 'overview';

export const SIDEBAR_BLOCK_CATEGORIES: {
  id: 'all' | BlockCategory;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  { id: 'all', label: 'All Blocks', shortLabel: 'All', icon: Grid3X3 },
  { id: 'html', label: 'Custom HTML', shortLabel: 'HTML', icon: Code2 },
  { id: 'headers', label: 'Headers & Hero', shortLabel: 'Headers', icon: LayoutTemplate },
  { id: 'features', label: 'Features & Cards', shortLabel: 'Features', icon: Columns2 },
  { id: 'content', label: 'Content & Articles', shortLabel: 'Content', icon: FileText },
  { id: 'dividers', label: 'Section Dividers', shortLabel: 'Dividers', icon: Waves },
  { id: 'footers', label: 'Footers', shortLabel: 'Footers', icon: PanelBottom },
  { id: 'pricing', label: 'Pricing Tables', shortLabel: 'Pricing', icon: CreditCard },
  { id: 'navbars', label: 'Navbars & Menus', shortLabel: 'Navbars', icon: Menu },
  { id: 'testimonials', label: 'Testimonials', shortLabel: 'Testimonials', icon: MessageSquareQuote },
  { id: 'forms', label: 'Forms & Contact', shortLabel: 'Forms', icon: Mail },
  { id: 'team', label: 'Team Showcase', shortLabel: 'Team', icon: Users },
  { id: 'gallery', label: 'Gallery & Works', shortLabel: 'Gallery', icon: ImageIcon },
];

interface DesignSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DesignSidebarTab;
  onSelectTab: (tab: DesignSidebarTab) => void;
  dockSide: 'right' | 'left';
  onToggleDockSide: () => void;

  // Responsive Cascade Breakpoint
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;

  // Blocks & Selection
  blocks: BlockInstance[];
  selectedBlock: BlockInstance | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: (blockType: string) => void;
  targetInsertIndex?: number | null;
  onClearTargetInsertIndex?: () => void;

  // Block Actions
  onUpdateSettings: (blockId: string, settings: Partial<BlockInstance['settings']>) => void;
  onUpdateContent: (blockId: string, content: Partial<BlockInstance['content']>) => void;
  onUpdateVisualNode?: (blockId: string, node: VisualNode) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onCopyBlock?: (blockId: string) => void;
  onOpenCodeEditor?: (blockId: string) => void;

  // Theme
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  onUpdateTheme: (theme: Partial<SiteTheme>) => void;

  // Page / SEO
  seoSettings: SeoSettings;
  onUpdateSeoSettings: (settings: SeoSettings) => void;
  projectTitle: string;
  onUpdateProjectTitle: (title: string) => void;
  lastModified?: number;

  // Templates
  onSelectTemplate: (blocks: BlockInstance[], title: string, theme?: SiteTheme) => void;

  // Presets
  onAddPreset?: (preset: BlockPreset, targetIndex?: number) => void;
  onApplyPreset?: (blockId: string, preset: BlockPreset) => void;

  // Pop-up Studio Viewer Controls (User requested spacious pop-up viewer like viewpoints window)
  isStudioViewerOpen?: boolean;
  onOpenViewer?: (tab?: DesignSidebarTab) => void;
  onCloseViewer?: () => void;
  showToast?: (toast: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  }) => void;
  autoVerticalRhythm?: boolean;
  onToggleAutoVerticalRhythm?: (enabled?: boolean) => void;
  onApplyVerticalRhythmToAll?: () => void;
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  dockSide,
  onToggleDockSide,
  activeBreakpoint = 'md',
  onBreakpointChange,
  blocks,
  selectedBlock,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
  targetInsertIndex = null,
  onClearTargetInsertIndex,
  onUpdateSettings,
  onUpdateContent,
  onUpdateVisualNode,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onCopyBlock,
  onOpenCodeEditor,
  theme,
  themeMode = 'light',
  onUpdateTheme,
  seoSettings,
  onUpdateSeoSettings,
  projectTitle,
  onUpdateProjectTitle,
  lastModified,
  onSelectTemplate,
  onAddPreset,
  onApplyPreset,
  isStudioViewerOpen = false,
  onOpenViewer,
  onCloseViewer,
  showToast,
  autoVerticalRhythm,
  onToggleAutoVerticalRhythm,
  onApplyVerticalRhythmToAll,
}) => {
  const [displayMode, setDisplayMode] = useState<'popup' | 'docked'>('docked');
  const [blockFilterQuery, setBlockFilterQuery] = useState('');
  const [blockCategoryFilter, setBlockCategoryFilter] = useState<'all' | BlockCategory>('all');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const isDark = themeMode === 'dark';

  // Real-time block matching counts per sub-category (reactive to search filter)
  const categoryFilteredCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    SIDEBAR_BLOCK_CATEGORIES.forEach((c) => {
      counts[c.id] = 0;
    });
    const q = blockFilterQuery.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    BLOCK_DEFINITIONS.forEach((b) => {
      const catDef = SIDEBAR_BLOCK_CATEGORIES.find((c) => c.id === b.category);
      const catLabel = catDef ? catDef.label.toLowerCase() : '';
      const catShortLabel = catDef ? catDef.shortLabel.toLowerCase() : '';

      const queryMatches =
        terms.length === 0 ||
        terms.every((term) => {
          const nameMatch = b.name.toLowerCase().includes(term);
          const typeMatch = b.type.toLowerCase().includes(term);
          const catIdMatch = b.category.toLowerCase().includes(term);
          const catLabelMatch = catLabel.includes(term);
          const catShortMatch = catShortLabel.includes(term);
          const catMatch = catIdMatch || catLabelMatch || catShortMatch;
          const descMatch = b.description.toLowerCase().includes(term);
          const tagMatch = b.tags?.some((t) => t.toLowerCase().includes(term));
          return nameMatch || typeMatch || catMatch || descMatch || tagMatch;
        });

      if (queryMatches) {
        counts.all = (counts.all || 0) + 1;
        counts[b.category] = (counts[b.category] || 0) + 1;
      }
    });

    return counts;
  }, [blockFilterQuery]);

  // Filtered available blocks list based on title or category search query and category filter
  const matchingBlocks = useMemo(() => {
    const q = blockFilterQuery.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    return BLOCK_DEFINITIONS.filter((b) => {
      const catDef = SIDEBAR_BLOCK_CATEGORIES.find((c) => c.id === b.category);
      const catLabel = catDef ? catDef.label.toLowerCase() : '';
      const catShortLabel = catDef ? catDef.shortLabel.toLowerCase() : '';

      const queryMatches =
        terms.length === 0 ||
        terms.every((term) => {
          const nameMatch = b.name.toLowerCase().includes(term);
          const typeMatch = b.type.toLowerCase().includes(term);
          const catIdMatch = b.category.toLowerCase().includes(term);
          const catLabelMatch = catLabel.includes(term);
          const catShortMatch = catShortLabel.includes(term);
          const catMatch = catIdMatch || catLabelMatch || catShortMatch;
          const descMatch = b.description.toLowerCase().includes(term);
          const tagMatch = b.tags?.some((t) => t.toLowerCase().includes(term));
          return nameMatch || typeMatch || catMatch || descMatch || tagMatch;
        });

      const categoryMatches = blockCategoryFilter === 'all' || b.category === blockCategoryFilter;

      return queryMatches && categoryMatches;
    });
  }, [blockFilterQuery, blockCategoryFilter]);

  const matchingBlocksCount = matchingBlocks.length;

  // Global keyboard shortcut to trigger block library search (Ctrl+K or '/')
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onSelectTab('blocks');
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        onSelectTab('blocks');
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTab]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: BLOCK_DEFINITIONS.length };
    BLOCK_DEFINITIONS.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return counts;
  }, []);

  if (!isOpen) return null;

  const tabs: { id: DesignSidebarTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    {
      id: 'settings',
      label: 'Controls',
      icon: Sliders,
      badge: selectedBlock ? 'Active' : undefined,
    },
    { id: 'blocks', label: 'Add', icon: Layers, badge: blocks.length },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'fonts', label: 'Fonts', icon: Type },
    { id: 'presets', label: 'Presets', icon: BookmarkCheck },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'overview', label: 'More', icon: LayoutDashboard },
  ];

  const secondaryTabs: { id: DesignSidebarTab; label: string; icon: React.ElementType }[] = [
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'fonts', label: 'Font Showcase', icon: Type },
    { id: 'presets', label: 'Presets', icon: BookmarkCheck },
    { id: 'overview', label: 'Health', icon: LayoutDashboard },
    { id: 'layouts', label: 'Layouts', icon: LayoutGrid },
    { id: 'css', label: 'Custom CSS', icon: FileCode },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'code', label: 'HTML', icon: Code2 },
  ];

  const isSecondaryActive = ['presets', 'overview', 'layouts', 'css', 'templates', 'code'].includes(activeTab);

  return (
    <aside
      id="embedded-design-sidebar"
      className={`relative z-30 flex flex-col h-full shadow-xl transition-all duration-300 w-full sm:w-[300px] md:w-[320px] shrink-0 overflow-hidden ${
        isDark
          ? 'bg-[#0b0f19] text-slate-100 border-slate-800'
          : 'bg-white text-slate-900 border-slate-200'
      } ${dockSide === 'right' ? 'border-l order-2' : 'border-r order-first'}`}
    >
      {/* Top Header of the Design Mode Dock */}
      <div
        className={`px-3 py-2 text-white flex items-center justify-between border-b shrink-0 ${
          isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200 truncate">
            {activeTab === 'settings' && selectedBlock
              ? selectedBlock.name
              : activeTab === 'seo'
              ? 'SEO Settings'
              : activeTab === 'fonts'
              ? 'Font Showcase'
              : 'Inspector'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Block Search Button */}
          <button
            type="button"
            onClick={() => {
              onSelectTab('blocks');
              setTimeout(() => searchInputRef.current?.focus(), 60);
            }}
            className={`p-1 rounded-md transition cursor-pointer ${
              activeTab === 'blocks'
                ? isDark
                  ? 'text-cyan-400 bg-slate-800'
                  : 'text-blue-400 bg-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Search block library (Ctrl+K or /)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Pop-up Viewer Open Button */}
          <button
            type="button"
            onClick={() => onOpenViewer && onOpenViewer(activeTab)}
            className={`p-1 rounded-md transition cursor-pointer ${
              isStudioViewerOpen
                ? isDark
                  ? 'text-cyan-300 bg-cyan-950/80 ring-1 ring-cyan-700'
                  : 'text-blue-600 bg-blue-100 ring-1 ring-blue-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Pop out into larger Studio window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Dock switch Left / Right */}
          <button
            type="button"
            onClick={onToggleDockSide}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer"
            title={`Move panel to ${dockSide === 'right' ? 'left' : 'right'}`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded 7-Tab Segmented Navigation Bar */}
      <div
        className={`p-1 border-b grid grid-cols-7 gap-0.5 shrink-0 ${
          isDark
            ? 'bg-[#0b0f19] border-slate-800'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'overview' ? isSecondaryActive : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={tab.id === 'fonts' ? 'tab-btn-fonts' : tab.id === 'seo' ? 'tab-btn-seo' : `tab-btn-${tab.id}`}
              data-testid={tab.id === 'fonts' ? 'tab-btn-font-showcase' : tab.id === 'seo' ? 'tab-btn-seo-settings' : `tab-btn-${tab.id}`}
              onClick={() => {
                onSelectTab(tab.id);
                if (displayMode === 'popup' && onOpenViewer) onOpenViewer(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition text-center relative cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-slate-900 text-cyan-400 shadow-xs border border-slate-700/80'
                    : 'bg-white text-blue-600 shadow-xs border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={tab.id === 'fonts' ? 'Font Showcase (Live preview Google Fonts)' : tab.id === 'seo' ? 'SEO Settings (Canonical URL, Open Graph, Twitter)' : tab.label}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5 shrink-0" />
              <span className="text-[10px] font-semibold leading-none truncate w-full">{tab.label}</span>
              {tab.id === 'settings' && selectedBlock && (
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-cyan-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-navigation bar when secondary tabs are active */}
      {isSecondaryActive && (
        <div
          className={`px-1.5 py-1 border-b flex items-center justify-between gap-1 overflow-x-auto no-scrollbar shrink-0 text-[10px] ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {secondaryTabs.map((st) => {
            const isSubActive = activeTab === st.id;
            return (
              <button
                key={st.id}
                type="button"
                id={`subtab-btn-${st.id}`}
                data-testid={st.id === 'seo' ? 'subtab-btn-seo-settings' : `subtab-btn-${st.id}`}
                onClick={() => {
                  onSelectTab(st.id);
                  if (displayMode === 'popup' && onOpenViewer) onOpenViewer(st.id);
                }}
                className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                  isSubActive
                    ? isDark
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                      : 'bg-blue-100 text-blue-700 font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Body of Active Tool */}
      <div
        className={`flex-1 overflow-y-auto relative ${
          isDark ? 'bg-[#0b0f19]' : 'bg-slate-50/50'
        }`}
      >
        {displayMode === 'popup' ? (
          /* POPUP MODE: Clean, uncluttered Control Hub and Pop-up Launcher */
          <div className="p-3 space-y-3">
            {/* Pop Out Studio Card */}
            <div
              className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                isDark
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-xs ${
                  isDark ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800' : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                {activeTab === 'settings' && <Sliders className="w-5 h-5" />}
                {activeTab === 'blocks' && <Layers className="w-5 h-5" />}
                {activeTab === 'presets' && <BookmarkCheck className="w-5 h-5" />}
                {activeTab === 'theme' && <Palette className="w-5 h-5" />}
                {activeTab === 'seo' && <Globe className="w-5 h-5" />}
                {activeTab === 'layouts' && <LayoutGrid className="w-5 h-5" />}
                {activeTab === 'css' && <FileCode className="w-5 h-5" />}
                {activeTab === 'templates' && <Sparkles className="w-5 h-5" />}
                {activeTab === 'code' && <Code2 className="w-5 h-5" />}
                {activeTab === 'overview' && <LayoutDashboard className="w-5 h-5" />}
              </div>

              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {activeTab === 'settings'
                  ? selectedBlock
                    ? selectedBlock.name
                    : 'Select a Section'
                  : activeTab === 'blocks'
                  ? 'Add Block Components'
                  : activeTab === 'presets'
                  ? 'Block Presets & Templates'
                  : activeTab === 'theme'
                  ? 'Theme & Typography'
                  : activeTab === 'seo'
                  ? 'SEO Settings'
                  : activeTab === 'layouts'
                  ? 'Block Grid Layouts'
                  : activeTab === 'css'
                  ? 'Custom CSS Stylesheet'
                  : activeTab === 'templates'
                  ? 'Starter Templates'
                  : activeTab === 'code'
                  ? 'HTML & Code Export'
                  : 'Site Health & Audit'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[210px] leading-tight">
                {activeTab === 'settings'
                  ? selectedBlock
                    ? `Controls for ${selectedBlock.category} block`
                    : 'Choose a section from the canvas or list'
                  : activeTab === 'blocks'
                  ? `${BLOCK_DEFINITIONS.length} components available to insert`
                  : activeTab === 'presets'
                  ? 'Save & reuse customized block designs'
                  : activeTab === 'theme'
                  ? 'Fonts, colors, and button styling'
                  : activeTab === 'seo'
                  ? 'Canonical URL, Open Graph & Twitter'
                  : activeTab === 'layouts'
                  ? 'Columns, grids, and wireframes'
                  : activeTab === 'css'
                  ? 'Live CSS rule overrides'
                  : activeTab === 'templates'
                  ? '1-click landing page layouts'
                  : activeTab === 'code'
                  ? 'Production Bootstrap 5.3 code'
                  : 'Diagnostic summary and metrics'}
              </p>

              <button
                type="button"
                onClick={() => onOpenViewer && onOpenViewer(activeTab)}
                className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Pop-up Viewer</span>
              </button>
            </div>

            {/* Quick Context Actions / Information */}
            {activeTab === 'settings' && selectedBlock && (
              <div
                className={`p-2.5 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Quick Actions:</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                    {selectedBlock.type}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveUp(selectedBlock.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5 mb-0.5" />
                    <span>Up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(selectedBlock.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5 mb-0.5" />
                    <span>Down</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(selectedBlock.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Duplicate block"
                  >
                    <Copy className="w-3.5 h-3.5 mb-0.5" />
                    <span>Clone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(selectedBlock.id)}
                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex flex-col items-center text-[10px] hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                    title="Delete block"
                  >
                    <Trash2 className="w-3.5 h-3.5 mb-0.5" />
                    <span>Delete</span>
                  </button>
                </div>
                {onOpenCodeEditor && (
                  <button
                    type="button"
                    onClick={() => onOpenCodeEditor(selectedBlock.id)}
                    className={`w-full mt-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isDark
                        ? 'bg-cyan-950/70 hover:bg-cyan-900/80 border-cyan-800/70 text-cyan-300'
                        : 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-800'
                    }`}
                    title="Open Split-Pane HTML & CSS Code Editor for this block"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Edit Block HTML / CSS</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Sections Navigation List in Controls Tab */}
            {activeTab === 'settings' && blocks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                  <span>Sections ({blocks.length}):</span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('blocks');
                      if (onOpenViewer) onOpenViewer('blocks');
                    }}
                    className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold hover:underline"
                  >
                    + Add
                  </button>
                </div>
                <div
                  className={`rounded-xl border divide-y overflow-hidden shadow-2xs ${
                    isDark
                      ? 'bg-slate-900/60 border-slate-800 divide-slate-800'
                      : 'bg-white border-slate-200 divide-slate-100'
                  }`}
                >
                  {blocks.map((b, idx) => {
                    const isSelected = selectedBlockId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onSelectBlock(b.id);
                          if (onOpenViewer) onOpenViewer('settings');
                        }}
                        className={`w-full px-2.5 py-1.5 flex items-center justify-between text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? isDark
                              ? 'bg-cyan-950/70 text-cyan-300 font-semibold'
                              : 'bg-blue-50 text-blue-900 font-semibold'
                            : isDark
                            ? 'text-slate-300 hover:bg-slate-800/60'
                            : 'text-slate-700 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[10px] font-mono text-slate-400 w-3.5">
                            #{idx + 1}
                          </span>
                          <span className="truncate">{b.name}</span>
                        </div>
                        <span className="text-[9px] font-mono opacity-60 uppercase">{b.type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Searchable Block Library in Blocks Tab */}
            {activeTab === 'blocks' && (
              <div className="space-y-2.5">
                {/* Search Bar Input & Category Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        ref={searchInputRef}
                        id="blocks-filter-input"
                        name="blocksFilter"
                        type="text"
                        placeholder="Filter by title or category..."
                        value={blockFilterQuery}
                        onChange={(e) => setBlockFilterQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setBlockFilterQuery('');
                        }}
                        aria-label="Filter blocks by category or title"
                        className={`w-full pl-8 pr-7 py-1.5 text-xs border rounded-lg outline-hidden focus:ring-2 transition font-medium ${
                          isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500'
                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
                        }`}
                      />
                      {blockFilterQuery && (
                        <button
                          type="button"
                          onClick={() => setBlockFilterQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <select
                      id="popup-category-filter-select"
                      aria-label="Filter by block category"
                      value={blockCategoryFilter}
                      onChange={(e) => setBlockCategoryFilter(e.target.value as any)}
                      className={`py-1.5 px-2 text-xs border rounded-lg outline-hidden focus:ring-2 transition font-medium cursor-pointer shrink-0 max-w-[125px] ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-200 focus:border-cyan-500'
                          : 'bg-white border-slate-200 text-slate-700 focus:border-blue-500'
                      }`}
                    >
                      <option value="all">All ({BLOCK_DEFINITIONS.length})</option>
                      {SIDEBAR_BLOCK_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortLabel} ({categoryFilteredCounts[c.id] || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-Category Browsing Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {SIDEBAR_BLOCK_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = blockCategoryFilter === cat.id;
                      const count = categoryFilteredCounts[cat.id] ?? 0;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setBlockCategoryFilter(cat.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shrink-0 transition cursor-pointer border ${
                            isSelected
                              ? isDark
                                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                                : 'bg-blue-600 text-white font-bold border-blue-600'
                              : isDark
                              ? 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                              : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span>{cat.shortLabel}</span>
                          <span className="text-[9px] opacity-75 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Match Counter & Reset Option */}
                <div className="flex items-center justify-between text-[11px] px-0.5 text-slate-400">
                  <span>
                    Available Blocks: <strong className={isDark ? 'text-cyan-400' : 'text-blue-600'}>{matchingBlocksCount}</strong> of {BLOCK_DEFINITIONS.length}
                  </span>
                  {(blockFilterQuery || blockCategoryFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setBlockFilterQuery('');
                        setBlockCategoryFilter('all');
                      }}
                      className={`text-[10.5px] font-semibold transition cursor-pointer ${
                        isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                {/* Searchable List of Available Blocks */}
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                  {matchingBlocks.length === 0 ? (
                    <div
                      className={`p-4 rounded-xl border text-center text-xs space-y-2 ${
                        isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <p>
                        No blocks match &ldquo;<strong>{blockFilterQuery}</strong>&rdquo;
                        {blockCategoryFilter !== 'all' ? ` in category "${blockCategoryFilter}"` : ''}.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockFilterQuery('');
                          setBlockCategoryFilter('all');
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                          isDark ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700' : 'bg-white border text-blue-600 hover:bg-slate-100'
                        }`}
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  ) : (
                    matchingBlocks.map((block) => {
                      const catDef = SIDEBAR_BLOCK_CATEGORIES.find((c) => c.id === block.category);
                      const CatIcon = catDef?.icon || Layers;
                      return (
                        <div
                          key={block.type}
                          className={`p-2 rounded-lg border text-left text-xs transition flex items-start justify-between gap-2 ${
                            isDark
                              ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-600/60 hover:bg-slate-850 text-slate-200'
                              : 'bg-white border-slate-200 hover:border-blue-400/80 hover:bg-blue-50/40 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <div
                              className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
                                isDark ? 'bg-slate-800 text-cyan-400' : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              <CatIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold truncate">{block.name}</span>
                                <span
                                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-medium ${
                                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {catDef?.shortLabel || block.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {block.description}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onAddBlock(block.type);
                              onSelectTab('settings');
                            }}
                            title={`Add ${block.name} to page`}
                            aria-label={`Add ${block.name}`}
                            className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                              isDark
                                ? 'bg-cyan-500/15 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30'
                                : 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200'
                            }`}
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Insert Presets */}
                <div className="pt-1 border-t border-slate-800/40">
                  <div className="text-[11px] font-bold text-slate-500 px-1 mb-1">
                    Quick Insert:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Hero Header', type: 'hero' },
                      { label: 'Navbar Menu', type: 'navbar' },
                      { label: 'Feature Cards', type: 'features' },
                      { label: 'Pricing Table', type: 'pricing' },
                      { label: 'Testimonials', type: 'testimonials' },
                      { label: 'Contact Form', type: 'contact' },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onAddBlock(item.type);
                          if (onOpenViewer) onOpenViewer('settings');
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isDark
                            ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-600 hover:bg-slate-800 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        <Plus className="w-3 h-3 shrink-0 text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Theme Preview in Theme Tab */}
            {activeTab === 'theme' && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-2.5 ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Primary Color:</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: theme.primaryColor || '#0d6efd' }}
                    />
                    <span className="font-mono text-[10px]">{theme.primaryColor || '#0d6efd'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Headings:</span>
                  <span className="font-semibold">{theme.headingFontFamily || 'Space Grotesk'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Body Font:</span>
                  <span className="font-semibold">{theme.fontFamily || 'Plus Jakarta Sans'}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* DOCKED MODE: Original inline drawers */
          <div className="h-full">
        {/* TAB: PRESETS */}
        {activeTab === 'presets' && (
          <div className="h-full" id="presets-tab-pane">
            <PresetsTab
              blocks={blocks}
              selectedBlock={selectedBlock}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              onAddBlockFromPreset={(preset, targetIndex) => {
                if (onAddPreset) {
                  onAddPreset(preset, targetIndex);
                } else {
                  onAddBlock(preset.block.type);
                }
              }}
              onApplyPresetToBlock={onApplyPreset}
              isDark={isDark}
              isSpacious={false}
            />
          </div>
        )}

        {/* TAB 1: BLOCKS */}
        {activeTab === 'blocks' && (
          <div className="h-full flex flex-col" id="blocks-tab-pane">
            {/* Dedicated Block Library Search Bar and Category Filter Header */}
            <div
              className={`p-3 border-b shadow-2xs shrink-0 flex flex-col gap-2.5 transition-colors ${
                isDark
                  ? 'border-slate-800 bg-[#0f172a]'
                  : 'border-slate-200 bg-white'
              }`}
            >
              {/* Primary Search Bar Input with Category Selector, Clear Button, and Shortcut Badge */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Search
                    className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                      blockFilterQuery
                        ? isDark
                          ? 'text-cyan-400'
                          : 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <input
                    ref={searchInputRef}
                    id="blocks-filter-input"
                    name="blocksFilter"
                    type="text"
                    placeholder="Search blocks by name or category..."
                    value={blockFilterQuery}
                    onChange={(e) => setBlockFilterQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setBlockFilterQuery('');
                    }}
                    aria-label="Search blocks by name or category"
                    className={`w-full pl-9 pr-14 py-2 text-xs border rounded-xl outline-hidden focus:ring-2 transition font-medium shadow-2xs ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10'
                    }`}
                  />

                  {/* Right Input Adornments: Match Counter + Clear Button OR Shortcut Hint */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {blockFilterQuery ? (
                      <>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                            isDark
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {matchingBlocksCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setBlockFilterQuery('');
                            searchInputRef.current?.focus();
                          }}
                          title="Clear search (Esc)"
                          aria-label="Clear search"
                          className={`p-1 rounded-md transition cursor-pointer ${
                            isDark
                              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span
                        title="Press / or ⌘K to search"
                        className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/60 hidden sm:inline-block pointer-events-none select-none"
                      >
                        /
                      </span>
                    )}
                  </div>
                </div>

                <select
                  id="docked-category-filter-select"
                  aria-label="Filter by block category"
                  value={blockCategoryFilter}
                  onChange={(e) => setBlockCategoryFilter(e.target.value as any)}
                  className={`py-2 px-2 text-xs border rounded-xl outline-hidden focus:ring-2 transition font-medium cursor-pointer shrink-0 max-w-[115px] ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-slate-200 focus:border-cyan-500'
                      : 'bg-white border-slate-200 text-slate-700 focus:border-blue-500'
                  }`}
                >
                  <option value="all">All ({BLOCK_DEFINITIONS.length})</option>
                  {SIDEBAR_BLOCK_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortLabel} ({categoryFilteredCounts[c.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[9.5px]">
                    Filter by Category
                  </span>
                  {(blockCategoryFilter !== 'all' || blockFilterQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setBlockCategoryFilter('all');
                        setBlockFilterQuery('');
                      }}
                      className={`text-[10px] font-semibold transition cursor-pointer ${
                        isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Horizontal Category Chips */}
                <div
                  ref={categoryScrollRef}
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5 scroll-smooth"
                >
                  {SIDEBAR_BLOCK_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = blockCategoryFilter === cat.id;
                    const count = categoryFilteredCounts[cat.id] ?? 0;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setBlockCategoryFilter(cat.id);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer border ${
                          isSelected
                            ? isDark
                              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-xs'
                              : 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                            : isDark
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                            : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <Icon className="w-3 h-3 shrink-0" />
                        <span>{cat.shortLabel}</span>
                        <span
                          className={`text-[9.5px] px-1 py-0.2 rounded-full font-bold ml-0.5 ${
                            isSelected
                              ? isDark
                                ? 'bg-slate-950/20 text-slate-950'
                                : 'bg-blue-800/40 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Search Suggestions when query is empty */}
              {!blockFilterQuery && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 shrink-0 mr-0.5">
                    Suggested:
                  </span>
                  {['Hero', 'Navbar', 'Pricing', 'Cards', 'Contact', 'Footer', 'HTML'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setBlockFilterQuery(tag);
                        searchInputRef.current?.focus();
                      }}
                      className={`text-[10.5px] px-2 py-0.5 rounded-md font-medium transition shrink-0 cursor-pointer border ${
                        isDark
                          ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Search & Filter Feedback Banner */}
              {(blockFilterQuery || blockCategoryFilter !== 'all') && (
                <div
                  className={`flex items-center justify-between text-[11px] px-2 py-1 rounded-lg border ${
                    isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-blue-50/70 border-blue-100 text-blue-900'
                  }`}
                >
                  <span className="truncate">
                    Showing <strong>{matchingBlocksCount}</strong> {matchingBlocksCount === 1 ? 'block' : 'blocks'}
                    {blockFilterQuery && (
                      <> matching &ldquo;<span className={isDark ? 'text-cyan-400 font-bold' : 'text-blue-600 font-bold'}>{blockFilterQuery}</span>&rdquo;</>
                    )}
                    {blockCategoryFilter !== 'all' && (
                      <> in <strong className="capitalize">{SIDEBAR_BLOCK_CATEGORIES.find((c) => c.id === blockCategoryFilter)?.label}</strong></>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBlockFilterQuery('');
                      setBlockCategoryFilter('all');
                      searchInputRef.current?.focus();
                    }}
                    className={`text-[10px] font-bold underline transition ml-2 shrink-0 cursor-pointer ${
                      isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {typeof targetInsertIndex === 'number' && (
                <div className="mx-3 my-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 shrink-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span>
                      Inserting into position <strong>#{targetInsertIndex + 1}</strong> of {blocks.length + 1}
                    </span>
                  </div>
                  {onClearTargetInsertIndex && (
                    <button
                      type="button"
                      onClick={onClearTargetInsertIndex}
                      className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-1.5 py-0.5 rounded transition cursor-pointer"
                      title="Insert at standard position instead"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
              <BlockLibraryDrawer
                isOpen={true}
                onClose={() => {}}
                onAddBlock={(type) => {
                  onAddBlock(type);
                  onSelectTab('settings');
                }}
                selectedBlockId={selectedBlockId}
                theme={theme}
                themeMode={themeMode}
                isEmbedded={true}
                searchQuery={blockFilterQuery}
                onSearchQueryChange={setBlockFilterQuery}
                selectedCategory={blockCategoryFilter}
                onSelectCategory={setBlockCategoryFilter}
                hideSearchBar={true}
                hideCategoryTabs={true}
                hideTagsBar={true}
              />
            </div>
          </div>
        )}

        {/* TAB: BLOCK GRID LAYOUTS */}
        {activeTab === 'layouts' && (
          <div className="h-full" id="layouts-tab-pane">
            <BlockLayoutsTab
              selectedBlock={selectedBlock}
              blocks={blocks}
              onSelectBlock={onSelectBlock}
              onUpdateSettings={onUpdateSettings}
              onUpdateVisualNode={onUpdateVisualNode}
              activeBreakpoint={activeBreakpoint}
            />
          </div>
        )}

        {/* TAB: BLOCK SETTINGS & ALL PARAMETERS */}
        {activeTab === 'settings' && (
          <div className="h-full">
            <BlockSettingsDrawer
              block={selectedBlock}
              blocks={blocks}
              theme={theme}
              isOpen={true}
              onClose={() => {}}
              onSelectBlock={onSelectBlock}
              onUpdateSettings={onUpdateSettings}
              onUpdateContent={onUpdateContent}
              onUpdateVisualNode={onUpdateVisualNode}
              activeBreakpoint={activeBreakpoint}
              onBreakpointChange={onBreakpointChange}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onCopyBlock={onCopyBlock}
              onOpenCodeEditor={onOpenCodeEditor}
              onOpenLibrary={() => onSelectTab('blocks')}
              isEmbedded={true}
              themeMode={themeMode}
              autoVerticalRhythm={autoVerticalRhythm}
              onToggleAutoVerticalRhythm={onToggleAutoVerticalRhythm}
              onApplyVerticalRhythmToAll={onApplyVerticalRhythmToAll}
            />
          </div>
        )}

        {/* TAB 3: THEME & BRANDING */}
        {activeTab === 'theme' && (
          <div className="h-full">
            <ThemeModal
              isOpen={true}
              onClose={() => {}}
              theme={theme}
              onUpdateTheme={onUpdateTheme}
              isEmbedded={true}
            />
          </div>
        )}

        {/* TAB: GOOGLE FONTS SHOWCASE */}
        {activeTab === 'fonts' && (
          <div className="h-full overflow-y-auto" id="fonts-tab-pane">
            <FontShowcaseTab
              theme={theme}
              themeMode={themeMode}
              onUpdateTheme={onUpdateTheme}
              onSelectTab={onSelectTab}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB: CUSTOM CSS INJECTOR */}
        {activeTab === 'css' && (
          <div className="h-full">
            <CustomCssEditor
              theme={theme}
              themeMode={themeMode}
              onUpdateTheme={onUpdateTheme}
            />
          </div>
        )}

        {/* TAB: SEO SETTINGS (Canonical URL, Open Graph, Twitter Handle) */}
        {activeTab === 'seo' && (
          <div className="h-full overflow-y-auto" id="seo-tab-pane">
            <SeoSettingsTab
              seoSettings={seoSettings}
              onUpdateSeoSettings={onUpdateSeoSettings}
              projectTitle={projectTitle}
              onUpdateProjectTitle={onUpdateProjectTitle}
              themeMode={themeMode}
              showToast={showToast}
              blocks={blocks}
              onUpdateContent={onUpdateContent}
              onSelectBlock={onSelectBlock}
              onAddBlock={onAddBlock}
            />
          </div>
        )}

        {/* TAB 5: STARTER TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="h-full">
            <TemplatesModal
              isOpen={true}
              onClose={() => {}}
              onSelectTemplate={(newBlocks, title, theme) => {
                onSelectTemplate(newBlocks, title, theme);
                onSelectTab('blocks');
              }}
              isEmbedded={true}
              themeMode={themeMode}
              activeProjectTitle={projectTitle}
            />
          </div>
        )}

        {/* TAB 6: HTML CODE INSPECTOR */}
        {activeTab === 'code' && (
          <div className="h-full">
            <CodeModal
              isOpen={true}
              onClose={() => {}}
              blocks={blocks}
              theme={theme}
              projectTitle={projectTitle}
              seoSettings={seoSettings}
              isEmbedded={true}
            />
          </div>
        )}

        {/* TAB 7: PROJECT HEALTH & OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="h-full p-4 overflow-y-auto">
            <ProjectOverviewCard
              blocks={blocks}
              theme={theme}
              themeMode={themeMode}
              projectTitle={projectTitle}
              seoSettings={seoSettings}
              lastModified={lastModified}
              onSelectTab={onSelectTab}
            />
          </div>
        )}
          </div>
        )}
      </div>

      {/* Bottom Display Mode Switcher */}
      <div
        className={`p-2 border-t mt-auto shrink-0 flex items-center justify-between text-[10px] ${
          isDark
            ? 'bg-[#0b0f19] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <span className="font-semibold">Display Mode:</span>
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-md">
          <button
            type="button"
            onClick={() => setDisplayMode('popup')}
            className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
              displayMode === 'popup'
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 font-bold shadow-2xs'
                  : 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Display tools in a spacious pop-up viewer window"
          >
            Pop-up Viewer
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('docked')}
            className={`px-2 py-0.5 rounded transition font-semibold cursor-pointer ${
              displayMode === 'docked'
                ? isDark
                  ? 'bg-cyan-950 text-cyan-300 font-bold shadow-2xs'
                  : 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Display tools directly inside docked sidebar"
          >
            Docked
          </button>
        </div>
      </div>
    </aside>
  );
};
