import React, { useState } from 'react';
import {
  Search,
  Monitor,
  Smartphone,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

export interface GoogleSearchPreviewCardProps {
  title: string;
  description: string;
  url?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  author?: string;
  className?: string;
}

export const GoogleSearchPreviewCard: React.FC<GoogleSearchPreviewCardProps> = ({
  title,
  description,
  url,
  faviconUrl,
  ogImageUrl,
  author,
  className = '',
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [simulateTruncation, setSimulateTruncation] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Fallbacks
  const displayTitle = title?.trim() || 'Untitled Page — Your Website Name';
  const displayDesc =
    description?.trim() ||
    'Add a compelling meta description to explain what this page is about and encourage clicks from search engines.';
  const displayUrl = url?.trim() || 'https://mywebsite.com';
  const displayAuthor = author?.trim() || 'My Website';
  const displayFavicon =
    faviconUrl?.trim() ||
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg';

  // Format breadcrumb domain
  let cleanDomain = 'mywebsite.com';
  let cleanPath = '';
  try {
    const parsed = new URL(displayUrl.startsWith('http') ? displayUrl : `https://${displayUrl}`);
    cleanDomain = parsed.hostname;
    cleanPath = parsed.pathname !== '/' ? parsed.pathname.replace(/\/$/, '') : '';
  } catch {
    cleanDomain = displayUrl.replace(/^https?:\/\//, '').split('/')[0] || 'mywebsite.com';
  }

  // Length calculation & limits
  const titleLength = title?.length || 0;
  const descLength = description?.length || 0;

  const TITLE_OPTIMAL_MIN = 30;
  const TITLE_OPTIMAL_MAX = 60;
  const DESC_OPTIMAL_MIN = 120;
  const DESC_OPTIMAL_MAX = 160;

  // Realistic Google truncation
  const renderedTitle =
    simulateTruncation && titleLength > TITLE_OPTIMAL_MAX
      ? `${displayTitle.slice(0, TITLE_OPTIMAL_MAX).trim()}...`
      : displayTitle;

  const renderedDesc =
    simulateTruncation && descLength > DESC_OPTIMAL_MAX
      ? `${displayDesc.slice(0, DESC_OPTIMAL_MAX).trim()}...`
      : displayDesc;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${displayTitle}\n${displayDesc}\n${displayUrl}`);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      id="google-search-preview-card"
      className={`rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Header bar with controls */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Authentic Google Multi-Color G Icon */}
          <div className="w-5 h-5 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center p-0.5 shrink-0">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800">
            Google Search Snippet Preview
          </span>
        </div>

        {/* Device Switcher & Options */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              id="btn-serp-desktop"
              onClick={() => setDeviceView('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                deviceView === 'desktop'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview desktop Google search result"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              id="btn-serp-mobile"
              onClick={() => setDeviceView('mobile')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition ${
                deviceView === 'mobile'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Preview mobile Google search result"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy snippet text"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main SERP Mockup Area */}
      <div className="p-4 bg-white select-text">
        {deviceView === 'desktop' ? (
          /* DESKTOP GOOGLE SERP PREVIEW */
          <div className="space-y-1 max-w-2xl">
            {/* Desktop URL Breadcrumb line */}
            <div className="flex items-center gap-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={displayFavicon}
                  alt="Site favicon"
                  className="w-3.5 h-3.5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex items-center gap-1.5 leading-tight overflow-hidden">
                <span className="text-[13px] text-[#202124] font-normal truncate">
                  {displayAuthor}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs text-[#4d5156] font-mono truncate">
                  https://{cleanDomain}{cleanPath ? ` › ${cleanPath.replace(/^\//, '')}` : ''}
                </span>
              </div>
              <div className="ml-auto text-slate-400 hover:text-slate-600 cursor-pointer p-0.5">
                <MoreVertical className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Desktop Title Link */}
            <h3 className="pt-0.5">
              <a
                href="#preview"
                onClick={(e) => e.preventDefault()}
                className="text-[19px] leading-[1.3] text-[#1a0dab] hover:underline font-normal cursor-pointer block tracking-normal break-words"
              >
                {renderedTitle}
              </a>
            </h3>

            {/* Desktop Description Snippet */}
            <p className="text-[14px] leading-[1.57] text-[#4d5156] font-normal break-words pt-0.5">
              {renderedDesc}
            </p>
          </div>
        ) : (
          /* MOBILE GOOGLE SERP PREVIEW */
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
            {/* Mobile Breadcrumb header */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                <img
                  src={displayFavicon}
                  alt="Site favicon"
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#202124] truncate leading-tight">
                  {displayAuthor}
                </span>
                <span className="text-[11px] text-[#4d5156] truncate leading-tight">
                  https://{cleanDomain}
                </span>
              </div>
              <div className="ml-auto text-slate-400 p-1">
                <MoreVertical className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mobile Title */}
            <h4 className="text-[16px] leading-[1.35] text-[#1a0dab] font-normal hover:underline cursor-pointer break-words">
              {renderedTitle}
            </h4>

            {/* Mobile Snippet with optional image thumbnail */}
            <div className="flex items-start gap-3">
              <p className="text-[13px] leading-[1.5] text-[#4d5156] flex-1 break-words">
                {renderedDesc}
              </p>
              {ogImageUrl && (
                <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                  <img
                    src={ogImageUrl}
                    alt="Snippet thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Diagnostic Bar */}
      <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Title Length Diagnostic */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Title:</span>
            <span
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                titleLength >= TITLE_OPTIMAL_MIN && titleLength <= TITLE_OPTIMAL_MAX
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : titleLength > TITLE_OPTIMAL_MAX
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {titleLength} / {TITLE_OPTIMAL_MAX} chars
            </span>
            {titleLength > TITLE_OPTIMAL_MAX ? (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Cut off
              </span>
            ) : titleLength >= TITLE_OPTIMAL_MIN ? (
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Optimal
              </span>
            ) : null}
          </div>

          {/* Description Length Diagnostic */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Description:</span>
            <span
              className={`font-mono text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                descLength >= DESC_OPTIMAL_MIN && descLength <= DESC_OPTIMAL_MAX
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : descLength > DESC_OPTIMAL_MAX
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {descLength} / {DESC_OPTIMAL_MAX} chars
            </span>
            {descLength > DESC_OPTIMAL_MAX ? (
              <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> Truncated
              </span>
            ) : descLength >= DESC_OPTIMAL_MIN ? (
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Optimal
              </span>
            ) : null}
          </div>
        </div>

        {/* Truncation Simulation Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 hover:text-slate-800 transition">
          <input
            type="checkbox"
            checked={simulateTruncation}
            onChange={(e) => setSimulateTruncation(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
          />
          <span>Simulate Google ellipsis (...)</span>
        </label>
      </div>
    </div>
  );
};
