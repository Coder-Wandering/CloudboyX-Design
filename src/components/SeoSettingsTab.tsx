import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Link,
  Image as ImageIcon,
  AtSign,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Eye,
  Info,
  CheckCircle2,
  FileCode,
  Layers,
  Smile,
  ShieldCheck,
  Download,
  FileJson,
  Share2,
  Upload,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';
import { SeoSettings, DEFAULT_SEO_SETTINGS, BlockInstance } from '../types';
import { SeoVisualMockup } from './SeoVisualMockup';
import { SocialMediaCardPreviewModal } from './SocialMediaCardPreviewModal';
import { SeoAuditSection } from './SeoAuditSection';

export interface SeoSettingsTabProps {
  seoSettings: SeoSettings;
  onUpdateSeoSettings: (settings: SeoSettings) => void;
  projectTitle: string;
  onUpdateProjectTitle?: (title: string) => void;
  themeMode?: 'light' | 'dark';
  showToast?: (toast: { title: string; description?: string }) => void;
  blocks?: BlockInstance[];
  onUpdateContent?: (blockId: string, content: Partial<BlockInstance['content']>) => void;
  onSelectBlock?: (blockId: string) => void;
  onAddBlock?: (blockType: string) => void;
}

const OG_IMAGE_PRESETS = [
  {
    label: 'Tech & SaaS',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80',
  },
  {
    label: 'Creative Studio',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=80',
  },
  {
    label: 'Corporate',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80',
  },
  {
    label: 'Minimalist',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&h=630&q=80',
  },
];

const FAVICON_PRESETS = [
  {
    id: 'bs-default',
    name: 'Bootstrap B',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    url: 'https://api.iconify.design/lucide:rocket.svg?color=%230d6efd',
  },
  {
    id: 'zap',
    name: 'Lightning',
    url: 'https://api.iconify.design/lucide:zap.svg?color=%23f59e0b',
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    url: 'https://api.iconify.design/lucide:sparkles.svg?color=%238b5cf6',
  },
  {
    id: 'globe',
    name: 'Globe',
    url: 'https://api.iconify.design/lucide:globe.svg?color=%2310b981',
  },
  {
    id: 'shield',
    name: 'Shield',
    url: 'https://api.iconify.design/lucide:shield-check.svg?color=%230ea5e9',
  },
  {
    id: 'code',
    name: 'Terminal',
    url: 'https://api.iconify.design/lucide:code-2.svg?color=%233b82f6',
  },
  {
    id: 'star',
    name: 'Star',
    url: 'https://api.iconify.design/lucide:star.svg?color=%23eab308',
  },
];

