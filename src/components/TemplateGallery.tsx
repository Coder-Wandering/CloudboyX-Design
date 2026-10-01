import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Eye,
  Layers,
  Palette,
  Type,
  CheckCircle2,
  ArrowUpRight,
  LayoutGrid,
  Sun,
  Moon,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BoxSelect,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Loader2,
  Tag,
  ArrowUpDown,
  Clock,
  Trash2,
  Share2,
  Copy,
  Link2,
  Star,
  Heart,
  Columns2,
  Check,
  Download,
  FileArchive,
  StickyNote,
  CopyPlus,
  FileText,
  Printer,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { STARTER_TEMPLATES, DEFAULT_THEME } from '../data/starterTemplates';
import {
  BlockInstance,
  StarterTemplate,
  SiteTheme,
  ClonedTemplateProject,
  CLONED_PROJECTS_STORAGE_KEY,
} from '../types';
import { generateCompleteHtml } from '../utils/htmlGenerator';

export interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (blocks: BlockInstance[], title: string, theme?: SiteTheme) => void;
  onCloneTemplate?: (blocks: BlockInstance[], title: string, theme?: SiteTheme) => void;
  isEmbedded?: boolean;
  themeMode?: 'light' | 'dark';
  activeProjectTitle?: string;
}

const STYLE_FILTERS = [
  'All',
  'Favorites',
  'Agency',
  'SaaS',
  'Portfolio',
  'E-Commerce',
  'Corporate',
  'Startup',
  'Health & Mobile',
  'Events & Dining',
  'Eco & Community',
  'Minimal',
] as const;

const FEATURE_TAG_CLOUD = [
  'E-commerce',
  'Dark Mode',
  'Blog-ready',
  'Pricing Table',
  'Portfolio Grid',
  'Mega Menu',
  'Lead Gen Form',
  'AI & SaaS',
  'FAQ Accordion',
  'Testimonials',
] as const;

const FEATURE_TAG_COLORS: Record<
  string,
  { light: string; dark: string; active: string; dot: string }
> = {
  'E-commerce': {
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    dark: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/70',
    active: 'bg-emerald-600 text-white border-emerald-500 shadow-xs',
    dot: 'bg-emerald-500',
  },
  'Dark Mode': {
    light: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100',
    dark: 'bg-violet-950/60 text-violet-300 border-violet-800/80 hover:bg-violet-900/70',
    active: 'bg-violet-600 text-white border-violet-500 shadow-xs',
    dot: 'bg-violet-500',
  },
  'Blog-ready': {
    light: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    dark: 'bg-amber-950/60 text-amber-300 border-amber-800/80 hover:bg-amber-900/70',
    active: 'bg-amber-600 text-white border-amber-500 shadow-xs',
    dot: 'bg-amber-500',
  },
  'Pricing Table': {
    light: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
    dark: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/70',
    active: 'bg-cyan-600 text-white border-cyan-500 shadow-xs',
    dot: 'bg-cyan-500',
  },
  'Portfolio Grid': {
    light: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    dark: 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/70',
    active: 'bg-rose-600 text-white border-rose-500 shadow-xs',
    dot: 'bg-rose-500',
  },
  'Mega Menu': {
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    dark: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80 hover:bg-indigo-900/70',
    active: 'bg-indigo-600 text-white border-indigo-500 shadow-xs',
    dot: 'bg-indigo-500',
  },
  'Lead Gen Form': {
    light: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    dark: 'bg-teal-950/60 text-teal-300 border-teal-800/80 hover:bg-teal-900/70',
    active: 'bg-teal-600 text-white border-teal-500 shadow-xs',
    dot: 'bg-teal-500',
  },
  'AI & SaaS': {
    light: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    dark: 'bg-blue-950/60 text-blue-300 border-blue-800/80 hover:bg-blue-900/70',
    active: 'bg-blue-600 text-white border-blue-500 shadow-xs',
    dot: 'bg-blue-500',
  },
  'FAQ Accordion': {
    light: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100',
    dark: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/80 hover:bg-fuchsia-900/70',
    active: 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-xs',
    dot: 'bg-fuchsia-500',
  },
  Testimonials: {
    light: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    dark: 'bg-orange-950/60 text-orange-300 border-orange-800/80 hover:bg-orange-900/70',
    active: 'bg-orange-600 text-white border-orange-500 shadow-xs',
    dot: 'bg-orange-500',
  },
};

function getTemplateFeatureBadges(tmpl: StarterTemplate): string[] {
  const badges: string[] = [];
  const lowerTags = tmpl.previewTags.map((t) => t.toLowerCase());
  const lowerDesc = tmpl.description.toLowerCase();

  if (
    tmpl.style === 'E-Commerce' ||
    tmpl.category === 'E-Commerce & Retail' ||
    lowerTags.some((t) => t.includes('commerce') || t.includes('retail') || t.includes('dtc') || t.includes('payments'))
  ) {
    badges.push('E-commerce');
  }

  if (tmpl.theme?.colorMode === 'dark' || lowerTags.some((t) => t.includes('dark'))) {
    badges.push('Dark Mode');
  }

  if (
    tmpl.style === 'Minimal' ||
    lowerTags.some((t) =>
      ['editorial', 'newsletter', 'publishing', 'books', 'docs', 'changelog', 'monograph'].includes(t)
    ) ||
    lowerDesc.includes('editorial') ||
    lowerDesc.includes('journal') ||
    tmpl.blocks.some((b) => b.category === 'content')
  ) {
    badges.push('Blog-ready');
  }

  if (tmpl.blocks.some((b) => b.category === 'pricing' || b.type.includes('pricing'))) {
    badges.push('Pricing Table');
  }

  if (tmpl.blocks.some((b) => b.category === 'gallery' || b.type.includes('gallery'))) {
    badges.push('Portfolio Grid');
  }

  if (tmpl.blocks.some((b) => b.type === 'navbar-megamenu')) {
    badges.push('Mega Menu');
  }

  if (tmpl.blocks.some((b) => b.category === 'forms' || b.type.includes('contact'))) {
    badges.push('Lead Gen Form');
  }

  if (tmpl.category === 'SaaS & AI' || tmpl.style === 'SaaS' || tmpl.style === 'Startup') {
    badges.push('AI & SaaS');
  }

  if (tmpl.blocks.some((b) => b.type === 'faq-accordion')) {
    badges.push('FAQ Accordion');
  }

  if (tmpl.blocks.some((b) => b.category === 'testimonials')) {
    badges.push('Testimonials');
  }

  return badges;
}

const COMPLEXITY_LABELS: Record<1 | 2 | 3 | 4 | 5, { label: string; hint: string }> = {
  1: { label: 'Minimal Setup', hint: '1/5 Complexity — Ready to publish with minimal text edits' },
  2: { label: 'Easy Customization', hint: '2/5 Complexity — Quick brand & copy customization' },
  3: { label: 'Moderate', hint: '3/5 Complexity — Balanced multi-section layout & media setup' },
  4: { label: 'Advanced', hint: '4/5 Complexity — Rich interactive sections, pricing & forms' },
  5: { label: 'Full Suite', hint: '5/5 Complexity — Comprehensive enterprise & e-commerce architecture' },
};

function getTemplateComplexity(tmpl: StarterTemplate): {
  rating: 1 | 2 | 3 | 4 | 5;
  label: string;
  hint: string;
} {
  if (tmpl.complexity && tmpl.complexity >= 1 && tmpl.complexity <= 5) {
    const meta = COMPLEXITY_LABELS[tmpl.complexity];
    return { rating: tmpl.complexity, label: meta.label, hint: meta.hint };
  }

  let pts = 1;
  const blockCount = tmpl.blocks.length;
  if (blockCount >= 5) pts += 1;
  if (blockCount >= 6) pts += 1;

  const hasMegaMenu = tmpl.blocks.some((b) => b.type === 'navbar-megamenu');
  const hasPricing = tmpl.blocks.some((b) => b.category === 'pricing' || b.type.includes('pricing'));
  const hasForm = tmpl.blocks.some((b) => b.category === 'forms' || b.type.includes('contact'));
  const hasGalleryOrFaq = tmpl.blocks.some(
    (b) => b.category === 'gallery' || b.type === 'faq-accordion'
  );

  if (tmpl.style === 'Minimal') {
    pts = Math.min(pts, 2);
  } else {
    if (hasMegaMenu || tmpl.style === 'E-Commerce' || tmpl.style === 'Corporate') pts += 1;
    if ((hasPricing && hasForm) || (hasPricing && hasGalleryOrFaq)) pts += 1;
  }

  // Deterministic tie-breaker across templates for a balanced 1–5 distribution
  const idHash = tmpl.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  if (tmpl.style === 'Minimal' && idHash % 2 === 0) {
    pts = 1;
  } else if (pts === 3 && idHash % 4 === 0) {
    pts = 2;
  } else if (pts === 4 && idHash % 3 === 0 && hasMegaMenu) {
    pts = 5;
  }

  const clamped = Math.max(1, Math.min(5, pts)) as 1 | 2 | 3 | 4 | 5;
  const meta = COMPLEXITY_LABELS[clamped];
  return { rating: clamped, label: meta.label, hint: meta.hint };
}

const RECENTLY_VIEWED_STORAGE_KEY = 'cloudboyx_recently_viewed_templates';
const FAVORITES_STORAGE_KEY = 'cloudboyx_favorite_templates';
const TEMPLATE_NOTES_STORAGE_KEY = 'cloudboyx_template_notes';
const TEMPLATE_USAGE_STORAGE_KEY = 'cloudboyx_template_usage_frequency';
const MAX_RECENTLY_VIEWED = 5;

export type TemplateSortOption = 'date_created' | 'name' | 'usage_frequency';

