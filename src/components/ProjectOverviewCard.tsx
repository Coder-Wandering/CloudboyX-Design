import React, { useMemo, useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  HardDrive,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCode,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings } from '../types';
import { DesignSidebarTab } from './DesignSidebar';
import { generateCompleteHtml } from '../utils/htmlGenerator';

interface ProjectOverviewCardProps {
  blocks: BlockInstance[];
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  projectTitle: string;
  seoSettings: SeoSettings;
  lastModified?: number;
  onSelectTab?: (tab: DesignSidebarTab) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function formatRelativeTime(timestamp: number, now: number): string {
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function formatExactDateTime(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return 'Recently';
  }
}

export const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
  blocks,
  theme,
  themeMode = 'light',
  projectTitle,
  seoSettings,
  lastModified = Date.now(),
  onSelectTab,
}) => {
  const isDark = themeMode === 'dark';
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [now, setNow] = useState<number>(() => Date.now());

  // Update relative time periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Compute production HTML and calculate real-time statistics
  const stats = useMemo(() => {
    try {
      const fullHtml = generateCompleteHtml(blocks, theme, projectTitle, false, null, seoSettings);
      const rawBytes = new Blob([fullHtml]).size;
      const lineCount = fullHtml.split('\n').length;

      // Parse with DOMParser to count total DOM tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(fullHtml, 'text/html');
      const allElements = doc.querySelectorAll('*');
      const totalElements = allElements.length;

      const interactiveCount = doc.querySelectorAll('button, a, input, select, textarea').length;
      const mediaCount = doc.querySelectorAll('img, svg, picture, video, iframe').length;
      const headingsCount = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length;

      return {
        totalElements,
        rawBytes,
        lineCount,
        interactiveCount,
        mediaCount,
        headingsCount,
        totalBlocks: blocks.length,
      };
    } catch {
      // Fallback
      return {
        totalElements: blocks.length * 15,
        rawBytes: blocks.length * 3500,
        lineCount: blocks.length * 60,
        interactiveCount: blocks.length * 3,
        mediaCount: blocks.length * 2,
        headingsCount: blocks.length * 2,
        totalBlocks: blocks.length,
      };
    }
  }, [blocks, theme, projectTitle, seoSettings]);

  const timeAgo = formatRelativeTime(lastModified, now);
  const exactTime = formatExactDateTime(lastModified);

  return (
    <div
      id="project-overview-card"
      className={`border-b transition-colors duration-200 shrink-0 select-none ${
        isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Card Header with Title & Collapse Toggle */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center ${
              isDark
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}
          >
            <Activity className="w-3 h-3" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold tracking-tight ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              Project Overview
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span
                className={`text-[10px] font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick collapse/expand toggle */}
          <button
            type="button"
            id="toggle-project-overview-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            title={isExpanded ? 'Collapse Overview' : 'Expand Overview'}
            aria-label={isExpanded ? 'Collapse Overview' : 'Expand Overview'}
            className={`p-1 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] hidden sm:inline">
              {isExpanded ? 'Minimize' : 'Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsed Compact Preview Bar */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className={`px-4 pb-2.5 pt-0.5 flex items-center justify-between text-[11px] cursor-pointer transition ${
            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Click to view detailed project statistics"
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-500" />
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {stats.totalElements}
              </strong>{' '}
              elements
            </span>
            <span className="text-slate-400">·</span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-emerald-500" />
              <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {formatBytes(stats.rawBytes)}
              </strong>
            </span>
            <span className="text-slate-400">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{timeAgo}</span>
            </span>
          </div>
          <span className="text-[10px] text-blue-500 font-medium">Expand</span>
        </div>
      )}

      {/* Expanded Statistics Grid */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-0">
          <div className="grid grid-cols-3 gap-2">
            {/* STAT 1: TOTAL ELEMENTS */}
            <div
              id="stat-element-count"
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800/90 text-slate-100 hover:border-cyan-500/40'
                  : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Elements
                </span>
                <Layers
                  className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight">
                  {stats.totalElements}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  tags
                </span>
              </div>
              <div
                className={`text-[10px] mt-1 pt-1 border-t truncate ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
                title={`${stats.totalBlocks} sections, ${stats.interactiveCount} interactive, ${stats.mediaCount} media items`}
              >
                {stats.totalBlocks} blk · {stats.interactiveCount} act
              </div>
            </div>

            {/* STAT 2: ESTIMATED FILE SIZE */}
            <div
              id="stat-file-size"
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800/90 text-slate-100 hover:border-emerald-500/40'
                  : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Est. Size
                </span>
                <HardDrive
                  className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight">
                  {formatBytes(stats.rawBytes)}
                </span>
              </div>
              <div
                className={`text-[10px] mt-1 pt-1 border-t truncate ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
                title={`~${formatBytes(stats.rawBytes * 0.28)} gzip transfer estimate • ${stats.lineCount} lines`}
              >
                ~{formatBytes(stats.rawBytes * 0.28)} gz
              </div>
            </div>

            {/* STAT 3: LAST MODIFIED */}
            <div
              id="stat-last-modified"
              className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800/90 text-slate-100 hover:border-amber-500/40'
                  : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Modified
                </span>
                <Clock
                  className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}
                />
              </div>
              <div className="flex items-baseline gap-1 truncate" title={`Modified at ${exactTime}`}>
                <span className="text-base font-extrabold tracking-tight truncate">
                  {timeAgo}
                </span>
              </div>
              <div
                className={`text-[10px] mt-1 pt-1 border-t truncate ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}
                title={`Last saved at ${exactTime}`}
              >
                {exactTime}
              </div>
            </div>
          </div>

          {/* Quick Context & Actions Footer */}
          <div
            className={`mt-2 pt-2 border-t flex items-center justify-between text-[11px] ${
              isDark ? 'border-slate-800/80' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0 max-w-[200px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span
                className={`truncate font-medium text-[10px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
                title={projectTitle}
              >
                {projectTitle || 'Bootstrap 5 Project'}
              </span>
            </div>

            {onSelectTab && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectTab('css')}
                  className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                    isDark
                      ? 'text-emerald-400 hover:bg-slate-800 hover:text-emerald-300'
                      : 'text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title="Write and inject Custom CSS"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Custom CSS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('code')}
                  className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                    isDark
                      ? 'text-cyan-400 hover:bg-slate-800 hover:text-cyan-300'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                  title="Inspect compiled Bootstrap HTML"
                >
                  <FileCode className="w-3 h-3" />
                  <span>Inspect HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('seo')}
                  className={`text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Manage Page Settings & SEO"
                >
                  <Globe className="w-3 h-3" />
                  <span>SEO</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
