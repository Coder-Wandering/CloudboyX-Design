import { BlockInstance, BlockSettings, SiteTheme } from '../types';

export type VerticalRhythmThemeMode = 'auto' | 'spacious' | 'balanced' | 'compact';

export interface VerticalSpacingCalculation {
  marginBottom: number; // 0 to 5 (mapped to mb-0 through mb-5)
  reason: string;
  rule: string;
  themeModeApplied: 'spacious' | 'balanced' | 'compact';
}

export interface VerticalRhythmResult {
  updatedBlocks: BlockInstance[];
  changesCount: number;
  details: Array<{
    blockId: string;
    blockName: string;
    oldMb: number;
    newMb: number;
    reason: string;
    rule: string;
  }>;
}

const STORAGE_AUTO_RHYTHM_KEY = 'cloudboyx_auto_vertical_rhythm';
const STORAGE_RHYTHM_MODE_KEY = 'cloudboyx_vertical_rhythm_mode';

/**
 * Check if auto vertical rhythm on block reorder is enabled
 */
export function isAutoVerticalRhythmEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_AUTO_RHYTHM_KEY);
    if (val === null) return true; // Default ON
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set auto vertical rhythm preference in localStorage
 */
export function setAutoVerticalRhythmEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_AUTO_RHYTHM_KEY, String(enabled));
  } catch {
    // ignore
  }
}

/**
 * Get preferred rhythm style ('auto' | 'spacious' | 'balanced' | 'compact')
 */
export function getVerticalRhythmThemeMode(): VerticalRhythmThemeMode {
  try {
    const val = localStorage.getItem(STORAGE_RHYTHM_MODE_KEY);
    if (val === 'spacious' || val === 'balanced' || val === 'compact') {
      return val;
    }
  } catch {
    // ignore
  }
  return 'auto';
}

/**
 * Set preferred rhythm style in localStorage
 */
