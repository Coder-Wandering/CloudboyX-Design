/**
 * cssLinter.ts
 * Real-time lightweight CSS syntax and Bootstrap 5 class usage linter.
 * Zero-dependency, fast AST-free tokenizer for instant client-side feedback.
 */

export type LintSeverity = 'error' | 'warning' | 'info';

export interface CssLintIssue {
  id: string;
  line: number; // 1-based
  column?: number;
  message: string;
  severity: LintSeverity;
  rule:
    | 'unclosed-comment'
    | 'unclosed-string'
    | 'unbalanced-braces'
    | 'missing-semicolon'
    | 'missing-colon'
    | 'empty-value'
    | 'invalid-selector'
    | 'unknown-property'
    | 'invalid-unit'
    | 'unclosed-function'
    | 'bootstrap-legacy-class'
    | 'bootstrap-typo'
    | 'unscoped-selector';
  suggestedFix?: {
    label: string;
    applyFix: (currentCss: string) => string;
  };
  snippet?: string;
}

// Well-known valid CSS properties (including vendor prefixes and modern CSS)
const VALID_CSS_PROPERTIES = new Set<string>([
  'accent-color', 'align-content', 'align-items', 'align-self', 'all', 'animation',
  'animation-composition', 'animation-delay', 'animation-direction', 'animation-duration',
  'animation-fill-mode', 'animation-iteration-count', 'animation-name', 'animation-play-state',
  'animation-timeline', 'animation-timing-function', 'appearance', 'aspect-ratio', 'backdrop-filter',
  'backface-visibility', 'background', 'background-attachment', 'background-blend-mode',
  'background-clip', 'background-color', 'background-image', 'background-origin',
  'background-position', 'background-position-x', 'background-position-y', 'background-repeat',
  'background-size', 'block-size', 'border', 'border-block', 'border-block-color',
  'border-block-end', 'border-block-end-color', 'border-block-end-style', 'border-block-end-width',
  'border-block-start', 'border-block-start-color', 'border-block-start-style', 'border-block-start-width',
  'border-block-style', 'border-block-width', 'border-bottom', 'border-bottom-color',
  'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width',
  'border-collapse', 'border-color', 'border-end-end-radius', 'border-end-start-radius',
  'border-image', 'border-image-outset', 'border-image-repeat', 'border-image-slice',
  'border-image-source', 'border-image-width', 'border-inline', 'border-inline-color',
  'border-inline-end', 'border-inline-end-color', 'border-inline-end-style', 'border-inline-end-width',
  'border-inline-start', 'border-inline-start-color', 'border-inline-start-style', 'border-inline-start-width',
  'border-inline-style', 'border-inline-width', 'border-left', 'border-left-color',
  'border-left-style', 'border-left-width', 'border-radius', 'border-right', 'border-right-color',
  'border-right-style', 'border-right-width', 'border-spacing', 'border-start-end-radius',
  'border-start-start-radius', 'border-style', 'border-top', 'border-top-color',
  'border-top-left-radius', 'border-top-right-radius', 'border-top-style', 'border-top-width',
  'border-width', 'bottom', 'box-decoration-break', 'box-shadow', 'box-sizing',
  'break-after', 'break-before', 'break-inside', 'caption-side', 'caret-color', 'clear',
  'clip', 'clip-path', 'color', 'color-scheme', 'column-count', 'column-fill', 'column-gap',
  'column-rule', 'column-rule-color', 'column-rule-style', 'column-rule-width', 'column-span',
  'column-width', 'columns', 'contain', 'contain-intrinsic-size', 'content', 'content-visibility',
  'counter-increment', 'counter-reset', 'counter-set', 'cursor', 'direction', 'display',
  'empty-cells', 'filter', 'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow',
  'flex-shrink', 'flex-wrap', 'float', 'font', 'font-family', 'font-feature-settings',
  'font-kerning', 'font-optical-sizing', 'font-palette', 'font-size', 'font-size-adjust',
  'font-stretch', 'font-style', 'font-synthesis', 'font-variant', 'font-variant-alternates',
  'font-variant-caps', 'font-variant-east-asian', 'font-variant-ligatures', 'font-variant-numeric',
  'font-variant-position', 'font-variation-settings', 'font-weight', 'forced-color-adjust',
  'gap', 'grid', 'grid-area', 'grid-auto-columns', 'grid-auto-flow', 'grid-auto-rows',
  'grid-column', 'grid-column-end', 'grid-column-start', 'grid-row', 'grid-row-end',
  'grid-row-start', 'grid-template', 'grid-template-areas', 'grid-template-columns',
  'grid-template-rows', 'hanging-punctuation', 'height', 'hyphenate-character', 'hyphens',
  'image-orientation', 'image-rendering', 'image-resolution', 'inline-size', 'inset',
  'inset-block', 'inset-block-end', 'inset-block-start', 'inset-inline', 'inset-inline-end',
  'inset-inline-start', 'isolation', 'justify-content', 'justify-items', 'justify-self',
  'left', 'letter-spacing', 'line-break', 'line-height', 'list-style', 'list-style-image',
  'list-style-position', 'list-style-type', 'margin', 'margin-block', 'margin-block-end',
  'margin-block-start', 'margin-bottom', 'margin-inline', 'margin-inline-end', 'margin-inline-start',
  'margin-left', 'margin-right', 'margin-top', 'mask', 'mask-clip', 'mask-composite',
  'mask-image', 'mask-mode', 'mask-origin', 'mask-position', 'mask-repeat', 'mask-size',
  'mask-type', 'math-depth', 'math-style', 'max-block-size', 'max-height', 'max-inline-size',
  'max-width', 'min-block-size', 'min-height', 'min-inline-size', 'min-width', 'mix-blend-mode',
  'object-fit', 'object-position', 'offset', 'offset-anchor', 'offset-distance', 'offset-path',
  'offset-rotate', 'opacity', 'order', 'orphans', 'outline', 'outline-color', 'outline-offset',
  'outline-style', 'outline-width', 'overflow', 'overflow-anchor', 'overflow-block',
  'overflow-clip-margin', 'overflow-inline', 'overflow-wrap', 'overflow-x', 'overflow-y',
  'overscroll-behavior', 'overscroll-behavior-block', 'overscroll-behavior-inline',
  'overscroll-behavior-x', 'overscroll-behavior-y', 'padding', 'padding-block',
  'padding-block-end', 'padding-block-start', 'padding-bottom', 'padding-inline',
  'padding-inline-end', 'padding-inline-start', 'padding-left', 'padding-right', 'padding-top',
  'page-break-after', 'page-break-before', 'page-break-inside', 'perspective',
  'perspective-origin', 'place-content', 'place-items', 'place-self', 'pointer-events',
  'position', 'print-color-adjust', 'quotes', 'resize', 'right', 'rotate', 'row-gap',
  'ruby-align', 'ruby-position', 'scale', 'scroll-behavior', 'scroll-margin',
  'scroll-margin-block', 'scroll-margin-block-end', 'scroll-margin-block-start',
  'scroll-margin-bottom', 'scroll-margin-inline', 'scroll-margin-inline-end',
  'scroll-margin-inline-start', 'scroll-margin-left', 'scroll-margin-right', 'scroll-margin-top',
  'scroll-padding', 'scroll-padding-block', 'scroll-padding-block-end', 'scroll-padding-block-start',
  'scroll-padding-bottom', 'scroll-padding-inline', 'scroll-padding-inline-end',
  'scroll-padding-inline-start', 'scroll-padding-left', 'scroll-padding-right', 'scroll-padding-top',
  'scroll-snap-align', 'scroll-snap-stop', 'scroll-snap-type', 'scroll-timeline',
  'scrollbar-color', 'scrollbar-gutter', 'scrollbar-width', 'shape-image-threshold',
  'shape-margin', 'shape-outside', 'tab-size', 'table-layout', 'text-align', 'text-align-last',
  'text-combine-upright', 'text-decoration', 'text-decoration-color', 'text-decoration-line',
  'text-decoration-skip-ink', 'text-decoration-style', 'text-decoration-thickness',
  'text-emphasis', 'text-emphasis-color', 'text-emphasis-position', 'text-emphasis-style',
  'text-indent', 'text-justify', 'text-orientation', 'text-overflow', 'text-rendering',
  'text-shadow', 'text-size-adjust', 'text-transform', 'text-underline-offset',
  'text-underline-position', 'top', 'touch-action', 'transform', 'transform-box',
  'transform-origin', 'transform-style', 'transition', 'transition-delay', 'transition-duration',
  'transition-property', 'transition-timing-function', 'translate', 'unicode-bidi',
  'user-select', 'vertical-align', 'visibility', 'white-space', 'widows', 'width',
  'will-change', 'word-break', 'word-spacing', 'writing-mode', 'z-index',
  // Common -webkit and -moz prefixes
  '-webkit-background-clip', '-webkit-text-fill-color', '-webkit-text-stroke',
  '-webkit-box-orient', '-webkit-line-clamp', '-webkit-backdrop-filter', '-webkit-appearance',
  '-webkit-overflow-scrolling', '-webkit-mask-image', '-webkit-font-smoothing',
  '-moz-osx-font-smoothing', '-moz-appearance',
]);

