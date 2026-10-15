import React from 'react';
import {
  Waves,
  Minus,
  Sliders,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Maximize2,
  Sparkles,
  Check,
  SplitSquareVertical,
} from 'lucide-react';
import { BlockInstance, SiteTheme } from '../types';

interface SectionDividerEditorProps {
  block: BlockInstance;
  theme: SiteTheme;
  onUpdateContent: (content: Partial<BlockInstance['content']>) => void;
  onUpdateSettings?: (settings: Partial<BlockInstance['settings']>) => void;
  isDark?: boolean;
}

export const DIVIDER_STYLES = [
  {
    id: 'wave-smooth',
    name: 'Smooth Wave',
    category: 'SVG Wave',
    description: 'Gentle organic sinusoidal wave transition',
  },
  {
    id: 'wave-layered',
    name: 'Layered Waves',
    category: 'SVG Wave',
    description: 'Double wave with subtle opacity depth',
  },
  {
    id: 'curve-concave',
    name: 'Concave Curve',
    category: 'SVG Curve',
    description: 'Graceful scooped curve arch',
  },
  {
    id: 'curve-convex',
    name: 'Convex Dome',
    category: 'SVG Curve',
    description: 'Smooth rounded crest transition',
  },
  {
    id: 'tilt-slant',
    name: 'Diagonal Slant',
    category: 'SVG Geometric',
    description: 'Modern angled architectural slice',
  },
  {
    id: 'triangle-arrow',
    name: 'Triangle Pointer',
    category: 'SVG Geometric',
    description: 'Centered arrow pointing down to next section',
  },
  {
    id: 'zigzag',
    name: 'Geometric Zigzag',
    category: 'SVG Geometric',
    description: 'Dynamic sawtooth tech divider',
  },
  {
    id: 'line-solid',
    name: 'Solid Border Rule',
    category: 'Border Rule',
    description: 'Clean classic horizontal rule with custom weight',
  },
  {
    id: 'line-dashed',
    name: 'Dashed Border Rule',
    category: 'Border Rule',
    description: 'Blueprint-style dashed separator',
  },
  {
    id: 'line-dotted',
    name: 'Dotted Border Rule',
    category: 'Border Rule',
    description: 'Refined dotted section divider',
  },
  {
    id: 'line-gradient',
    name: 'Gradient Glow Line',
    category: 'Border Rule',
    description: 'Luminous fade-out glowing center rule',
  },
  {
    id: 'line-badge',
    name: 'Badge Centered Rule',
    category: 'Border Rule',
    description: 'Dividing line with centered text or icon badge',
  },
  {
    id: 'spacer-only',
    name: 'Clean Spacing Buffer',
    category: 'Spacing',
    description: 'Invisible vertical breathing room between blocks',
  },
];

