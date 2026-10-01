import React, { useState, useMemo } from 'react';
import {
  Breakpoint,
  BREAKPOINT_ORDER,
  BREAKPOINT_LABELS,
  BREAKPOINT_QUERY_MAP,
  BOOTSTRAP_CONTAINER_MAX_WIDTH,
  VisualNode,
  ResponsiveValue,
  DisplayValue,
  FlexDirection,
  JustifyContent,
  AlignItems,
  SpacingScale,
  ClassGenerator,
  ClassParser,
  resolveEffectiveValue,
  cleanseConflictingTokens,
  createDefaultVisualNode,
} from '../engine/bootstrapCascade';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Maximize2,
  Minimize2,
  Sparkles,
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  ArrowRight,
  Info,
  SlidersHorizontal,
  Grid,
  Box,
  SplitSquareVertical,
  ShieldCheck,
} from 'lucide-react';

interface ResponsiveInspectorHudProps {
  node: VisualNode;
  onChangeNode: (updatedNode: VisualNode) => void;
  activeBreakpoint?: Breakpoint;
  onBreakpointChange?: (bp: Breakpoint) => void;
  containerIsRow?: boolean;
}

const BREAKPOINT_ICONS: Record<Breakpoint, React.ElementType> = {
  xs: Smartphone,
  sm: Smartphone,
  md: Tablet,
  lg: Laptop,
  xl: Monitor,
  xxl: Maximize2,
};

