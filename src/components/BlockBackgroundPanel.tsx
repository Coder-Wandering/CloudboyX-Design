import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Sparkles,
  Pipette,
  Check,
  Copy,
  RotateCcw,
  Sun,
  Moon,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowUpRight,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import { BlockInstance } from '../types';
import { BlockImageUploader } from './BlockImageUploader';

interface BlockBackgroundPanelProps {
  settings: BlockInstance['settings'];
  onUpdateSettings: (newSettings: Partial<BlockInstance['settings']>) => void;
  blockId: string;
  id?: string;
}

const BOOTSTRAP_PALETTE = [
  { name: 'Primary', color: '#0d6efd', light: false },
  { name: 'Secondary', color: '#6c757d', light: false },
  { name: 'Success', color: '#198754', light: false },
  { name: 'Danger', color: '#dc3545', light: false },
  { name: 'Warning', color: '#ffc107', light: true },
  { name: 'Info', color: '#0dcaf0', light: true },
  { name: 'Light', color: '#f8f9fa', light: true },
  { name: 'Dark', color: '#212529', light: false },
  { name: 'Body', color: '#f8fafc', light: true },
  { name: 'White', color: '#ffffff', light: true },
];

const NEUTRAL_PALETTE = [
  '#ffffff',
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#334155',
  '#1e293b',
  '#0f172a',
  '#020617',
  '#000000',
];

const ACCENT_PALETTE = [
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#9333ea', // Purple
  '#c026d3', // Fuchsia
  '#e11d48', // Rose
  '#ea580c', // Orange
  '#d97706', // Amber
  '#059669', // Emerald
  '#0d9488', // Teal
  '#0891b2', // Cyan
  '#2563eb', // Royal Blue
  '#475569', // Slate
];

const PASTEL_PALETTE = [
  { label: 'Warm Cream', color: '#fdfbf7' },
  { label: 'Mint Ice', color: '#f0fdf4' },
  { label: 'Sky Whisper', color: '#f0f9ff' },
  { label: 'Soft Lavender', color: '#faf5ff' },
  { label: 'Peach Tint', color: '#fff7ed' },
  { label: 'Subtle Rose', color: '#fff1f2' },
];

export interface GradientPreset {
  id: string;
  name: string;
  value: string;
  textColor: 'light' | 'dark';
  category: 'dark' | 'vibrant' | 'subtle';
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    textColor: 'light',
    category: 'dark',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    value: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'violet-indigo',
    name: 'Violet Fusion',
    value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'emerald-breeze',
    name: 'Emerald Breeze',
    value: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'ocean-twilight',
    name: 'Ocean Twilight',
    value: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    textColor: 'light',
    category: 'dark',
  },
  {
    id: 'dark-cyber',
    name: 'Dark Cyber',
    value: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    textColor: 'light',
    category: 'dark',
  },
  {
    id: 'crimson-ruby',
    name: 'Deep Crimson',
    value: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'amber-blaze',
    name: 'Amber Blaze',
    value: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'teal-laguna',
    name: 'Teal Laguna',
    value: 'linear-gradient(135deg, #0f766e 0%, #06b6d4 100%)',
    textColor: 'light',
    category: 'vibrant',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    textColor: 'dark',
    category: 'subtle',
  },
  {
    id: 'pastel-sunrise',
    name: 'Pastel Sunrise',
    value: 'linear-gradient(135deg, #fff1f2 0%, #fef3c7 100%)',
    textColor: 'dark',
    category: 'subtle',
  },
  {
    id: 'soft-lavender',
    name: 'Soft Lavender',
    value: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
    textColor: 'dark',
    category: 'subtle',
  },
  {
    id: 'fresh-mint',
    name: 'Fresh Mint',
    value: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
    textColor: 'dark',
    category: 'subtle',
  },
];

const RECENT_COLORS_KEY = 'bs_studio_recent_colors';

