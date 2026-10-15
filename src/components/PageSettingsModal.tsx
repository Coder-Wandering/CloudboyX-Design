import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  Image as ImageIcon,
  Check,
  Copy,
  Sparkles,
  Search,
  Share2,
  RefreshCw,
  ExternalLink,
  Code2,
  HelpCircle,
  Tag,
  User,
  Link2,
  Smile,
  ShieldCheck,
  Zap,
  Rocket,
  Flame,
  Star,
  Compass,
  Laptop,
  Layers,
  FileText,
  Gauge,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import { BlockInstance, SeoSettings, DEFAULT_SEO_SETTINGS } from '../types';
import { ProjectDashboardPanel } from './ProjectDashboardPanel';
import { calculateProjectAnalytics } from '../utils/projectAnalytics';
import { GoogleSearchPreviewCard } from './GoogleSearchPreviewCard';
import { SeoVisualMockup } from './SeoVisualMockup';
import { SocialMediaCardPreviewModal } from './SocialMediaCardPreviewModal';

interface PageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seoSettings: SeoSettings;
  onSave: (settings: SeoSettings) => void;
  projectTitle: string;
  isEmbedded?: boolean;
  initialTab?: 'dashboard' | 'seo' | 'favicon' | 'preview' | 'code';
  blocks?: BlockInstance[];
  onSelectBlock?: (blockId: string) => void;
}

// Curated Open Graph cover presets
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
    label: 'Corporate & Business',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80',
  },
  {
    label: 'Minimalist Clean',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&h=630&q=80',
  },
];

