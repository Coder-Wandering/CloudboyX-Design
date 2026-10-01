import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Download,
  SlidersHorizontal,
  Plus,
  Home,
  LogOut,
  User as UserIcon,
  Shield,
  Globe,
  Sparkles,
  Layers,
  Play,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { ViewportMode } from '../types';
import { Breakpoint, BREAKPOINT_LABELS } from '../engine/bootstrapCascade';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

interface EditorHeaderProps {
  viewport: ViewportMode;
  setViewport: (vp: ViewportMode) => void;
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  onOpenLivePreview?: () => void;
  onOpenTemplateGallery?: () => void;
  onOpenClipboard?: () => void;
  clipboardCount?: number;
  isDesignModeOpen: boolean;
  onToggleDesignMode: () => void;
  onExportHtml: () => void;
  blockCount: number;
  onBackToLanding?: () => void;
  onOpenAdmin?: () => void;
  onOpenModules?: () => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
  lastModified?: number;
}

function formatHeaderSaveTime(timestamp: number, currentNow: number): string {
  const diffSec = Math.max(0, Math.floor((currentNow - timestamp) / 1000));
  if (diffSec < 10) return 'Saved just now';
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Saved ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Saved ${diffHours}h ago`;
  return `Saved ${new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

function formatExactSaveTime(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'recently';
  }
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  viewport,
  setViewport,
  activeBreakpoint = 'lg',
  onBreakpointChange,
  projectTitle,
  setProjectTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isPreviewMode,
  setIsPreviewMode,
  onOpenLivePreview,
  onOpenTemplateGallery,
  onOpenClipboard,
  clipboardCount = 0,
  isDesignModeOpen,
  onToggleDesignMode,
  onExportHtml,
  blockCount,
  onBackToLanding,
  onOpenAdmin,
  onOpenModules,
  themeMode = 'light',
  onToggleThemeMode,
  lastModified,
}) => {
  const { user, isDemoUnlocked, isAdmin, isAgencyTeam, activeRole, permissions, agencyBranding, logOut } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [now, setNow] = React.useState<number>(Date.now());
  const [justSaved, setJustSaved] = React.useState<boolean>(false);
  const prevLastModified = React.useRef(lastModified);

  // Periodically refresh relative time display every 5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Flash subtle active save indicator when lastModified changes
  React.useEffect(() => {
    if (lastModified && prevLastModified.current && lastModified !== prevLastModified.current) {
      setJustSaved(true);
      setNow(Date.now());
      const timeout = setTimeout(() => {
        setJustSaved(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
    prevLastModified.current = lastModified;
  }, [lastModified]);

  const isClient = activeRole.startsWith('client_');
  const isDark = themeMode === 'dark';

  return (
    <header
      className={`h-16 border-b px-4 flex items-center justify-between select-none shrink-0 z-30 shadow-xs transition-colors duration-200 ${
        isDark
          ? 'border-[#191970]/60 bg-[#1C1C23] text-white'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 pr-3 border-r ${isDark ? 'border-[#191970]/60' : 'border-slate-200'}`}>
          {agencyBranding.agencyLogoUrl ? (
            <img
              src={agencyBranding.agencyLogoUrl}
              alt={agencyBranding.agencyName}
              className="h-8 max-w-[120px] object-contain"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm"
              style={{ backgroundColor: agencyBranding.primaryBrandColor || '#2222FF' }}
            >
              {agencyBranding.agencyName.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {agencyBranding.agencyName || 'CloudboyX Design'}
              </span>
              <span
                className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                BS 5.3
              </span>
            </div>
            <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isClient ? 'Client Site Editor' : 'Visual HTML Builder'}
            </p>
          </div>
        </div>

        {/* Project Title */}
        <div className="flex items-center gap-2">
          {isEditingTitle && permissions.canEditDesign ? (
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className={`text-xs font-semibold px-2 py-1 rounded-md outline-none ${
                isDark
                  ? 'bg-slate-800 border border-blue-500 text-slate-100'
                  : 'bg-slate-100 border border-blue-400 text-slate-800'
              }`}
            />
          ) : (
            <button
              onClick={() => {
                if (permissions.canEditDesign) setIsEditingTitle(true);
              }}
              className={`text-xs font-semibold px-2 py-1 rounded transition text-left ${
                isDark
                  ? 'text-slate-200 hover:text-blue-400 hover:bg-slate-800'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
              }`}
              title={permissions.canEditDesign ? 'Click to rename' : 'Site Name'}
            >
              {projectTitle}
            </button>
          )}
          <span className={`text-[11px] font-medium hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            ({blockCount} {blockCount === 1 ? 'section' : 'sections'})
          </span>
          {!permissions.canEditDesign && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                isDark
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
            >
              Read-Only
            </span>
          )}

          {/* Visual Auto-Save Status Indicator */}
          {lastModified ? (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-300 select-none cursor-default ${
                justSaved
                  ? isDark
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-400/90 ring-2 ring-emerald-400/20 shadow-xs'
                  : isDark
                  ? 'bg-emerald-950/30 text-emerald-400/90 border-emerald-900/60 hover:bg-emerald-950/50'
                  : 'bg-emerald-50/90 text-emerald-700 border-emerald-200/90 hover:bg-emerald-100/70'
              }`}
              title={`Auto-saved to local storage at ${formatExactSaveTime(lastModified)} • All edits persisted`}
            >
              <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                    justSaved ? 'animate-ping' : ''
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 transition-colors duration-200 ${
                    justSaved ? 'bg-emerald-300' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="whitespace-nowrap font-medium tracking-tight">
                {justSaved ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />
                    <span>Saved</span>
                  </span>
                ) : (
                  <>
                    <span className="hidden sm:inline">{formatHeaderSaveTime(lastModified, now)}</span>
                    <span className="inline sm:hidden">Saved</span>
                  </>
                )}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Center: Viewport Controls & Undo/Redo */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center p-1 rounded-lg border transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'desktop'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-600 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'tablet'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-600 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-4 h-4" />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${
              viewport === 'mobile'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-600 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Active Breakpoint Tier Indicator in Header */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-mono border border-slate-800 shadow-xs"
          title={`Active Responsive Cascade Tier: ${BREAKPOINT_LABELS[activeBreakpoint].label} (${BREAKPOINT_LABELS[activeBreakpoint].pixelRange})`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-[11px] text-slate-400">Tier:</span>
          <span className="text-blue-400 font-bold uppercase">{activeBreakpoint}</span>
          <span className="text-[10px] text-slate-400 font-normal">({BREAKPOINT_LABELS[activeBreakpoint].desc})</span>
        </div>

        <div className={`h-5 w-px mx-1 hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md disabled:opacity-35 disabled:hover:bg-transparent transition ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md disabled:opacity-35 disabled:hover:bg-transparent transition ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Actions & Theme Mode Toggle */}
      <div className="flex items-center gap-2">
        {/* Light / Dark Theme Mode Toggle Switch in Header */}
        {onToggleThemeMode && (
          <div className="flex items-center pr-1 border-r border-slate-700/50 mr-0.5">
            <ThemeToggleSwitch
              themeMode={themeMode}
              onToggle={onToggleThemeMode}
              size="sm"
            />
          </div>
        )}

        {/* Template Gallery (100+ Templates) Modal Launcher */}
        {onOpenTemplateGallery && (
          <button
            type="button"
            id="btn-open-template-gallery-modal"
            onClick={onOpenTemplateGallery}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition shadow-xs cursor-pointer ${
              isDark
                ? 'bg-blue-950/70 hover:bg-blue-900 text-blue-300 border-blue-700/80 hover:border-blue-500 ring-1 ring-blue-500/20'
                : 'bg-blue-50 hover:bg-blue-100/90 text-blue-700 hover:text-blue-800 border-blue-300 hover:border-blue-400'
            }`}
            title="Open Bootstrap 5 Template Gallery (108+ Ready-to-Use Templates)"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="inline">Templates (108+)</span>
          </button>
        )}

        {/* Live Full-Screen Preview Modal Launcher */}
        {onOpenLivePreview && (
          <button
            type="button"
            id="btn-open-live-preview-modal"
            onClick={onOpenLivePreview}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition shadow-xs cursor-pointer ${
              isDark
                ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border-emerald-700/80 hover:border-emerald-500 ring-1 ring-emerald-500/20'
                : 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-700 hover:text-emerald-800 border-emerald-300 hover:border-emerald-400'
            }`}
            title="Open Full-Screen Live Website in Pure Modal View"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
            <span className="inline">Live Preview</span>
          </button>
        )}

        {/* Clipboard Manager Launcher */}
        {onOpenClipboard && (
          <button
            type="button"
            id="btn-header-clipboard-manager"
            onClick={onOpenClipboard}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
              clipboardCount > 0
                ? isDark
                  ? 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border-blue-600/80 ring-1 ring-blue-500/20 shadow-xs'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 shadow-xs'
                : isDark
                ? 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
            }`}
            title={`Clipboard Manager (Shift+Ctrl+V) - ${clipboardCount} copied ${
              clipboardCount === 1 ? 'block' : 'blocks'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden sm:inline">Clipboard</span>
            {clipboardCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-blue-600 text-white leading-tight">
                {clipboardCount}
              </span>
            )}
          </button>
        )}

        {/* In-Canvas Preview Toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
            isPreviewMode
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : isDark
              ? 'text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
          }`}
          title={isPreviewMode ? 'Exit Canvas Preview Mode' : 'Toggle In-Canvas Preview'}
        >
          {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPreviewMode ? 'Edit Mode' : 'Preview'}</span>
        </button>

        {/* Export / Download */}
        <button
          onClick={onExportHtml}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
            isDark
              ? 'text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
              : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
          }`}
          title="Download Production index.html"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export HTML</span>
        </button>

        {/* Design Mode Toggle */}
        {!isPreviewMode && (
          <button
            type="button"
            id="btn-toggle-design-mode"
            onClick={onToggleDesignMode}
            className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition border ml-1 ${
              isDesignModeOpen
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 ring-2 ring-blue-400/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
            title={isDesignModeOpen ? 'Hide Design Sidebar' : 'Open Embedded Design Mode Sidebar'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isDesignModeOpen ? 'Close Design Mode' : 'Design Mode'}</span>
          </button>
        )}

        {/* Separator */}
        <div className={`h-5 w-px mx-1 hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Marketing Site / Home Link */}
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition ${
              isDark
                ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200'
            }`}
            title="Return to Landing Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Marketing Site</span>
          </button>
        )}

        {/* Agency or Client Portal Button */}
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg shadow-sm transition ${
              isClient
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
            }`}
            title={isClient ? 'Open Client Portal & Dashboard' : 'Open Agency Admin Control Center'}
          >
            {isClient ? <Globe className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isClient ? 'Client Portal' : 'Agency Portal'}
            </span>
          </button>
        )}

        {/* CloudboyX Enterprise Suite Modules Trigger */}
        {onOpenModules && (
          <button
            type="button"
            onClick={onOpenModules}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs border transition ${
              isDark
                ? 'text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                : 'text-slate-800 bg-slate-100 hover:bg-slate-200 border-slate-200'
            }`}
            title="Open CloudboyX Custom Modules (ERP Gateway, Map Protection, Connect, Predict)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden md:inline">Enterprise Suite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </button>
        )}

        {/* User Account / Sign Out */}
        {(user || isDemoUnlocked) && (
          <div className="flex items-center gap-1.5 pl-1">
            <div className="hidden xl:flex flex-col text-right leading-none">
              <span className={`text-[11px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {user?.displayName || user?.email?.split('@')[0] || 'Demo User'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                {user ? 'Authenticated' : 'Demo Pass'}
              </span>
            </div>
            <button
              type="button"
              onClick={logOut}
              className={`p-1.5 rounded-lg transition ${
                isDark
                  ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40'
                  : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Sign Out of Builder"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
