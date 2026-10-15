import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  AtSign,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Heart,
  Bookmark,
  Sparkles,
  Columns,
  Layers,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';

export interface SocialMediaCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  canonicalUrl: string;
  ogImageUrl: string;
  twitterHandle: string;
  author?: string;
  themeMode?: 'light' | 'dark';
  showToast?: (toast: { title: string; description?: string }) => void;
}

export const SocialMediaCardPreviewModal: React.FC<SocialMediaCardPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  canonicalUrl,
  ogImageUrl,
  twitterHandle,
  author,
  themeMode = 'light',
  showToast,
}) => {
  const isDark = themeMode === 'dark';
  const [activeView, setActiveView] = useState<'both' | 'facebook' | 'twitter'>('both');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isImgError, setIsImgError] = useState(false);

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

  // Reset img error on URL change
  useEffect(() => {
    setIsImgError(false);
  }, [ogImageUrl]);

  if (!isOpen) return null;

  // Formatted fallbacks
  const displayTitle = title?.trim() || 'My Bootstrap 5 Website';
  const displayDesc =
    description?.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Modern, responsive, and mobile-first website.';
  const displayOgImage =
    ogImageUrl?.trim() ||
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';
  const displayCanonical = canonicalUrl?.trim() || 'https://mywebsite.com';
  const displayAuthor = author?.trim() || 'My Website Studio';
  const cleanTwitterHandle = twitterHandle ? twitterHandle.replace(/^@/, '') : '';

  // Extract clean domain and path
  let cleanDomain = 'mywebsite.com';
  try {
    const urlObj = new URL(displayCanonical.startsWith('http') ? displayCanonical : `https://${displayCanonical}`);
    cleanDomain = urlObj.hostname;
  } catch {
    cleanDomain = displayCanonical.replace(/^https?:\/\//, '').split('/')[0] || 'mywebsite.com';
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayCanonical);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    if (showToast) {
      showToast({
        title: 'Canonical URL Copied',
        description: displayCanonical,
      });
    }
  };

  return (
    <div
      id="modal-preview-social-cards"
      data-testid="modal-preview-social-cards"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  Social Media Card Previews
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Live Open Graph
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Simulated mock-up of how your page appears when shared on Facebook and Twitter (X).
              </p>
            </div>
          </div>

          {/* View Toggles & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Selector */}
            <div
              className={`hidden sm:flex items-center p-1 rounded-xl border text-xs font-semibold ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200/70 border-slate-300/70'
              }`}
            >
              <button
                type="button"
                id="btn-view-both"
                data-testid="btn-view-both"
                onClick={() => setActiveView('both')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'both'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side-by-Side</span>
              </button>

              <button
                type="button"
                id="btn-view-facebook"
                data-testid="btn-view-facebook"
                onClick={() => setActiveView('facebook')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'facebook'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {/* Facebook icon */}
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </button>

              <button
                type="button"
                id="btn-view-twitter"
                data-testid="btn-view-twitter"
                onClick={() => setActiveView('twitter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeView === 'twitter'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {/* Twitter / X icon */}
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter (X)</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              id="btn-close-social-preview-modal"
              data-testid="btn-close-social-preview-modal"
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-2xs'
              }`}
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata Status Strip */}
        <div
          className={`px-5 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-blue-50/50 border-blue-100'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold">Canonical:</span>
              <span className="font-mono text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                {displayCanonical}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-semibold">OG Image:</span>
              <span className="font-mono text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-xs">
                {ogImageUrl || 'Default Preset (1200×630)'}
              </span>
            </div>

            {cleanTwitterHandle && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <AtSign className="w-3.5 h-3.5 text-sky-500" />
                <span className="font-semibold">Handle:</span>
                <span className="font-mono text-slate-800 dark:text-slate-100">
                  @{cleanTwitterHandle}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs'
              }`}
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copiedLink ? 'Copied URL' : 'Copy Canonical URL'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Containing the Mock-ups */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/60 dark:bg-slate-950/80">
          {/* Mobile view switch */}
          <div className="sm:hidden flex items-center justify-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-semibold w-full">
            <button
              type="button"
              onClick={() => setActiveView('both')}
              className={`flex-1 py-1 rounded-lg text-center ${activeView === 'both' ? 'bg-white dark:bg-slate-700 shadow-xs' : ''}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveView('facebook')}
              className={`flex-1 py-1 rounded-lg text-center ${activeView === 'facebook' ? 'bg-white dark:bg-slate-700 shadow-xs' : ''}`}
            >
              Facebook
            </button>
            <button
              type="button"
              onClick={() => setActiveView('twitter')}
              className={`flex-1 py-1 rounded-lg text-center ${activeView === 'twitter' ? 'bg-white dark:bg-slate-700 shadow-xs' : ''}`}
            >
              Twitter
            </button>
          </div>

          <div
            className={`grid gap-6 ${
              activeView === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'
            }`}
          >
            {/* ---------------------------------------------------- */}
            {/* FACEBOOK CARD MOCK-UP                                */}
            {/* ---------------------------------------------------- */}
            {(activeView === 'both' || activeView === 'facebook') && (
              <div
                id="mockup-facebook-card"
                data-testid="mockup-facebook-card"
                className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-slate-900"
              >
                {/* Platform Label Bar */}
                <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#1877F2]" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-xs font-bold text-blue-900">Facebook News Feed Share</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                    og:image & og:url
                  </span>
                </div>

                {/* Facebook Post Author Header */}
                <div className="p-3.5 flex items-center gap-2.5 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    {displayAuthor.charAt(0) || 'F'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 truncate">{displayAuthor}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>1 hr</span>
                      <span>·</span>
                      <span title="Public">🌐</span>
                    </div>
                  </div>
                  <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Body Caption */}
                <div className="px-3.5 pt-3 pb-2 text-xs text-slate-800 leading-relaxed">
                  Excited to introduce our newly designed responsive web presence! Check it out below:
                </div>

                {/* Open Graph Rich Link Card Preview */}
                <div className="border-t border-b border-slate-200 bg-slate-100 overflow-hidden cursor-pointer group">
                  {/* OG Image Container */}
                  <div className="aspect-[1.91/1] w-full bg-slate-200 relative overflow-hidden flex items-center justify-center">
                    {!isImgError ? (
                      <img
                        src={displayOgImage}
                        alt="Facebook OpenGraph preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                        onError={() => setIsImgError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                        <ImageIcon className="w-10 h-10 mb-1.5 text-slate-400" />
                        <span className="text-xs font-medium">Image could not load</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Verify OG Image URL</span>
                      </div>
                    )}
                  </div>

                  {/* OG Text Content */}
                  <div className="p-3 bg-[#F0F2F5] border-t border-slate-200">
                    <div className="text-[11px] uppercase font-bold text-[#65676B] tracking-wider truncate">
                      {cleanDomain}
                    </div>
                    <h4 className="text-[15px] font-bold text-[#050505] leading-snug mt-1 line-clamp-2">
                      {displayTitle}
                    </h4>
                    <p className="text-[12px] text-[#65676B] line-clamp-2 mt-1 leading-relaxed">
                      {displayDesc}
                    </p>
                  </div>
                </div>

                {/* Facebook Engagement Bar */}
                <div className="px-4 py-2.5 flex items-center justify-around text-xs font-semibold text-slate-500 border-t border-slate-100 bg-slate-50/50">
                  <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> Like
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" /> Comment
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </span>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* TWITTER / X CARD MOCK-UP                             */}
            {/* ---------------------------------------------------- */}
            {(activeView === 'both' || activeView === 'twitter') && (
              <div
                id="mockup-twitter-card"
                data-testid="mockup-twitter-card"
                className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-slate-900"
              >
                {/* Platform Label Bar */}
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-black" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-900">Twitter (X) Large Summary Card</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    summary_large_image
                  </span>
                </div>

                {/* Simulated Tweet Content */}
                <div className="p-4 space-y-3">
                  {/* Tweet Author Row */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {displayAuthor.charAt(0) || 'X'}
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {displayAuthor}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {cleanTwitterHandle ? `@${cleanTwitterHandle}` : `@${cleanDomain.split('.')[0]}`}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-[11px] text-slate-500">Just now</span>
                      </div>
                      <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                        Discover what we've been crafting. Explore the live site below:
                      </p>
                    </div>
                  </div>

                  {/* Twitter Summary Card with Large Image */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs cursor-pointer group">
                    <div className="aspect-[1.91/1] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {!isImgError ? (
                        <img
                          src={displayOgImage}
                          alt="Twitter summary large preview"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          onError={() => setIsImgError(true)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                          <ImageIcon className="w-10 h-10 mb-1.5 text-slate-400" />
                          <span className="text-xs font-medium">Image unavailable</span>
                        </div>
                      )}

                      {/* Domain Badge */}
                      <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <LinkIcon className="w-2.5 h-2.5" />
                        <span>{cleanDomain}</span>
                      </div>
                    </div>

                    {/* Card Text Content */}
                    <div className="p-3.5 space-y-1">
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {cleanDomain}
                      </div>
                      <h4 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-1">
                        {displayTitle}
                      </h4>
                      <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed">
                        {displayDesc}
                      </p>
                    </div>
                  </div>

                  {/* Tweet Interactions */}
                  <div className="flex items-center justify-between text-slate-400 px-3 pt-1 text-xs">
                    <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>24</span>
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer">
                      <Repeat2 className="w-3.5 h-3.5" />
                      <span>18</span>
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer">
                      <Heart className="w-3.5 h-3.5" />
                      <span>96</span>
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                      <Bookmark className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips and Verification card */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 dark:text-slate-100">
                Open Graph & Social Media Best Practices
              </h5>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                • <strong>OG Image aspect ratio:</strong> Facebook and Twitter recommend <strong>1200 × 630 px</strong> (1.91:1 ratio) with focal content centered.<br />
                • <strong>Canonical URL:</strong> Ensures social crawlers and search indexers attribute all likes, shares, and SEO rankings to your primary production domain.<br />
                • <strong>Twitter handles:</strong> Prepend with <code className="text-[10px] font-mono">@</code> for automatic attribution to your official account.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Preview updates automatically whenever you modify title, description, OG image, or canonical URL.
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs'
            }`}
          >
            Done Previewing
          </button>
        </div>
      </div>
    </div>
  );
};
