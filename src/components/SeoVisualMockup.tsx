import React, { useState } from 'react';
import {
  Search,
  Share2,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  MoreVertical,
  ImageIcon,
  Sparkles,
  ExternalLink,
  Layers,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
} from 'lucide-react';

export type MockupType = 'google' | 'facebook' | 'twitter' | 'linkedin' | 'discord';

export interface SeoVisualMockupProps {
  title: string;
  description: string;
  url?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  author?: string;
  twitterHandle?: string;
  primaryColor?: string;
  defaultMockup?: MockupType;
  className?: string;
  showTabs?: boolean;
}

export const SeoVisualMockup: React.FC<SeoVisualMockupProps> = ({
  title,
  description,
  url,
  faviconUrl,
  ogImageUrl,
  author,
  twitterHandle,
  primaryColor = '#2222FF',
  defaultMockup = 'google',
  className = '',
  showTabs = true,
}) => {
  const [activeMockup, setActiveMockup] = useState<MockupType>(defaultMockup);
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [simulateTruncation, setSimulateTruncation] = useState(true);
  const [copiedText, setCopiedText] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const [isFaviconError, setIsFaviconError] = useState(false);

  // Fallbacks
  const displayTitle = title?.trim() || 'Untitled Page — Your Brand Name';
  const displayDesc =
    description?.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Add a compelling meta description to explain what this page is about and drive clicks.';
  const displayUrl = url?.trim() || 'https://mywebsite.com';
  const displayAuthor = author?.trim() || 'My Website';
  const displayFavicon =
    faviconUrl?.trim() ||
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg';
  const displayOgImage =
    ogImageUrl?.trim() ||
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';

  // Format clean domain and path
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

  // Realistic truncation strings
  const googleTitle =
    simulateTruncation && titleLength > TITLE_OPTIMAL_MAX
      ? `${displayTitle.slice(0, TITLE_OPTIMAL_MAX).trim()}...`
      : displayTitle;

  const googleDesc =
    simulateTruncation && descLength > DESC_OPTIMAL_MAX
      ? `${displayDesc.slice(0, DESC_OPTIMAL_MAX).trim()}...`
      : displayDesc;

  const socialTitle =
    simulateTruncation && titleLength > 70
      ? `${displayTitle.slice(0, 70).trim()}...`
      : displayTitle;

  const socialDesc =
    simulateTruncation && descLength > 165
      ? `${displayDesc.slice(0, 165).trim()}...`
      : displayDesc;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${displayTitle}\n\n${displayDesc}\n\n${displayUrl}`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div
      id="seo-visual-mockup-studio"
      className={`rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* Top Header & Platform Selector Bar */}
      <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            {activeMockup === 'google' ? (
              <Search className="w-3.5 h-3.5" />
            ) : (
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 leading-tight">
              {activeMockup === 'google'
                ? 'Google Search Snippet Preview'
                : 'Social Media Card Mock-Up'}
            </h4>
            <p className="text-[10px] text-slate-500">
              {activeMockup === 'google'
                ? 'Simulates how your page appears on Google Search (SERP)'
                : 'Simulates OpenGraph rich cards on social networks and chat apps'}
            </p>
          </div>
        </div>

        {/* Action controls: Copy & Truncation toggle */}
        <div className="flex items-center gap-2">
          {activeMockup === 'google' && (
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                id="btn-mockup-device-desktop"
                onClick={() => setGoogleDevice('desktop')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  googleDevice === 'desktop'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Preview desktop Google search result"
              >
                <Monitor className="w-3 h-3" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                id="btn-mockup-device-mobile"
                onClick={() => setGoogleDevice('mobile')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  googleDevice === 'mobile'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Preview mobile Google search result"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            title="Copy metadata snippet text"
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer shadow-2xs"
          >
            {copiedText ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Platform Switcher Tabs */}
      {showTabs && (
        <div className="px-3 pt-2.5 pb-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {/* Google Tab */}
          <button
            type="button"
            id="mockup-tab-google"
            onClick={() => setActiveMockup('google')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeMockup === 'google'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {/* Google Multi-Color G Icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
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
            <span>Google Search</span>
          </button>

          {/* Facebook / OpenGraph Tab */}
          <button
            type="button"
            id="mockup-tab-facebook"
            onClick={() => setActiveMockup('facebook')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeMockup === 'facebook'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 ring-1 ring-blue-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {/* Facebook Blue Icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook (Open Graph)</span>
          </button>

          {/* X / Twitter Tab */}
          <button
            type="button"
            id="mockup-tab-twitter"
            onClick={() => setActiveMockup('twitter')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeMockup === 'twitter'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-1 ring-slate-800/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {/* X Logo */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-black" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>X (Twitter Card)</span>
          </button>

          {/* LinkedIn Tab */}
          <button
            type="button"
            id="mockup-tab-linkedin"
            onClick={() => setActiveMockup('linkedin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeMockup === 'linkedin'
                ? 'bg-white text-[#0A66C2] shadow-xs border border-slate-200/80 ring-1 ring-blue-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {/* LinkedIn Icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#0A66C2]" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            <span>LinkedIn</span>
          </button>

          {/* Discord / Slack Tab */}
          <button
            type="button"
            id="mockup-tab-discord"
            onClick={() => setActiveMockup('discord')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeMockup === 'discord'
                ? 'bg-white text-[#5865F2] shadow-xs border border-slate-200/80 ring-1 ring-indigo-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {/* Discord Icon */}
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#5865F2]" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Discord / Slack</span>
          </button>
        </div>
      )}

      {/* Main Mockup Render Area */}
      <div className="p-4 sm:p-5 bg-slate-50/50 flex flex-col items-center justify-center">
        {/* ========================================================= */}
        {/* 1. GOOGLE SEARCH RESULT SNIPPET                           */}
        {/* ========================================================= */}
        {activeMockup === 'google' && (
          <div className="w-full">
            {googleDevice === 'desktop' ? (
              /* Desktop Google Snippet */
              <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs max-w-2xl mx-auto space-y-1">
                {/* Desktop URL Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {!isFaviconError ? (
                      <img
                        src={displayFavicon}
                        alt="Site favicon"
                        className="w-3.5 h-3.5 object-contain"
                        onError={() => setIsFaviconError(true)}
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-blue-600">G</span>
                    )}
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

                {/* Title Link */}
                <h3 className="pt-0.5">
                  <a
                    href="#preview"
                    onClick={(e) => e.preventDefault()}
                    className="text-[19px] leading-[1.3] text-[#1a0dab] hover:underline font-normal cursor-pointer block tracking-normal break-words"
                  >
                    {googleTitle}
                  </a>
                </h3>

                {/* Description Snippet */}
                <p className="text-[14px] leading-[1.57] text-[#4d5156] font-normal break-words pt-0.5">
                  {googleDesc}
                </p>
              </div>
            ) : (
              /* Mobile Google Snippet */
              <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {!isFaviconError ? (
                      <img
                        src={displayFavicon}
                        alt="Site favicon"
                        className="w-4 h-4 object-contain"
                        onError={() => setIsFaviconError(true)}
                      />
                    ) : (
                      <span className="text-xs font-bold text-blue-600">G</span>
                    )}
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

                <h4 className="text-[16px] leading-[1.35] text-[#1a0dab] font-normal hover:underline cursor-pointer break-words">
                  {googleTitle}
                </h4>

                <div className="flex items-start gap-3">
                  <p className="text-[13px] leading-[1.5] text-[#4d5156] flex-1 break-words">
                    {googleDesc}
                  </p>
                  {ogImageUrl && (
                    <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                      <img
                        src={ogImageUrl}
                        alt="Thumbnail"
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
        )}

        {/* ========================================================= */}
        {/* 2. FACEBOOK / OPENGRAPH SOCIAL CARD                       */}
        {/* ========================================================= */}
        {activeMockup === 'facebook' && (
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
            {/* Simulated Facebook Post Header */}
            <div className="p-3.5 flex items-center gap-2.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">
                {displayAuthor.charAt(0) || 'M'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{displayAuthor}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>Just now</span>
                  <span>•</span>
                  <span>🌐</span>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>

            {/* Post text */}
            <div className="px-3.5 pt-2 pb-2.5 text-xs text-slate-800">
              Check out our official website! Built with modern responsive Bootstrap 5.
            </div>

            {/* OpenGraph Large Link Card */}
            <div className="border-t border-b border-slate-200 bg-slate-100 overflow-hidden">
              <div className="aspect-[1.91/1] w-full bg-slate-200 relative overflow-hidden flex items-center justify-center">
                {!isImgError ? (
                  <img
                    src={displayOgImage}
                    alt="OpenGraph Card Preview"
                    className="w-full h-full object-cover"
                    onError={() => setIsImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Image preview unavailable</span>
                  </div>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-3 bg-[#F0F2F5] border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-[#65676B] tracking-wider block">
                  {cleanDomain}
                </span>
                <h5 className="text-[14px] font-bold text-[#050505] leading-snug mt-0.5 line-clamp-2">
                  {socialTitle}
                </h5>
                <p className="text-[12px] text-[#65676B] line-clamp-2 mt-0.5 leading-snug">
                  {socialDesc}
                </p>
              </div>
            </div>

            {/* Simulated Facebook Engagement Footer */}
            <div className="px-3 py-2 flex items-center justify-around text-xs font-semibold text-slate-500 border-t border-slate-100">
              <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" /> Like
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> Comment
              </span>
              <span className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer">
                <Share2 className="w-3.5 h-3.5" /> Share
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. X / TWITTER LARGE SUMMARY CARD                         */}
        {/* ========================================================= */}
        {activeMockup === 'twitter' && (
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-slate-900">
            {/* Simulated Tweet Header */}
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {displayAuthor.charAt(0) || 'X'}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 truncate">{displayAuthor}</span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {twitterHandle
                      ? (twitterHandle.startsWith('@') ? twitterHandle : `@${twitterHandle}`)
                      : `@${cleanDomain.replace(/\..*$/, '')}`}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-[11px] text-slate-500">2m</span>
                </div>
                <p className="text-xs text-slate-800 mt-1">
                  Excited to share our brand-new website release. Explore what we've built:
                </p>
              </div>
            </div>

            {/* Twitter Card Bordered Box */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="aspect-[1.91/1] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {!isImgError ? (
                  <img
                    src={displayOgImage}
                    alt="Twitter Card Image"
                    className="w-full h-full object-cover"
                    onError={() => setIsImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Image unavailable</span>
                  </div>
                )}
                {/* Domain Pill Badge */}
                <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                  {cleanDomain}
                </div>
              </div>

              {/* Text Info */}
              <div className="p-3">
                <div className="text-[11px] text-slate-500 font-mono truncate">{cleanDomain}</div>
                <h5 className="text-[14px] font-bold text-slate-900 leading-snug truncate mt-0.5">
                  {socialTitle}
                </h5>
                <p className="text-[12px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                  {socialDesc}
                </p>
              </div>
            </div>

            {/* Tweet Action Icons */}
            <div className="flex items-center justify-between text-slate-400 mt-3 px-2 text-xs">
              <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> 12
              </span>
              <span className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer">
                <Repeat2 className="w-3.5 h-3.5" /> 8
              </span>
              <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                <Heart className="w-3.5 h-3.5" /> 48
              </span>
              <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                <Bookmark className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. LINKEDIN POST SNIPPET                                  */}
        {/* ========================================================= */}
        {activeMockup === 'linkedin' && (
          <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
            {/* LinkedIn Post Header */}
            <div className="p-3.5 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {displayAuthor.charAt(0) || 'in'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 truncate">{displayAuthor}</div>
                <div className="text-[10px] text-slate-500 truncate">Official Corporate Profile • 1,420 followers</div>
                <div className="text-[10px] text-slate-400">1h • Edited • 🌐</div>
              </div>
            </div>

            <div className="px-3.5 pb-2 text-xs text-slate-800 leading-relaxed">
              We are pleased to introduce our responsive web application architecture.
            </div>

            {/* Image & Link Box */}
            <div className="border-t border-b border-slate-200 bg-slate-100">
              <div className="aspect-[1.91/1] w-full bg-slate-200 relative overflow-hidden flex items-center justify-center">
                {!isImgError ? (
                  <img
                    src={displayOgImage}
                    alt="LinkedIn Card"
                    className="w-full h-full object-cover"
                    onError={() => setIsImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 p-4 text-center">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Image preview unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#F3F6F8]">
                <h5 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-1">
                  {socialTitle}
                </h5>
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  {cleanDomain} • 2 min read
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. DISCORD / SLACK RICH EMBED CARD                        */}
        {/* ========================================================= */}
        {activeMockup === 'discord' && (
          <div className="w-full max-w-lg mx-auto bg-[#313338] text-white rounded-2xl p-4 shadow-md font-sans">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-300">
              <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-[10px]">
                Bot
              </div>
              <span className="font-bold text-white">CloudboyX Webhook</span>
              <span className="text-[10px] bg-[#5865F2] px-1 rounded font-bold uppercase">BOT</span>
              <span className="text-[10px] text-slate-400">Today at 12:45 PM</span>
            </div>

            <div className="text-xs text-[#00A8FC] hover:underline cursor-pointer mb-2 font-mono">
              {displayUrl}
            </div>

            {/* Discord Embed Box */}
            <div
              className="rounded-lg bg-[#2B2D31] p-3.5 border-l-4 space-y-2 relative"
              style={{ borderLeftColor: primaryColor || '#5865F2' }}
            >
              {/* Site Name with Favicon */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#B5BAC1]">
                <img
                  src={displayFavicon}
                  alt="Site icon"
                  className="w-3.5 h-3.5 rounded-full object-contain"
                  onError={() => setIsFaviconError(true)}
                />
                <span className="font-semibold">{displayAuthor}</span>
              </div>

              {/* Embed Title */}
              <h5 className="text-sm font-bold text-[#00A8FC] hover:underline cursor-pointer leading-snug">
                {socialTitle}
              </h5>

              {/* Embed Description */}
              <p className="text-xs text-[#DBDEE1] leading-relaxed line-clamp-3">
                {socialDesc}
              </p>

              {/* Large Image */}
              <div className="rounded-md overflow-hidden aspect-[1.91/1] w-full bg-black/40 mt-2">
                {!isImgError ? (
                  <img
                    src={displayOgImage}
                    alt="Discord Embed"
                    className="w-full h-full object-cover"
                    onError={() => setIsImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    Image preview unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostic & SEO Health Indicators Footer */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Title Health Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Title:</span>
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
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
                <AlertTriangle className="w-3 h-3" /> Cut off on Google
              </span>
            ) : titleLength >= TITLE_OPTIMAL_MIN ? (
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Optimal Length
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Min 30 chars</span>
            )}
          </div>

          {/* Description Health Counter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Description:</span>
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md ${
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
                <AlertTriangle className="w-3 h-3" /> Exceeds snippet limit
              </span>
            ) : descLength >= DESC_OPTIMAL_MIN ? (
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Optimal Length
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Min 120 chars</span>
            )}
          </div>
        </div>

        {/* Truncation Simulation Toggle */}
        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 hover:text-slate-800 transition select-none">
          <input
            type="checkbox"
            checked={simulateTruncation}
            onChange={(e) => setSimulateTruncation(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
          />
          <span>Simulate platform truncation (...)</span>
        </label>
      </div>
    </div>
  );
};
