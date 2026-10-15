import React, { useState, useEffect, useMemo } from 'react';
import {
  Type,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  ExternalLink,
  Layers,
  ArrowRight,
  Search,
  Quote,
  Eye,
  CheckCircle2,
  Bookmark,
  Shuffle,
  Palette,
} from 'lucide-react';
import { SiteTheme } from '../types';
import { POPULAR_GOOGLE_FONTS, loadGoogleFontInDocument, GoogleFontItem } from './GoogleFontsPicker';

export interface FontShowcaseTabProps {
  theme: SiteTheme;
  themeMode?: 'light' | 'dark';
  onUpdateTheme: (theme: Partial<SiteTheme>) => void;
  onSelectTab?: (tab: any) => void;
  showToast?: (toast: { title: string; description: string }) => void;
  isSpacious?: boolean;
}

interface FontPairPreset {
  id: string;
  name: string;
  tag: string;
  headingFont: string;
  bodyFont: string;
  description: string;
}

const FONT_PAIR_PRESETS: FontPairPreset[] = [
  {
    id: 'visionary-saas',
    name: 'Visionary SaaS',
    tag: 'CloudboyX Brand',
    headingFont: 'Space Grotesk',
    bodyFont: 'Plus Jakarta Sans',
    description: 'High-tech geometric headers paired with modern humanist body text for maximum clarity.',
  },
  {
    id: 'clean-enterprise',
    name: 'Clean Enterprise',
    tag: 'Corporate',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    description: 'Unified Swiss-style typography with razor-sharp readability on all screen resolutions.',
  },
  {
    id: 'modern-editorial',
    name: 'Modern Editorial',
    tag: 'Luxury & Magazine',
    headingFont: 'Playfair Display',
    bodyFont: 'Outfit',
    description: 'Sophisticated serif display headings paired with clean, accessible geometric body copy.',
  },
  {
    id: 'bold-creative',
    name: 'Bold Creative',
    tag: 'Design Studio',
    headingFont: 'Syne',
    bodyFont: 'DM Sans',
    description: 'Avant-garde headlines with dramatic proportion paired with friendly grotesque body text.',
  },
  {
    id: 'startup-energy',
    name: 'Startup Energy',
    tag: 'Consumer Tech',
    headingFont: 'Poppins',
    bodyFont: 'Manrope',
    description: 'Warm rounded geometric headers coupled with contemporary high-density body typography.',
  },
  {
    id: 'developer-precision',
    name: 'Technical Precision',
    tag: 'DevOps & API',
    headingFont: 'Space Grotesk',
    bodyFont: 'Figtree',
    description: 'Sharp monospace-inspired display geometry with lively, optimized legible body paragraphs.',
  },
];

