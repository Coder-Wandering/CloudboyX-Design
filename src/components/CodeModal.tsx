import React, { useState } from 'react';
import { X, Copy, Check, Download, Code, Sparkles } from 'lucide-react';
import { BlockInstance, SiteTheme, SeoSettings } from '../types';
import { generateCompleteHtml } from '../utils/htmlGenerator';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: BlockInstance[];
  theme: SiteTheme;
  projectTitle: string;
  seoSettings?: SeoSettings;
  isEmbedded?: boolean;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  blocks,
  theme,
  projectTitle,
  seoSettings,
  isEmbedded = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Clean production code without editor attributes/scripts
  const fullHtml = generateCompleteHtml(blocks, theme, projectTitle, false, null, seoSettings);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'index'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const contentMarkup = (
    <div className={`bg-slate-900 text-slate-100 w-full flex flex-col border border-slate-800 overflow-hidden ${isEmbedded ? 'h-full' : 'max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl'}`}>
      {/* Modal Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Code className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Bootstrap 5.3 HTML</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Production
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-text">
        <pre className="whitespace-pre-wrap break-all">
          <code>{fullHtml}</code>
        </pre>
      </div>

      {/* Modal Footer */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>{blocks.length} sections compiled</span>
        <span>Clean HTML</span>
      </div>
    </div>
  );

  return isEmbedded ? (
    contentMarkup
  ) : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      {contentMarkup}
    </div>
  );
};
