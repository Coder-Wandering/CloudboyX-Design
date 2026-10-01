import { BlockInstance, SeoSettings } from '../types';

export interface BlockComplexityInfo {
  id: string;
  name: string;
  type: string;
  category: string;
  wordCount: number;
  imageCount: number;
  complexity: 'low' | 'moderate' | 'high';
  complexityScore: number;
  reasons: string[];
}

export interface ProjectAnalytics {
  totalBlocks: number;
  totalWords: number;
  totalCharacters: number;
  estimatedReadingTimeMin: number;
  totalImages: number;
  categoryCounts: Record<string, number>;
  estimatedDomNodes: number;
  estimatedPageSizeBytes: number;
  performanceScore: number; // 0 - 100
  performanceGrade: 'A+' | 'A' | 'B' | 'C';
  estimatedFcpSec: number;
  estimatedLcpSec: number;
  blocksBreakdown: BlockComplexityInfo[];
  recommendations: {
    id: string;
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }[];
}

/**
 * Extract all textual content recursively from an arbitrary block content object
 */
export function extractTextStrings(value: any): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') {
    // Exclude URLs, base64 data, and hex colors
    const trimmed = value.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('rgb') ||
      trimmed.length === 0
    ) {
      return [];
    }
    // Strip HTML tags if present
    const clean = trimmed.replace(/<[^>]*>/g, ' ').trim();
    return clean ? [clean] : [];
  }
  if (typeof value === 'number') {
    return [value.toString()];
  }
  if (Array.isArray(value)) {
    return value.flatMap(extractTextStrings);
  }
  if (typeof value === 'object') {
    return Object.values(value).flatMap(extractTextStrings);
  }
  return [];
}

/**
 * Count total words from an array of strings
 */
export function countWords(strings: string[]): number {
  let count = 0;
  for (const str of strings) {
    const words = str.split(/\s+/).filter(Boolean);
    count += words.length;
  }
  return count;
}

/**
 * Count image references in block content and settings
 */
export function countImagesInBlock(block: BlockInstance): number {
  let images = 0;

  // Check background image in settings
  if (block.settings?.bgImage && block.settings.bgImage.trim()) {
    images++;
  }

  // Check URLs in content
  const checkValueForImages = (val: any) => {
    if (!val) return;
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (
        (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('data:image')) &&
        (lower.includes('image') ||
          lower.includes('unsplash') ||
          lower.includes('.png') ||
          lower.includes('.jpg') ||
          lower.includes('.jpeg') ||
          lower.includes('.webp') ||
          lower.includes('.svg') ||
          lower.includes('.gif'))
      ) {
        images++;
      }
    } else if (Array.isArray(val)) {
      val.forEach(checkValueForImages);
    } else if (typeof val === 'object') {
      Object.values(val).forEach(checkValueForImages);
    }
  };

  checkValueForImages(block.content);
  return images;
}

/**
 * Calculate complexity for an individual block
 */
export function analyzeBlockComplexity(block: BlockInstance): BlockComplexityInfo {
  const textStrings = extractTextStrings(block.content);
  const wordCount = countWords(textStrings);
  const imageCount = countImagesInBlock(block);
  const reasons: string[] = [];

  let score = 2; // base score

  // Category weight
  switch (block.category) {
    case 'pricing':
    case 'gallery':
    case 'forms':
      score += 5;
      reasons.push(`Interactive / multi-element ${block.category} module`);
      break;
    case 'features':
    case 'testimonials':
    case 'team':
      score += 4;
      reasons.push(`Structured grid collection (${block.category})`);
      break;
    case 'headers':
      score += 3;
      reasons.push('High-impact hero visual section');
      break;
    case 'navbars':
      if (block.type === 'navbar-megamenu') {
        score += 3;
        reasons.push('Enterprise multi-column mega menu dropdown navigation');
      } else {
        score += 1;
        reasons.push('Standard navigation layout');
      }
      break;
    case 'footers':
      score += 1;
      reasons.push('Standard footer layout');
      break;
    default:
      score += 2;
  }

  // Column complexity
  const cols = block.settings?.columns || 1;
  if (cols >= 4) {
    score += 3;
    reasons.push(`High density ${cols}-column grid`);
  } else if (cols >= 2) {
    score += 1;
    reasons.push(`${cols}-column responsive layout`);
  }

  // Layout template
  if (block.settings?.layoutTemplate === 'masonry' || block.settings?.layoutTemplate === 'zigzag') {
    score += 2;
    reasons.push(`Custom ${block.settings.layoutTemplate} layout structure`);
  }

  // Images
  if (imageCount > 2) {
    score += 3;
    reasons.push(`Multiple asset requests (${imageCount} images)`);
  } else if (imageCount > 0) {
    score += 1;
    reasons.push(`Media visual assets (${imageCount} image${imageCount > 1 ? 's' : ''})`);
  }

  // Text density
  if (wordCount > 150) {
    score += 2;
    reasons.push(`High content density (${wordCount} words)`);
  }

  // Determine label
  let complexity: 'low' | 'moderate' | 'high' = 'low';
  if (score >= 9) {
    complexity = 'high';
  } else if (score >= 5) {
    complexity = 'moderate';
  }

  return {
    id: block.id,
    name: block.name || block.type,
    type: block.type,
    category: block.category || 'content',
    wordCount,
    imageCount,
    complexity,
    complexityScore: score,
    reasons,
  };
}