export const FontShowcaseTab: React.FC<FontShowcaseTabProps> = ({
  theme,
  themeMode = 'light',
  onUpdateTheme,
  showToast,
  isSpacious = false,
}) => {
  const isDark = themeMode === 'dark';

  // Staged fonts (can be previewed before applying to the active theme)
  const currentThemeHeading = theme.headingFontFamily || theme.fontFamily || 'Space Grotesk';
  const currentThemeBody = theme.fontFamily || 'Plus Jakarta Sans';

  const [stagedHeadingFont, setStagedHeadingFont] = useState<string>(currentThemeHeading);
  const [stagedBodyFont, setStagedBodyFont] = useState<string>(currentThemeBody);
  const [customSampleText, setCustomSampleText] = useState<string>('Clarity Without Compromise');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeSpecimenTab, setActiveSpecimenTab] = useState<'hierarchy' | 'editorial' | 'weights' | 'components'>('hierarchy');
  const [appliedJustNow, setAppliedJustNow] = useState<boolean>(false);

  // Load fonts dynamically whenever staged fonts change
  useEffect(() => {
    loadGoogleFontInDocument(stagedHeadingFont);
    loadGoogleFontInDocument(stagedBodyFont);
  }, [stagedHeadingFont, stagedBodyFont]);

  // Keep staged fonts aligned if external theme changes unless modified by user
  useEffect(() => {
    loadGoogleFontInDocument(currentThemeHeading);
    loadGoogleFontInDocument(currentThemeBody);
  }, [currentThemeHeading, currentThemeBody]);

  // Check if staged fonts differ from active theme
  const isModified =
    stagedHeadingFont !== currentThemeHeading || stagedBodyFont !== currentThemeBody;

  const handleApplyToTheme = () => {
    onUpdateTheme({
      headingFontFamily: stagedHeadingFont,
      fontFamily: stagedBodyFont,
    });
    setAppliedJustNow(true);
    setTimeout(() => setAppliedJustNow(false), 2500);

    if (showToast) {
      showToast({
        title: 'Typography Applied to Theme',
        description: `Headings: "${stagedHeadingFont}" • Body: "${stagedBodyFont}". Live canvas updated.`,
      });
    }
  };

  const handleResetToTheme = () => {
    setStagedHeadingFont(currentThemeHeading);
    setStagedBodyFont(currentThemeBody);
  };

  const handleApplyPairPreset = (preset: FontPairPreset) => {
    setStagedHeadingFont(preset.headingFont);
    setStagedBodyFont(preset.bodyFont);
  };

  // Filtered fonts list for quick selectors
  const filteredFonts = useMemo(() => {
    return POPULAR_GOOGLE_FONTS.filter((f) => {
      const matchCat = selectedFilterCategory === 'all' || f.category === selectedFilterCategory;
      const matchSearch =
        !searchFilter.trim() || f.name.toLowerCase().includes(searchFilter.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [selectedFilterCategory, searchFilter]);

  return (
    <div
      id="font-showcase-tab-pane"
      className={`h-full flex flex-col overflow-y-auto ${
        isDark ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50/50 text-slate-800'
      }`}
    >
      {/* Top Header & Sticky Staging Control Bar */}
      <div
        className={`p-3.5 border-b sticky top-0 z-20 backdrop-blur-md ${
          isDark
            ? 'bg-[#0b0f19]/95 border-slate-800 text-slate-100'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-500 border border-blue-500/25 flex items-center justify-center shrink-0">
              <Type className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold flex items-center gap-1.5 truncate">
                <span>Font Showcase</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">
                  Google Fonts
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 truncate">
                Live typography specimen preview before applying
              </p>
            </div>
          </div>

          {/* Quick Apply Button */}
          <button
            type="button"
            id="btn-apply-fonts-to-theme"
            onClick={handleApplyToTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              appliedJustNow
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25'
                : isModified
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 animate-pulse'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title="Apply currently previewed fonts to the website theme"
          >
            {appliedJustNow ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Applied!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply to Theme</span>
              </>
            )}
          </button>
        </div>

        {/* Staging Status Chip & Reset */}
        <div
          className={`p-2 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
            isModified
              ? isDark
                ? 'bg-blue-950/30 border-blue-800/60 text-blue-200'
                : 'bg-blue-50 border-blue-200 text-blue-900'
              : isDark
              ? 'bg-slate-900/60 border-slate-800 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] min-w-0">
            <span className="font-semibold text-slate-400 shrink-0">Previewing:</span>
            <span
              className="font-bold text-blue-500 truncate"
              style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
              title={`Heading font: ${stagedHeadingFont}`}
            >
              H: {stagedHeadingFont}
            </span>
            <span className="text-slate-400">•</span>
            <span
              className="font-semibold text-emerald-500 truncate"
              style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
              title={`Body font: ${stagedBodyFont}`}
            >
              B: {stagedBodyFont}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isModified && (
              <button
                type="button"
                onClick={handleResetToTheme}
                className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded transition cursor-pointer"
                title="Reset preview back to current theme settings"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revert</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* SECTION 1: FONT SELECTION & PAIRING PRESETS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Font Selectors
            </span>
            <span className="text-[10px] text-slate-400">Headings &amp; Body</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Heading Font Select */}
            <div
              className={`p-2.5 rounded-xl border space-y-1.5 ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Heading Font (H1 - H6)
              </label>
              <select
                id="select-showcase-heading-font"
                value={stagedHeadingFont}
                onChange={(e) => setStagedHeadingFont(e.target.value)}
                className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
                style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
              >
                {POPULAR_GOOGLE_FONTS.map((font) => (
                  <option key={`heading-${font.name}`} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Body Font Select */}
            <div
              className={`p-2.5 rounded-xl border space-y-1.5 ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Body Font (Paragraphs &amp; UI)
              </label>
              <select
                id="select-showcase-body-font"
                value={stagedBodyFont}
                onChange={(e) => setStagedBodyFont(e.target.value)}
                className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                }`}
                style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
              >
                {POPULAR_GOOGLE_FONTS.map((font) => (
                  <option key={`body-${font.name}`} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Curated Font Pairing Pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Curated Designer Pairings
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_PAIR_PRESETS.map((preset) => {
                const isSelected =
                  stagedHeadingFont === preset.headingFont && stagedBodyFont === preset.bodyFont;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPairPreset(preset)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isDark
                          ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-xs'
                          : 'bg-blue-50/80 border-blue-500 text-blue-900 ring-1 ring-blue-400 shadow-xs'
                        : isDark
                        ? 'bg-slate-900/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold truncate">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    </div>
                    <div className="text-[9.5px] text-slate-400 space-y-0.5">
                      <div className="truncate font-mono">
                        <span className="text-blue-400">H:</span> {preset.headingFont}
                      </div>
                      <div className="truncate font-mono">
                        <span className="text-emerald-400">B:</span> {preset.bodyFont}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: LIVE SPECIMEN PREVIEWS & TABS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live Typography Showcase
            </span>

            {/* Specimen Mode Switcher */}
            <div
              className={`p-0.5 rounded-lg border flex items-center gap-0.5 text-[10px] font-semibold ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveSpecimenTab('hierarchy')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  activeSpecimenTab === 'hierarchy'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Scale
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecimenTab('editorial')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  activeSpecimenTab === 'editorial'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Editorial
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecimenTab('weights')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  activeSpecimenTab === 'weights'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weights
              </button>
              <button
                type="button"
                onClick={() => setActiveSpecimenTab('components')}
                className={`px-2 py-1 rounded-md transition cursor-pointer ${
                  activeSpecimenTab === 'components'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                UI Cards
              </button>
            </div>
          </div>

          {/* Interactive Custom Sample Text Input */}
          <div className="space-y-1">
            <input
              type="text"
              id="input-font-showcase-sample-text"
              value={customSampleText}
              onChange={(e) => setCustomSampleText(e.target.value)}
              placeholder="Type sample text to preview..."
              className={`w-full text-xs px-3 py-1.5 rounded-xl border outline-none transition ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>

          {/* SPECIMEN VIEW 1: TYPOGRAPHIC SCALE & HIERARCHY */}
          {activeSpecimenTab === 'hierarchy' && (
            <div
              className={`p-4 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Display / Hero Level */}
              <div className="border-b pb-3 border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Display 1 • Heading Font</span>
                  <span className="font-mono">font-extrabold</span>
                </div>
                <h1
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400"
                  style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                >
                  {customSampleText}
                </h1>
              </div>

              {/* H1 / Section Title */}
              <div className="border-b pb-3 border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>H1 Heading (32px)</span>
                  <span className="font-mono">font-bold</span>
                </div>
                <h2
                  className="text-2xl font-bold tracking-tight text-slate-100 dark:text-white"
                  style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                >
                  {customSampleText}
                </h2>
              </div>

              {/* H2 / Card Title */}
              <div className="border-b pb-3 border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>H2 Subtitle (22px)</span>
                  <span className="font-mono">font-semibold</span>
                </div>
                <h3
                  className="text-lg font-semibold text-slate-200 dark:text-slate-100"
                  style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                >
                  Engineering Precision Architecture
                </h3>
              </div>

              {/* Lead Paragraph in Body Font */}
              <div className="border-b pb-3 border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Lead Paragraph • Body Font</span>
                  <span className="font-mono">font-medium</span>
                </div>
                <p
                  className="text-sm font-medium leading-relaxed text-slate-300 dark:text-slate-200"
                  style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                >
                  Craft production-ready Bootstrap 5 responsive websites with visual drag-and-drop
                  components and instant vector code synchronization.
                </p>
              </div>

              {/* Standard Paragraph in Body Font */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span>Standard Body Text (13px)</span>
                  <span className="font-mono">font-normal</span>
                </div>
                <p
                  className="text-xs font-normal leading-relaxed text-slate-400"
                  style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                >
                  Every component features scoped CSS variables, fluid responsive breakpoints from
                  mobile xs to desktop xxl, and semantic HTML accessibility standards.
                </p>
              </div>
            </div>
          )}

          {/* SPECIMEN VIEW 2: EDITORIAL HARMONY FLOW */}
          {activeSpecimenTab === 'editorial' && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Case Study Showcase
                </span>
                <span className="text-[10px] text-slate-400">Published October 2026</span>
              </div>

              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug"
                style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
              >
                The Future of Rapid Frontend Architecture in Modern Web Production
              </h2>

              <p
                className="text-xs leading-relaxed text-slate-300"
                style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
              >
                When pairing <strong className="text-white">{stagedHeadingFont}</strong> with{' '}
                <strong className="text-white">{stagedBodyFont}</strong>, the visual hierarchy
                creates immediate distinction between architectural section titles and narrative body copy.
              </p>

              <blockquote
                className="p-3 my-2 rounded-xl border-l-4 border-blue-500 bg-blue-500/5 text-xs italic text-slate-300"
                style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
              >
                &ldquo;Exceptional design begins when typography communicates structure before a single line of text is even read.&rdquo;
              </blockquote>

              <p
                className="text-xs leading-relaxed text-slate-400"
                style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
              >
                Responsive typography ensures headlines collapse proportionally from 48px on desktop displays down to 26px on mobile viewports without unsightly line breaks.
              </p>
            </div>
          )}

          {/* SPECIMEN VIEW 3: WEIGHT RAMP COMPARISON */}
          {activeSpecimenTab === 'weights' && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Heading Font: {stagedHeadingFont} Weights
                </span>
                {[
                  { weight: '300', label: 'Light 300' },
                  { weight: '400', label: 'Regular 400' },
                  { weight: '500', label: 'Medium 500' },
                  { weight: '600', label: 'SemiBold 600' },
                  { weight: '700', label: 'Bold 700' },
                  { weight: '800', label: 'ExtraBold 800' },
                ].map(({ weight, label }) => (
                  <div
                    key={`hw-${weight}`}
                    className="flex items-baseline justify-between border-b pb-1.5 border-slate-800"
                  >
                    <span className="text-[10px] text-slate-500 w-24 shrink-0 font-mono">
                      {label}
                    </span>
                    <span
                      className="text-sm truncate flex-1 text-slate-200"
                      style={{
                        fontFamily: `'${stagedHeadingFont}', sans-serif`,
                        fontWeight: Number(weight),
                      }}
                    >
                      {customSampleText}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Body Font: {stagedBodyFont} Weights
                </span>
                {[
                  { weight: '300', label: 'Light 300' },
                  { weight: '400', label: 'Regular 400' },
                  { weight: '500', label: 'Medium 500' },
                  { weight: '600', label: 'SemiBold 600' },
                  { weight: '700', label: 'Bold 700' },
                ].map(({ weight, label }) => (
                  <div
                    key={`bw-${weight}`}
                    className="flex items-baseline justify-between border-b pb-1.5 border-slate-800"
                  >
                    <span className="text-[10px] text-slate-500 w-24 shrink-0 font-mono">
                      {label}
                    </span>
                    <span
                      className="text-xs truncate flex-1 text-slate-300"
                      style={{
                        fontFamily: `'${stagedBodyFont}', sans-serif`,
                        fontWeight: Number(weight),
                      }}
                    >
                      Modern responsive web architecture with Bootstrap 5
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPECIMEN VIEW 4: REAL-WORLD UI COMPONENTS */}
          {activeSpecimenTab === 'components' && (
            <div className="space-y-3">
              {/* Card 1: Feature Product Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/20 border-slate-800'
                    : 'bg-white border-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Pro Plan
                  </span>
                  <span
                    className="text-xs font-bold text-slate-400"
                    style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                  >
                    $49/mo
                  </span>
                </div>

                <h4
                  className="text-lg font-bold text-white tracking-tight"
                  style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                >
                  CloudboyX Visual Engine
                </h4>

                <p
                  className="text-xs text-slate-300 leading-relaxed"
                  style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                >
                  Full access to 35+ responsive block templates, real-time code editor, and custom
                  Google Fonts live synchronization.
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs"
                    style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                  >
                    Get Started Free →
                  </button>
                  <button
                    type="button"
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              {/* Card 2: Interactive Stat Metric Pill */}
              <div
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <span
                    className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block"
                    style={{ fontFamily: `'${stagedBodyFont}', sans-serif` }}
                  >
                    Monthly Active Visitors
                  </span>
                  <span
                    className="text-2xl font-extrabold text-cyan-400 block"
                    style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
                  >
                    248,900+
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                  +18.4% ↑
                </span>
              </div>
            </div>
          )}

          {/* Quick Alphabet & Numerical Glyph Map */}
          <div
            className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
              isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Alphabet Glyph Set ({stagedHeadingFont})</span>
              <span>Aa - Zz</span>
            </div>
            <div
              className="text-xs font-medium tracking-wide text-slate-300"
              style={{ fontFamily: `'${stagedHeadingFont}', sans-serif` }}
            >
              A B C D E F G H I J K L M N O P Q R S T U V W X Y Z<br />
              a b c d e f g h i j k l m n o p q r s t u v w x y z<br />
              0 1 2 3 4 5 6 7 8 9 &bull; &amp; % $ @ # ! ? / ( )
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        className={`p-3 border-t flex items-center justify-between text-xs shrink-0 ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <span className="text-[11px] text-slate-400">
          Pairing: <strong className="text-slate-200">{stagedHeadingFont}</strong> + <strong className="text-slate-200">{stagedBodyFont}</strong>
        </span>

        <button
          type="button"
          onClick={handleApplyToTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply to Theme</span>
        </button>
      </div>
    </div>
  );
};
