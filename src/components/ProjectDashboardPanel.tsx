import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Hash,
  Cpu,
  ArrowUpRight,
  Copy,
  Check,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Search,
  ExternalLink,
  CopyPlus,
  Trash2,
} from 'lucide-react';
import {
  BlockInstance,
  SeoSettings,
  ClonedTemplateProject,
  CLONED_PROJECTS_STORAGE_KEY,
} from '../types';
import {
  calculateProjectAnalytics,
  ProjectAnalytics,
  BlockComplexityInfo,
} from '../utils/projectAnalytics';

interface ProjectDashboardPanelProps {
  blocks: BlockInstance[];
  seoSettings?: SeoSettings;
  projectTitle?: string;
  onSelectBlock?: (blockId: string) => void;
  onSwitchTab?: (tab: 'seo' | 'favicon' | 'preview' | 'code') => void;
}

export const ProjectDashboardPanel: React.FC<ProjectDashboardPanelProps> = ({
  blocks,
  seoSettings,
  projectTitle = 'Bootstrap 5 Website',
  onSelectBlock,
  onSwitchTab,
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [filterComplexity, setFilterComplexity] = useState<'all' | 'low' | 'moderate' | 'high'>('all');
  const [clonedProjects, setClonedProjects] = useState<ClonedTemplateProject[]>(() => {
    try {
      const saved = localStorage.getItem(CLONED_PROJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    const syncClones = () => {
      try {
        const saved = localStorage.getItem(CLONED_PROJECTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setClonedProjects(parsed);
        } else {
          setClonedProjects([]);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('cloudboyx-cloned-projects-updated', syncClones);
    window.addEventListener('storage', syncClones);
    return () => {
      window.removeEventListener('cloudboyx-cloned-projects-updated', syncClones);
      window.removeEventListener('storage', syncClones);
    };
  }, []);

  const handleDeleteClone = (cloneId: string) => {
    setClonedProjects((prev) => {
      const next = prev.filter((c) => c.id !== cloneId);
      try {
        localStorage.setItem(CLONED_PROJECTS_STORAGE_KEY, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('cloudboyx-cloned-projects-updated'));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const analytics: ProjectAnalytics = calculateProjectAnalytics(blocks, seoSettings);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 75) return { text: 'text-blue-600', bg: 'bg-blue-500', bgLight: 'bg-blue-50', border: 'border-blue-200' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', bgLight: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-rose-600', bg: 'bg-rose-500', bgLight: 'bg-rose-50', border: 'border-rose-200' };
  };

  const scoreTheme = getScoreColor(analytics.performanceScore);

  const filteredBlocks = analytics.blocksBreakdown.filter((b) => {
    if (filterComplexity === 'all') return true;
    return b.complexity === filterComplexity;
  });

  const handleCopyReport = () => {
    const reportText = [
      `📊 BOOTSTRAP 5 PROJECT DASHBOARD AUDIT REPORT`,
      `=============================================`,
      `Project Title: ${projectTitle}`,
      `Total Blocks: ${analytics.totalBlocks}`,
      `Total Words: ${analytics.totalWords}`,
      `Total Characters: ${analytics.totalCharacters}`,
      `Estimated Reading Time: ~${analytics.estimatedReadingTimeMin} min`,
      `Total Images: ${analytics.totalImages}`,
      `Estimated DOM Elements: ~${analytics.estimatedDomNodes} nodes`,
      `Performance Score: ${analytics.performanceScore}/100 (Grade ${analytics.performanceGrade})`,
      `Estimated FCP: ~${analytics.estimatedFcpSec}s`,
      `Estimated LCP: ~${analytics.estimatedLcpSec}s`,
      ``,
      `BLOCK COMPLEXITY BREAKDOWN:`,
      ...analytics.blocksBreakdown.map(
        (b, i) => `${i + 1}. [${b.complexity.toUpperCase()}] ${b.name} (${b.category}) - ${b.wordCount} words, ${b.imageCount} images`
      ),
      ``,
      `HEALTH & AUDIT CHECKS:`,
      ...analytics.recommendations.map((r) => `- [${r.type.toUpperCase()}] ${r.title}: ${r.description}`),
    ].join('\n');

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div id="project-dashboard-panel" className="space-y-5">
      {/* Cloned Experimental Projects in Dashboard */}
      {clonedProjects.length > 0 && (
        <div
          id="dashboard-cloned-projects-section"
          className="rounded-2xl border border-blue-200 dark:border-[#191970] bg-blue-50/50 dark:bg-slate-900/90 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#2222FF] text-white flex items-center justify-center shrink-0">
                <CopyPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Cloned Experimental Projects ({clonedProjects.length})
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Duplicates created from the Template Gallery for safe experimentation
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {clonedProjects.map((clone) => (
              <div
                key={clone.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: clone.accentColor || '#2222FF' }}
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {clone.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {clone.category} · {clone.blocks.length} sections
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteClone(clone.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
                  title="Remove cloned project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Banner / Hero Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4.5 sm:p-5 border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Subtle ambient gradient circle */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Live Project Telemetry
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{projectTitle || 'Bootstrap 5 Website'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive real-time metrics on structure, content density, and estimated page performance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyReport}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-sm transition shrink-0"
            title="Copy audit report summary to clipboard"
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Report</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Core Highlight KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          {/* KPI 1: Total Blocks */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Blocks
              </div>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5">
                <span>{analytics.totalBlocks}</span>
                <span className="text-[11px] font-normal text-slate-400">sections</span>
              </div>
            </div>
          </div>

          {/* KPI 2: Total Word Count */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Total Words
              </div>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5">
                <span>{analytics.totalWords.toLocaleString()}</span>
                <span className="text-[11px] font-normal text-slate-400">words</span>
              </div>
            </div>
          </div>

          {/* KPI 3: Estimated Performance Score */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${scoreTheme.bgLight} ${scoreTheme.text} flex items-center justify-center shrink-0`}>
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Estimated Performance
              </div>
              <div className="text-xl font-extrabold text-white flex items-baseline gap-1.5">
                <span className={scoreTheme.text}>{analytics.performanceScore}</span>
                <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-200">
                  Grade {analytics.performanceGrade}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance & Loading Dynamics Breakdown */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Page Load & Complexity Analysis</h4>
              <p className="text-[11px] text-slate-500">
                Calculated based on DOM structure, element count, media assets, and Bootstrap 5 footprint.
              </p>
            </div>
          </div>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${scoreTheme.bgLight} ${scoreTheme.text} border ${scoreTheme.border}`}>
            {analytics.performanceScore >= 85 ? 'Fast Loading' : analytics.performanceScore >= 70 ? 'Moderate' : 'Heavy'}
          </div>
        </div>

        {/* Progress gauge bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">Performance Index</span>
            <span className="font-mono font-bold text-slate-900">{analytics.performanceScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full ${scoreTheme.bg} transition-all duration-500 rounded-full`}
              style={{ width: `${analytics.performanceScore}%` }}
            />
          </div>
        </div>

        {/* Detailed telemetry grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Est. First Paint (FCP)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">~{analytics.estimatedFcpSec}s</div>
            <div className="text-[10px] text-emerald-600 font-medium">Fast CDN edge</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Zap className="w-3 h-3 text-slate-400" />
              <span>Est. Largest Paint (LCP)</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">~{analytics.estimatedLcpSec}s</div>
            <div className="text-[10px] text-blue-600 font-medium">Core Web Vital</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Cpu className="w-3 h-3 text-slate-400" />
              <span>Est. DOM Nodes</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">~{analytics.estimatedDomNodes}</div>
            <div className="text-[10px] text-slate-500 font-medium">Clean semantic HTML</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Reading Time</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              ~{analytics.estimatedReadingTimeMin} min
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {analytics.totalCharacters.toLocaleString()} chars
            </div>
          </div>
        </div>
      </div>

      {/* Block Structure & Complexity Breakdown */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Block Complexity Breakdown</h4>
              <p className="text-[11px] text-slate-500">
                Individual complexity rating and content footprint for each section.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            {(['all', 'low', 'moderate', 'high'] as const).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setFilterComplexity(tier)}
                className={`px-2 py-1 rounded-md transition capitalize ${
                  filterComplexity === tier
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Breakdown List */}
        {filteredBlocks.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No blocks match the selected complexity filter.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredBlocks.map((block, idx) => {
              const badgeTheme =
                block.complexity === 'low'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : block.complexity === 'moderate'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div
                  key={block.id}
                  className="group p-2.5 bg-slate-50/80 hover:bg-slate-100/90 rounded-xl border border-slate-200 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {block.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-medium capitalize">
                          {block.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span>{block.wordCount} words</span>
                        <span>•</span>
                        <span>{block.imageCount} images</span>
                        {block.reasons.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                              {block.reasons[0]}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${badgeTheme}`}
                    >
                      {block.complexity}
                    </span>

                    {onSelectBlock && (
                      <button
                        type="button"
                        onClick={() => onSelectBlock(block.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition"
                        title="Select and edit this block"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Distribution Chips */}
      {Object.keys(analytics.categoryCounts).length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Section Architecture Distribution</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">
              {Object.keys(analytics.categoryCounts).length} unique layout types
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(analytics.categoryCounts).map(([cat, count]) => (
              <div
                key={cat}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <span className="capitalize font-medium text-slate-700">{cat}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Health & SEO Recommendations */}
      <div className="bg-white rounded-2xl p-4.5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">SEO & Performance Health Checks</h4>
              <p className="text-[11px] text-slate-500">
                Automated diagnostics to help optimize ranking, readability, and speed.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {analytics.recommendations.map((rec) => {
            const icon =
              rec.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : rec.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              );

            const cardBg =
              rec.type === 'success'
                ? 'bg-emerald-50/50 border-emerald-200/80'
                : rec.type === 'warning'
                ? 'bg-amber-50/50 border-amber-200/80'
                : 'bg-blue-50/50 border-blue-200/80';

            return (
              <div
                key={rec.id}
                className={`p-3 rounded-xl border ${cardBg} flex items-start gap-2.5 transition`}
              >
                {icon}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900">{rec.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {rec.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Jump Buttons to SEO & Metadata */}
      {onSwitchTab && (
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="text-xs text-slate-600">
            Configure search tags, open graph image, and browser favicon:
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSwitchTab('seo')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center gap-1 shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>SEO Meta</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('favicon')}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Favicon</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchTab('preview')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>SERP Previews</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