// Common typos mapped to valid properties
const COMMON_PROPERTY_TYPOS: Record<string, string> = {
  'colr': 'color',
  'colour': 'color',
  'clor': 'color',
  'bacground': 'background',
  'backgroud': 'background',
  'backround': 'background',
  'bg-color': 'background-color',
  'bg': 'background',
  'pading': 'padding',
  'paddng': 'padding',
  'pad': 'padding',
  'margn': 'margin',
  'mragin': 'margin',
  'heigth': 'height',
  'hieght': 'height',
  'widht': 'width',
  'widh': 'width',
  'zindex': 'z-index',
  'z-indx': 'z-index',
  'disply': 'display',
  'display-mode': 'display',
  'align-item': 'align-items',
  'alignitems': 'align-items',
  'justify-contnet': 'justify-content',
  'justifycontent': 'justify-content',
  'border-radus': 'border-radius',
  'borderradius': 'border-radius',
  'radus': 'border-radius',
  'font-famly': 'font-family',
  'fontfamily': 'font-family',
  'font-siz': 'font-size',
  'fontsize': 'font-size',
  'font-weigth': 'font-weight',
  'fontweight': 'font-weight',
  'text-algn': 'text-align',
  'textalign': 'text-align',
  'transfrom': 'transform',
  'tranform': 'transform',
  'transitio': 'transition',
  'transiton': 'transition',
  'boxshadow': 'box-shadow',
  'textshadow': 'text-shadow',
  'opctiy': 'opacity',
  'opcity': 'opacity',
  'postition': 'position',
  'positin': 'position',
  'overlfow': 'overflow',
  'cursor-pointer': 'cursor: pointer',
};