export function setVerticalRhythmThemeMode(mode: VerticalRhythmThemeMode): void {
  try {
    localStorage.setItem(STORAGE_RHYTHM_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

/**
 * Resolve effective spacing scale ('spacious', 'balanced', 'compact')
 * based on active theme characteristics (button style, typography, and color mode)
 */
export function resolveThemeRhythmScale(
  theme?: Partial<SiteTheme>,
  overrideMode?: VerticalRhythmThemeMode
): 'spacious' | 'balanced' | 'compact' {
  const mode = overrideMode || getVerticalRhythmThemeMode();
  if (mode !== 'auto') {
    return mode;
  }

  if (!theme) return 'balanced';

  // 1. Editorial / Display typography prefers spacious breathing room
  const font = (theme.fontFamily || '').toLowerCase();
  const headingFont = (theme.headingFontFamily || '').toLowerCase();
  const isEditorialOrDisplay =
    font.includes('playfair') ||
    font.includes('syne') ||
    headingFont.includes('playfair') ||
    headingFont.includes('space grotesk');

  if (isEditorialOrDisplay) {
    return 'spacious';
  }

  // 2. Button style: 'rounded-0' is architectural / brutalist / high-utility -> compact / crisp
  if (theme.buttonStyle === 'rounded-0') {
    return 'compact';
  }

  // 3. Rounded pill with modern SaaS fonts favors generous breathing rhythm
  if (theme.buttonStyle === 'rounded-pill') {
    return 'spacious';
  }

  return 'balanced';
}

/**
 * Check if two adjacent blocks have identical background fills
 */
function hasIdenticalBackground(a: BlockInstance, b: BlockInstance): boolean {
  const aSettings = (a.settings || {}) as Partial<BlockSettings> & Record<string, any>;
  const bSettings = (b.settings || {}) as Partial<BlockSettings> & Record<string, any>;

  // If both are custom images or gradients, they aren't identical solid fills
  if (aSettings.bgType === 'image' || bSettings.bgType === 'image') return false;
  if (aSettings.bgType === 'gradient' || bSettings.bgType === 'gradient') return false;

  const aColor = (aSettings.backgroundColor || aSettings.bgColor || '').toLowerCase().trim();
  const bColor = (bSettings.backgroundColor || bSettings.bgColor || '').toLowerCase().trim();

  if (aColor && bColor && aColor === bColor) {
    return true;
  }

  // Check darkSection flags
  if (aSettings.darkSection && bSettings.darkSection) {
    return true;
  }

  return false;
}

/**
 * Automatically calculates the logical margin-bottom (0-5) for a block
 * positioned before nextBlock within the context of current theme and index.
 */
export function calculateBlockMarginBottom(
  currentBlock: BlockInstance,
  nextBlock: BlockInstance | null,
  theme: SiteTheme,
  index: number,
  totalBlocks: number
): VerticalSpacingCalculation {
  const rhythmScale = resolveThemeRhythmScale(theme);
  const currentCategory = currentBlock.category;
  const currentSettings = (currentBlock.settings || {}) as Partial<BlockSettings> & Record<string, any>;

  // RULE 1: Terminal block at the bottom of the page
  // The last section must NEVER have margin-bottom, avoiding dead space below the page.
  if (!nextBlock || index === totalBlocks - 1) {
    return {
      marginBottom: 0,
      reason: 'Page terminal block: mb-0 prevents trailing dead space at the bottom of the page.',
      rule: 'terminal_block_flush',
      themeModeApplied: rhythmScale,
    };
  }

  const nextCategory = nextBlock.category;
  const nextSettings = (nextBlock.settings || {}) as Partial<BlockSettings> & Record<string, any>;

  // RULE 2: Navigation bars
  // A navbar sits flush against the subsequent hero or content section.
  if (currentCategory === 'navbars' || currentBlock.type.includes('navbar')) {
    return {
      marginBottom: 0,
      reason: 'Navigation bar: mb-0 attaches directly to the following header/hero section without a seam.',
      rule: 'navbar_flush',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 3: Preceding a footer
  // The section directly before a footer should transition cleanly into the page footer.
  if (nextCategory === 'footers' || nextBlock.type.includes('footer')) {
    const isContainedCard =
      currentSettings.containerWidth === 'container' &&
      (currentSettings.cardShadow || (currentSettings.shadow && currentSettings.shadow !== 'shadow-none'));

    if (isContainedCard) {
      const mb = rhythmScale === 'spacious' ? 4 : 3;
      return {
        marginBottom: mb,
        reason: `Elevated card above footer: mb-${mb} provides clean physical elevation before the footer baseline.`,
        rule: 'card_above_footer',
        themeModeApplied: rhythmScale,
      };
    }

    return {
      marginBottom: 0,
      reason: 'Section above footer: mb-0 delivers a flush, unified transition into the site footer.',
      rule: 'preceding_footer_flush',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 4: Dividers (current is a divider or next is a divider)
  if (currentCategory === 'dividers' || currentBlock.type.includes('divider')) {
    const mb = rhythmScale === 'compact' ? 1 : 2;
    return {
      marginBottom: mb,
      reason: `Section divider: mb-${mb} preserves tight, rhythmic horizontal separation.`,
      rule: 'divider_compact',
      themeModeApplied: rhythmScale,
    };
  }

  if (nextCategory === 'dividers' || nextBlock.type.includes('divider')) {
    const mb = rhythmScale === 'compact' ? 1 : 2;
    return {
      marginBottom: mb,
      reason: `Preceding divider: mb-${mb} centers whitespace neatly before the visual rule.`,
      rule: 'preceding_divider',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 5: Continuous background fills across adjacent sections
  // If two consecutive full-bleed sections share the same background, extra margin-bottom
  // exposes the body tag background in an awkward stripe. Section padding (py-5) handles rhythm.
  const isContinuous = hasIdenticalBackground(currentBlock, nextBlock);
  const isCurrentFluid = currentSettings.containerWidth !== 'container';
  const isNextFluid = nextSettings.containerWidth !== 'container';

  if (isContinuous && isCurrentFluid && isNextFluid) {
    return {
      marginBottom: 0,
      reason: 'Matching continuous background: mb-0 prevents body seams, letting internal padding (py-5) establish rhythm.',
      rule: 'continuous_background_flush',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 6: Contained floating cards with elevation
  const hasCardElevation =
    currentSettings.containerWidth === 'container' &&
    (currentSettings.cardShadow || (currentSettings.shadow && currentSettings.shadow !== 'shadow-none'));

  if (hasCardElevation) {
    const mb = rhythmScale === 'spacious' ? 5 : rhythmScale === 'compact' ? 3 : 4;
    return {
      marginBottom: mb,
      reason: `Elevated container card: mb-${mb} provides distinct vertical drop clearance over the following section.`,
      rule: 'elevated_card_clearance',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 7: Media Carousel & Rich Showcase Galleries
  // High-density visual blocks (interactive video sliders, galleries) need distinct breathing room
  if (
    currentCategory === 'gallery' ||
    currentBlock.type === 'media-carousel' ||
    currentBlock.type.includes('carousel') ||
    currentBlock.type.includes('gallery')
  ) {
    const mb = rhythmScale === 'spacious' ? 5 : rhythmScale === 'compact' ? 3 : 4;
    return {
      marginBottom: mb,
      reason: `Rich media showcase / carousel: mb-${mb} prevents high-density visual media from crowding text below.`,
      rule: 'media_carousel_clearance',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 8: Hero / Headers leading into Features or Content
  if (currentCategory === 'headers' || currentBlock.type.includes('hero') || currentBlock.type.includes('header')) {
    if (nextCategory === 'features' || nextCategory === 'content') {
      const mb = rhythmScale === 'spacious' ? 5 : rhythmScale === 'compact' ? 3 : 4;
      return {
        marginBottom: mb,
        reason: `Hero header into ${nextCategory}: mb-${mb} establishes strong visual hierarchy and breathing room.`,
        rule: 'hero_to_features',
        themeModeApplied: rhythmScale,
      };
    }
  }

  // RULE 9: High-Impact Decision Blocks (Pricing, Forms, Contact)
  if (currentCategory === 'pricing' || currentBlock.type.includes('pricing')) {
    const mb = rhythmScale === 'spacious' ? 5 : rhythmScale === 'compact' ? 3 : 4;
    return {
      marginBottom: mb,
      reason: `Pricing decision block: mb-${mb} isolates key conversion choices with deliberate vertical space.`,
      rule: 'pricing_decision_space',
      themeModeApplied: rhythmScale,
    };
  }

  if (currentCategory === 'forms' || currentBlock.type.includes('form') || currentBlock.type.includes('contact')) {
    const mb = rhythmScale === 'spacious' ? 5 : rhythmScale === 'compact' ? 3 : 4;
    return {
      marginBottom: mb,
      reason: `Lead capture / form: mb-${mb} gives inputs and submission buttons distinct breathing room.`,
      rule: 'form_lead_space',
      themeModeApplied: rhythmScale,
    };
  }

  // RULE 10: Standard vertical rhythm between consecutive body sections
  // Based on active theme rhythm scale
  let standardMb = 3;
  if (rhythmScale === 'spacious') {
    standardMb = 4;
  } else if (rhythmScale === 'compact') {
    standardMb = 2;
  } else {
    standardMb = 3;
  }

  return {
    marginBottom: standardMb,
    reason: `Standard ${rhythmScale} theme rhythm: mb-${standardMb} maintains clean vertical pacing across sections.`,
    rule: 'standard_theme_rhythm',
    themeModeApplied: rhythmScale,
  };
}

/**
 * Applies logical margin-bottom spacing across all blocks in the array.
 * Returns the updated blocks, count of modified blocks, and detailed diagnostic logs.
 */
export function applyLogicalVerticalRhythm(
  blocks: BlockInstance[],
  theme: SiteTheme
): VerticalRhythmResult {
  if (!blocks || blocks.length === 0) {
    return { updatedBlocks: [], changesCount: 0, details: [] };
  }

  const details: VerticalRhythmResult['details'] = [];
  let changesCount = 0;

  const updatedBlocks = blocks.map((block, index) => {
    const nextBlock = index < blocks.length - 1 ? blocks[index + 1] : null;
    const calc = calculateBlockMarginBottom(block, nextBlock, theme, index, blocks.length);
    const oldMb = typeof block.settings?.marginBottom === 'number' ? block.settings.marginBottom : 0;

    if (oldMb !== calc.marginBottom) {
      changesCount++;
      details.push({
        blockId: block.id,
        blockName: block.name,
        oldMb,
        newMb: calc.marginBottom,
        reason: calc.reason,
        rule: calc.rule,
      });

      return {
        ...block,
        settings: {
          ...block.settings,
          marginBottom: calc.marginBottom,
        },
      };
    }

    return block;
  });

  return {
    updatedBlocks,
    changesCount,
    details,
  };
}
