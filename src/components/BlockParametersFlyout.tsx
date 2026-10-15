import React, { useState } from 'react';
import {
  Settings,
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Code2,
  Sliders,
  Palette,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Check,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Columns2,
  Columns3,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { BlockInstance, SiteTheme } from '../types';

interface BlockParametersFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  block: BlockInstance | null;
  blocks: BlockInstance[];
  onUpdateSettings: (blockId: string, settings: Partial<BlockInstance['settings']>) => void;
  onUpdateContent?: (blockId: string, content: Partial<BlockInstance['content']>) => void;
  onMoveUp: (blockId: string) => void;
  onMoveDown: (blockId: string) => void;
  onDuplicate: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onOpenCodeEditor?: (blockId: string) => void;
  onOpenDesignStudio?: (tab?: string) => void;
  themeMode?: 'light' | 'dark';
  theme?: SiteTheme;
}

const COLOR_SWATCHES = [
  { name: 'White', color: '#ffffff', border: true },
  { name: 'Light', color: '#f8f9fa', border: true },
  { name: 'Primary Blue', color: '#0d6efd' },
  { name: 'Royal Indigo', color: '#4f46e5' },
  { name: 'Neon Cyan', color: '#00E5D1' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Slate', color: '#1e293b' },
  { name: 'Obsidian Dark', color: '#0f172a' },
  { name: 'Pure Dark', color: '#111827' },
  { name: 'Bootstrap Dark', color: '#212529' },
];

const GRADIENT_PRESETS = [
  {
    name: 'Midnight Royal',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    textColor: 'light',
  },
  {
    name: 'Cyber Cyan',
    value: 'linear-gradient(135deg, #0d6efd 0%, #00E5D1 100%)',
    textColor: 'light',
  },
  {
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #ea580c 0%, #f43f5e 100%)',
    textColor: 'light',
  },
  {
    name: 'Deep Violet',
    value: 'linear-gradient(135deg, #312e81 0%, #4c1d95 100%)',
    textColor: 'light',
  },
  {
    name: 'Emerald Forest',
    value: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
    textColor: 'light',
  },
  {
    name: 'Clean Ice',
    value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    textColor: 'dark',
  },
];

const PRESET_IMAGES = [
  {
    label: 'Tech Abstract',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Modern Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Architecture',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  },
  {
    label: 'Minimalist Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  },
];

export const BlockParametersFlyout: React.FC<BlockParametersFlyoutProps> = ({
  isOpen,
  onClose,
  block,
  blocks,
  onUpdateSettings,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onOpenCodeEditor,
  onOpenDesignStudio,
  themeMode = 'light',
}) => {
  const [bgTab, setBgTab] = useState<'color' | 'gradient' | 'image'>('color');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !block) return null;

  const isDark = themeMode === 'dark';
  const { settings } = block;
  const blockIndex = blocks.findIndex((b) => b.id === block.id);
  const isFirst = blockIndex === 0;
  const isLast = blockIndex === blocks.length - 1;

  // Toggle helper
  const handleToggle = (key: keyof BlockInstance['settings']) => {
    onUpdateSettings(block.id, { [key]: !settings[key] });
  };

  return (
    <aside
      id="mobirise-block-parameters-flyout"
      aria-label="Block Parameters Flyout Panel"
      className={`fixed top-14 right-0 bottom-0 w-80 sm:w-96 z-50 flex flex-col shadow-2xl border-l backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-right-4 fade-in ${
        isDark
          ? 'bg-slate-900/96 text-slate-100 border-slate-700/80 shadow-black/60'
          : 'bg-white/98 text-slate-900 border-slate-200/90 shadow-slate-900/20'
      }`}
    >
      {/* 1. FLYOUT HEADER: Mobirise Style Gear Icon + Title + Action Buttons */}
      <div
        className={`px-4 py-3 border-b shrink-0 flex items-center justify-between gap-2 select-none ${
          isDark
            ? 'bg-slate-950/80 border-slate-800 text-white'
            : 'bg-slate-50/90 border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
            <Settings className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-500">
                Parameters
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                #{blockIndex + 1}
              </span>
            </div>
            <h3 className="text-xs font-bold truncate max-w-[170px]" title={block.name}>
              {block.name}
            </h3>
          </div>
        </div>

        {/* Header Action Icons: Up, Down, Duplicate, Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMoveUp(block.id)}
            disabled={isFirst}
            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Move Section Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(block.id)}
            disabled={isLast}
            className={`p-1.5 rounded-lg transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Move Section Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(block.id)}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <div className={`h-4 w-px mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
            }`}
            title="Close Block Parameters (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE PARAMETERS LIST */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 select-none text-xs">
        {/* SECTION A: BLOCK ELEMENTS / TOGGLE SWITCHES (Mobirise Signature Feature) */}
        <div
          className={`p-3.5 rounded-2xl border shadow-xs space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Block Elements
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Show / Hide</span>
          </div>

          <div className="space-y-2">
            {[
              { key: 'showTitle', label: 'Title & Headline', desc: 'Main section heading' },
              { key: 'showSubtitle', label: 'Subtitle / Badge', desc: 'Secondary category label' },
              { key: 'showDescription', label: 'Description Text', desc: 'Supporting paragraph copy' },
              { key: 'showButtons', label: 'Call-To-Action Button', desc: 'CTA action links' },
              { key: 'showMedia', label: 'Media / Main Image', desc: 'Section graphic or photo' },
              { key: 'showIcons', label: 'Feature Icons', desc: 'Counters & item glyphs' },
            ].map((item) => {
              const isChecked = !!settings[item.key as keyof BlockInstance['settings']];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as keyof BlockInstance['settings'])}
                  className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                    isChecked
                      ? isDark
                        ? 'bg-blue-950/30 border-blue-600/40 text-blue-100'
                        : 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : isDark
                      ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="pr-2">
                    <span className="font-semibold block text-xs">{item.label}</span>
                    <span className="text-[10px] opacity-75">{item.desc}</span>
                  </div>

                  {/* iOS Style Toggle Switch */}
                  <div
                    className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                      isChecked ? 'bg-blue-600 justify-end' : isDark ? 'bg-slate-800 justify-start' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Container Width & Full Height Toggles */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
            {/* Full Width Container */}
            <div
              onClick={() =>
                onUpdateSettings(block.id, {
                  containerWidth: settings.containerWidth === 'fluid' ? 'container' : 'fluid',
                })
              }
              className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                settings.containerWidth === 'fluid'
                  ? isDark
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                    : 'bg-cyan-50/70 border-cyan-200 text-cyan-950'
                  : isDark
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <span className="font-semibold block text-xs">Full Width (Container Fluid)</span>
                <span className="text-[10px] opacity-75">
                  {settings.containerWidth === 'fluid' ? 'Stretches 100% edge-to-edge' : 'Standard 12-col container width'}
                </span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  settings.containerWidth === 'fluid'
                    ? 'bg-cyan-500 justify-end'
                    : isDark
                    ? 'bg-slate-800 justify-start'
                    : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            {/* Full Screen Height */}
            <div
              onClick={() => handleToggle('fullHeight')}
              className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                settings.fullHeight
                  ? isDark
                    ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                    : 'bg-purple-50/70 border-purple-200 text-purple-950'
                  : isDark
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <span className="font-semibold block text-xs">Full Screen Hero (100vh)</span>
                <span className="text-[10px] opacity-75">Makes section fill the entire viewport height</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  settings.fullHeight
                    ? 'bg-purple-600 justify-end'
                    : isDark
                    ? 'bg-slate-800 justify-start'
                    : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>

            {/* Rounded Pill Buttons */}
            <div
              onClick={() => handleToggle('buttonPill')}
              className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                settings.buttonPill
                  ? isDark
                    ? 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                  : isDark
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div>
                <span className="font-semibold block text-xs">Rounded Pill Buttons</span>
                <span className="text-[10px] opacity-75">Smooth 50px pill shape on all CTA buttons</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                  settings.buttonPill
                    ? 'bg-blue-600 justify-end'
                    : isDark
                    ? 'bg-slate-800 justify-start'
                    : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: BACKGROUND STYLING (Color | Gradient | Image) */}
        <div
          className={`p-3.5 rounded-2xl border shadow-xs space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Background
              </span>
            </div>
            {settings.backgroundColor && (
              <span className="font-mono text-[10px] text-slate-400">
                {settings.backgroundColor}
              </span>
            )}
          </div>

          {/* Subtab Segmented Switch: Color | Gradient | Image */}
          <div
            className={`p-0.5 rounded-xl border flex items-center gap-1 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {(['color', 'gradient', 'image'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setBgTab(tab)}
                className={`flex-1 py-1 rounded-lg text-center font-bold capitalize transition cursor-pointer ${
                  bgTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Solid Color */}
          {bgTab === 'color' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-6 gap-2">
                {COLOR_SWATCHES.map((swatch) => {
                  const isSelected = settings.backgroundColor === swatch.color;
                  return (
                    <button
                      key={swatch.name}
                      type="button"
                      onClick={() =>
                        onUpdateSettings(block.id, {
                          backgroundColor: swatch.color,
                          backgroundGradient: undefined,
                          backgroundImage: undefined,
                        })
                      }
                      title={swatch.name}
                      className={`h-7 rounded-lg transition-transform cursor-pointer relative flex items-center justify-center shadow-xs ${
                        swatch.border ? 'border border-slate-300 dark:border-slate-700' : ''
                      } ${isSelected ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'}`}
                      style={{ backgroundColor: swatch.color }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            swatch.color === '#ffffff' || swatch.color === '#f8f9fa' || swatch.color === '#00E5D1'
                              ? 'text-slate-900'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) =>
                    onUpdateSettings(block.id, {
                      backgroundColor: e.target.value,
                      backgroundGradient: undefined,
                    })
                  }
                  className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="#0d6efd"
                  value={settings.backgroundColor || ''}
                  onChange={(e) =>
                    onUpdateSettings(block.id, {
                      backgroundColor: e.target.value,
                      backgroundGradient: undefined,
                    })
                  }
                  className={`flex-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Gradient Presets */}
          {bgTab === 'gradient' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((grad) => {
                  const isSelected = settings.backgroundGradient === grad.value;
                  return (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() =>
                        onUpdateSettings(block.id, {
                          backgroundGradient: grad.value,
                          backgroundColor: undefined,
                          backgroundImage: undefined,
                        })
                      }
                      className={`h-11 rounded-xl p-2 text-left relative overflow-hidden transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-blue-400 ring-2 ring-blue-500/50 scale-[1.02]'
                          : 'border-slate-700/60 hover:border-slate-500 hover:scale-[1.01]'
                      }`}
                      style={{ background: grad.value }}
                    >
                      <span
                        className={`text-[11px] font-bold block truncate ${
                          grad.textColor === 'light' ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {grad.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Image & Overlay */}
          {bgTab === 'image' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                {PRESET_IMAGES.map((img) => {
                  const isSelected = settings.backgroundImage === img.url;
                  return (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() =>
                        onUpdateSettings(block.id, {
                          backgroundImage: img.url,
                          backgroundGradient: undefined,
                        })
                      }
                      className={`h-14 rounded-xl relative overflow-hidden transition-transform cursor-pointer border ${
                        isSelected ? 'ring-2 ring-blue-500 border-blue-500 scale-[1.02]' : 'border-slate-700'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[10px] font-bold text-white truncate">{img.label}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Direct Image URL input */}
              <input
                type="text"
                placeholder="Or paste image URL (https://...)"
                value={settings.backgroundImage || ''}
                onChange={(e) =>
                  onUpdateSettings(block.id, {
                    backgroundImage: e.target.value,
                  })
                }
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />

              {/* Parallax & Overlay switches */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div
                  onClick={() => handleToggle('bgParallax')}
                  className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <span className="font-semibold text-xs">Parallax Scroll</span>
                  <div
                    className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                      settings.bgParallax ? 'bg-blue-600 justify-end' : 'bg-slate-400 dark:bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                  </div>
                </div>

                <div
                  onClick={() => handleToggle('bgOverlay')}
                  className="flex items-center justify-between p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  <span className="font-semibold text-xs">Dark Tint Overlay</span>
                  <div
                    className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                      settings.bgOverlay ? 'bg-blue-600 justify-end' : 'bg-slate-400 dark:bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION C: SPACING & PADDING */}
        <div
          className={`p-3.5 rounded-2xl border shadow-xs space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Padding & Alignment
              </span>
            </div>
          </div>

          {/* Padding Top */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Top Spacing</span>
              <span className="font-mono text-[10px] text-blue-500 font-bold">
                {settings.paddingTop || 'py-5'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {['pt-0', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'py-5'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateSettings(block.id, { paddingTop: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer border ${
                    settings.paddingTop === val
                      ? 'bg-blue-600 text-white border-blue-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {val.replace('pt-', 'T-').replace('py-', 'Y-')}
                </button>
              ))}
            </div>
          </div>

          {/* Padding Bottom */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Bottom Spacing</span>
              <span className="font-mono text-[10px] text-blue-500 font-bold">
                {settings.paddingBottom || 'pb-5'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {['pb-0', 'pb-2', 'pb-3', 'pb-4', 'pb-5', 'py-5'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onUpdateSettings(block.id, { paddingBottom: val })}
                  className={`py-1 rounded-md text-[10px] font-mono font-bold transition cursor-pointer border ${
                    settings.paddingBottom === val
                      ? 'bg-blue-600 text-white border-blue-500'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {val.replace('pb-', 'B-').replace('py-', 'Y-')}
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment (Left | Center | Right) */}
          <div className="space-y-1.5 pt-1">
            <span className="font-semibold text-slate-600 dark:text-slate-300 block text-xs">
              Content Alignment
            </span>
            <div
              className={`p-1 rounded-xl border flex items-center gap-1 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              {[
                { align: 'left', icon: AlignLeft, label: 'Left' },
                { align: 'center', icon: AlignCenter, label: 'Center' },
                { align: 'right', icon: AlignRight, label: 'Right' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = settings.textAlign === item.align;
                return (
                  <button
                    key={item.align}
                    type="button"
                    onClick={() => onUpdateSettings(block.id, { textAlign: item.align as any })}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION D: COLUMNS COUNT (If block supports multi-column layout) */}
        {settings.columns !== undefined && (
          <div
            className={`p-3.5 rounded-2xl border shadow-xs space-y-3 ${
              isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <Columns3 className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Card Columns
                </span>
              </div>
              <span className="font-mono text-[10px] text-blue-500 font-bold">
                {settings.columns} Columns
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdateSettings(block.id, { columns: num as any })}
                  className={`py-1.5 rounded-xl font-bold transition cursor-pointer border ${
                    settings.columns === num
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {num} Col
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. FLYOUT FOOTER: Direct Action Buttons (Code Editor, Full Inspector, Delete) */}
      <div
        className={`p-3.5 border-t shrink-0 flex flex-col gap-2 select-none ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Split-Pane Code Editor */}
          {onOpenCodeEditor && (
            <button
              type="button"
              id="flyout-open-code-editor-btn"
              onClick={() => onOpenCodeEditor(block.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition cursor-pointer shadow-xs"
              title="Edit block HTML, CSS and Bootstrap classes"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML / CSS</span>
            </button>
          )}

          {/* Full Design Studio Inspector link */}
          {onOpenDesignStudio && (
            <button
              type="button"
              id="flyout-open-full-inspector-btn"
              onClick={() => onOpenDesignStudio('settings')}
              className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              title="Open all tabs in Design Studio"
            >
              <span>Inspector</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Delete button with safety toggle */}
        {confirmDelete ? (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <span className="text-[11px] font-bold text-rose-500 flex-1 pl-2">Delete Section?</span>
            <button
              type="button"
              onClick={() => {
                onDelete(block.id);
                setConfirmDelete(false);
                onClose();
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            id="flyout-delete-block-btn"
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer text-xs font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete This Section</span>
          </button>
        )}
      </div>
    </aside>
  );
};