// Bootstrap 4 / legacy classes mapped to Bootstrap 5 modern classes
interface BootstrapLegacyMapping {
  pattern: RegExp;
  describe: string;
  replacement: (match: string) => string;
}

const BOOTSTRAP_LEGACY_MAPPINGS: BootstrapLegacyMapping[] = [
  {
    pattern: /\bml-([0-5]|auto)\b/g,
    describe: 'Bootstrap 5 renamed left margin to margin-start: use .ms-* instead of .ml-*',
    replacement: (m) => m.replace(/^ml-/, 'ms-'),
  },
  {
    pattern: /\bmr-([0-5]|auto)\b/g,
    describe: 'Bootstrap 5 renamed right margin to margin-end: use .me-* instead of .mr-*',
    replacement: (m) => m.replace(/^mr-/, 'me-'),
  },
  {
    pattern: /\bpl-([0-5]|auto)\b/g,
    describe: 'Bootstrap 5 renamed left padding to padding-start: use .ps-* instead of .pl-*',
    replacement: (m) => m.replace(/^pl-/, 'ps-'),
  },
  {
    pattern: /\bpr-([0-5]|auto)\b/g,
    describe: 'Bootstrap 5 renamed right padding to padding-end: use .pe-* instead of .pr-*',
    replacement: (m) => m.replace(/^pr-/, 'pe-'),
  },
  {
    pattern: /\btext-left\b/g,
    describe: 'Bootstrap 5 renamed .text-left to RTL-friendly .text-start',
    replacement: () => 'text-start',
  },
  {
    pattern: /\btext-right\b/g,
    describe: 'Bootstrap 5 renamed .text-right to RTL-friendly .text-end',
    replacement: () => 'text-end',
  },
  {
    pattern: /\bfloat-left\b/g,
    describe: 'Bootstrap 5 renamed .float-left to .float-start',
    replacement: () => 'float-start',
  },
  {
    pattern: /\bfloat-right\b/g,
    describe: 'Bootstrap 5 renamed .float-right to .float-end',
    replacement: () => 'float-end',
  },
  {
    pattern: /\bfont-weight-(bold|bolder|semibold|normal|light|lighter)\b/g,
    describe: 'Bootstrap 5 shortened font-weight classes: use .fw-* instead of .font-weight-*',
    replacement: (m) => m.replace(/^font-weight-/, 'fw-'),
  },
  {
    pattern: /\bfont-italic\b/g,
    describe: 'Bootstrap 5 renamed .font-italic to .fst-italic',
    replacement: () => 'fst-italic',
  },
  {
    pattern: /\bbadge-pill\b/g,
    describe: 'Bootstrap 5 replaced .badge-pill with standard .rounded-pill utility',
    replacement: () => 'rounded-pill',
  },
  {
    pattern: /\bbadge-(primary|secondary|success|danger|warning|info|light|dark)\b/g,
    describe: 'Bootstrap 5 replaced .badge-* contextual classes with .text-bg-* or .bg-*',
    replacement: (m) => m.replace(/^badge-/, 'text-bg-'),
  },
  {
    pattern: /\bno-gutters\b/g,
    describe: 'Bootstrap 5 replaced .no-gutters with gutter utility .g-0',
    replacement: () => 'g-0',
  },
  {
    pattern: /\bform-row\b/g,
    describe: 'Bootstrap 5 dropped .form-row; use .row.g-2 or .row.g-3 instead',
    replacement: () => 'row g-3',
  },
  {
    pattern: /\bcustom-select\b/g,
    describe: 'Bootstrap 5 unified custom selects into .form-select',
    replacement: () => 'form-select',
  },
  {
    pattern: /\bcustom-control\b/g,
    describe: 'Bootstrap 5 replaced .custom-control with .form-check',
    replacement: () => 'form-check',
  },
  {
    pattern: /\bcustom-switch\b/g,
    describe: 'Bootstrap 5 replaced .custom-switch with .form-check.form-switch',
    replacement: () => 'form-switch',
  },
  {
    pattern: /\bclose\b/g,
    describe: 'Bootstrap 5 renamed generic .close button to .btn-close',
    replacement: () => 'btn-close',
  },
  {
    pattern: /\bmedia(-body)?\b/g,
    describe: 'Bootstrap 5 dropped .media component; use flex utilities (.d-flex, .flex-shrink-0) instead',
    replacement: () => 'd-flex',
  },
  {
    pattern: /\bborder-(left|right)\b/g,
    describe: 'Bootstrap 5 renamed directional borders: use .border-start or .border-end',
    replacement: (m) => (m === 'border-left' ? 'border-start' : 'border-end'),
  },
  {
    pattern: /\brounded-(left|right)\b/g,
    describe: 'Bootstrap 5 renamed directional radius: use .rounded-start or .rounded-end',
    replacement: (m) => (m === 'rounded-left' ? 'rounded-start' : 'rounded-end'),
  },
  {
    pattern: /\bcol-xs-([0-9]{1,2})\b/g,
    describe: 'In Bootstrap 5, base tier does not use "xs": use .col-* instead of .col-xs-*',
    replacement: (m) => m.replace(/^col-xs-/, 'col-'),
  },
];

