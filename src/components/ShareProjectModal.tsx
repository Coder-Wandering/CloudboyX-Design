import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Code2,
  Link,
  Sparkles,
  Layers,
  Palette,
  FileJson,
  Upload,
  AlertCircle,
  X,
  Globe,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings } from '../types';

export interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockInstance[];
  theme: SiteTheme;
  projectTitle: string;
  seoSettings?: SeoSettings;
  themeMode?: 'light' | 'dark';
  showToast?: (toast: { title: string; description: string; actionLabel?: string; onAction?: () => void }) => void;
  onImportState?: (state: { blocks: BlockInstance[]; theme: SiteTheme; title: string; seoSettings?: SeoSettings }) => void;
}

export const ShareProjectModal: React.FC<ShareProjectModalProps> = ({
  isOpen,
  onClose,
  blocks,
  theme,
  projectTitle,
  seoSettings,
  themeMode = 'light',
  showToast,
  onImportState,
}) => {
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState<'link' | 'json' | 'import'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clean, serialized project state representation
  const projectStateObj = useMemo(() => {
    return {
      title: projectTitle,
      exportedAt: new Date().toISOString(),
      generator: 'CloudboyX Bootstrap 5 Builder',
      version: '2.0.0',
      theme,
      seoSettings: seoSettings || {},
      blocks: blocks.map((b) => ({
        id: b.id,
        type: b.type,
        name: b.name,
        category: b.category,
        content: b.content,
        settings: b.settings,
        customHtml: b.customHtml,
        customCss: b.customCss,
      })),
    };
  }, [projectTitle, theme, seoSettings, blocks]);

  const formattedJson = useMemo(() => {
    return JSON.stringify(projectStateObj, null, 2);
  }, [projectStateObj]);

  const jsonSizeKb = useMemo(() => {
    const bytes = new Blob([formattedJson]).size;
    return (bytes / 1024).toFixed(1);
  }, [formattedJson]);

  // Generate shareable link
  const shareableUrl = useMemo(() => {
    try {
      const minifiedPayload = JSON.stringify({
        t: projectTitle,
        th: theme,
        s: seoSettings,
        b: blocks.map((b) => ({
          i: b.id,
          t: b.type,
          n: b.name,
          c: b.content,
          s: b.settings,
          h: b.customHtml,
          cs: b.customCss,
        })),
      });

      // UTF-8 safe base64 encoding
      const encoded = btoa(encodeURIComponent(minifiedPayload).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));

      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#share=${encoded}`;
    } catch (e) {
      console.warn('Failed to encode share link', e);
      return window.location.href;
    }
  }, [projectTitle, theme, seoSettings, blocks]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      if (showToast) {
        showToast({
          title: 'Share Link Copied',
          description: 'Shareable project link copied to system clipboard.',
        });
      }
    } catch {
      // Fallback
      if (linkInputRef.current) {
        linkInputRef.current.select();
        document.execCommand('copy');
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2500);

      if (showToast) {
        showToast({
          title: 'Project State JSON Copied',
          description: `Copied ${blocks.length} blocks and theme state (${jsonSizeKb} KB).`,
        });
      }
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([formattedJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const slug = (projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'project') + '.cloudboyx.json';
    const link = document.createElement('a');
    link.href = url;
    link.download = slug;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) {
      showToast({
        title: 'Project JSON Downloaded',
        description: `Saved as "${slug}" (${jsonSizeKb} KB).`,
      });
    }
  };

  const handleApplyImport = () => {
    setImportError(null);
    if (!importJsonText.trim()) {
      setImportError('Please paste valid JSON state into the box.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      let targetBlocks: BlockInstance[] = [];
      let targetTheme: SiteTheme = theme;
      let targetTitle: string = projectTitle;
      let targetSeo: SeoSettings | undefined = seoSettings;

      // Check minified or full format
      if (Array.isArray(parsed.blocks)) {
        targetBlocks = parsed.blocks;
        if (parsed.theme) targetTheme = parsed.theme;
        if (parsed.title) targetTitle = parsed.title;
        if (parsed.seoSettings) targetSeo = parsed.seoSettings;
      } else if (Array.isArray(parsed.b)) {
        targetBlocks = parsed.b.map((item: any) => ({
          id: item.i || `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: item.t,
          name: item.n || item.t,
          content: item.c || {},
          settings: item.s || {},
          customHtml: item.h,
          customCss: item.cs,
        }));
        if (parsed.th) targetTheme = parsed.th;
        if (parsed.t) targetTitle = parsed.t;
        if (parsed.s) targetSeo = parsed.s;
      } else {
        throw new Error('Unrecognized project JSON schema. Must contain a "blocks" array.');
      }

      if (onImportState) {
        onImportState({
          blocks: targetBlocks,
          theme: targetTheme,
          title: targetTitle,
          seoSettings: targetSeo,
        });
        if (showToast) {
          showToast({
            title: 'Project Imported',
            description: `Loaded ${targetBlocks.length} sections and theme settings.`,
          });
        }
        onClose();
      }
    } catch (e: any) {
      setImportError(e.message || 'Failed to parse JSON string. Verify syntax and try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-project-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-[#0b0f19] text-slate-100 border-slate-800 shadow-cyan-950/20'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 flex items-center justify-between border-b shrink-0 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-project-modal-title" className="text-base font-bold leading-tight">
                Share Project
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate a shareable link or copy the current project state JSON
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Project Snapshot Summary Banner */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
            isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-100/60 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{projectTitle}</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>{blocks.length} Sections</span>
            </div>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>{theme.headingFont || 'Default'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
              }`}
            >
              JSON Size: {jsonSizeKb} KB
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`px-5 pt-3 border-b flex items-center gap-2 shrink-0 ${
            isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <button
            type="button"
            id="share-tab-link"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'link'
                ? isDark
                  ? 'border-purple-400 text-purple-400'
                  : 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Shareable Link</span>
          </button>

          <button
            type="button"
            id="share-tab-json"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'json'
                ? isDark
                  ? 'border-purple-400 text-purple-400'
                  : 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Project State JSON</span>
          </button>

          {onImportState && (
            <button
              type="button"
              id="share-tab-import"
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
                activeTab === 'import'
                  ? isDark
                    ? 'border-purple-400 text-purple-400'
                    : 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import State</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB: SHAREABLE LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-purple-950/20 border-purple-900/40 text-purple-200'
                    : 'bg-purple-50/70 border-purple-200/80 text-purple-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    This standalone shareable link embeds your complete project layout, custom block modifications,
                    typography, and theme styling directly in the URL fragment. Opening it in any modern browser instantly restores your project.
                  </p>
                </div>
              </div>

              {/* URL Input Box with Copy Button */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Project URL Link
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 flex items-center px-3 py-2 rounded-xl border font-mono text-xs overflow-hidden ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      ref={linkInputRef}
                      type="text"
                      readOnly
                      value={shareableUrl}
                      id="shareable-link-input"
                      data-testid="shareable-link-input"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                      className="w-full bg-transparent border-none outline-hidden select-all text-xs text-ellipsis"
                    />
                  </div>

                  <button
                    type="button"
                    id="btn-copy-share-link"
                    data-testid="btn-copy-share-link"
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer shrink-0 shadow-2xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href={shareableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isDark
                      ? 'border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  <span>Open Link in New Tab</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                    isDark
                      ? 'border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Copy Raw State JSON</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROJECT STATE JSON */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Full Project State (JSON)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Portable JSON file containing blocks, theme variables, and custom HTML/CSS overrides.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-copy-project-json"
                    data-testid="btn-copy-project-json"
                    onClick={handleCopyJson}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs ${
                      copiedJson
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>JSON Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    id="btn-download-project-json"
                    data-testid="btn-download-project-json"
                    onClick={handleDownloadJson}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      isDark
                        ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div
                className={`relative rounded-xl border overflow-hidden ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800 text-slate-100'
                }`}
              >
                <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5 text-yellow-400" />
                    <span>project-state.json</span>
                  </div>
                  <span>{jsonSizeKb} KB</span>
                </div>

                <pre className="p-3 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-72 text-cyan-300">
                  <code>{formattedJson}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB: IMPORT STATE */}
          {activeTab === 'import' && onImportState && (
            <div className="space-y-4">
              <div
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    Paste previously exported project JSON or share link payload here to load it into the editor.
                    Importing will replace the active canvas state with the parsed blocks and theme.
                  </p>
                </div>
              </div>

              {importError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Paste JSON State
                </label>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"title": "My Landing Page", "blocks": [...], "theme": {...}}'
                  rows={8}
                  className={`w-full p-3 font-mono text-xs rounded-xl border transition focus:outline-hidden ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setImportJsonText('')}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  id="btn-confirm-import-json"
                  onClick={handleApplyImport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import & Replace State</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between shrink-0 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {activeTab === 'link' ? (
              <span>Shareable links require no cloud server — self-contained in URL.</span>
            ) : (
              <span>Standardized schema for CloudboyX projects.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