const BASE_REFERENCE_EPOCH = new Date('2026-10-01T00:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function getTemplateSortMetrics(
  tmpl: StarterTemplate,
  index: number,
  userUsageCounts: Record<string, number>
): {
  createdAt: number;
  createdDateFormatted: string;
  usageCount: number;
} {
  let hash = 0;
  for (let i = 0; i < tmpl.id.length; i++) {
    hash = (hash * 31 + tmpl.id.charCodeAt(i)) >>> 0;
  }

  // Deterministic creation date: 'New' badge templates are within the last 1–12 days;
  // other templates are staggered chronologically over the past 14–180 days.
  const daysAgo =
    tmpl.badge === 'New'
      ? 1 + (index % 10)
      : 14 + ((index * 3 + (hash % 11)) % 165);
  const createdAt = BASE_REFERENCE_EPOCH - daysAgo * DAY_MS;
  const dateObj = new Date(createdAt);
  const createdDateFormatted = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Deterministic base usage frequency + persisted user usage increments
  let baseUsage = 240 + (hash % 320);
  if (tmpl.badge === 'Popular') baseUsage += 1200;
  else if (tmpl.badge === 'Featured') baseUsage += 850;
  else if (tmpl.badge === 'High-Converting') baseUsage += 680;
  else if (tmpl.badge === 'Curated') baseUsage += 460;
  else if (tmpl.badge === 'New') baseUsage += 150;

  const userIncrement = userUsageCounts[tmpl.id] || 0;
  return {
    createdAt,
    createdDateFormatted,
    usageCount: baseUsage + userIncrement,
  };
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCloneTemplate,
  isEmbedded = false,
  themeMode = 'light',
  activeProjectTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('All');
  const [selectedFeatureTags, setSelectedFeatureTags] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<'all' | 'light' | 'dark'>('all');
  const [sortBy, setSortBy] = useState<TemplateSortOption>('usage_frequency');
  const [quickPreviewTemplate, setQuickPreviewTemplate] = useState<StarterTemplate | null>(null);
  const [quickViewImageTemplate, setQuickViewImageTemplate] = useState<StarterTemplate | null>(null);
  const [quickViewImageZoom, setQuickViewImageZoom] = useState<number>(100);
  const [previewViewport, setPreviewViewport] = useState<'fluid' | 'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewMode, setPreviewMode] = useState<'iframe' | 'mock-canvas'>('iframe');
  const [showComponentOutlines, setShowComponentOutlines] = useState<boolean>(true);
  const [activePreviewBlockId, setActivePreviewBlockId] = useState<string | null>(null);
  const [applyThemeOnLoad, setApplyThemeOnLoad] = useState(true);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloadSuccess, setZipDownloadSuccess] = useState(false);
  const [exportingPdfTemplateId, setExportingPdfTemplateId] = useState<string | null>(null);
  const [pdfExportSuccessTemplateId, setPdfExportSuccessTemplateId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isShareBannerOpen, setIsShareBannerOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Side-by-Side Template Comparison State
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareViewMode, setCompareViewMode] = useState<'split' | 'live' | 'matrix'>('split');

  const toggleCompareTemplate = (
    templateId: string,
    e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e) e.stopPropagation();
    setCompareIds((prev) => {
      const exists = prev.includes(templateId);
      if (exists) {
        const next = prev.filter((id) => id !== templateId);
        if (next.length < 2) {
          setIsCompareModalOpen(false);
        }
        return next;
      }
      const next = [...prev, templateId].slice(-4);
      if (next.length >= 2) {
        setIsCompareModalOpen(true);
      }
      return next;
    });
  };

  const handleRemoveFromCompare = (templateId: string) => {
    setCompareIds((prev) => {
      const next = prev.filter((id) => id !== templateId);
      if (next.length < 2) {
        setIsCompareModalOpen(false);
      }
      return next;
    });
  };

  const handleClearCompare = () => {
    setCompareIds([]);
    setIsCompareModalOpen(false);
  };

  const comparedTemplates = useMemo(() => {
    return compareIds
      .map((id) => STARTER_TEMPLATES.find((t) => t.id === id))
      .filter((t): t is StarterTemplate => Boolean(t));
  }, [compareIds]);

  // Track user's favorite template IDs persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => typeof id === 'string');
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  const toggleFavoriteTemplate = (templateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds((prev) => {
      const updated = prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [templateId, ...prev];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Track per-template usage frequency increments in localStorage
  const [templateUsageCounts, setTemplateUsageCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_USAGE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, number>;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });

  const incrementTemplateUsage = (templateId: string) => {
    setTemplateUsageCounts((prev) => {
      const next = {
        ...prev,
        [templateId]: (prev[templateId] || 0) + 1,
      };
      try {
        localStorage.setItem(TEMPLATE_USAGE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Track user's personal annotations/notes per template ID persisted in localStorage
  const [templateNotes, setTemplateNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(TEMPLATE_NOTES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, string>;
        }
      }
    } catch {
      // ignore
    }
    return {};
  });

  const handleUpdateTemplateNote = (templateId: string, noteValue: string) => {
    setTemplateNotes((prev) => {
      const next = { ...prev };
      if (noteValue) {
        next[templateId] = noteValue;
      } else {
        delete next[templateId];
      }
      try {
        localStorage.setItem(TEMPLATE_NOTES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Track cloned template projects in the user's dashboard for experimentation
  const [clonedProjects, setClonedProjects] = useState<ClonedTemplateProject[]>(() => {
    try {
      const saved = localStorage.getItem(CLONED_PROJECTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [justClonedTemplateId, setJustClonedTemplateId] = useState<string | null>(null);

  const syncClonedProjectsStorage = (nextClones: ClonedTemplateProject[]) => {
    try {
      localStorage.setItem(CLONED_PROJECTS_STORAGE_KEY, JSON.stringify(nextClones));
      window.dispatchEvent(new CustomEvent('cloudboyx-cloned-projects-updated'));
    } catch {
      // ignore
    }
  };

  const handleCloneTemplateToDashboard = (tmpl: StarterTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const clonedBlocks: BlockInstance[] = tmpl.blocks.map((b) => ({
      ...JSON.parse(JSON.stringify(b)),
      id: `block-${Math.random().toString(36).substring(2, 9)}`,
    }));

    const resolvedTheme: SiteTheme = {
      primaryColor: tmpl.theme?.primaryColor || '#2222FF',
      secondaryColor: tmpl.theme?.secondaryColor || '#00E5D1',
      darkColor: tmpl.theme?.darkColor || '#1C1C23',
      lightColor: tmpl.theme?.lightColor || '#FFFFFF',
      fontFamily: tmpl.theme?.fontFamily || 'Inter',
      headingFontFamily: tmpl.theme?.headingFontFamily,
      buttonStyle: tmpl.theme?.buttonStyle || 'rounded-pill',
      colorMode: tmpl.theme?.colorMode || 'light',
      customCss: tmpl.theme?.customCss,
    };

    const existingCount = clonedProjects.filter(
      (c) => c.sourceTemplateId === tmpl.id
    ).length;
    const cloneTitle =
      existingCount === 0
        ? `${tmpl.name} (Clone)`
        : `${tmpl.name} (Clone #${existingCount + 1})`;

    const newClone: ClonedTemplateProject = {
      id: `clone-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceTemplateId: tmpl.id,
      sourceTemplateName: tmpl.name,
      title: cloneTitle,
      category: tmpl.category,
      style: tmpl.style,
      thumbnailUrl: tmpl.thumbnailUrl,
      accentColor: tmpl.accentColor,
      blocks: clonedBlocks,
      theme: resolvedTheme,
      createdAt: Date.now(),
    };

    setClonedProjects((prev) => {
      const updated = [newClone, ...prev];
      syncClonedProjectsStorage(updated);
      return updated;
    });

    setJustClonedTemplateId(tmpl.id);
    setTimeout(() => {
      setJustClonedTemplateId((prev) => (prev === tmpl.id ? null : prev));
    }, 2200);

    recordRecentlyViewed(tmpl.id);
    incrementTemplateUsage(tmpl.id);
    if (onCloneTemplate) {
      onCloneTemplate(clonedBlocks, cloneTitle, applyThemeOnLoad ? resolvedTheme : undefined);
    }
  };

  const handleOpenClonedProject = (clone: ClonedTemplateProject, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const freshBlocks: BlockInstance[] = clone.blocks.map((b) => ({
      ...JSON.parse(JSON.stringify(b)),
      id: `block-${Math.random().toString(36).substring(2, 9)}`,
    }));
    onSelectTemplate(
      freshBlocks,
      clone.title,
      applyThemeOnLoad ? clone.theme : undefined
    );
    setQuickPreviewTemplate(null);
    onClose();
  };

  const handleDeleteClonedProject = (cloneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClonedProjects((prev) => {
      const updated = prev.filter((c) => c.id !== cloneId);
      syncClonedProjectsStorage(updated);
      return updated;
    });
  };

  // Track the last 5 templates the user opened/viewed
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id) => typeof id === 'string').slice(0, MAX_RECENTLY_VIEWED);
        }
      }
    } catch {
      // ignore
    }
    const matchedActive = STARTER_TEMPLATES.find((t) => t.name === activeProjectTitle);
    const defaultIds = STARTER_TEMPLATES.slice(0, MAX_RECENTLY_VIEWED).map((t) => t.id);
    if (matchedActive && !defaultIds.includes(matchedActive.id)) {
      return [matchedActive.id, ...defaultIds.slice(0, MAX_RECENTLY_VIEWED - 1)];
    }
    return defaultIds;
  });

  const recordRecentlyViewed = (templateId: string) => {
    setRecentlyViewedIds((prev) => {
      const updated = [templateId, ...prev.filter((id) => id !== templateId)].slice(
        0,
        MAX_RECENTLY_VIEWED
      );
      try {
        localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleRemoveRecentlyViewed = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentlyViewedIds((prev) => {
      const updated = prev.filter((id) => id !== templateId);
      try {
        localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    try {
      localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
  };

  const recentlyViewedTemplates = useMemo(() => {
    return recentlyViewedIds
      .map((id) => STARTER_TEMPLATES.find((t) => t.id === id))
      .filter((t): t is StarterTemplate => Boolean(t))
      .slice(0, MAX_RECENTLY_VIEWED);
  }, [recentlyViewedIds]);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const previewFrameWrapperRef = useRef<HTMLDivElement>(null);
  const mockCanvasContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Allow pressing '/' or Cmd/Ctrl+K inside TemplateGallery to focus the dedicated search bar
  useEffect(() => {
    if (!isOpen || quickPreviewTemplate) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if (!isInput && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, quickPreviewTemplate]);

  const isDark = themeMode === 'dark';

  const hasActiveFiltersOrSort =
    searchQuery.trim() !== '' ||
    selectedStyle !== 'All' ||
    selectedFeatureTags.length > 0 ||
    modeFilter !== 'all' ||
    sortBy !== 'usage_frequency';

  const handleClearAllFiltersAndSort = () => {
    setSearchQuery('');
    setSelectedStyle('All');
    setSelectedFeatureTags([]);
    setModeFilter('all');
    setSortBy('usage_frequency');
  };

  const styleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: STARTER_TEMPLATES.length,
      Favorites: favoriteIds.length,
    };
    STARTER_TEMPLATES.forEach((t) => {
      const st = t.style || 'SaaS';
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [favoriteIds]);

  const featureTagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STARTER_TEMPLATES.forEach((t) => {
      const features = getTemplateFeatureBadges(t);
      features.forEach((f) => {
        counts[f] = (counts[f] || 0) + 1;
      });
    });
    return counts;
  }, []);

  const toggleFeatureTag = (tag: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedFeatureTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredTemplates = useMemo(() => {
    const indexMap = new Map<string, number>();
    STARTER_TEMPLATES.forEach((t, idx) => indexMap.set(t.id, idx));

    const matched = STARTER_TEMPLATES.filter((tmpl) => {
      if (selectedStyle === 'Favorites') {
        if (!favoriteIds.includes(tmpl.id)) return false;
      } else {
        const tmplStyle = tmpl.style || 'SaaS';
        const matchesStyle =
          selectedStyle === 'All' ||
          tmplStyle.toLowerCase() === selectedStyle.toLowerCase() ||
          tmpl.category.toLowerCase().includes(selectedStyle.toLowerCase());

        if (!matchesStyle) return false;
      }
      const tmplStyle = tmpl.style || 'SaaS';

      if (modeFilter !== 'all') {
        const tmplMode = tmpl.theme?.colorMode || 'light';
        if (tmplMode !== modeFilter) return false;
      }

      const tmplFeatureBadges = getTemplateFeatureBadges(tmpl);
      if (selectedFeatureTags.length > 0) {
        const hasAllSelectedTags = selectedFeatureTags.every(
          (selTag) =>
            tmplFeatureBadges.includes(selTag) ||
            tmpl.previewTags.some((pt) => pt.toLowerCase() === selTag.toLowerCase())
        );
        if (!hasAllSelectedTags) return false;
      }

      if (!searchQuery.trim()) return true;

      const rawQuery = searchQuery.toLowerCase().trim();
      const queryTokens = rawQuery.split(/\s+/).filter(Boolean);

      const searchableTitle = tmpl.name.toLowerCase();
      const searchableCategory = tmpl.category.toLowerCase();
      const searchableStyle = tmplStyle.toLowerCase();
      const searchableTags = [
        ...tmpl.previewTags.map((tag) => tag.toLowerCase()),
        ...tmplFeatureBadges.map((fb) => fb.toLowerCase()),
      ];
      const searchableDesc = tmpl.description.toLowerCase();
      const searchableFont = (tmpl.theme?.fontFamily || '').toLowerCase();
      const searchableBadge = (tmpl.badge || '').toLowerCase();
      const searchableBlocks = tmpl.blocks.map((b) => `${b.name} ${b.category}`.toLowerCase()).join(' ');

      return queryTokens.every(
        (token) =>
          searchableTitle.includes(token) ||
          searchableCategory.includes(token) ||
          searchableStyle.includes(token) ||
          searchableTags.some((tag) => tag.includes(token)) ||
          searchableDesc.includes(token) ||
          searchableFont.includes(token) ||
          searchableBadge.includes(token) ||
          searchableBlocks.includes(token)
      );
    });

    return [...matched].sort((a, b) => {
      const idxA = indexMap.get(a.id) ?? 0;
      const idxB = indexMap.get(b.id) ?? 0;

      if (sortBy === 'name') {
        return a.name.trim().localeCompare(b.name.trim());
      }

      const metricsA = getTemplateSortMetrics(a, idxA, templateUsageCounts);
      const metricsB = getTemplateSortMetrics(b, idxB, templateUsageCounts);

      if (sortBy === 'date_created') {
        if (metricsB.createdAt !== metricsA.createdAt) {
          return metricsB.createdAt - metricsA.createdAt;
        }
        return idxB - idxA;
      }

      // Default: 'usage_frequency'
      if (metricsB.usageCount !== metricsA.usageCount) {
        return metricsB.usageCount - metricsA.usageCount;
      }
      return idxA - idxB;
    });
  }, [
    selectedStyle,
    selectedFeatureTags,
    modeFilter,
    searchQuery,
    sortBy,
    favoriteIds,
    templateUsageCounts,
  ]);

  // Generate full-screen scrollable HTML document with optional component structure overlays
  const quickPreviewHtml = useMemo(() => {
    if (!quickPreviewTemplate) return '';
    const resolvedTheme: SiteTheme = {
      ...DEFAULT_THEME,
      ...(quickPreviewTemplate.theme || {}),
    };
    const baseHtml = generateCompleteHtml(
      quickPreviewTemplate.blocks,
      resolvedTheme,
      quickPreviewTemplate.name,
      false
    );

    const blockMetaMap = quickPreviewTemplate.blocks.map((b, i) => ({
      id: b.id,
      index: i + 1,
      name: b.name,
      category: b.category,
      type: b.type,
    }));

    const structureHelperInjection = `
      <style>
        html {
          scroll-behavior: smooth;
        }
        body.show-structure-outlines [data-block-id] {
          position: relative;
          outline: 1px dashed rgba(37, 99, 235, 0.45);
          outline-offset: -1px;
          transition: outline 0.15s ease, box-shadow 0.15s ease;
        }
        body.show-structure-outlines [data-block-id]:hover {
          outline: 2px solid rgba(37, 99, 235, 0.85);
          box-shadow: inset 0 0 0 3px rgba(37, 99, 235, 0.12);
        }
        .preview-structure-badge {
          position: absolute;
          top: 10px;
          right: 14px;
          z-index: 1040;
          display: none;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.88);
          color: #f8fafc;
          border: 1px solid rgba(59, 130, 246, 0.5);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
          font-weight: 600;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(6px);
        }
        body.show-structure-outlines .preview-structure-badge {
          display: inline-flex;
        }
      </style>
      <script>
        (function() {
          var metaList = ${JSON.stringify(blockMetaMap)};
          var showOutlines = ${JSON.stringify(showComponentOutlines)};
          if (showOutlines) {
            document.body.classList.add('show-structure-outlines');
          }

          metaList.forEach(function(meta) {
            var el = document.querySelector('[data-block-id="' + meta.id + '"]');
            if (el) {
              var badge = document.createElement('div');
              badge.className = 'preview-structure-badge';
              badge.textContent = '0' + meta.index + ' · ' + meta.name + ' (' + meta.category + ')';
              el.appendChild(badge);
            }
          });

          // Prevent external navigation while allowing internal anchor scrolling
          document.addEventListener('click', function(e) {
            var link = e.target.closest('a');
            if (link) {
              var href = link.getAttribute('href');
              if (href && !href.startsWith('#')) {
                e.preventDefault();
              }
            }
          });

          window.addEventListener('message', function(e) {
            if (!e.data || typeof e.data !== 'object') return;
            if (e.data.type === 'TOGGLE_STRUCTURE_OUTLINES') {
              if (e.data.enabled) {
                document.body.classList.add('show-structure-outlines');
              } else {
                document.body.classList.remove('show-structure-outlines');
              }
            }
            if (e.data.type === 'PREVIEW_SCROLL_TO_BLOCK' && e.data.blockId) {
              var target = document.querySelector('[data-block-id="' + e.data.blockId + '"]');
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          });
        })();
      </script>
    `;

    return baseHtml.replace('</body>', `${structureHelperInjection}\n</body>`);
  }, [quickPreviewTemplate]);

  // Synchronize component outline toggle with running iframe without reloading scroll position
  useEffect(() => {
    if (previewIframeRef.current?.contentWindow) {
      try {
        previewIframeRef.current.contentWindow.postMessage(
          {
            type: 'TOGGLE_STRUCTURE_OUTLINES',
            enabled: showComponentOutlines,
          },
          '*'
        );
      } catch {
        // ignore
      }
    }
  }, [showComponentOutlines]);

  // Restore template preview configuration from persistent shareable URL query parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedTemplateId = params.get('template');
      if (!sharedTemplateId) return;

      const matched = STARTER_TEMPLATES.find((t) => t.id === sharedTemplateId);
      if (!matched) return;

      const vp = params.get('viewport');
      if (vp === 'mobile' || vp === 'tablet' || vp === 'desktop' || vp === 'fluid') {
        setPreviewViewport(vp);
      }

      const z = Number(params.get('zoom'));
      if ([50, 75, 100, 125, 150].includes(z)) {
        setPreviewZoom(z);
      }

      const m = params.get('mode');
      if (m === 'iframe' || m === 'mock-canvas') {
        setPreviewMode(m);
      }

      const g = params.get('guides');
      if (g === '0' || g === '1') {
        setShowComponentOutlines(g === '1');
      }

      const syncParam = params.get('syncTheme');
      if (syncParam === '0' || syncParam === '1') {
        setApplyThemeOnLoad(syncParam === '1');
      }

      recordRecentlyViewed(matched.id);
      setQuickPreviewTemplate(matched);
      setActivePreviewBlockId(matched.blocks[0]?.id || null);
    } catch {
      // ignore
    }
  }, []);

  // Build a persistent, shareable URL encoding the current template & preview configuration
  const generateShareableTemplateUrl = (tmpl: StarterTemplate): string => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('template', tmpl.id);
      url.searchParams.set('preview', '1');
      url.searchParams.set('viewport', previewViewport);
      url.searchParams.set('zoom', String(previewZoom));
      url.searchParams.set('mode', previewMode);
      url.searchParams.set('guides', showComponentOutlines ? '1' : '0');
      url.searchParams.set('syncTheme', applyThemeOnLoad ? '1' : '0');
      if (tmpl.theme?.primaryColor) {
        url.searchParams.set('primary', tmpl.theme.primaryColor);
      }
      if (tmpl.theme?.fontFamily) {
        url.searchParams.set('font', tmpl.theme.fontFamily);
      }
      if (tmpl.theme?.colorMode) {
        url.searchParams.set('themeMode', tmpl.theme.colorMode);
      }
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  // Refresh shareUrl whenever the active preview configuration changes while the share banner is open
  useEffect(() => {
    if (quickPreviewTemplate && isShareBannerOpen) {
      const updatedUrl = generateShareableTemplateUrl(quickPreviewTemplate);
      setShareUrl(updatedUrl);
      try {
        window.history.replaceState({ templateId: quickPreviewTemplate.id }, '', updatedUrl);
      } catch {
        // ignore
      }
    }
  }, [
    quickPreviewTemplate,
    previewViewport,
    previewZoom,
    previewMode,
    showComponentOutlines,
    applyThemeOnLoad,
    isShareBannerOpen,
  ]);

  const handleShareTemplate = async () => {
    if (!quickPreviewTemplate) return;
    const generatedUrl = generateShareableTemplateUrl(quickPreviewTemplate);
    setShareUrl(generatedUrl);
    setIsShareBannerOpen(true);

    try {
      window.history.replaceState({ templateId: quickPreviewTemplate.id }, '', generatedUrl);
      localStorage.setItem(
        'cloudboyx_last_shared_template_config',
        JSON.stringify({
          templateId: quickPreviewTemplate.id,
          templateName: quickPreviewTemplate.name,
          viewport: previewViewport,
          zoom: previewZoom,
          mode: previewMode,
          guides: showComponentOutlines,
          syncTheme: applyThemeOnLoad,
          theme: quickPreviewTemplate.theme,
          url: generatedUrl,
          sharedAt: Date.now(),
        })
      );
    } catch {
      // ignore
    }

    try {
      await navigator.clipboard.writeText(generatedUrl);
      setShareCopied(true);
      setTimeout(() => {
        setShareCopied(false);
      }, 2500);
    } catch {
      // Clipboard fallback handled via visible input in banner
    }
  };

  const handleCopyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => {
        setShareCopied(false);
      }, 2500);
    } catch {
      // ignore
    }
  };

  // Scroll to specific block inside either full-screen iframe or mock canvas
  const handleScrollToPreviewBlock = (blockId: string) => {
    setActivePreviewBlockId(blockId);
    if (previewMode === 'iframe' && previewIframeRef.current?.contentWindow) {
      try {
        previewIframeRef.current.contentWindow.postMessage(
          {
            type: 'PREVIEW_SCROLL_TO_BLOCK',
            blockId,
          },
          '*'
        );
      } catch {
        // ignore
      }
    } else if (previewMode === 'mock-canvas' && mockCanvasContainerRef.current) {
      const targetEl = mockCanvasContainerRef.current.querySelector(
        `[data-mock-block-id="${blockId}"]`
      );
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (!isOpen) return null;

  const handleApplyTemplateImmediate = (tmpl: StarterTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordRecentlyViewed(tmpl.id);
    incrementTemplateUsage(tmpl.id);

    const clonedBlocks: BlockInstance[] = tmpl.blocks.map((b) => ({
      ...JSON.parse(JSON.stringify(b)),
      id: `block-${Math.random().toString(36).substring(2, 9)}`,
    }));

    const nextTheme: SiteTheme | undefined =
      applyThemeOnLoad && tmpl.theme
        ? {
            primaryColor: tmpl.theme.primaryColor || '#2222FF',
            secondaryColor: tmpl.theme.secondaryColor || '#00E5D1',
            darkColor: tmpl.theme.darkColor || '#1C1C23',
            lightColor: tmpl.theme.lightColor || '#FFFFFF',
            fontFamily: tmpl.theme.fontFamily || 'Inter',
            headingFontFamily: tmpl.theme.headingFontFamily,
            buttonStyle: tmpl.theme.buttonStyle || 'rounded-pill',
            colorMode: tmpl.theme.colorMode || 'light',
          }
        : undefined;

    onSelectTemplate(clonedBlocks, tmpl.name, nextTheme);
    setQuickPreviewTemplate(null);
    onClose();
  };

  const handleOpenQuickPreview = (tmpl: StarterTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordRecentlyViewed(tmpl.id);
    setQuickPreviewTemplate(tmpl);
    setActivePreviewBlockId(tmpl.blocks[0]?.id || null);
  };

  const handleOpenQuickViewImage = (tmpl: StarterTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    recordRecentlyViewed(tmpl.id);
    setQuickViewImageZoom(100);
    setQuickViewImageTemplate(tmpl);
  };

  const handleCycleQuickViewImage = (dir: -1 | 1) => {
    if (!quickViewImageTemplate || filteredTemplates.length === 0) return;
    const idx = filteredTemplates.findIndex((t) => t.id === quickViewImageTemplate.id);
    if (idx === -1) return;
    const nextIdx = (idx + dir + filteredTemplates.length) % filteredTemplates.length;
    const nextTmpl = filteredTemplates[nextIdx];
    if (nextTmpl) {
      recordRecentlyViewed(nextTmpl.id);
      setQuickViewImageZoom(100);
      setQuickViewImageTemplate(nextTmpl);
    }
  };

  // Generate and download a PNG snapshot of the previewed template's current state using html2canvas
  const handleExportAsImage = async () => {
    if (!quickPreviewTemplate || isExportingImage) return;
    setIsExportingImage(true);
    setExportSuccess(false);

    try {
      let targetElement: HTMLElement | null = null;
      const iframeDoc =
        previewIframeRef.current?.contentDocument ||
        previewIframeRef.current?.contentWindow?.document;

      if (previewMode === 'iframe' && iframeDoc?.body) {
        targetElement = iframeDoc.body;
      } else if (previewMode === 'mock-canvas' && mockCanvasContainerRef.current) {
        targetElement = mockCanvasContainerRef.current;
      } else if (previewFrameWrapperRef.current) {
        targetElement = previewFrameWrapperRef.current;
      }

      if (!targetElement) {
        throw new Error('Preview target element not available');
      }

      const bgFallback =
        quickPreviewTemplate.theme?.colorMode === 'dark' ? '#0f172a' : '#ffffff';

      const canvas = await html2canvas(targetElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2,
        backgroundColor: bgFallback,
        windowWidth: targetElement.scrollWidth || undefined,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const slug = quickPreviewTemplate.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${slug || 'template'}-${previewViewport}-snapshot.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to export template preview as PNG:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Generate and download a standalone ZIP archive containing the template's source assets (images, CSS, JS, and HTML) separately from project import
  const handleDownloadTemplateZip = async (targetTemplate?: StarterTemplate) => {
    const tmpl = targetTemplate || quickPreviewTemplate;
    if (!tmpl || isDownloadingZip) return;

    setIsDownloadingZip(true);
    setZipDownloadSuccess(false);

    try {
      const zip = new JSZip();
      const slug =
        tmpl.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || tmpl.id;

      const resolvedTheme: SiteTheme = {
        ...DEFAULT_THEME,
        ...(tmpl.theme || {}),
      };

      // 1. Generate standalone CSS stylesheet (assets/css/template-theme.css)
      const templateCss = `/**
 * ${tmpl.name} — Standalone Template Stylesheet
 * Category: ${tmpl.category} (${tmpl.style || 'Modern'})
 * Generated by CloudboyX Bootstrap 5 Visual Builder
 */

:root {
  /* CloudboyX Core Brand Tokens */
  --cbx-white: #FFFFFF;
  --cbx-cyan: #00E5D1;
  --cbx-blue: #2222FF;
  --cbx-navy: #191970;
  --cbx-dark: #1C1C23;

  /* Template Theme Variables */
  --bs-primary: ${resolvedTheme.primaryColor || '#2222FF'};
  --bs-secondary: ${resolvedTheme.secondaryColor || '#00E5D1'};
  --bs-dark: ${resolvedTheme.darkColor || '#1C1C23'};
  --bs-light: ${resolvedTheme.lightColor || '#FFFFFF'};
  --template-font-sans: '${resolvedTheme.fontFamily || 'Inter'}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --template-font-heading: '${resolvedTheme.headingFontFamily || resolvedTheme.fontFamily || 'Inter'}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--template-font-sans);
  background-color: ${resolvedTheme.colorMode === 'dark' ? resolvedTheme.darkColor || '#1C1C23' : resolvedTheme.lightColor || '#FFFFFF'};
  color: ${resolvedTheme.colorMode === 'dark' ? '#f8fafc' : '#0f172a'};
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6, .display-1, .display-2, .display-3, .display-4, .display-5, .display-6 {
  font-family: var(--template-font-heading);
}

.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.btn-primary:hover,
.btn-primary:focus {
  filter: brightness(1.08);
}

.text-primary {
  color: var(--bs-primary) !important;
}

.bg-primary {
  background-color: var(--bs-primary) !important;
}

/* Smooth interactive cards & image transitions */
.card,
.shadow-sm,
.shadow {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
}

${resolvedTheme.customCss ? `\n/* Custom Template CSS */\n${resolvedTheme.customCss}\n` : ''}`;

      // 2. Generate standalone JavaScript interactions file (assets/js/template-interactions.js)
      const templateJs = `/**
 * ${tmpl.name} — Standalone Template Scripts
 * Includes smooth anchor scrolling, navbar scroll state, form handling, and scroll reveal animations.
 */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Smooth scrolling for internal anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        event.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 2. Sticky Navbar elevation on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 16) {
        navbar.classList.add('shadow-sm');
      } else {
        navbar.classList.remove('shadow-sm');
      }
    }, { passive: true });
  }

  // 3. Interactive Lead-Gen & Contact Form Feedback
  const forms = document.querySelectorAll('form');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.innerHTML = 'Submitted ✓';
      }
      setTimeout(function () {
        form.reset();
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.innerHTML = originalText;
        }
      }, 2400);
    });
  });
});
`;

      // 3. Extract all image URLs from template blocks & thumbnail
      const rawHtml = generateCompleteHtml(tmpl.blocks, resolvedTheme, tmpl.name, false);
      const urlSet = new Set<string>();
      if (tmpl.thumbnailUrl) {
        urlSet.add(tmpl.thumbnailUrl);
      }

      const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match: RegExpExecArray | null;
      while ((match = imgSrcRegex.exec(rawHtml)) !== null) {
        if (match[1] && !match[1].startsWith('data:')) {
          urlSet.add(match[1]);
        }
      }

      const bgUrlRegex = /url\(["']?(https?:\/\/[^"')]+)["']?\)/gi;
      while ((match = bgUrlRegex.exec(rawHtml)) !== null) {
        if (match[1]) {
          urlSet.add(match[1]);
        }
      }

      const imageUrls = Array.from(urlSet);
      const imageManifest: Array<{
        index: number;
        fileName: string;
        sourceUrl: string;
        downloadedBinary: boolean;
      }> = [];

      const assetsFolder = zip.folder('assets');
      const cssFolder = assetsFolder?.folder('css');
      const jsFolder = assetsFolder?.folder('js');
      const imagesFolder = assetsFolder?.folder('images');

      cssFolder?.file('template-theme.css', templateCss);
      jsFolder?.file('template-interactions.js', templateJs);

      // Fetch image binaries concurrently with a short timeout fallback
      await Promise.all(
        imageUrls.map(async (imgUrl, idx) => {
          const extMatch = imgUrl.match(/\.(png|jpe?g|webp|gif|svg)(?:\?|$)/i);
          const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
          const fileName = idx === 0 && imgUrl === tmpl.thumbnailUrl
            ? `template-thumbnail.${ext}`
            : `asset-image-${String(idx + 1).padStart(2, '0')}.${ext}`;

          let downloadedBinary = false;
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3500);
            const response = await fetch(imgUrl, { mode: 'cors', signal: controller.signal });
            clearTimeout(timer);
            if (response.ok) {
              const blob = await response.blob();
              imagesFolder?.file(fileName, blob);
              downloadedBinary = true;
            }
          } catch {
            // Fallback SVG reference card if CORS blocks direct binary fetch
          }

          if (!downloadedBinary) {
            const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <rect width="800" height="500" fill="${resolvedTheme.primaryColor || '#2222FF'}" />
  <rect x="24" y="24" width="752" height="452" rx="16" fill="#1C1C23" fill-opacity="0.92" stroke="#00E5D1" stroke-width="2"/>
  <text x="400" y="225" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="bold">${tmpl.name} — Image Asset #${idx + 1}</text>
  <text x="400" y="265" text-anchor="middle" fill="#00E5D1" font-family="monospace" font-size="13">${imgUrl.replace(/&/g, '&amp;')}</text>
</svg>`;
            imagesFolder?.file(`${fileName}.svg`, fallbackSvg);
          }

          imageManifest.push({
            index: idx + 1,
            fileName,
            sourceUrl: imgUrl,
            downloadedBinary,
          });
        })
      );

      imagesFolder?.file('image-manifest.json', JSON.stringify(imageManifest, null, 2));

      // 4. Inject links to ./assets/css/template-theme.css and ./assets/js/template-interactions.js into index.html
      const linkedHtml = rawHtml
        .replace(
          '</head>',
          '  <link rel="stylesheet" href="./assets/css/template-theme.css" />\n</head>'
        )
        .replace(
          '</body>',
          '  <script src="./assets/js/template-interactions.js"></script>\n</body>'
        );

      zip.file('index.html', linkedHtml);

      // 5. Include raw template configuration JSON & README
      zip.file(
        'template-config.json',
        JSON.stringify(
          {
            id: tmpl.id,
            name: tmpl.name,
            category: tmpl.category,
            style: tmpl.style,
            description: tmpl.description,
            theme: resolvedTheme,
            previewTags: tmpl.previewTags,
            sectionCount: tmpl.blocks.length,
            blocks: tmpl.blocks,
          },
          null,
          2
        )
      );

      const readmeContent = `# ${tmpl.name} — Source Assets Archive

**Category:** ${tmpl.category} (${tmpl.style || 'Modern'})  
**Sections:** ${tmpl.blocks.length}  
**Primary Color:** ${resolvedTheme.primaryColor}  
**Typography:** ${resolvedTheme.fontFamily}

## Included Source Files

- \`index.html\` — Production-ready Bootstrap 5.3 markup pre-linked to the local CSS and JS assets.
- \`assets/css/template-theme.css\` — Custom CSS variables, CloudboyX palette tokens, typography rules, and component styles.
- \`assets/js/template-interactions.js\` — Smooth anchor scrolling, sticky navbar behaviour, and interactive form handlers.
- \`assets/images/\` — Extracted template images (${imageManifest.length} assets) and \`image-manifest.json\` source mapping.
- \`template-config.json\` — Full block structure and theme configuration schema.
`;
      zip.file('README.md', readmeContent);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${slug}-source-assets.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);

      setZipDownloadSuccess(true);
      setTimeout(() => {
        setZipDownloadSuccess(false);
      }, 2800);
    } catch (err) {
      console.error('Failed to generate template source assets ZIP:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Generate and download a print-ready PDF document of the entire template for sharing design concepts with clients
  const handleExportTemplateAsPdf = async (
    targetTemplate?: StarterTemplate,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    const tmpl = targetTemplate || quickPreviewTemplate || quickViewImageTemplate;
    if (!tmpl || exportingPdfTemplateId) return;

    setExportingPdfTemplateId(tmpl.id);
    setPdfExportSuccessTemplateId(null);
    recordRecentlyViewed(tmpl.id);

    try {
      const slug =
        tmpl.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'template';

      const resolvedTheme: SiteTheme = {
        ...DEFAULT_THEME,
        ...(tmpl.theme || {}),
        primaryColor: tmpl.theme?.primaryColor || tmpl.accentColor || '#2222FF',
        secondaryColor: tmpl.theme?.secondaryColor || '#00E5D1',
        darkColor: tmpl.theme?.darkColor || '#1C1C23',
        lightColor: tmpl.theme?.lightColor || '#FFFFFF',
        fontFamily: tmpl.theme?.fontFamily || 'Inter',
        buttonStyle: tmpl.theme?.buttonStyle || 'rounded-pill',
        colorMode: tmpl.theme?.colorMode || 'light',
      };

      const complexity = getTemplateComplexity(tmpl);
      const features = getTemplateFeatureBadges(tmpl);

      // Create an A4 Print-Ready High-Resolution Sheet Canvas (1240 x 1754 px @ 150 DPI)
      const pageW = 1240;
      const pageH = 1754;
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = pageW;
      sheetCanvas.height = pageH;
      const ctx = sheetCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('2D canvas context unavailable for PDF export');
      }

      // 1. Paper Background & Print Crop/Bleed Marks
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageW, pageH);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      const cropMargin = 28;
      const cropLen = 18;
      // Top-left crop mark
      ctx.beginPath();
      ctx.moveTo(cropMargin - cropLen, cropMargin);
      ctx.lineTo(cropMargin + 6, cropMargin);
      ctx.moveTo(cropMargin, cropMargin - cropLen);
      ctx.lineTo(cropMargin, cropMargin + 6);
      // Top-right crop mark
      ctx.moveTo(pageW - cropMargin - 6, cropMargin);
      ctx.lineTo(pageW - cropMargin + cropLen, cropMargin);
      ctx.moveTo(pageW - cropMargin, cropMargin - cropLen);
      ctx.lineTo(pageW - cropMargin, cropMargin + 6);
      // Bottom-left crop mark
      ctx.moveTo(cropMargin - cropLen, pageH - cropMargin);
      ctx.lineTo(cropMargin + 6, pageH - cropMargin);
      ctx.moveTo(cropMargin, pageH - cropMargin - 6);
      ctx.lineTo(cropMargin, pageH - cropMargin + cropLen);
      // Bottom-right crop mark
      ctx.moveTo(pageW - cropMargin - 6, pageH - cropMargin);
      ctx.lineTo(pageW - cropMargin + cropLen, pageH - cropMargin);
      ctx.moveTo(pageW - cropMargin, pageH - cropMargin - 6);
      ctx.lineTo(pageW - cropMargin, pageH - cropMargin + cropLen);
      ctx.stroke();

      // 2. Top Brand & Client Concept Header Banner
      const marginX = 56;
      const contentW = pageW - marginX * 2;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(marginX, 52, contentW, 170);

      // Accent top bar strip
      ctx.fillStyle = resolvedTheme.primaryColor;
      ctx.fillRect(marginX, 52, contentW, 8);

      // Kicker label
      ctx.fillStyle = '#00E5D1';
      ctx.font = 'bold 14px Inter, system-ui, sans-serif';
      ctx.fillText('CLIENT DESIGN CONCEPT  •  PRINT-READY SPECIFICATION SHEET', marginX + 32, 96);

      // Template Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px Inter, system-ui, sans-serif';
      ctx.fillText(tmpl.name, marginX + 32, 142);

      // Subtitle / Category / Date
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 16px Inter, system-ui, sans-serif';
      const dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      ctx.fillText(
        `Category: ${tmpl.category} (${tmpl.style || 'Modern'})   |   Sections: ${tmpl.blocks.length}   |   Complexity: ${complexity.rating}/5 (${complexity.label})   |   Prepared: ${dateStr}`,
        marginX + 32,
        182
      );

      // 3. Executive Summary & Design System Tokens Row
      let cursorY = 246;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(marginX, cursorY, contentW, 150);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(marginX, cursorY, contentW, 150);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px Inter, system-ui, sans-serif';
      ctx.fillText('CONCEPT OVERVIEW & DESIGN SYSTEM', marginX + 24, cursorY + 32);

      const savedNote = (templateNotes[tmpl.id] || '').trim();
      ctx.fillStyle = '#475569';
      ctx.font = '400 15px Inter, system-ui, sans-serif';
      const baseDesc = savedNote
        ? `${tmpl.description}  •  Client Note: "${savedNote}"`
        : tmpl.description;
      const descText =
        baseDesc.length > 125 ? baseDesc.slice(0, 122) + '...' : baseDesc;
      ctx.fillText(descText, marginX + 24, cursorY + 62);

      // Swatches & Typography pills
      const swatches = [
        { label: 'Primary', hex: resolvedTheme.primaryColor },
        { label: 'Secondary', hex: resolvedTheme.secondaryColor },
        { label: 'Dark Surface', hex: resolvedTheme.darkColor },
        { label: 'Light Surface', hex: resolvedTheme.lightColor },
      ];
      let swatchX = marginX + 24;
      swatches.forEach((sw) => {
        ctx.fillStyle = sw.hex;
        ctx.fillRect(swatchX, cursorY + 86, 28, 28);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(swatchX, cursorY + 86, 28, 28);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.fillText(sw.label, swatchX + 38, cursorY + 99);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px monospace';
        ctx.fillText(sw.hex.toUpperCase(), swatchX + 38, cursorY + 115);
        swatchX += 185;
      });

      // Typography & Mode info on right of token box
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px Inter, system-ui, sans-serif';
      ctx.fillText(`Typography: ${resolvedTheme.fontFamily}`, marginX + 780, cursorY + 98);
      ctx.fillStyle = '#475569';
      ctx.font = '13px Inter, system-ui, sans-serif';
      ctx.fillText(
        `Mode: ${(resolvedTheme.colorMode || 'light').toUpperCase()}  •  Features: ${features.slice(0, 3).join(', ')}`,
        marginX + 780,
        cursorY + 118
      );

      // 4. Visual Full-Page Template Layout Wireframe & Section Stack
      cursorY = 420;
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 17px Inter, system-ui, sans-serif';
      ctx.fillText(
        `FULL-PAGE VISUAL LAYOUT ARCHITECTURE (${tmpl.blocks.length} BOOTSTRAP 5 SECTIONS)`,
        marginX,
        cursorY
      );

      cursorY += 18;
      const previewBoxH = 1160;
      ctx.fillStyle = resolvedTheme.colorMode === 'dark' ? '#0b0f19' : '#f1f5f9';
      ctx.fillRect(marginX, cursorY, contentW, previewBoxH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(marginX, cursorY, contentW, previewBoxH);

      // Browser Chrome Header inside Print Sheet
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(marginX, cursorY, contentW, 38);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(marginX + 22, cursorY + 19, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(marginX + 40, cursorY + 19, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(marginX + 58, cursorY + 19, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px monospace';
      ctx.fillText(
        `https://preview.cloudboyx.io/${slug}  —  Responsive Bootstrap 5.3 Layout`,
        marginX + 86,
        cursorY + 24
      );

      // Render each section in the template visually inside the layout frame
      const innerStartY = cursorY + 50;
      const innerAvailH = previewBoxH - 64;
      const blocksToDraw = tmpl.blocks;
      const gap = 12;
      const blockH = Math.max(
        95,
        Math.floor((innerAvailH - gap * (blocksToDraw.length - 1)) / Math.max(1, blocksToDraw.length))
      );

      blocksToDraw.forEach((blk, idx) => {
        const bY = innerStartY + idx * (blockH + gap);
        if (bY + blockH > cursorY + previewBoxH - 8) return;

        const isDarkBlock =
          blk.settings.textColor === 'light' ||
          blk.settings.bgColor === '#0f172a' ||
          blk.settings.bgColor === 'bg-dark';

        const cardBg = isDarkBlock
          ? '#0f172a'
          : blk.settings.bgColor && blk.settings.bgColor.startsWith('#')
          ? blk.settings.bgColor
          : '#ffffff';

        ctx.fillStyle = cardBg;
        ctx.fillRect(marginX + 20, bY, contentW - 40, blockH);
        ctx.strokeStyle = isDarkBlock ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(marginX + 20, bY, contentW - 40, blockH);

        // Left Accent Bar per section
        ctx.fillStyle = resolvedTheme.primaryColor;
        ctx.fillRect(marginX + 20, bY, 8, blockH);

        // Section Index Badge & Category
        ctx.fillStyle = isDarkBlock ? '#38bdf8' : resolvedTheme.primaryColor;
        ctx.font = 'bold 13px monospace';
        ctx.fillText(
          `SECTION 0${idx + 1}  •  ${blk.category.toUpperCase()} (${blk.type})`,
          marginX + 46,
          bY + 28
        );

        // Section Name & Headline Content
        const headline =
          blk.content?.title ||
          blk.content?.brandName ||
          blk.content?.headline ||
          blk.name;
        ctx.fillStyle = isDarkBlock ? '#ffffff' : '#0f172a';
        ctx.font = 'bold 20px Inter, system-ui, sans-serif';
        ctx.fillText(
          String(headline).slice(0, 65),
          marginX + 46,
          bY + 58
        );

        // Section Subtitle / Description
        const subtext =
          blk.content?.description ||
          blk.content?.subtitle ||
          blk.content?.brandDesc ||
          `Container: ${blk.settings.containerWidth} • Padding: pt-${blk.settings.paddingTop} pb-${blk.settings.paddingBottom}`;
        ctx.fillStyle = isDarkBlock ? '#94a3b8' : '#475569';
        ctx.font = '400 14px Inter, system-ui, sans-serif';
        ctx.fillText(
          String(subtext).slice(0, 92),
          marginX + 46,
          bY + 84
        );

        // Right-side visual wireframe mini-columns representation
        const wireW = 220;
        const wireX = marginX + contentW - 40 - wireW - 20;
        const wireY = bY + 18;
        const wireH = blockH - 36;
        const cols = blk.settings.columns || (blk.category === 'features' || blk.category === 'pricing' ? 3 : 2);
        const colW = Math.floor((wireW - (cols - 1) * 8) / cols);
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = isDarkBlock ? 'rgba(255,255,255,0.08)' : 'rgba(34,34,255,0.06)';
          ctx.fillRect(wireX + c * (colW + 8), wireY, colW, wireH);
          ctx.strokeStyle = isDarkBlock ? 'rgba(255,255,255,0.18)' : 'rgba(34,34,255,0.22)';
          ctx.strokeRect(wireX + c * (colW + 8), wireY, colW, wireH);
        }
      });

      // 5. Print Footer
      const footerY = pageH - 54;
      ctx.fillStyle = '#64748b';
      ctx.font = '500 13px Inter, system-ui, sans-serif';
      ctx.fillText(
        `CloudboyX Bootstrap 5 Visual Studio  —  Client Design Concept PDF  •  ${tmpl.name}`,
        marginX,
        footerY
      );
      ctx.fillText('Page 1 of 1 (Print-Ready A4)', pageW - marginX - 185, footerY);

      // 6. Encode Canvas JPEG into a standards-compliant PDF 1.4 binary document
      const jpegDataUrl = sheetCanvas.toDataURL('image/jpeg', 0.92);
      const base64Data = jpegDataUrl.split(',')[1] || '';
      const binaryString = atob(base64Data);
      const jpegBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        jpegBytes[i] = binaryString.charCodeAt(i);
      }

      // Standard A4 PDF points: 595.28 x 841.89
      const pdfPageW = 595.28;
      const pdfPageH = 841.89;
      const encoder = new TextEncoder();
      const chunks: Uint8Array[] = [];
      const offsets: number[] = [];
      let byteLength = 0;

      const pushStr = (s: string) => {
        const bytes = encoder.encode(s);
        chunks.push(bytes);
        byteLength += bytes.byteLength;
      };

      const pushBytes = (b: Uint8Array) => {
        chunks.push(b);
        byteLength += b.byteLength;
      };

      const startObj = (id: number) => {
        offsets[id] = byteLength;
        pushStr(`${id} 0 obj\n`);
      };

      const endObj = () => {
        pushStr('\nendobj\n');
      };

      // PDF Header
      pushStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

      // Object 1: Catalog
      startObj(1);
      pushStr('<< /Type /Catalog /Pages 2 0 R >>');
      endObj();

      // Object 2: Pages
      startObj(2);
      pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
      endObj();

      // Object 3: Page (A4 Print-Ready)
      startObj(3);
      pushStr(
        `<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /MediaBox [0 0 ${pdfPageW} ${pdfPageH}] /Contents 5 0 R >>`
      );
      endObj();

      // Object 4: Image XObject (Embedded High-Res JPEG)
      startObj(4);
      pushStr(
        `<< /Type /XObject /Subtype /Image /Width ${pageW} /Height ${pageH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.byteLength} >>\nstream\n`
      );
      pushBytes(jpegBytes);
      pushStr('\nendstream');
      endObj();

      // Object 5: Page Content Stream
      const contentStream = `q\n${pdfPageW} 0 0 ${pdfPageH} 0 0 cm\n/Im1 Do\nQ\n`;
      const contentStreamBytes = encoder.encode(contentStream);
      startObj(5);
      pushStr(`<< /Length ${contentStreamBytes.byteLength} >>\nstream\n${contentStream}endstream`);
      endObj();

      // Object 6: Document Info Metadata
      const safePdfTitle = tmpl.name.replace(/[()\\]/g, '');
      startObj(6);
      pushStr(
        `<< /Title (${safePdfTitle} - Client Design Concept) /Creator (CloudboyX Bootstrap 5 Studio) /Producer (CloudboyX Print-Ready PDF Engine) >>`
      );
      endObj();

      // Cross-Reference Table (xref)
      const xrefOffset = byteLength;
      pushStr('xref\n0 7\n0000000000 65535 f \n');
      for (let i = 1; i <= 6; i++) {
        const padded = String(offsets[i] || 0).padStart(10, '0');
        pushStr(`${padded} 00000 n \n`);
      }

      // PDF Trailer
      pushStr(
        `trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
      );

      const pdfBlob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${slug}-design-concept.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);

      setPdfExportSuccessTemplateId(tmpl.id);
      setTimeout(() => {
        setPdfExportSuccessTemplateId((prev) => (prev === tmpl.id ? null : prev));
      }, 2800);
    } catch (err) {
      console.error('Failed to export template as print-ready PDF:', err);
    } finally {
      setExportingPdfTemplateId(null);
    }
  };

  const currentPreviewIdx = quickPreviewTemplate
    ? filteredTemplates.findIndex((t) => t.id === quickPreviewTemplate.id)
    : -1;

  const handleCyclePreviewTemplate = (dir: -1 | 1) => {
    if (filteredTemplates.length === 0 || currentPreviewIdx === -1) return;
    const nextIdx =
      (currentPreviewIdx + dir + filteredTemplates.length) % filteredTemplates.length;
    const nextTmpl = filteredTemplates[nextIdx];
    if (nextTmpl) {
      recordRecentlyViewed(nextTmpl.id);
      setQuickPreviewTemplate(nextTmpl);
      setActivePreviewBlockId(nextTmpl.blocks[0]?.id || null);
    }
  };

  const galleryBody = (
    <div
      className={`template-gallery-modal w-full flex flex-col transition-colors ${
        isEmbedded
          ? 'h-full'
          : 'max-w-7xl rounded-2xl shadow-2xl border overflow-hidden max-h-[92vh]'
      } ${
        isDark
          ? 'bg-[#0b0f19] text-slate-100 border-slate-800'
          : 'bg-white text-slate-900 border-slate-200'
      }`}
    >
      {/* Top Header & Controls */}
      <div
        className={`p-4 sm:p-5 border-b flex flex-col gap-3.5 shrink-0 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50/90 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Bootstrap 5 Template Gallery
                </h2>
                <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {STARTER_TEMPLATES.length} Ready-to-Use Templates
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Search, filter by style (Agency, SaaS, Portfolio, E-Commerce), open a full-screen Quick Preview to scroll through the page, or click to apply immediately.
              </p>
            </div>
          </div>

          {!isEmbedded && (
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
              title="Close Template Gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dedicated Real-Time Search Bar + Sort & Mode Controls */}
        <div
          id="template-gallery-search-bar"
          className="template-gallery-search-bar flex flex-col gap-2"
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                  searchQuery ? 'text-[#00E5D1]' : 'text-slate-400'
                }`}
              />
              <input
                ref={searchInputRef}
                id="template-gallery-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search templates by title, tag, or category name"
                placeholder={`Search ${STARTER_TEMPLATES.length}+ templates by title, tag, or category (e.g., Agency, SaaS, Portfolio, E-commerce)...`}
                className={`w-full pl-10 pr-28 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition focus:outline-hidden focus:ring-2 focus:ring-[#2222FF]/35 focus:border-[#2222FF] ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                }`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        isDark
                          ? 'bg-[#191970]/80 text-[#00E5D1] border-[#2222FF]/50'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {filteredTemplates.length} {filteredTemplates.length === 1 ? 'match' : 'matches'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear search query"
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border pointer-events-none ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    Press / to search
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
            {/* Sorting Dropdown (Date Created / Name / Usage Frequency) */}
            <div
              className={`template-sort-dropdown-wrapper flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <label htmlFor="template-gallery-sort-select" className="text-slate-400 font-medium">
                Sort by:
              </label>
              <select
                id="template-gallery-sort-select"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as TemplateSortOption)
                }
                aria-label="Sort template cards by Date Created, Name, or Usage Frequency"
                className={`template-sort-dropdown font-semibold bg-transparent focus:outline-hidden cursor-pointer ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}
              >
                <option value="usage_frequency" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  Usage Frequency
                </option>
                <option value="date_created" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  Date Created
                </option>
                <option value="name" className={isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  Name
                </option>
              </select>
            </div>

            {/* Light / Dark Template Filter */}
            <div
              className={`flex items-center p-1 rounded-xl border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setModeFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  modeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Modes
              </button>
              <button
                type="button"
                onClick={() => setModeFilter('light')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer ${
                  modeFilter === 'light'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setModeFilter('dark')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition cursor-pointer ${
                  modeFilter === 'dark'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Dark</span>
              </button>
            </div>

            {/* Apply Theme Toggle */}
            <label
              className={`flex items-center gap-2 text-xs font-medium cursor-pointer select-none px-3 py-1.5 rounded-xl border transition shrink-0 ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={applyThemeOnLoad}
                onChange={(e) => setApplyThemeOnLoad(e.target.checked)}
                className="rounded-sm text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Sync palette & typography</span>
            </label>

            {/* Clear All Button (Resets Filters, Search Terms, and Sort Order) */}
            <button
              type="button"
              id="template-gallery-clear-all-btn"
              onClick={handleClearAllFiltersAndSort}
              aria-label="Clear all applied filters, search terms, and sort orders"
              title="Reset search terms, style/mode/tag filters, and sort order to default"
              className={`template-gallery-clear-all-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shrink-0 ${
                hasActiveFiltersOrSort
                  ? isDark
                    ? 'bg-rose-950/70 border-rose-500/60 text-rose-300 hover:bg-rose-900/80 hover:text-white shadow-2xs'
                    : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 shadow-2xs'
                  : isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Clear All</span>
            </button>
          </div>
          </div>
        </div>

        {/* Style Filter Tabs (Including Favorites Tab) */}
        <div
          id="template-gallery-filter-tabs"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5"
        >
          {STYLE_FILTERS.map((styleName) => {
            const count = styleCounts[styleName] || 0;
            const isSelected = selectedStyle === styleName;
            const isFavoritesTab = styleName === 'Favorites';

            return (
              <button
                key={styleName}
                id={isFavoritesTab ? 'template-gallery-favorites-tab' : undefined}
                type="button"
                onClick={() => setSelectedStyle(styleName)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? isFavoritesTab
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : isFavoritesTab
                    ? isDark
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-700/60 hover:bg-amber-900/50'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    : isDark
                    ? 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isFavoritesTab && (
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isSelected
                        ? 'fill-slate-950 text-slate-950'
                        : count > 0
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-amber-500'
                    }`}
                  />
                )}
                <span>{styleName}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected
                      ? isFavoritesTab
                        ? 'text-slate-900 font-bold'
                        : 'text-blue-100'
                      : isFavoritesTab
                      ? 'text-amber-500 font-bold'
                      : isDark
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Feature Tag Cloud Filter */}
        <div
          id="template-gallery-tag-cloud"
          className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t ${
            isDark ? 'border-slate-800/80' : 'border-slate-200/70'
          }`}
        >
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 pr-1.5 shrink-0">
            <Tag className="w-3 h-3 text-blue-500" />
            <span>Feature Tags:</span>
          </span>

          {FEATURE_TAG_CLOUD.map((tag) => {
            const isSelected = selectedFeatureTags.includes(tag);
            const count = featureTagCounts[tag] || 0;
            const palette = FEATURE_TAG_COLORS[tag] || FEATURE_TAG_COLORS['AI & SaaS'];

            return (
              <button
                key={tag}
                type="button"
                onClick={(e) => toggleFeatureTag(tag, e)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? palette.active
                    : isDark
                    ? palette.dark
                    : palette.light
                }`}
                title={`Filter templates with "${tag}" feature (${count} templates)`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : palette.dot
                  }`}
                />
                <span>{tag}</span>
                <span className="text-[10px] font-mono opacity-75">({count})</span>
              </button>
            );
          })}

          {selectedFeatureTags.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedFeatureTags([])}
              className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 transition cursor-pointer shrink-0"
            >
              Clear tags ({selectedFeatureTags.length})
            </button>
          )}
        </div>
      </div>

      {/* Results & Active Comparison Bar */}
      <div
        className={`px-5 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 ${
          isDark
            ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
            : 'bg-slate-50/50 border-slate-200/70 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span>
            Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{filteredTemplates.length}</strong> of{' '}
            {STARTER_TEMPLATES.length} templates
            {selectedStyle !== 'All' ? ` in ${selectedStyle}` : ''}
            {selectedFeatureTags.length > 0 ? ` · Tagged: ${selectedFeatureTags.join(', ')}` : ''}
          </span>

          {comparedTemplates.length > 0 && (
            <div
              id="template-gallery-compare-bar"
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-xl border ${
                isDark
                  ? 'bg-[#191970]/60 border-[#00E5D1]/50 text-white'
                  : 'bg-blue-50 border-blue-200 text-slate-800'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5 text-[#00E5D1] shrink-0" />
              <span className="font-semibold">
                {comparedTemplates.length === 1
                  ? '1 template selected — check 1 more to compare'
                  : `${comparedTemplates.length} templates selected for comparison`}
              </span>
              {comparedTemplates.length >= 2 && (
                <button
                  type="button"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white font-bold transition cursor-pointer"
                >
                  Compare Side-by-Side
                </button>
              )}
              <button
                type="button"
                onClick={handleClearCompare}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer pl-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        {hasActiveFiltersOrSort && (
          <button
            type="button"
            onClick={handleClearAllFiltersAndSort}
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Main Template Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Recently Viewed Section (Last 5 Templates Opened) */}
        <section
          id="template-gallery-recently-viewed"
          aria-label="Recently Viewed Templates"
          className={`rounded-2xl border p-3.5 sm:p-4 transition-colors ${
            isDark
              ? 'bg-[#1C1C23]/90 border-[#191970]/70'
              : 'bg-slate-50/90 border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isDark
                    ? 'bg-[#2222FF]/25 text-[#00E5D1] border border-[#2222FF]/40'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                  Recently Viewed
                </h3>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-[#191970]/60 text-[#00E5D1] border-[#2222FF]/40'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {recentlyViewedTemplates.length} / {MAX_RECENTLY_VIEWED}
                </span>
                <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Last {MAX_RECENTLY_VIEWED} templates opened — click to preview or apply immediately
                </span>
              </div>
            </div>

            {recentlyViewedTemplates.length > 0 && (
              <button
                type="button"
                onClick={handleClearRecentlyViewed}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200/60'
                }`}
                title="Clear recently viewed templates"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {recentlyViewedTemplates.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed px-4 py-3 text-xs flex items-center justify-between gap-3 ${
                isDark
                  ? 'border-slate-800 bg-slate-950/50 text-slate-400'
                  : 'border-slate-200 bg-white/80 text-slate-500'
              }`}
            >
              <span>
                No recently viewed templates right now. Click <strong>Quick Preview</strong> on any template card below to keep your last 5 candidates pinned here.
              </span>
            </div>
          ) : (
            <div
              className={`grid gap-2.5 ${
                isEmbedded
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
              }`}
            >
              {recentlyViewedTemplates.map((recentTmpl, idx) => {
                const isRecentActive = activeProjectTitle === recentTmpl.name;
                return (
                  <div
                    key={recentTmpl.id}
                    onClick={(e) => handleOpenQuickPreview(recentTmpl, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenQuickPreview(recentTmpl);
                      }
                    }}
                    className={`group/recent relative rounded-xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.025] hover:-translate-y-0.5 shadow-2xs cursor-pointer text-left ${
                      isDark
                        ? 'bg-slate-950/90 border-slate-800 hover:border-[#00E5D1] hover:shadow-lg hover:shadow-[#00E5D1]/15'
                        : 'bg-white border-slate-200/90 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15'
                    }`}
                    title={`Click to reopen Quick Preview for "${recentTmpl.name}"`}
                  >
                    {/* Compact Thumbnail Strip */}
                    <div className="relative h-20 w-full overflow-hidden bg-slate-900 border-b border-slate-200/50 dark:border-slate-800">
                      <img
                        src={
                          recentTmpl.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={recentTmpl.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover/recent:scale-105 transition-transform duration-300"
                      />
                      <div
                        className="absolute inset-0 flex items-start justify-between p-1.5"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.2) 55%, rgba(15,23,42,0.8) 100%)',
                        }}
                      >
                        <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-mono font-bold border border-white/15">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecentlyViewed(recentTmpl.id, e)}
                          className="w-5 h-5 rounded-md bg-slate-950/75 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover/recent:opacity-100 transition cursor-pointer"
                          title="Remove from Recently Viewed"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white truncate">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: recentTmpl.accentColor || '#2222FF' }}
                          />
                          <span className="truncate">{recentTmpl.style || recentTmpl.category}</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-300 shrink-0">
                          {recentTmpl.blocks.length}s
                        </span>
                      </div>
                    </div>

                    {/* Compact Info + Quick Actions */}
                    <div className="p-2.5 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold truncate group-hover/recent:text-blue-500 transition">
                          {recentTmpl.name}
                        </h4>
                        {isRecentActive && (
                          <span className="text-[9px] font-bold text-emerald-500 shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleOpenQuickPreview(recentTmpl, e)}
                          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:border-[#00E5D1] hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Eye className="w-3 h-3 text-blue-500 shrink-0" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleApplyTemplateImmediate(recentTmpl, e)}
                          className="py-1 px-2 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center gap-0.5 cursor-pointer shrink-0"
                          title={`Apply "${recentTmpl.name}" immediately`}
                        >
                          <span>Apply</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Cloned Dashboard Projects Section (Experimentation Sandbox) */}
        {clonedProjects.length > 0 && (
          <section
            id="template-gallery-dashboard-clones"
            aria-label="Dashboard Cloned Template Projects"
            className={`rounded-2xl border p-3.5 sm:p-4 transition-colors ${
              isDark
                ? 'bg-[#191970]/25 border-[#00E5D1]/40'
                : 'bg-blue-50/60 border-blue-200/90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark
                      ? 'bg-[#2222FF]/30 text-[#00E5D1] border border-[#00E5D1]/40'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <CopyPlus className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight">
                  Dashboard Clones (Experimentation Sandbox)
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-[#191970]/80 text-[#00E5D1] border-[#00E5D1]/40'
                      : 'bg-white text-[#2222FF] border-blue-200'
                  }`}
                >
                  {clonedProjects.length} {clonedProjects.length === 1 ? 'clone' : 'clones'}
                </span>
                <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Duplicate template projects saved to your dashboard for safe experimentation
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setClonedProjects([]);
                  syncClonedProjectsStorage([]);
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-white/80'
                }`}
                title="Clear all cloned experimental projects"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Clones</span>
              </button>
            </div>

            <div
              className={`grid gap-2.5 ${
                isEmbedded
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {clonedProjects.map((clone) => {
                const isCloneActive = activeProjectTitle === clone.title;
                return (
                  <div
                    key={clone.id}
                    onClick={(e) => handleOpenClonedProject(clone, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenClonedProject(clone);
                      }
                    }}
                    className={`group/clone rounded-xl border p-3 flex flex-col justify-between gap-2.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-left ${
                      isDark
                        ? 'bg-slate-950/90 border-slate-800 hover:border-[#00E5D1] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-[#2222FF] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: clone.accentColor || '#00E5D1' }}
                          />
                          <h4 className="text-xs font-bold truncate">{clone.title}</h4>
                        </div>
                        <p className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          From {clone.sourceTemplateName} · {clone.blocks.length} sections
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isCloneActive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                            Active
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClonedProject(clone.id, e)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Delete cloned project"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400">
                        Experiment Ready
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenClonedProject(clone, e)}
                        className="px-2.5 py-1 rounded-lg bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Open in Builder</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {filteredTemplates.length === 0 ? (
          <div
            className={`text-center py-16 px-4 border border-dashed rounded-2xl ${
              isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'
            }`}
          >
            {selectedStyle === 'Favorites' ? (
              <>
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold mb-1">No favorite templates saved yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Click the star or heart icon on any template card to save your top choices for quick access in this Favorites tab.
                </p>
              </>
            ) : (
              <>
                <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold mb-1">No templates matched your filter</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try searching for &ldquo;Agency&rdquo;, &ldquo;SaaS&rdquo;, &ldquo;Portfolio&rdquo;, &ldquo;E-Commerce&rdquo;, or reset active filters.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={handleClearAllFiltersAndSort}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition cursor-pointer"
            >
              Clear All & Show {STARTER_TEMPLATES.length} Templates
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-5 ${
              isEmbedded
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {filteredTemplates.map((tmpl) => {
              const tmplTheme = tmpl.theme;
              const isTemplateDark = tmplTheme?.colorMode === 'dark';
              const isCurrentProject = activeProjectTitle === tmpl.name;
              const isFavorite = favoriteIds.includes(tmpl.id);
              const isCompared = compareIds.includes(tmpl.id);
              const complexity = getTemplateComplexity(tmpl);
              const templateNote = templateNotes[tmpl.id] || '';
              const isFavoritesView = selectedStyle === 'Favorites';
              const catalogIdx = STARTER_TEMPLATES.findIndex((t) => t.id === tmpl.id);
              const sortMetrics = getTemplateSortMetrics(
                tmpl,
                catalogIdx >= 0 ? catalogIdx : 0,
                templateUsageCounts
              );

              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleApplyTemplateImmediate(tmpl)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.target instanceof HTMLInputElement ||
                      e.target instanceof HTMLTextAreaElement
                    ) {
                      return;
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleApplyTemplateImmediate(tmpl);
                    }
                  }}
                  className={`template-gallery-card group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 shadow-xs cursor-pointer text-left ${
                    isCompared
                      ? isDark
                        ? 'bg-slate-900/95 border-[#00E5D1] ring-2 ring-[#00E5D1]/35 shadow-xl hover:shadow-2xl hover:shadow-[#00E5D1]/20'
                        : 'bg-white border-[#2222FF] ring-2 ring-[#2222FF]/25 shadow-xl hover:shadow-2xl hover:shadow-[#2222FF]/20'
                      : isDark
                      ? 'bg-slate-900/90 border-slate-800 hover:border-[#00E5D1]/80 hover:shadow-2xl hover:shadow-[#00E5D1]/15'
                      : 'bg-white border-slate-200/90 hover:border-[#2222FF] hover:shadow-2xl hover:shadow-[#2222FF]/15'
                  }`}
                >
                  <div>
                    {/* Browser Frame Visual Thumbnail Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
                      {/* Mini Browser Top Bar */}
                      <div className="absolute top-0 inset-x-0 h-6 bg-slate-950/85 backdrop-blur-xs z-10 px-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                          {tmpl.style || tmpl.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tmpl.blocks.length} sections
                        </span>
                      </div>

                      {/* Floating Compare Checkbox Badge on Thumbnail Top-Left */}
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className={`template-compare-checkbox absolute top-8 left-2.5 z-20 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border backdrop-blur-md transition cursor-pointer select-none shadow-md ${
                          isCompared
                            ? 'bg-[#00E5D1] text-[#1C1C23] border-white'
                            : 'bg-slate-950/75 text-white/90 border-white/20 hover:bg-slate-900 hover:border-[#00E5D1]/70'
                        }`}
                        title="Select two or more templates to open a side-by-side comparison view"
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={(e) => toggleCompareTemplate(tmpl.id, e)}
                          aria-label={`Compare ${tmpl.name}`}
                          className="w-3 h-3 rounded-xs accent-[#2222FF] cursor-pointer"
                        />
                        <span>Compare</span>
                      </label>

                      {/* Floating Star / Heart Favorite Toggle Button on Thumbnail */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavoriteTemplate(tmpl.id, e)}
                        aria-label={isFavorite ? `Remove ${tmpl.name} from Favorites` : `Add ${tmpl.name} to Favorites`}
                        aria-pressed={isFavorite}
                        className={`template-favorite-btn absolute top-8 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center border backdrop-blur-md transition cursor-pointer shadow-md ${
                          isFavorite
                            ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105'
                            : 'bg-slate-950/70 text-white/85 border-white/20 hover:bg-slate-900 hover:text-amber-400 hover:border-amber-400/60'
                        }`}
                        title={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isFavorite ? 'fill-slate-950 text-slate-950' : ''
                          }`}
                        />
                      </button>

                      {/* High-Resolution Thumbnail Image */}
                      <img
                        src={
                          tmpl.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80'
                        }
                        alt={tmpl.name}
                        loading="lazy"
                        className="w-full h-full object-cover pt-6 group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Gradient Overlay with Style & Theme Mode */}
                      <div
                        className="absolute inset-0 pt-6 flex flex-col justify-end p-3.5 transition-opacity"
                        style={{
                          background: `linear-gradient(to top, rgba(15,23,42,0.92) 12%, rgba(15,23,42,0.25) 65%, transparent 100%)`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full ring-2 ring-white/40 shrink-0"
                              style={{ backgroundColor: tmpl.accentColor || '#0d6efd' }}
                            />
                            <span className="text-[11px] font-semibold text-white/95">
                              {tmpl.style || tmpl.category}
                            </span>
                            <span className="text-white/40">·</span>
                            <span className="text-[11px] text-slate-300">
                              {isTemplateDark ? 'Dark UI' : 'Light UI'}
                            </span>
                          </div>

                          {tmpl.badge && (
                            <span className="text-[10px] font-semibold text-amber-300">
                              ★ {tmpl.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Overlay with Quick View (Larger Image Overlay), Full-Screen Preview, Clone & Apply */}
                      <div className="absolute inset-0 pt-6 bg-slate-950/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-wrap items-center justify-center gap-1.5 px-2.5">
                        <button
                          type="button"
                          onClick={(e) => handleOpenQuickViewImage(tmpl, e)}
                          className="template-quick-view-hover-btn px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1 transition cursor-pointer"
                          title="Open a larger image overlay of the template layout"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-[#2222FF]" />
                          <span>Quick View</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenQuickPreview(tmpl, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 text-xs font-bold shadow-lg flex items-center gap-1 transition cursor-pointer"
                          title="Open Full-Screen Interactive Preview"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00E5D1]" />
                          <span>Live Demo</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCloneTemplateToDashboard(tmpl, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#191970] hover:bg-[#00E5D1] text-[#00E5D1] hover:text-[#1C1C23] border border-[#00E5D1]/50 text-xs font-bold shadow-lg flex items-center gap-1 transition cursor-pointer"
                          title="Create a duplicate of this template project in your dashboard for experimentation"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                          <span>Clone</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportTemplateAsPdf(tmpl, e)}
                          aria-label={`Export ${tmpl.name} as a print-ready PDF document`}
                          className="template-export-pdf-hover-btn px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[#00E5D1] text-white hover:text-[#1C1C23] border border-white/25 text-xs font-bold shadow-lg flex items-center gap-1 transition cursor-pointer"
                          title="Export entire template as a print-ready PDF document for clients"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#00E5D1]" />
                          <span>Export PDF</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleApplyTemplateImmediate(tmpl, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1 transition cursor-pointer"
                          title="Apply this template immediately to active project"
                        >
                          <span>Apply</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold group-hover:text-blue-500 transition line-clamp-1">
                          {tmpl.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCurrentProject && (
                            <span className="text-[10px] font-semibold text-emerald-500">
                              Active
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => toggleFavoriteTemplate(tmpl.id, e)}
                            aria-label={isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              isFavorite
                                ? 'text-rose-500 hover:text-rose-600'
                                : isDark
                                ? 'text-slate-500 hover:text-rose-400'
                                : 'text-slate-400 hover:text-rose-500'
                            }`}
                            title={isFavorite ? 'Saved in Favorites (click to remove)' : 'Save to Favorites'}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFavorite ? 'fill-rose-500 text-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <p
                        className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {tmpl.description}
                      </p>

                      {/* Colorful Feature Badges on Template Card */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {getTemplateFeatureBadges(tmpl)
                          .slice(0, 4)
                          .map((featTag) => {
                            const palette =
                              FEATURE_TAG_COLORS[featTag] || FEATURE_TAG_COLORS['AI & SaaS'];
                            const isTagActive = selectedFeatureTags.includes(featTag);
                            return (
                              <button
                                key={featTag}
                                type="button"
                                onClick={(e) => toggleFeatureTag(featTag, e)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition flex items-center gap-1 cursor-pointer ${
                                  isTagActive
                                    ? palette.active
                                    : isDark
                                    ? palette.dark
                                    : palette.light
                                }`}
                                title={`Click to filter by "${featTag}"`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isTagActive ? 'bg-white' : palette.dot
                                  }`}
                                />
                                <span>{featTag}</span>
                              </button>
                            );
                          })}
                      </div>

                      {/* Complexity Star Rating (1–5) */}
                      <div
                        className={`template-complexity-rating flex items-center justify-between gap-2 mt-3 pt-2.5 border-t text-[11px] ${
                          isDark
                            ? 'border-slate-800/80 text-slate-300'
                            : 'border-slate-100 text-slate-600'
                        }`}
                        title={complexity.hint}
                        aria-label={`Complexity rating: ${complexity.rating} out of 5 stars (${complexity.label})`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Complexity:
                          </span>
                          <div className="flex items-center gap-0.5" role="img" aria-label={`${complexity.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((starIdx) => {
                              const filled = starIdx <= complexity.rating;
                              return (
                                <Star
                                  key={starIdx}
                                  className={`w-3 h-3 ${
                                    filled
                                      ? 'fill-amber-400 text-amber-400'
                                      : isDark
                                      ? 'text-slate-700'
                                      : 'text-slate-300'
                                  }`}
                                />
                              );
                            })}
                          </div>
                          <span className="font-mono text-[10px] font-bold text-amber-500">
                            {complexity.rating}/5
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-medium truncate ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {complexity.label}
                        </span>
                      </div>

                      {/* Unboxed Metadata: Tags, Typography, Date Created & Usage Frequency */}
                      <div
                        className={`flex items-center justify-between gap-2 text-[11px] mt-2 pt-2 border-t ${
                          isDark
                            ? 'border-slate-800/80 text-slate-400'
                            : 'border-slate-100 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <Type className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="font-medium truncate">
                            {tmplTheme?.fontFamily || 'Inter'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="template-date-created truncate" title={`Date Created: ${sortMetrics.createdDateFormatted}`}>
                            {sortMetrics.createdDateFormatted}
                          </span>
                        </div>
                        <span
                          className={`template-usage-frequency shrink-0 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isDark
                              ? 'bg-slate-800/90 text-cyan-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                          title={`Usage Frequency: ${sortMetrics.usageCount.toLocaleString()} projects`}
                        >
                          {sortMetrics.usageCount.toLocaleString()} uses
                        </span>
                      </div>

                      {/* Personal Note / Annotation Field (Visible ONLY on Card Hover or in Favorites Tab) */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className={`template-card-note ${
                          isFavoritesView
                            ? 'block'
                            : 'hidden group-hover:block focus-within:block'
                        } mt-2.5 pt-2.5 border-t ${
                          isDark ? 'border-slate-800/80' : 'border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <label
                            htmlFor={`template-note-${tmpl.id}`}
                            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                              isDark ? 'text-[#00E5D1]' : 'text-[#2222FF]'
                            }`}
                          >
                            <StickyNote className="w-3 h-3 shrink-0" />
                            <span>Note</span>
                          </label>

                          {templateNote.trim().length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                                  isDark
                                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                Saved
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateTemplateNote(tmpl.id, '');
                                }}
                                className={`text-[10px] font-medium transition cursor-pointer ${
                                  isDark
                                    ? 'text-slate-400 hover:text-rose-400'
                                    : 'text-slate-400 hover:text-rose-600'
                                }`}
                                title="Clear note"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>

                        <input
                          id={`template-note-${tmpl.id}`}
                          type="text"
                          value={templateNote}
                          onChange={(e) => handleUpdateTemplateNote(tmpl.id, e.target.value)}
                          placeholder="Add a personal note or annotation..."
                          aria-label={`Note for ${tmpl.name}`}
                          className={`template-note-input w-full px-2.5 py-1.5 rounded-lg text-xs border transition focus:outline-hidden focus:ring-2 focus:ring-[#2222FF]/35 focus:border-[#2222FF] ${
                            isDark
                              ? 'bg-slate-950/90 border-slate-700/90 text-slate-100 placeholder:text-slate-500'
                              : 'bg-slate-50/90 border-slate-200 text-slate-800 placeholder:text-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action Bar with Compare Checkbox, Quick Preview & Apply */}
                  <div
                    className={`px-4 py-2.5 border-t flex items-center justify-between gap-2 ${
                      isDark
                        ? 'bg-slate-950/50 border-slate-800/80'
                        : 'bg-slate-50/70 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition cursor-pointer select-none ${
                          isCompared
                            ? isDark
                              ? 'bg-[#191970] border-[#00E5D1] text-[#00E5D1]'
                              : 'bg-blue-50 border-[#2222FF] text-[#2222FF]'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Check two or more templates to compare side-by-side"
                      >
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={(e) => toggleCompareTemplate(tmpl.id, e)}
                          className="w-3.5 h-3.5 rounded-xs accent-[#2222FF] cursor-pointer"
                        />
                        <span>Compare</span>
                      </label>

                      <button
                        type="button"
                        onClick={(e) => handleOpenQuickViewImage(tmpl, e)}
                        aria-label={`Quick View larger layout image for ${tmpl.name}`}
                        className={`template-quick-view-btn px-2 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition cursor-pointer ${
                          isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title="Open a larger image overlay of this template layout"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>Quick View</span>
                      </button>

                       <button
                        type="button"
                        onClick={(e) => handleCloneTemplateToDashboard(tmpl, e)}
                        aria-label={`Clone ${tmpl.name} to dashboard for experimentation`}
                        className={`template-clone-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition cursor-pointer ${
                          justClonedTemplateId === tmpl.id
                            ? isDark
                              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-[#00E5D1] hover:bg-[#191970]/70 hover:border-[#00E5D1] hover:text-white'
                            : 'bg-white border-slate-200 text-[#2222FF] hover:bg-blue-50 hover:border-[#2222FF]'
                        }`}
                        title="Create a duplicate of this template project in your dashboard for experimentation"
                      >
                        {justClonedTemplateId === tmpl.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Cloned!</span>
                          </>
                        ) : (
                          <>
                            <CopyPlus className="w-3.5 h-3.5" />
                            <span>Clone</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleExportTemplateAsPdf(tmpl, e)}
                        disabled={exportingPdfTemplateId === tmpl.id}
                        aria-label={`Export ${tmpl.name} as print-ready PDF`}
                        className={`template-export-pdf-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition cursor-pointer ${
                          pdfExportSuccessTemplateId === tmpl.id
                            ? isDark
                              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-[#00E5D1] hover:text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        } disabled:opacity-60`}
                        title="Export entire template as a print-ready PDF document to share with clients"
                      >
                        {exportingPdfTemplateId === tmpl.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                            <span>PDF...</span>
                          </>
                        ) : pdfExportSuccessTemplateId === tmpl.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>PDF Saved</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5 text-rose-500" />
                            <span>Export PDF</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleApplyTemplateImmediate(tmpl, e)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span>Apply</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK VIEW LARGER IMAGE OVERLAY MODAL */}
      {quickViewImageTemplate && (
        <div
          id="template-quick-view-image-overlay"
          onClick={() => setQuickViewImageTemplate(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Quick View Layout Image: ${quickViewImageTemplate.name}`}
          className="template-quick-view-overlay fixed inset-0 z-[72] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl max-h-[90vh] rounded-2xl border border-slate-700/80 bg-[#1C1C23] text-slate-100 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Overlay Top Bar */}
            <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCycleQuickViewImage(-1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Previous Template Layout Image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCycleQuickViewImage(1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Next Template Layout Image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: quickViewImageTemplate.accentColor || '#2222FF' }}
                    />
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {quickViewImageTemplate.name} — Layout Quick View
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#191970] text-[#00E5D1] border border-[#00E5D1]/40">
                      {quickViewImageTemplate.style || quickViewImageTemplate.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {quickViewImageTemplate.description}
                  </p>
                </div>
              </div>

              {/* Image Zoom & Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setQuickViewImageZoom((z) => Math.max(75, z - 25))}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Zoom Out Image"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-[#00E5D1]">{quickViewImageZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setQuickViewImageZoom((z) => Math.min(175, z + 25))}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    title="Zoom In Image"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  id="btn-quick-view-export-pdf"
                  onClick={(e) => handleExportTemplateAsPdf(quickViewImageTemplate, e)}
                  disabled={exportingPdfTemplateId === quickViewImageTemplate.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Export entire template as a print-ready PDF document for clients"
                >
                  <Printer className="w-3.5 h-3.5 text-[#00E5D1]" />
                  <span>
                    {pdfExportSuccessTemplateId === quickViewImageTemplate.id
                      ? 'PDF Saved!'
                      : 'Export PDF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = quickViewImageTemplate;
                    setQuickViewImageTemplate(null);
                    handleOpenQuickPreview(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#00E5D1]" />
                  <span>Interactive Live Preview</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    const target = quickViewImageTemplate;
                    setQuickViewImageTemplate(null);
                    handleApplyTemplateImmediate(target, e);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <span>Apply Template</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setQuickViewImageTemplate(null)}
                  aria-label="Close Quick View Image Overlay"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Close Quick View (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Enlarged Layout Image + Annotated Layout Structure Sidebar */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 bg-[#070a12]">
              {/* Enlarged High-Resolution Image Viewport (2 cols on desktop) */}
              <div className="lg:col-span-2 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-800">
                <div
                  style={{
                    transform: `scale(${quickViewImageZoom / 100})`,
                    transformOrigin: 'center center',
                  }}
                  className="w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 transition-transform duration-200"
                >
                  {/* Browser Frame Header */}
                  <div className="h-8 bg-slate-950 px-3.5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/85" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400/85" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/85" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {quickViewImageTemplate.name} — High-Resolution Layout Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#00E5D1]">
                      {quickViewImageTemplate.blocks.length} Sections
                    </span>
                  </div>

                  {/* Enlarged Template Layout Image */}
                  <div className="relative bg-slate-900">
                    <img
                      src={
                        (
                          quickViewImageTemplate.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=85'
                        ).replace(/w=\d+/, 'w=1600')
                      }
                      alt={`${quickViewImageTemplate.name} enlarged layout preview`}
                      className="template-quick-view-image w-full max-h-[62vh] object-cover block"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Architecture & Visual Spec Breakdown */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#1C1C23]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#00E5D1] mb-2">
                    Template Layout Architecture ({quickViewImageTemplate.blocks.length} Sections)
                  </div>
                  <div className="space-y-1.5">
                    {quickViewImageTemplate.blocks.map((blk, i) => (
                      <div
                        key={blk.id || i}
                        className="px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-[#00E5D1] shrink-0">
                            0{i + 1}
                          </span>
                          <span className="font-semibold text-slate-100 truncate">
                            {blk.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px] capitalize shrink-0">
                          {blk.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {quickViewImageTemplate.theme && (
                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#00E5D1] mb-1">
                      Theme & Typography
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary Brand Color</span>
                      <span className="font-mono text-slate-200 flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-white/25"
                          style={{ backgroundColor: quickViewImageTemplate.theme.primaryColor }}
                        />
                        {quickViewImageTemplate.theme.primaryColor}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Font Family</span>
                      <span className="font-semibold text-slate-200">
                        {quickViewImageTemplate.theme.fontFamily || 'Inter'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Color Mode</span>
                      <span className="font-semibold text-slate-200 capitalize">
                        {quickViewImageTemplate.theme.colorMode || 'light'} Mode
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE TEMPLATE COMPARISON PREVIEW MODAL */}
      {isCompareModalOpen && comparedTemplates.length >= 2 && (
        <div
          id="template-compare-preview-modal"
          className="fixed inset-0 z-[75] w-screen h-screen bg-[#1C1C23] text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-150"
        >
          {/* Top Command Bar */}
          <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Gallery</span>
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#2222FF] text-white flex items-center justify-center shrink-0">
                  <Columns2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      Side-by-Side Template Comparison
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#191970] text-[#00E5D1] border border-[#00E5D1]/40">
                      {comparedTemplates.length} Templates
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Comparison View Mode & Synchronized Viewport Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setCompareViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    compareViewMode === 'split'
                      ? 'bg-[#2222FF] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Preview + Structure
                </button>
                <button
                  type="button"
                  onClick={() => setCompareViewMode('live')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    compareViewMode === 'live'
                      ? 'bg-[#2222FF] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Iframes Only
                </button>
                <button
                  type="button"
                  onClick={() => setCompareViewMode('matrix')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    compareViewMode === 'matrix'
                      ? 'bg-[#2222FF] text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Features & Blocks Matrix
                </button>
              </div>

              <div className="hidden md:flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                    previewViewport === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                    previewViewport === 'tablet'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                    previewViewport === 'desktop' || previewViewport === 'fluid'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
              </div>
            </div>

            {/* Right: Add Another Template & Clear/Close */}
            <div className="flex items-center gap-2 shrink-0">
              {comparedTemplates.length < 4 && (
                <select
                  aria-label="Add another template to comparison"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleCompareTemplate(e.target.value);
                    }
                  }}
                  className="hidden lg:block px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-200 cursor-pointer focus:outline-hidden focus:border-[#00E5D1]"
                >
                  <option value="">+ Add Template ({4 - comparedTemplates.length} left)</option>
                  {STARTER_TEMPLATES.filter((t) => !compareIds.includes(t.id)).map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-slate-100">
                      {t.name} ({t.style || t.category})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={handleClearCompare}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close Comparison View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div
              className={`grid gap-4 items-start ${
                comparedTemplates.length === 2
                  ? 'grid-cols-1 lg:grid-cols-2'
                  : comparedTemplates.length === 3
                  ? 'grid-cols-1 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
              }`}
            >
              {comparedTemplates.map((cTmpl) => {
                const cTheme: SiteTheme = {
                  ...DEFAULT_THEME,
                  ...(cTmpl.theme || {}),
                };
                const cHtml = generateCompleteHtml(cTmpl.blocks, cTheme, cTmpl.name, false);
                const cFeatures = getTemplateFeatureBadges(cTmpl);
                const cComplexity = getTemplateComplexity(cTmpl);
                const isDarkTmpl = cTheme.colorMode === 'dark';

                return (
                  <div
                    key={cTmpl.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col shadow-2xl"
                  >
                    {/* 1. Column Header: Template Identity & Primary Actions */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={
                              cTmpl.thumbnailUrl ||
                              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'
                            }
                            alt={cTmpl.name}
                            className="w-12 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: cTmpl.accentColor || '#2222FF' }}
                              />
                              <h4 className="text-sm font-bold text-white truncate">
                                {cTmpl.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {cTmpl.style || cTmpl.category} · {cTmpl.blocks.length} sections ·{' '}
                              {isDarkTmpl ? 'Dark UI' : 'Light UI'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromCompare(cTmpl.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCompareModalOpen(false);
                            handleOpenQuickPreview(cTmpl);
                          }}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00E5D1]" />
                          <span>Full Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleExportTemplateAsPdf(cTmpl, e)}
                          disabled={exportingPdfTemplateId === cTmpl.id}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                          title="Export entire template as a print-ready PDF document for clients"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-400" />
                          <span>
                            {pdfExportSuccessTemplateId === cTmpl.id ? 'PDF Saved' : 'Export PDF'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadTemplateZip(cTmpl)}
                          disabled={isDownloadingZip}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                          title="Download ZIP archive containing this template's source assets (images, CSS, and JS) separately from project import"
                        >
                          <FileArchive className="w-3.5 h-3.5 text-[#00E5D1]" />
                          <span>ZIP Assets</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleApplyTemplateImmediate(cTmpl, e)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <span>Apply</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 2. Live Scrollable Sandbox Preview (in 'split' or 'live' mode) */}
                    {(compareViewMode === 'split' || compareViewMode === 'live') && (
                      <div
                        className={`w-full bg-[#070a12] border-b border-slate-800 flex justify-center overflow-hidden ${
                          compareViewMode === 'live' ? 'h-[72vh]' : 'h-[360px]'
                        }`}
                      >
                        <div
                          className={`h-full bg-white transition-all duration-300 overflow-hidden ${
                            previewViewport === 'mobile'
                              ? 'w-[375px] border-x-4 border-slate-800'
                              : previewViewport === 'tablet'
                              ? 'w-[680px] border-x-2 border-slate-800'
                              : 'w-full'
                          }`}
                        >
                          <iframe
                            srcDoc={cHtml}
                            title={`Compare Preview: ${cTmpl.name}`}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                      </div>
                    )}

                    {/* 3. Feature & Theme Contrast Matrix + Component Structure (in 'split' or 'matrix' mode) */}
                    {(compareViewMode === 'split' || compareViewMode === 'matrix') && (
                      <div className="p-4 space-y-4 text-xs">
                        {/* Design & Theme Specifications */}
                        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#00E5D1] mb-1">
                            Theme & Design Specs
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                            <span className="text-slate-400">Primary Brand Color</span>
                            <span className="font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                              <span
                                className="w-3 h-3 rounded-full border border-white/25"
                                style={{ backgroundColor: cTheme.primaryColor }}
                              />
                              {cTheme.primaryColor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                            <span className="text-slate-400">Typography (Body / Heading)</span>
                            <span className="font-semibold text-slate-200">
                              {cTheme.fontFamily}
                              {cTheme.headingFontFamily ? ` / ${cTheme.headingFontFamily}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                            <span className="text-slate-400">UI Color Mode</span>
                            <span className="font-semibold text-slate-200">
                              {isDarkTmpl ? 'Dark Mode' : 'Light Mode'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                            <span className="text-slate-400">Complexity (1–5)</span>
                            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                              <span className="inline-flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= cComplexity.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </span>
                              <span className="font-mono text-amber-400">{cComplexity.rating}/5</span>
                              <span className="text-[10px] text-slate-400">({cComplexity.label})</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-slate-400">Button Corner Style</span>
                            <span className="font-mono text-slate-300">{cTheme.buttonStyle}</span>
                          </div>
                        </div>

                        {/* Feature Checklist */}
                        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#00E5D1] mb-2">
                            Included Features ({cFeatures.length})
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {FEATURE_TAG_CLOUD.map((feat) => {
                              const hasFeat = cFeatures.includes(feat);
                              return (
                                <div
                                  key={feat}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${
                                    hasFeat
                                      ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300 font-semibold'
                                      : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                                  }`}
                                >
                                  {hasFeat ? (
                                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                  ) : (
                                    <span className="w-3 text-center text-slate-600 shrink-0">—</span>
                                  )}
                                  <span className="truncate">{feat}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Component Structure & Section Stack */}
                        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5D1]">
                              Component Structure
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {cTmpl.blocks.length} sections
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {cTmpl.blocks.map((blk, bIdx) => (
                              <div
                                key={blk.id || bIdx}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono text-[10px] text-[#00E5D1] font-bold shrink-0">
                                    0{bIdx + 1}
                                  </span>
                                  <span className="font-semibold text-slate-200 truncate">
                                    {blk.name}
                                  </span>
                                </div>
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] capitalize shrink-0">
                                  {blk.category}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN IFRAME & MOCK CANVAS QUICK PREVIEW OVERLAY */}
      {quickPreviewTemplate && (
        <div
          id="template-quick-preview-fullscreen-modal"
          className="fixed inset-0 z-[70] w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-150"
        >
          {/* 1. Full-Screen Top Command Bar */}
          <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 select-none">
            {/* Left: Back to Gallery + Prev/Next Template + Active Template Identity */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setQuickPreviewTemplate(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 border border-slate-700"
                title="Return to Template Gallery without importing"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Gallery</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCyclePreviewTemplate(-1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Previous Template in Gallery"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCyclePreviewTemplate(1)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Next Template in Gallery"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 min-w-0 pl-1">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shrink-0"
                  style={{ backgroundColor: quickPreviewTemplate.accentColor || '#0d6efd' }}
                />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">
                      {quickPreviewTemplate.name}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden md:inline">
                      {quickPreviewTemplate.style || quickPreviewTemplate.category} · {quickPreviewTemplate.blocks.length} sections
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Full-Screen Mode Switcher (Live Scrollable Iframe vs Interactive Mock Canvas) & Viewport Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewMode('iframe')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    previewMode === 'iframe'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Scroll through full-screen rendered Bootstrap 5 iframe"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full-Screen Iframe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mock-canvas')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    previewMode === 'mock-canvas'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Scroll through annotated Mock Canvas component structure"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Mock Canvas Structure</span>
                </button>
              </div>

              {/* Component Boundary Outlines Toggle (for Full-Screen Iframe) */}
              {previewMode === 'iframe' && (
                <button
                  type="button"
                  onClick={() => setShowComponentOutlines((prev) => !prev)}
                  className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    showComponentOutlines
                      ? 'bg-blue-950/80 text-blue-300 border-blue-700'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title="Toggle visible section boundary outlines while scrolling"
                >
                  <BoxSelect className="w-3.5 h-3.5" />
                  <span>Section Guides</span>
                </button>
              )}

              {/* Responsive Device Viewport Controls (Mobile, Tablet, Desktop, Full) */}
              <div
                id="quick-preview-device-switcher"
                className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    previewViewport === 'mobile'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    previewViewport === 'tablet'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    previewViewport === 'desktop'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View (1280px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('fluid')}
                  className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                    previewViewport === 'fluid'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="100% Fluid Width"
                >
                  Full
                </button>
              </div>

              {/* Zoom Controls (- / % / + / Reset) */}
              <div
                id="quick-preview-zoom-controls"
                className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                  disabled={previewZoom <= 50}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                {[50, 75, 100, 125].map((zVal) => (
                  <button
                    key={zVal}
                    type="button"
                    onClick={() => setPreviewZoom(zVal)}
                    className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition cursor-pointer ${
                      previewZoom === zVal
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                    title={`Set preview zoom to ${zVal}%`}
                  >
                    {zVal}%
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(150, z + 25))}
                  disabled={previewZoom >= 150}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-35 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                {previewZoom !== 100 && (
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(100)}
                    className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition cursor-pointer"
                    title="Reset Zoom to 100%"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Share Template, Export as Image, Commit Import & Close Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-share-preview-template"
                onClick={handleShareTemplate}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  shareCopied
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                    : isShareBannerOpen
                    ? 'bg-[#191970] text-[#00E5D1] border-[#00E5D1]/60'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                }`}
                title="Generate a persistent, shareable URL for the current template configuration"
              >
                {shareCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#00E5D1]" />
                    <span>Share Template</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-export-preview-image"
                onClick={handleExportAsImage}
                disabled={isExportingImage}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  exportSuccess
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                } disabled:opacity-60`}
                title="Generate and download a PNG snapshot of the template's current preview state"
              >
                {isExportingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Exporting PNG...</span>
                  </>
                ) : exportSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PNG Saved</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export as Image</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-export-template-pdf"
                onClick={(e) => handleExportTemplateAsPdf(quickPreviewTemplate, e)}
                disabled={exportingPdfTemplateId === quickPreviewTemplate.id}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  pdfExportSuccessTemplateId === quickPreviewTemplate.id
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                } disabled:opacity-60`}
                title="Export the entire template as a print-ready PDF document to share design concepts with clients"
              >
                {exportingPdfTemplateId === quickPreviewTemplate.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    <span>Generating PDF...</span>
                  </>
                ) : pdfExportSuccessTemplateId === quickPreviewTemplate.id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PDF Exported!</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Export PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-download-template-zip"
                onClick={() => handleDownloadTemplateZip(quickPreviewTemplate)}
                disabled={isDownloadingZip}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  zipDownloadSuccess
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                } disabled:opacity-60`}
                title="Download a ZIP archive containing the template's source assets (images, CSS, and JS) separately from the project import"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E5D1]" />
                    <span>Packaging ZIP...</span>
                  </>
                ) : zipDownloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ZIP Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-[#00E5D1]" />
                    <span>Download Source ZIP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleApplyTemplateImmediate(quickPreviewTemplate, e)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Import & Apply Template</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsShareBannerOpen(false);
                  setQuickPreviewTemplate(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close Full-Screen Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Persistent Shareable Template URL Banner */}
          {isShareBannerOpen && shareUrl && (
            <div
              id="template-preview-share-banner"
              className="px-4 py-2.5 bg-[#1C1C23] border-b border-[#191970] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 animate-in fade-in duration-150"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#2222FF]/25 border border-[#00E5D1]/40 text-[#00E5D1] flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      Shareable Template Configuration URL
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191970]/80 text-[#00E5D1] border border-[#2222FF]/40">
                      {previewViewport} · {previewZoom}% · {previewMode === 'iframe' ? 'Iframe' : 'Mock Canvas'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Anyone opening this persistent link loads <strong className="text-slate-200">{quickPreviewTemplate.name}</strong> with your exact viewport, zoom, and theme settings.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:w-auto w-full shrink-0">
                <input
                  id="share-template-url-input"
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Persistent shareable template configuration URL"
                  className="flex-1 sm:w-80 md:w-96 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-mono text-[11px] focus:outline-hidden focus:border-[#00E5D1]"
                />
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    shareCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#2222FF] hover:bg-[#00E5D1] hover:text-[#1C1C23] text-white'
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareBannerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  title="Hide Share URL bar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Interactive Component Structure Jump Rail (Click any section to scroll to it) */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/90 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 select-none">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 pr-2 border-r border-slate-800 shrink-0">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Page Structure ({quickPreviewTemplate.blocks.length} sections):</span>
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPreviewTemplate.blocks.map((block, idx) => {
                const isActive = activePreviewBlockId === block.id;
                return (
                  <button
                    key={block.id || idx}
                    type="button"
                    onClick={() => handleScrollToPreviewBlock(block.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                    title={`Scroll preview to section #${idx + 1}: ${block.name}`}
                  >
                    <span className="font-mono text-[10px] opacity-75">0{idx + 1}.</span>
                    <span>{block.name}</span>
                  </button>
                );
              })}
            </div>

            {quickPreviewTemplate.theme && (
              <div className="ml-auto hidden xl:flex items-center gap-3 pl-3 border-l border-slate-800 text-[11px] text-slate-400 shrink-0">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  <span
                    className="w-3 h-3 rounded-full inline-block border border-white/20"
                    style={{ backgroundColor: quickPreviewTemplate.theme.primaryColor }}
                  />
                  <span>{quickPreviewTemplate.theme.primaryColor}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-200 font-medium">
                    {quickPreviewTemplate.theme.fontFamily || 'Inter'}
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* 3. Full-Screen Scrollable Viewport Area with Zoom & Device Scaling */}
          {previewMode === 'iframe' ? (
            <div className="relative flex-1 w-full h-full overflow-auto flex flex-col items-center justify-start bg-[#070a12] p-2 sm:p-4">
              <div
                ref={previewFrameWrapperRef}
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                  height: `${(100 / previewZoom) * 100}%`,
                }}
                className={`transition-all duration-300 bg-white shadow-2xl overflow-hidden shrink-0 ${
                  previewViewport === 'mobile'
                    ? 'w-[390px] rounded-[32px] border-[6px] border-slate-800'
                    : previewViewport === 'tablet'
                    ? 'w-[768px] rounded-[20px] border-[4px] border-slate-800'
                    : previewViewport === 'desktop'
                    ? 'w-full max-w-[1280px] rounded-xl border border-slate-800'
                    : 'w-full'
                }`}
              >
                <iframe
                  ref={previewIframeRef}
                  srcDoc={quickPreviewHtml}
                  title={`Full-Screen Preview: ${quickPreviewTemplate.name}`}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>

              {/* Floating Bottom Zoom & Device Viewport HUD */}
              <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/90 text-white backdrop-blur-md border border-slate-700/80 shadow-2xl select-none">
                {/* Mobile / Tablet / Desktop Quick Toggles */}
                <div className="flex items-center gap-1 pr-2 border-r border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('mobile')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      previewViewport === 'mobile'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('tablet')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      previewViewport === 'tablet'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewViewport('desktop')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      previewViewport === 'desktop'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                    disabled={previewZoom <= 50}
                    className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-blue-400 min-w-[42px] text-center">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(150, z + 25))}
                    disabled={previewZoom >= 150}
                    className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-35 transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  {previewZoom !== 100 && (
                    <button
                      type="button"
                      onClick={() => setPreviewZoom(100)}
                      className="text-[11px] font-sans font-semibold text-amber-400 hover:text-amber-300 px-1.5 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Scrollable Annotated Mock Canvas of Component Structure */
            <div
              ref={mockCanvasContainerRef}
              className="flex-1 w-full overflow-y-auto p-6 sm:p-10 bg-[#070a12] space-y-6"
            >
              <div
                style={{
                  transform: `scale(${previewZoom / 100})`,
                  transformOrigin: 'top center',
                }}
                className={`mx-auto space-y-6 transition-all duration-300 ${
                  previewViewport === 'mobile'
                    ? 'max-w-[420px]'
                    : previewViewport === 'tablet'
                    ? 'max-w-[768px]'
                    : 'max-w-5xl'
                }`}
              >
                {quickPreviewTemplate.blocks.map((block, idx) => {
                  const singleBlockTheme: SiteTheme = {
                    ...DEFAULT_THEME,
                    ...(quickPreviewTemplate.theme || {}),
                  };
                  const singleBlockHtml = generateCompleteHtml(
                    [block],
                    singleBlockTheme,
                    block.name,
                    false
                  );

                  return (
                    <div
                      key={block.id || idx}
                      data-mock-block-id={block.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl"
                    >
                      {/* Mock Canvas Component Header Bar */}
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-400 font-bold">
                            Section 0{idx + 1}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="font-bold text-white">{block.name}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 capitalize">{block.category}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                          <span>type: {block.type}</span>
                          <span>container: {block.settings.containerWidth}</span>
                        </div>
                      </div>

                      {/* Rendered Section Preview Frame */}
                      <div className="w-full h-[360px] bg-white">
                        <iframe
                          srcDoc={singleBlockHtml}
                          title={`${block.name} section preview`}
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isEmbedded) {
    return galleryBody;
  }

  return (
    <div
      id="template-gallery-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-7xl flex justify-center">
        {galleryBody}
      </div>
    </div>
  );
};
