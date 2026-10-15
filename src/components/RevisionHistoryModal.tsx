import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  Trash2,
  X,
  Search,
  Check,
  Plus,
  Bookmark,
  Sparkles,
  Download,
  Copy,
  Layers,
  ArrowRight,
  Eye,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Calendar,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings, ProjectRevision } from '../types';
import {
  getStoredRevisions,
  createRevisionSnapshot,
  deleteStoredRevision,
  clearAllStoredRevisions,
  formatRevisionRelativeTime,
  formatRevisionExactTime,
} from '../utils/revisionHistory';
import { generateCompleteHtml } from '../utils/htmlGenerator';

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlocks: BlockInstance[];
  currentTheme: SiteTheme;
  currentProjectTitle: string;
  currentSeoSettings?: SeoSettings;
  onRestoreRevision: (revision: ProjectRevision) => void;
  onCloneAsProject?: (revision: ProjectRevision) => void;
  themeMode?: 'light' | 'dark';
}

type FilterType = 'all' | 'autosave' | 'manual' | 'restore_point';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export const RevisionHistoryModal: React.FC<RevisionHistoryModalProps> = ({
  isOpen,
  onClose,
  currentBlocks,
  currentTheme,
  currentProjectTitle,
  currentSeoSettings,
  onRestoreRevision,
  onCloneAsProject,
  themeMode = 'light',
}) => {
  const isDark = themeMode === 'dark';

  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  // Manual snapshot creation state
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');

  // Confirmation dialogs
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Load revisions on open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredRevisions();
      setRevisions(stored);
      if (stored.length > 0 && !selectedRevisionId) {
        setSelectedRevisionId(stored[0].id);
      }
    }
  }, [isOpen]);

  const selectedRevision = useMemo(() => {
    return revisions.find((r) => r.id === selectedRevisionId) || revisions[0] || null;
  }, [revisions, selectedRevisionId]);

  // Filtered revisions list
  const filteredRevisions = useMemo(() => {
    return revisions.filter((rev) => {
      // Type match
      if (filterType !== 'all' && rev.type !== filterType) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = rev.title.toLowerCase().includes(q);
        const matchesLabel = rev.label?.toLowerCase().includes(q);
        const matchesDesc = rev.description?.toLowerCase().includes(q);
        const matchesSections = rev.sectionNames?.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesLabel && !matchesDesc && !matchesSections) {
          return false;
        }
      }

      return true;
    });
  }, [revisions, filterType, searchQuery]);

  // Live preview HTML for selected revision
  const previewHtml = useMemo(() => {
    if (!selectedRevision) return '';
    return generateCompleteHtml(
      selectedRevision.blocks,
      selectedRevision.theme,
      selectedRevision.title,
      false,
      null,
      selectedRevision.seoSettings
    );
  }, [selectedRevision]);

  // Diff analysis between selected revision and current working copy
  const diffAnalysis = useMemo(() => {
    if (!selectedRevision) return null;

    const currentBlockCount = currentBlocks.length;
    const revBlockCount = selectedRevision.blockCount;
    const blockCountDiff = revBlockCount - currentBlockCount;

    // Check matching section types
    const currentTypes = currentBlocks.map((b) => b.type);
    const revTypes = selectedRevision.blocks.map((b) => b.type);

    const addedInRev = revTypes.filter((t) => !currentTypes.includes(t));
    const missingInRev = currentTypes.filter((t) => !revTypes.includes(t));

    const isCurrentActive =
      currentBlockCount === revBlockCount &&
      currentProjectTitle === selectedRevision.title &&
      currentTheme.primaryColor === selectedRevision.theme.primaryColor &&
      JSON.stringify(currentBlocks.map((b) => b.id)) ===
        JSON.stringify(selectedRevision.blocks.map((b) => b.id));

    return {
      blockCountDiff,
      addedInRev,
      missingInRev,
      isCurrentActive,
      themeChanged: currentTheme.primaryColor !== selectedRevision.theme.primaryColor,
    };
  }, [selectedRevision, currentBlocks, currentTheme, currentProjectTitle]);

  if (!isOpen) return null;

  // Handle creating manual snapshot
  const handleSaveManualSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const label = snapshotLabel.trim() || `Milestone ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    const newRev = createRevisionSnapshot({
      blocks: currentBlocks,
      theme: currentTheme,
      title: currentProjectTitle,
      seoSettings: currentSeoSettings,
      type: 'manual',
      label,
      description: snapshotDescription.trim() || undefined,
    });

    const updated = getStoredRevisions();
    setRevisions(updated);
    setSelectedRevisionId(newRev.id);
    setIsCreatingSnapshot(false);
    setSnapshotLabel('');
    setSnapshotDescription('');
    setActionNotice(`Created milestone snapshot "${label}"`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Handle restoring
  const handleExecuteRestore = (revision: ProjectRevision) => {
    // 1. Create safety pre-restore snapshot of current state
    createRevisionSnapshot({
      blocks: currentBlocks,
      theme: currentTheme,
      title: currentProjectTitle,
      seoSettings: currentSeoSettings,
      type: 'restore_point',
      label: `Pre-restore Backup`,
      description: `Automatic safety checkpoint created before restoring "${revision.label || revision.title}".`,
    });

    // 2. Execute restore in parent
    onRestoreRevision(revision);
    setConfirmRestoreId(null);
    onClose();
  };

  // Handle deleting single revision
  const handleDeleteRevision = (id: string) => {
    const updated = deleteStoredRevision(id);
    setRevisions(updated);
    setConfirmDeleteId(null);
    if (selectedRevisionId === id) {
      setSelectedRevisionId(updated[0]?.id || null);
    }
    setActionNotice('Revision deleted from browser storage');
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Handle clearing all revisions
  const handleClearAll = () => {
    clearAllStoredRevisions();
    setRevisions([]);
    setSelectedRevisionId(null);
    setConfirmClearAll(false);
    setActionNotice('All revision history cleared');
    setTimeout(() => setActionNotice(null), 2500);
  };

  // Export specific revision HTML
  const handleExportRevisionHtml = (revision: ProjectRevision) => {
    const html = generateCompleteHtml(
      revision.blocks,
      revision.theme,
      revision.title,
      false,
      null,
      revision.seoSettings
    );
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(revision.title || 'revision').toLowerCase().replace(/[^a-z0-9]/g, '-')}-snapshot.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="revision-history-title"
    >
      <div
        className={`w-full max-w-7xl h-[94vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Header */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="revision-history-title" className="text-base sm:text-lg font-bold tracking-tight">
                  Revision History & Snapshots
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  {revisions.length} {revisions.length === 1 ? 'version' : 'versions'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                View, compare, and restore autosaved checkpoints stored client-side in your browser.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Create Milestone Button */}
            <button
              type="button"
              id="btn-create-milestone-snapshot"
              onClick={() => setIsCreatingSnapshot((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isCreatingSnapshot
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isCreatingSnapshot ? 'Cancel' : 'Save Milestone'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              aria-label="Close revision history"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Action Toast inside modal */}
        {actionNotice && (
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0 animate-in fade-in duration-150">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {actionNotice}
            </span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Inline Create Milestone Form */}
        {isCreatingSnapshot && (
          <form
            onSubmit={handleSaveManualSnapshot}
            className={`p-4 border-b shrink-0 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
              isDark ? 'bg-purple-950/30 border-purple-900/50' : 'bg-purple-50/70 border-purple-200'
            }`}
          >
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Milestone Name
              </label>
              <input
                type="text"
                value={snapshotLabel}
                onChange={(e) => setSnapshotLabel(e.target.value)}
                placeholder="e.g., V1.0 Launch Ready, Before pricing update..."
                className={`w-full text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
                autoFocus
                required
              />
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <label className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Optional Notes
              </label>
              <input
                type="text"
                value={snapshotDescription}
                onChange={(e) => setSnapshotDescription(e.target.value)}
                placeholder="e.g., Added 3 feature cards, changed primary blue theme"
                className={`w-full text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div className="flex items-center gap-2 pt-4 sm:pt-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsCreatingSnapshot(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Checkpoint</span>
              </button>
            </div>
          </form>
        )}

        {/* Main Content: Left Revisions Timeline + Right Preview & Comparison */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Revisions Timeline List */}
          <div
            className={`w-full md:w-96 flex flex-col border-b md:border-b-0 md:border-r shrink-0 overflow-hidden ${
              isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/40'
            }`}
          >
            {/* Search & Filter Header */}
            <div className={`p-3 border-b space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search versions, sections, dates..."
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'autosave', label: 'Autosaves' },
                    { id: 'manual', label: 'Milestones' },
                    { id: 'restore_point', label: 'Backups' },
                  ] as { id: FilterType; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      filterType === tab.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Revisions Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredRevisions.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    {searchQuery ? 'No matching revisions found' : 'No revisions stored in browser'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Checkpoints are created automatically as you add and edit blocks, or click "Save Milestone" above to snapshot now.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      createRevisionSnapshot({
                        blocks: currentBlocks,
                        theme: currentTheme,
                        title: currentProjectTitle,
                        seoSettings: currentSeoSettings,
                        type: 'manual',
                        label: 'Initial Checkpoint',
                      });
                      setRevisions(getStoredRevisions());
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer"
                  >
                    Create Baseline Snapshot Now
                  </button>
                </div>
              ) : (
                filteredRevisions.map((rev) => {
                  const isSelected = selectedRevision?.id === rev.id;
                  const isWorkingCopy =
                    currentBlocks.length === rev.blockCount &&
                    currentProjectTitle === rev.title &&
                    JSON.stringify(currentBlocks.map((b) => b.id)) ===
                      JSON.stringify(rev.blocks.map((b) => b.id));

                  const isMilestone = rev.type === 'manual';
                  const isRestorePoint = rev.type === 'restore_point';

                  return (
                    <div
                      key={rev.id}
                      onClick={() => setSelectedRevisionId(rev.id)}
                      className={`group relative p-3 rounded-xl border transition-all cursor-pointer text-left select-none ${
                        isSelected
                          ? isDark
                            ? 'bg-blue-950/40 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                            : 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-400/40'
                          : isDark
                          ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Row: Type Badge & Relative Time */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {isMilestone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              <Bookmark className="w-2.5 h-2.5" />
                              <span>Milestone</span>
                            </span>
                          ) : isRestorePoint ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>Pre-Restore</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-500/15 text-slate-400 border border-slate-700/50">
                              <Clock className="w-2.5 h-2.5" />
                              <span>Autosave</span>
                            </span>
                          )}

                          {isWorkingCopy && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Current
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-slate-400 shrink-0">
                          {formatRevisionRelativeTime(rev.timestamp)}
                        </span>
                      </div>

                      {/* Main Title & Label */}
                      <div className="font-semibold text-xs text-white dark:text-slate-100 flex items-center justify-between">
                        <span className="truncate max-w-[210px]">
                          {rev.label || rev.title}
                        </span>
                        <span className="text-[10px] font-mono text-blue-400 font-bold shrink-0">
                          {rev.blockCount} {rev.blockCount === 1 ? 'section' : 'sections'}
                        </span>
                      </div>

                      {/* Description or section summary chips */}
                      {rev.description ? (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                          "{rev.description}"
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {rev.sectionNames?.slice(0, 3).map((name, i) => (
                            <span
                              key={i}
                              className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono truncate max-w-[90px]"
                            >
                              {name}
                            </span>
                          ))}
                          {(rev.sectionNames?.length || 0) > 3 && (
                            <span className="text-[9.5px] text-slate-500 font-mono">
                              +{(rev.sectionNames?.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Hover / Quick Actions Bar */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-500">
                          {formatRevisionExactTime(rev.timestamp)}
                        </span>

                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmRestoreId(rev.id);
                            }}
                            className="p-1 rounded hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(rev.id);
                            }}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                            title="Delete this revision"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Panel Utilities */}
            {revisions.length > 0 && (
              <div
                className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
                  isDark ? 'border-slate-800 bg-slate-950/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-[11px] font-mono">
                  Browser LocalStorage: Safe FIFO retention
                </span>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                >
                  Clear History
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Revision Inspection, Diff & Live Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {selectedRevision ? (
              <>
                {/* Revision Inspection Bar */}
                <div
                  className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 ${
                    isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-white truncate">
                        {selectedRevision.label || selectedRevision.title}
                      </h3>
                      <span className="text-xs font-mono text-slate-400">
                        ({selectedRevision.blockCount} sections)
                      </span>
                      {selectedRevision.type === 'manual' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Named Milestone
                        </span>
                      )}
                      {selectedRevision.type === 'restore_point' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Pre-Restore Backup
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span>Saved: {formatRevisionExactTime(selectedRevision.timestamp)}</span>
                      <span>•</span>
                      <span>Primary: {selectedRevision.theme.primaryColor || '#2222FF'}</span>
                      {diffAnalysis && (
                        <>
                          <span>•</span>
                          <span
                            className={
                              diffAnalysis.blockCountDiff > 0
                                ? 'text-emerald-400 font-bold'
                                : diffAnalysis.blockCountDiff < 0
                                ? 'text-amber-400 font-bold'
                                : 'text-slate-400'
                            }
                          >
                            {diffAnalysis.blockCountDiff > 0
                              ? `+${diffAnalysis.blockCountDiff} sections vs working copy`
                              : diffAnalysis.blockCountDiff < 0
                              ? `${diffAnalysis.blockCountDiff} sections vs working copy`
                              : 'Same section count as working copy'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Export Snapshot HTML */}
                    <button
                      type="button"
                      onClick={() => handleExportRevisionHtml(selectedRevision)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                      title="Download HTML of this snapshot"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span className="hidden sm:inline">Export HTML</span>
                    </button>

                    {/* Clone As Project if available */}
                    {onCloneAsProject && (
                      <button
                        type="button"
                        onClick={() => {
                          onCloneAsProject(selectedRevision);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition cursor-pointer"
                        title="Clone into a new independent project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clone as Project</span>
                      </button>
                    )}

                    {/* RESTORE BUTTON */}
                    <button
                      type="button"
                      id="btn-confirm-restore-revision"
                      onClick={() => setConfirmRestoreId(selectedRevision.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore This Version</span>
                    </button>
                  </div>
                </div>

                {/* Section Structure Chips & Device Switcher */}
                <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-bold shrink-0">
                      Structure ({selectedRevision.blocks.length}):
                    </span>
                    {selectedRevision.blocks.map((block, idx) => (
                      <span
                        key={block.id || idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10.5px] font-mono whitespace-nowrap border border-slate-700/80"
                      >
                        <span className="text-blue-400 font-bold">#{idx + 1}</span>
                        <span>{block.name || block.type}</span>
                      </span>
                    ))}
                  </div>

                  {/* Device Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded transition cursor-pointer ${
                        previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('tablet')}
                      className={`p-1 rounded transition cursor-pointer ${
                        previewDevice === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Tablet View (768px)"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded transition cursor-pointer ${
                        previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Mobile View (375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Preview Iframe Container */}
                <div className="flex-1 p-4 overflow-auto flex justify-center items-start bg-slate-900/40">
                  <div
                    className={`transition-all duration-200 shadow-2xl rounded-xl overflow-hidden border border-slate-800 bg-white h-full ${
                      previewDevice === 'mobile'
                        ? 'w-[375px]'
                        : previewDevice === 'tablet'
                        ? 'w-[768px]'
                        : 'w-full max-w-5xl'
                    }`}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      title={`Preview of revision ${selectedRevision.id}`}
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <History className="w-12 h-12 text-slate-600" />
                <div className="font-bold text-base text-slate-300">Select a revision to preview</div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click any autosaved version on the left timeline to inspect its layout, compare differences, and restore it into your workspace.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RESTORE CONFIRMATION DIALOG */}
        {confirmRestoreId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className={`w-full max-w-md p-5 rounded-2xl shadow-2xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Restore This Snapshot?</h4>
                  <p className="text-xs text-slate-400">
                    Your current working copy will be updated to this snapshot.
                  </p>
                </div>
              </div>

              <div
                className={`p-3 rounded-xl border mb-4 text-xs space-y-1.5 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automatic safety backup included</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  A pre-restore backup checkpoint of your current canvas will be created automatically, so you can easily revert back at any time.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmRestoreId(null)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-dialog-confirm-restore"
                  onClick={() => {
                    const target = revisions.find((r) => r.id === confirmRestoreId);
                    if (target) handleExecuteRestore(target);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Restore</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION DIALOG */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className={`w-full max-w-sm p-5 rounded-2xl shadow-2xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <h4 className="font-bold text-sm mb-1 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Delete Revision Snapshot?
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                This revision will be removed from your browser storage.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRevision(confirmDeleteId)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLEAR ALL CONFIRMATION DIALOG */}
        {confirmClearAll && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              className={`w-full max-w-sm p-5 rounded-2xl shadow-2xl border ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <h4 className="font-bold text-sm mb-1 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Clear All Revisions?
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                This will delete all stored autosaves and milestone snapshots from this browser. Your current working copy will NOT be affected.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