/**
 * Main real-time CSS linter function
 */
export function lintCustomCss(rawCss: string, blockId?: string): CssLintIssue[] {
  const issues: CssLintIssue[] = [];
  if (!rawCss || rawCss.trim() === '') {
    return issues;
  }

  const lines = rawCss.split('\n');

  // 1. Check for unclosed comments across the file
  let inComment = false;
  let commentStartLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let pos = 0;

    while (pos < line.length) {
      if (!inComment) {
        const commentOpen = line.indexOf('/*', pos);
        if (commentOpen !== -1) {
          inComment = true;
          commentStartLine = i + 1;
          pos = commentOpen + 2;
        } else {
          break;
        }
      } else {
        const commentClose = line.indexOf('*/', pos);
        if (commentClose !== -1) {
          inComment = false;
          pos = commentClose + 2;
        } else {
          break;
        }
      }
    }
  }

  if (inComment) {
    issues.push({
      id: `unclosed-comment-${commentStartLine}`,
      line: commentStartLine,
      message: `Unclosed CSS comment starting on line ${commentStartLine}. Add "*/" to close it.`,
      severity: 'error',
      rule: 'unclosed-comment',
      suggestedFix: {
        label: 'Close comment with "*/"',
        applyFix: (css) => css.trimEnd() + ' */',
      },
    });
  }

  // 2. Check for overall brace balance
  let openBraces = 0;
  let closeBraces = 0;
  for (let i = 0; i < lines.length; i++) {
    const cleanLine = stripComments(lines[i]);
    for (const ch of cleanLine) {
      if (ch === '{') openBraces++;
      if (ch === '}') closeBraces++;
    }
  }

  if (openBraces > closeBraces) {
    const diff = openBraces - closeBraces;
    issues.push({
      id: 'unbalanced-braces-missing-close',
      line: lines.length,
      message: `Missing ${diff} closing brace${diff > 1 ? 's' : ''} ("}"). Rules may not apply properly.`,
      severity: 'error',
      rule: 'unbalanced-braces',
      suggestedFix: {
        label: `Append ${diff} closing brace${diff > 1 ? 's' : ''}`,
        applyFix: (css) => css.trimEnd() + '\n' + '}'.repeat(diff),
      },
    });
  } else if (closeBraces > openBraces) {
    const diff = closeBraces - openBraces;
    issues.push({
      id: 'unbalanced-braces-extra-close',
      line: lines.length,
      message: `Found ${diff} unexpected extra closing brace${diff > 1 ? 's' : ''} ("}").`,
      severity: 'error',
      rule: 'unbalanced-braces',
    });
  }

  // 3. Line-by-line inspection for declarations, selectors, typos, and Bootstrap classes
  let insideRule = false;
  let currentSelectorLines: { line: number; text: string }[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const lineNum = idx + 1;
    const rawLine = lines[idx];
    const stripped = stripComments(rawLine).trim();

    if (!stripped) continue;

    // Check for string quote mismatches on this line
    const singleQuotes = (stripped.match(/'/g) || []).length;
    const doubleQuotes = (stripped.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      issues.push({
        id: `unclosed-string-${lineNum}`,
        line: lineNum,
        message: 'Unclosed string quote detected.',
        severity: 'error',
        rule: 'unclosed-string',
      });
    }

    // Check for unclosed function calls like var(--..., calc(..., rgba(...
    const openParens = (stripped.match(/\(/g) || []).length;
    const closeParens = (stripped.match(/\)/g) || []).length;
    if (openParens > closeParens && !stripped.endsWith('{')) {
      issues.push({
        id: `unclosed-func-${lineNum}`,
        line: lineNum,
        message: 'Unclosed function parameter (missing matching ")").',
        severity: 'error',
        rule: 'unclosed-function',
        suggestedFix: {
          label: 'Add closing parenthesis ")"',
          applyFix: (css) => replaceLineInCss(css, lineNum, rawLine.trimEnd() + ')'),
        },
      });
    }

    // Check for legacy Bootstrap class usage in selectors
    for (const mapping of BOOTSTRAP_LEGACY_MAPPINGS) {
      mapping.pattern.lastIndex = 0;
      const match = mapping.pattern.exec(stripped);
      if (match) {
        const foundClass = match[0];
        const replacementClass = mapping.replacement(foundClass);
        issues.push({
          id: `bs-legacy-${lineNum}-${foundClass}`,
          line: lineNum,
          message: `${mapping.describe} (found ".${foundClass}").`,
          severity: 'warning',
          rule: 'bootstrap-legacy-class',
          snippet: foundClass,
          suggestedFix: {
            label: `Replace .${foundClass} with .${replacementClass}`,
            applyFix: (css) =>
              replaceInLine(css, lineNum, new RegExp(`\\b${escapeRegExp(foundClass)}\\b`, 'g'), replacementClass),
          },
        });
      }
    }

    // Check for common Bootstrap infix typos: e.g. col-lg5, col-md4
    const typoColMatch = stripped.match(/\bcol-(xs|sm|md|lg|xl|xxl)([0-9]{1,2})\b/);
    if (typoColMatch) {
      const wrong = typoColMatch[0];
      const correct = `col-${typoColMatch[1]}-${typoColMatch[2]}`;
      issues.push({
        id: `bs-typo-${lineNum}-${wrong}`,
        line: lineNum,
        message: `Missing hyphen in Bootstrap column class "${wrong}": should be "${correct}".`,
        severity: 'error',
        rule: 'bootstrap-typo',
        snippet: wrong,
        suggestedFix: {
          label: `Fix to .${correct}`,
          applyFix: (css) =>
            replaceInLine(css, lineNum, new RegExp(`\\b${escapeRegExp(wrong)}\\b`, 'g'), correct),
        },
      });
    }

    // Track rule depth
    if (stripped.includes('{')) {
      insideRule = true;
      currentSelectorLines = [];

      // Check for trailing comma before opening brace: e.g. ".card, {"
      const beforeBrace = stripped.substring(0, stripped.indexOf('{')).trim();
      if (beforeBrace.endsWith(',')) {
        issues.push({
          id: `trailing-comma-${lineNum}`,
          line: lineNum,
          message: 'Trailing comma in selector before "{" may cause CSS rule to be ignored.',
          severity: 'warning',
          rule: 'invalid-selector',
          suggestedFix: {
            label: 'Remove trailing comma',
            applyFix: (css) =>
              replaceInLine(css, lineNum, /,\s*\{/, ' {'),
          },
        });
      }

      // Check for empty selector: e.g. "{"
      if (beforeBrace === '') {
        issues.push({
          id: `empty-selector-${lineNum}`,
          line: lineNum,
          message: 'Empty CSS selector before "{". Specify a class or element.',
          severity: 'error',
          rule: 'invalid-selector',
        });
      }

      // Check for block scoping advice: if selector targets global tags without #block-
      if (
        blockId &&
        beforeBrace &&
        !beforeBrace.startsWith('@') &&
        !beforeBrace.includes(`#block-${blockId}`) &&
        !beforeBrace.includes(':root')
      ) {
        // If it targets standard HTML tags or global Bootstrap components without block scoping
        const isGlobalTarget = /\b(h1|h2|h3|h4|h5|h6|p|a|span|button|body|header|footer|section|div|\.btn|\.card|\.navbar|\.container|\.row|\.col)\b/.test(
          beforeBrace
        );
        if (isGlobalTarget) {
          issues.push({
            id: `unscoped-${lineNum}`,
            line: lineNum,
            message: `Unscoped selector "${beforeBrace.substring(0, 35)}...": Targeting global elements directly may leak styles to other blocks. Prefix with #block-${blockId}.`,
            severity: 'info',
            rule: 'unscoped-selector',
            suggestedFix: {
              label: `Scope to #block-${blockId}`,
              applyFix: (css) =>
                replaceInLine(css, lineNum, new RegExp(escapeRegExp(beforeBrace)), `#block-${blockId} ${beforeBrace}`),
            },
          });
        }
      }
    }

    if (stripped.includes('}')) {
      insideRule = false;
      continue;
    }

    // If inside a rule block, inspect CSS property-value declarations
    if (insideRule && !stripped.startsWith('@') && !stripped.includes('{')) {
      // Check for missing colon: e.g. "color red;" or "font-size 16px"
      if (!stripped.includes(':') && !stripped.includes('/*') && stripped.length > 2) {
        issues.push({
          id: `missing-colon-${lineNum}`,
          line: lineNum,
          message: `Missing colon ":" separating property and value in "${stripped.substring(0, 30)}".`,
          severity: 'error',
          rule: 'missing-colon',
        });
        continue;
      }

      // Declaration with colon
      const colonIdx = stripped.indexOf(':');
      if (colonIdx !== -1) {
        const propName = stripped.substring(0, colonIdx).trim().toLowerCase();
        const propVal = stripped.substring(colonIdx + 1).trim();

        // Check for missing value: e.g. "color: ;" or "font-size:"
        const cleanVal = propVal.replace(/;$/, '').trim();
        if (!cleanVal) {
          issues.push({
            id: `empty-val-${lineNum}`,
            line: lineNum,
            message: `Empty value for CSS property "${propName}".`,
            severity: 'error',
            rule: 'empty-value',
          });
        }

        // Check for missing semicolon at end of line (if not the last line of a block before '}')
        const nextLineIsClose =
          idx + 1 < lines.length && stripComments(lines[idx + 1]).trim().startsWith('}');
        if (!propVal.endsWith(';') && !nextLineIsClose && cleanVal) {
          issues.push({
            id: `missing-semi-${lineNum}`,
            line: lineNum,
            message: `Missing semicolon ";" at the end of declaration "${propName}: ${cleanVal}".`,
            severity: 'warning',
            rule: 'missing-semicolon',
            suggestedFix: {
              label: 'Add semicolon ";"',
              applyFix: (css) => replaceLineInCss(css, lineNum, rawLine.trimEnd() + ';'),
            },
          });
        }

        // Check for property typos or unknown properties
        // Skip custom properties (starting with --) and vendor prefixes handled gracefully
        if (!propName.startsWith('--')) {
          if (COMMON_PROPERTY_TYPOS[propName]) {
            const correctProp = COMMON_PROPERTY_TYPOS[propName];
            issues.push({
              id: `prop-typo-${lineNum}-${propName}`,
              line: lineNum,
              message: `Unknown CSS property "${propName}". Did you mean "${correctProp}"?`,
              severity: 'error',
              rule: 'unknown-property',
              snippet: propName,
              suggestedFix: {
                label: `Replace with "${correctProp}"`,
                applyFix: (css) =>
                  replaceInLine(css, lineNum, new RegExp(`\\b${escapeRegExp(propName)}\\s*:`, 'i'), `${correctProp}:`),
              },
            });
          } else if (
            propName.length > 2 &&
            !VALID_CSS_PROPERTIES.has(propName) &&
            !propName.startsWith('-') &&
            !propName.includes(' ')
          ) {
            // Find possible closest match
            const suggestion = findClosestProperty(propName);
            issues.push({
              id: `unknown-prop-${lineNum}-${propName}`,
              line: lineNum,
              message: suggestion
                ? `Unrecognized CSS property "${propName}". Did you mean "${suggestion}"?`
                : `Unrecognized CSS property "${propName}". Check for typos.`,
              severity: 'warning',
              rule: 'unknown-property',
              snippet: propName,
              suggestedFix: suggestion
                ? {
                    label: `Change to "${suggestion}"`,
                    applyFix: (css) =>
                      replaceInLine(
                        css,
                        lineNum,
                        new RegExp(`\\b${escapeRegExp(propName)}\\s*:`, 'i'),
                        `${suggestion}:`
                      ),
                  }
                : undefined,
            });
          }
        }

        // Check for invalid unit typos: e.g. 10pxx, 20remm, 50vhz
        const invalidUnitMatch = cleanVal.match(/\b([0-9]+)(pxx|remm|emm|vhh|vww|ptx)\b/i);
        if (invalidUnitMatch) {
          const badUnit = invalidUnitMatch[0];
          const correctedUnit = badUnit.replace(/pxx$/i, 'px').replace(/remm$/i, 'rem');
          issues.push({
            id: `invalid-unit-${lineNum}-${badUnit}`,
            line: lineNum,
            message: `Invalid CSS unit format in "${badUnit}".`,
            severity: 'error',
            rule: 'invalid-unit',
            snippet: badUnit,
            suggestedFix: {
              label: `Fix to "${correctedUnit}"`,
              applyFix: (css) =>
                replaceInLine(css, lineNum, new RegExp(`\\b${escapeRegExp(badUnit)}\\b`, 'g'), correctedUnit),
            },
          });
        }
      }
    }
  }

  // Sort issues by line number ascending, errors first
  return issues.sort((a, b) => {
    if (a.line !== b.line) return a.line - b.line;
    if (a.severity === 'error' && b.severity !== 'error') return -1;
    if (a.severity !== 'error' && b.severity === 'error') return 1;
    return 0;
  });
}

/**
 * Helper to strip /* ... * / comments from a single line
 */
function stripComments(line: string): string {
  return line.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Replace a line (1-indexed) in full CSS text
 */
function replaceLineInCss(css: string, lineNum: number, newLineContent: string): string {
  const lines = css.split('\n');
  if (lineNum >= 1 && lineNum <= lines.length) {
    lines[lineNum - 1] = newLineContent;
  }
  return lines.join('\n');
}

/**
 * Replace matching text on a specific line (1-indexed) in full CSS text
 */
function replaceInLine(
  css: string,
  lineNum: number,
  search: RegExp | string,
  replacement: string
): string {
  const lines = css.split('\n');
  if (lineNum >= 1 && lineNum <= lines.length) {
    lines[lineNum - 1] = lines[lineNum - 1].replace(search, replacement);
  }
  return lines.join('\n');
}

/**
 * Escape regular expression special characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find closest property name for suggestions using Levenshtein distance
 */
function findClosestProperty(typo: string): string | null {
  let closest: string | null = null;
  let minDistance = 3; // Threshold

  for (const prop of VALID_CSS_PROPERTIES) {
    if (Math.abs(prop.length - typo.length) > 2) continue;
    const dist = levenshteinDistance(typo, prop);
    if (dist < minDistance) {
      minDistance = dist;
      closest = prop;
    }
  }

  return closest;
}

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Formats CSS with standard indentation and clean line breaks
 */
export function formatCssCode(css: string): string {
  if (!css || !css.trim()) return '';

  const lines = css.split('\n');
  const formattedLines: string[] = [];
  let indent = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
        formattedLines.push('');
      }
      continue;
    }

    if (trimmed.startsWith('}')) {
      indent = Math.max(0, indent - 1);
    }

    const pad = '  '.repeat(indent);
    formattedLines.push(pad + trimmed);

    if (trimmed.endsWith('{') && !trimmed.startsWith('@media') && !trimmed.startsWith('@keyframes')) {
      indent++;
    } else if (trimmed.endsWith('{')) {
      indent++;
    }
  }

  return formattedLines.join('\n');
}
