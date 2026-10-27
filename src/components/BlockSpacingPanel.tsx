import React, { useState } from 'react';
import {
  Link2,
  Unlink,
  Copy,
  Check,
  RotateCcw,
  Info,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  ArrowUpDown,
  Wand2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { BlockSettings, BlockInstance, SiteTheme } from '../types';
import { Breakpoint } from '../engine/bootstrapCascade';
import {
  calculateBlockMarginBottom,
  resolveThemeRhythmScale,
  isAutoVerticalRhythmEnabled,
  setAutoVerticalRhythmEnabled,
} from '../utils/verticalRhythm';

interface BlockSpacingPanelProps {
  settings: BlockSettings;
  onUpdateSettings: (newSettings: Partial<BlockSettings>) => void;
  blockId?: string;
  activeBreakpoint?: Breakpoint;
  blocks?: BlockInstance[];
  theme?: SiteTheme;
  autoVerticalRhythm?: boolean;
  onToggleAutoVerticalRhythm?: (enabled?: boolean) => void;
  onApplyVerticalRhythmToAll?: () => void;
}

type SpacingLinkMode = 'individual' | 'axes' | 'all';

export const BlockSpacingPanel: React.FC<BlockSpacingPanelProps> = ({
  settings,
  onUpdateSettings,
  blockId,
  activeBreakpoint = 'md',
  blocks = [],
  theme,
  autoVerticalRhythm: autoRhythmProp,
  onToggleAutoVerticalRhythm,
  onApplyVerticalRhythmToAll,
}) => {
  const [paddingLinkMode, setPaddingLinkMode] = useState<SpacingLinkMode>('individual');
  const [marginLinkMode, setMarginLinkMode] = useState<SpacingLinkMode>('individual');
  const [copied, setCopied] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [activeSideFocus, setActiveSideFocus] = useState<string | null>(null);

  // Normalize current values with defaults
  const pt = typeof settings.paddingTop === 'number' ? settings.paddingTop : 5;
  const pb = typeof settings.paddingBottom === 'number' ? settings.paddingBottom : 5;
  const ps = typeof settings.paddingLeft === 'number' ? settings.paddingLeft : 0;
  const pe = typeof settings.paddingRight === 'number' ? settings.paddingRight : 0;

  const mt = typeof settings.marginTop === 'number' ? settings.marginTop : 0;
  const mb = typeof settings.marginBottom === 'number' ? settings.marginBottom : 0;
  const ms = settings.marginLeft ?? 0;
  const me = settings.marginRight ?? 0;

  // Local fallback if not passed from parent
  const [localAutoRhythm, setLocalAutoRhythm] = useState<boolean>(() => isAutoVerticalRhythmEnabled());
  const isAutoRhythm = autoRhythmProp !== undefined ? autoRhythmProp : localAutoRhythm;

  const handleToggleAutoRhythm = () => {
    const next = !isAutoRhythm;
    setLocalAutoRhythm(next);
    setAutoVerticalRhythmEnabled(next);
    if (onToggleAutoVerticalRhythm) {
      onToggleAutoVerticalRhythm(next);
    }
  };

  // Find index of current block and evaluate logical vertical rhythm
  const currentBlockIndex = blocks && blockId ? blocks.findIndex((b) => b.id === blockId) : -1;
  const currentBlock = currentBlockIndex >= 0 && blocks ? blocks[currentBlockIndex] : null;
  const nextBlock = currentBlockIndex >= 0 && blocks && currentBlockIndex < blocks.length - 1 ? blocks[currentBlockIndex + 1] : null;

  const rhythmCalc = currentBlock && theme
    ? calculateBlockMarginBottom(currentBlock, nextBlock, theme, currentBlockIndex, blocks.length)
    : null;

  const activeScale = resolveThemeRhythmScale(theme);

  // Scale map description
  const scaleDescription: Record<number, string> = {
    0: '0px (0rem)',
    1: '4px (0.25rem)',
    2: '8px (0.5rem)',
    3: '16px (1rem)',
    4: '24px (1.5rem)',
    5: '48px (3rem)',
  };

  // Generate current Bootstrap utility class strings
  const computeActiveClasses = (): string[] => {
    const list: string[] = [];

    // Padding
    if (pt === pb && pb === ps && ps === pe && pt > 0) {
      list.push(`p-${pt}`);
    } else {
      if (pt === pb && pt > 0) {
        list.push(`py-${pt}`);
      } else {
        if (pt > 0) list.push(`pt-${pt}`);
        if (pb > 0) list.push(`pb-${pb}`);
      }

      if (ps === pe && ps > 0) {
        list.push(`px-${ps}`);
      } else {
        if (ps > 0) list.push(`ps-${ps}`);
        if (pe > 0) list.push(`pe-${pe}`);
      }
    }

    // Margin
    if (mt === mb && mb === ms && ms === me && typeof mt === 'number' && mt > 0) {
      list.push(`m-${mt}`);
    } else {
      if (mt === mb && mt > 0) {
        list.push(`my-${mt}`);
      } else {
        if (mt > 0) list.push(`mt-${mt}`);
        if (mb > 0) list.push(`mb-${mb}`);
      }

      if (ms === 'auto' && me === 'auto') {
        list.push('mx-auto');
      } else {
        if (ms === 'auto') list.push('ms-auto');
        else if (typeof ms === 'number' && ms > 0) list.push(`ms-${ms}`);

        if (me === 'auto') list.push('me-auto');
        else if (typeof me === 'number' && me > 0) list.push(`me-${me}`);
      }
    }

    if (list.length === 0) {
      list.push('p-0', 'm-0');
    }

    return list;
  };

  const activeClasses = computeActiveClasses();

  const handleCopyClasses = () => {
    navigator.clipboard.writeText(activeClasses.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetDefaults = () => {
    onUpdateSettings({
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 0,
      paddingRight: 0,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
    });
  };

  // Padding handlers
  const handleSetPaddingAll = (val: number) => {
    onUpdateSettings({
      paddingTop: val,
      paddingBottom: val,
      paddingLeft: val,
      paddingRight: val,
    });
  };

  const handleSetPaddingY = (val: number) => {
    onUpdateSettings({
      paddingTop: val,
      paddingBottom: val,
    });
  };

  const handleSetPaddingX = (val: number) => {
    onUpdateSettings({
      paddingLeft: val,
      paddingRight: val,
    });
  };

  // Margin handlers
  const handleSetMarginAll = (val: number) => {
    onUpdateSettings({
      marginTop: val,
      marginBottom: val,
      marginLeft: val,
      marginRight: val,
    });
  };

  const handleSetMarginY = (val: number) => {
    onUpdateSettings({
      marginTop: val,
      marginBottom: val,
    });
  };

  const handleSetMarginX = (val: number | 'auto') => {
    onUpdateSettings({
      marginLeft: val,
      marginRight: val,
    });
  };

  // Presets
  const presets = [
    {
      name: 'Default Section',
      desc: 'Standard py-5',
      settings: { paddingTop: 5, paddingBottom: 5, paddingLeft: 0, paddingRight: 0, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
    },
    {
      name: 'Compact',
      desc: 'Tight py-3',
      settings: { paddingTop: 3, paddingBottom: 3, paddingLeft: 0, paddingRight: 0, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
    },
    {
      name: 'Hero Expansive',
      desc: 'Spacious py-5 px-3',
      settings: { paddingTop: 5, paddingBottom: 5, paddingLeft: 3, paddingRight: 3, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
    },
    {
      name: 'Island Card',
      desc: 'Padded p-4 my-4',
      settings: { paddingTop: 4, paddingBottom: 4, paddingLeft: 4, paddingRight: 4, marginTop: 4, marginBottom: 4, marginLeft: 0, marginRight: 0 },
    },
    {
      name: 'Centered Block',
      desc: 'mx-auto my-3 py-4',
      settings: { paddingTop: 4, paddingBottom: 4, paddingLeft: 0, paddingRight: 0, marginTop: 3, marginBottom: 3, marginLeft: 'auto', marginRight: 'auto' },
    },
    {
      name: 'Flush (Edge-to-Edge)',
      desc: 'Zero p-0 m-0',
      settings: { paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 },
    },
  ];

  return (
    <div className="space-y-4" id="block-spacing-panel">
      {/* Header & Quick Action Row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Bootstrap Spacing
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Adjust padding and margin using standard Bootstrap 5 scale (0–5)
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Reset Spacing to Default (py-5)"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            title="Bootstrap Spacing Guide"
            className={`p-1.5 rounded-lg transition ${
              showHelper ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helper Guide Collapsible */}
      {showHelper && (
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-2 text-blue-900 animate-in fade-in duration-200">
          <div className="font-semibold flex items-center justify-between text-blue-950">
            <span>Bootstrap 5 Spacing Scale & Utility Reference</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-200/60 rounded text-blue-800 font-mono">v5.3</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] pt-1">
            <div><span className="font-mono font-bold">p*</span>: Padding (inside container)</div>
            <div><span className="font-mono font-bold">m*</span>: Margin (outside container)</div>
            <div><span className="font-mono font-bold">t / b</span>: Top / Bottom</div>
            <div><span className="font-mono font-bold">s / e</span>: Start (Left) / End (Right)</div>
            <div><span className="font-mono font-bold">x / y</span>: Horizontal / Vertical</div>
            <div><span className="font-mono font-bold">auto</span>: Margin auto (centering)</div>
          </div>
          <div className="border-t border-blue-200/70 pt-2 grid grid-cols-6 text-center text-[10px] font-mono">
            <div><span className="font-bold">0</span><br />0px</div>
            <div><span className="font-bold">1</span><br />4px</div>
            <div><span className="font-bold">2</span><br />8px</div>
            <div><span className="font-bold">3</span><br />16px</div>
            <div><span className="font-bold">4</span><br />24px</div>
            <div><span className="font-bold">5</span><br />48px</div>
          </div>
        </div>
      )}

      {/* Active Bootstrap Classes Badge Card */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Active Bootstrap Classes
          </span>
          <button
            type="button"
            onClick={handleCopyClasses}
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeClasses.map((cls, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded ${
                cls.startsWith('p')
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              .{cls}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive CSS Box Model Diagram */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Box Model Inspector
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-xs bg-amber-400" /> Margin (m)
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-xs bg-emerald-400" /> Padding (p)
            </span>
          </div>
        </div>

        {/* The Concentric Box Model */}
        <div className="relative p-4 rounded-xl bg-amber-50/80 border-2 border-dashed border-amber-300/80 transition-colors">
          {/* Margin Label */}
          <div className="absolute top-1 left-2 text-[9px] font-bold text-amber-800 tracking-wider uppercase">
            Margin (Outer)
          </div>

          {/* Margin Top Badge */}
          <div className="flex justify-center mb-2">
            <button
              type="button"
              onClick={() => setActiveSideFocus('mt')}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs ${
                activeSideFocus === 'mt'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              mt-{mt}
            </button>
          </div>

          {/* Middle Row with Left Margin, Padding Box, Right Margin */}
          <div className="flex items-center justify-between gap-2">
            {/* Margin Left Badge */}
            <button
              type="button"
              onClick={() => setActiveSideFocus('ms')}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs shrink-0 ${
                activeSideFocus === 'ms'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              ms-{ms}
            </button>

            {/* Inner Box: PADDING */}
            <div className="relative flex-1 p-3 rounded-lg bg-emerald-50/90 border-2 border-dashed border-emerald-300 transition-colors">
              {/* Padding Label */}
              <div className="absolute top-1 left-2 text-[9px] font-bold text-emerald-800 tracking-wider uppercase">
                Padding (Inner)
              </div>

              {/* Padding Top Badge */}
              <div className="flex justify-center mb-2">
                <button
                  type="button"
                  onClick={() => setActiveSideFocus('pt')}
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs ${
                    activeSideFocus === 'pt'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  pt-{pt}
                </button>
              </div>

              {/* Padding Left, Core Content, Padding Right */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSideFocus('ps')}
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs shrink-0 ${
                    activeSideFocus === 'ps'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  ps-{ps}
                </button>

                {/* Core Block Content Center */}
                <div className="flex-1 py-3 px-2 bg-white rounded border border-slate-200 text-center shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    {settings.containerWidth === 'container-fluid' ? '.container-fluid' : '.container'}
                  </span>
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider mt-0.5">
                    Block Core
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSideFocus('pe')}
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs shrink-0 ${
                    activeSideFocus === 'pe'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  pe-{pe}
                </button>
              </div>

              {/* Padding Bottom Badge */}
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={() => setActiveSideFocus('pb')}
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs ${
                    activeSideFocus === 'pb'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                      : 'bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  pb-{pb}
                </button>
              </div>
            </div>

            {/* Margin Right Badge */}
            <button
              type="button"
              onClick={() => setActiveSideFocus('me')}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs shrink-0 ${
                activeSideFocus === 'me'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              me-{me}
            </button>
          </div>

          {/* Margin Bottom Badge */}
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={() => setActiveSideFocus('mb')}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition shadow-xs ${
                activeSideFocus === 'mb'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                  : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              mb-{mb}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: PADDING CONTROLS (pt, pb, ps, pe) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Padding (Inner Spacing)
            </span>
          </div>

          {/* Mode Switcher: Individual vs Axes (X/Y) vs All */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setPaddingLinkMode('individual')}
              className={`px-2 py-1 rounded transition ${
                paddingLinkMode === 'individual'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sides (4)
            </button>
            <button
              type="button"
              onClick={() => setPaddingLinkMode('axes')}
              className={`px-2 py-1 rounded transition ${
                paddingLinkMode === 'axes'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              X / Y Axes
            </button>
            <button
              type="button"
              onClick={() => setPaddingLinkMode('all')}
              className={`px-2 py-1 rounded transition ${
                paddingLinkMode === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link All
            </button>
          </div>
        </div>

        {/* View A: Link All Mode */}
        {paddingLinkMode === 'all' && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                All Sides (p-{pt})
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-700">
                {scaleDescription[pt] || `${pt}`}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetPaddingAll(val)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                    pt === val && pb === val && ps === val && pe === val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  p-{val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View B: Axes X / Y Mode */}
        {paddingLinkMode === 'axes' && (
          <div className="space-y-3">
            {/* Vertical Padding (py) */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Vertical Padding (py-{pt})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Top & Bottom
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSetPaddingY(val)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                      pt === val && pb === val
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    py-{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Padding (px) */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Horizontal Padding (px-{ps})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Start & End
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSetPaddingX(val)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                      ps === val && pe === val
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    px-{val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View C: Individual Sides Mode */}
        {paddingLinkMode === 'individual' && (
          <div className="space-y-3">
            {/* Top */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Padding Top (<code className="text-emerald-700 font-bold">pt-{pt}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[pt]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ paddingTop: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      pt === val
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Padding Bottom (<code className="text-emerald-700 font-bold">pb-{pb}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[pb]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ paddingBottom: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      pb === val
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Left / Start */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Padding Left / Start (<code className="text-emerald-700 font-bold">ps-{ps}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[ps]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ paddingLeft: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      ps === val
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Right / End */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Padding Right / End (<code className="text-emerald-700 font-bold">pe-{pe}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[pe]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ paddingRight: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      pe === val
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: MARGIN CONTROLS (mt, mb, ms, me) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Margin (Outer Spacing)
            </span>
          </div>

          {/* Mode Switcher: Individual vs Axes vs All */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setMarginLinkMode('individual')}
              className={`px-2 py-1 rounded transition ${
                marginLinkMode === 'individual'
                  ? 'bg-white text-amber-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sides (4)
            </button>
            <button
              type="button"
              onClick={() => setMarginLinkMode('axes')}
              className={`px-2 py-1 rounded transition ${
                marginLinkMode === 'axes'
                  ? 'bg-white text-amber-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              X / Y Axes
            </button>
            <button
              type="button"
              onClick={() => setMarginLinkMode('all')}
              className={`px-2 py-1 rounded transition ${
                marginLinkMode === 'all'
                  ? 'bg-white text-amber-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link All
            </button>
          </div>
        </div>

        {/* View A: Link All Margin */}
        {marginLinkMode === 'all' && (
          <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-amber-600" />
                All Sides (m-{mt})
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-800">
                {scaleDescription[mt] || `${mt}`}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSetMarginAll(val)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                    mt === val && mb === val && ms === val && me === val
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  m-{val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View B: Axes X / Y Margin */}
        {marginLinkMode === 'axes' && (
          <div className="space-y-3">
            {/* Vertical Margin (my) */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Vertical Margin (my-{mt})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Top & Bottom
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSetMarginY(val)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                      mt === val && mb === val
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    my-{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Margin (mx) */}
            <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                  Horizontal Margin (mx-{ms})
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Start & End (or Auto)
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSetMarginX(val)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                      ms === val && me === val
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleSetMarginX('auto')}
                  className={`py-1.5 text-xs font-mono font-bold rounded-md transition ${
                    ms === 'auto' && me === 'auto'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                  }`}
                >
                  auto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View C: Individual Sides Margin */}
        {marginLinkMode === 'individual' && (
          <div className="space-y-3">
            {/* Top */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Margin Top (<code className="text-amber-800 font-bold">mt-{mt}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[mt]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ marginTop: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      mt === val
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Margin Bottom (<code className="text-amber-800 font-bold">mb-{mb}</code>)
                </span>
                <span className="text-[10px] text-slate-500">{scaleDescription[mb]}</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ marginBottom: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      mb === val
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Left / Start */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Margin Left / Start (<code className="text-amber-800 font-bold">ms-{ms}</code>)
                </span>
                <span className="text-[10px] text-slate-500">
                  {ms === 'auto' ? 'auto (push right)' : scaleDescription[typeof ms === 'number' ? ms : 0]}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ marginLeft: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      ms === val
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ marginLeft: 'auto' })}
                  className={`py-1 text-xs font-mono font-bold rounded transition ${
                    ms === 'auto'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  auto
                </button>
              </div>
            </div>

            {/* Right / End */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  Margin Right / End (<code className="text-amber-800 font-bold">me-{me}</code>)
                </span>
                <span className="text-[10px] text-slate-500">
                  {me === 'auto' ? 'auto (push left)' : scaleDescription[typeof me === 'number' ? me : 0]}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ marginRight: val })}
                    className={`py-1 text-xs font-mono font-semibold rounded transition ${
                      me === val
                        ? 'bg-amber-500 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ marginRight: 'auto' })}
                  className={`py-1 text-xs font-mono font-bold rounded transition ${
                    me === 'auto'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  auto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: LOGICAL VERTICAL RHYTHM & THEME SPACING */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Logical Vertical Rhythm
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="capitalize font-medium text-blue-600">{activeScale} Scale</span>
                <span aria-hidden="true">·</span>
                <span>{theme?.fontFamily || 'Inter'} typography</span>
              </div>
            </div>
          </div>

          {/* Auto-reorder spacing toggle */}
          <button
            type="button"
            onClick={handleToggleAutoRhythm}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border cursor-pointer ${
              isAutoRhythm
                ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
            }`}
            title="When active, reordering blocks automatically calculates and applies logical margin-bottom spacing based on theme rhythm and adjacent block types"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>Auto-calc:</span>
            <span className={`text-[10px] uppercase font-mono font-bold ${isAutoRhythm ? 'text-blue-100' : 'text-slate-500'}`}>
              {isAutoRhythm ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Diagnostic for Current Block */}
        {rhythmCalc && (
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-800">
                  Calculated Optimal:
                </span>
                <code className="px-1.5 py-0.5 rounded font-mono font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                  mb-{rhythmCalc.marginBottom}
                </code>
                {mb === rhythmCalc.marginBottom ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    In Sync
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-medium">
                    Current: mb-{mb}
                  </span>
                )}
              </div>

              {mb !== rhythmCalc.marginBottom && (
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ marginBottom: rhythmCalc.marginBottom })}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition shadow-2xs cursor-pointer"
                >
                  Apply mb-{rhythmCalc.marginBottom}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {rhythmCalc.reason}
            </p>
          </div>
        )}

        {/* Global Action: Auto-balance all blocks */}
        {onApplyVerticalRhythmToAll && (
          <button
            type="button"
            onClick={onApplyVerticalRhythmToAll}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Harmonize All Block Margins for this Theme</span>
          </button>
        )}
      </div>

      {/* SECTION 3: QUICK SPACING PRESETS */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Quick Spacing Presets
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onUpdateSettings(preset.settings)}
              className="text-left p-2.5 rounded-lg border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition group"
            >
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 block">
                {preset.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                {preset.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
