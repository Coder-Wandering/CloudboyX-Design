import React, { useState, useEffect, useRef } from 'react';
import {
  Pipette,
  Check,
  Copy,
  Sparkles,
  Sun,
  Moon,
  RotateCcw,
} from 'lucide-react';

interface BlockColorPickerProps {
  color: string;
  onChangeColor: (newColor: string, suggestedTextColor?: 'dark' | 'light') => void;
  textColor: 'dark' | 'light';
  onChangeTextColor: (textColor: 'dark' | 'light') => void;
  onSetGradient?: (gradient: string) => void;
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

const GRADIENT_PRESETS = [
  { label: 'Midnight Slate', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { label: 'Royal Blue', value: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)' },
  { label: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
  { label: 'Emerald Breeze', value: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
  { label: 'Dark Cyber', value: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' },
  { label: 'Ocean Twilight', value: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)' },
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

export const BlockColorPicker: React.FC<BlockColorPickerProps> = ({
  color,
  onChangeColor,
  textColor,
  onChangeTextColor,
  onSetGradient,
}) => {
  const [hexInput, setHexInput] = useState(color || '#ffffff');
  const [copied, setCopied] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Sync internal hex input with external prop
  useEffect(() => {
    if (color && !color.startsWith('linear-gradient')) {
      setHexInput(color);
    }
  }, [color]);

  // Load recent colors
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_COLORS_KEY);
      if (saved) {
        setRecentColors(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const saveRecentColor = (newHex: string) => {
    if (!newHex || !newHex.startsWith('#')) return;
    try {
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c.toLowerCase() !== newHex.toLowerCase());
        const updated = [newHex, ...filtered].slice(0, 8);
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      // Ignore
    }
  };

  const handleApplyColor = (val: string) => {
    setHexInput(val);
    saveRecentColor(val);
    const lum = calculateLuminance(val);
    const suggestedText: 'dark' | 'light' = lum > 0.55 ? 'dark' : 'light';
    onChangeColor(val, suggestedText);
  };

  const handleHexInputChange = (val: string) => {
    let formatted = val.trim();
    if (!formatted.startsWith('#') && formatted.length > 0 && !formatted.startsWith('rgb')) {
      formatted = '#' + formatted;
    }
    setHexInput(formatted);
    if (/^#[0-9A-Fa-f]{6}$/.test(formatted) || /^#[0-9A-Fa-f]{3}$/.test(formatted)) {
      handleApplyColor(formatted);
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(hexInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Browser EyeDropper API
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleApplyColor(result.sRGBHex);
        }
      } catch (e) {
        // User canceled eyedropper
      }
    } else if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const currentLuminance = calculateLuminance(hexInput);
  const isLightBg = currentLuminance > 0.55;
  const isContrastOptimal = (isLightBg && textColor === 'dark') || (!isLightBg && textColor === 'light');
  const hasEyeDropperSupport = typeof window !== 'undefined' && 'EyeDropper' in window;

  return (
    <div className="space-y-4">
      {/* Interactive Picker & Current Swatch */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-3">
          {/* Native Color Picker / Large Swatch Button */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className="w-12 h-12 rounded-xl border-2 border-slate-300 shadow-sm relative overflow-hidden transition-transform active:scale-95 group-hover:border-blue-500"
              style={{ backgroundColor: hexInput.startsWith('#') ? hexInput : '#ffffff' }}
              title="Click to open color palette"
            >
              <span className="sr-only">Choose Color</span>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={hexInput.startsWith('#') && hexInput.length === 7 ? hexInput : '#ffffff'}
              onChange={(e) => handleApplyColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none w-full h-full"
            />
          </div>

          {/* Hex Input & Tool Buttons */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  placeholder="#ffffff"
                  maxLength={9}
                  className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>

              {/* Eyedropper Button */}
              <button
                type="button"
                onClick={handleEyeDropper}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
                title={hasEyeDropperSupport ? "Pick color from screen" : "Open color wheel"}
              >
                <Pipette className="w-3.5 h-3.5" />
              </button>

              {/* Copy Hex Button */}
              <button
                type="button"
                onClick={handleCopyHex}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
                title="Copy HEX code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Reset to White */}
              <button
                type="button"
                onClick={() => handleApplyColor('#ffffff')}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                title="Reset to White"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Luminance & Contrast Indicator */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 flex items-center gap-1">
                {isLightBg ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-500" />}
                {isLightBg ? 'Light Background' : 'Dark Background'}
              </span>

              {!isContrastOptimal && (
                <button
                  type="button"
                  onClick={() => onChangeTextColor(isLightBg ? 'dark' : 'light')}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5 hover:underline"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  Fix contrast to {isLightBg ? 'dark' : 'light'} text
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap 5 Theme Swatches */}
      <div>
        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
          Bootstrap 5 Palette
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {BOOTSTRAP_PALETTE.map((item) => {
            const isSelected = hexInput.toLowerCase() === item.color.toLowerCase();
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleApplyColor(item.color)}
                className="group relative flex flex-col items-center p-1 rounded-lg border border-slate-200 hover:border-slate-400 bg-white transition hover:scale-102"
                title={`${item.name} (${item.color})`}
              >
                <div
                  className="w-full h-6 rounded border border-black/10 flex items-center justify-center relative shadow-xs"
                  style={{ backgroundColor: item.color }}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        item.light ? 'text-slate-900' : 'text-white'
                      }`}
                    />
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
          Neutrals & Surfaces
        </label>
        <div className="grid grid-cols-6 gap-1.5">
          {NEUTRAL_PALETTE.map((c) => {
            const isSelected = hexInput.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleApplyColor(c)}
                className="h-7 rounded-md border border-slate-300 relative flex items-center justify-center transition hover:scale-105 shadow-xs"
                style={{ backgroundColor: c }}
                title={c}
              >
                {isSelected && (
                  <Check
                    className={`w-3 h-3 ${
                      calculateLuminance(c) > 0.55 ? 'text-slate-900' : 'text-white'
                    }`}
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
          Accent & Brand Colors
        </label>
        <div className="grid grid-cols-6 gap-1.5">
          {ACCENT_PALETTE.map((c) => {
            const isSelected = hexInput.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleApplyColor(c)}
                className="h-7 rounded-md border border-slate-300 relative flex items-center justify-center transition hover:scale-105 shadow-xs"
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
          Subtle Warm & Cool Tints
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {PASTEL_PALETTE.map((item) => {
            const isSelected = hexInput.toLowerCase() === item.color.toLowerCase();
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleApplyColor(item.color)}
                className={`text-left p-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-between transition ${
                  isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-white'
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

      {/* Modern CSS Gradients (Optional Quick Tweak) */}
      {onSetGradient && (
        <div>
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Modern Gradient Presets
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {GRADIENT_PRESETS.map((grad) => (
              <button
                key={grad.label}
                type="button"
                onClick={() => onSetGradient(grad.value)}
                className="h-8 rounded-lg border border-slate-200 relative overflow-hidden text-left p-1.5 transition hover:scale-102 hover:shadow-xs group"
                style={{ background: grad.value }}
                title={grad.label}
              >
                <span className="text-[10px] font-semibold text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs block truncate w-fit">
                  {grad.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {recentColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleApplyColor(c)}
                className="w-6 h-6 rounded-md border border-slate-300 relative flex items-center justify-center hover:scale-110 transition shadow-xs"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
