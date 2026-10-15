import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Check,
  Download,
  Copy,
  RefreshCw,
  Eye,
  Sliders,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import {
  AI_OG_STYLE_PRESETS,
  PREGENERATED_AI_OG_PRESETS,
  generateClientOgImage,
  OgImageGeneratorOptions,
} from '../utils/aiImageGenerator';

interface AiOgImageGeneratorCardProps {
  siteTitle: string;
  siteDescription?: string;
  currentOgImageUrl: string;
  onApplyOgImage: (imageUrl: string) => void;
  author?: string;
}

export const AiOgImageGeneratorCard: React.FC<AiOgImageGeneratorCardProps> = ({
  siteTitle,
  siteDescription = '',
  currentOgImageUrl,
  onApplyOgImage,
  author = '',
}) => {
  const [selectedStyle, setSelectedStyle] = useState<OgImageGeneratorOptions['style']>('saas-tech');
  const [customTitle, setCustomTitle] = useState(siteTitle || 'Modern Web Project');
  const [badgeText, setBadgeText] = useState('OFFICIAL LAUNCH');
  const [categoryTag, setCategoryTag] = useState('Bootstrap 5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'generate' | 'pregenerated'>('generate');

  // Keep custom title updated when siteTitle changes if unmodified
  React.useEffect(() => {
    if (siteTitle && (!customTitle || customTitle === 'Modern Web Project')) {
      setCustomTitle(siteTitle);
    }
  }, [siteTitle]);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setAppliedSuccess(false);
    try {
      // Simulate micro-delay for realistic AI synthesis experience
      await new Promise((r) => setTimeout(r, 450));
      const dataUrl = await generateClientOgImage({
        title: customTitle || siteTitle || 'Modern Web Project',
        description: siteDescription,
        style: selectedStyle,
        author: author || 'CloudboyX Studio',
        category: categoryTag,
        badgeText,
      });
      setGeneratedPreview(dataUrl);
    } catch (err) {
      console.error('Failed to generate AI OG Image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (url?: string) => {
    const targetUrl = url || generatedPreview;
    if (targetUrl) {
      onApplyOgImage(targetUrl);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2400);
    }
  };

  const handleDownload = () => {
    if (!generatedPreview) return;
    const a = document.createElement('a');
    a.href = generatedPreview;
    a.download = `${(customTitle || 'social-share')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')}-og-image.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async (url?: string) => {
    const targetUrl = url || generatedPreview;
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      id="ai-og-image-generator-panel"
      className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">
                AI Social Share (Open Graph) Generator
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Generate 1200×630 social banners for Twitter & LinkedIn tailored to your site title
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1 bg-white/90 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('generate')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
              activeSubTab === 'generate'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom AI Synthesis
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('pregenerated')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
              activeSubTab === 'pregenerated'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Studio AI Showcase
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CUSTOM AI SYNTHESIS */}
      {activeSubTab === 'generate' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Title override */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Banner Headline (Site Title)
                </label>
                {siteTitle && customTitle !== siteTitle && (
                  <button
                    type="button"
                    onClick={() => setCustomTitle(siteTitle)}
                    className="text-[10px] text-indigo-600 hover:underline"
                  >
                    Reset to site title
                  </button>
                )}
              </div>
              <input
                type="text"
                id="ai-og-title-input"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Site Title for Social Banner"
                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
              />
            </div>

            {/* Badge & Category */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. OFFICIAL"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                  placeholder="e.g. SaaS / Platform"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Art Style Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Select AI Visual Theme & Aesthetic
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_OG_STYLE_PRESETS.map((preset) => {
                const isSelected = selectedStyle === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedStyle(preset.id)}
                    className={`text-left p-2 rounded-xl border text-xs transition relative cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-white ring-2 ring-indigo-100 shadow-2xs'
                        : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11px] truncate">
                        {preset.label}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${preset.previewGradient} shrink-0`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              id="btn-generate-ai-og"
              onClick={handleGenerateImage}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Banner...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Custom AI Image</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Banner Preview Canvas */}
          {generatedPreview && (
            <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-xl space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Generated AI Open Graph Image (1200 × 630)</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready to apply
                </span>
              </div>

              {/* Responsive Image Aspect Ratio Box */}
              <div className="relative aspect-[1.91/1] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
                <img
                  src={generatedPreview}
                  alt="Generated AI Open Graph preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApply()}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      appliedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                    }`}
                  >
                    {appliedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Applied to og:image!</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Set as Project Social Image</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Download PNG image"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy()}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSuccess ? 'Copied Data URL!' : 'Copy Data URL'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: STUDIO AI SHOWCASE PRESETS */}
      {activeSubTab === 'pregenerated' && (
        <div className="mt-4 space-y-3">
          <p className="text-[11px] text-slate-600">
            Curated high-resolution AI banners generated directly by Gemini for professional social sharing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREGENERATED_AI_OG_PRESETS.map((item) => {
              const isCurrent = currentOgImageUrl === item.url;
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl overflow-hidden transition ${
                    isCurrent ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-[1.91/1] bg-slate-900 relative overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                      {item.tag}
                    </span>
                  </div>

                  <div className="p-2.5 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onApplyOgImage(item.url)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {isCurrent ? 'Active' : 'Use Banner'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
