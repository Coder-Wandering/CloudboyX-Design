/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EditorHeader } from './components/EditorHeader';
import { BreadcrumbBar } from './components/BreadcrumbBar';
import { CanvasFrame } from './components/CanvasFrame';
import { DesignSidebar, DesignSidebarTab } from './components/DesignSidebar';
import {
  BlockInstance,
  SiteTheme,
  ViewportMode,
  SeoSettings,
  DEFAULT_SEO_SETTINGS,
  ClipboardBlockItem,
  BlockAnimationMeta,
  BlockAnimationType,
  BlockPreset,
} from './types';
import { Breakpoint, VisualNode } from './engine/bootstrapCascade';
import { LandingPage } from './components/LandingPage';
import { AdminPortal } from './components/AdminPortal';
import { useAuth } from './context/AuthContext';
import {
  DEFAULT_THEME,
  getInitialProject,
  createNewBlock,
} from './data/starterTemplates';
import { generateCompleteHtml } from './utils/htmlGenerator';
import { CloudboyXModulesModal } from './components/modules/CloudboyXModulesModal';
import { LivePreviewModal } from './components/LivePreviewModal';
import { ClipboardManagerModal } from './components/ClipboardManagerModal';
import { DesignStudioModal } from './components/DesignStudioModal';
import { TemplateGallery } from './components/TemplateGallery';
import { BlockCodeEditorModal } from './components/BlockCodeEditorModal';
import { PdfExportModal } from './components/PdfExportModal';
import { RevisionHistoryModal } from './components/RevisionHistoryModal';
import { ShareProjectModal } from './components/ShareProjectModal';
import { BlockParametersFlyout } from './components/BlockParametersFlyout';
import {
  createRevisionSnapshot,
  getStoredRevisions,
  hasStateChanged,
} from './utils/revisionHistory';
import { ProjectRevision } from './types';
import { ClipboardList, X } from 'lucide-react';

const STORAGE_KEY = 'bootstrap5_visual_editor_project';

function sanitizeLegacyBrand(str: string): string {
  return str.replace(/Mobirise\s+Studio/gi, 'CloudboyX Design').replace(/Mobirise/gi, 'CloudboyX');
}

