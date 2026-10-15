import React, { useState, useEffect } from 'react';
import {
  Globe,
  Download,
  CheckCircle2,
  Clock,
  Activity,
  Eye,
  TrendingUp,
  Smartphone,
  Layers,
  FileCode,
  FileText,
  Copy,
  Check,
  QrCode,
  LifeBuoy,
  Edit3,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Server,
  User,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  ProjectMilestone,
  ExportedProjectFile,
  ClientTrafficMetrics,
} from '../types';
import {
  CLIENT_TRAFFIC_METRICS,
  INITIAL_PROJECT_MILESTONES,
  INITIAL_EXPORTED_FILES,
} from '../data/agencyClientData';

export interface ClientDashboardProps {
  projectTitle?: string;
  blockCount?: number;
  onEnterBuilder?: () => void;
  onOpenTickets?: () => void;
  onOpenTutorials?: () => void;
  onOpenBilling?: () => void;
  initialSubTab?: 'metrics' | 'milestones' | 'exports';
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  projectTitle = 'CloudboyX Business Website',
  blockCount = 6,
  onEnterBuilder,
  onOpenTickets,
  onOpenTutorials,
  onOpenBilling,
  initialSubTab = 'metrics',
}) => {
  const { agencyBranding, activeRole, permissions, user } = useAuth();

  // Internal Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'metrics' | 'milestones' | 'exports'>(initialSubTab);

  // Time range for metrics
  const [metricDateRange, setMetricDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Milestones state with persistence
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => {
    const saved = localStorage.getItem('agency_project_milestones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_PROJECT_MILESTONES;
  });

  // Milestone filter
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'in_progress' | 'in_review' | 'completed' | 'upcoming'>('all');

  // Exported files state
  const [exportedFiles] = useState<ExportedProjectFile[]>(INITIAL_EXPORTED_FILES);
  const [fileCategoryFilter, setFileCategoryFilter] = useState<string>('All');

  // Preview file code modal
  const [previewFile, setPreviewFile] = useState<ExportedProjectFile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Mobile QR code modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Milestone Approval modal
  const [approvingMilestone, setApprovingMilestone] = useState<ProjectMilestone | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('');

  // Download notification toast
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Sync milestones to local storage
  useEffect(() => {
    localStorage.setItem('agency_project_milestones', JSON.stringify(milestones));
  }, [milestones]);

  // Handle file download via browser blob
  const handleDownloadFile = (file: ExportedProjectFile) => {
    let mime = 'text/plain';
    if (file.fileType === 'html') mime = 'text/html';
    else if (file.fileType === 'css') mime = 'text/css';
    else if (file.fileType === 'js') mime = 'application/javascript';
    else if (file.fileType === 'json') mime = 'application/json';
    else if (file.fileType === 'xml') mime = 'application/xml';

    const blob = new Blob([file.codeContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Downloaded ${file.fileName}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // Handle download all files as standalone bundle
  const handleDownloadAllBundle = () => {
    const combinedContent = exportedFiles
      .map(
        (f) => `/* ==========================================================================\n   FILE: ${f.fileName} (${f.category})\n   ========================================================================== */\n\n${f.codeContent}`
      )
      .join('\n\n\n');

    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-production-bundle.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Downloaded full production code bundle`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Copy code to clipboard
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Confirm client approval on a milestone
  const handleConfirmApproval = () => {
    if (!approvingMilestone) return;

    const updated = milestones.map((m) => {
      if (m.id === approvingMilestone.id) {
        return {
          ...m,
          status: 'completed' as const,
          progressPercent: 100,
          clientApproved: true,
          approvedAt: new Date().toISOString().split('T')[0],
          approvedBy: user?.displayName || 'Client Stakeholder',
          clientFeedback: approvalFeedback.trim() || undefined,
          completedDate: m.completedDate || new Date().toISOString().split('T')[0],
        };
      }
      return m;
    });

    setMilestones(updated);
    setApprovingMilestone(null);
    setApprovalFeedback('');
    setDownloadToast(`Approved Milestone: ${approvingMilestone.title}`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // Toggle deliverable checkbox (for client testing / verification)
  const handleToggleDeliverable = (milestoneId: string, deliverableId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === milestoneId) {
          const updatedDelivs = m.deliverables.map((d) =>
            d.id === deliverableId ? { ...d, completed: !d.completed } : d
          );
          const completedCount = updatedDelivs.filter((d) => d.completed).length;
          const newPercent = Math.round((completedCount / updatedDelivs.length) * 100);
          return {
            ...m,
            deliverables: updatedDelivs,
            progressPercent: newPercent,
          };
        }
        return m;
      })
    );
  };

  // Computed metrics based on date range
  const multiplier = metricDateRange === '7d' ? 1 : metricDateRange === '30d' ? 3.8 : 10.5;
  const displayViews = Math.round(CLIENT_TRAFFIC_METRICS.totalPageviews * (multiplier / 3.8));
  const displayUnique = Math.round(CLIENT_TRAFFIC_METRICS.uniqueVisitors * (multiplier / 3.8));

  // Overall milestone progress
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === 'completed').length;
  const overallMilestonePercent = Math.round(
    milestones.reduce((acc, curr) => acc + curr.progressPercent, 0) / totalMilestones
  );

  // Filtered milestones
  const filteredMilestones = milestones.filter((m) => {
    if (milestoneFilter === 'all') return true;
    return m.status === milestoneFilter;
  });

  // Filtered files
  const filteredFiles = exportedFiles.filter((f) => {
    if (fileCategoryFilter === 'All') return true;
    return f.category === fileCategoryFilter;
  });

  const maxDailyViews = Math.max(...CLIENT_TRAFFIC_METRICS.recentVisitsTrend.map((v) => v.views));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold text-white">{downloadToast}</span>
        </div>
      )}

      {/* White-Label Client Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Staging Environment
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                https://{agencyBranding.customDomain}
              </span>
              <span className="text-xs text-slate-400">
                Managed by <strong className="text-white">{agencyBranding.agencyName}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {projectTitle}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              {agencyBranding.clientWelcomeMessage ||
                'Welcome to your dedicated client workspace. View real-time visitor traffic, track active production milestones, and download exported source code deliverables.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{blockCount} Responsive Blocks Active</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL / TLS 1.3 Certified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Edge CDN Cached</span>
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {permissions.canEditDesign && onEnterBuilder && (
              <button
                type="button"
                onClick={onEnterBuilder}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Open Visual Editor</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
              title="Preview on mobile device"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Mobile QR</span>
            </button>

            {onOpenTickets && (
              <button
                type="button"
                onClick={onOpenTickets}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <LifeBuoy className="w-4 h-4 text-amber-400" />
                <span>Request Revision</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Internal Navigation Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('metrics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeSubTab === 'metrics'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Site Live Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('milestones')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeSubTab === 'milestones'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Project Milestones ({completedMilestones}/{totalMilestones})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('exports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeSubTab === 'exports'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Exported Files & Code ({exportedFiles.length})</span>
          </button>
        </div>

        {/* Dynamic Contextual Action */}
        {activeSubTab === 'exports' && (
          <button
            type="button"
            onClick={handleDownloadAllBundle}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All Deliverables (.txt bundle)</span>
          </button>
        )}

        {activeSubTab === 'milestones' && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Overall Roadmap Progress:</span>
            <span className="font-bold text-emerald-400 font-mono">{overallMilestonePercent}%</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SUB-TAB 1: SITE'S LIVE METRICS
          ========================================================================= */}
      {activeSubTab === 'metrics' && (
        <div className="space-y-6">
          {/* Top Live Status Card & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Traffic Telemetry Active
                </span>
                <p className="text-xs text-slate-400">
                  Real-time visitor sessions collected via Edge CDN proxy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setMetricDateRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    metricDateRange === range
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pageviews</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {displayViews.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +18.4%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Verified browser loads</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {displayUnique.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +12.1%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Distinct client devices</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Session Time</span>
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {CLIENT_TRAFFIC_METRICS.avgSessionDuration}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono">31.4% bounce</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Above sector benchmark</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Mobile Share</span>
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {CLIENT_TRAFFIC_METRICS.mobileTrafficPercent}%
                </span>
                <span className="text-xs font-semibold text-emerald-400">Mobile Ready</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Bootstrap 5 fluid layouts</p>
            </div>
          </div>

          {/* Traffic Trend Chart & Infrastructure Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Traffic Bar Chart */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Daily Traffic Volume Trend</h3>
                    <p className="text-xs text-slate-400">Verified sessions over the active window</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    Live Telemetry Online
                  </span>
                </div>

                <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                  {CLIENT_TRAFFIC_METRICS.recentVisitsTrend.map((item, idx) => {
                    const heightPercent = Math.round((item.views / maxDailyViews) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-800 text-white text-[11px] font-semibold py-0.5 px-2 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                          {item.views.toLocaleString()} views
                        </div>
                        <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-lg overflow-hidden h-32 flex items-end">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                  <span>Verified Page Visits</span>
                </span>
                <span className="font-mono text-slate-300">Peak Session: Sep 12 (2,890 views)</span>
              </div>
            </div>

            {/* Traffic Channels Breakdown */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Acquisition Channels</h3>
                <p className="text-xs text-slate-400 mb-3">Incoming traffic referral sources</p>
                <div className="space-y-3">
                  {CLIENT_TRAFFIC_METRICS.trafficSources.map((source, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{source.source}</span>
                        <span className="text-slate-400 font-mono">{source.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${source.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-5">
                <h3 className="text-sm font-bold text-white mb-2">Device Breakdown</h3>
                <div className="space-y-2">
                  {CLIENT_TRAFFIC_METRICS.topDevices.map((dev, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/80"
                    >
                      <span className="text-slate-300">{dev.name}</span>
                      <span className="font-bold text-indigo-400 font-mono">{dev.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Infrastructure & Health Score Diagnostics */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-white mb-1">Production Health & Edge Infrastructure</h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time monitoring metrics verified by CloudboyX SLA guarantee
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">Uptime SLA</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">99.98%</div>
                <p className="text-[11px] text-slate-400 mt-0.5">30-day verified operational</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">PageSpeed Score</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">98 / 100</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Core Web Vitals compliant</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">SSL Certificate</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">TLS 1.3 Active</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Auto-renewed 90-day cert</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-purple-400 mb-1">
                  <Server className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase">CDN Edge Cache</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">94.2% Hit Rate</div>
                <p className="text-[11px] text-slate-400 mt-0.5">Sub-80ms response time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: ACTIVE PROJECT MILESTONES
          ========================================================================= */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-6">
          {/* Milestone Progress Bar Header */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Project Roadmap & Active Milestones</h3>
                <p className="text-xs text-slate-400">
                  Track phased development deliverables, review completed items, and provide client signoffs
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {overallMilestonePercent}%
                </div>
                <span className="text-xs text-slate-400">
                  {completedMilestones} of {totalMilestones} Phases Completed
                </span>
              </div>
            </div>

            {/* Visual Multi-Segment Progress Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${overallMilestonePercent}%` }}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(
                [
                  { key: 'all', label: 'All Milestones' },
                  { key: 'in_progress', label: 'Active In Progress' },
                  { key: 'in_review', label: 'Awaiting Client Review' },
                  { key: 'completed', label: 'Completed & Signed Off' },
                  { key: 'upcoming', label: 'Upcoming' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setMilestoneFilter(f.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    milestoneFilter === f.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Cards List */}
          <div className="space-y-4">
            {filteredMilestones.map((milestone) => {
              const isCompleted = milestone.status === 'completed';
              const isInProgress = milestone.status === 'in_progress';
              const isInReview = milestone.status === 'in_review';

              return (
                <div
                  key={milestone.id}
                  className={`bg-slate-950 border rounded-2xl p-6 transition shadow-sm ${
                    isInReview
                      ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                      : isInProgress
                      ? 'border-indigo-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          Phase {milestone.phase}
                        </span>

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed & Approved
                          </span>
                        )}

                        {isInProgress && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <Activity className="w-3.5 h-3.5 animate-spin" /> In Active Development
                          </span>
                        )}

                        {isInReview && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertCircle className="w-3.5 h-3.5" /> Client Signoff Requested
                          </span>
                        )}

                        {milestone.status === 'upcoming' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3.5 h-3.5" /> Scheduled Next
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          Target Due: <strong className="text-slate-200">{milestone.dueDate}</strong>
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white tracking-tight">
                        {milestone.title}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Assigned Lead & Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0">
                      <div className="flex items-center gap-2.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                        <img
                          src={milestone.assignedLead.avatarUrl}
                          alt={milestone.assignedLead.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {milestone.assignedLead.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {milestone.assignedLead.role}
                          </div>
                        </div>
                      </div>

                      {/* Client Approval Button for review state */}
                      {isInReview && !milestone.clientApproved && (
                        <button
                          type="button"
                          onClick={() => setApprovingMilestone(milestone)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Sign Off & Approve</span>
                        </button>
                      )}

                      {isCompleted && milestone.approvedBy && (
                        <div className="text-right">
                          <span className="text-[11px] text-emerald-400 font-semibold block">
                            ✓ Signed by {milestone.approvedBy}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            on {milestone.approvedAt}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress & Deliverables Checklist */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Phase Deliverables ({milestone.deliverables.filter((d) => d.completed).length}/
                        {milestone.deliverables.length} Finished)
                      </span>
                      <span className="font-bold text-indigo-400 font-mono">
                        {milestone.progressPercent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${milestone.progressPercent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {milestone.deliverables.map((deliv) => (
                        <div
                          key={deliv.id}
                          onClick={() => handleToggleDeliverable(milestone.id, deliv.id)}
                          className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition"
                        >
                          <div
                            className={`w-4 h-4 rounded-sm flex items-center justify-center transition ${
                              deliv.completed
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-600 bg-slate-800'
                            }`}
                          >
                            {deliv.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span
                            className={`text-xs ${
                              deliv.completed ? 'text-slate-300 line-through' : 'text-slate-200'
                            }`}
                          >
                            {deliv.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {milestone.clientFeedback && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Client Note:</strong>{' '}
                          {milestone.clientFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: DOWNLOAD EXPORTED PROJECT FILES
          ========================================================================= */}
      {activeSubTab === 'exports' && (
        <div className="space-y-6">
          {/* Header Card with Category Selector */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Exported Source Code & Deliverables</h3>
                <p className="text-xs text-slate-400">
                  Direct access to compiled HTML5 markup, theme stylesheets, and offline packages
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAllBundle}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-md shadow-indigo-600/30 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download All Files (.txt archive)</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {['All', 'Markup', 'Stylesheets', 'Assets', 'SEO & Config', 'Full Archive'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFileCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    fileCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm flex flex-col justify-between transition space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-mono">{file.fileName}</h4>
                        <span className="text-[11px] text-slate-400 font-sans">{file.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {file.fileSize}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{file.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{file.version}</span>
                    <span>Updated: {file.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(file)}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white text-xs font-semibold transition flex items-center gap-1"
                      title="Inspect Code"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Developer Handoff & Self-Hosting Notice */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="text-sm font-bold text-white">Self-Hosting & Open Standards Handoff</h4>
              <p className="text-slate-400 leading-relaxed">
                All deliverables are generated using standard Bootstrap 5.3 markup without vendor lock-in. You can host these files on any static web server, AWS S3, Cloudflare Pages, or Apache/Nginx web server with zero external dependencies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Code Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">{previewFile.fileName}</h3>
                  <span className="text-xs text-slate-400">{previewFile.fileSize} · {previewFile.version}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(previewFile.codeContent)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre leading-relaxed">
              {previewFile.codeContent}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Signoff Approval Modal */}
      {approvingMilestone && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sign Off & Approve Milestone</h3>
                <span className="text-xs text-slate-400">Phase {approvingMilestone.phase} Verification</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              By confirming approval for <strong className="text-white">"{approvingMilestone.title}"</strong>, you formally sign off on the delivered staging blocks and authorize the agency team to proceed to the next roadmap milestone.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Optional Stakeholder Feedback or Remarks:
              </label>
              <textarea
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                placeholder="e.g., Looks fantastic! Mobile layout tested great on iPhone 15 Pro. Approved."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovingMilestone(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Signoff</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Live Mobile QR Preview</h3>
              <p className="text-xs text-slate-400 mt-1">
                Scan with your smartphone camera to preview your responsive website on iOS or Android.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  window.location.href
                )}`}
                alt="Mobile Preview QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <p className="text-[11px] font-mono text-indigo-400 break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
              {window.location.href}
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