// Curated Favicon presets for instant branding
const FAVICON_PRESETS = [
  {
    id: 'bs-default',
    name: 'Bootstrap B',
    url: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg',
    category: 'Brand',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    url: 'https://api.iconify.design/lucide:rocket.svg?color=%230d6efd',
    category: 'Startup',
  },
  {
    id: 'zap',
    name: 'Lightning',
    url: 'https://api.iconify.design/lucide:zap.svg?color=%23f59e0b',
    category: 'Energy',
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    url: 'https://api.iconify.design/lucide:sparkles.svg?color=%238b5cf6',
    category: 'Creative',
  },
  {
    id: 'globe',
    name: 'Globe',
    url: 'https://api.iconify.design/lucide:globe.svg?color=%2310b981',
    category: 'Global',
  },
  {
    id: 'shield',
    name: 'Shield',
    url: 'https://api.iconify.design/lucide:shield-check.svg?color=%230ea5e9',
    category: 'Security',
  },
  {
    id: 'code',
    name: 'Terminal',
    url: 'https://api.iconify.design/lucide:code-2.svg?color=%233b82f6',
    category: 'Developer',
  },
  {
    id: 'star',
    name: 'Star',
    url: 'https://api.iconify.design/lucide:star.svg?color=%23eab308',
    category: 'Rating',
  },
];

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({
  isOpen,
  onClose,
  seoSettings,
  onSave,
  projectTitle,
  isEmbedded = false,
  initialTab,
  blocks = [],
  onSelectBlock,
}) => {
  const [formData, setFormData] = useState<SeoSettings>(seoSettings);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'seo' | 'favicon' | 'preview' | 'code'>(
    initialTab || (isEmbedded ? 'seo' : 'dashboard')
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSocialPreviewOpen, setIsSocialPreviewOpen] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const [isFaviconError, setIsFaviconError] = useState(false);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconFileUpload = (file: File) => {
    if (!file) return;
    const isImage =
      file.type.startsWith('image/') ||
      file.name.endsWith('.ico') ||
      file.name.endsWith('.svg') ||
      file.name.endsWith('.png') ||
      file.name.endsWith('.webp');

    if (!isImage) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        setFormData((prev) => ({ ...prev, faviconUrl: dataUri }));
        setIsFaviconError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const quickAnalytics = calculateProjectAnalytics(blocks, formData);

  useEffect(() => {
    setFormData({
      ...seoSettings,
      title: seoSettings.title || projectTitle || '',
    });
    setIsImgError(false);
    setIsFaviconError(false);
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [seoSettings, projectTitle, isOpen, initialTab]);

  if (!isOpen) return null;

  const displayTitle = formData.title.trim() || projectTitle || 'My Bootstrap 5 Website';
  const displayDescription =
    formData.description.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Modern, responsive, and mobile-first website.';
  const displayOgImage =
    formData.ogImageUrl.trim() ||
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';
  const displayFavicon =
    formData.faviconUrl.trim() ||
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg';

  const handleApply = () => {
    onSave(formData);
    onClose();
  };

  const handleResetToDefaults = () => {
    setFormData({
      ...DEFAULT_SEO_SETTINGS,
      title: projectTitle,
    });
    setIsImgError(false);
    setIsFaviconError(false);
  };

  // Generate clean <head> snippet for preview and copying
  const generatedHeadHtml = `<!-- Primary Meta Tags -->
<title>${displayTitle}</title>
<meta name="title" content="${displayTitle}">
<meta name="description" content="${displayDescription}">
${formData.keywords ? `<meta name="keywords" content="${formData.keywords}">\n` : ''}${
    formData.author ? `<meta name="author" content="${formData.author}">\n` : ''
  }${formData.canonicalUrl ? `<link rel="canonical" href="${formData.canonicalUrl}">\n` : ''}
<!-- Favicon / Branding -->
<link rel="icon" type="image/x-icon" href="${displayFavicon}">
<link rel="apple-touch-icon" href="${displayFavicon}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:title" content="${displayTitle}">
<meta property="og:description" content="${displayDescription}">
<meta property="og:image" content="${displayOgImage}">
${formData.canonicalUrl ? `<meta property="og:url" content="${formData.canonicalUrl}">\n` : ''}
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${displayTitle}">
<meta name="twitter:description" content="${displayDescription}">
<meta name="twitter:image" content="${displayOgImage}">
${formData.twitterHandle ? `<meta name="twitter:site" content="${formData.twitterHandle.startsWith('@') ? formData.twitterHandle : `@${formData.twitterHandle}`}">\n<meta name="twitter:creator" content="${formData.twitterHandle.startsWith('@') ? formData.twitterHandle : `@${formData.twitterHandle}`}">` : ''}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedHeadHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportSeoMetadata = () => {
    const cleanTwHandle = (formData.twitterHandle || '').replace(/^@/, '').trim();
    const formattedTwHandle = cleanTwHandle ? `@${cleanTwHandle}` : '';

    const metadataPayload = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      schemaVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      projectTitle: displayTitle,
      canonicalUrl: (formData.canonicalUrl || '').trim(),
      openGraph: {
        title: displayTitle,
        description: displayDescription,
        imageUrl: displayOgImage,
        canonicalUrl: (formData.canonicalUrl || '').trim(),
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
        canonicalUrl: (formData.canonicalUrl || '').trim(),
        author: (formData.author || '').trim() || undefined,
        faviconUrl: (formData.faviconUrl || '').trim() || undefined,
        robots: 'index, follow',
      },
      htmlSnippet: generatedHeadHtml,
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
  };

  if (!isOpen) return null;

  const contentMarkup = (
    <div className={`bg-white w-full flex flex-col text-slate-800 ${isEmbedded ? 'h-full' : 'max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden'}`}>
      {/* Header */}
      {!isEmbedded && (
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Page Settings & SEO</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Site Metadata
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage search engine ranking tags, social share cards, and custom browser favicon.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-4 sm:px-6 pt-3 border-b border-slate-200 flex items-center gap-2 bg-white overflow-x-auto no-scrollbar">
          <button
            id="tab-project-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Dashboard</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
              Live
            </span>
          </button>

          <button
            id="tab-seo-metadata"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO & Social Metadata</span>
          </button>

          <button
            id="tab-favicon-branding"
            onClick={() => setActiveTab('favicon')}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'favicon'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Favicon & Branding</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded-full font-bold">
              New
            </span>
          </button>

          <button
            id="tab-live-previews"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Live Previews</span>
          </button>

          <button
            id="tab-html-code"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 pb-2.5 px-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>&lt;head&gt; Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 0: PROJECT DASHBOARD SUMMARY */}
          {activeTab === 'dashboard' && (
            <ProjectDashboardPanel
              blocks={blocks}
              seoSettings={formData}
              projectTitle={displayTitle}
              onSelectBlock={onSelectBlock}
              onSwitchTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* TAB 1: SEO & Metadata */}
          {activeTab === 'seo' && (
            <div className="space-y-5">
              {/* High-level Project Summary Banner */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>{blocks.length} Blocks</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{quickAnalytics.totalWords.toLocaleString()} Words</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{quickAnalytics.performanceScore}% Score</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Open Full Dashboard</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {/* Page Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Page Title (&lt;title&gt;)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, title: projectTitle })}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      Use project name
                    </button>
                    <span
                      className={`text-[11px] font-mono ${
                        formData.title.length > 60
                          ? 'text-amber-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {formData.title.length}/60 chars
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  id="input-seo-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Nexus - Next Generation AI Cloud Workspace"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Optimal for search results is between 30 and 60 characters. Appears in search results and browser title.
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Meta Description</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.description.length > 160
                        ? 'text-amber-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {formData.description.length}/160 chars
                  </span>
                </div>
                <textarea
                  id="input-seo-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of your webpage that entices searchers to click through..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keep descriptions between 120 and 160 characters for maximum search snippet readability.
                </p>
              </div>

              {/* Visual Mock-up Feature: Google Search Snippet or Social Media Card */}
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Visual Search & Social Mock-Up</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="modal-btn-preview-social-cards-top"
                      data-testid="modal-btn-preview-social-cards-top"
                      onClick={() => setIsSocialPreviewOpen(true)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100"
                    >
                      <Share2 className="w-3 h-3 text-indigo-500" />
                      <span>Preview Social Media Cards</span>
                    </button>
                  </div>
                </div>
                <SeoVisualMockup
                  title={formData.title}
                  description={formData.description}
                  url={formData.canonicalUrl}
                  faviconUrl={formData.faviconUrl}
                  ogImageUrl={formData.ogImageUrl}
                  author={formData.author || projectTitle}
                  twitterHandle={formData.twitterHandle}
                  defaultMockup="google"
                />
              </div>

              {/* Open Graph Image URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>Open Graph Social Image URL (og:image)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">1200 × 630 px recommended</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="input-seo-og-image"
                    value={formData.ogImageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, ogImageUrl: e.target.value });
                      setIsImgError(false);
                    }}
                    placeholder="https://example.com/social-preview.jpg"
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                  {formData.ogImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, ogImageUrl: '' })}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Quick Cover Presets */}
                <div className="mt-2.5">
                  <span className="text-[11px] text-slate-400 font-medium">Or choose a preset cover:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
                    {OG_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, ogImageUrl: preset.url });
                          setIsImgError(false);
                        }}
                        className={`text-left p-1.5 rounded-lg border text-[11px] transition flex items-center gap-2 ${
                          formData.ogImageUrl === preset.url
                            ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-6 h-6 rounded object-cover shrink-0"
                        />
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Attributes Accordion */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Optional Technical Attributes</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.author || ''}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g., Acme Studio"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      id="modal-seo-canonical-url"
                      value={formData.canonicalUrl || ''}
                      onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                      placeholder="https://mywebsite.com"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Twitter Handle
                    </label>
                    <input
                      type="text"
                      id="modal-seo-twitter-handle"
                      value={formData.twitterHandle || ''}
                      onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                      placeholder="@username"
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Export & Preview SEO Action Card */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Preview social media cards or export complete site SEO configuration as a standardized JSON package.
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="modal-btn-preview-social-cards"
                    data-testid="modal-btn-preview-social-cards"
                    onClick={() => setIsSocialPreviewOpen(true)}
                    className="px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-400 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="Preview how page appears on Facebook and Twitter"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Preview Social Media Cards</span>
                  </button>

                  <button
                    type="button"
                    id="modal-btn-export-seo-metadata"
                    data-testid="modal-btn-export-seo-metadata"
                    onClick={handleExportSeoMetadata}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export SEO Metadata</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Favicon & Branding */}
          {activeTab === 'favicon' && (
            <div className="space-y-6">
              {/* Introduction Banner */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Smile className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Custom Favicon & Tab Branding</h4>
                  <p className="text-[11px] text-blue-800/80 leading-relaxed mt-0.5">
                    Your favicon appears in browser tabs, bookmarks, browser history, and search engine snippets. Set a custom image or SVG URL, or pick from our curated branding presets below.
                  </p>
                </div>
              </div>

              {/* Favicon URL Input & Live Indicator */}
              <div>
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

                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Favicon URL (ICO, SVG, or PNG)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Square ratio (32x32 or 64x64)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {!isFaviconError ? (
                      <img
                        src={displayFavicon}
                        alt="Favicon preview"
                        className="w-5 h-5 object-contain"
                        onError={() => setIsFaviconError(true)}
                      />
                    ) : (
                      <Globe className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <input
                    type="url"
                    id="input-seo-favicon-url"
                    value={formData.faviconUrl.startsWith('data:') ? 'Custom uploaded icon file (embedded data URI)' : formData.faviconUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, faviconUrl: e.target.value });
                      setIsFaviconError(false);
                    }}
                    placeholder="https://example.com/favicon.svg or .png"
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => faviconFileInputRef.current?.click()}
                    className="px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                    title="Upload custom image file as favicon"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  {formData.faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, faviconUrl: '' })}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Live Interactive Browser Tab Simulator */}
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Interactive Browser Tab Preview
                </span>
                <div className="bg-slate-200/90 rounded-xl p-2.5 pb-0 border border-slate-300 shadow-xs">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-slate-500 ml-2 font-medium">Google Chrome / Safari</span>
                  </div>

                  {/* Browser Tab Mockup */}
                  <div className="flex items-center">
                    <div className="bg-white rounded-t-lg px-3.5 py-2 flex items-center gap-2 border-t border-x border-slate-300 shadow-2xs max-w-xs">
                      <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center overflow-hidden">
                        {!isFaviconError ? (
                          <img
                            src={displayFavicon}
                            alt="Tab icon"
                            className="w-3.5 h-3.5 object-contain"
                          />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[180px]">
                        {displayTitle}
                      </span>
                      <X className="w-3 h-3 text-slate-400 hover:text-slate-600 ml-auto cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Favicon Presets Collection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    Quick Branding Presets (Vector SVGs)
                  </span>
                  <span className="text-[11px] text-slate-400">Click to apply instantly</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FAVICON_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      id={`preset-favicon-${preset.id}`}
                      onClick={() => {
                        setFormData({ ...formData, faviconUrl: preset.url });
                        setIsFaviconError(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition group ${
                        formData.faviconUrl === preset.url
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:scale-105 transition">
                        <img src={preset.url} alt={preset.name} className="w-4 h-4 object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 truncate">{preset.name}</p>
                        <p className="text-[10px] text-slate-400">{preset.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Previews */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Multi-Platform Live Previews</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Switch between search engine snippets and social platform link cards.
                  </p>
                </div>
              </div>

              <SeoVisualMockup
                title={formData.title}
                description={formData.description}
                url={formData.canonicalUrl}
                faviconUrl={formData.faviconUrl}
                ogImageUrl={formData.ogImageUrl}
                author={formData.author || projectTitle}
                defaultMockup="google"
                showTabs={true}
              />
            </div>
          )}

          {/* TAB 4: Head Code Viewer */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Ready-to-use &lt;head&gt; tags
                </span>
                <button
                  type="button"
                  id="btn-copy-head-code"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to clipboard!' : 'Copy markup'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
                {generatedHeadHtml}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            id="btn-reset-seo-settings"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            {!isEmbedded && (
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              id="btn-save-page-settings"
              onClick={handleApply}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Settings</span>
            </button>
          </div>
        </div>

        {/* Social Media Card Preview Modal */}
        <SocialMediaCardPreviewModal
          isOpen={isSocialPreviewOpen}
          onClose={() => setIsSocialPreviewOpen(false)}
          title={displayTitle}
          description={displayDescription}
          canonicalUrl={formData.canonicalUrl || ''}
          ogImageUrl={formData.ogImageUrl || ''}
          twitterHandle={formData.twitterHandle || ''}
          author={formData.author || projectTitle}
        />
      </div>
  );

  return isEmbedded ? (
    contentMarkup
  ) : (
    <div
      id="page-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
    >
      {contentMarkup}
    </div>
  );
};
