import React from 'react';
import {
  Columns2,
  Columns3,
  LayoutGrid,
  Square,
  Layers,
  PanelLeft,
  PanelRight,
  ArrowLeftRight,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  Grid,
  ChevronDown,
  Info,
  RotateCcw,
} from 'lucide-react';
import { BlockInstance, BlockSettings } from '../types';
import { Breakpoint, VisualNode } from '../engine/bootstrapCascade';

interface LayoutTemplateOption {
  id: NonNullable<BlockSettings['layoutTemplate']>;
  name: string;
  category: 'symmetric' | 'staggered' | 'asymmetric' | 'narrative';
  columns: number;
  description: string;
  badge: string;
  renderWireframe: () => React.ReactNode;
}

const LAYOUT_TEMPLATES: LayoutTemplateOption[] = [
  {
    id: '2-column',
    name: '2-Column Split',
    category: 'symmetric',
    columns: 2,
    badge: 'col-md-6 (50/50)',
    description: 'Balanced dual-column grid ideal for comparisons, side-by-side features, and media showcases.',
    renderWireframe: () => (
      <div className="grid grid-cols-2 gap-1.5 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-blue-700">
          50%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-blue-700">
          50%
        </div>
      </div>
    ),
  },
  {
    id: '3-column',
    name: '3-Column Triad',
    category: 'symmetric',
    columns: 3,
    badge: 'col-md-4 (33/33/33)',
    description: 'Standard 3-column triad grid for classic features, cards, reviews, and services.',
    renderWireframe: () => (
      <div className="grid grid-cols-3 gap-1.5 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-blue-700">
          33%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-blue-700">
          33%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-blue-700">
          33%
        </div>
      </div>
    ),
  },
  {
    id: 'masonry',
    name: 'Masonry Flow',
    category: 'staggered',
    columns: 3,
    badge: 'Staggered Heights',
    description: 'Dynamic organic flow with staggered card heights and offsets, reminiscent of Pinterest layouts.',
    renderWireframe: () => (
      <div className="grid grid-cols-3 gap-1.5 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80 items-start">
        <div className="h-9 bg-purple-500/25 border border-purple-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-purple-700">
          Tall
        </div>
        <div className="h-6 bg-purple-500/25 border border-purple-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-purple-700">
          Med
        </div>
        <div className="h-8 bg-purple-500/25 border border-purple-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-purple-700">
          Tall
        </div>
      </div>
    ),
  },
  {
    id: '4-column',
    name: '4-Column Quad',
    category: 'symmetric',
    columns: 4,
    badge: 'col-lg-3 (25% ea)',
    description: 'Dense 4-column layout for galleries, product grids, metrics, or compact icon cards.',
    renderWireframe: () => (
      <div className="grid grid-cols-4 gap-1 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-blue-700">
          25%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-blue-700">
          25%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-blue-700">
          25%
        </div>
        <div className="bg-blue-500/20 border border-blue-500/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-blue-700">
          25%
        </div>
      </div>
    ),
  },
  {
    id: 'asymmetric-left',
    name: 'Asymmetric Left Focus',
    category: 'asymmetric',
    columns: 2,
    badge: '66% / 33% Hero',
    description: 'Hero feature column on the left (col-8) with supporting stacked sidecards on the right (col-4).',
    renderWireframe: () => (
      <div className="flex gap-1.5 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="flex-2 bg-amber-500/25 border border-amber-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-amber-800">
          66% Hero
        </div>
        <div className="flex-1 bg-slate-400/20 border border-slate-400/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-slate-700">
          33%
        </div>
      </div>
    ),
  },
  {
    id: 'asymmetric-right',
    name: 'Asymmetric Right Focus',
    category: 'asymmetric',
    columns: 2,
    badge: '33% / 66% Accent',
    description: 'Narrative summary on the left with prominent wide showcase card on the right.',
    renderWireframe: () => (
      <div className="flex gap-1.5 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="flex-1 bg-slate-400/20 border border-slate-400/40 rounded flex items-center justify-center text-[8px] font-mono font-semibold text-slate-700">
          33%
        </div>
        <div className="flex-2 bg-amber-500/25 border border-amber-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-amber-800">
          66% Hero
        </div>
      </div>
    ),
  },
  {
    id: '1-column',
    name: '1-Column Centered Stack',
    category: 'narrative',
    columns: 1,
    badge: 'col-12 Centered',
    description: 'Single focused column with max-width reading bounds for high-impact longform content.',
    renderWireframe: () => (
      <div className="flex justify-center w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80">
        <div className="w-3/5 h-full bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-[9px] font-mono font-semibold text-emerald-700">
          Single Stack (100%)
        </div>
      </div>
    ),
  },
  {
    id: 'zigzag',
    name: 'Alternating Zigzag',
    category: 'narrative',
    columns: 2,
    badge: 'Reverse Rows',
    description: 'Alternates column order on each section row for storytelling and product walkthroughs.',
    renderWireframe: () => (
      <div className="flex flex-col gap-1 w-full h-11 p-1 bg-slate-900/5 rounded-lg border border-slate-200/80 justify-center">
        <div className="flex gap-1 h-3.5">
          <div className="w-2/3 bg-indigo-500/25 border border-indigo-500/40 rounded text-[7px] text-center text-indigo-700 font-mono">Text</div>
          <div className="w-1/3 bg-slate-400/20 border border-slate-400/40 rounded text-[7px] text-center text-slate-600 font-mono">Media</div>
        </div>
        <div className="flex gap-1 h-3.5">
          <div className="w-1/3 bg-slate-400/20 border border-slate-400/40 rounded text-[7px] text-center text-slate-600 font-mono">Media</div>
          <div className="w-2/3 bg-indigo-500/25 border border-indigo-500/40 rounded text-[7px] text-center text-indigo-700 font-mono">Text</div>
        </div>
      </div>
    ),
  },
];