// Helper to calculate relative luminance
function calculateLuminance(hex: string): number {
  if (!hex || !hex.startsWith('#')) return 0.5;
  const clean = hex.replace('#', '');
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) || 0;
    g = parseInt(clean[1] + clean[1], 16) || 0;
    b = parseInt(clean[2] + clean[2], 16) || 0;
  } else if (clean.length >= 6) {
    r = parseInt(clean.substring(0, 2), 16) || 0;
    g = parseInt(clean.substring(2, 4), 16) || 0;
    b = parseInt(clean.substring(4, 6), 16) || 0;
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export const BlockBackgroundPanel: React.FC<BlockBackgroundPanelProps> = ({
  settings,
  onUpdateSettings,
  blockId,
  id = 'block-background-panel',
}) => {
  // Mode selection: 'color' (Solid Color) vs 'gradient' (Gradient) vs 'image' (Image Upload)
  const currentMode = settings.bgType || 'color';

  // Solid color state
  const [solidHex, setSolidHex] = useState(
    settings.bgType === 'color' && settings.bgColor && !settings.bgColor.includes('gradient')
      ? settings.bgColor
      : '#ffffff'
  );
  const [copiedSolid, setCopiedSolid] = useState(false);
  const [copiedGradient, setCopiedGradient] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const solidColorInputRef = useRef<HTMLInputElement>(null);

  // Gradient custom builder state
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [gradAngle, setGradAngle] = useState(135);
  const [stop1Color, setStop1Color] = useState('#2563eb');
  const [stop2Color, setStop2Color] = useState('#7c3aed');
  const [useStop3, setUseStop3] = useState(false);
  const [stop3Color, setStop3Color] = useState('#ec4899');
  const [gradientPresetFilter, setGradientPresetFilter] = useState<'all' | 'dark' | 'vibrant' | 'subtle'>('all');

  const stop1Ref = useRef<HTMLInputElement>(null);
  const stop2Ref = useRef<HTMLInputElement>(null);
  const stop3Ref = useRef<HTMLInputElement>(null);

  // Sync solidHex when external settings change in color mode
  useEffect(() => {
    if (settings.bgType === 'color' && settings.bgColor && !settings.bgColor.includes('gradient')) {
      setSolidHex(settings.bgColor);
    }
  }, [settings.bgColor, settings.bgType]);

  // Load recent colors
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_COLORS_KEY);
      if (saved) {
        setRecentColors(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveRecentColor = (hex: string) => {
    if (!hex || !hex.startsWith('#')) return;
    try {
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c.toLowerCase() !== hex.toLowerCase());
        const updated = [hex, ...filtered].slice(0, 8);
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {
      // Ignore
    }
  };

  // Build the gradient CSS string
  const currentGradientCss = useStop3
    ? gradType === 'linear'
      ? `linear-gradient(${gradAngle}deg, ${stop1Color} 0%, ${stop3Color} 50%, ${stop2Color} 100%)`
      : `radial-gradient(circle, ${stop1Color} 0%, ${stop3Color} 50%, ${stop2Color} 100%)`
    : gradType === 'linear'
    ? `linear-gradient(${gradAngle}deg, ${stop1Color} 0%, ${stop2Color} 100%)`
    : `radial-gradient(circle, ${stop1Color} 0%, ${stop2Color} 100%)`;

  // Apply Solid Color
  const applySolidColor = (hex: string) => {
    setSolidHex(hex);
    saveRecentColor(hex);
    const lum = calculateLuminance(hex);
    const suggestedTextColor: 'dark' | 'light' = lum > 0.55 ? 'dark' : 'light';
    onUpdateSettings({
      bgType: 'color',
      bgColor: hex,
      textColor: suggestedTextColor,
    });
  };

  const handleSolidHexInputChange = (val: string) => {
    let formatted = val.trim();
    if (!formatted.startsWith('#') && formatted.length > 0 && !formatted.startsWith('rgb')) {
      formatted = '#' + formatted;
    }
    setSolidHex(formatted);
    if (/^#[0-9A-Fa-f]{6}$/.test(formatted) || /^#[0-9A-Fa-f]{3}$/.test(formatted)) {
      applySolidColor(formatted);
    }
  };

  // Apply Gradient Preset
  const applyGradientPreset = (preset: GradientPreset) => {
    onUpdateSettings({
      bgType: 'gradient',
      bgColor: preset.value,
      textColor: preset.textColor,
    });
  };

  // Apply Custom Gradient
  const applyCustomGradient = (
    type = gradType,
    angle = gradAngle,
    c1 = stop1Color,
    c2 = stop2Color,
    s3 = useStop3,
    c3 = stop3Color,
    forcedTextColor?: 'light' | 'dark'
  ) => {
    const gradVal = s3
      ? type === 'linear'
        ? `linear-gradient(${angle}deg, ${c1} 0%, ${c3} 50%, ${c2} 100%)`
        : `radial-gradient(circle, ${c1} 0%, ${c3} 50%, ${c2} 100%)`
      : type === 'linear'
      ? `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`
      : `radial-gradient(circle, ${c1} 0%, ${c2} 100%)`;

    // Calculate approximate brightness
    const avgLum = (calculateLuminance(c1) + calculateLuminance(c2)) / 2;
    const suggestedText = forcedTextColor || (avgLum > 0.55 ? 'dark' : 'light');

    onUpdateSettings({
      bgType: 'gradient',
      bgColor: gradVal,
      textColor: suggestedText,
    });
  };

  const handleSwapStops = () => {
    const temp = stop1Color;
    setStop1Color(stop2Color);
    setStop2Color(temp);
    applyCustomGradient(gradType, gradAngle, stop2Color, temp, useStop3, stop3Color);
  };

  // Eyedropper for solid color
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          applySolidColor(result.sRGBHex);
        }
      } catch {
        // Canceled
      }
    } else if (solidColorInputRef.current) {
      solidColorInputRef.current.click();
    }
  };

  const currentLuminance = calculateLuminance(solidHex);
  const isSolidLightBg = currentLuminance > 0.55;
  const isSolidContrastOptimal =
    (isSolidLightBg && settings.textColor === 'dark') || (!isSolidLightBg && settings.textColor === 'light');
  const hasEyeDropperSupport = typeof window !== 'undefined' && 'EyeDropper' in window;

  const filteredPresets = GRADIENT_PRESETS.filter(
    (p) => gradientPresetFilter === 'all' || p.category === gradientPresetFilter
  );

  return (
    <div id={id} className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
            <Palette className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Background</h4>
            <p className="text-[10px] text-slate-500">Solid color or gradient for selected block</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase border border-slate-200">
          {currentMode === 'color' ? 'Solid Color' : currentMode === 'gradient' ? 'Gradient' : 'Image'}
        </span>
      </div>

      {/* Mode Switcher Segmented Control */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80">
        <button
          type="button"
          id="bg-mode-solid-btn"
          onClick={() => {
            if (currentMode !== 'color') {
              const hex = solidHex.startsWith('#') ? solidHex : '#ffffff';
              applySolidColor(hex);
            }
          }}
          className={`py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
            currentMode === 'color'
              ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Solid Color</span>
        </button>

        <button
          type="button"
          id="bg-mode-gradient-btn"
          onClick={() => {
            if (currentMode !== 'gradient') {
              // Switch to gradient mode with current custom gradient or preset
              applyCustomGradient();
            }
          }}
          className={`py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
            currentMode === 'gradient'
              ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gradient</span>
        </button>

        <button
          type="button"
          id="bg-mode-image-btn"
          onClick={() => {
            onUpdateSettings({ bgType: 'image' });
          }}
          className={`py-1.5 text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 ${
            currentMode === 'image'
              ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: SOLID COLOR                                             */}
      {/* ============================================================== */}
      {currentMode === 'color' && (
        <div className="space-y-4" id="solid-color-controls">
          {/* Interactive Swatch & Hex Control */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3">
              {/* Native Color Picker / Large Swatch Button */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={() => solidColorInputRef.current?.click()}
                  className="w-12 h-12 rounded-xl border-2 border-slate-300 shadow-xs relative overflow-hidden transition-transform active:scale-95 group-hover:border-blue-500 flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: solidHex.startsWith('#') ? solidHex : '#ffffff' }}
                  title="Click to open color palette"
                >
                  <span className="sr-only">Choose Color</span>
                </button>
                <input
                  ref={solidColorInputRef}
                  type="color"
                  value={solidHex.startsWith('#') && solidHex.length === 7 ? solidHex : '#ffffff'}
                  onChange={(e) => applySolidColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
                />
              </div>

              {/* Hex Input & Fast Action Buttons */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={solidHex}
                      onChange={(e) => handleSolidHexInputChange(e.target.value)}
                      placeholder="#ffffff"
                      maxLength={9}
                      aria-label="Hex color value"
                      className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 uppercase text-slate-900"
                    />
                  </div>

                  {/* Eyedropper Button */}
                  <button
                    type="button"
                    onClick={handleEyeDropper}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                    title={hasEyeDropperSupport ? 'Pick color from screen' : 'Open color wheel'}
                  >
                    <Pipette className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Hex Button */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(solidHex);
                      setCopiedSolid(true);
                      setTimeout(() => setCopiedSolid(false), 1500);
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Copy HEX code"
                  >
                    {copiedSolid ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {/* Reset to White */}
                  <button
                    type="button"
                    onClick={() => applySolidColor('#ffffff')}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                    title="Reset to White"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Luminance & Contrast Indicator */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    {isSolidLightBg ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                    {isSolidLightBg ? 'Light Background' : 'Dark Background'}
                  </span>

                  {!isSolidContrastOptimal ? (
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ textColor: isSolidLightBg ? 'dark' : 'light' })}
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      Set to {isSolidLightBg ? 'dark' : 'light'} text
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-medium text-[10px] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Text readable
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Text Color Selection for Solid Color */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-700">Text Contrast Mode</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onUpdateSettings({ textColor: 'dark' })}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition flex items-center gap-1 ${
                  settings.textColor === 'dark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                Dark Text
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ textColor: 'light' })}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition flex items-center gap-1 ${
                  settings.textColor === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-500" />
                Light Text
              </button>
            </div>
          </div>

          {/* Bootstrap 5 Theme Swatches */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Bootstrap 5 Theme Palette
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {BOOTSTRAP_PALETTE.map((item) => {
                const isSelected = solidHex.toLowerCase() === item.color.toLowerCase();
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => applySolidColor(item.color)}
                    className="group relative flex flex-col items-center p-1 rounded-lg border border-slate-200 hover:border-slate-400 bg-white transition hover:scale-102 cursor-pointer"
                    title={`${item.name} (${item.color})`}
                  >
                    <div
                      className="w-full h-6 rounded border border-black/10 flex items-center justify-center relative shadow-2xs"
                      style={{ backgroundColor: item.color }}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${item.light ? 'text-slate-900' : 'text-white'}`} />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 mt-0.5 truncate w-full text-center">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Neutrals & Surfaces */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Neutrals & Canvas Surfaces
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {NEUTRAL_PALETTE.map((c) => {
                const isSelected = solidHex.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applySolidColor(c)}
                    className="h-7 rounded-md border border-slate-300 relative flex items-center justify-center transition hover:scale-105 shadow-2xs cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 ${calculateLuminance(c) > 0.55 ? 'text-slate-900' : 'text-white'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modern Accent Shades */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Accent & Brand Shades
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {ACCENT_PALETTE.map((c) => {
                const isSelected = solidHex.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applySolidColor(c)}
                    className="h-7 rounded-md border border-slate-300 relative flex items-center justify-center transition hover:scale-105 shadow-2xs cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtle Pastel Tints */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Warm & Cool Tints
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {PASTEL_PALETTE.map((item) => {
                const isSelected = solidHex.toLowerCase() === item.color.toLowerCase();
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => applySolidColor(item.color)}
                    className={`text-left p-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 ring-1 ring-blue-500 bg-white shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <div
                        className="w-3.5 h-3.5 rounded border border-slate-300 shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-slate-700">{item.label}</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Colors (if any) */}
          {recentColors.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Recent Colors
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRecentColors([]);
                    localStorage.removeItem(RECENT_COLORS_KEY);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {recentColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applySolidColor(c)}
                    className="w-6 h-6 rounded-md border border-slate-300 relative flex items-center justify-center hover:scale-110 transition shadow-2xs cursor-pointer"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: GRADIENT                                                */}
      {/* ============================================================== */}
      {currentMode === 'gradient' && (
        <div className="space-y-4" id="gradient-controls">
          {/* Active Gradient Preview Box */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div
              className="h-20 w-full p-3 flex flex-col justify-between transition-all"
              style={{ background: settings.bgColor || currentGradientCss }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md ${
                    settings.textColor === 'light' ? 'bg-black/30 text-white' : 'bg-white/80 text-slate-900'
                  }`}
                >
                  Active Gradient
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(settings.bgColor || currentGradientCss);
                    setCopiedGradient(true);
                    setTimeout(() => setCopiedGradient(false), 1500);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold backdrop-blur-md transition flex items-center gap-1 cursor-pointer ${
                    settings.textColor === 'light'
                      ? 'bg-black/30 text-white hover:bg-black/50'
                      : 'bg-white/80 text-slate-900 hover:bg-white'
                  }`}
                  title="Copy CSS gradient string"
                >
                  {copiedGradient ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedGradient ? 'Copied' : 'Copy CSS'}</span>
                </button>
              </div>

              <p
                className={`text-xs font-bold leading-tight drop-shadow-xs ${
                  settings.textColor === 'light' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Sample Headline On Block Gradient
              </p>
            </div>

            {/* Quick Text Contrast Switcher for Gradient */}
            <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700">Contrast Text Color:</span>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ textColor: 'light' })}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                    settings.textColor === 'light'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  Light Text
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ textColor: 'dark' })}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                    settings.textColor === 'dark'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3 h-3 text-amber-400" />
                  Dark Text
                </button>
              </div>
            </div>
          </div>

          {/* Section A: Curated Gradient Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Gradient Presets
              </label>
              {/* Category Filter Pills */}
              <div className="flex gap-1 text-[10px]">
                {(['all', 'dark', 'vibrant', 'subtle'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGradientPresetFilter(cat)}
                    className={`px-2 py-0.5 rounded-full capitalize font-semibold transition cursor-pointer ${
                      gradientPresetFilter === cat
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected = settings.bgColor === preset.value;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyGradientPreset(preset)}
                    className={`h-14 rounded-xl border p-2 text-left relative overflow-hidden transition-all group flex flex-col justify-end cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-blue-500 border-blue-500 shadow-md scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-400 hover:shadow-xs'
                    }`}
                    style={{ background: preset.value }}
                    title={preset.name}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md w-fit truncate max-w-full ${
                        preset.textColor === 'light'
                          ? 'bg-black/40 text-white'
                          : 'bg-white/80 text-slate-900 border border-black/10'
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section B: Custom Interactive Gradient Builder */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Custom Gradient Studio
              </span>
              <button
                type="button"
                onClick={handleSwapStops}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer hover:underline"
                title="Swap stop colors"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Swap Colors
              </button>
            </div>

            {/* Gradient Type: Linear vs Radial */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span>Type</span>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setGradType('linear');
                    applyCustomGradient('linear', gradAngle, stop1Color, stop2Color, useStop3, stop3Color);
                  }}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                    gradType === 'linear' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGradType('radial');
                    applyCustomGradient('radial', gradAngle, stop1Color, stop2Color, useStop3, stop3Color);
                  }}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                    gradType === 'radial' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Radial
                </button>
              </div>
            </div>

            {/* Angle & Direction (if Linear) */}
            {gradType === 'linear' && (
              <div className="space-y-2 pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span>Linear Angle: {gradAngle}°</span>
                  <div className="flex items-center gap-1">
                    {[
                      { label: '45°', angle: 45, icon: ArrowUpRight },
                      { label: '90°', angle: 90, icon: ArrowRight },
                      { label: '135°', angle: 135, icon: ArrowDownRight },
                      { label: '180°', angle: 180, icon: ArrowDown },
                    ].map((dir) => {
                      const Icon = dir.icon;
                      return (
                        <button
                          key={dir.label}
                          type="button"
                          onClick={() => {
                            setGradAngle(dir.angle);
                            applyCustomGradient('linear', dir.angle, stop1Color, stop2Color, useStop3, stop3Color);
                          }}
                          className={`p-1 rounded-md border text-[10px] font-bold transition cursor-pointer ${
                            gradAngle === dir.angle
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`Set angle to ${dir.label}`}
                        >
                          <Icon className="w-3 h-3" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradAngle}
                  onChange={(e) => {
                    const ang = parseInt(e.target.value, 10);
                    setGradAngle(ang);
                    applyCustomGradient('linear', ang, stop1Color, stop2Color, useStop3, stop3Color);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            )}

            {/* Color Stop 1 & Stop 2 controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
              {/* Stop 1 */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Start Color</span>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => stop1Ref.current?.click()}
                      className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs cursor-pointer"
                      style={{ backgroundColor: stop1Color }}
                      title="Pick start color"
                    />
                    <input
                      ref={stop1Ref}
                      type="color"
                      value={stop1Color}
                      onChange={(e) => {
                        setStop1Color(e.target.value);
                        applyCustomGradient(gradType, gradAngle, e.target.value, stop2Color, useStop3, stop3Color);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={stop1Color}
                    onChange={(e) => {
                      setStop1Color(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        applyCustomGradient(gradType, gradAngle, e.target.value, stop2Color, useStop3, stop3Color);
                      }
                    }}
                    className="w-full text-[11px] font-mono font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded uppercase outline-hidden"
                  />
                </div>
              </div>

              {/* Stop 2 */}
              <div className="bg-white p-2 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">End Color</span>
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => stop2Ref.current?.click()}
                      className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs cursor-pointer"
                      style={{ backgroundColor: stop2Color }}
                      title="Pick end color"
                    />
                    <input
                      ref={stop2Ref}
                      type="color"
                      value={stop2Color}
                      onChange={(e) => {
                        setStop2Color(e.target.value);
                        applyCustomGradient(gradType, gradAngle, stop1Color, e.target.value, useStop3, stop3Color);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
                    />
                  </div>
                  <input
                    type="text"
                    value={stop2Color}
                    onChange={(e) => {
                      setStop2Color(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        applyCustomGradient(gradType, gradAngle, stop1Color, e.target.value, useStop3, stop3Color);
                      }
                    }}
                    className="w-full text-[11px] font-mono font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded uppercase outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Optional 3rd Middle Stop Toggle */}
            <div className="pt-1">
              <label className="flex items-center justify-between text-[11px] font-semibold text-slate-700 cursor-pointer">
                <span>Add 3rd Middle Stop (50%)</span>
                <input
                  type="checkbox"
                  checked={useStop3}
                  onChange={(e) => {
                    setUseStop3(e.target.checked);
                    applyCustomGradient(gradType, gradAngle, stop1Color, stop2Color, e.target.checked, stop3Color);
                  }}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
              </label>

              {useStop3 && (
                <div className="bg-white p-2 rounded-lg border border-slate-200 mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Mid Stop Color</span>
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => stop3Ref.current?.click()}
                        className="w-7 h-7 rounded-md border border-slate-300 shadow-2xs cursor-pointer"
                        style={{ backgroundColor: stop3Color }}
                        title="Pick middle stop color"
                      />
                      <input
                        ref={stop3Ref}
                        type="color"
                        value={stop3Color}
                        onChange={(e) => {
                          setStop3Color(e.target.value);
                          applyCustomGradient(gradType, gradAngle, stop1Color, stop2Color, true, e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
                      />
                    </div>
                    <input
                      type="text"
                      value={stop3Color}
                      onChange={(e) => {
                        setStop3Color(e.target.value);
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          applyCustomGradient(gradType, gradAngle, stop1Color, stop2Color, true, e.target.value);
                        }
                      }}
                      className="w-24 text-[11px] font-mono font-semibold px-1.5 py-1 bg-slate-50 border border-slate-200 rounded uppercase outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <button
              type="button"
              id="apply-custom-gradient-btn"
              onClick={() => applyCustomGradient()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Custom Gradient
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: IMAGE BACKGROUND                                        */}
      {/* ============================================================== */}
      {currentMode === 'image' && (
        <div className="space-y-4" id="image-background-controls">
          <BlockImageUploader
            imageUrl={settings.bgImage}
            onUpdateImage={(url) => {
              onUpdateSettings({
                bgImage: url,
                bgType: url ? 'image' : 'color',
              });
            }}
            overlayOpacity={settings.bgOverlayOpacity ?? 50}
            onUpdateOpacity={(val) => {
              onUpdateSettings({ bgOverlayOpacity: val });
            }}
            overlayColor={settings.bgOverlayColor || '#000000'}
            onUpdateOverlayColor={(color) => {
              onUpdateSettings({ bgOverlayColor: color });
            }}
            bgSize={settings.bgSize || 'cover'}
            onUpdateSize={(bgSize) => {
              onUpdateSettings({ bgSize });
            }}
            bgPosition={settings.bgPosition || 'center'}
            onUpdatePosition={(bgPosition) => {
              onUpdateSettings({ bgPosition });
            }}
            textColor={settings.textColor}
            onChangeTextColor={(textColor) => {
              onUpdateSettings({ textColor });
            }}
          />
        </div>
      )}
    </div>
  );
};
