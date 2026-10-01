import React, { useState } from 'react';
import {
  Layers,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sun,
  Moon,
  Sparkles,
  Box,
} from 'lucide-react';
import { BlockSettings } from '../types';

interface BlockShadowsPanelProps {
  settings: BlockSettings;
  onUpdateSettings: (newSettings: Partial<BlockSettings>) => void;
  blockId?: string;
}

type BootstrapShadowClass = 'shadow-none' | 'shadow-sm' | 'shadow' | 'shadow-lg';

interface ShadowOption {
  id: BootstrapShadowClass;
  label: string;
  name: string;
  elevation: string;
  description: string;
  cssRule: string;
  previewShadowStyle: string;
}

export const BlockShadowsPanel: React.FC<BlockShadowsPanelProps> = ({
  settings,
  onUpdateSettings,
  blockId,
}) => {
  const [copied, setCopied] = useState(false);
  const [previewSurface, setPreviewSurface] = useState<'light' | 'gray' | 'dark'>('gray');
  const [showHelper, setShowHelper] = useState(false);

  // Active shadow class on block (default is shadow-none if undefined)
  const currentShadow: BootstrapShadowClass = settings.shadow || 'shadow-none';

  const shadowOptions: ShadowOption[] = [
    {
      id: 'shadow-none',
      name: 'No Shadow',
      label: 'Flat / None',
      elevation: 'Level 0',
      description: 'Removes any existing drop shadow (box-shadow: none)',
      cssRule: 'box-shadow: none !important;',
      previewShadowStyle: 'none',
    },
    {
      id: 'shadow-sm',
      name: 'Small Shadow',
      label: 'Subtle',
      elevation: 'Level 1',
      description: 'Gentle, subtle elevation for soft boundaries and light cards',
      cssRule: 'box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;',
      previewShadowStyle: '0 2px 4px rgba(0, 0, 0, 0.08)',
    },
    {
      id: 'shadow',
      name: 'Regular Shadow',
      label: 'Standard',
      elevation: 'Level 2',
      description: 'Balanced default drop shadow for elevated sections and modals',
      cssRule: 'box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;',
      previewShadowStyle: '0 8px 16px rgba(0, 0, 0, 0.14)',
    },
    {
      id: 'shadow-lg',
      name: 'Large Shadow',
      label: 'Prominent',
      elevation: 'Level 3',
      description: 'Deep, dramatic blur shadow for hero cards and floating dialogs',
      cssRule: 'box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175) !important;',
      previewShadowStyle: '0 16px 36px rgba(0, 0, 0, 0.22)',
    },
  ];

  const handleSelectShadow = (shadowId: BootstrapShadowClass) => {
    onUpdateSettings({ shadow: shadowId });
  };

  const handleCopyClass = () => {
    navigator.clipboard.writeText(currentShadow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onUpdateSettings({ shadow: 'shadow-none' });
  };

  const selectedOption = shadowOptions.find((opt) => opt.id === currentShadow) || shadowOptions[0];

  return (
    <div className="space-y-4" id="block-shadows-panel">
      {/* Header with Info & Reset actions */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Bootstrap Shadows
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Apply standard elevation & drop shadows to the selected block
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to Flat (shadow-none)"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            title="Bootstrap Shadow Specs"
            className={`p-1.5 rounded-lg transition ${
              showHelper ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Helper Documentation Collapsible */}
      {showHelper && (
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-2 text-blue-900 animate-in fade-in duration-200">
          <div className="font-semibold flex items-center justify-between text-blue-950">
            <span>Bootstrap 5 Elevation Utilities</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-200/60 rounded text-blue-800 font-mono">v5.3</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800">
            Bootstrap 5 provides four utility classes that apply standardized, accessibility-vetted box-shadow depths to containers, cards, and sections.
          </p>
          <div className="space-y-1 font-mono text-[10px] bg-white/70 p-2 rounded-lg border border-blue-200/50">
            <div className="flex justify-between py-0.5 border-b border-blue-100">
              <span className="font-bold text-blue-900">.shadow-none</span>
              <span className="text-slate-600">none</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-blue-100">
              <span className="font-bold text-blue-900">.shadow-sm</span>
              <span className="text-slate-600">0 .125rem .25rem rgba(0,0,0,.075)</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-blue-100">
              <span className="font-bold text-blue-900">.shadow</span>
              <span className="text-slate-600">0 .5rem 1rem rgba(0,0,0,.15)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-bold text-blue-900">.shadow-lg</span>
              <span className="text-slate-600">0 1rem 3rem rgba(0,0,0,.175)</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Bootstrap Class Badge Card */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Active Shadow Class
          </span>
          <button
            type="button"
            onClick={handleCopyClass}
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
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            .{currentShadow}
          </span>
          <span className="text-xs text-slate-400">
            {selectedOption.name} ({selectedOption.elevation})
          </span>
        </div>
      </div>

      {/* Interactive Elevation Stager / Preview Playground */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Elevation Stager
          </span>

          {/* Backdrop preview switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setPreviewSurface('light')}
              className={`px-2 py-0.5 rounded transition ${
                previewSurface === 'light' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setPreviewSurface('gray')}
              className={`px-2 py-0.5 rounded transition ${
                previewSurface === 'gray' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Gray
            </button>
            <button
              type="button"
              onClick={() => setPreviewSurface('dark')}
              className={`px-2 py-0.5 rounded transition ${
                previewSurface === 'dark' ? 'bg-slate-800 text-white shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Live Stager Card */}
        <div
          className={`py-8 px-6 rounded-xl flex items-center justify-center transition-colors duration-200 ${
            previewSurface === 'light'
              ? 'bg-white border border-slate-200'
              : previewSurface === 'dark'
              ? 'bg-slate-900'
              : 'bg-slate-100'
          }`}
        >
          <div
            className="w-48 py-4 px-4 bg-white rounded-xl text-center border border-slate-200/60 transition-all duration-300 transform hover:-translate-y-0.5"
            style={{ boxShadow: selectedOption.previewShadowStyle }}
          >
            <Box className="w-6 h-6 mx-auto text-blue-600 mb-1.5" />
            <span className="text-xs font-bold text-slate-800 block">
              .{currentShadow}
            </span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
              {selectedOption.elevation}
            </span>
          </div>
        </div>
      </div>

      {/* Shadow Selection Grid (4 Standard Bootstrap Classes) */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Select Shadow Preset
        </span>

        <div className="grid grid-cols-1 gap-2.5">
          {shadowOptions.map((option) => {
            const isSelected = currentShadow === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectShadow(option.id)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3.5 group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/50 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                {/* Visual miniature box illustrating the shadow depth */}
                <div
                  className="w-12 h-12 rounded-lg bg-white shrink-0 border border-slate-200 flex items-center justify-center transition-all group-hover:scale-105"
                  style={{ boxShadow: option.previewShadowStyle }}
                >
                  <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-blue-600">
                    {option.elevation.replace('Level ', 'L')}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono text-[11px]">
                        .{option.id}
                      </code>
                      <span className="text-[11px] font-medium text-slate-600">({option.label})</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">
                      {option.elevation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {option.description}
                  </p>
                </div>

                {/* Selection Indicator Check */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-transparent group-hover:border-slate-400'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Card Shadow Toggle for Content Blocks */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Inner Item / Card Shadows
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Also apply subtle card shadow to child feature/pricing cards
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.cardShadow}
              onChange={() => onUpdateSettings({ cardShadow: !settings.cardShadow })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