export const SectionDividerEditor: React.FC<SectionDividerEditorProps> = ({
  block,
  theme,
  onUpdateContent,
  onUpdateSettings,
  isDark = false,
}) => {
  const content = block.content || {};
  const dividerType = content.dividerType || 'wave-smooth';
  const height = typeof content.height === 'number' ? content.height : 70;
  const fillColor = content.fillColor || theme.primaryColor || '#0d6efd';
  const bgColor = content.bgColor || 'transparent';
  const flipHorizontal = Boolean(content.flipHorizontal);
  const flipVertical = Boolean(content.flipVertical);
  const lineWidth = content.lineWidth || 2;
  const lineOpacity = typeof content.lineOpacity === 'number' ? content.lineOpacity : 80;
  const badgeText = content.badgeText || 'Section Break';
  const badgeIcon = content.badgeIcon || 'bi-stars';
  const showBadge = Boolean(content.showBadge);

  const isSvgType = [
    'wave-smooth',
    'wave-layered',
    'curve-concave',
    'curve-convex',
    'tilt-slant',
    'triangle-arrow',
    'zigzag',
  ].includes(dividerType);

  const isLineType = [
    'line-solid',
    'line-dashed',
    'line-dotted',
    'line-gradient',
    'line-badge',
  ].includes(dividerType);

  const isSpacerType = dividerType === 'spacer-only';

  return (
    <div className="space-y-4 text-xs">
      {/* Preset Divider Style Selector */}
      <div>
        <label className={`block font-bold mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
          Divider Transition Style
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {DIVIDER_STYLES.map((style) => {
            const isSelected = dividerType === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onUpdateContent({ dividerType: style.id })}
                className={`text-left p-2 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-blue-950/60 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                      : 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-[11px] truncate">{style.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-blue-500 shrink-0" />}
                </div>
                <div className="text-[10px] opacity-60 truncate">{style.category}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Height / Spacing Control */}
      <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <Maximize2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{isSpacerType ? 'Spacing Height' : 'Divider Height / Amplitude'}</span>
          </label>
          <span className="font-mono text-[11px] font-bold text-blue-500">{height}px</span>
        </div>
        <input
          type="range"
          min="10"
          max="220"
          step="5"
          value={height}
          onChange={(e) => onUpdateContent({ height: parseInt(e.target.value, 10) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Subtle (20px)</span>
          <span>Balanced (70px)</span>
          <span>Dramatic (180px)</span>
        </div>
      </div>

      {/* SVG Transitions Orientation & Colors */}
      {isSvgType && (
        <div className={`p-3 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="font-bold flex items-center gap-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-500" />
            <span>SVG Wave & Curve Controls</span>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium block mb-1">Fill Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fillColor.startsWith('#') ? fillColor : '#0d6efd'}
                  onChange={(e) => onUpdateContent({ fillColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={fillColor}
                  onChange={(e) => onUpdateContent({ fillColor: e.target.value })}
                  placeholder="#0d6efd"
                  className={`w-full text-[11px] px-2 py-1 rounded border outline-none font-mono ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1">Background Fill</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                  onChange={(e) => onUpdateContent({ bgColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <button
                  type="button"
                  onClick={() => onUpdateContent({ bgColor: 'transparent' })}
                  className={`px-2 py-1 text-[10px] rounded border transition ${
                    bgColor === 'transparent'
                      ? 'bg-blue-600 text-white font-bold'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  Transparent
                </button>
              </div>
            </div>
          </div>

          {/* Orientation Flippers */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onUpdateContent({ flipHorizontal: !flipHorizontal })}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                flipHorizontal
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>Flip Horizontal</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateContent({ flipVertical: !flipVertical })}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                flipVertical
                  ? 'bg-blue-600 text-white border-blue-600'
                  : isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FlipVertical className="w-3.5 h-3.5" />
              <span>Invert Vertical</span>
            </button>
          </div>
        </div>
      )}

      {/* Border Styles Controls */}
      {isLineType && (
        <div className={`p-3 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="font-bold flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-blue-500" />
            <span>Border Line Attributes</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium block mb-1">Line Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fillColor.startsWith('#') ? fillColor : '#0d6efd'}
                  onChange={(e) => onUpdateContent({ fillColor: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-300 p-0.5 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={fillColor}
                  onChange={(e) => onUpdateContent({ fillColor: e.target.value })}
                  className={`w-full text-[11px] px-2 py-1 rounded border outline-none font-mono ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1">Line Thickness ({lineWidth}px)</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={lineWidth}
                onChange={(e) => onUpdateContent({ lineWidth: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-600 mt-1.5"
              />
            </div>
          </div>

          {/* Line Opacity */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="font-medium">Line Opacity</span>
              <span className="font-mono font-bold text-blue-500">{lineOpacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={lineOpacity}
              onChange={(e) => onUpdateContent({ lineOpacity: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Centered Badge Text / Icon (If line-badge) */}
          {dividerType === 'line-badge' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-[11px] font-bold block">Centered Badge Label</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => onUpdateContent({ badgeText: e.target.value })}
                placeholder="e.g., Section Break or ✦"
                className={`w-full text-xs px-2.5 py-1.5 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
