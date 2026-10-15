import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Code2,
  FileCode,
  Sparkles,
  Eye,
  Columns2,
  RotateCcw,
  Copy,
  Wand2,
  Terminal,
  Heart,
  Layers,
  Sliders,
  Zap,
} from 'lucide-react';
import { BlockInstance, SiteTheme } from '../types';
import { extractEditableBlockCode } from '../utils/htmlGenerator';
import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';

interface BlockCodeEditorModalProps {
  isOpen: boolean;
  block: BlockInstance | null;
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  onClose: () => void;
  onSaveCode: (blockId: string, customHtml: string, customCss: string) => void;
  onResetCode?: (blockId: string) => void;
}

interface CodeRemixPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ElementType;
  html: string;
  css: string;
}

const CODE_REMIX_PRESETS: CodeRemixPreset[] = [
  {
    id: 'hello-world-heart',
    name: 'Hello World SVG',
    badge: 'Video Classic',
    description: 'Classic centered custom HTML block with inline SVG heart icon and custom typography.',
    icon: Heart,
    html: `<div class="cbx-hello-stage">
  <p class="cbx-hello-heading">Hello World</p>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e11d48" width="120" height="120" class="cbx-heart-svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
  </svg>
  <p class="cbx-hello-sub">CloudboyX Studio</p>
</div>`,
    css: `.cbx-hello-stage {
  padding: 64px 20px;
  color: #64748b;
  text-align: center;
}
.cbx-hello-heading {
  font-size: 52px;
  font-weight: 300;
  color: #334155;
  margin-bottom: 12px;
}
.cbx-heart-svg {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 10px 20px rgba(225, 29, 72, 0.25));
}
.cbx-heart-svg:hover {
  transform: scale(1.12);
}
.cbx-hello-sub {
  font-size: 36px;
  font-weight: 300;
  color: #64748b;
  margin-top: 12px;
  margin-bottom: 0;
}`,
  },
  {
    id: 'bento-grid-remix',
    name: 'Interactive Bento Grid',
    badge: 'Remix',
    description: 'Modern 3-card dark/light adaptive Bento showcase with animated status pill and custom hover elevation.',
    icon: Layers,
    html: `<div class="cbx-bento-wrapper py-4">
  <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
    <div>
      <span class="cbx-live-pill mb-2">
        <span class="cbx-pulse-dot"></span> CUSTOM HTML + CSS REMIX
      </span>
      <h2 class="fw-bold mb-0">Next-Gen Modular Architecture</h2>
    </div>
    <a href="#explore" class="btn btn-primary rounded-pill px-4 fw-semibold">Explore System →</a>
  </div>

  <div class="row g-4">
    <div class="col-lg-7">
      <div class="cbx-bento-card cbx-bento-featured h-100 p-4 p-lg-5 d-flex flex-column justify-content-between">
        <div>
          <span class="badge bg-white text-dark rounded-pill px-3 py-1 mb-3 fw-bold">99.99% Uptime SLA</span>
          <h3 class="display-6 fw-bold text-white mb-3">Zero-Latency Edge Rendering Engine</h3>
          <p class="text-white-50 mb-4">Write raw Bootstrap 5 markup paired with scoped CSS rules. Every change compiles directly into your live responsive canvas.</p>
        </div>
        <div class="d-flex flex-wrap gap-3 pt-3 border-top border-light border-opacity-10">
          <div class="cbx-stat-chip">⚡ <strong>12ms</strong> Cold Start</div>
          <div class="cbx-stat-chip">🛡️ <strong>SOC2</strong> Certified</div>
          <div class="cbx-stat-chip">🌍 <strong>310+</strong> Edge PoPs</div>
        </div>
      </div>
    </div>

    <div class="col-lg-5">
      <div class="d-flex flex-column gap-4 h-100">
        <div class="cbx-bento-card p-4 flex-fill">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-primary small text-uppercase">Live Telemetry</span>
            <i class="bi bi-cpu fs-4 text-primary"></i>
          </div>
          <h4 class="fw-bold mb-2">Instant CSS Hot-Swap</h4>
          <p class="text-secondary small mb-0">Modify variables, keyframes, and grid templates without leaving the visual builder.</p>
        </div>

        <div class="cbx-bento-card p-4 flex-fill">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="fw-bold text-success small text-uppercase">Clean Export</span>
            <i class="bi bi-code-slash fs-4 text-success"></i>
          </div>
          <h4 class="fw-bold mb-2">100% Standalone HTML5</h4>
          <p class="text-secondary small mb-0">Zero lock-in. Export production-ready HTML, CSS, and assets as a single file or ZIP.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
    css: `.cbx-bento-card {
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #ffffff;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.cbx-bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 35px -10px rgba(15, 23, 42, 0.12);
  border-color: #2222FF;
}
.cbx-bento-featured {
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #2222FF 100%);
  border: none;
}
.cbx-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(34, 34, 255, 0.08);
  color: #2222FF;
}
.cbx-pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00E5D1;
  box-shadow: 0 0 0 4px rgba(0, 229, 209, 0.25);
}
.cbx-stat-chip {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  backdrop-filter: blur(8px);
}`,
  },
  {
    id: 'interactive-roi-calc',
    name: 'Interactive ROI Calculator',
    badge: 'HTML + JS',
    description: 'Interactive estimator widget with range slider and live cost savings calculation.',
    icon: Sliders,
    html: `<div class="cbx-calc-card p-4 p-lg-5 mx-auto" style="max-width: 860px;">
  <div class="row align-items-center g-4">
    <div class="col-md-7">
      <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 mb-2 fw-bold">Interactive Estimator</span>
      <h3 class="fw-bold mb-2">Calculate Your Annual Studio Savings</h3>
      <p class="text-secondary small mb-4">Slide to adjust how many landing pages or client sites your team ships per month.</p>

      <label class="form-label fw-semibold d-flex justify-content-between">
        <span>Projects Shipped / Month</span>
        <span class="text-primary fw-bold" id="cbx-proj-val">8 Projects</span>
      </label>
      <input
        type="range"
        class="form-range"
        min="1"
        max="30"
        value="8"
        oninput="
          var count = parseInt(this.value, 10);
          var label = document.getElementById('cbx-proj-val');
          var hours = document.getElementById('cbx-hours-saved');
          var dollars = document.getElementById('cbx-dollars-saved');
          if (label) label.textContent = count + (count === 1 ? ' Project' : ' Projects');
          if (hours) hours.textContent = (count * 18) + ' hrs/mo';
          if (dollars) dollars.textContent = '$' + (count * 1450).toLocaleString();
        "
      />
      <div class="d-flex justify-content-between text-secondary" style="font-size: 12px;">
        <span>1 / mo (Solo)</span>
        <span>15 / mo (Agency)</span>
        <span>30 / mo (Enterprise)</span>
      </div>
    </div>

    <div class="col-md-5">
      <div class="cbx-calc-result p-4 text-center text-white">
        <div class="text-uppercase small opacity-75 fw-bold mb-1">Estimated Monthly Savings</div>
        <div class="display-5 fw-bold mb-2" id="cbx-dollars-saved">$11,600</div>
        <div class="badge bg-white text-dark rounded-pill px-3 py-1 mb-3">
          ⏱️ <span id="cbx-hours-saved">144 hrs/mo</span> engineering time saved
        </div>
        <a href="#start" class="btn btn-light w-100 rounded-pill fw-bold">Start Free Trial</a>
      </div>
    </div>
  </div>
