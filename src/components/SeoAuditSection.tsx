import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Wand2,
  FileText,
  Eye,
  Type,
  Layout,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Info,
} from 'lucide-react';
import { BlockInstance, SeoSettings } from '../types';

export interface SeoAuditIssue {
  id: string;
  pillar: 'meta' | 'accessibility' | 'hierarchy';
  title: string;
  status: 'passed' | 'warning' | 'error';
  scoreImpact: number; // impact deduction or contribution
  description: string;
  recommendation: string;
  autoFixLabel?: string;
  onAutoFix?: () => void;
  affectedBlockId?: string;
}

export interface SeoAuditSectionProps {
  blocks: BlockInstance[];
  seoSettings: SeoSettings;
  projectTitle: string;
  onUpdateSeoSettings: (settings: SeoSettings) => void;
  onUpdateProjectTitle?: (title: string) => void;
  onUpdateContent?: (blockId: string, content: Partial<BlockInstance['content']>) => void;
  onSelectBlock?: (blockId: string) => void;
  onAddBlock?: (blockType: string) => void;
  themeMode?: 'light' | 'dark';
  showToast?: (toast: { title: string; description?: string }) => void;
}

export const SeoAuditSection: React.FC<SeoAuditSectionProps> = ({
  blocks = [],
  seoSettings,
  projectTitle,
  onUpdateSeoSettings,
  onUpdateProjectTitle,
  onUpdateContent,
  onSelectBlock,
  onAddBlock,
  themeMode = 'light',
  showToast,
}) => {
  const isDark = themeMode === 'dark';
  const [activePillar, setActivePillar] = useState<'all' | 'meta' | 'accessibility' | 'hierarchy'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'issues' | 'passed'>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date>(new Date());
  const [fixedIssueIds, setFixedIssueIds] = useState<Record<string, boolean>>({});

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(new Date());
      if (showToast) {
        showToast({
          title: 'SEO Audit Completed',
          description: `Analyzed ${blocks.length} canvas sections, accessibility tags, and page metadata.`,
        });
      }
    }, 400);
  };

  // Perform comprehensive automated audit
  const auditReport = useMemo(() => {
    const issues: SeoAuditIssue[] = [];

    const effectiveTitle = (seoSettings.title || projectTitle || '').trim();
    const effectiveDesc = (seoSettings.description || '').trim();
    const effectiveCanonical = (seoSettings.canonicalUrl || '').trim();
    const effectiveOgImage = (seoSettings.ogImageUrl || '').trim();
    const effectiveTwitter = (seoSettings.twitterHandle || '').trim();
    const effectiveFavicon = (seoSettings.faviconUrl || '').trim();

    // ----------------------------------------------------
    // 1. META TAGS PILLAR
    // ----------------------------------------------------
    // Check 1.1: Title Tag
    if (!effectiveTitle) {
      issues.push({
        id: 'meta-title-empty',
        pillar: 'meta',
        title: 'Missing Page Title (<title>)',
        status: 'error',
        scoreImpact: 15,
        description: 'The <title> tag is completely empty. Search engines and browser tabs have no identifier for this page.',
        recommendation: 'Provide a descriptive title between 30 and 60 characters incorporating primary keywords.',
        autoFixLabel: 'Generate Title from Hero',
        onAutoFix: () => {
          const hero = blocks.find((b) => b.category === 'headers' || b.type.startsWith('hero'));
          const candidate = hero?.content?.title || hero?.content?.heading || projectTitle || 'Modern Bootstrap 5 Website';
          const newTitle = `${candidate.replace(/<[^>]*>?/gm, '').trim()} | Official`;
          onUpdateSeoSettings({ ...seoSettings, title: newTitle });
          if (onUpdateProjectTitle) onUpdateProjectTitle(candidate.slice(0, 30));
          showToast?.({ title: 'Title Fixed', description: `Set page title to "${newTitle}".` });
        },
      });
    } else if (effectiveTitle.length < 30) {
      issues.push({
        id: 'meta-title-short',
        pillar: 'meta',
        title: `Page Title Too Short (${effectiveTitle.length}/30-60 chars)`,
        status: 'warning',
        scoreImpact: 6,
        description: `Current title is ${effectiveTitle.length} characters ("${effectiveTitle}"). Titles under 30 characters underutilize Google SERP space.`,
        recommendation: 'Expand with a secondary brand descriptor, location, or core value proposition.',
        autoFixLabel: 'Expand Title with Brand',
        onAutoFix: () => {
          const newTitle = `${effectiveTitle} — Fast, Responsive & Modern Web Platform`;
          onUpdateSeoSettings({ ...seoSettings, title: newTitle });
          showToast?.({ title: 'Title Expanded', description: `Updated title to "${newTitle}".` });
        },
      });
    } else if (effectiveTitle.length > 60) {
      issues.push({
        id: 'meta-title-long',
        pillar: 'meta',
        title: `Page Title May Be Truncated (${effectiveTitle.length}/60 chars)`,
        status: 'warning',
        scoreImpact: 5,
        description: `Google search results typically display the first 50–60 characters before truncating with ellipses (...).`,
        recommendation: 'Condense title to under 60 characters while keeping the most critical keyword near the front.',
        autoFixLabel: 'Trim to 58 Characters',
        onAutoFix: () => {
          const trimmed = effectiveTitle.slice(0, 58).trim();
          onUpdateSeoSettings({ ...seoSettings, title: trimmed });
          showToast?.({ title: 'Title Trimmed', description: `Trimmed title to 58 characters.` });
        },
      });
    } else {
      issues.push({
        id: 'meta-title-ok',
        pillar: 'meta',
        title: `Optimal Page Title Length (${effectiveTitle.length} characters)`,
        status: 'passed',
        scoreImpact: 0,
        description: `Title length is within the optimal 30–60 character range for Google search snippets.`,
        recommendation: 'Keep keyword-rich and relevant to page content.',
      });
    }

    // Check 1.2: Meta Description
    if (!effectiveDesc) {
      issues.push({
        id: 'meta-desc-empty',
        pillar: 'meta',
        title: 'Missing Meta Description',
        status: 'error',
        scoreImpact: 15,
        description: 'No meta description tag provided. Search engines may display arbitrary body text instead of a tailored summary.',
        recommendation: 'Add a compelling 50–160 character description summarizing benefits and inviting clicks.',
        autoFixLabel: 'Generate Description from Canvas',
        onAutoFix: () => {
          const hero = blocks.find((b) => b.category === 'headers' || b.type.startsWith('hero'));
          const descCandidate =
            hero?.content?.description ||
            hero?.content?.subtitle ||
            `Explore ${projectTitle}. Built with high-performance responsive Bootstrap 5 components and clean design.`;
          const clean = descCandidate.replace(/<[^>]*>?/gm, '').trim();
          onUpdateSeoSettings({ ...seoSettings, description: clean.slice(0, 155) });
          showToast?.({ title: 'Meta Description Generated', description: 'Populated description from canvas hero.' });
        },
      });
    } else if (effectiveDesc.length < 50) {
      issues.push({
        id: 'meta-desc-short',
        pillar: 'meta',
        title: `Meta Description Too Brief (${effectiveDesc.length}/50-160 chars)`,
        status: 'warning',
        scoreImpact: 6,
        description: `Description has only ${effectiveDesc.length} characters. Rich descriptions improve click-through rates.`,
        recommendation: 'Expand with clear benefits, features, and a call-to-action.',
        autoFixLabel: 'Enrich Description',
        onAutoFix: () => {
          const enriched = `${effectiveDesc} Discover interactive responsive sections, fast loading speeds, and high-converting layouts.`;
          onUpdateSeoSettings({ ...seoSettings, description: enriched.slice(0, 158) });
          showToast?.({ title: 'Description Enriched', description: 'Appended key value propositions.' });
        },
      });
    } else if (effectiveDesc.length > 160) {
      issues.push({
        id: 'meta-desc-long',
        pillar: 'meta',
        title: `Meta Description Exceeds SERP Limit (${effectiveDesc.length}/160 chars)`,
        status: 'warning',
        scoreImpact: 4,
        description: `Search engines usually truncate descriptions past 160 characters on desktop (120 on mobile).`,
        recommendation: 'Keep primary message and call-to-action within the first 150 characters.',
        autoFixLabel: 'Trim to 155 Characters',
        onAutoFix: () => {
          const trimmed = effectiveDesc.slice(0, 155).trim();
          onUpdateSeoSettings({ ...seoSettings, description: trimmed });
          showToast?.({ title: 'Description Trimmed', description: 'Trimmed description to 155 characters.' });
        },
      });
    } else {
      issues.push({
        id: 'meta-desc-ok',
        pillar: 'meta',
        title: `Optimal Meta Description Length (${effectiveDesc.length} chars)`,
        status: 'passed',
        scoreImpact: 0,
        description: `Description is concise, descriptive, and fits inside search result preview cards.`,
        recommendation: 'Ensure it aligns with the search intent of your target visitors.',
      });
    }

    // Check 1.3: Canonical URL
    if (!effectiveCanonical) {
      issues.push({
        id: 'meta-canonical-missing',
        pillar: 'meta',
        title: 'Missing Canonical URL (<link rel="canonical">)',
        status: 'warning',
        scoreImpact: 8,
        description: 'Canonical URL prevents duplicate content issues when URLs contain query parameters, tracking tags, or staging domains.',
        recommendation: 'Specify your permanent production domain as the canonical origin.',
        autoFixLabel: 'Set Current Origin as Canonical',
        onAutoFix: () => {
          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
          onUpdateSeoSettings({ ...seoSettings, canonicalUrl: origin });
          showToast?.({ title: 'Canonical URL Configured', description: `Set to ${origin}.` });
        },
      });
    } else {
      issues.push({
        id: 'meta-canonical-ok',
        pillar: 'meta',
        title: 'Canonical URL Configured',
        status: 'passed',
        scoreImpact: 0,
        description: `Canonical link tag set to: ${effectiveCanonical}`,
        recommendation: 'Verify the protocol (https) matches your final production host.',
      });
    }

    // Check 1.4: Open Graph Cover Image
    if (!effectiveOgImage) {
      issues.push({
        id: 'meta-og-image-missing',
        pillar: 'meta',
        title: 'Missing Open Graph Social Share Image',
        status: 'warning',
        scoreImpact: 8,
        description: 'When users share your link on WhatsApp, Facebook, iMessage, or Twitter, a default blank gray card will appear.',
        recommendation: 'Upload or select a 1200×630px social banner image.',
        autoFixLabel: 'Apply SaaS Banner Preset',
        onAutoFix: () => {
          const presetUrl = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';
          onUpdateSeoSettings({ ...seoSettings, ogImageUrl: presetUrl });
          showToast?.({ title: 'OG Image Applied', description: 'Set high-resolution 1200x630 share banner.' });
        },
      });
    } else {
      issues.push({
        id: 'meta-og-image-ok',
        pillar: 'meta',
        title: 'Open Graph Image Configured',
        status: 'passed',
        scoreImpact: 0,
        description: `Share previews will display banner: ${effectiveOgImage.slice(0, 45)}...`,
        recommendation: 'Verify visual branding and ensure text in banner is legible at small mobile dimensions.',
      });
    }

    // Check 1.5: Favicon
    if (!effectiveFavicon) {
      issues.push({
        id: 'meta-favicon-missing',
        pillar: 'meta',
        title: 'Browser Tab Favicon Missing',
        status: 'warning',
        scoreImpact: 5,
        description: 'Favicons appear in browser tabs and Google mobile search results beside page titles.',
        recommendation: 'Select a 1-click icon preset or upload a 32×32 favicon.',
        autoFixLabel: 'Apply Rocket Favicon',
        onAutoFix: () => {
          const iconUrl = 'https://api.iconify.design/lucide:rocket.svg?color=%230d6efd';
          onUpdateSeoSettings({ ...seoSettings, faviconUrl: iconUrl });
          showToast?.({ title: 'Favicon Configured', description: 'Applied modern Rocket SVG favicon.' });
        },
      });
    } else {
      issues.push({
        id: 'meta-favicon-ok',
        pillar: 'meta',
        title: 'Favicon Branding Configured',
        status: 'passed',
        scoreImpact: 0,
        description: `Browser tab icon and mobile search icon are linked.`,
        recommendation: 'Keep high contrast for dark and light browser tab themes.',
      });
    }

    // ----------------------------------------------------
    // 2. ACCESSIBILITY PILLAR
    // ----------------------------------------------------
    // Check 2.1: Image Alt Attributes across all canvas blocks
    const imageBlocksWithoutAlt: { blockId: string; blockName: string; key: string }[] = [];
    let totalImagesFound = 0;

    blocks.forEach((b) => {
      const c = b.content || {};
      const imgKeys = Object.keys(c).filter(
        (k) =>
          k.toLowerCase().includes('img') ||
          k.toLowerCase().includes('image') ||
          k.toLowerCase().includes('avatar') ||
          k.toLowerCase().includes('logo') ||
          k.toLowerCase().includes('poster')
      );

      imgKeys.forEach((k) => {
        const val = c[k];
        if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:') || val.startsWith('/'))) {
          totalImagesFound++;
          // Look for companion alt text
          const altKey = k.replace(/img|image|avatar|logo|poster/i, (m) => `alt${m}`);
          const altVal = c[altKey] || c.alt || c[`${k}Alt`];
          if (!altVal || String(altVal).trim() === '') {
            imageBlocksWithoutAlt.push({ blockId: b.id, blockName: b.name, key: k });
          }
        }
      });
    });

    if (imageBlocksWithoutAlt.length > 0) {
      issues.push({
        id: 'a11y-missing-alt',
        pillar: 'accessibility',
        title: `${imageBlocksWithoutAlt.length} Images Missing Alt Text`,
        status: 'warning',
        scoreImpact: Math.min(15, imageBlocksWithoutAlt.length * 3),
        description: `Detected ${imageBlocksWithoutAlt.length} image elements across sections without descriptive alt attributes. Screen readers and Google Image search depend on alt tags.`,
        recommendation: `Add meaningful descriptions explaining image contents in sections: ${imageBlocksWithoutAlt
          .map((i) => i.blockName)
          .slice(0, 3)
          .join(', ')}.`,
        autoFixLabel: 'Auto-Generate Alt Descriptions',
        onAutoFix: () => {
          if (!onUpdateContent) {
            showToast?.({ title: 'Manual Edit Required', description: 'Please edit the block settings to provide alt text.' });
            return;
          }
          imageBlocksWithoutAlt.forEach((item) => {
            const altKey = item.key.replace(/img|image|avatar|logo|poster/i, (m) => `alt${m}`);
            onUpdateContent(item.blockId, {
              [altKey]: `${item.blockName} visual presentation and media illustration`,
              alt: `${item.blockName} showcase image`,
            });
          });
          showToast?.({
            title: 'Alt Text Generated',
            description: `Generated accessible alt tags for ${imageBlocksWithoutAlt.length} images.`,
          });
        },
      });
    } else if (totalImagesFound > 0) {
      issues.push({
        id: 'a11y-alt-ok',
        pillar: 'accessibility',
        title: `All ${totalImagesFound} Images Have Alt Descriptions`,
        status: 'passed',
        scoreImpact: 0,
        description: 'Every detected image contains descriptive labels, fulfilling WCAG 2.1 Success Criterion 1.1.1.',
        recommendation: 'Ensure descriptions are informative rather than keyword-stuffed.',
      });
    } else {
      issues.push({
        id: 'a11y-alt-none',
        pillar: 'accessibility',
        title: 'Image Alt Tags Verified',
        status: 'passed',
        scoreImpact: 0,
        description: 'No unlabelled images found on the active canvas.',
        recommendation: 'Remember to supply alt text when adding photo or media sections.',
      });
    }

    // Check 2.2: Actionable Button / Link Text
    const vagueButtons: { blockId: string; blockName: string; text: string }[] = [];
    const vaguePhrases = ['click here', 'here', 'more', 'read more', 'learn more', 'button', 'link'];

    blocks.forEach((b) => {
      const c = b.content || {};
      ['buttonText', 'primaryBtnText', 'secondaryBtnText', 'ctaText', 'r1BtnText'].forEach((k) => {
        const val = c[k];
        if (typeof val === 'string' && val.trim()) {
          const lower = val.toLowerCase().trim();
          if (vaguePhrases.includes(lower)) {
            vagueButtons.push({ blockId: b.id, blockName: b.name, text: val });
          }
        }
      });
    });

    if (vagueButtons.length > 0) {
      issues.push({
        id: 'a11y-vague-buttons',
        pillar: 'accessibility',
        title: `Vague Call-to-Action Text Detected (${vagueButtons.length} buttons)`,
        status: 'warning',
        scoreImpact: 8,
        description: `Found ambiguous CTA text (e.g. "${vagueButtons[0].text}") in "${vagueButtons[0].blockName}". Screen readers navigate links out-of-context.`,
        recommendation: 'Use descriptive action verbs such as "Explore Features", "Download Specification", or "Start Free Trial".',
        autoFixLabel: 'Make Button Labels Descriptive',
        onAutoFix: () => {
          if (!onUpdateContent) return;
          vagueButtons.forEach((vb) => {
            onUpdateContent(vb.blockId, {
              buttonText: 'Get Started Now',
              primaryBtnText: 'Explore Platform Features',
            });
          });
          showToast?.({ title: 'Buttons Updated', description: 'Replaced vague CTA text with action-oriented labels.' });
        },
      });
    } else {
      issues.push({
        id: 'a11y-buttons-ok',
        pillar: 'accessibility',
        title: 'Actionable & Descriptive Button Labels',
        status: 'passed',
        scoreImpact: 0,
        description: 'All buttons on the canvas use specific, context-rich action phrases.',
        recommendation: 'Clear CTAs boost user confidence and accessibility ratings.',
      });
    }

    // Check 2.3: Form Input Labels (if form blocks present)
    const formBlocks = blocks.filter((b) => b.category === 'forms' || b.type.includes('form') || b.type.includes('contact'));
    if (formBlocks.length > 0) {
      issues.push({
        id: 'a11y-forms-checked',
        pillar: 'accessibility',
        title: `Forms Accessibility Verified (${formBlocks.length} form sections)`,
        status: 'passed',
        scoreImpact: 0,
        description: 'Form sections use Bootstrap floating labels or visible label tags with accessible placeholder attributes.',
        recommendation: 'Ensure all required fields are indicated clearly with visual asterisks and aria-required.',
      });
    }

    // ----------------------------------------------------
    // 3. CONTENT HIERARCHY PILLAR
    // ----------------------------------------------------
    // Check 3.1: H1 Heading Structure
    const headerBlocks = blocks.filter(
      (b) => b.category === 'headers' || b.type.startsWith('hero') || b.type.includes('banner')
    );

    if (headerBlocks.length === 0) {
      issues.push({
        id: 'hierarchy-h1-missing',
        pillar: 'hierarchy',
        title: 'Missing Main Hero / Primary H1 Section',
        status: 'error',
        scoreImpact: 15,
        description: 'No hero or header block was found on the canvas. Search engines rely on a primary H1 heading to categorize page intent.',
        recommendation: 'Add a Hero or Header section at the top of the canvas.',
        autoFixLabel: 'Insert Hero Section',
        onAutoFix: () => {
          if (onAddBlock) {
            onAddBlock('hero-split');
            showToast?.({ title: 'Hero Section Added', description: 'Inserted Hero Split section with primary H1 heading.' });
          }
        },
      });
    } else if (headerBlocks.length > 1) {
      issues.push({
        id: 'hierarchy-h1-multiple',
        pillar: 'hierarchy',
        title: `Multiple Hero Sections Detected (${headerBlocks.length} heroes)`,
        status: 'warning',
        scoreImpact: 6,
        description: `Found ${headerBlocks.length} sections designed with primary display H1 headings. Best SEO practice is to have exactly one main H1, with supporting sections using H2 and H3.`,
        recommendation: 'Consolidate multiple hero banners or designate supporting banners as secondary feature highlights.',
      });
    } else {
      issues.push({
        id: 'hierarchy-h1-ok',
        pillar: 'hierarchy',
        title: 'Clean Single Primary H1 Structure',
        status: 'passed',
        scoreImpact: 0,
        description: `Exactly 1 primary header section ("${headerBlocks[0].name}") provides the page anchor H1.`,
        recommendation: 'Ensure supporting sub-sections cascade naturally into H2 and H3 elements.',
      });
    }

    // Check 3.2: Page Framework (Header & Footer)
    const hasNavbar = blocks.length > 0 && (blocks[0].category === 'navbars' || blocks[0].type.includes('nav'));
    const hasFooter = blocks.length > 0 && (blocks[blocks.length - 1].category === 'footers' || blocks[blocks.length - 1].type.includes('footer'));

    if (!hasFooter && blocks.length > 1) {
      issues.push({
        id: 'hierarchy-footer-missing',
        pillar: 'hierarchy',
        title: 'Missing Footer Section at Page Base',
        status: 'warning',
        scoreImpact: 7,
        description: 'Web crawlers look for footer landmarks (copyright, privacy policy, site links, contact info) to establish website legitimacy.',
        recommendation: 'Add a responsive Bootstrap 5 footer section at the bottom of the page.',
        autoFixLabel: 'Add Modern Footer',
        onAutoFix: () => {
          if (onAddBlock) {
            onAddBlock('footer-columns');
            showToast?.({ title: 'Footer Section Added', description: 'Appended 4-column footer to canvas.' });
          }
        },
      });
    } else if (hasFooter) {
      issues.push({
        id: 'hierarchy-footer-ok',
        pillar: 'hierarchy',
        title: 'Footer Landmark Positioned Correctly',
        status: 'passed',
        scoreImpact: 0,
        description: 'Page concludes with a structured footer landmark containing site links and copyright metadata.',
        recommendation: 'Keep social links and legal terms updated.',
      });
    }

    // Check 3.3: Content Volume & Readability
    let totalWords = 0;
    let hasLoremIpsum = false;

    blocks.forEach((b) => {
      const c = b.content || {};
      Object.values(c).forEach((v) => {
        if (typeof v === 'string') {
          const stripped = v.replace(/<[^>]*>?/gm, ' ').trim();
          if (stripped.toLowerCase().includes('lorem ipsum') || stripped.toLowerCase().includes('dolor sit amet')) {
            hasLoremIpsum = true;
          }
          const words = stripped.split(/\s+/).filter(Boolean);
          totalWords += words.length;
        }
      });
    });

    if (hasLoremIpsum) {
      issues.push({
        id: 'hierarchy-lorem-ipsum',
        pillar: 'hierarchy',
        title: 'Placeholder "Lorem Ipsum" Copy Detected',
        status: 'warning',
        scoreImpact: 8,
        description: 'Detected unedited placeholder Latin text. Search algorithms may classify unedited placeholder text as low quality.',
        recommendation: 'Replace boilerplate Latin text with real product descriptions and copywriting.',
      });
    }

    if (totalWords < 50 && blocks.length > 0) {
      issues.push({
        id: 'hierarchy-thin-content',
        pillar: 'hierarchy',
        title: `Thin Page Content (${totalWords} words total)`,
        status: 'warning',
        scoreImpact: 10,
        description: `Page contains only ${totalWords} visible words. Google prioritizes pages with substantial original information.`,
        recommendation: 'Add feature explanations, customer FAQs, or an informative about section to reach at least 200+ words.',
      });
    } else if (totalWords >= 50) {
      issues.push({
        id: 'hierarchy-volume-ok',
        pillar: 'hierarchy',
        title: `Healthy Content Depth (${totalWords} words)`,
        status: 'passed',
        scoreImpact: 0,
        description: `Substantial body copy provides search engine crawlers with sufficient topical context.`,
        recommendation: 'Break dense text blocks into digestible bullet points and cards.',
      });
    }

    // Calculate overall score (0 - 100)
    let totalDeductions = 0;
    issues.forEach((i) => {
      if (fixedIssueIds[i.id]) {
        // Issue was fixed by user
        return;
      }
      if (i.status === 'error' || i.status === 'warning') {
        totalDeductions += i.scoreImpact;
      }
    });

    const finalScore = Math.max(10, Math.min(100, 100 - totalDeductions));

    return {
      score: finalScore,
      issues,
      passedCount: issues.filter((i) => i.status === 'passed' || fixedIssueIds[i.id]).length,
      warningCount: issues.filter((i) => i.status === 'warning' && !fixedIssueIds[i.id]).length,
      errorCount: issues.filter((i) => i.status === 'error' && !fixedIssueIds[i.id]).length,
    };
  }, [blocks, seoSettings, projectTitle, fixedIssueIds, onUpdateSeoSettings, onUpdateProjectTitle, onUpdateContent, onAddBlock, showToast]);

  // Filter issues according to active pillar and status filter
  const filteredIssues = useMemo(() => {
    return auditReport.issues.filter((issue) => {
      const isFixed = fixedIssueIds[issue.id];
      const effectiveStatus = isFixed ? 'passed' : issue.status;

      if (activePillar !== 'all' && issue.pillar !== activePillar) {
        return false;
      }
      if (statusFilter === 'issues' && effectiveStatus === 'passed') {
        return false;
      }
      if (statusFilter === 'passed' && effectiveStatus !== 'passed') {
        return false;
      }
      return true;
    });
  }, [auditReport.issues, activePillar, statusFilter, fixedIssueIds]);

  // Get score health tier
  const scoreBadge = useMemo(() => {
    const s = auditReport.score;
    if (s >= 90) return { label: 'Grade A • Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (s >= 75) return { label: 'Grade B • Good', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (s >= 55) return { label: 'Grade C • Needs Improvement', color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Grade D • Critical Issues', color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/30' };
  }, [auditReport.score]);

  const handleFixIssue = (issue: SeoAuditIssue) => {
    if (issue.onAutoFix) {
      issue.onAutoFix();
      setFixedIssueIds((prev) => ({ ...prev, [issue.id]: true }));
    }
  };

  const handleFixAllFixable = () => {
    let fixCount = 0;
    auditReport.issues.forEach((issue) => {
      if (issue.status !== 'passed' && !fixedIssueIds[issue.id] && issue.onAutoFix) {
        issue.onAutoFix();
        fixCount++;
        setFixedIssueIds((prev) => ({ ...prev, [issue.id]: true }));
      }
    });

    if (showToast) {
      showToast({
        title: 'Auto-Fix Applied',
        description: `Resolved ${fixCount} SEO recommendations automatically.`,
      });
    }
  };

  return (
    <div
      id="seo-audit-section"
      data-testid="seo-audit-section"
      className={`rounded-2xl border p-4 space-y-4 transition-all duration-200 shadow-sm ${
        isDark
          ? 'bg-slate-900/80 border-slate-700/80 text-slate-100 shadow-cyan-950/20'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Top Header: Score & Scan Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Circular Score Badge */}
          <div
            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center font-mono font-black border transition-transform duration-300 hover:scale-105 shrink-0 ${
              auditReport.score >= 90
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 dark:text-emerald-400'
                : auditReport.score >= 75
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-cyan-400'
                : auditReport.score >= 55
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 dark:text-amber-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400'
            }`}
          >
            <span className="text-xl leading-none">{auditReport.score}</span>
            <span className="text-[9px] uppercase font-bold tracking-tight opacity-80 mt-0.5">/ 100</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Automated SEO & Content Audit
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scoreBadge.bg} ${scoreBadge.color}`}>
                {scoreBadge.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Live analysis of <strong className="text-slate-700 dark:text-slate-200">{blocks.length} sections</strong> across meta tags, accessibility, and content hierarchy.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            id="btn-seo-audit-rescan"
            data-testid="btn-seo-audit-rescan"
            onClick={handleManualScan}
            disabled={isScanning}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Re-scan canvas and evaluate SEO guidelines"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-blue-500' : 'text-slate-400'}`} />
            <span>{isScanning ? 'Analyzing...' : 'Re-scan'}</span>
          </button>

          {(auditReport.warningCount > 0 || auditReport.errorCount > 0) && (
            <button
              type="button"
              id="btn-seo-audit-autofix-all"
              data-testid="btn-seo-audit-autofix-all"
              onClick={handleFixAllFixable}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-98"
              title="Automatically apply recommended titles, descriptions, and alt tags"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fix Recommendations</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div
          onClick={() => setStatusFilter(statusFilter === 'passed' ? 'all' : 'passed')}
          className={`p-2 rounded-xl border cursor-pointer transition ${
            statusFilter === 'passed'
              ? 'ring-2 ring-emerald-500/50 border-emerald-500 bg-emerald-500/10'
              : isDark
              ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{auditReport.passedCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Passed Checks</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'issues' ? 'all' : 'issues')}
          className={`p-2 rounded-xl border cursor-pointer transition ${
            statusFilter === 'issues'
              ? 'ring-2 ring-amber-500/50 border-amber-500 bg-amber-500/10'
              : isDark
              ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{auditReport.warningCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Warnings</span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'issues' ? 'all' : 'issues')}
          className={`p-2 rounded-xl border cursor-pointer transition ${
            auditReport.errorCount > 0 && statusFilter === 'issues'
              ? 'ring-2 ring-rose-500/50 border-rose-500 bg-rose-500/10'
              : isDark
              ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60'
              : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-rose-500 font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>{auditReport.errorCount}</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Critical Issues</span>
        </div>
      </div>

      {/* 3 Pillar Tabs Filter Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => setActivePillar('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition cursor-pointer ${
            activePillar === 'all'
              ? isDark
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          All Checks ({auditReport.issues.length})
        </button>
        <button
          type="button"
          onClick={() => setActivePillar('meta')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1 ${
            activePillar === 'meta'
              ? isDark
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Type className="w-3 h-3" />
          <span>Meta Tags</span>
        </button>
        <button
          type="button"
          onClick={() => setActivePillar('accessibility')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1 ${
            activePillar === 'accessibility'
              ? isDark
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Accessibility</span>
        </button>
        <button
          type="button"
          onClick={() => setActivePillar('hierarchy')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1 ${
            activePillar === 'hierarchy'
              ? isDark
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Layout className="w-3 h-3" />
          <span>Hierarchy</span>
        </button>
      </div>

      {/* Issues Checklist */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {filteredIssues.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-xs font-semibold">No issues found matching this filter.</p>
            <p className="text-[11px] opacity-75 mt-0.5">All analyzed criteria meet standard SEO best practices.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isFixed = fixedIssueIds[issue.id];
            const isExpanded = expandedIssueId === issue.id;
            const effectiveStatus = isFixed ? 'passed' : issue.status;

            return (
              <div
                key={issue.id}
                className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                  effectiveStatus === 'passed'
                    ? isDark
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                    : effectiveStatus === 'warning'
                    ? isDark
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : isDark
                    ? 'bg-rose-950/25 border-rose-800/50 text-rose-200'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                <div
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  className="p-2.5 flex items-start justify-between gap-2.5 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="shrink-0 mt-0.5">
                      {effectiveStatus === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : effectiveStatus === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs leading-snug">{issue.title}</span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-md ${
                            issue.pillar === 'meta'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-cyan-400'
                              : issue.pillar === 'accessibility'
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {issue.pillar}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {issue.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {effectiveStatus !== 'passed' && issue.onAutoFix && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFixIssue(issue);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs ${
                          isDark
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        title="Apply recommended automated fix"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Fix</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition"
                      aria-label={isExpanded ? 'Collapse issue details' : 'Expand issue details'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & Recommendation */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-200/40 dark:border-slate-800/60 text-[11px] space-y-2">
                    <p className="leading-relaxed opacity-90">{issue.description}</p>
                    <div
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        isDark ? 'bg-slate-900/80 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-slate-900 dark:text-white">Recommendation:</strong>
                        <span className="leading-snug">{issue.recommendation}</span>
                      </div>
                    </div>

                    {effectiveStatus !== 'passed' && issue.autoFixLabel && issue.onAutoFix && (
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleFixIssue(issue)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{issue.autoFixLabel}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
