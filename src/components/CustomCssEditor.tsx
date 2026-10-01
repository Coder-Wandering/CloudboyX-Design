import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Wand2,
} from 'lucide-react';
import { SiteTheme } from '../types';

interface CustomCssEditorProps {
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  onUpdateTheme: (theme: Partial<SiteTheme>) => void;
}

interface Snippet {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

const CSS_SNIPPETS: Snippet[] = [
  {
    id: 'cloudboyx-brand-palette',
    name: 'CloudboyX Brand Palette',
    category: 'Brand',
    description: 'Primary CSS variables (#FFFFFF, #00E5D1, #2222FF, #191970, #1C1C23)',
    code: `/* CloudboyX Official Brand Palette */
:root {
  --cbx-white: #FFFFFF;
  --cbx-cyan: #00E5D1;
  --cbx-blue: #2222FF;
  --cbx-navy: #191970;
  --cbx-dark: #1C1C23;

  --bs-primary: #2222FF;
  --bs-primary-rgb: 34, 34, 255;
  --bs-secondary: #00E5D1;
  --bs-dark: #1C1C23;
  --bs-light: #FFFFFF;
}`,
  },
  {
    id: 'glassmorphism-navbar',
    name: 'Glassmorphism Navbar',
    category: 'Header',
    description: 'Modern frosted glass effect with backdrop blur',
    code: `/* Frosted Glass Navbar */
.navbar {
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  background-color: rgba(255, 255, 255, 0.85) !important;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8) !important;
}

[data-bs-theme="dark"] .navbar {
  background-color: rgba(28, 28, 35, 0.88) !important;
  border-bottom: 1px solid rgba(25, 25, 112, 0.65) !important;
}`,
  },
  {
    id: 'card-lift',
    name: 'Card Hover Lift & Glow',
    category: 'Components',
    description: 'Smooth 3D elevation and soft shadow on hover',
    code: `/* Smooth Interactive Card Lift */
.card {
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 20px 25px -5px rgba(34, 34, 255, 0.14), 0 8px 10px -6px rgba(0, 229, 209, 0.08) !important;
}`,
  },
  {
    id: 'gradient-text',
    name: 'Gradient Headings',
    category: 'Typography',
    description: 'Eye-catching dynamic gradient display headings',
    code: `/* Dynamic CloudboyX Gradient Headings */
.display-1, .display-2, .display-3, .display-4, .gradient-heading {
  background: linear-gradient(135deg, var(--cbx-blue, #2222FF) 0%, var(--cbx-cyan, #00E5D1) 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  display: inline-block;
}`,
  },
  {
    id: 'button-glow',
    name: 'Glowing Primary Buttons',
    category: 'Buttons',
    description: 'Luminous ambient glow on primary call-to-actions',
    code: `/* Luminous Button Glow */
.btn-primary {
  box-shadow: 0 4px 14px 0 rgba(34, 34, 255, 0.38) !important;
  transition: all 0.2s ease-in-out !important;
}

.btn-primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px 0 rgba(0, 229, 209, 0.5) !important;
}`,
  },
  {
    id: 'custom-scrollbar',
    name: 'Minimalist Scrollbar',
    category: 'Global',
    description: 'Sleek custom branded scrollbar tracks',
    code: `/* Custom Minimalist Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(25, 25, 112, 0.45);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--bs-primary, #2222FF);
}`,
  },
  {
    id: 'pulse-animation',
    name: 'Subtle Pulse Badge',
    category: 'Badges',
    description: 'Gentle heartbeat breathing animation for badges',
    code: `/* Subtle Breathing Badge Animation */
@keyframes badge-gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

.badge.bg-primary {
  animation: badge-gentle-pulse 2.4s infinite ease-in-out;
  display: inline-flex;
  align-items: center;
}`,
  },
];

export const CustomCssEditor: React.FC<CustomCssEditorProps> = ({
  theme,
  themeMode = 'light',
  onUpdateTheme,
}) => {
  const isDark = themeMode === 'dark';
  const rawCss = theme.customCss || '';
  const [copied, setCopied] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Generate line numbers
  const lines = useMemo(() => {
    const count = (rawCss.match(/\n/g) || []).length + 1;
    return Array.from({ length: Math.max(count, 14) }, (_, i) => i + 1);
  }, [rawCss]);

  // Basic syntax analysis: count rules and check unclosed braces
  const syntaxCheck = useMemo(() => {
    const openBraces = (rawCss.match(/\{/g) || []).length;
    const closeBraces = (rawCss.match(/\}/g) || []).length;
    const isBalanced = openBraces === closeBraces;
    const ruleCount = openBraces;
    const charCount = rawCss.length;
    return {
      isBalanced,
      ruleCount,
      charCount,
      unclosed: openBraces - closeBraces,
    };
  }, [rawCss]);

  // Handle Tab key inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onUpdateTheme({ customCss: updated });

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCss);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    if (!rawCss) return;
    if (window.confirm('Are you sure you want to remove all custom CSS from this project?')) {
      onUpdateTheme({ customCss: '' });
    }
  };

  const handleInsertSnippet = (snippet: Snippet) => {
    const separator = rawCss.trim() ? '\n\n' : '';
    const newCss = rawCss.trimEnd() + separator + snippet.code + '\n';
    onUpdateTheme({ customCss: newCss });
    setShowSnippets(false);

    // Focus textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleFormatCss = () => {
    if (!rawCss.trim()) return;
    try {
      // Simple lightweight CSS beautifier
      const formatted = rawCss
        .replace(/\s*\{\s*/g, ' {\n  ')
        .replace(/\s*;\s*/g, ';\n  ')
        .replace(/\s*\}\s*/g, '\n}\n\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      onUpdateTheme({ customCss: formatted + '\n' });
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="custom-css-tab-container"
      className={`h-full flex flex-col transition-colors duration-200 select-none ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Banner / Controls Bar */}
      <div
        className={`px-4 py-3 border-b flex flex-col gap-2 shrink-0 ${
          isDark ? 'bg-[#0b0f19] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isDark
                  ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold leading-none">Custom CSS Injector</h3>
                <span className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Preview
                </span>
              </div>
              <p
                className={`text-[10px] mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Styles are injected directly into the project canvas in real time
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              id="css-snippets-toggle-btn"
              onClick={() => setShowSnippets((prev) => !prev)}
              className={`px-2 py-1 text-xs font-medium rounded-lg flex items-center gap-1 border transition cursor-pointer ${
                showSnippets
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Insert predefined Bootstrap 5 CSS enhancements"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Snippets</span>
            </button>

            <button
              type="button"
              id="css-format-btn"
              onClick={handleFormatCss}
              disabled={!rawCss.trim()}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title="Format CSS"
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="css-copy-btn"
              onClick={handleCopy}
              disabled={!rawCss.trim()}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title="Copy CSS to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              id="css-clear-btn"
              onClick={handleClear}
              disabled={!rawCss.trim()}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed'
                  : 'bg-slate-100 border-slate-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title="Clear all Custom CSS"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Line: Syntax status, rule count, size */}
        <div
          className={`flex items-center justify-between text-[10px] pt-1 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {syntaxCheck.isBalanced ? (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Valid CSS syntax
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <AlertCircle className="w-3 h-3" />
                {syntaxCheck.unclosed > 0
                  ? `${syntaxCheck.unclosed} unclosed bracket(s)`
                  : `${Math.abs(syntaxCheck.unclosed)} extra closing bracket(s)`}
              </span>
            )}
            <span>·</span>
            <span>{syntaxCheck.ruleCount} selector blocks</span>
            <span>·</span>
            <span>{syntaxCheck.charCount} characters</span>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className={`font-medium flex items-center gap-1 transition ${
              isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="w-3 h-3" />
            <span>Targeting Guide</span>
            {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Snippets Drawer (Collapsible) */}
      {showSnippets && (
        <div
          id="css-snippets-drawer"
          className={`p-3 border-b max-h-56 overflow-y-auto shrink-0 transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-blue-50/70 border-blue-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Quick CSS Presets & Enhancements
            </span>
            <span
              className={`text-[10px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Click any snippet to append it to your editor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CSS_SNIPPETS.map((snip) => (
              <button
                key={snip.id}
                type="button"
                onClick={() => handleInsertSnippet(snip)}
                className={`p-2 rounded-xl text-left border transition group cursor-pointer ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-blue-500 text-slate-200 hover:bg-slate-900'
                    : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold group-hover:text-blue-500 transition">
                    {snip.name}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      isDark
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {snip.category}
                  </span>
                </div>
                <p
                  className={`text-[10px] mt-0.5 line-clamp-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {snip.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cheatsheet / Guide (Collapsible) */}
      {showGuide && (
        <div
          id="css-targeting-guide"
          className={`p-3 border-b text-xs shrink-0 max-h-52 overflow-y-auto ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-700'
          }`}
        >
          <div className="font-semibold text-[11px] mb-1.5 flex items-center gap-1.5 text-blue-500">
            <Layers className="w-3.5 h-3.5" />
            <span>Bootstrap 5 Selector Reference</span>
          </div>
          <div className="space-y-1.5 text-[11px] font-mono leading-relaxed">
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">[data-block-id]</code>
              <span className="text-[10px] text-slate-500">Targets entire canvas block sections</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">.btn-primary, .btn-outline-primary</code>
              <span className="text-[10px] text-slate-500">Customize main action buttons</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">.navbar, .navbar-brand, .nav-link</code>
              <span className="text-[10px] text-slate-500">Navigation headers and links</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">.card, .card-body, .card-title</code>
              <span className="text-[10px] text-slate-500">Feature and pricing cards</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">[data-bs-theme="dark"]</code>
              <span className="text-[10px] text-slate-500">Dark-mode specific overrides</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-pink-500 shrink-0 font-bold">var(--bs-primary)</code>
              <span className="text-[10px] text-slate-500">Dynamic active brand color CSS variable</span>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor Body */}
      <div className="flex-1 min-h-[300px] flex relative overflow-hidden select-text">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className={`w-11 py-3 px-1 text-right select-none font-mono text-xs overflow-hidden shrink-0 border-r ${
            isDark
              ? 'bg-[#080b12] border-slate-800 text-slate-600'
              : 'bg-slate-100/70 border-slate-200 text-slate-400'
          }`}
        >
          {lines.map((n) => (
            <div key={n} className="leading-5 h-5">
              {n}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            id="custom-css-code-editor"
            value={rawCss}
            onChange={(e) => onUpdateTheme({ customCss: e.target.value })}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder={`/* Write custom CSS here to inject directly into the Bootstrap 5 canvas... */

/* Example: */
.btn-primary {
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.card {
  border-radius: 1rem !important;
}`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            className={`w-full h-full p-3 font-mono text-xs leading-5 resize-none outline-hidden border-0 transition-colors ${
              isDark
                ? 'bg-[#0b0f19] text-emerald-300 placeholder:text-slate-600 selection:bg-blue-900 selection:text-white'
                : 'bg-white text-slate-900 placeholder:text-slate-400 selection:bg-blue-100 selection:text-blue-900'
            }`}
          />
        </div>
      </div>

      {/* Footer / Helper Tip */}
      <div
        className={`px-4 py-2 border-t flex items-center justify-between text-[11px] shrink-0 ${
          isDark ? 'bg-[#080b12] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <kbd
            className={`px-1 py-0.5 rounded text-[10px] font-mono border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            Tab
          </kbd>
          <span>inserts 2 spaces</span>
        </span>

        <span className="text-[10px]">
          Target rules with <code className="text-blue-500">!important</code> if overriding Bootstrap utilities
        </span>
      </div>
    </div>
  );
};
