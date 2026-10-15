import React, { useState, useRef, useEffect } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Download,
  FileText,
  Printer,
  History,
  SlidersHorizontal,
  Home,
  LogOut,
  Shield,
  Globe,
  Sparkles,
  Layers,
  Play,
  ClipboardList,
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Loader2,
  Clock,
  FileCode,
  Share2,
} from 'lucide-react';
import { ViewportMode, BlockInstance } from '../types';
import { Breakpoint, BREAKPOINT_LABELS, BREAKPOINT_ORDER } from '../engine/bootstrapCascade';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { GlobalBlockSearch } from './GlobalBlockSearch';

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
  onDownloadProject?: () => void;
  onShareProject?: () => void;
  onExportPdf?: () => void;
  onOpenRevisionHistory?: () => void;
  blockCount: number;
  onBackToLanding?: () => void;
  onOpenAdmin?: () => void;
  onOpenModules?: () => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
  lastModified?: number;
  isSaving?: boolean;
  blocks?: BlockInstance[];
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
}

function formatHeaderSaveTime(timestamp: number, currentNow: number): string {
  const diffSec = Math.max(0, Math.floor((currentNow - timestamp) / 1000));
  if (diffSec < 15) return 'Saved just now';
  if (diffSec < 60) return `Last saved ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Last saved ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    try {
      return `Last saved at ${new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } catch {
      return `Last saved ${diffHours}h ago`;
    }
  }
  return `Last saved ${new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
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
  onDownloadProject,
  onShareProject,
  onExportPdf,
  onOpenRevisionHistory,
  blockCount,
  onBackToLanding,
  onOpenAdmin,
  onOpenModules,
  themeMode = 'light',
  onToggleThemeMode,
  lastModified,
  isSaving = false,
  blocks = [],
  selectedBlockId,
  onSelectBlock,
}) => {
  const { user, isDemoUnlocked, activeRole, permissions, agencyBranding, logOut } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [internalSaving, setInternalSaving] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const prevLastModified = useRef(lastModified);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lastModified && prevLastModified.current && lastModified !== prevLastModified.current) {
      setInternalSaving(false);
      setJustSaved(true);
      setNow(Date.now());
      const timeout = setTimeout(() => {
        setJustSaved(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
    prevLastModified.current = lastModified;
  }, [lastModified]);

  const effectiveIsSaving = Boolean(isSaving || internalSaving);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isClient = activeRole.startsWith('client_');
  const isDark = themeMode === 'dark';

  return (
    <header
      className={`h-14 border-b px-3.5 flex items-center justify-between gap-3 select-none shrink-0 z-30 transition-colors duration-200 ${
        isDark
          ? 'border-slate-800 bg-[#111520] text-white'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {/* ZONE 1 (LEFT): Agile Brand Menu + Project Title + Quiet Save Indicator */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Agile App Switcher Dropdown */}
        <div className="relative" ref={workspaceMenuRef}>
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-white'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-900'
            }`}
            title="Workspace Navigation & Portals"
          >
            {agencyBranding.agencyLogoUrl ? (
              <img
                src={agencyBranding.agencyLogoUrl}
                alt={agencyBranding.agencyName}
                className="h-6 max-w-[90px] object-contain"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-2xs shrink-0"
                style={{ backgroundColor: agencyBranding.primaryBrandColor || '#2222FF' }}
              >
                {agencyBranding.agencyName.charAt(0) || 'C'}
              </div>
            )}
            <span className="font-bold text-xs tracking-tight hidden sm:inline truncate max-w-[120px]">
              {agencyBranding.agencyName || 'CloudboyX'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div
              className={`absolute left-0 top-full mt-1.5 w-60 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="px-2.5 py-1.5 border-b border-slate-200/60 dark:border-slate-800 mb-1">
                <div className="text-xs font-bold truncate">
                  {agencyBranding.agencyName || 'CloudboyX Studio'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Bootstrap 5.3 Visual Workspace
                </div>
              </div>

              {onOpenTemplateGallery && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenTemplateGallery();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                    <span>Template Gallery</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">108+</span>
                </button>
              )}

              {onOpenClipboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenClipboard();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Clipboard Manager</span>
                  </span>
                  {clipboardCount > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                      {clipboardCount}
                    </span>
                  )}
                </button>
              )}

              {onOpenRevisionHistory && (
                <button
                  type="button"
                  id="menu-open-revision-history"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenRevisionHistory();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    <span>Revision History</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Snapshots</span>
                </button>
              )}

              {onOpenModules && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenModules();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Enterprise Suite Modules</span>
                  </span>
                </button>
              )}

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isClient ? (
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Shield className="w-3.5 h-3.5 text-violet-500" />
                    )}
                    <span>{isClient ? 'Client Portal' : 'Agency Portal'}</span>
                  </span>
                </button>
              )}

              {onBackToLanding && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    onBackToLanding();
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                    isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    <span>Marketing Home</span>
                  </span>
                </button>
              )}

              {(user || isDemoUnlocked) && (
                <div className="mt-1 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      logOut();
                    }}
                    className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out ({user?.displayName || user?.email?.split('@')[0] || 'Demo'})</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`h-4 w-px shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        {/* Editable Project Title & Quiet Save Status */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle && permissions.canEditDesign ? (
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
              className={`text-xs font-semibold px-2 py-1 rounded-lg outline-none w-40 ${
                isDark
                  ? 'bg-slate-800 border border-blue-500 text-slate-100'
                  : 'bg-slate-100 border border-blue-400 text-slate-800'
              }`}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (permissions.canEditDesign) setIsEditingTitle(true);
              }}
              className={`text-xs font-semibold px-2 py-1 rounded-lg transition text-left truncate max-w-[160px] cursor-pointer ${
                isDark
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800'
                  : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100'
              }`}
              title={permissions.canEditDesign ? 'Click to rename project' : 'Project Title'}
            >
              {projectTitle}
            </button>
          )}

          <span className={`text-[11px] hidden xl:inline ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            · {blockCount} {blockCount === 1 ? 'section' : 'sections'}
          </span>

          {/* Visual Indicator & Status Text: 'Auto-saving...' or 'last saved' time (Clickable to open Revision History) */}
          {lastModified ? (
            <button
              type="button"
              id="header-save-status"
              onClick={onOpenRevisionHistory}
              disabled={!onOpenRevisionHistory}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-200 select-none border shrink-0 ${
                onOpenRevisionHistory ? 'cursor-pointer' : 'cursor-default'
              } ${
                effectiveIsSaving
                  ? isDark
                    ? 'bg-blue-950/60 text-blue-300 border-blue-800/80 shadow-2xs'
                    : 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                  : justSaved
                  ? isDark
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isDark
                  ? 'bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-800/60'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100'
              }`}
              title={
                onOpenRevisionHistory
                  ? 'Click to open Revision History panel & view autosaved checkpoints'
                  : effectiveIsSaving
                  ? 'Auto-saving changes to local storage...'
                  : `Last saved: ${new Date(lastModified).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })} at ${formatExactSaveTime(lastModified)}`
              }
            >
              {effectiveIsSaving ? (
                <>
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0" />
                  <span className="font-semibold text-blue-500 dark:text-blue-400">Auto-saving...</span>
                </>
              ) : justSaved ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Saved</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[130px] sm:max-w-none">
                    {formatHeaderSaveTime(lastModified, now)}
                  </span>
                  {onOpenRevisionHistory && (
                    <History className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />
                  )}
                </>
              )}
            </button>
          ) : null}

          {/* Dedicated Revision History Button */}
          {onOpenRevisionHistory && (
            <button
              type="button"
              id="btn-open-revision-history"
              onClick={onOpenRevisionHistory}
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 shadow-2xs'
              }`}
              title="Open Revision History panel to view, compare, and restore snapshots"
              aria-label="Open Revision History"
            >
              <History className="w-3.5 h-3.5 text-blue-500" />
              <span>History</span>
            </button>
          )}

          {/* Global Block Search (Find and jump to specific blocks by name or keyword) */}
          {onSelectBlock && (
            <div className="flex items-center">
              <GlobalBlockSearch
                blocks={blocks}
                onSelectBlock={onSelectBlock}
                selectedBlockId={selectedBlockId}
                isDark={isDark}
              />
            </div>
          )}
        </div>
      </div>

      {/* ZONE 2 (CENTER): Unified Viewport, Breakpoint & Undo/Redo Bar */}
      <div className="flex items-center gap-1.5">
        <div
          className={`flex items-center p-0.5 rounded-xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'desktop'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-900 shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Desktop View (lg — 992px+)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'tablet'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-900 shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Tablet View (md — 768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewport === 'mobile'
                ? isDark
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-900 shadow-2xs'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Mobile View (xs — 390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Mobile</span>
          </button>

          {/* Compact Breakpoint Selector Dropdown */}
          {onBreakpointChange && (
            <div className={`hidden md:flex items-center pl-1.5 pr-1 ml-1 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <select
                value={activeBreakpoint}
                onChange={(e) => onBreakpointChange(e.target.value as Breakpoint)}
                aria-label="Select Bootstrap Breakpoint Tier"
                title={`Active Tier: ${BREAKPOINT_LABELS[activeBreakpoint].label} (${BREAKPOINT_LABELS[activeBreakpoint].pixelRange})`}
                className={`text-[11px] font-mono font-bold uppercase bg-transparent focus:outline-hidden cursor-pointer ${
                  isDark ? 'text-cyan-400' : 'text-blue-600'
                }`}
              >
                {BREAKPOINT_ORDER.map((bp) => (
                  <option
                    key={bp}
                    value={bp}
                    className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}
                  >
                    {bp.toUpperCase()} ({BREAKPOINT_LABELS[bp].desc})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Undo / Redo */}
        <div
          className={`flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg disabled:opacity-30 transition cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg disabled:opacity-30 transition cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ZONE 3 (RIGHT): Focused Studio Actions */}
      <div className="flex items-center gap-1.5">
        {/* Template Gallery Launcher */}
        {onOpenTemplateGallery && (
          <button
            type="button"
            id="btn-open-template-gallery-modal"
            onClick={onOpenTemplateGallery}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-800 hover:border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
            title="Browse 108+ Ready-to-Use Bootstrap 5 Templates"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Templates</span>
          </button>
        )}

        {/* Compact Clipboard Button (Always accessible by ID) */}
        {onOpenClipboard && (
          <button
            type="button"
            id="btn-header-clipboard-manager"
            onClick={onOpenClipboard}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${
              clipboardCount > 0
                ? isDark
                  ? 'bg-blue-950/80 text-blue-300 border-blue-700/80'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDark
                ? 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
            title={`Clipboard Manager (${clipboardCount} copied blocks)`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            {clipboardCount > 0 && (
              <span className="text-[10px] font-mono font-bold">{clipboardCount}</span>
            )}
          </button>
        )}

        {/* In-Canvas Preview Toggle & Full-Screen Live Preview */}
        <div
          className={`flex items-center p-0.5 rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition cursor-pointer ${
              isPreviewMode
                ? 'bg-amber-500 text-white'
                : isDark
                ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
            title={isPreviewMode ? 'Exit Canvas Preview' : 'Toggle Clean Canvas Preview'}
          >
            {isPreviewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden xl:inline">{isPreviewMode ? 'Editing' : 'Preview'}</span>
          </button>

          {onOpenLivePreview && (
            <button
              type="button"
              id="btn-open-live-preview-modal"
              onClick={onOpenLivePreview}
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition cursor-pointer ${
                isDark
                  ? 'text-emerald-400 hover:bg-slate-800'
                  : 'text-emerald-700 hover:bg-white'
              }`}
              title="Open Full-Screen Live Website Preview"
            >
              <Play className="w-3 h-3 fill-current" />
              <span className="hidden 2xl:inline">Live</span>
            </button>
          )}
        </div>

        {/* Export Actions: Download Project & HTML Export */}
        <div className="flex items-center gap-1.5">
          {/* Download Project Button */}
          <button
            type="button"
            id="btn-download-project"
            data-testid="btn-download-project"
            onClick={onDownloadProject || onExportHtml}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'text-white bg-blue-600 hover:bg-blue-500 border-blue-500 shadow-2xs'
                : 'text-white bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-2xs'
            }`}
            title="Download Project (HTML Export with toast notification)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download Project</span>
            <span className="sm:hidden">Download</span>
          </button>

          {/* Share Project Button */}
          {onShareProject && (
            <button
              type="button"
              id="btn-share-project"
              data-testid="btn-share-project"
              onClick={onShareProject}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/60 shadow-2xs'
                  : 'text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border-purple-200 shadow-2xs'
              }`}
              title="Share Project (Generate shareable link or copy JSON state)"
              aria-label="Share Project"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Share Project</span>
              <span className="sm:hidden">Share</span>
            </button>
          )}

          {/* Export HTML Button */}
          <button
            type="button"
            id="btn-export-html"
            onClick={onExportHtml}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border-slate-800'
                : 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
            title="Download Production index.html"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export HTML</span>
            <span className="sm:hidden">HTML</span>
          </button>

          {/* Export Structured PDF Document Button */}
          {onExportPdf && (
            <button
              type="button"
              id="btn-export-pdf"
              onClick={onExportPdf}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/60 border-red-800/60 shadow-2xs'
                  : 'text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border-red-200 shadow-2xs'
              }`}
              title="Export project as a structured printable PDF document (with specification cover, layout outlines, and print formatting)"
              aria-label="Export structured PDF document"
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          )}
        </div>

        {/* Inspector Sidebar Toggle */}
        {!isPreviewMode && (
          <button
            type="button"
            id="btn-toggle-design-mode"
            onClick={onToggleDesignMode}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition border cursor-pointer ${
              isDesignModeOpen
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-2xs'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
            }`}
            title={isDesignModeOpen ? 'Hide Inspector Panel' : 'Show Inspector Panel'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Inspector</span>
          </button>
        )}

        {/* Theme Mode Toggle */}
        {onToggleThemeMode && (
          <div className="pl-1">
            <ThemeToggleSwitch
              themeMode={themeMode}
              onToggle={onToggleThemeMode}
              size="sm"
            />
          </div>
        )}
      </div>
    </header>
  );
};

