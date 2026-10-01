import React, { useState } from 'react';
import { X, Palette, Check, Type, Square, Sparkles, Globe, Sun, Moon } from 'lucide-react';
import { SiteTheme } from '../types';
import { GoogleFontsPicker } from './GoogleFontsPicker';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: SiteTheme;
  onUpdateTheme: (theme: Partial<SiteTheme>) => void;
  isEmbedded?: boolean;
}

const CLOUDBOYX_PALETTE = [
  { label: 'CloudboyX Electric Blue (Primary)', color: '#2222FF', token: '--cbx-blue' },
  { label: 'CloudboyX Cyber Cyan (Accent)', color: '#00E5D1', token: '--cbx-cyan' },
  { label: 'CloudboyX Midnight Navy', color: '#191970', token: '--cbx-navy' },
  { label: 'CloudboyX Obsidian Dark', color: '#1C1C23', token: '--cbx-dark' },
  { label: 'CloudboyX Pure White', color: '#FFFFFF', token: '--cbx-white' },
];

const PRIMARY_PALETTE = [
  { label: 'CloudboyX Electric Blue', color: '#2222FF' },
  { label: 'CloudboyX Cyber Cyan', color: '#00E5D1' },
  { label: 'CloudboyX Midnight Navy', color: '#191970' },
  { label: 'CloudboyX Obsidian Dark', color: '#1C1C23' },
  { label: 'Bootstrap Blue', color: '#0d6efd' },
  { label: 'Indigo Royal', color: '#4f46e5' },
  { label: 'Violet', color: '#7c3aed' },
  { label: 'Ruby Pink', color: '#e11d48' },
  { label: 'Emerald Green', color: '#059669' },
  { label: 'Teal Modern', color: '#0d9488' },
  { label: 'Cyan Ocean', color: '#0284c7' },
  { label: 'Amber Gold', color: '#d97706' },
];