export default function App() {
  const { user, loading, isDemoUnlocked, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'builder' | 'admin'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('template') || window.location.hash.includes('share=')) {
        return 'builder';
      }
    } catch {
      // ignore
    }
    const savedView = sessionStorage.getItem('builder_active_view');
    if (savedView === 'admin' || savedView === 'builder' || savedView === 'landing') {
      return savedView;
    }
    return 'landing';
  });

  const isGateEnforced = localStorage.getItem('admin_setting_gate_active') !== 'false';
  const isAuthenticated = !!user || isDemoUnlocked || !isGateEnforced;
  const initial = getInitialProject();

  const [projectTitle, setProjectTitle] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) return sanitizeLegacyBrand(parsed.title);
      } catch (e) {
        // ignore
      }
    }
    return initial.title;
  });

  const [theme, setTheme] = useState<SiteTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme) return parsed.theme;
      } catch (e) {
        // ignore
      }
    }
    return initial.theme;
  });

  // Global Light / Dark Theme Mode State (synced with HTML root, localStorage, and Bootstrap data-bs-theme)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('cloudboyx_theme_mode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.theme?.colorMode === 'light' || parsed.theme?.colorMode === 'dark') {
          return parsed.theme.colorMode;
        }
      } catch (e) {
        // ignore
      }
    }
    return initial.theme?.colorMode || 'light';
  });

  // Synchronize <html> root class & data-theme attributes whenever themeMode changes
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-bs-theme', 'light');
    }
    localStorage.setItem('cloudboyx_theme_mode', themeMode);
  }, [themeMode]);

  const handleToggleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setTheme((currentTheme) => ({
        ...currentTheme,
        colorMode: next,
      }));
      return next;
    });
  }, []);

  const handleUpdateTheme = useCallback((patch: Partial<SiteTheme>) => {
    if (patch.colorMode && (patch.colorMode === 'light' || patch.colorMode === 'dark')) {
      setThemeMode(patch.colorMode);
    }
    setTheme((prev) => ({ ...prev, ...patch }));
  }, []);

  const [seoSettings, setSeoSettings] = useState<SeoSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.seoSettings) {
          return {
            ...parsed.seoSettings,
            title: sanitizeLegacyBrand(parsed.seoSettings.title || initial.title),
            description: sanitizeLegacyBrand(parsed.seoSettings.description || ''),
          };
        }
      } catch (e) {
        // ignore
      }
    }
    return {
      ...DEFAULT_SEO_SETTINGS,
      title: initial.title,
    };
  });

  const [blocks, setBlocks] = useState<BlockInstance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          return parsed.blocks.map((b: BlockInstance) => {
            if (!b.content) return b;
            const updatedContent = { ...b.content };
            for (const [k, v] of Object.entries(updatedContent)) {
              if (typeof v === 'string' && /mobirise/i.test(v)) {
                updatedContent[k] = sanitizeLegacyBrand(v);
              }
            }
            return { ...b, content: updatedContent };
          });
        }
      } catch (e) {
        // ignore
      }
    }
    return initial.blocks;
  });

  // Navigation & Viewport State
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('lg');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(() => {
    return initial.blocks[0]?.id || null;
  });
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(() => {
    return initial.blocks[0]?.id ? [initial.blocks[0].id] : [];
  });
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Synchronized Breakpoint & Viewport Handlers
  const handleBreakpointChange = useCallback((bp: Breakpoint) => {
    setActiveBreakpoint(bp);
    if (bp === 'xs' || bp === 'sm') {
      setViewport('mobile');
    } else if (bp === 'md') {
      setViewport('tablet');
    } else {
      setViewport('desktop');
    }
  }, []);

  const handleViewportChange = useCallback((vp: ViewportMode) => {
    setViewport(vp);
    if (vp === 'mobile') {
      setActiveBreakpoint('xs');
    } else if (vp === 'tablet') {
      setActiveBreakpoint('md');
    } else {
      setActiveBreakpoint('lg');
    }
  }, []);

  // Undo / Redo history
  const [history, setHistory] = useState<BlockInstance[][]>([]);
  const [redoStack, setRedoStack] = useState<BlockInstance[][]>([]);

  // Push history snapshot before mutation
  const pushHistory = useCallback((currentBlocks: BlockInstance[]) => {
    setHistory((prev) => [...prev.slice(-25), currentBlocks]);
    setRedoStack([]);
  }, []);

  // Block CSS Entry / Move Animation state
  const [animationMeta, setAnimationMeta] = useState<BlockAnimationMeta | null>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBlockAnimation = useCallback((blockId: string, type: BlockAnimationType) => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
    }
    setAnimationMeta({
      blockId,
      type,
      timestamp: Date.now(),
    });
    animTimeoutRef.current = setTimeout(() => {
      setAnimationMeta(null);
    }, 2400);
  }, []);

  // Visual Node AST updater
  const handleUpdateVisualNode = useCallback((blockId: string, node: VisualNode) => {
    pushHistory(blocks);
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, visualNode: node } : b))
    );
  }, [blocks, pushHistory]);

  // Embedded Design Mode Sidebar State (Right / Left Dockable)
  const [isDesignModeOpen, setIsDesignModeOpen] = useState(true);
  const [designActiveTab, setDesignActiveTab] = useState<DesignSidebarTab>('blocks');
  const [designDockSide, setDesignDockSide] = useState<'right' | 'left'>('right');

  // Mobirise-Style On-Canvas Block Parameters Flyout Panel state
  const [isBlockParametersOpen, setIsBlockParametersOpen] = useState(false);
  const [parametersBlockId, setParametersBlockId] = useState<string | null>(null);

  const handleOpenBlockParameters = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    setSelectedBlockIds([blockId]);
    setParametersBlockId(blockId);
    setIsBlockParametersOpen(true);
  }, []);

  const handleCloseBlockParameters = useCallback(() => {
    setIsBlockParametersOpen(false);
  }, []);

  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState(false);
  const [isRevisionHistoryOpen, setIsRevisionHistoryOpen] = useState(false);
  const [isLivePreviewModalOpen, setIsLivePreviewModalOpen] = useState(false);
  const [isClipboardModalOpen, setIsClipboardModalOpen] = useState(false);
  const [isStudioViewerOpen, setIsStudioViewerOpen] = useState(false);
  const [codeEditorBlockId, setCodeEditorBlockId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get('template'));
    } catch {
      return false;
    }
  });

  // Clipboard Manager History State
  const CLIPBOARD_STORAGE_KEY = 'bootstrap5_block_clipboard';
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardBlockItem[]>(() => {
    try {
      const saved = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Action toast notification state
  const [toast, setToast] = useState<{
    id: string;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Project last modified timestamp state
  const [lastModified, setLastModified] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lastModified === 'number') {
          return parsed.lastModified;
        }
      } catch (e) {
        // ignore
      }
    }
    return Date.now();
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isInitialMount = useRef(true);

  // Save to localStorage on change and sync lastModified
  useEffect(() => {
    const now = Date.now();
    if (!isInitialMount.current) {
      setIsSaving(true);
      setLastModified(now);
      const timer = setTimeout(() => {
        setIsSaving(false);
      }, 750);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            title: projectTitle,
            theme,
            blocks,
            seoSettings,
            lastModified: now,
          })
        );
      } catch (err) {
        console.warn('Failed to save to localStorage', err);
      }

      return () => clearTimeout(timer);
    } else {
      isInitialMount.current = false;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            title: projectTitle,
            theme,
            blocks,
            seoSettings,
            lastModified,
          })
        );
      } catch (err) {
        // ignore
      }
    }
  }, [projectTitle, theme, blocks, seoSettings]);

  // Periodic autosave snapshot recorder for Revision History
  const autosaveRevisionTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If no revisions exist yet, initialize baseline snapshot
    const existing = getStoredRevisions();
    if (existing.length === 0 && blocks.length > 0) {
      createRevisionSnapshot({
        blocks,
        theme,
        title: projectTitle,
        seoSettings,
        type: 'autosave',
        label: 'Baseline Project',
      });
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;

    if (autosaveRevisionTimerRef.current) {
      clearTimeout(autosaveRevisionTimerRef.current);
    }

    autosaveRevisionTimerRef.current = setTimeout(() => {
      const existing = getStoredRevisions();
      const latest = existing[0] || null;

      if (hasStateChanged(latest, blocks, theme, projectTitle)) {
        createRevisionSnapshot({
          blocks,
          theme,
          title: projectTitle,
          seoSettings,
          type: 'autosave',
        });
      }
    }, 12000); // Debounced autosave revision snapshot (12s)

    return () => {
      if (autosaveRevisionTimerRef.current) {
        clearTimeout(autosaveRevisionTimerRef.current);
      }
    };
  }, [blocks, theme, projectTitle, seoSettings]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [blocks, ...prev]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setBlocks(previous);
  }, [history, blocks]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, blocks]);
    setRedoStack((prev) => prev.slice(1));
    setBlocks(next);
  }, [redoStack, blocks]);

  // Show transient toast alert
  const showToast = useCallback(
    (t: {
      title: string;
      description?: string;
      actionLabel?: string;
      onAction?: () => void;
    }) => {
      const id = Math.random().toString();
      setToast({ ...t, id });
      setTimeout(() => {
        setToast((cur) => (cur?.id === id ? null : cur));
      }, 4500);
    },
    []
  );

  // Restore shared project from URL hash if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#share=')) {
      try {
        const raw = window.location.hash.replace('#share=', '');
        const decoded = decodeURIComponent(
          Array.prototype.map
            .call(atob(raw), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const parsed = JSON.parse(decoded);
        if (parsed.t) setProjectTitle(parsed.t);
        if (parsed.th) setTheme(parsed.th);
        if (parsed.s) setSeoSettings(parsed.s);
        if (Array.isArray(parsed.b) && parsed.b.length > 0) {
          const loadedBlocks: BlockInstance[] = parsed.b.map((item: any) => ({
            id: item.i || `block-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: item.t,
            name: item.n || item.t,
            content: item.c || {},
            settings: item.s || {},
            customHtml: item.h,
            customCss: item.cs,
          }));
          setBlocks(loadedBlocks);
          setSelectedBlockId(loadedBlocks[0].id);
          setSelectedBlockIds([loadedBlocks[0].id]);
        }
        setCurrentView('builder');
        showToast({
          title: 'Shared Project Loaded',
          description: `Loaded "${parsed.t || 'Shared Project'}" with ${parsed.b?.length || 0} sections.`,
        });
      } catch (err) {
        console.warn('Failed to parse shared project from URL hash', err);
      }
    }
  }, [showToast]);

  const handleImportSharedState = useCallback(
    (state: { blocks: BlockInstance[]; theme: SiteTheme; title: string; seoSettings?: SeoSettings }) => {
      pushHistory(blocks);
      setBlocks(state.blocks);
      setTheme(state.theme);
      setProjectTitle(state.title);
      if (state.seoSettings) setSeoSettings(state.seoSettings);
      if (state.blocks.length > 0) {
        setSelectedBlockId(state.blocks[0].id);
        setSelectedBlockIds([state.blocks[0].id]);
      }
      showToast({
        title: 'Project Imported',
        description: `Imported "${state.title}" with ${state.blocks.length} sections.`,
      });
    },
    [blocks, pushHistory, showToast]
  );

  // Synchronize clipboard history state & localStorage
  const updateClipboard = useCallback(
    (newHistory: ClipboardBlockItem[]) => {
      setClipboardHistory(newHistory);
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.warn('Failed to save clipboard to localStorage', e);
      }
    },
    []
  );

  // Copy selected block to Clipboard Manager
  const handleCopyBlock = useCallback(
    (blockId: string) => {
      const target = blocks.find((b) => b.id === blockId);
      if (!target) return;

      const newItem: ClipboardBlockItem = {
        id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        block: JSON.parse(JSON.stringify(target)),
        copiedAt: Date.now(),
        previewTitle: target.content?.title || target.content?.heading || target.name,
        previewCategory: target.category,
      };

      // Deduplicate recent entries of same block type & prepend
      const filtered = clipboardHistory.filter(
        (item) => item.block.id !== target.id && item.block.name !== target.name
      );
      const updated = [newItem, ...filtered].slice(0, 30);
      updateClipboard(updated);

      // Attempt to also write formatted JSON to system clipboard for advanced workflows
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(JSON.stringify(target, null, 2)).catch(() => {});
        }
      } catch (e) {
        // ignore
      }

      showToast({
        title: `Copied "${target.name}"`,
        description: 'Block saved to Clipboard Manager. Paste into any slot in the stack.',
        actionLabel: 'Open Clipboard',
        onAction: () => setIsClipboardModalOpen(true),
      });
    },
    [blocks, clipboardHistory, updateClipboard, showToast]
  );

  // Paste specific block at an exact target index in the block stack
  const handlePasteBlock = useCallback(
    (blockToPaste: BlockInstance, targetIndex: number) => {
      pushHistory(blocks);

      const clonedBlock: BlockInstance = {
        ...JSON.parse(JSON.stringify(blockToPaste)),
        id: `block-${Math.random().toString(36).substring(2, 9)}`,
        name: `${blockToPaste.name} (Copy)`,
      };

      const updated = [...blocks];
      const clampedIndex = Math.max(0, Math.min(targetIndex, updated.length));
      updated.splice(clampedIndex, 0, clonedBlock);
      setBlocks(updated);
      setSelectedBlockId(clonedBlock.id);
      triggerBlockAnimation(clonedBlock.id, 'added');
      setIsClipboardModalOpen(false);

      showToast({
        title: `Pasted "${clonedBlock.name}"`,
        description: `Inserted at position #${clampedIndex + 1} of ${updated.length} in stack.`,
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, pushHistory, handleUndo, showToast]
  );

  // Quick-paste most recent clipboard item relative to selected block
  const handlePasteLatest = useCallback(
    (position: 'below' | 'above' | 'top' | 'bottom' = 'below') => {
      if (clipboardHistory.length === 0) {
        showToast({
          title: 'Clipboard is Empty',
          description: 'Select a block and press Ctrl+C to copy it first.',
        });
        return;
      }

      const latest = clipboardHistory[0].block;
      let targetIndex = blocks.length;
      const selectedIdx = blocks.findIndex((b) => b.id === selectedBlockId);

      if (position === 'top') {
        targetIndex = 0;
      } else if (position === 'bottom') {
        targetIndex = blocks.length;
      } else if (position === 'above') {
        targetIndex = selectedIdx !== -1 ? selectedIdx : 0;
      } else {
        // default 'below'
        targetIndex = selectedIdx !== -1 ? selectedIdx + 1 : blocks.length;
      }

      handlePasteBlock(latest, targetIndex);
    },
    [clipboardHistory, blocks, selectedBlockId, handlePasteBlock, showToast]
  );

  // Clear clipboard history
  const handleClearClipboard = useCallback(() => {
    updateClipboard([]);
    showToast({
      title: 'Clipboard Cleared',
      description: 'All stored block snapshots have been removed.',
    });
  }, [updateClipboard, showToast]);

  // Remove individual clipboard history item
  const handleRemoveClipboardItem = useCallback(
    (id: string) => {
      const updated = clipboardHistory.filter((i) => i.id !== id);
      updateClipboard(updated);
    },
    [clipboardHistory, updateClipboard]
  );

  const handleMoveUp = (blockId: string) => {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx <= 0) return;
    pushHistory(blocks);
    const updated = [...blocks];
    const [moved] = updated.splice(idx, 1);
    updated.splice(idx - 1, 0, moved);
    setBlocks(updated);
    triggerBlockAnimation(blockId, 'moved-up');
  };

  const handleMoveDown = (blockId: string) => {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx === -1 || idx >= blocks.length - 1) return;
    pushHistory(blocks);
    const updated = [...blocks];
    const [moved] = updated.splice(idx, 1);
    updated.splice(idx + 1, 0, moved);
    setBlocks(updated);
    triggerBlockAnimation(blockId, 'moved-down');
  };

  const handleReorderBlocks = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      if (
        sourceIndex < 0 ||
        sourceIndex >= blocks.length ||
        destinationIndex < 0 ||
        destinationIndex >= blocks.length ||
        sourceIndex === destinationIndex
      ) {
        return;
      }
      pushHistory(blocks);
      const updated = [...blocks];
      const [movedBlock] = updated.splice(sourceIndex, 1);
      updated.splice(destinationIndex, 0, movedBlock);
      setBlocks(updated);
      setSelectedBlockId(movedBlock.id);
      triggerBlockAnimation(
        movedBlock.id,
        destinationIndex < sourceIndex ? 'moved-up' : 'moved-down'
      );
      showToast({
        title: `Reordered "${movedBlock.name}"`,
        description: `Moved section from #${sourceIndex + 1} to #${destinationIndex + 1} in canvas.`,
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, pushHistory, triggerBlockAnimation, showToast, handleUndo]
  );

  const handleDuplicate = (blockId: string) => {
    const idx = blocks.findIndex((b) => b.id === blockId);
    if (idx === -1) return;
    pushHistory(blocks);
    const target = blocks[idx];
    const cloned: BlockInstance = {
      ...target,
      id: `block-${Math.random().toString(36).substring(2, 9)}`,
      name: `${target.name} (Copy)`,
      settings: { ...target.settings },
      content: { ...target.content },
    };
    const updated = [...blocks];
    updated.splice(idx + 1, 0, cloned);
    setBlocks(updated);
    setSelectedBlockId(cloned.id);
    triggerBlockAnimation(cloned.id, 'duplicated');
  };

  const handleDelete = (blockId: string) => {
    if (blocks.length <= 1) {
      alert('Your website must have at least one block section.');
      return;
    }
    pushHistory(blocks);
    const updated = blocks.filter((b) => b.id !== blockId);
    setBlocks(updated);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(updated[0]?.id || null);
      setSelectedBlockIds(updated[0] ? [updated[0].id] : []);
    }
  };

  const handleSelectBlock = useCallback(
    (id: string, isMultiToggle?: boolean) => {
      if (isMultiToggle || isMultiSelectMode) {
        setSelectedBlockIds((prev) => {
          const exists = prev.includes(id);
          const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
          setSelectedBlockId(next[next.length - 1] || null);
          return next;
        });
      } else {
        setSelectedBlockId(id);
        setSelectedBlockIds([id]);
      }
    },
    [isMultiSelectMode]
  );

  const handleSelectAllBlocks = useCallback(() => {
    const allIds = blocks.map((b) => b.id);
    setSelectedBlockIds(allIds);
    if (allIds.length > 0) {
      setSelectedBlockId(allIds[0]);
    }
  }, [blocks]);

  const handleDeselectAllBlocks = useCallback(() => {
    setSelectedBlockIds([]);
    setSelectedBlockId(null);
  }, []);

  const handleMoveSelectedBlocks = useCallback(
    (direction: 'up' | 'down') => {
      if (selectedBlockIds.length === 0) return;
      const selectedSet = new Set(selectedBlockIds);
      const updated = [...blocks];

      let changed = false;
      if (direction === 'up') {
        for (let i = 0; i < updated.length; i++) {
          if (selectedSet.has(updated[i].id)) {
            if (i > 0 && !selectedSet.has(updated[i - 1].id)) {
              const temp = updated[i];
              updated[i] = updated[i - 1];
              updated[i - 1] = temp;
              changed = true;
            }
          }
        }
      } else {
        for (let i = updated.length - 1; i >= 0; i--) {
          if (selectedSet.has(updated[i].id)) {
            if (i < updated.length - 1 && !selectedSet.has(updated[i + 1].id)) {
              const temp = updated[i];
              updated[i] = updated[i + 1];
              updated[i + 1] = temp;
              changed = true;
            }
          }
        }
      }

      if (changed) {
        pushHistory(blocks);
        setBlocks(updated);
        if (selectedBlockIds[0]) {
          triggerBlockAnimation(selectedBlockIds[0], direction === 'up' ? 'moved-up' : 'moved-down');
        }
        showToast({
          title: `Moved ${selectedBlockIds.length} ${selectedBlockIds.length === 1 ? 'section' : 'sections'} ${direction}`,
          description: `Shifted selected group ${direction} on the canvas.`,
          actionLabel: 'Undo',
          onAction: handleUndo,
        });
      }
    },
    [blocks, selectedBlockIds, pushHistory, triggerBlockAnimation, showToast, handleUndo]
  );

  const handleDuplicateSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    pushHistory(blocks);
    const selectedSet = new Set(selectedBlockIds);

    let lastSelectedIndex = -1;
    blocks.forEach((b, idx) => {
      if (selectedSet.has(b.id)) {
        lastSelectedIndex = idx;
      }
    });

    const clonedBlocks: BlockInstance[] = [];
    const newSelectedIds: string[] = [];

    blocks.forEach((b) => {
      if (selectedSet.has(b.id)) {
        const newId = `block-${Math.random().toString(36).substring(2, 9)}`;
        const cloned: BlockInstance = {
          ...b,
          id: newId,
          name: `${b.name} (Copy)`,
          settings: JSON.parse(JSON.stringify(b.settings)),
          content: JSON.parse(JSON.stringify(b.content)),
        };
        clonedBlocks.push(cloned);
        newSelectedIds.push(newId);
      }
    });

    const updated = [...blocks];
    updated.splice(lastSelectedIndex + 1, 0, ...clonedBlocks);
    setBlocks(updated);
    setSelectedBlockIds(newSelectedIds);
    setSelectedBlockId(newSelectedIds[0]);

    if (newSelectedIds[0]) {
      triggerBlockAnimation(newSelectedIds[0], 'duplicated');
    }

    showToast({
      title: `Duplicated ${clonedBlocks.length} ${clonedBlocks.length === 1 ? 'section' : 'sections'}`,
      description: `Cloned group on the canvas.`,
      actionLabel: 'Undo',
      onAction: handleUndo,
    });
  }, [blocks, selectedBlockIds, pushHistory, triggerBlockAnimation, showToast, handleUndo]);

  const handleDeleteSelectedBlocks = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    if (blocks.length <= selectedBlockIds.length) {
      alert('Your website must have at least one block section remaining.');
      return;
    }
    pushHistory(blocks);
    const selectedSet = new Set(selectedBlockIds);
    const updated = blocks.filter((b) => !selectedSet.has(b.id));
    setBlocks(updated);
    setSelectedBlockIds(updated[0] ? [updated[0].id] : []);
    setSelectedBlockId(updated[0]?.id || null);

    showToast({
      title: `Deleted ${selectedBlockIds.length} ${selectedBlockIds.length === 1 ? 'section' : 'sections'}`,
      description: `Removed selected group from the canvas.`,
      actionLabel: 'Undo',
      onAction: handleUndo,
    });
  }, [blocks, selectedBlockIds, pushHistory, showToast, handleUndo]);

  // Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Esc, Ctrl+B, Ctrl+K, P, Ctrl+C, Ctrl+V, Shift+Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Undo: Ctrl+Z / ⌘Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y / ⌘Y / ⌘Shift+Z
      else if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Copy Selected Block: Ctrl+C / ⌘C (when not inside an input)
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && !isInput) {
        if (selectedBlockId) {
          e.preventDefault();
          handleCopyBlock(selectedBlockId);
        }
      }
      // Open Clipboard Manager: Shift+Ctrl+V / Shift+⌘V
      else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'v' && !isInput) {
        e.preventDefault();
        setIsClipboardModalOpen(true);
      }
      // Toggle Revision History: Ctrl+H / ⌘H / Alt+H
      else if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'h' && !isInput) ||
        (e.altKey && e.key.toLowerCase() === 'h' && !isInput)
      ) {
        e.preventDefault();
        setIsRevisionHistoryOpen((prev) => !prev);
      }
      // Quick Paste below selected block: Ctrl+V / ⌘V (when not inside an input)
      else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'v' && !isInput) {
        e.preventDefault();
        handlePasteLatest('below');
      }
      // Duplicate Selected Group: Ctrl+D / ⌘D
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && !isInput) {
        if (selectedBlockIds.length > 1) {
          e.preventDefault();
          handleDuplicateSelectedBlocks();
        } else if (selectedBlockId) {
          e.preventDefault();
          handleDuplicate(selectedBlockId);
        }
      }
      // Delete Selected Group: Delete or Backspace
      else if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        if (selectedBlockIds.length > 1) {
          e.preventDefault();
          handleDeleteSelectedBlocks();
        } else if (selectedBlockId) {
          e.preventDefault();
          handleDelete(selectedBlockId);
        }
      }
      // Move Selected Group: Alt+ArrowUp / Alt+ArrowDown
      else if (e.altKey && e.key === 'ArrowUp' && !isInput) {
        e.preventDefault();
        if (selectedBlockIds.length > 1) {
          handleMoveSelectedBlocks('up');
        } else if (selectedBlockId) {
          handleMoveUp(selectedBlockId);
        }
      } else if (e.altKey && e.key === 'ArrowDown' && !isInput) {
        e.preventDefault();
        if (selectedBlockIds.length > 1) {
          handleMoveSelectedBlocks('down');
        } else if (selectedBlockId) {
          handleMoveDown(selectedBlockId);
        }
      }
      // Escape: Close multi-select, sidebars and deselect block
      else if (e.key === 'Escape') {
        if (isMultiSelectMode || selectedBlockIds.length > 1) {
          setIsMultiSelectMode(false);
          setSelectedBlockIds(selectedBlockId ? [selectedBlockId] : []);
        } else if (isRevisionHistoryOpen) {
          setIsRevisionHistoryOpen(false);
        } else if (isClipboardModalOpen) {
          setIsClipboardModalOpen(false);
        } else if (isLivePreviewModalOpen) {
          setIsLivePreviewModalOpen(false);
        } else if (isDesignModeOpen) {
          setIsDesignModeOpen(false);
        } else if (selectedBlockId) {
          setSelectedBlockId(null);
          setSelectedBlockIds([]);
        }
      }
      // Toggle Design Mode sidebar: Ctrl+B / ⌘B
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsDesignModeOpen((prev) => !prev);
      }
      // Quick Search / Filter Blocks: Ctrl+K / ⌘K
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsDesignModeOpen(true);
        setDesignActiveTab('blocks');
        setTimeout(() => {
          const input = document.getElementById('blocks-filter-input') as HTMLInputElement;
          input?.focus();
        }, 50);
      }
      // Toggle In-Canvas Preview: 'p' or 'P' (when not in input)
      // Shift+P: Open Full-Screen Live Preview Modal
      else if (e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey && !isInput) {
        e.preventDefault();
        if (e.shiftKey) {
          setIsLivePreviewModalOpen((prev) => !prev);
        } else {
          setIsPreviewMode((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    isDesignModeOpen,
    isClipboardModalOpen,
    isLivePreviewModalOpen,
    isRevisionHistoryOpen,
    isMultiSelectMode,
    selectedBlockId,
    selectedBlockIds,
    handleCopyBlock,
    handlePasteLatest,
    handleDuplicate,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
    handleDuplicateSelectedBlocks,
    handleDeleteSelectedBlocks,
    handleMoveSelectedBlocks,
  ]);

  // Block management
  const handleAddBlock = (type: string) => {
    pushHistory(blocks);
    const newBlock = createNewBlock(type);

    if (selectedBlockId) {
      const idx = blocks.findIndex((b) => b.id === selectedBlockId);
      if (idx !== -1) {
        const updated = [...blocks];
        updated.splice(idx + 1, 0, newBlock);
        setBlocks(updated);
        setSelectedBlockId(newBlock.id);
        triggerBlockAnimation(newBlock.id, 'added');
        return;
      }
    }

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    triggerBlockAnimation(newBlock.id, 'added');
  };

  // Preset Handlers: Add block from preset & apply preset to block
  const handleAddPreset = useCallback(
    (preset: BlockPreset, targetIndex?: number) => {
      pushHistory(blocks);
      const newBlock: BlockInstance = {
        id: `block-${Math.random().toString(36).substring(2, 9)}`,
        type: preset.block.type,
        category: preset.block.category,
        name: preset.name || preset.block.name,
        settings: JSON.parse(JSON.stringify(preset.block.settings)),
        content: JSON.parse(JSON.stringify(preset.block.content)),
        visualNode: preset.block.visualNode
          ? JSON.parse(JSON.stringify(preset.block.visualNode))
          : undefined,
      };

      const updated = [...blocks];
      let insertIdx = updated.length;
      if (typeof targetIndex === 'number') {
        insertIdx = Math.max(0, Math.min(targetIndex, updated.length));
      } else if (selectedBlockId) {
        const currIdx = updated.findIndex((b) => b.id === selectedBlockId);
        if (currIdx !== -1) {
          insertIdx = currIdx + 1;
        }
      }

      updated.splice(insertIdx, 0, newBlock);
      setBlocks(updated);
      setSelectedBlockId(newBlock.id);
      triggerBlockAnimation(newBlock.id, 'added');

      showToast({
        title: `Added "${preset.name}"`,
        description: `Inserted at position #${insertIdx + 1} of ${updated.length}.`,
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, selectedBlockId, pushHistory, handleUndo, showToast, triggerBlockAnimation]
  );

  const handleApplyPreset = useCallback(
    (blockId: string, preset: BlockPreset) => {
      pushHistory(blocks);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          return {
            ...b,
            name: preset.name || b.name,
            settings: JSON.parse(JSON.stringify(preset.block.settings)),
            content: JSON.parse(JSON.stringify(preset.block.content)),
            visualNode: preset.block.visualNode
              ? JSON.parse(JSON.stringify(preset.block.visualNode))
              : b.visualNode,
          };
        })
      );
      showToast({
        title: `Preset Applied`,
        description: `Applied "${preset.name}" styling and content to current block.`,
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, pushHistory, handleUndo, showToast]
  );

  const handleUpdateSettings = (blockId: string, settingsPatch: Partial<BlockInstance['settings']>) => {
    pushHistory(blocks);
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, settings: { ...b.settings, ...settingsPatch } }
          : b
      )
    );
  };

  const handleUpdateContent = (blockId: string, contentPatch: Partial<BlockInstance['content']>) => {
    pushHistory(blocks);
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, content: { ...b.content, ...contentPatch } }
          : b
      )
    );
  };

  const handleSaveBlockCustomCode = useCallback(
    (blockId: string, customHtml: string, customCss: string) => {
      pushHistory(blocks);
      const targetBlock = blocks.find((b) => b.id === blockId);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          const updatedContent =
            b.category === 'html'
              ? { ...b.content, rawHtml: customHtml, rawCss: customCss }
              : b.content;
          return {
            ...b,
            customHtml,
            customCss,
            content: updatedContent,
          };
        })
      );
      showToast({
        title: `Updated Code for "${targetBlock?.name || 'Block'}"`,
        description: 'Applied custom HTML & scoped CSS to live canvas.',
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, pushHistory, showToast, handleUndo]
  );

  const handleResetBlockCustomCode = useCallback(
    (blockId: string) => {
      pushHistory(blocks);
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== blockId) return b;
          return {
            ...b,
            customHtml: undefined,
            customCss: undefined,
          };
        })
      );
    },
    [blocks, pushHistory]
  );

  const handleInlineTextChange = (blockId: string, field: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          content: {
            ...b.content,
            [field]: value,
          },
        };
      })
    );
  };

  const handleSelectTemplate = (newBlocks: BlockInstance[], templateTitle: string, templateTheme?: SiteTheme) => {
    pushHistory(blocks);
    setBlocks(newBlocks);
    setProjectTitle(templateTitle);
    if (templateTheme) {
      handleUpdateTheme(templateTheme);
    }
    setSelectedBlockId(newBlocks[0]?.id || null);
    if (newBlocks[0]?.id) {
      triggerBlockAnimation(newBlocks[0].id, 'added');
    }
    showToast({
      title: `Applied "${templateTitle}"`,
      description: `Loaded ${newBlocks.length} Bootstrap 5 sections into your active project.`,
      actionLabel: 'Undo',
      onAction: handleUndo,
    });
  };

  const handleCloneTemplate = (clonedBlocks: BlockInstance[], cloneTitle: string, cloneTheme?: SiteTheme) => {
    pushHistory(blocks);
    setBlocks(clonedBlocks);
    setProjectTitle(cloneTitle);
    if (cloneTheme) {
      handleUpdateTheme(cloneTheme);
    }
    setSelectedBlockId(clonedBlocks[0]?.id || null);
    showToast({
      title: `Cloned "${cloneTitle}"`,
      description: `Created a duplicate experimental project in your dashboard with ${clonedBlocks.length} sections.`,
      actionLabel: 'Undo',
      onAction: handleUndo,
    });
  };

  const handleRestoreRevision = useCallback(
    (revision: ProjectRevision) => {
      pushHistory(blocks);
      setBlocks(revision.blocks);
      setTheme(revision.theme);
      setProjectTitle(revision.title);
      if (revision.seoSettings) {
        setSeoSettings(revision.seoSettings);
      }
      setSelectedBlockId(revision.blocks[0]?.id || null);
      showToast({
        title: `Restored "${revision.label || revision.title}"`,
        description: `Loaded ${revision.blockCount} sections from ${new Date(revision.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`,
        actionLabel: 'Undo',
        onAction: handleUndo,
      });
    },
    [blocks, pushHistory, handleUndo]
  );

  const handleExportHtml = () => {
    const html = generateCompleteHtml(blocks, theme, projectTitle, false, null, seoSettings);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const fileName = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'index'}.html`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'Project Downloaded',
      description: `Successfully exported and downloaded "${fileName}" (${(blob.size / 1024).toFixed(1)} KB).`,
    });
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || null;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Initializing CloudboyX Builder...</span>
        </div>
      </div>
    );
  }

  // Admin Portal View
  if (currentView === 'admin') {
    return (
      <AdminPortal
        projectTitle={projectTitle}
        blockCount={blocks.length}
        onBackToBuilder={() => {
          setCurrentView('builder');
          sessionStorage.setItem('builder_active_view', 'builder');
        }}
        onBackToLanding={() => {
          setCurrentView('landing');
          sessionStorage.setItem('builder_active_view', 'landing');
        }}
      />
    );
  }

  // Builder is gated: unauthenticated visitors or users viewing the marketing site see LandingPage
  if (!isAuthenticated || currentView === 'landing') {
    return (
      <LandingPage
        onEnterBuilder={() => {
          setCurrentView('builder');
          sessionStorage.setItem('builder_active_view', 'builder');
        }}
        onOpenAdmin={() => {
          setCurrentView('admin');
          sessionStorage.setItem('builder_active_view', 'admin');
        }}
        onOpenModules={() => setIsModulesModalOpen(true)}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
      />
    );
  }

  const isAnnouncementEnabled = localStorage.getItem('admin_setting_announcement_enabled') === 'true';
  const announcementText = localStorage.getItem('admin_setting_announcement') || '';

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans transition-colors duration-200 ${
        themeMode === 'dark' ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Optional Global Announcement from Admin */}
      {isAnnouncementEnabled && announcementText && (
        <div className="bg-violet-900 text-violet-100 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2 shrink-0 border-b border-violet-800">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <EditorHeader
        viewport={viewport}
        setViewport={handleViewportChange}
        activeBreakpoint={activeBreakpoint}
        onBreakpointChange={handleBreakpointChange}
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        onOpenLivePreview={() => setIsLivePreviewModalOpen(true)}
        onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
        isDesignModeOpen={isDesignModeOpen}
        onToggleDesignMode={() => setIsDesignModeOpen((prev) => !prev)}
        onExportHtml={handleExportHtml}
        onDownloadProject={handleExportHtml}
        onShareProject={() => setIsShareModalOpen(true)}
        onExportPdf={() => setIsPdfExportModalOpen(true)}
        onOpenRevisionHistory={() => setIsRevisionHistoryOpen(true)}
        blockCount={blocks.length}
        themeMode={themeMode}
        onToggleThemeMode={handleToggleThemeMode}
        onOpenClipboard={() => setIsClipboardModalOpen(true)}
        clipboardCount={clipboardHistory.length}
        onBackToLanding={() => {
          setCurrentView('landing');
          sessionStorage.setItem('builder_active_view', 'landing');
        }}
        onOpenAdmin={() => {
          setCurrentView('admin');
          sessionStorage.setItem('builder_active_view', 'admin');
        }}
        onOpenModules={() => setIsModulesModalOpen(true)}
        lastModified={lastModified}
        isSaving={isSaving}
      />

      {/* Breadcrumb Navigation Bar below Header */}
      {!isPreviewMode && (
        <BreadcrumbBar
          projectTitle={projectTitle}
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          themeMode={themeMode}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            if (!isDesignModeOpen) {
              setIsDesignModeOpen(true);
            }
          }}
          onDeselectBlock={() => setSelectedBlockId(null)}
          onOpenSettings={(id) => {
            setSelectedBlockId(id);
            setIsDesignModeOpen(true);
            setDesignActiveTab('settings');
          }}
          onOpenPageSettings={() => {
            setIsDesignModeOpen(true);
            setDesignActiveTab('seo');
          }}
          onUpdateSettings={handleUpdateSettings}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCopyBlock={handleCopyBlock}
          onOpenCodeEditor={(id) => setCodeEditorBlockId(id)}
          onOpenClipboard={() => setIsClipboardModalOpen(true)}
          clipboardCount={clipboardHistory.length}
        />
      )}

      {/* Main Workspace: Canvas and Embedded Design Mode Sidebar */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas Frame with Active Breakpoint Markers */}
        <CanvasFrame
          blocks={blocks}
          theme={theme}
          projectTitle={projectTitle}
          seoSettings={seoSettings}
          viewport={viewport}
          activeBreakpoint={activeBreakpoint}
          onBreakpointChange={handleBreakpointChange}
          selectedBlockId={selectedBlockId}
          selectedBlockIds={selectedBlockIds}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelectMode={() => setIsMultiSelectMode((prev) => !prev)}
          onSelectBlock={(id, isMulti) => {
            handleSelectBlock(id, isMulti);
            if (isBlockParametersOpen) {
              setParametersBlockId(id);
            }
          }}
          onSelectAllBlocks={handleSelectAllBlocks}
          onDeselectAllBlocks={handleDeselectAllBlocks}
          onMoveSelectedBlocks={handleMoveSelectedBlocks}
          onDuplicateSelectedBlocks={handleDuplicateSelectedBlocks}
          onDeleteSelectedBlocks={handleDeleteSelectedBlocks}
          onOpenSettings={(id) => {
            handleOpenBlockParameters(id);
          }}
          onOpenParameters={handleOpenBlockParameters}
          onOpenCodeEditor={(id) => setCodeEditorBlockId(id)}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onReorderBlocks={handleReorderBlocks}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onCopyBlock={handleCopyBlock}
          onPasteLatest={handlePasteLatest}
          onOpenClipboard={() => setIsClipboardModalOpen(true)}
          clipboardCount={clipboardHistory.length}
          onInlineTextChange={handleInlineTextChange}
          onOpenLibrary={() => {
            setDesignActiveTab('blocks');
            setIsDesignModeOpen(true);
          }}
          onAddBlock={handleAddBlock}
          isPreviewMode={isPreviewMode}
          isDesignModeOpen={isDesignModeOpen}
          themeMode={themeMode}
          onOpenLivePreview={() => setIsLivePreviewModalOpen(true)}
          animationMeta={animationMeta}
        />

        {/* Embedded Design Mode Dock / Sidebar (Right side by default, toggleable to Left) */}
        {!isPreviewMode && (
          <DesignSidebar
            isOpen={isDesignModeOpen}
            onClose={() => setIsDesignModeOpen(false)}
            activeTab={designActiveTab}
            onSelectTab={setDesignActiveTab}
            dockSide={designDockSide}
            onToggleDockSide={() =>
              setDesignDockSide((prev) => (prev === 'right' ? 'left' : 'right'))
            }
            activeBreakpoint={activeBreakpoint}
            onBreakpointChange={handleBreakpointChange}
            blocks={blocks}
            selectedBlock={selectedBlock}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onAddBlock={handleAddBlock}
            onUpdateSettings={handleUpdateSettings}
            onUpdateContent={handleUpdateContent}
            onUpdateVisualNode={handleUpdateVisualNode}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onCopyBlock={handleCopyBlock}
            onOpenCodeEditor={(id) => setCodeEditorBlockId(id)}
            theme={theme}
            themeMode={themeMode}
            onUpdateTheme={handleUpdateTheme}
            seoSettings={seoSettings}
            onUpdateSeoSettings={setSeoSettings}
            projectTitle={projectTitle}
            onUpdateProjectTitle={setProjectTitle}
            lastModified={lastModified}
            onSelectTemplate={handleSelectTemplate}
            onAddPreset={handleAddPreset}
            onApplyPreset={handleApplyPreset}
            isStudioViewerOpen={isStudioViewerOpen}
            onOpenViewer={(tab) => {
              if (tab) setDesignActiveTab(tab);
              setIsStudioViewerOpen(true);
            }}
            onCloseViewer={() => setIsStudioViewerOpen(false)}
            showToast={showToast}
          />
        )}
      </div>

      {/* Mobirise-Style Block Parameters Flyout */}
      <BlockParametersFlyout
        isOpen={isBlockParametersOpen}
        onClose={handleCloseBlockParameters}
        block={blocks.find((b) => b.id === (parametersBlockId || selectedBlockId)) || null}
        blocks={blocks}
        onUpdateSettings={handleUpdateSettings}
        onUpdateContent={handleUpdateContent}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onOpenCodeEditor={(id) => setCodeEditorBlockId(id)}
        onOpenDesignStudio={(tab) => {
          if (tab) setDesignActiveTab(tab as any);
          setIsDesignModeOpen(true);
        }}
        themeMode={themeMode}
        theme={theme}
      />

      {/* CloudboyX Connected Custom Modules Modal */}
      <CloudboyXModulesModal
        isOpen={isModulesModalOpen}
        onClose={() => setIsModulesModalOpen(false)}
        onApplyTheme={() => {
          handleUpdateTheme({
            primaryColor: '#0b0f19',
            fontFamily: 'Plus Jakarta Sans',
            headingFontFamily: 'Space Grotesk',
            buttonStyle: 'rounded',
            colorMode: 'dark',
          });
        }}
      />

      {/* Full-Screen Live Preview Modal */}
      <LivePreviewModal
        isOpen={isLivePreviewModalOpen}
        onClose={() => setIsLivePreviewModalOpen(false)}
        blocks={blocks}
        theme={theme}
        projectTitle={projectTitle}
        seoSettings={seoSettings}
        themeMode={themeMode}
      />

      {/* Spacious Design Studio Pop-up Viewer Modal (Viewpoints window style) */}
      <DesignStudioModal
        isOpen={isStudioViewerOpen}
        onClose={() => setIsStudioViewerOpen(false)}
        activeTab={designActiveTab}
        onSelectTab={setDesignActiveTab}
        activeBreakpoint={activeBreakpoint}
        onBreakpointChange={handleBreakpointChange}
        blocks={blocks}
        selectedBlock={selectedBlock}
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
        onAddBlock={handleAddBlock}
        onUpdateSettings={handleUpdateSettings}
        onUpdateContent={handleUpdateContent}
        onUpdateVisualNode={handleUpdateVisualNode}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onCopyBlock={handleCopyBlock}
        onOpenCodeEditor={(id) => setCodeEditorBlockId(id)}
        theme={theme}
        themeMode={themeMode}
        onUpdateTheme={handleUpdateTheme}
        seoSettings={seoSettings}
        onUpdateSeoSettings={setSeoSettings}
        projectTitle={projectTitle}
        onUpdateProjectTitle={setProjectTitle}
        onSelectTemplate={handleSelectTemplate}
        onAddPreset={handleAddPreset}
        onApplyPreset={handleApplyPreset}
      />

      {/* Clipboard Manager Modal */}
      <ClipboardManagerModal
        isOpen={isClipboardModalOpen}
        onClose={() => setIsClipboardModalOpen(false)}
        clipboardHistory={clipboardHistory}
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onPasteBlock={handlePasteBlock}
        onClearClipboard={handleClearClipboard}
        onRemoveClipboardItem={handleRemoveClipboardItem}
        themeMode={themeMode}
      />

      {/* Full-Screen 100+ Bootstrap 5 Template Gallery Modal */}
      <TemplateGallery
        isOpen={isTemplateGalleryOpen}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onCloneTemplate={handleCloneTemplate}
        themeMode={themeMode}
        activeProjectTitle={projectTitle}
      />

      {/* Split-Pane Block HTML & CSS Code Editor + Remix Studio Modal */}
      <BlockCodeEditorModal
        isOpen={Boolean(codeEditorBlockId)}
        block={blocks.find((b) => b.id === codeEditorBlockId) || null}
        theme={theme}
        themeMode={themeMode}
        onClose={() => setCodeEditorBlockId(null)}
        onSaveCode={handleSaveBlockCustomCode}
        onResetCode={handleResetBlockCustomCode}
      />

      {/* Structured Printable PDF Document Export Modal */}
      <PdfExportModal
        isOpen={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
        blocks={blocks}
        theme={theme}
        projectTitle={projectTitle}
        seoSettings={seoSettings}
        themeMode={themeMode}
      />

      {/* Revision History & Autosaved Snapshots Panel */}
      <RevisionHistoryModal
        isOpen={isRevisionHistoryOpen}
        onClose={() => setIsRevisionHistoryOpen(false)}
        currentBlocks={blocks}
        currentTheme={theme}
        currentProjectTitle={projectTitle}
        currentSeoSettings={seoSettings}
        onRestoreRevision={handleRestoreRevision}
        onCloneAsProject={(rev) =>
          handleCloneTemplate(rev.blocks, `${rev.title} (Snapshot Copy)`, rev.theme)
        }
        themeMode={themeMode}
      />

      {/* Share Project Modal: Link Generator & JSON State Clipboard */}
      <ShareProjectModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        blocks={blocks}
        theme={theme}
        projectTitle={projectTitle}
        seoSettings={seoSettings}
        themeMode={themeMode}
        showToast={showToast}
        onImportState={handleImportSharedState}
      />

      {/* Floating Clipboard / Action Toast Notification */}
      {toast && (
        <div
          id="app-clipboard-toast"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            themeMode === 'dark'
              ? 'bg-slate-900 text-slate-100 border-slate-700/80 shadow-black/80'
              : 'bg-white text-slate-900 border-slate-200 shadow-xl'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>

          <div className="flex flex-col pr-1 min-w-0">
            <span className="text-xs font-bold leading-tight truncate max-w-xs sm:max-w-sm">
              {toast.title}
            </span>
            {toast.description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug truncate max-w-xs sm:max-w-sm">
                {toast.description}
              </span>
            )}
          </div>

          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                setToast(null);
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shrink-0"
            >
              {toast.actionLabel}
            </button>
          )}

          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer shrink-0"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
