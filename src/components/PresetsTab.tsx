import React, { useState, useEffect, useMemo } from 'react';
import {
  BlockInstance,
  BlockCategory,
  BlockPreset,
} from '../types';
import {
  BUILT_IN_BLOCK_PRESETS,
  getStoredPresets,
  saveStoredPresets,
} from '../data/blockPresets';
import {
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Search,
  Sparkles,
  Trash2,
  Copy,
  Download,
  Upload,
  Layers,
  ArrowDownToLine,
  Sliders,
  Check,
  Tag,
  Eye,
  Plus,
  Info,
  X,
  RefreshCw,
} from 'lucide-react';

interface PresetsTabProps {
  blocks: BlockInstance[];
  selectedBlock: BlockInstance | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddBlockFromPreset: (preset: BlockPreset, targetIndex?: number) => void;
  onApplyPresetToBlock?: (blockId: string, preset: BlockPreset) => void;
  isDark?: boolean;
  isSpacious?: boolean; // When rendered inside DesignStudioModal
}

export const PresetsTab: React.FC<PresetsTabProps> = ({
  blocks,
  selectedBlock,
  selectedBlockId,
  onSelectBlock,
  onAddBlockFromPreset,
  onApplyPresetToBlock,
  isDark = true,
  isSpacious = false,
}) => {
  // State
  const [customPresets, setCustomPresets] = useState<BlockPreset[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'custom' | BlockCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Form state for saving active block as preset
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDesc, setNewPresetDesc] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<BlockCategory>('headers');
  const [newPresetTags, setNewPresetTags] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Import JSON Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Load custom presets on mount
  useEffect(() => {
    const stored = getStoredPresets();
    setCustomPresets(stored);
  }, []);

  // Sync custom presets to storage whenever updated
  const handleUpdateCustomPresets = (updated: BlockPreset[]) => {
    setCustomPresets(updated);
    saveStoredPresets(updated);
  };

  // Pre-fill save form when selected block changes
  useEffect(() => {
    if (selectedBlock) {
      const candidateTitle =
        selectedBlock.content?.title ||
        selectedBlock.content?.heading ||
        selectedBlock.content?.brandName ||
        selectedBlock.name;
      setNewPresetName(`${candidateTitle} Preset`);
      setNewPresetCategory(selectedBlock.category);
      setNewPresetDesc(`Custom ${selectedBlock.name} preset with configured styling and layout.`);
      setNewPresetTags(`${selectedBlock.type}, custom, ${selectedBlock.settings.bgColor || 'styled'}`);
    }
  }, [selectedBlock]);

  // Handle Save Current Block
  const handleSaveCurrentBlockAsPreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedBlock || !newPresetName.trim()) return;

    const newPreset: BlockPreset = {
      id: `custom-preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: newPresetName.trim(),
      description: newPresetDesc.trim(),
      category: newPresetCategory,
      tags: newPresetTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isBuiltIn: false,
      createdAt: Date.now(),
      block: {
        type: selectedBlock.type,
        category: selectedBlock.category,
        name: selectedBlock.name,
        settings: JSON.parse(JSON.stringify(selectedBlock.settings)),
        content: JSON.parse(JSON.stringify(selectedBlock.content)),
        visualNode: selectedBlock.visualNode ? JSON.parse(JSON.stringify(selectedBlock.visualNode)) : undefined,
      },
    };

    const updated = [newPreset, ...customPresets];
    handleUpdateCustomPresets(updated);
    setIsSavingPreset(false);
    setSaveSuccessMsg(`Preset "${newPreset.name}" saved!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Delete Custom Preset
  const handleDeletePreset = (id: string, name: string) => {
    if (window.confirm(`Delete custom preset "${name}"? This cannot be undone.`)) {
      const updated = customPresets.filter((p) => p.id !== id);
      handleUpdateCustomPresets(updated);
    }
  };

  // Copy Preset JSON to clipboard
  const handleCopyPresetJson = (preset: BlockPreset) => {
    try {
      const jsonStr = JSON.stringify(preset, null, 2);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonStr);
        setCopiedId(preset.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy preset json', err);
    }
  };

  // Export all custom presets
  const handleExportAllPresets = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customPresets, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `bootstrap5-presets-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export presets', e);
    }
  };

  // Import JSON Presets
  const handleImportJson = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const items: BlockPreset[] = Array.isArray(parsed) ? parsed : [parsed];

      // Validate required shape
      const validItems: BlockPreset[] = [];
      for (const item of items) {
        if (item && item.name && item.block && item.block.type && item.block.settings) {
          validItems.push({
            ...item,
            id: `imported-preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            isBuiltIn: false,
            createdAt: item.createdAt || Date.now(),
          });
        }
      }

      if (validItems.length === 0) {
        setImportError('No valid preset objects found in provided JSON.');
        return;
      }

      const merged = [...validItems, ...customPresets];
      handleUpdateCustomPresets(merged);
      setIsImportModalOpen(false);
      setImportJsonText('');
      setSaveSuccessMsg(`Imported ${validItems.length} preset(s) successfully!`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e: any) {
      setImportError(`Invalid JSON format: ${e.message}`);
    }
  };

  // Handle Add Block From Preset
  const handleAdd = (preset: BlockPreset, position: 'below' | 'bottom' = 'below') => {
    let targetIndex: number | undefined = undefined;
    if (position === 'below' && selectedBlockId) {
      const idx = blocks.findIndex((b) => b.id === selectedBlockId);
      if (idx !== -1) {
        targetIndex = idx + 1;
      }
    } else if (position === 'bottom') {
      targetIndex = blocks.length;
    }

    onAddBlockFromPreset(preset, targetIndex);
    setAddedId(preset.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  // Handle Apply Preset to Selected Block
  const handleApply = (preset: BlockPreset) => {
    if (!selectedBlockId || !onApplyPresetToBlock) return;
    onApplyPresetToBlock(selectedBlockId, preset);
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 2000);
  };

  // Filtered presets
  const allPresets = useMemo(() => {
    return [...customPresets, ...BUILT_IN_BLOCK_PRESETS];
  }, [customPresets]);

  const filteredPresets = useMemo(() => {
    return allPresets.filter((preset) => {
      // Category filter
      if (activeCategory === 'custom') {
        if (preset.isBuiltIn) return false;
      } else if (activeCategory !== 'all') {
        if (preset.category !== activeCategory && preset.block.category !== activeCategory) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = preset.name.toLowerCase().includes(q);
        const matchesDesc = (preset.description || '').toLowerCase().includes(q);
        const matchesType = preset.block.type.toLowerCase().includes(q);
        const matchesTags = (preset.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesContent = Object.values(preset.block.content || {}).some(
          (val) => typeof val === 'string' && val.toLowerCase().includes(q)
        );
        return matchesName || matchesDesc || matchesType || matchesTags || matchesContent;
      }

      return true;
    });
  }, [allPresets, activeCategory, searchQuery]);

  // Categories list with counts
  const categoriesList: { id: 'all' | 'custom' | BlockCategory; label: string; count: number }[] = useMemo(() => {
    const list: { id: 'all' | 'custom' | BlockCategory; label: string; count: number }[] = [
      { id: 'all', label: 'All Presets', count: allPresets.length },
      { id: 'custom', label: 'My Saved', count: customPresets.length },
      {
        id: 'headers',
        label: 'Hero & Headers',
        count: allPresets.filter((p) => p.category === 'headers' || p.block.category === 'headers').length,
      },
      {
        id: 'features',
        label: 'Features',
        count: allPresets.filter((p) => p.category === 'features' || p.block.category === 'features').length,
      },
      {
        id: 'pricing',
        label: 'Pricing',
        count: allPresets.filter((p) => p.category === 'pricing' || p.block.category === 'pricing').length,
      },
      {
        id: 'testimonials',
        label: 'Testimonials',
        count: allPresets.filter((p) => p.category === 'testimonials' || p.block.category === 'testimonials').length,
      },
      {
        id: 'forms',
        label: 'Forms & Contact',
        count: allPresets.filter((p) => p.category === 'forms' || p.block.category === 'forms').length,
      },
      {
        id: 'navbars',
        label: 'Navbars',
        count: allPresets.filter((p) => p.category === 'navbars' || p.block.category === 'navbars').length,
      },
      {
        id: 'footers',
        label: 'Footers',
        count: allPresets.filter((p) => p.category === 'footers' || p.block.category === 'footers').length,
      },
      {
        id: 'content',
        label: 'Content & FAQ',
        count: allPresets.filter((p) => p.category === 'content' || p.block.category === 'content').length,
      },
      {
        id: 'team',
        label: 'Team',
        count: allPresets.filter((p) => p.category === 'team' || p.block.category === 'team').length,
      },
      {
        id: 'gallery',
        label: 'Gallery',
        count: allPresets.filter((p) => p.category === 'gallery' || p.block.category === 'gallery').length,
      },
    ];
    return list;
  }, [allPresets, customPresets]);

  return (
    <div className="flex flex-col h-full overflow-hidden text-xs">
      {/* Top Banner / Context Info */}
      <div
        className={`px-3 py-2.5 border-b shrink-0 flex items-center justify-between gap-2 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 dark:text-slate-100 text-slate-800 text-[11px] leading-tight">
              Block Presets & Templates
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
              {allPresets.length} ready-to-use configurations ({customPresets.length} custom)
            </p>
          </div>
        </div>

        {/* Quick Actions: Export / Import */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className={`p-1.5 rounded-md transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Import Presets JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          {customPresets.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllPresets}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Export All Custom Presets"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Save Success Alert Notification */}
      {saveSuccessMsg && (
        <div className="mx-3 mt-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between gap-2 shrink-0 animate-in fade-in">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {saveSuccessMsg}
          </span>
          <button
            type="button"
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Save Active Block as Preset Section */}
      <div
        className={`mx-3 my-2 p-2.5 rounded-xl border shrink-0 transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-[#111827] to-slate-900 border-slate-700/80 shadow-xs'
            : 'bg-gradient-to-br from-blue-50/50 via-white to-slate-50 border-blue-100 shadow-xs'
        }`}
      >
        {selectedBlock ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <BookmarkPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-[11px] truncate">
                  Save Selected Block as Preset
                </span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                {selectedBlock.name}
              </span>
            </div>

            {!isSavingPreset ? (
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Save this block's exact layout, colors, and content as a reusable template.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSavingPreset(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shrink-0 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  Save as Preset
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveCurrentBlockAsPreset} className="space-y-2 mt-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 dark:text-slate-300 mb-0.5">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    required
                    placeholder="e.g. Dark Gradient Hero with Dual CTA"
                    className={`w-full px-2.5 py-1 rounded-md text-[11px] border focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 dark:text-slate-300 mb-0.5">
                      Category
                    </label>
                    <select
                      value={newPresetCategory}
                      onChange={(e) => setNewPresetCategory(e.target.value as BlockCategory)}
                      className={`w-full px-2 py-1 rounded-md text-[10.5px] border focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                        isDark
                          ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="headers">Headers & Hero</option>
                      <option value="features">Features</option>
                      <option value="pricing">Pricing</option>
                      <option value="testimonials">Testimonials</option>
                      <option value="forms">Forms & Contact</option>
                      <option value="navbars">Navbars</option>
                      <option value="footers">Footers</option>
                      <option value="content">Content & Articles</option>
                      <option value="team">Team</option>
                      <option value="gallery">Gallery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-300 dark:text-slate-300 mb-0.5">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newPresetTags}
                      onChange={(e) => setNewPresetTags(e.target.value)}
                      placeholder="e.g. dark, hero, saas"
                      className={`w-full px-2 py-1 rounded-md text-[10.5px] border focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                        isDark
                          ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 dark:text-slate-300 mb-0.5">
                    Description / Usage Note
                  </label>
                  <textarea
                    rows={2}
                    value={newPresetDesc}
                    onChange={(e) => setNewPresetDesc(e.target.value)}
                    placeholder="Brief note about when to use this preset..."
                    className={`w-full px-2 py-1 rounded-md text-[10.5px] border resize-none focus:outline-hidden focus:ring-1 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-800/90 border-slate-700 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSavingPreset(false)}
                    className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] flex items-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <BookmarkCheck className="w-3 h-3" />
                    Save Template
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 py-0.5">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[10.5px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300 dark:text-slate-200">Save Custom Templates:</span>{' '}
              Select any block on your canvas to save its current styling, content, and layout as a reusable template.
            </div>
          </div>
        )}
      </div>

      {/* Search Bar & Category Filter Bar */}
      <div className="px-3 pb-2 shrink-0 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search presets by keyword, tag, or type..."
            className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-[11px] border transition focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200 placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable Horizontal Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1 shrink-0 ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-blue-600 text-white font-bold shadow-xs'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[9px] px-1 rounded-full ${
                    isActive
                      ? 'bg-blue-700/80 text-white'
                      : isDark
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset List Section */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2.5">
        {filteredPresets.length === 0 ? (
          <div
            className={`p-6 text-center rounded-xl border border-dashed my-4 ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
            }`}
          >
            <Bookmark className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-xs text-slate-300 dark:text-slate-300 mb-1">
              No presets found
            </p>
            <p className="text-[10.5px]">
              {searchQuery
                ? `No presets matching "${searchQuery}". Try a different keyword.`
                : 'No presets in this category yet.'}
            </p>
            {activeCategory === 'custom' && (
              <p className="text-[10px] text-slate-400 mt-2">
                Tip: Select a block on your page and click "Save as Preset" above to create one!
              </p>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-2.5 ${
              isSpacious
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredPresets.map((preset) => {
              const isCustom = !preset.isBuiltIn;
              const isCopied = copiedId === preset.id;
              const isApplied = appliedId === preset.id;
              const isJustAdded = addedId === preset.id;

              return (
                <div
                  key={preset.id}
                  className={`p-2.5 rounded-xl border transition-all duration-150 flex flex-col justify-between group ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs'
                  }`}
                >
                  {/* Card Header: Category & Type Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                            isCustom
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {isCustom ? 'My Template' : 'Curated'}
                        </span>
                        <span className="text-[9.5px] text-slate-400 dark:text-slate-400 font-mono truncate">
                          {preset.block.type}
                        </span>
                      </div>

                      {/* Header Actions for custom preset (Delete, Copy JSON) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyPresetJson(preset)}
                          className={`p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer`}
                          title="Copy Preset JSON"
                        >
                          {isCopied ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeletePreset(preset.id, preset.name)}
                            className="p-1 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition cursor-pointer"
                            title="Delete Custom Preset"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Preset Title */}
                    <h4 className="font-bold text-[11.5px] text-slate-100 dark:text-slate-100 text-slate-900 leading-snug mb-1">
                      {preset.name}
                    </h4>

                    {/* Description */}
                    {preset.description && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {preset.description}
                      </p>
                    )}

                    {/* Content Preview Snippet */}
                    <div
                      className={`p-1.5 rounded-lg text-[9.5px] font-mono mb-2 ${
                        isDark ? 'bg-slate-950/70 text-slate-300' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="text-slate-500 font-sans font-semibold mr-1">Title:</span>
                        {preset.block.content?.title ||
                          preset.block.content?.heading ||
                          preset.block.content?.brandName ||
                          preset.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400">
                        <span>bg: {preset.block.settings.bgColor || 'default'}</span>
                        <span>•</span>
                        <span>align: {preset.block.settings.textAlign || 'start'}</span>
                        {preset.block.settings.buttonPill && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">pill buttons</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {preset.tags && preset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        {preset.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[8.5px] px-1.5 py-0.5 rounded ${
                              isDark
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 mt-auto">
                    {/* Insert as New Block */}
                    <button
                      type="button"
                      onClick={() => handleAdd(preset, 'below')}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[10.5px] flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                      title={
                        selectedBlockId
                          ? `Insert "${preset.name}" below selected block`
                          : `Add "${preset.name}" to page`
                      }
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Insert to Page</span>
                        </>
                      )}
                    </button>

                    {/* Apply to Active Block (if block is selected) */}
                    {selectedBlock && onApplyPresetToBlock && (
                      <button
                        type="button"
                        onClick={() => handleApply(preset)}
                        className={`py-1.5 px-2 rounded-lg font-semibold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer border ${
                          isApplied
                            ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50'
                            : isDark
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                        title={`Apply this preset styling & content to currently selected block (${selectedBlock.name})`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <>
                            <Sliders className="w-3 h-3" />
                            <span>Apply to Active</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Import JSON Modal Dialog */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          role="dialog"
        >
          <div
            className={`w-full max-w-md p-4 rounded-2xl border shadow-2xl ${
              isDark ? 'bg-[#0b0f19] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Import Presets from JSON</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Paste a single BlockPreset JSON object or an array of presets exported from another project.
            </p>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste JSON here..."
              className={`w-full p-2 rounded-lg font-mono text-[10px] border mb-2 focus:outline-hidden focus:ring-1 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />

            {importError && (
              <div className="mb-2 p-2 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10.5px]">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportJson}
                disabled={!importJsonText.trim()}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                Import Presets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