interface BlockLayoutsTabProps {
  selectedBlock: BlockInstance | null;
  blocks: BlockInstance[];
  onSelectBlock: (id: string) => void;
  onUpdateSettings: (blockId: string, settings: Partial<BlockInstance['settings']>) => void;
  onUpdateVisualNode?: (blockId: string, node: VisualNode) => void;
  activeBreakpoint?: Breakpoint;
}

export const BlockLayoutsTab: React.FC<BlockLayoutsTabProps> = ({
  selectedBlock,
  blocks,
  onSelectBlock,
  onUpdateSettings,
  onUpdateVisualNode,
  activeBreakpoint = 'md',
}) => {
  // If no block is currently selected, show an intuitive selector
  if (!selectedBlock) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-slate-50/50">
        <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-blue-600 mb-4">
          <LayoutGrid className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">Select a Block to Customize Layout</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-5">
          Choose any block on your page to instantly apply 2-column, 3-column, masonry, or asymmetric grid layouts.
        </p>

        {blocks.length > 0 ? (
          <div className="w-full max-w-sm space-y-2 text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Available Blocks on Page ({blocks.length}):
            </span>
            <div className="max-h-64 overflow-y-auto space-y-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
              {blocks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelectBlock(b.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition border border-transparent hover:border-blue-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <span className="font-semibold truncate">{b.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">({b.category})</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 group-hover:text-blue-600 shrink-0 bg-slate-100 group-hover:bg-blue-100 px-2 py-0.5 rounded">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No blocks added yet. Add a block from the Blocks tab.</p>
        )}
      </div>
    );
  }

  const currentSettings = selectedBlock.settings;
  const currentTemplate = currentSettings.layoutTemplate || (
    currentSettings.columns === 2 ? '2-column' :
    currentSettings.columns === 4 ? '4-column' :
    currentSettings.columns === 1 ? '1-column' :
    '3-column'
  );
  const currentCols = currentSettings.columns || 3;
  const currentGutter = currentSettings.gutterSize || 'g-4';
  const currentWidth = currentSettings.containerWidth || 'container';

  // Apply a layout template
  const handleApplyTemplate = (tpl: LayoutTemplateOption) => {
    const newSettings: Partial<BlockSettings> = {
      layoutTemplate: tpl.id,
      columns: tpl.columns,
    };

    onUpdateSettings(selectedBlock.id, newSettings);

    // Sync visualNode if present so Responsive Inspector & AST stay aligned
    if (onUpdateVisualNode && selectedBlock.visualNode) {
      const node = selectedBlock.visualNode;
      const colMap: Record<number, number> = {
        1: 12,
        2: 6,
        3: 4,
        4: 3,
        6: 2,
      };
      const newSpan = colMap[tpl.columns] || 4;

      const updatedNode: VisualNode = {
        ...node,
        responsive: {
          ...node.responsive,
          colSpan: {
            ...node.responsive.colSpan,
            xs: 12,
            md: newSpan,
            lg: newSpan,
          },
        },
      };
      onUpdateVisualNode(selectedBlock.id, updatedNode);
    }
  };

  // Set explicit columns count
  const handleSetColumns = (cols: number) => {
    const tplMap: Record<number, NonNullable<BlockSettings['layoutTemplate']>> = {
      1: '1-column',
      2: '2-column',
      3: '3-column',
      4: '4-column',
    };
    onUpdateSettings(selectedBlock.id, {
      columns: cols,
      layoutTemplate: tplMap[cols] || currentSettings.layoutTemplate,
    });
  };

  // Reset grid settings to standard default
  const handleResetLayout = () => {
    onUpdateSettings(selectedBlock.id, {
      layoutTemplate: '3-column',
      columns: 3,
      gutterSize: 'g-4',
      containerWidth: 'container',
      justifyContent: 'center',
      alignItems: 'stretch',
    });
  };

  return (
    <div className="p-4 space-y-6 overflow-y-auto h-full text-slate-800" id="layouts-tab-pane">
      {/* 1. Active Block Header Card */}
      <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md border border-slate-700/80">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/70 border border-blue-800 px-2 py-0.5 rounded-md">
                {selectedBlock.category}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">#{selectedBlock.id.slice(0, 6)}</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1 leading-snug">{selectedBlock.name}</h3>
          </div>
          <button
            type="button"
            onClick={handleResetLayout}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition cursor-pointer shrink-0"
            title="Reset to default 3-column layout"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60 text-[11px]">
          <span className="text-slate-400">Current Grid:</span>
          <span className="font-semibold text-blue-300 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
            {currentTemplate.toUpperCase()} ({currentCols} cols)
          </span>
          <span className="text-slate-400 ml-auto font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
            {currentGutter}
          </span>
        </div>
      </div>

      {/* 2. Quick-Switch Layout Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick-Switch Layout Templates</span>
          </label>
          <span className="text-[11px] text-slate-500 font-medium">Click to apply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {LAYOUT_TEMPLATES.map((tpl) => {
            const isSelected = currentTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                id={`layout-tpl-${tpl.id}`}
                onClick={() => handleApplyTemplate(tpl)}
                className={`p-3 rounded-xl text-left transition-all relative border flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Active checkmark pill */}
                {isSelected && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Active</span>
                  </span>
                )}

                {/* Wireframe Diagram */}
                <div className="mb-2.5">{tpl.renderWireframe()}</div>

                {/* Info & Description */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                      {tpl.name}
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mb-1">
                    {tpl.badge}
                  </span>
                  <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">{tpl.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Underlying Grid Settings Controls */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Underlying Grid Parameters</span>
        </h4>

        {/* 3A. Direct Columns Count */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Columns in Row</span>
            <span className="text-xs font-mono font-bold text-blue-600">{currentCols} columns</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 6].map((cols) => {
              const isActive = currentCols === cols;
              return (
                <button
                  key={cols}
                  type="button"
                  onClick={() => handleSetColumns(cols)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition border flex items-center justify-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{cols}</span>
                  <span className="text-[10px] opacity-75">{cols === 1 ? 'col' : 'cols'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3B. Gutter / Gap Spacing */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700">Gutter Spacing (Gap)</span>
            <span className="text-xs font-mono text-slate-500">{currentGutter}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'g-1', label: 'g-1', name: 'Tiny' },
              { id: 'g-2', label: 'g-2', name: 'Tight' },
              { id: 'g-3', label: 'g-3', name: 'Normal' },
              { id: 'g-4', label: 'g-4', name: 'Relaxed' },
              { id: 'g-5', label: 'g-5', name: 'Wide' },
            ].map((g) => {
              const isGutterActive = currentGutter === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onUpdateSettings(selectedBlock.id, { gutterSize: g.id as any })}
                  className={`py-1.5 rounded-lg text-xs transition border text-center cursor-pointer ${
                    isGutterActive
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                  }`}
                >
                  <div className="font-mono text-[11px]">{g.label}</div>
                  <div className="text-[9px] opacity-80">{g.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3C. Container Width & Boundary */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-1.5">Container Boundary</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdateSettings(selectedBlock.id, { containerWidth: 'container' })}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                currentWidth === 'container'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Standard Boxed</div>
                <div className="text-[10px] text-slate-500 font-mono">.container (fixed max-width)</div>
              </div>
              <Minimize2 className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => onUpdateSettings(selectedBlock.id, { containerWidth: 'container-fluid' })}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                currentWidth === 'container-fluid'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Fluid Full-Width</div>
                <div className="text-[10px] text-slate-500 font-mono">.container-fluid (100% bleed)</div>
              </div>
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 3D. Horizontal Alignment */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-1.5">Row Alignment (Horizontal)</span>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'start', label: 'Left / Start' },
              { id: 'center', label: 'Center' },
              { id: 'end', label: 'Right / End' },
              { id: 'between', label: 'Space Between' },
            ].map((align) => {
              const isAlignActive = (currentSettings.justifyContent || 'center') === align.id;
              return (
                <button
                  key={align.id}
                  type="button"
                  onClick={() => onUpdateSettings(selectedBlock.id, { justifyContent: align.id as any })}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition border text-center truncate cursor-pointer ${
                    isAlignActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {align.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3E. Card Shadow / Elevation Toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="text-xs font-bold text-slate-700">Card Elevation & Shadow</div>
            <div className="text-[11px] text-slate-500">Apply subtle depth and hover lift to grid cards</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings(selectedBlock.id, { cardShadow: !currentSettings.cardShadow })}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              currentSettings.cardShadow ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                currentSettings.cardShadow ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Pro Tip Callout */}
      <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong className="font-semibold">Bootstrap Cascade Sync:</strong> Switching templates updates standard Bootstrap 5 flexbox and grid classes (<code className="font-mono bg-blue-100/70 px-1 rounded">.row</code>, <code className="font-mono bg-blue-100/70 px-1 rounded">.col-md-*</code>), preserving clean exportable HTML with no runtime bloat.
        </p>
      </div>
    </div>
  );
};
