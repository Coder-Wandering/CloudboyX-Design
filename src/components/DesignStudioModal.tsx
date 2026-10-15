import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Sliders,
  Layers,
  Palette,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  FileCode,
  Sparkles,
  Code2,
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ExternalLink,
  BookmarkCheck,
  Type,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings, BlockCategory, BlockPreset } from '../types';
import { Breakpoint, VisualNode } from '../engine/bootstrapCascade';
import { DesignSidebarTab } from './DesignSidebar';
import { BlockSettingsDrawer } from './BlockSettingsDrawer';
import { BlockLibraryDrawer } from './BlockLibraryDrawer';
import { ThemeModal } from './ThemeModal';
import { FontShowcaseTab } from './FontShowcaseTab';
import { PageSettingsModal } from './PageSettingsModal';
import { BlockLayoutsTab } from './BlockLayoutsTab';
import { CustomCssEditor } from './CustomCssEditor';
import { TemplatesModal } from './TemplatesModal';
import { CodeModal } from './CodeModal';
import { ProjectOverviewCard } from './ProjectOverviewCard';
import { PresetsTab } from './PresetsTab';

interface DesignStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: DesignSidebarTab;
  onSelectTab: (tab: DesignSidebarTab) => void;

  // Responsive Breakpoint
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;

  // Blocks & Selection
  blocks: BlockInstance[];
  selectedBlock: BlockInstance | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlock: (blockType: string) => void;

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

  // Theme & Page Settings
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  onUpdateTheme: (theme: Partial<SiteTheme>) => void;
  seoSettings: SeoSettings;
  onUpdateSeoSettings: (settings: SeoSettings) => void;
  projectTitle: string;
  onUpdateProjectTitle: (title: string) => void;

  // Templates
  onSelectTemplate?: (blocks: BlockInstance[], title: string, theme?: SiteTheme) => void;

  // Presets
  onAddPreset?: (preset: BlockPreset, targetIndex?: number) => void;
  onApplyPreset?: (blockId: string, preset: BlockPreset) => void;
}