export const ResponsiveInspectorHud: React.FC<ResponsiveInspectorHudProps> = ({
  node,
  onChangeNode,
  activeBreakpoint: propActiveBreakpoint,
  onBreakpointChange,
  containerIsRow = false,
}) => {
  const [internalBreakpoint, setInternalBreakpoint] = useState<Breakpoint>('md');
  const activeBp = propActiveBreakpoint || internalBreakpoint;

  const handleSetBreakpoint = (bp: Breakpoint) => {
    setInternalBreakpoint(bp);
    if (onBreakpointChange) {
      onBreakpointChange(bp);
    }
  };

  const [rawClassInput, setRawClassInput] = useState<string>('');
  const [isEditingRawClasses, setIsEditingRawClasses] = useState(false);
  const [copiedClasses, setCopiedClasses] = useState(false);
  const [activeTab, setActiveTab] = useState<'grid' | 'display' | 'spacing' | 'gutters' | 'styles' | 'code'>('grid');

  // Generate current serialized classes using mobile-first redundancy minimizer
  const currentSerializedClasses = useMemo(() => {
    return ClassGenerator.serializeNodeClasses(node, containerIsRow);
  }, [node, containerIsRow]);

  // Synchronize raw input whenever serialized classes change outside manual edit
  React.useEffect(() => {
    if (!isEditingRawClasses) {
      setRawClassInput(currentSerializedClasses);
    }
  }, [currentSerializedClasses, isEditingRawClasses]);

  // Helper to mutate responsive property with Conflict Prevention / Cleansing
  const setResponsiveProp = <K extends keyof VisualNode['responsive']>(
    prop: K,
    val: any,
    bp: Breakpoint = activeBp
  ) => {
    const updated = { ...node, responsive: { ...node.responsive } };
    const currentPropMap = { ...(updated.responsive[prop] as any) };

    if (val === undefined || val === null) {
      delete currentPropMap[bp];
    } else {
      currentPropMap[bp] = val;
    }

    updated.responsive[prop] = currentPropMap;

    // Apply namespace token cleansing on unmanagedClasses to avoid collisions
    if (prop === 'display') {
      updated.unmanagedClasses = cleanseConflictingTokens(updated.unmanagedClasses, 'd', bp);
    } else if (prop === 'colSpan') {
      updated.unmanagedClasses = cleanseConflictingTokens(updated.unmanagedClasses, 'col', bp);
    }

    onChangeNode(updated);
  };

  // Helper for directional spacing
  const setSpacingProp = (
    type: 'margin' | 'padding',
    dir: 'all' | 'x' | 'y' | 't' | 'b' | 's' | 'e',
    val: SpacingScale | undefined,
    bp: Breakpoint = activeBp
  ) => {
    const updated = { ...node, responsive: { ...node.responsive } };
    const currentMap = { ...(updated.responsive[type] as any) };
    const currentBpSpacing = { ...(currentMap[bp] || {}) };

    if (val === undefined) {
      delete currentBpSpacing[dir];
    } else {
      currentBpSpacing[dir] = val;
    }

    if (Object.keys(currentBpSpacing).length === 0) {
      delete currentMap[bp];
    } else {
      currentMap[bp] = currentBpSpacing;
    }

    updated.responsive[type] = currentMap;
    onChangeNode(updated);
  };

  // Static props helper
  const setStaticProp = <K extends keyof VisualNode['staticBootstrapProps']>(
    key: K,
    val: VisualNode['staticBootstrapProps'][K]
  ) => {
    const updated: VisualNode = {
      ...node,
      staticBootstrapProps: {
        ...node.staticBootstrapProps,
        [key]: val,
      },
    };
    onChangeNode(updated);
  };

  // Parse raw class edit into AST
  const handleRawClassApply = (text: string) => {
    const parsed = ClassParser.parseClassList(text);
    const updated: VisualNode = {
      ...node,
      responsive: parsed.responsive,
      staticBootstrapProps: parsed.staticBootstrapProps,
      unmanagedClasses: parsed.unmanagedClasses,
    };
    onChangeNode(updated);
    setIsEditingRawClasses(false);
  };

  // Copy serialized classes to clipboard
  const handleCopyClasses = () => {
    navigator.clipboard.writeText(currentSerializedClasses);
    setCopiedClasses(true);
    setTimeout(() => setCopiedClasses(false), 2000);
  };

  // Resolved property computations for HUD badges
  const colSpanState = resolveEffectiveValue(node.responsive.colSpan, activeBp);
  const colOffsetState = resolveEffectiveValue(node.responsive.colOffset, activeBp);
  const colOrderState = resolveEffectiveValue(node.responsive.colOrder, activeBp);
  const displayState = resolveEffectiveValue(node.responsive.display, activeBp);
  const flexDirState = resolveEffectiveValue(node.responsive.flexDirection, activeBp);
  const justifyState = resolveEffectiveValue(node.responsive.justifyContent, activeBp);
  const alignState = resolveEffectiveValue(node.responsive.alignItems, activeBp);

  // Check if container qualifies for gutters
  const isRowEligible = containerIsRow || node.unmanagedClasses.includes('row');

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-slate-800">
      {/* 1. Breakpoint Selector Ribbon (Mobile-First Cascade: xs -> xxl) */}
      <div className="bg-slate-900 text-white p-3 border-b border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <span>Responsive Cascade HUD</span>
                <span className="text-[10px] font-mono font-normal text-blue-300 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/60">
                  Mobile-First
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Cascades from mobile ({activeBp.toUpperCase()} active)
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {BREAKPOINT_LABELS[activeBp].desc}
          </div>
        </div>

        {/* Breakpoint Buttons */}
        <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {BREAKPOINT_ORDER.map((bp) => {
            const Icon = BREAKPOINT_ICONS[bp];
            const isActive = activeBp === bp;
            const hasOverrides =
              (node.responsive.colSpan && node.responsive.colSpan[bp] !== undefined) ||
              (node.responsive.display && node.responsive.display[bp] !== undefined) ||
              (node.responsive.margin && node.responsive.margin[bp] !== undefined) ||
              (node.responsive.padding && node.responsive.padding[bp] !== undefined);

            return (
              <button
                key={bp}
                type="button"
                onClick={() => handleSetBreakpoint(bp)}
                className={`relative py-1.5 px-1 rounded flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`${BREAKPOINT_LABELS[bp].label} (${BREAKPOINT_LABELS[bp].desc})`}
              >
                <div className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span className="uppercase">{bp}</span>
                </div>
                {hasOverrides && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-amber-300 ring-1 ring-white' : 'bg-blue-400'
                    }`}
                    title="Contains explicit breakpoint overrides"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Clear Visual Marker: Active Cascade Tier Status & Propagation Chain */}
        <div className="bg-slate-950/95 rounded-lg p-2.5 border border-blue-900/60 text-[11px] flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                <span>Active Cascade Tier:</span>
                <span className="text-blue-300 font-mono uppercase bg-blue-900/60 px-1.5 py-0.2 rounded border border-blue-700/50">
                  {activeBp}
                </span>
                <span className="text-slate-300 font-normal">({BREAKPOINT_LABELS[activeBp].label})</span>
              </span>
            </div>

            <span className="font-mono text-[10px] text-amber-300/90 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
              {BREAKPOINT_LABELS[activeBp].pixelRange}
            </span>
          </div>

          {/* Mobile-First Cascade Propagation Chain */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 bg-slate-900/90 rounded border border-slate-800 text-[10px] font-mono select-none">
            {BREAKPOINT_ORDER.map((bp, idx) => {
              const isActive = bp === activeBp;
              const isLower = BREAKPOINT_ORDER.indexOf(bp) < BREAKPOINT_ORDER.indexOf(activeBp);
              const isHigher = BREAKPOINT_ORDER.indexOf(bp) > BREAKPOINT_ORDER.indexOf(activeBp);

              return (
                <React.Fragment key={bp}>
                  <button
                    type="button"
                    onClick={() => handleSetBreakpoint(bp)}
                    className={`px-2 py-1 rounded text-center transition flex items-center gap-1 shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-md scale-105'
                        : isLower
                        ? 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                    }`}
                    title={
                      isActive
                        ? `${bp.toUpperCase()}: CURRENTLY EDITING THIS TIER`
                        : isLower
                        ? `${bp.toUpperCase()}: Lower tier (Values cascade UP into ${activeBp.toUpperCase()})`
                        : `${bp.toUpperCase()}: Higher tier (Inherits down from ${activeBp.toUpperCase()} automatically)`
                    }
                  >
                    <span className="uppercase font-bold">{bp}</span>
                    {isActive && <span className="text-[9px] font-sans font-bold bg-blue-800 px-1 rounded">EDITING</span>}
                    {isLower && <span className="text-[9px] text-amber-400/80">base</span>}
                    {isHigher && <span className="text-[9px] text-slate-500">inherits</span>}
                  </button>
                  {idx < BREAKPOINT_ORDER.length - 1 && (
                    <span className="text-slate-600 font-bold px-0.5">➔</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>Token Infix:</span>
              <code className="text-emerald-300 font-mono bg-emerald-950/60 px-1 rounded border border-emerald-800/50">
                {activeBp === 'xs' ? 'none (base col-*, d-*)' : `-${activeBp}- (col-${activeBp}-*, d-${activeBp}-*)`}
              </code>
            </span>
            <span className="flex items-center gap-1">
              <span>Max Container:</span>
              <strong className="text-slate-200 font-mono">{BOOTSTRAP_CONTAINER_MAX_WIDTH[activeBp]}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Live Generated Class Strip & Bidirectional Code Sync */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 py-2 text-xs font-mono">
        <div className="flex items-center justify-between mb-1.5 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Compiled Bootstrap 5 Classes</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditingRawClasses(!isEditingRawClasses)}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline font-sans cursor-pointer"
            >
              {isEditingRawClasses ? 'Done' : 'Edit Classes'}
            </button>
            <button
              type="button"
              onClick={handleCopyClasses}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Copy class string"
            >
              {copiedClasses ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {isEditingRawClasses ? (
          <div className="space-y-1.5">
            <textarea
              value={rawClassInput}
              onChange={(e) => setRawClassInput(e.target.value)}
              className="w-full h-16 p-1.5 bg-slate-900 border border-blue-500/60 rounded text-xs text-emerald-300 font-mono focus:outline-hidden resize-none"
              placeholder="e.g. col-12 col-md-6 d-none d-lg-flex p-3 shadow"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRawClassInput(currentSerializedClasses);
                  setIsEditingRawClasses(false);
                }}
                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRawClassApply(rawClassInput)}
                className="px-2.5 py-0.5 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded shadow-xs"
              >
                Apply & Parse
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-slate-900/90 rounded border border-slate-800 text-emerald-300 break-all select-all flex items-center justify-between">
            <span>{currentSerializedClasses || '/* no bootstrap classes */'}</span>
          </div>
        )}
      </div>

      {/* 3. Navigation Sub-Tabs: Grid | Display & Flex | Spacing | Gutters | Styles */}
      <div className="flex items-center gap-1 border-b border-slate-200 px-3 pt-2 bg-slate-50/80 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('grid')}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'grid'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid (Cols)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('display')}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'display'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Display & Flex</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spacing')}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'spacing'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>Spacing (m/p)</span>
        </button>

        {isRowEligible && (
          <button
            type="button"
            onClick={() => setActiveTab('gutters')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 shrink-0 ${
              activeTab === 'gutters'
                ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gutters (.row)</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('styles')}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 shrink-0 ${
            activeTab === 'styles'
              ? 'border-blue-600 text-blue-600 bg-white shadow-2xs font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Static Utilities</span>
        </button>
      </div>

      {/* 4. Tab Body Content */}
      <div className="p-4 space-y-4">
        {/* ================= TAB: GRID SYSTEM (COL SPAN, OFFSET, ORDER) ================= */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            {/* Column Span */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Column Width (col-{activeBp !== 'xs' ? `${activeBp}-*` : '*'})</span>
                </label>

                {/* Inheritance Indicator Badge */}
                <div className="flex items-center gap-1">
                  {colSpanState.value !== undefined ? (
                    colSpanState.isInherited ? (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span>Inherited from {colSpanState.definedAt}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span>Explicit on {activeBp}</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Default</span>
                  )}

                  {!colSpanState.isInherited && colSpanState.value !== undefined && activeBp !== 'xs' && (
                    <button
                      type="button"
                      onClick={() => setResponsiveProp('colSpan', undefined)}
                      className="text-[10px] text-red-600 hover:text-red-700 underline ml-1 cursor-pointer"
                      title="Clear override to inherit from lower breakpoint"
                    >
                      Clear override
                    </button>
                  )}
                </div>
              </div>

              {/* 12-Column Grid Selector */}
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const isCurrent = colSpanState.value === num;
                  const isExplicit =
                    node.responsive.colSpan && node.responsive.colSpan[activeBp] === num;

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setResponsiveProp('colSpan', num)}
                      className={`h-8 rounded text-xs font-bold transition flex items-center justify-center ${
                        isExplicit
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                      title={`Span ${num} / 12 columns`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResponsiveProp('colSpan', 'fill')}
                  className={`flex-1 py-1 px-2 text-xs font-semibold rounded border transition ${
                    colSpanState.value === 'fill'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  col{activeBp !== 'xs' ? `-${activeBp}` : ''} (Equal Fill)
                </button>
                <button
                  type="button"
                  onClick={() => setResponsiveProp('colSpan', 'auto')}
                  className={`flex-1 py-1 px-2 text-xs font-semibold rounded border transition ${
                    colSpanState.value === 'auto'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  col{activeBp !== 'xs' ? `-${activeBp}` : ''}-auto (Content Width)
                </button>
              </div>
            </div>

            {/* Column Offset */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Offset (offset-{activeBp !== 'xs' ? `${activeBp}-*` : '*'})
                </label>
                {colOffsetState.value !== undefined && (
                  <span className="text-[10px] font-semibold text-slate-500">
                    {colOffsetState.isInherited
                      ? `Inherited: ${colOffsetState.value} (${colOffsetState.definedAt})`
                      : `Explicit: ${colOffsetState.value}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((val) => {
                  const isCurrent = colOffsetState.value === val;
                  const isExplicit =
                    node.responsive.colOffset && node.responsive.colOffset[activeBp] === val;

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setResponsiveProp('colOffset', val === 0 ? undefined : val)}
                      className={`h-7 rounded text-[11px] font-semibold transition flex items-center justify-center ${
                        isExplicit
                          ? 'bg-blue-600 text-white font-bold'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column Order */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Visual Order (order-{activeBp !== 'xs' ? `${activeBp}-*` : '*'})
                </label>
                {colOrderState.value !== undefined && (
                  <span className="text-[10px] font-semibold text-slate-500">
                    {colOrderState.isInherited
                      ? `Inherited: ${colOrderState.value} (${colOrderState.definedAt})`
                      : `Explicit: ${colOrderState.value}`}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {(['first', 0, 1, 2, 3, 4, 5, 'last'] as (number | 'first' | 'last')[]).map((ord) => {
                  const isCurrent = colOrderState.value === ord;
                  const isExplicit =
                    node.responsive.colOrder && node.responsive.colOrder[activeBp] === ord;

                  return (
                    <button
                      key={String(ord)}
                      type="button"
                      onClick={() => setResponsiveProp('colOrder', ord === 0 ? undefined : ord)}
                      className={`py-1 rounded text-xs font-semibold transition capitalize flex items-center justify-center ${
                        isExplicit
                          ? 'bg-blue-600 text-white font-bold'
                          : isCurrent
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {String(ord)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: DISPLAY & FLEXBOX ================= */}
        {activeTab === 'display' && (
          <div className="space-y-4">
            {/* Display Mode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Display Mode (d-{activeBp !== 'xs' ? `${activeBp}-*` : '*'})
                </label>

                {/* Display Inheritance Indicator */}
                {displayState.value !== undefined ? (
                  displayState.isInherited ? (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded">
                      Inherited from {displayState.definedAt}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300 px-1.5 py-0.5 rounded">
                      Explicit on {activeBp}
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Default</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {(['block', 'flex', 'none', 'inline-block', 'grid', 'inline-flex', 'inline', 'table'] as DisplayValue[]).map(
                  (val) => {
                    const isCurrent = displayState.value === val;
                    const isExplicit =
                      node.responsive.display && node.responsive.display[activeBp] === val;

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setResponsiveProp('display', isExplicit ? undefined : val)}
                        className={`py-1.5 px-2 rounded text-xs font-semibold transition border ${
                          isExplicit
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : isCurrent
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Flexbox Controls (Enabled if effective display is 'flex' or 'inline-flex') */}
            {(displayState.value === 'flex' || displayState.value === 'inline-flex') && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  <span>Flexbox Alignment & Direction</span>
                </div>

                {/* Flex Direction */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Direction</label>
                  <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                    {(['row', 'row-reverse', 'column', 'column-reverse'] as FlexDirection[]).map(
                      (dir) => (
                        <button
                          key={dir}
                          type="button"
                          onClick={() => setResponsiveProp('flexDirection', dir)}
                          className={`py-1 text-[11px] rounded font-semibold border ${
                            flexDirState.value === dir
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                          }`}
                        >
                          {dir}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Justify Content */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Justify Content</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['start', 'center', 'end', 'between', 'around', 'evenly'] as JustifyContent[]).map(
                      (jc) => (
                        <button
                          key={jc}
                          type="button"
                          onClick={() => setResponsiveProp('justifyContent', jc)}
                          className={`py-1 text-[11px] rounded font-semibold border ${
                            justifyState.value === jc
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                          }`}
                        >
                          {jc}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Align Items */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Align Items</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['start', 'center', 'end', 'baseline', 'stretch'] as AlignItems[]).map(
                      (ai) => (
                        <button
                          key={ai}
                          type="button"
                          onClick={() => setResponsiveProp('alignItems', ai)}
                          className={`py-1 text-[11px] rounded font-semibold border ${
                            alignState.value === ai
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                          }`}
                        >
                          {ai}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: DIRECTIONAL SPACING (MARGIN & PADDING) ================= */}
        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Mobile-First Spacing (0–5, auto)</span>
              </span>
              <span className="font-mono text-[11px]">Active: {activeBp.toUpperCase()}</span>
            </div>

            {/* Padding Controls */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 block">
                Padding (p{activeBp !== 'xs' ? `-${activeBp}` : ''}-*)
              </label>

              {(['all', 'x', 'y', 't', 'b'] as const).map((dir) => {
                const currentVal = node.responsive.padding?.[activeBp]?.[dir];
                const label =
                  dir === 'all'
                    ? 'All Sides (p)'
                    : dir === 'x'
                    ? 'Horizontal (px)'
                    : dir === 'y'
                    ? 'Vertical (py)'
                    : dir === 't'
                    ? 'Top (pt)'
                    : 'Bottom (pb)';

                return (
                  <div key={dir} className="flex items-center justify-between gap-2 text-xs">
                    <span className="w-28 text-slate-600 font-medium">{label}:</span>
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3, 4, 5].map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() =>
                            setSpacingProp('padding', dir, currentVal === scale ? undefined : (scale as SpacingScale))
                          }
                          className={`flex-1 py-1 rounded text-[11px] font-semibold transition border ${
                            currentVal === scale
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Margin Controls */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-900 block">
                Margin (m{activeBp !== 'xs' ? `-${activeBp}` : ''}-*)
              </label>

              {(['all', 'x', 'y', 't', 'b'] as const).map((dir) => {
                const currentVal = node.responsive.margin?.[activeBp]?.[dir];
                const label =
                  dir === 'all'
                    ? 'All Sides (m)'
                    : dir === 'x'
                    ? 'Horizontal (mx)'
                    : dir === 'y'
                    ? 'Vertical (my)'
                    : dir === 't'
                    ? 'Top (mt)'
                    : 'Bottom (mb)';

                return (
                  <div key={dir} className="flex items-center justify-between gap-2 text-xs">
                    <span className="w-28 text-slate-600 font-medium">{label}:</span>
                    <div className="flex items-center gap-1 flex-1">
                      {[0, 1, 2, 3, 4, 5, 'auto'].map((scale) => (
                        <button
                          key={String(scale)}
                          type="button"
                          onClick={() =>
                            setSpacingProp(
                              'margin',
                              dir,
                              currentVal === scale ? undefined : (scale as SpacingScale)
                            )
                          }
                          className={`flex-1 py-1 rounded text-[11px] font-semibold transition border ${
                            currentVal === scale
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                          }`}
                        >
                          {scale}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB: GUTTERS (CONTAINER-GUTTER ISOLATION) ================= */}
        {activeTab === 'gutters' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Container-Gutter Isolation:</strong> Gutters are strictly scoped to Bootstrap <code className="bg-amber-100 px-1 rounded">.row</code> elements to prevent layout overflow bugs.
              </span>
            </div>

            {/* Gutter All */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Gutter All (g{activeBp !== 'xs' ? `-${activeBp}` : ''}-*)
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((gVal) => (
                  <button
                    key={gVal}
                    type="button"
                    onClick={() =>
                      setResponsiveProp(
                        'gutter',
                        node.responsive.gutter?.[activeBp] === gVal ? undefined : gVal
                      )
                    }
                    className={`py-1 text-xs font-semibold rounded border ${
                      node.responsive.gutter?.[activeBp] === gVal
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {gVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Gutter X (horizontal) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Horizontal Gutter (gx{activeBp !== 'xs' ? `-${activeBp}` : ''}-*)
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((gVal) => (
                  <button
                    key={gVal}
                    type="button"
                    onClick={() =>
                      setResponsiveProp(
                        'gutterX',
                        node.responsive.gutterX?.[activeBp] === gVal ? undefined : gVal
                      )
                    }
                    className={`py-1 text-xs font-semibold rounded border ${
                      node.responsive.gutterX?.[activeBp] === gVal
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {gVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Gutter Y (vertical) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Vertical Gutter (gy{activeBp !== 'xs' ? `-${activeBp}` : ''}-*)
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5].map((gVal) => (
                  <button
                    key={gVal}
                    type="button"
                    onClick={() =>
                      setResponsiveProp(
                        'gutterY',
                        node.responsive.gutterY?.[activeBp] === gVal ? undefined : gVal
                      )
                    }
                    className={`py-1 text-xs font-semibold rounded border ${
                      node.responsive.gutterY?.[activeBp] === gVal
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {gVal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: STATIC BOOTSTRAP UTILITIES ================= */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            {/* Box Shadow */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Elevation & Shadow</label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {(['shadow-none', 'shadow-sm', 'shadow', 'shadow-lg'] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() =>
                      setStaticProp('shadow', node.staticBootstrapProps.shadow === sh ? undefined : sh)
                    }
                    className={`py-1.5 px-2 text-xs font-semibold rounded border ${
                      node.staticBootstrapProps.shadow === sh
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    }`}
                  >
                    {sh.replace('shadow-', '') || 'regular'}
                  </button>
                ))}
              </div>
            </div>

            {/* Rounded Corners */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Border Radius (Rounded)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['rounded-0', 'rounded', 'rounded-2', 'rounded-3', 'rounded-pill', 'rounded-circle'] as const).map(
                  (r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setStaticProp(
                          'borderRadius',
                          node.staticBootstrapProps.borderRadius === r ? undefined : r
                        )
                      }
                      className={`py-1.5 px-2 text-xs font-semibold rounded border ${
                        node.staticBootstrapProps.borderRadius === r
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                      }`}
                    >
                      {r.replace('rounded-', '') || 'default'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Custom / Unmanaged CSS Classes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Unmanaged Custom Classes</span>
                <span className="text-[10px] text-slate-500 font-normal">Preserved during sync</span>
              </label>
              <input
                type="text"
                value={node.unmanagedClasses.join(' ')}
                onChange={(e) => {
                  const classes = e.target.value.split(/\s+/).filter(Boolean);
                  onChangeNode({ ...node, unmanagedClasses: classes });
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. animate-bounce custom-card-hover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