</div>`,
    css: `.cbx-calc-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.08);
}
.cbx-calc-result {
  background: linear-gradient(145deg, #2222FF 0%, #191970 100%);
  border-radius: 18px;
  box-shadow: 0 12px 24px -6px rgba(34, 34, 255, 0.35);
}`,
  },
  {
    id: 'terminal-code-window',
    name: 'Developer Terminal Window',
    badge: 'Dev UI',
    description: 'macOS-inspired dark terminal showcase with syntax highlights and status bar.',
    icon: Terminal,
    html: `<div class="cbx-terminal-window mx-auto" style="max-width: 780px;">
  <div class="cbx-terminal-header d-flex align-items-center justify-content-between px-4 py-3">
    <div class="d-flex align-items-center gap-2">
      <span class="cbx-dot cbx-dot-red"></span>
      <span class="cbx-dot cbx-dot-amber"></span>
      <span class="cbx-dot cbx-dot-green"></span>
    </div>
    <div class="text-secondary small font-monospace">cloudboyx-cli — bash — 80×24</div>
    <span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25">v5.3 Ready</span>
  </div>
  <div class="cbx-terminal-body p-4 font-monospace text-start">
    <div class="mb-2"><span class="text-info">$</span> npx cloudboyx-studio init my-bootstrap-site</div>
    <div class="text-secondary mb-2">✔ Compiling Bootstrap 5.3.3 responsive grid AST...</div>
    <div class="text-secondary mb-2">✔ Injecting custom HTML &amp; scoped CSS rules...</div>
    <div class="mb-3"><span class="text-success fw-bold">✔ Build complete in 42ms!</span> Ready for instant deployment.</div>
    <div class="p-3 rounded-3 bg-white bg-opacity-10 d-flex align-items-center justify-content-between">
      <span class="text-light small">✨ Edit this terminal directly in the HTML &amp; CSS Code Editor</span>
      <a href="#deploy" class="btn btn-sm btn-info fw-bold rounded-pill px-3">Deploy Now</a>
    </div>
  </div>
</div>`,
    css: `.cbx-terminal-window {
  background: #0b0f19;
  color: #e2e8f0;
  border-radius: 18px;
  border: 1px solid #1e293b;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
}
.cbx-terminal-header {
  background: #111827;
  border-bottom: 1px solid #1e293b;
}
.cbx-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.cbx-dot-red { background: #ef4444; }
.cbx-dot-amber { background: #f59e0b; }
.cbx-dot-green { background: #10b981; }
.cbx-terminal-body {
  font-size: 14px;
  line-height: 1.7;
}`,
  },
  {
    id: 'infinite-marquee-band',
    name: 'CSS Animated Ticker Band',
    badge: 'Pure CSS',
    description: 'Smooth horizontal scrolling announcement and technology badge strip powered by CSS keyframes.',
    icon: Zap,
    html: `<div class="cbx-marquee-shell py-3">
  <div class="cbx-marquee-track">
    <span class="cbx-marquee-item">🚀 Bootstrap 5.3 Visual Studio</span>
    <span class="cbx-marquee-item">⚡ Split-Pane HTML &amp; CSS Code Editor</span>
    <span class="cbx-marquee-item">🎨 Live Responsive Breakpoint Cascade</span>
    <span class="cbx-marquee-item">📦 Zero-Dependency Clean HTML Export</span>
    <span class="cbx-marquee-item">🚀 Bootstrap 5.3 Visual Studio</span>
    <span class="cbx-marquee-item">⚡ Split-Pane HTML &amp; CSS Code Editor</span>
    <span class="cbx-marquee-item">🎨 Live Responsive Breakpoint Cascade</span>
    <span class="cbx-marquee-item">📦 Zero-Dependency Clean HTML Export</span>
  </div>
</div>`,
    css: `@keyframes cbxScrollMarquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.cbx-marquee-shell {
  overflow: hidden;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 16px;
  white-space: nowrap;
  position: relative;
}
.cbx-marquee-track {
  display: inline-flex;
  gap: 28px;
  animation: cbxScrollMarquee 22s linear infinite;
}
.cbx-marquee-shell:hover .cbx-marquee-track {
  animation-play-state: paused;
}
.cbx-marquee-item {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}`,
  },
];

export const BlockCodeEditorModal: React.FC<BlockCodeEditorModalProps> = ({
  isOpen,
  block,
  theme,
  themeMode = 'dark',
  onClose,
  onSaveCode,
  onResetCode,
}) => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [viewLayout, setViewLayout] = useState<'split-code' | 'code-and-preview'>('split-code');
  const [copiedPane, setCopiedPane] = useState<'html' | 'css' | null>(null);
  const [activeRemixId, setActiveRemixId] = useState<string | null>(null);

  const isDark = themeMode === 'dark';

  // Sync initial HTML and CSS when block opens
  useEffect(() => {
    if (isOpen && block) {
      const extracted = extractEditableBlockCode(block, theme);
      setHtmlCode(extracted.html);
      setCssCode(extracted.css);
      setActiveRemixId(null);
    }
  }, [isOpen, block, theme]);

  // Keyboard shortcuts: Escape to close, Ctrl/Cmd+S to save
  useEffect(() => {
    if (!isOpen || !block) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveCode(block.id, htmlCode, cssCode);
        onClose();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, block, htmlCode, cssCode, onSaveCode, onClose]);

  const htmlLineCount = useMemo(() => Math.max(18, htmlCode.split('\n').length), [htmlCode]);
  const cssLineCount = useMemo(() => Math.max(18, cssCode.split('\n').length), [cssCode]);

  const livePreviewSrcDoc = useMemo(() => {
    if (!block) return '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>
    :root {
      --bs-primary: ${theme.primaryColor || '#2222FF'};
      --bs-body-font-family: '${theme.fontFamily || 'Inter'}', system-ui, -apple-system, sans-serif;
    }
    body {
      font-family: var(--bs-body-font-family);
      margin: 0;
      padding: 16px;
      background: #ffffff;
    }
    ${cssCode}
  </style>
</head>
<body>
  <section id="block-${block.id}" data-block-id="${block.id}">
    <div class="${block.settings.containerWidth || 'container'}">
      ${htmlCode}
    </div>
  </section>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  }, [block, htmlCode, cssCode, theme]);

  if (!isOpen || !block) return null;

  const isCustomHtmlCategory = block.category === 'html';
  const hasCustomOverride = Boolean(
    (block.customHtml && block.customHtml.trim() !== '') ||
      (block.customCss && block.customCss.trim() !== '')
  );

  const handleApplyRemix = (preset: CodeRemixPreset) => {
    setHtmlCode(preset.html);
    setCssCode(preset.css);
    setActiveRemixId(preset.id);
  };

  const handleResetToDefault = () => {
    const def = BLOCK_DEFINITIONS.find((b) => b.type === block.type);
    if (!def) return;
    if (isCustomHtmlCategory) {
      setHtmlCode(def.defaultContent.rawHtml || '');
      setCssCode(def.defaultContent.rawCss || '');
    } else {
      const cleanBlock: BlockInstance = {
        ...block,
        customHtml: undefined,
        customCss: undefined,
      };
      setHtmlCode(def.renderHtml(cleanBlock, theme, false).trim());
      setCssCode(
        `/* Custom Scoped Styles for ${block.name} (#block-${block.id}) */\n#block-${block.id} {\n  \n}`
      );
    }
    setActiveRemixId(null);
    if (onResetCode) {
      onResetCode(block.id);
    }
  };

  const handleCopyCode = (pane: 'html' | 'css') => {
    const text = pane === 'html' ? htmlCode : cssCode;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // Fallback
    }
    setCopiedPane(pane);
    setTimeout(() => setCopiedPane(null), 2000);
  };

  const handleInsertHtmlSnippet = (snippet: string) => {
    setHtmlCode((prev) => `${prev.trimEnd()}\n${snippet}`);
  };

  const handleInsertCssSnippet = (snippet: string) => {
    setCssCode((prev) => `${prev.trimEnd()}\n\n${snippet}`);
  };

  const handleTextareaTab = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const value = target.value;
      setter(value.substring(0, start) + '  ' + value.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      id="block-code-editor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={`Code Editor for ${block.name}`}
    >
      <div className="relative w-full max-w-[1440px] h-[92vh] bg-[#141824] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* TOP HEADER BAR */}
        <header className="px-4 py-3 bg-[#0d111a] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Block Code Editor &amp; Remix Studio
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md bg-slate-800 text-cyan-300 border border-slate-700">
                  {block.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                  #block-{block.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Edit raw Bootstrap 5 HTML &amp; scoped CSS side-by-side, or load an interactive Remix preset below.
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher: Split Code vs Code + Live Preview */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewLayout('split-code')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  viewLayout === 'split-code'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span>HTML + CSS Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('code-and-preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  viewLayout === 'code-and-preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Split + Live Preview</span>
              </button>
            </div>

            {/* Reset to Default button */}
            {(hasCustomOverride || isCustomHtmlCategory) && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                title="Reset HTML and CSS back to block's default template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Default</span>
              </button>
            )}

            {/* Copy CSS Button */}
            <button
              type="button"
              id="btn-copy-css-header"
              onClick={() => handleCopyCode('css')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700 transition cursor-pointer"
              title="Copy only the custom CSS content to clipboard"
            >
              {copiedPane === 'css' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">CSS Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-400" />
                  <span>Copy CSS</span>
                </>
              )}
            </button>

            {/* Save & Apply Button */}
            <button
              type="button"
              id="block-code-editor-save-btn"
              onClick={() => {
                onSaveCode(block.id, htmlCode, cssCode);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              title="Save HTML & CSS changes to block (Ctrl+S)"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save &amp; Apply</span>
            </button>

            {/* Cancel / Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition cursor-pointer"
              title="Discard changes and close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* REMIX PRESETS BAR */}
        <div className="px-4 py-2 bg-[#101520] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400 pr-2 border-r border-slate-800 shrink-0">
            <Wand2 className="w-3.5 h-3.5" />
            <span>Code Remixes:</span>
          </div>
          {CODE_REMIX_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = activeRemixId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyRemix(preset)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/25 border-cyan-400 text-white shadow-xs'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={preset.description}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold">{preset.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* MAIN SPLIT WORKSPACE: HTML EDITOR (LEFT) | CSS EDITOR (RIGHT) | OPTIONAL LIVE PREVIEW */}
        <div
          className={`flex-1 grid min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 ${
            viewLayout === 'code-and-preview'
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1 lg:grid-cols-12'
          }`}
        >
          {/* LEFT PANE: HTML EDITOR */}
          <div
            className={`flex flex-col min-h-0 bg-[#181c27] ${
              viewLayout === 'code-and-preview' ? 'lg:col-span-5' : 'lg:col-span-7'
            }`}
          >
            {/* Pane Header */}
            <div className="px-4 py-2 bg-[#131722] border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold tracking-wide text-slate-200">
                  HTML Editor
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({htmlCode.split('\n').length} lines)
                </span>
              </div>

              {/* Quick HTML Snippet Chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() =>
                    handleInsertHtmlSnippet(
                      `<div class="row g-4 my-2">\n  <div class="col-md-4">\n    <div class="p-4 rounded-4 border bg-light">Column 1</div>\n  </div>\n  <div class="col-md-4">\n    <div class="p-4 rounded-4 border bg-light">Column 2</div>\n  </div>\n  <div class="col-md-4">\n    <div class="p-4 rounded-4 border bg-light">Column 3</div>\n  </div>\n</div>`
                    )
                  }
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Append a Bootstrap 5 3-column row"
                >
                  + 3-Col Row
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInsertHtmlSnippet(
                      `<a href="#action" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold">Action Button</a>`
                    )
                  }
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Append a Bootstrap 5 button"
                >
                  + Button
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyCode('html')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedPane === 'html' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="flex-1 flex relative min-h-0 overflow-hidden font-mono text-[13px] leading-6">
              {/* Line Numbers Gutter */}
              <div
                aria-hidden="true"
                className="w-12 py-4 bg-[#131722] text-slate-600 text-right pr-3 select-none shrink-0 overflow-hidden border-r border-slate-800/60"
              >
                {Array.from({ length: htmlLineCount }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Editable HTML Textarea */}
              <textarea
                id="block-html-code-textarea"
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                onKeyDown={(e) => handleTextareaTab(e, setHtmlCode)}
                spellCheck={false}
                placeholder="<!-- Write or paste your custom Bootstrap 5 HTML here... -->"
                className="flex-1 w-full h-full p-4 bg-[#181c27] text-emerald-300 placeholder-slate-600 focus:outline-none resize-none overflow-auto font-mono text-[13px] leading-6 selection:bg-blue-600/40"
              />
            </div>
          </div>

          {/* MIDDLE / RIGHT PANE: CSS EDITOR */}
          <div
            className={`flex flex-col min-h-0 bg-[#181c27] ${
              viewLayout === 'code-and-preview' ? 'lg:col-span-3' : 'lg:col-span-5'
            }`}
          >
            {/* Pane Header */}
            <div className="px-4 py-2 bg-[#131722] border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold tracking-wide text-slate-200">
                  CSS Editor
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({cssCode.split('\n').length} lines)
                </span>
              </div>

              {/* Quick CSS Snippet Chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() =>
                    handleInsertCssSnippet(
                      `#block-${block.id} .glass-panel {\n  background: rgba(255, 255, 255, 0.75);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 16px;\n}`
                    )
                  }
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Insert glassmorphic CSS rule"
                >
                  + Glass
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInsertCssSnippet(
                      `#block-${block.id} h1, #block-${block.id} h2 {\n  background: linear-gradient(90deg, #2222FF, #00E5D1);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}`
                    )
                  }
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Insert gradient heading CSS rule"
                >
                  + Gradient Text
                </button>
                <button
                  type="button"
                  id="btn-copy-css"
                  onClick={() => handleCopyCode('css')}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-sky-200 border border-slate-700 transition cursor-pointer"
                  title="Copy only custom CSS to clipboard"
                >
                  <Copy className="w-3 h-3 text-sky-400" />
                  <span>{copiedPane === 'css' ? 'CSS Copied!' : 'Copy CSS'}</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with Line Numbers */}
            <div className="flex-1 flex relative min-h-0 overflow-hidden font-mono text-[13px] leading-6">
              {/* Line Numbers Gutter */}
              <div
                aria-hidden="true"
                className="w-12 py-4 bg-[#131722] text-slate-600 text-right pr-3 select-none shrink-0 overflow-hidden border-r border-slate-800/60"
              >
                {Array.from({ length: cssLineCount }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Editable CSS Textarea */}
              <textarea
                id="block-css-code-textarea"
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                onKeyDown={(e) => handleTextareaTab(e, setCssCode)}
                spellCheck={false}
                placeholder="/* Write scoped CSS rules for this block... */"
                className="flex-1 w-full h-full p-4 bg-[#181c27] text-sky-300 placeholder-slate-600 focus:outline-none resize-none overflow-auto font-mono text-[13px] leading-6 selection:bg-blue-600/40"
              />
            </div>
          </div>

          {/* OPTIONAL 3RD PANE: LIVE REAL-TIME SANDBOX PREVIEW */}
          {viewLayout === 'code-and-preview' && (
            <div className="lg:col-span-4 flex flex-col min-h-0 bg-slate-900">
              <div className="px-4 py-2 bg-[#131722] border-b border-slate-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Live Block Preview</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Bootstrap 5.3 Sandbox</span>
              </div>
              <div className="flex-1 bg-white min-h-0">
                <iframe
                  title="Live Block Code Preview"
                  srcDoc={livePreviewSrcDoc}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          )}
        </div>

        {/* FLOATING BOTTOM-RIGHT VIDEO-STYLE SAVE (✓) & CANCEL (✕) ACTION PILLS + STATUS FOOTER */}
        <footer className="px-4 py-2.5 bg-[#0d111a] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scoped to <code className="text-cyan-300 font-mono">#block-{block.id}</code></span>
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+S</kbd> to save &amp; apply
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-400 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
              title="Cancel (Esc)"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveCode(block.id, htmlCode, cssCode);
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg transition cursor-pointer"
              title="Save & Apply Code (Ctrl+S)"
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