export const DesignStudioModal: React.FC<DesignStudioModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  activeBreakpoint = 'lg',
  onBreakpointChange,
  blocks,
  selectedBlock,
  selectedBlockId,
  onSelectBlock,
  onAddBlock,
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
  onSelectTemplate,
  onAddPreset,
  onApplyPreset,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isDark = themeMode === 'dark';

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen) return null;

  const studioTabs: {
    id: DesignSidebarTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
  }[] = [
    {
      id: 'settings',
      label: 'Block Controls',
      icon: Sliders,
      badge: selectedBlock ? selectedBlock.name : undefined,
    },
    { id: 'blocks', label: 'Add Components', icon: Layers, badge: blocks.length },
    { id: 'presets', label: 'Presets', icon: BookmarkCheck, badge: 'Templates' },
    { id: 'theme', label: 'Theme Studio', icon: Palette },
    { id: 'fonts', label: 'Font Showcase', icon: Type },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'layouts', label: 'Layouts', icon: LayoutGrid },
    { id: 'css', label: 'Custom CSS', icon: FileCode },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'code', label: 'HTML Export', icon: Code2 },
    { id: 'overview', label: 'Health', icon: LayoutDashboard },
  ];

  return (
    <div
      id="design-studio-popup-viewer"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-xs transition-all duration-200 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Design Studio Pop-up Viewer"
    >
      <div
        className={`w-full flex flex-col border shadow-2xl transition-all duration-300 overflow-hidden ${
          isFullscreen
            ? 'fixed inset-0 rounded-none z-50'
            : 'max-w-6xl h-[90vh] rounded-2xl'
        } ${
          isDark
            ? 'bg-[#0b0f19] border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* TOP BAR: Title, Full Tab Navigation, Viewport & Window Controls */}
        <header
          className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          {/* Left: Active Tool Branding & Block Name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600/90 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                  Studio Pop-up Viewer
                </span>
                {activeTab === 'settings' && selectedBlock && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                    {selectedBlock.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {activeTab === 'settings' && selectedBlock
                  ? `Editing ${selectedBlock.name} (${selectedBlock.category})`
                  : activeTab === 'blocks'
                  ? 'Browse and insert Bootstrap 5 components'
                  : activeTab === 'theme'
                  ? 'Theme, typography scales, and color presets'
                  : activeTab === 'seo'
                  ? 'Page metadata, social share cards, and OpenGraph'
                  : activeTab === 'layouts'
                  ? 'Interactive section column wireframes'
                  : activeTab === 'css'
                  ? 'Global custom CSS stylesheet editor'
                  : activeTab === 'templates'
                  ? 'Full landing page starter templates'
                  : activeTab === 'code'
                  ? 'Production-ready Bootstrap 5 HTML & CSS'
                  : 'Site audit and performance diagnostic'}
              </p>
            </div>
          </div>

          {/* Center: Tab Navigation Bar (User requested: use the tab navigation in pop-up viewer) */}
          <nav
            className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold"
            aria-label="Studio Tools Navigation"
          >
            {studioTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Breakpoint Selector & Window Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Viewport switcher */}
            {onBreakpointChange && (
              <div className="hidden sm:flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => onBreakpointChange('lg')}
                  className={`p-1.5 rounded-md transition ${
                    activeBreakpoint === 'lg' || activeBreakpoint === 'xl' || activeBreakpoint === 'xxl'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onBreakpointChange('md')}
                  className={`p-1.5 rounded-md transition ${
                    activeBreakpoint === 'md'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onBreakpointChange('xs')}
                  className={`p-1.5 rounded-md transition ${
                    activeBreakpoint === 'xs' || activeBreakpoint === 'sm'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/40 rounded-lg transition cursor-pointer"
              title="Close Pop-up Viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* MAIN BODY: Spacious Pop-up Content */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-slate-50/50 dark:bg-[#0b0f19]">
          {/* TAB 1: BLOCK CONTROLS */}
          {activeTab === 'settings' && (
            <div className="h-full flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Quick Block Switcher list so user can hop between sections on the page */}
              {blocks.length > 0 && (
                <div
                  className={`w-full md:w-64 border-b md:border-b-0 md:border-r shrink-0 flex flex-col overflow-hidden ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/70 border-slate-200'
                  }`}
                >
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Page Sections ({blocks.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTab('blocks')}
                      className="text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Section</span>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {blocks.map((b, idx) => {
                      const isSelected = selectedBlockId === b.id;
                      return (
                        <div
                          key={b.id}
                          className={`group flex items-center justify-between p-2 rounded-xl text-xs font-medium transition cursor-pointer border ${
                            isSelected
                              ? isDark
                                ? 'bg-cyan-950/70 text-cyan-200 border-cyan-700 shadow-xs'
                                : 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs'
                              : isDark
                              ? 'text-slate-300 border-transparent hover:bg-slate-800/70'
                              : 'text-slate-700 border-transparent hover:bg-slate-200/70'
                          }`}
                          onClick={() => onSelectBlock(b.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono font-bold text-slate-400 w-4">
                              #{idx + 1}
                            </span>
                            <span className="truncate font-semibold">{b.name}</span>
                          </div>

                          {/* Quick reorder and action icons */}
                          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveUp(b.id);
                              }}
                              disabled={idx === 0}
                              className="p-1 hover:bg-slate-700/40 rounded disabled:opacity-20"
                              title="Move up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveDown(b.id);
                              }}
                              disabled={idx === blocks.length - 1}
                              className="p-1 hover:bg-slate-700/40 rounded disabled:opacity-20"
                              title="Move down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(b.id);
                              }}
                              className="p-1 hover:bg-slate-700/40 rounded"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(b.id);
                              }}
                              className="p-1 hover:bg-rose-950 text-rose-500 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Right Column: Full Spacious Block Settings Drawer */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <BlockSettingsDrawer
                  block={selectedBlock}
                  blocks={blocks}
                  isOpen={true}
                  onClose={onClose}
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
                  isEmbedded={false}
                  themeMode={themeMode}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ADD COMPONENTS (BLOCK LIBRARY) */}
          {activeTab === 'blocks' && (
            <div className="h-full flex flex-col overflow-hidden">
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
                isEmbedded={false}
              />
            </div>
          )}

          {/* TAB 3: THEME STUDIO */}
          {activeTab === 'theme' && (
            <div className="h-full flex flex-col overflow-hidden">
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
            <div className="h-full flex flex-col overflow-hidden p-2 sm:p-4">
              <FontShowcaseTab
                theme={theme}
                themeMode={themeMode}
                onUpdateTheme={onUpdateTheme}
                onSelectTab={onSelectTab}
                isSpacious={true}
              />
            </div>
          )}

          {/* TAB 4: PAGE SETTINGS & SEO */}
          {activeTab === 'seo' && (
            <div className="h-full flex flex-col overflow-hidden">
              <PageSettingsModal
                isOpen={true}
                onClose={() => {}}
                seoSettings={seoSettings}
                onSave={onUpdateSeoSettings}
                projectTitle={projectTitle}
                isEmbedded={true}
                blocks={blocks}
                onSelectBlock={(id) => {
                  onSelectBlock(id);
                  onSelectTab('settings');
                }}
              />
            </div>
          )}

          {/* TAB: PRESETS & TEMPLATES */}
          {activeTab === 'presets' && (
            <div className="h-full flex flex-col overflow-hidden" id="modal-presets-tab-pane">
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
                  onSelectTab('settings');
                }}
                onApplyPresetToBlock={onApplyPreset}
                isDark={isDark}
                isSpacious={true}
              />
            </div>
          )}

          {/* TAB 5: LAYOUTS */}
          {activeTab === 'layouts' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <BlockLayoutsTab
                selectedBlock={selectedBlock}
                onUpdateSettings={onUpdateSettings}
                onUpdateVisualNode={onUpdateVisualNode}
                activeBreakpoint={activeBreakpoint}
                themeMode={themeMode}
              />
            </div>
          )}

          {/* TAB 6: CUSTOM CSS */}
          {activeTab === 'css' && (
            <div className="h-full flex flex-col overflow-hidden">
              <CustomCssEditor
                theme={theme}
                themeMode={themeMode}
                onUpdateTheme={onUpdateTheme}
              />
            </div>
          )}

          {/* TAB 7: STARTER TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="h-full flex flex-col overflow-hidden">
              <TemplatesModal
                isOpen={true}
                onClose={() => {}}
                onSelectTemplate={(newBlocks, title, newTheme) => {
                  if (onSelectTemplate) {
                    onSelectTemplate(newBlocks, title, newTheme);
                  } else {
                    if (newTheme) {
                      onUpdateTheme(newTheme);
                    }
                    onUpdateProjectTitle(title);
                  }
                  onSelectTab('settings');
                }}
                isEmbedded={true}
                themeMode={themeMode}
                activeProjectTitle={projectTitle}
              />
            </div>
          )}

          {/* TAB 8: HTML / CODE EXPORT */}
          {activeTab === 'code' && (
            <div className="h-full flex flex-col overflow-hidden">
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

          {/* TAB 9: PROJECT HEALTH & OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
              <ProjectOverviewCard
                blocks={blocks}
                theme={theme}
                themeMode={themeMode}
                projectTitle={projectTitle}
                seoSettings={seoSettings}
                onSelectTab={onSelectTab}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