/**
 * Estimate DOM elements generated by a block
 */
function estimateDomNodes(block: BlockInstance): number {
  let nodes = 10; // container, row, col, wrapper

  if (block.settings?.columns) {
    nodes += block.settings.columns * 8;
  }

  // Content items check
  if (Array.isArray(block.content?.items)) {
    nodes += block.content.items.length * 6;
  }
  if (Array.isArray(block.content?.features)) {
    nodes += block.content.features.length * 5;
  }
  if (Array.isArray(block.content?.tiers)) {
    nodes += block.content.tiers.length * 12;
  }

  if (block.settings?.showButtons) nodes += 3;
  if (block.settings?.showIcons) nodes += 4;
  if (block.settings?.showMedia) nodes += 4;

  return nodes;
}

/**
 * Compute project-wide statistics and performance estimations
 */
export function calculateProjectAnalytics(
  blocks: BlockInstance[],
  seoSettings?: SeoSettings
): ProjectAnalytics {
  const totalBlocks = blocks.length;
  const blocksBreakdown = blocks.map(analyzeBlockComplexity);

  // Category counts
  const categoryCounts: Record<string, number> = {};
  for (const b of blocks) {
    const cat = b.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // Word and character totals
  let totalWords = 0;
  let totalCharacters = 0;
  for (const b of blocks) {
    const textStrings = extractTextStrings(b.content);
    for (const s of textStrings) {
      totalWords += s.split(/\s+/).filter(Boolean).length;
      totalCharacters += s.length;
    }
  }

  const estimatedReadingTimeMin = Math.max(1, Math.ceil(totalWords / 200));

  // Images count
  const totalImages = blocksBreakdown.reduce((acc, curr) => acc + curr.imageCount, 0);

  // DOM nodes
  const estimatedDomNodes = blocks.reduce((acc, b) => acc + estimateDomNodes(b), 30); // 30 baseline for HTML, body, head, scripts

  // Estimated HTML & asset payload (in bytes)
  // Baseline: Bootstrap 5 CSS ~30KB gzipped, Bootstrap JS ~15KB gzipped, HTML template ~5-15KB
  const htmlSizeEstimate = 12000 + totalBlocks * 2200 + totalCharacters * 2;
  const estimatedPageSizeBytes = htmlSizeEstimate + totalImages * 85000; // ~85KB avg compressed image

  // Performance Score calculation
  // Base 100
  let perf = 100;

  // Penalty for excessive blocks (clean fast page has 3-7 blocks)
  if (totalBlocks > 5) {
    perf -= (totalBlocks - 5) * 1.5;
  }

  // Penalty for high cumulative complexity score
  const totalComplexity = blocksBreakdown.reduce((acc, curr) => acc + curr.complexityScore, 0);
  perf -= Math.min(18, totalComplexity * 0.45);

  // Penalty for excessive external images
  if (totalImages > 4) {
    perf -= Math.min(12, (totalImages - 4) * 2);
  }

  // Penalty for massive DOM nodes
  if (estimatedDomNodes > 250) {
    perf -= Math.min(10, ((estimatedDomNodes - 250) / 50) * 2);
  }

  // Clamp performance score between 55 and 99 (or 100 for ideal minimal pages)
  const performanceScore = Math.max(55, Math.min(100, Math.round(perf)));

  // Performance Grade
  let performanceGrade: 'A+' | 'A' | 'B' | 'C' = 'A+';
  if (performanceScore >= 95) {
    performanceGrade = 'A+';
  } else if (performanceScore >= 85) {
    performanceGrade = 'A';
  } else if (performanceScore >= 72) {
    performanceGrade = 'B';
  } else {
    performanceGrade = 'C';
  }

  // Estimated Paint Metrics
  // FCP ranges from 0.35s to 1.4s
  const estimatedFcpSec = +(0.35 + (100 - performanceScore) * 0.009).toFixed(2);
  // LCP ranges from 0.6s to 2.4s
  const estimatedLcpSec = +(0.65 + (100 - performanceScore) * 0.018 + totalImages * 0.05).toFixed(2);

  // Generate actionable recommendations
  const recommendations: ProjectAnalytics['recommendations'] = [];

  if (totalBlocks === 0) {
    recommendations.push({
      id: 'no-blocks',
      type: 'warning',
      title: 'No Blocks Added Yet',
      description: 'Add sections from the Blocks tab to build your landing page and analyze live metrics.',
    });
  } else {
    recommendations.push({
      id: 'cdn-boost',
      type: 'success',
      title: 'Bootstrap 5.3 CDN Acceleration',
      description: 'Core styles and grid utilities load from high-speed edge CDN with zero JavaScript dependencies.',
    });

    if (totalWords < 80) {
      recommendations.push({
        id: 'low-word-count',
        type: 'warning',
        title: 'Light Text Content (< 80 words)',
        description: 'Consider expanding feature descriptions and value propositions to improve search engine relevance.',
      });
    } else if (totalWords > 800) {
      recommendations.push({
        id: 'high-word-count',
        type: 'info',
        title: 'Comprehensive Content Depth',
        description: `${totalWords} words provides thorough search indexability and strong topic authority.`,
      });
    }

    if (totalImages > 8) {
      recommendations.push({
        id: 'high-image-count',
        type: 'warning',
        title: 'High Image Count Detected',
        description: `${totalImages} visual assets found. Ensure images use responsive WebP/SVG formats with lazy loading.`,
      });
    } else if (totalImages >= 1) {
      recommendations.push({
        id: 'good-media-ratio',
        type: 'success',
        title: 'Balanced Visual Media',
        description: 'Page maintains a healthy text-to-image ratio with low overhead for mobile networks.',
      });
    }

    // SEO checks
    if (seoSettings) {
      const titleLen = seoSettings.title?.trim().length || 0;
      if (titleLen >= 30 && titleLen <= 60) {
        recommendations.push({
          id: 'title-optimal',
          type: 'success',
          title: 'Optimal Title Tag Length',
          description: `Page title is ${titleLen} characters, perfectly within the Google SERP 30-60 character window.`,
        });
      } else if (titleLen === 0) {
        recommendations.push({
          id: 'title-missing',
          type: 'warning',
          title: 'Missing Custom Page Title',
          description: 'Set a descriptive title under the SEO & Metadata tab for better search engine ranking.',
        });
      }

      const descLen = seoSettings.description?.trim().length || 0;
      if (descLen >= 80 && descLen <= 160) {
        recommendations.push({
          id: 'desc-optimal',
          type: 'success',
          title: 'Optimal Meta Description',
          description: `Description is ${descLen} characters, fully visible on mobile and desktop search snippets.`,
        });
      }
    }
  }

  return {
    totalBlocks,
    totalWords,
    totalCharacters,
    estimatedReadingTimeMin,
    totalImages,
    categoryCounts,
    estimatedDomNodes,
    estimatedPageSizeBytes,
    performanceScore,
    performanceGrade,
    estimatedFcpSec,
    estimatedLcpSec,
    blocksBreakdown,
    recommendations,
  };
}