const QUICK_FONTS = [
  { name: 'Space Grotesk', badge: 'Visionary Architect' },
  { name: 'Plus Jakarta Sans', badge: 'Standard Body' },
  { name: 'Inter', badge: 'Clean UI' },
  { name: 'Poppins', badge: 'Geometric' },
  { name: 'Playfair Display', badge: 'Editorial Serif' },
  { name: 'Syne', badge: 'Modern Display' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
  isEmbedded = false,
}) => {
  const [fontPickerMode, setFontPickerMode] = useState<'quick' | 'google'>('google');

  if (!isOpen) return null;

  const handleApplyVisionaryArchitect = () => {
    onUpdateTheme({
      primaryColor: '#2222FF',
      secondaryColor: '#00E5D1',
      darkColor: '#1C1C23',
      lightColor: '#FFFFFF',
      fontFamily: 'Plus Jakarta Sans',
      headingFontFamily: 'Space Grotesk',
      buttonStyle: 'rounded',
    });
  };

  const handleApplyCloudboyXPalette = () => {
    onUpdateTheme({
      primaryColor: '#2222FF',
      secondaryColor: '#00E5D1',
      darkColor: '#1C1C23',
      lightColor: '#FFFFFF',
    });
  };

  const contentMarkup = (
    <div className={`bg-white w-full flex flex-col ${isEmbedded ? 'h-full' : 'max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden'}`}>
      {/* Header */}
      {!isEmbedded && (
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Brand Style & Typography</h3>
              <p className="text-xs text-slate-500">
                Customize global Bootstrap theme variables and typography
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-6 overflow-y-auto flex-1">
          {/* Bootstrap 5.3 Color Mode (Light / Dark) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Bootstrap 5.3 Theme Mode
              </label>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                Synced with Header Toggle
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Switches between standard light and dark Bootstrap mode (<code>data-bs-theme</code>).
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onUpdateTheme({ colorMode: 'light' })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  theme.colorMode !== 'dark'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Theme</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme({ colorMode: 'dark' })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  theme.colorMode === 'dark'
                    ? 'bg-[#1C1C23] border-[#191970] text-white ring-2 ring-[#2222FF]/30 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon className="w-4 h-4 text-[#00E5D1]" />
                <span>Dark Theme</span>
              </button>
            </div>
          </div>

          {/* CloudboyX Official Brand Palette */}
          <div className="p-3.5 rounded-xl border border-[#191970]/25 bg-gradient-to-br from-[#1C1C23] via-[#191970] to-[#1C1C23] text-white shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5D1]" />
                  <span className="text-xs font-bold tracking-wide uppercase text-white">
                    CloudboyX Palette
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Primary brand CSS colors (#FFFFFF, #00E5D1, #2222FF, #191970, #1C1C23)
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyCloudboyXPalette}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white border border-[#00E5D1]/40 transition cursor-pointer shrink-0"
              >
                Apply Palette
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {CLOUDBOYX_PALETTE.map((swatch) => {
                const isSelected = theme.primaryColor.toLowerCase() === swatch.color.toLowerCase();
                const isLight = swatch.color.toUpperCase() === '#FFFFFF' || swatch.color.toUpperCase() === '#00E5D1';
                return (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => onUpdateTheme({ primaryColor: swatch.color })}
                    className="group flex flex-col items-center gap-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition cursor-pointer"
                    title={`${swatch.label} (${swatch.color})`}
                  >
                    <div
                      className="w-full h-6 rounded-md border border-white/25 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: swatch.color }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            isLight ? 'text-[#1C1C23]' : 'text-white'
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-slate-200 tracking-tight">
                      {swatch.color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Theme Color */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Primary Brand Color
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Applied to Bootstrap <code>.btn-primary</code>, links, active badges, and highlights.
            </p>

            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRIMARY_PALETTE.map((pal) => {
                const isSelected = theme.primaryColor.toLowerCase() === pal.color.toLowerCase();
                return (
                  <button
                    key={pal.color}
                    onClick={() => onUpdateTheme({ primaryColor: pal.color })}
                    className="h-9 rounded-xl relative flex items-center justify-center border border-slate-300 shadow-xs transition hover:scale-105"
                    style={{ backgroundColor: pal.color }}
                    title={pal.label}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex input */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0 shrink-0"
              />
              <div className="flex-1">
                <span className="text-[11px] text-slate-500 block">Custom Color Value</span>
                <input
                  type="text"
                  value={theme.primaryColor}
                  onChange={(e) => onUpdateTheme({ primaryColor: e.target.value })}
                  className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Typography & Google Fonts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Fonts & Typography</span>
              </label>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setFontPickerMode('google')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition flex items-center gap-1 ${
                    fontPickerMode === 'google'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span>Google Fonts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFontPickerMode('quick')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    fontPickerMode === 'quick'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Quick Presets</span>
                </button>
              </div>
            </div>

            {fontPickerMode === 'google' ? (
              <GoogleFontsPicker
                currentFont={theme.fontFamily || 'Plus Jakarta Sans'}
                currentHeadingFont={theme.headingFontFamily}
                onSelectFont={(bodyFont, headingFont) => {
                  onUpdateTheme({
                    fontFamily: bodyFont,
                    ...(headingFont !== undefined ? { headingFontFamily: headingFont } : {}),
                  });
                }}
                onApplyBrandPreset={handleApplyVisionaryArchitect}
              />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_FONTS.map((item) => {
                    const isSelected = theme.fontFamily === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onUpdateTheme({ fontFamily: item.name })}
                        className={`p-2.5 rounded-xl text-left border transition flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold block">{item.name}</span>
                            {item.name === 'Space Grotesk' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{item.badge}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setFontPickerMode('google')}
                  className="w-full py-1.5 text-center text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center justify-center gap-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Open Full Google Fonts Directory (1,000+ fonts)</span>
                </button>
              </div>
            )}
          </div>

          {/* Button Style */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Button Corner Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded-pill' as const, label: 'Pill Rounded', desc: 'Soft and friendly' },
                { id: 'rounded' as const, label: 'Standard', desc: 'Bootstrap classic' },
                { id: 'rounded-0' as const, label: 'Square', desc: 'Sharp edges' },
              ].map((btn) => {
                const isSelected = theme.buttonStyle === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => onUpdateTheme({ buttonStyle: btn.id })}
                    className={`p-3 rounded-xl text-center border transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block mb-0.5">{btn.label}</span>
                    <span className="text-[10px] text-slate-500 block">{btn.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isEmbedded && (
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Apply & Close
            </button>
          </div>
        )}
      </div>
  );

  return isEmbedded ? (
    contentMarkup
  ) : (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      {contentMarkup}
    </div>
  );
};