export const SeoSettingsTab: React.FC<SeoSettingsTabProps> = ({
  seoSettings,
  onUpdateSeoSettings,
  projectTitle,
  onUpdateProjectTitle,
  themeMode = 'light',
  showToast,
  blocks = [],
  onUpdateContent,
  onSelectBlock,
  onAddBlock,
}) => {
  const isDark = themeMode === 'dark';

  // Internal form fields state synced with parent seoSettings
  const [canonicalUrl, setCanonicalUrl] = useState(seoSettings.canonicalUrl || '');
  const [ogImageUrl, setOgImageUrl] = useState(seoSettings.ogImageUrl || '');
  const [twitterHandle, setTwitterHandle] = useState(seoSettings.twitterHandle || '');
  const [title, setTitle] = useState(seoSettings.title || projectTitle || '');
  const [description, setDescription] = useState(seoSettings.description || '');
  const [faviconUrl, setFaviconUrl] = useState(seoSettings.faviconUrl || '');
  const [author, setAuthor] = useState(seoSettings.author || '');

  const [copiedCode, setCopiedCode] = useState(false);
  const [showPreviewMockup, setShowPreviewMockup] = useState(true);
  const [isPreviewSocialCardsModalOpen, setIsPreviewSocialCardsModalOpen] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const [isFaviconError, setIsFaviconError] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconFileUpload = (file: File) => {
    if (!file) return;
    const isImage =
      file.type.startsWith('image/') ||
      file.name.endsWith('.ico') ||
      file.name.endsWith('.svg') ||
      file.name.endsWith('.png') ||
      file.name.endsWith('.webp');

    if (!isImage) {
      if (showToast) {
        showToast({
          title: 'Invalid Image File',
          description: 'Please upload an image file (ICO, SVG, PNG, WebP, or JPG) for your favicon.',
        });
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        updateSetting('faviconUrl', dataUri);
        setIsFaviconError(false);
        if (showToast) {
          showToast({
            title: 'Custom Favicon Uploaded',
            description: `"${file.name}" is now set as the site browser tab favicon.`,
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Keep internal fields in sync with incoming seoSettings updates
  useEffect(() => {
    setCanonicalUrl(seoSettings.canonicalUrl || '');
    setOgImageUrl(seoSettings.ogImageUrl || '');
    setTwitterHandle(seoSettings.twitterHandle || '');
    setTitle(seoSettings.title || projectTitle || '');
    setDescription(seoSettings.description || '');
    setFaviconUrl(seoSettings.faviconUrl || '');
    setAuthor(seoSettings.author || '');
  }, [seoSettings, projectTitle]);

  const updateSetting = (key: keyof SeoSettings, value: string) => {
    const updated: SeoSettings = {
      ...seoSettings,
      [key]: value,
    };

    if (key === 'canonicalUrl') setCanonicalUrl(value);
    if (key === 'ogImageUrl') {
      setOgImageUrl(value);
      setIsImgError(false);
    }
    if (key === 'twitterHandle') setTwitterHandle(value);
    if (key === 'title') {
      setTitle(value);
      if (onUpdateProjectTitle && value.trim()) {
        onUpdateProjectTitle(value.trim());
      }
    }
    if (key === 'description') setDescription(value);
    if (key === 'faviconUrl') setFaviconUrl(value);
    if (key === 'author') setAuthor(value);

    onUpdateSeoSettings(updated);
  };

  const handleUseCurrentOrigin = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin + window.location.pathname;
      updateSetting('canonicalUrl', origin);
      if (showToast) {
        showToast({
          title: 'Canonical URL Updated',
          description: `Set canonical URL to current window origin.`,
        });
      }
    }
  };

  const handleResetDefaults = () => {
    const reset = {
      ...DEFAULT_SEO_SETTINGS,
      title: projectTitle,
    };
    onUpdateSeoSettings(reset);
    if (showToast) {
      showToast({
        title: 'SEO Settings Reset',
        description: 'Restored default search and social metadata values.',
      });
    }
  };

  const cleanHandle = twitterHandle.replace(/^@/, '');
  const displayTitle = title.trim() || projectTitle || 'My Bootstrap 5 Website';
  const displayDescription =
    description.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Modern, responsive, and mobile-first website.';
  const displayOgImage =
    ogImageUrl.trim() ||
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';

  const generatedHeadSnippet = `<!-- Primary Meta Tags -->
<title>${displayTitle}</title>
<meta name="title" content="${displayTitle}">
<meta name="description" content="${displayDescription}">
${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">\n` : ''}<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:title" content="${displayTitle}">
<meta property="og:description" content="${displayDescription}">
<meta property="og:image" content="${displayOgImage}">
${canonicalUrl ? `<meta property="og:url" content="${canonicalUrl}">\n` : ''}<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${displayTitle}">
<meta name="twitter:description" content="${displayDescription}">
<meta name="twitter:image" content="${displayOgImage}">
${cleanHandle ? `<meta name="twitter:site" content="@${cleanHandle}">\n<meta name="twitter:creator" content="@${cleanHandle}">` : ''}`;

  const handleCopyHead = async () => {
    try {
      await navigator.clipboard.writeText(generatedHeadSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      if (showToast) {
        showToast({
          title: 'Meta Tags Copied',
          description: 'Copied HTML <head> metadata snippet to clipboard.',
        });
      }
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleExportSeoMetadata = () => {
    const cleanTwHandle = (twitterHandle || '').replace(/^@/, '').trim();
    const formattedTwHandle = cleanTwHandle ? `@${cleanTwHandle}` : '';

    const metadataPayload = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      projectTitle: displayTitle,
      canonicalUrl: canonicalUrl.trim(),
      openGraph: {
        title: displayTitle,
        description: displayDescription,
        imageUrl: displayOgImage,
        canonicalUrl: canonicalUrl.trim(),
        type: 'website',
        locale: 'en_US',
        siteName: displayTitle,
      },
      socialMedia: {
        twitterHandle: formattedTwHandle,
        twitterUsername: cleanTwHandle,
        twitterSite: formattedTwHandle,
        twitterCreator: formattedTwHandle,
      },
      twitterCard: {
        card: 'summary_large_image',
        site: formattedTwHandle,
        creator: formattedTwHandle,
        title: displayTitle,
        description: displayDescription,
        image: displayOgImage,
      },
      searchEngineSettings: {
        title: displayTitle,
        description: displayDescription,
        canonicalUrl: canonicalUrl.trim(),
        author: author.trim() || undefined,
        faviconUrl: faviconUrl.trim() || undefined,
        robots: 'index, follow',
      },
      htmlSnippet: generatedHeadSnippet,
    };

    const jsonString = JSON.stringify(metadataPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (projectTitle || 'site')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'site';
    link.href = url;
    link.download = `${safeName}-seo-metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) {
      showToast({
        title: 'SEO Metadata Exported',
        description: `Downloaded ${link.download} with canonical URL, social handles, and OG image settings.`,
      });
    }
  };

  return (
    <div
      id="seo-settings-tab-panel"
      data-testid="seo-settings-tab-panel"
      className={`p-4 space-y-5 text-xs transition-colors duration-200 ${
        isDark ? 'text-slate-100' : 'text-slate-800'
      }`}
    >
      {/* Top Banner / Info Card */}
      <div
        className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
          isDark
            ? 'bg-slate-900/60 border-slate-800 text-slate-300'
            : 'bg-blue-50/70 border-blue-100 text-blue-900'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs leading-snug">SEO & Social Meta Configuration</h3>
            <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
              Configure search engine indexing, Open Graph cards, and Twitter summary previews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            id="btn-preview-social-cards-top"
            data-testid="btn-preview-social-cards-top"
            onClick={() => setIsPreviewSocialCardsModalOpen(true)}
            className={`p-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-indigo-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-indigo-700 shadow-2xs'
            }`}
            title="Preview Social Media Cards (Facebook & Twitter)"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Preview Cards</span>
          </button>

          <button
            type="button"
            id="btn-export-seo-metadata-top"
            data-testid="btn-export-seo-metadata-top"
            onClick={handleExportSeoMetadata}
            className={`p-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
              isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
            }`}
            title="Export SEO Metadata JSON"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHead}
            className={`p-1.5 rounded-lg border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${
              copiedCode
                ? 'bg-emerald-600 text-white border-emerald-600'
                : isDark
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
            }`}
            title="Copy HTML head tags"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED SEO AUDIT SECTION (Analyzes blocks for meta tags, accessibility & hierarchy) */}
      <SeoAuditSection
        blocks={blocks}
        seoSettings={seoSettings}
        projectTitle={projectTitle}
        onUpdateSeoSettings={onUpdateSeoSettings}
        onUpdateProjectTitle={onUpdateProjectTitle}
        onUpdateContent={onUpdateContent}
        onSelectBlock={onSelectBlock}
        onAddBlock={onAddBlock}
        themeMode={themeMode}
        showToast={showToast}
      />

      {/* SECTION 1: PRIMARY SEO FIELDS */}
      <div className="space-y-4">
        {/* Field 1: Canonical URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-seo-canonical-url"
              className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
            >
              <Link className="w-3.5 h-3.5 text-blue-500" />
              <span>Canonical URL</span>
            </label>
            <button
              type="button"
              onClick={handleUseCurrentOrigin}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              Use Current Origin
            </button>
          </div>
          <div className="relative">
            <input
              type="url"
              id="input-seo-canonical-url"
              data-testid="seo-canonical-url"
              value={canonicalUrl}
              onChange={(e) => updateSetting('canonicalUrl', e.target.value)}
              placeholder="https://mywebsite.com"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Preferred URL for search engines (<code className="text-[10px]">&lt;link rel="canonical"&gt;</code>) to avoid duplicate content penalties.
          </p>
        </div>

        {/* Field 2: Open Graph Image URL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-seo-og-image-url"
              className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-500" />
              <span>Open Graph Image URL</span>
            </label>
            <span className="text-[10px] text-slate-400">1200 × 630 px</span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              id="input-seo-og-image-url"
              data-testid="seo-og-image-url"
              value={ogImageUrl}
              onChange={(e) => updateSetting('ogImageUrl', e.target.value)}
              placeholder="https://example.com/og-banner.jpg"
              className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
              }`}
            />
            {ogImageUrl && (
              <button
                type="button"
                onClick={() => updateSetting('ogImageUrl', '')}
                className={`px-2.5 py-1 text-xs rounded-xl border transition cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Cover Image Presets */}
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Cover Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {OG_IMAGE_PRESETS.map((preset, idx) => {
                const isSelected = ogImageUrl === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateSetting('ogImageUrl', preset.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition cursor-pointer text-[11px] ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/15 text-purple-600 dark:text-purple-300 font-semibold'
                        : isDark
                        ? 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-300'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-5 h-5 rounded object-cover shrink-0"
                    />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field 3: Twitter Handle */}
        <div className="space-y-1.5">
          <label
            htmlFor="input-seo-twitter-handle"
            className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200"
          >
            <AtSign className="w-3.5 h-3.5 text-sky-500" />
            <span>Twitter Handle</span>
          </label>
          <div className="relative flex items-center">
            <span
              className={`absolute left-3 font-mono font-bold select-none ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              @
            </span>
            <input
              type="text"
              id="input-seo-twitter-handle"
              data-testid="seo-twitter-handle"
              value={cleanHandle}
              onChange={(e) => {
                const val = e.target.value.replace(/^@/, '').trim();
                updateSetting('twitterHandle', val ? `@${val}` : '');
              }}
              placeholder="username or brand"
              className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Account handle used for <code className="text-[10px]">twitter:site</code> and <code className="text-[10px]">twitter:creator</code> card tags.
          </p>
        </div>

        {/* Action: Preview Social Media Cards Card */}
        <div className="p-3.5 rounded-xl border border-indigo-200/90 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/80 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950 dark:text-indigo-200">
              <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Social Media Share Mock-Up</span>
            </div>
            <p className="text-[11px] text-indigo-900/75 dark:text-indigo-300/75 leading-relaxed">
              Verify how your configured Canonical URL and Open Graph Image render when shared on Facebook and Twitter.
            </p>
          </div>
          <button
            type="button"
            id="btn-preview-social-cards"
            data-testid="btn-preview-social-cards"
            onClick={() => setIsPreviewSocialCardsModalOpen(true)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs shrink-0"
            title="Preview how this page looks when shared on Facebook and Twitter"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Social Media Cards</span>
          </button>
        </div>

        {/* Field 4: Page Title */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-seo-title"
              className="font-bold text-slate-800 dark:text-slate-200"
            >
              Page Title (&lt;title&gt;)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateSetting('title', projectTitle)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
              >
                Use Project Name
              </button>
              <span
                className={`font-mono text-[10px] ${
                  title.length > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'
                }`}
              >
                {title.length}/60
              </span>
            </div>
          </div>
          <input
            type="text"
            id="input-seo-title"
            data-testid="seo-title"
            value={title}
            onChange={(e) => updateSetting('title', e.target.value)}
            placeholder="e.g. Acme Cloud — Fast, Modern Workspaces"
            className={`w-full px-3 py-2 rounded-xl border text-xs transition focus:outline-hidden ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
            }`}
          />
        </div>

        {/* Field 5: Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="input-seo-description"
              className="font-bold text-slate-800 dark:text-slate-200"
            >
              Meta Description
            </label>
            <span
              className={`font-mono text-[10px] ${
                description.length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              {description.length}/160
            </span>
          </div>
          <textarea
            id="input-seo-description"
            data-testid="seo-description"
            rows={3}
            value={description}
            onChange={(e) => updateSetting('description', e.target.value)}
            placeholder="Compelling description summarizing the core value and entices click-throughs..."
            className={`w-full px-3 py-2 rounded-xl border text-xs resize-none transition focus:outline-hidden ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
            }`}
          />
        </div>

        {/* Field 6: Website Favicon & Browser Tab Branding */}
        <div
          className={`p-3.5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          {/* Hidden File Input */}
          <input
            ref={faviconFileInputRef}
            type="file"
            accept="image/*,.ico,.svg,.png,.webp,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFaviconFileUpload(file);
              e.target.value = '';
            }}
          />

          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Favicon & Browser Tab Icon
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Square (32×32 or SVG)</span>
          </div>

          {/* Upload Dropzone & Live Preview */}
          <div className="flex items-center gap-3">
            {/* Favicon Visual Thumbnail */}
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center p-2 relative shrink-0 shadow-2xs ${
                isDark ? 'bg-slate-900 border-slate-700/80' : 'bg-white border-slate-200'
              }`}
            >
              {faviconUrl && !isFaviconError ? (
                <img
                  src={faviconUrl}
                  alt="Site Favicon"
                  className="w-full h-full object-contain"
                  onError={() => setIsFaviconError(true)}
                />
              ) : (
                <Globe className="w-6 h-6 text-slate-400" />
              )}
            </div>

            {/* Upload Buttons & Status */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-upload-custom-favicon"
                  data-testid="btn-upload-custom-favicon"
                  onClick={() => faviconFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Favicon</span>
                </button>

                {faviconUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateSetting('faviconUrl', '');
                      setIsFaviconError(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-xl border transition cursor-pointer flex items-center gap-1 ${
                      isDark
                        ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                Supports ICO, SVG, PNG, WebP, or JPG. Files are stored and rendered directly.
              </p>
            </div>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Or Use External Favicon URL
            </label>
            <input
              type="url"
              id="input-seo-favicon-url"
              data-testid="seo-favicon-url"
              value={faviconUrl.startsWith('data:') ? 'Custom uploaded icon file (embedded data URI)' : faviconUrl}
              onChange={(e) => {
                updateSetting('faviconUrl', e.target.value);
                setIsFaviconError(false);
              }}
              placeholder="https://.../favicon.svg"
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono transition focus:outline-hidden ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Live Mini Browser Tab Preview */}
          <div className="pt-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Live Browser Tab Simulation
            </span>
            <div
              className={`rounded-t-lg px-3 py-1.5 flex items-center gap-2 border text-xs shadow-2xs max-w-sm ${
                isDark
                  ? 'bg-slate-900 border-slate-700/80 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center overflow-hidden">
                {faviconUrl && !isFaviconError ? (
                  <img
                    src={faviconUrl}
                    alt="Tab Favicon"
                    className="w-3.5 h-3.5 object-contain"
                  />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                )}
              </div>
              <span className="truncate font-medium text-[11px] flex-1">
                {displayTitle}
              </span>
              <X className="w-3 h-3 opacity-40 shrink-0" />
            </div>
          </div>

          {/* Quick Favicon Presets */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              1-Click Icon Presets
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {FAVICON_PRESETS.map((preset) => {
                const isSelected = faviconUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      updateSetting('faviconUrl', preset.url);
                      setIsFaviconError(false);
                    }}
                    title={preset.name}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 ring-1 ring-blue-500'
                        : isDark
                        ? 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="text-[9px] truncate w-full text-center mt-1 text-slate-500 dark:text-slate-400">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field 7: Author / Brand */}
        <div className="space-y-1.5 pt-1">
          <label
            htmlFor="input-seo-author"
            className="font-bold text-slate-800 dark:text-slate-200 text-xs block"
          >
            Author / Brand Landmark
          </label>
          <input
            type="text"
            id="input-seo-author"
            data-testid="seo-author"
            value={author}
            onChange={(e) => updateSetting('author', e.target.value)}
            placeholder="e.g. CloudboyX Studio"
            className={`w-full px-3 py-2 rounded-xl border text-xs transition focus:outline-hidden ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-blue-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-blue-500'
            }`}
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Written into <code className="text-[10px]">&lt;meta name="author"&gt;</code> and article snippets.
          </p>
        </div>
      </div>

      {/* SECTION 2: LIVE SOCIAL & SEARCH CARD PREVIEWS */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Social & Search Card Previews</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-preview-social-cards-section"
              data-testid="btn-preview-social-cards-section"
              onClick={() => setIsPreviewSocialCardsModalOpen(true)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3 h-3" />
              <span>Full Preview</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setShowPreviewMockup((prev) => !prev)}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
            >
              {showPreviewMockup ? 'Hide Mockup' : 'Show Mockup'}
            </button>
          </div>
        </div>

        {showPreviewMockup && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <SeoVisualMockup
              title={displayTitle}
              description={displayDescription}
              url={canonicalUrl}
              faviconUrl={faviconUrl}
              ogImageUrl={displayOgImage}
              author={author || projectTitle}
              twitterHandle={twitterHandle}
              defaultMockup="twitter"
              className="text-xs"
            />
          </div>
        )}
      </div>

      {/* SECTION 3: FOOTER ACTIONS */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleResetDefaults}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Preview Social Media Cards Button */}
          <button
            type="button"
            id="btn-preview-social-cards-footer"
            data-testid="btn-preview-social-cards-footer"
            onClick={() => setIsPreviewSocialCardsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-indigo-700/60 hover:bg-slate-800 text-indigo-300'
                : 'bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-700 shadow-2xs'
            }`}
            title="Preview how this page looks when shared on Facebook and Twitter"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Preview Social Cards</span>
          </button>

          {/* Export SEO Metadata Button */}
          <button
            type="button"
            id="btn-export-seo-metadata"
            data-testid="btn-export-seo-metadata"
            onClick={handleExportSeoMetadata}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-cyan-300'
                : 'bg-white border-slate-300 hover:bg-slate-50 text-blue-700 shadow-2xs'
            }`}
            title="Export SEO metadata as JSON file"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Export SEO Metadata</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-2xs"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied HTML!' : 'Copy <head>'}</span>
          </button>
        </div>
      </div>

      {/* Social Media Card Preview Modal */}
      <SocialMediaCardPreviewModal
        isOpen={isPreviewSocialCardsModalOpen}
        onClose={() => setIsPreviewSocialCardsModalOpen(false)}
        title={displayTitle}
        description={displayDescription}
        canonicalUrl={canonicalUrl}
        ogImageUrl={displayOgImage}
        twitterHandle={twitterHandle}
        author={author || projectTitle}
        themeMode={themeMode}
        showToast={showToast}
      />
    </div>
  );
};
