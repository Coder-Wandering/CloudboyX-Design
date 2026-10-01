/**
 * Bootstrap 5 Responsive Cascade & AST Engine
 * 
 * Mobile-first responsive cascade (xs -> sm -> md -> lg -> xl -> xxl).
 * Normalized VisualNode schema, computed inheritance resolver, 
 * redundancy minimizer, and bi-directional class tokenizer/parser.
 */

// 2.1 Core Breakpoint Types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

export const BREAKPOINT_QUERY_MAP: Record<Breakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

export const BREAKPOINT_LABELS: Record<Breakpoint, { label: string; desc: string; pixelRange: string; iconName: string }> = {
  xs: { label: 'XS (Mobile Portrait)', desc: '< 576px', pixelRange: '0px – 575px', iconName: 'Smartphone' },
  sm: { label: 'SM (Mobile Landscape)', desc: '≥ 576px', pixelRange: '576px – 767px', iconName: 'Smartphone' },
  md: { label: 'MD (Tablet)', desc: '≥ 768px', pixelRange: '768px – 991px', iconName: 'Tablet' },
  lg: { label: 'LG (Laptop / Small Desktop)', desc: '≥ 992px', pixelRange: '992px – 1199px', iconName: 'Laptop' },
  xl: { label: 'XL (Desktop)', desc: '≥ 1200px', pixelRange: '1200px – 1399px', iconName: 'Monitor' },
  xxl: { label: 'XXL (Ultra-wide)', desc: '≥ 1400px', pixelRange: '≥ 1400px', iconName: 'Maximize2' },
};

export const BOOTSTRAP_CONTAINER_MAX_WIDTH: Record<Breakpoint, string> = {
  xs: '100%',
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  xxl: '1320px',
};

// 2.2 Responsive Value Wrapper & Utility Types
export type ResponsiveValue<T> = Partial<Record<Breakpoint, T>>;

export type SpacingScale = 0 | 1 | 2 | 3 | 4 | 5 | 'auto';

export interface DirectionalSpacing {
  t?: SpacingScale; // top
  b?: SpacingScale; // bottom
  s?: SpacingScale; // start (left in LTR)
  e?: SpacingScale; // end (right in LTR)
  x?: SpacingScale; // horizontal
  y?: SpacingScale; // vertical
  all?: SpacingScale;
}

export type DisplayValue =
  | 'none'
  | 'inline'
  | 'inline-block'
  | 'block'
  | 'grid'
  | 'table'
  | 'flex'
  | 'inline-flex';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';

// 2.3 Normalized Component Node Schema
export interface VisualNode {
  id: string;
  tag: string;
  label?: string;

  // Structured Responsive Attributes
  responsive: {
    // Grid system
    colSpan?: ResponsiveValue<number | 'auto' | 'fill'>; // 1-12, 'auto', or 'col'
    colOffset?: ResponsiveValue<number>; // 0-11
    colOrder?: ResponsiveValue<number | 'first' | 'last'>;

    // Flex & Display
    display?: ResponsiveValue<DisplayValue>;
    flexDirection?: ResponsiveValue<FlexDirection>;
    justifyContent?: ResponsiveValue<JustifyContent>;
    alignItems?: ResponsiveValue<AlignItems>;

    // Spacing
    margin?: ResponsiveValue<DirectionalSpacing>;
    padding?: ResponsiveValue<DirectionalSpacing>;

    // Grid Gutters (applied to .row)
    gutter?: ResponsiveValue<SpacingScale>;
    gutterX?: ResponsiveValue<SpacingScale>;
    gutterY?: ResponsiveValue<SpacingScale>;
  };

  // Non-responsive or discrete Bootstrap utilities
  staticBootstrapProps: {
    themeColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    backgroundColor?: string;
    borderRadius?:
      | 'rounded'
      | 'rounded-top'
      | 'rounded-bottom'
      | 'rounded-start'
      | 'rounded-end'
      | 'rounded-circle'
      | 'rounded-pill'
      | 'rounded-0'
      | 'rounded-1'
      | 'rounded-2'
      | 'rounded-3'
      | 'rounded-4'
      | 'rounded-5';
    shadow?: 'shadow-none' | 'shadow-sm' | 'shadow' | 'shadow-lg';
    border?: boolean;
    borderWidth?: 1 | 2 | 3 | 4 | 5;
  };

  // Unmanaged custom CSS classes (e.g. 'custom-card-anim my-plugin')
  unmanagedClasses: string[];

  // Children hierarchy
  children: VisualNode[];
}

// 3. Responsive Class Rules & Serialization Engine
export interface UtilityRule<T> {
  prefix: string;
  serialize: (val: T, bp: Breakpoint) => string[];
}

// Edge case 1: Helper to format Bootstrap responsive infix ('xs' has NO infix)
export function getBreakpointInfix(bp: Breakpoint): string {
  return bp === 'xs' ? '' : `-${bp}`;
}

// Grid Column Width Rule
export const ColSpanRule: UtilityRule<number | 'auto' | 'fill'> = {
  prefix: 'col',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    if (val === 'fill') return [`col${infix}`];
    if (val === 'auto') return [`col${infix}-auto`];
    return [`col${infix}-${val}`];
  },
};

// Column Offset Rule
export const ColOffsetRule: UtilityRule<number> = {
  prefix: 'offset',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`offset${infix}-${val}`];
  },
};

// Column Order Rule
export const ColOrderRule: UtilityRule<number | 'first' | 'last'> = {
  prefix: 'order',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`order${infix}-${val}`];
  },
};

// Display Property Rule
export const DisplayRule: UtilityRule<DisplayValue> = {
  prefix: 'd',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`d${infix}-${val}`];
  },
};

// Flex Direction Rule
export const FlexDirectionRule: UtilityRule<FlexDirection> = {
  prefix: 'flex',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`flex${infix}-${val}`];
  },
};

// Justify Content Rule
export const JustifyContentRule: UtilityRule<JustifyContent> = {
  prefix: 'justify-content',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`justify-content${infix}-${val}`];
  },
};

// Align Items Rule
export const AlignItemsRule: UtilityRule<AlignItems> = {
  prefix: 'align-items',
  serialize: (val, bp) => {
    const infix = getBreakpointInfix(bp);
    return [`align-items${infix}-${val}`];
  },
};

// Directional Spacing Serializer (Padding or Margin)
export function serializeSpacing(
  type: 'm' | 'p',
  spacing: DirectionalSpacing | undefined,
  bp: Breakpoint
): string[] {
  if (!spacing) return [];
  const infix = getBreakpointInfix(bp);
  const classes: string[] = [];

  if (spacing.all !== undefined) {
    classes.push(`${type}${infix}-${spacing.all}`);
  }
  if (spacing.x !== undefined) {
    classes.push(`${type}x${infix}-${spacing.x}`);
  }
  if (spacing.y !== undefined) {
    classes.push(`${type}y${infix}-${spacing.y}`);
  }
  if (spacing.t !== undefined) {
    classes.push(`${type}t${infix}-${spacing.t}`);
  }
  if (spacing.b !== undefined) {
    classes.push(`${type}b${infix}-${spacing.b}`);
  }
  if (spacing.s !== undefined) {
    classes.push(`${type}s${infix}-${spacing.s}`);
  }
  if (spacing.e !== undefined) {
    classes.push(`${type}e${infix}-${spacing.e}`);
  }

  return classes;
}

// Row Gutters Rule (g, gx, gy)
export function serializeGutters(
  g: ResponsiveValue<SpacingScale> | undefined,
  gx: ResponsiveValue<SpacingScale> | undefined,
  gy: ResponsiveValue<SpacingScale> | undefined
): string[] {
  const tokens: string[] = [];

  if (g) {
    let active: SpacingScale | undefined = undefined;
    for (const bp of BREAKPOINT_ORDER) {
      const val = g[bp];
      if (val !== undefined && val !== active) {
        tokens.push(`g${getBreakpointInfix(bp)}-${val}`);
        active = val;
      }
    }
  }

  if (gx) {
    let active: SpacingScale | undefined = undefined;
    for (const bp of BREAKPOINT_ORDER) {
      const val = gx[bp];
      if (val !== undefined && val !== active) {
        tokens.push(`gx${getBreakpointInfix(bp)}-${val}`);
        active = val;
      }
    }
  }

  if (gy) {
    let active: SpacingScale | undefined = undefined;
    for (const bp of BREAKPOINT_ORDER) {
      const val = gy[bp];
      if (val !== undefined && val !== active) {
        tokens.push(`gy${getBreakpointInfix(bp)}-${val}`);
        active = val;
      }
    }
  }

  return tokens;
}

// 3. Cascade Optimizer & Class Generator
export class ClassGenerator {
  /**
   * Optimizes responsive values down to minimal Bootstrap classes
   * using mobile-first redundancy suppression.
   */
  static generateResponsiveClasses<T>(
    values: ResponsiveValue<T> | undefined,
    rule: UtilityRule<T>
  ): string[] {
    if (!values) return [];

    const classes: string[] = [];
    let activeInheritedValue: T | undefined = undefined;

    for (const bp of BREAKPOINT_ORDER) {
      const explicitVal = values[bp];

      // Only emit a class if the value changes from the inherited value
      if (explicitVal !== undefined && explicitVal !== activeInheritedValue) {
        classes.push(...rule.serialize(explicitVal, bp));
        activeInheritedValue = explicitVal;
      }
    }

    return classes;
  }

  /**
   * Generates optimized classes for directional spacing with redundancy suppression.
   */
  static generateSpacingClasses(
    type: 'm' | 'p',
    values: ResponsiveValue<DirectionalSpacing> | undefined
  ): string[] {
    if (!values) return [];
    const classes: string[] = [];
    const directions: (keyof DirectionalSpacing)[] = ['all', 'x', 'y', 't', 'b', 's', 'e'];

    for (const dir of directions) {
      let activeInherited: SpacingScale | undefined = undefined;
      for (const bp of BREAKPOINT_ORDER) {
        const spacingObj = values[bp];
        if (!spacingObj) continue;
        const explicitVal = spacingObj[dir];
        if (explicitVal !== undefined && explicitVal !== activeInherited) {
          const infix = getBreakpointInfix(bp);
          const dirLetter = dir === 'all' ? '' : dir;
          classes.push(`${type}${dirLetter}${infix}-${explicitVal}`);
          activeInherited = explicitVal;
        }
      }
    }

    return classes;
  }

  /**
   * Generates the entire class string for a node.
   */
  static serializeNodeClasses(node: VisualNode, isRowContext: boolean = false): string {
    const classTokens: string[] = [];

    // 1. Grid Col Span, Offset, Order
    classTokens.push(...this.generateResponsiveClasses(node.responsive.colSpan, ColSpanRule));
    classTokens.push(...this.generateResponsiveClasses(node.responsive.colOffset, ColOffsetRule));
    classTokens.push(...this.generateResponsiveClasses(node.responsive.colOrder, ColOrderRule));

    // 2. Display & Flexbox
    classTokens.push(...this.generateResponsiveClasses(node.responsive.display, DisplayRule));
    classTokens.push(
      ...this.generateResponsiveClasses(node.responsive.flexDirection, FlexDirectionRule)
    );
    classTokens.push(
      ...this.generateResponsiveClasses(node.responsive.justifyContent, JustifyContentRule)
    );
    classTokens.push(
      ...this.generateResponsiveClasses(node.responsive.alignItems, AlignItemsRule)
    );

    // 3. Spacing (Margin & Padding)
    classTokens.push(...this.generateSpacingClasses('m', node.responsive.margin));
    classTokens.push(...this.generateSpacingClasses('p', node.responsive.padding));

    // 4. Row Gutters (Container-Gutter Isolation check: only when row context or node has .row)
    const hasRowClass = isRowContext || node.unmanagedClasses.includes('row');
    if (hasRowClass) {
      classTokens.push(
        ...serializeGutters(
          node.responsive.gutter,
          node.responsive.gutterX,
          node.responsive.gutterY
        )
      );
    }

    // 5. Static Utilities
    if (node.staticBootstrapProps.shadow) {
      classTokens.push(node.staticBootstrapProps.shadow);
    }
    if (node.staticBootstrapProps.borderRadius) {
      classTokens.push(node.staticBootstrapProps.borderRadius);
    }
    if (node.staticBootstrapProps.themeColor) {
      classTokens.push(`text-bg-${node.staticBootstrapProps.themeColor}`);
    }
    if (node.staticBootstrapProps.border) {
      classTokens.push('border');
      if (node.staticBootstrapProps.borderWidth) {
        classTokens.push(`border-${node.staticBootstrapProps.borderWidth}`);
      }
    }

    // 6. Preserve unmanaged classes (avoiding duplicates)
    for (const cls of node.unmanagedClasses) {
      if (!classTokens.includes(cls)) {
        classTokens.push(cls);
      }
    }

    return classTokens.join(' ').trim();
  }
}

// 4. Computed Style Resolver (Inheritance in Builder UI)
export interface ResolvedPropertyState<T> {
  value: T | undefined;
  definedAt: Breakpoint | null;
  isInherited: boolean;
}

/**
 * Resolves the active computed property value at the current breakpoint,
 * tracking whether it is explicitly set or inherited from a smaller breakpoint.
 */
export function resolveEffectiveValue<T>(
  responsiveMap: ResponsiveValue<T> | undefined,
  currentBreakpoint: Breakpoint
): ResolvedPropertyState<T> {
  if (!responsiveMap) {
    return { value: undefined, definedAt: null, isInherited: false };
  }

  const targetIndex = BREAKPOINT_ORDER.indexOf(currentBreakpoint);

  // Walk backwards from active breakpoint down to 'xs'
  for (let i = targetIndex; i >= 0; i--) {
    const bp = BREAKPOINT_ORDER[i];
    if (responsiveMap[bp] !== undefined) {
      return {
        value: responsiveMap[bp],
        definedAt: bp,
        isInherited: bp !== currentBreakpoint,
      };
    }
  }

  return { value: undefined, definedAt: null, isInherited: false };
}

// 5. Parser / De-serializer (Bi-directional Code Sync & AST Hydration)
export class ClassParser {
  // Regex token definitions
  private static COL_REGEX = /^col(?:-(sm|md|lg|xl|xxl))?(?:-(auto|\d+))?$/;
  private static OFFSET_REGEX = /^offset(?:-(sm|md|lg|xl|xxl))?-(\d+)$/;
  private static ORDER_REGEX = /^order(?:-(sm|md|lg|xl|xxl))?-(first|last|\d+)$/;
  private static DISPLAY_REGEX =
    /^d(?:-(sm|md|lg|xl|xxl))?-(none|inline|inline-block|block|grid|table|flex|inline-flex)$/;
  private static FLEX_DIR_REGEX =
    /^flex(?:-(sm|md|lg|xl|xxl))?-(row|row-reverse|column|column-reverse)$/;
  private static JUSTIFY_REGEX =
    /^justify-content(?:-(sm|md|lg|xl|xxl))?-(start|end|center|between|around|evenly)$/;
  private static ALIGN_REGEX =
    /^align-items(?:-(sm|md|lg|xl|xxl))?-(start|end|center|baseline|stretch)$/;
  private static SPACING_REGEX =
    /^([mp])([tbsxye]?)(?:-(sm|md|lg|xl|xxl))?-(auto|[0-5])$/;
  private static GUTTER_REGEX =
    /^g([xy]?)(?:-(sm|md|lg|xl|xxl))?-([0-5])$/;
  private static SHADOW_REGEX = /^(shadow(?:-none|-sm|-lg)?)$/;
  private static ROUNDED_REGEX =
    /^(rounded(?:-top|-bottom|-start|-end|-circle|-pill|-[0-5])?)$/;
  private static THEME_BG_REGEX =
    /^text-bg-(primary|secondary|success|danger|warning|info|light|dark)$/;

  /**
   * Parses an array or string of classes, maps recognized tokens to the normalized
   * AST schema, and stores all unrecognized classes in unmanagedClasses.
   */
  static parseClassList(classListOrString: string[] | string): {
    responsive: VisualNode['responsive'];
    staticBootstrapProps: VisualNode['staticBootstrapProps'];
    unmanagedClasses: string[];
  } {
    const tokens = Array.isArray(classListOrString)
      ? classListOrString
      : classListOrString.split(/\s+/).filter(Boolean);

    const responsive: VisualNode['responsive'] = {
      colSpan: {},
      colOffset: {},
      colOrder: {},
      display: {},
      flexDirection: {},
      justifyContent: {},
      alignItems: {},
      margin: {},
      padding: {},
      gutter: {},
      gutterX: {},
      gutterY: {},
    };

    const staticBootstrapProps: VisualNode['staticBootstrapProps'] = {};
    const unmanagedClasses: string[] = [];

    for (const cls of tokens) {
      // 1. Col Span
      const colMatch = cls.match(this.COL_REGEX);
      if (colMatch) {
        const bp: Breakpoint = (colMatch[1] as Breakpoint) || 'xs';
        const rawVal = colMatch[2];
        const val = rawVal === 'auto' ? 'auto' : rawVal ? parseInt(rawVal, 10) : 'fill';
        responsive.colSpan![bp] = val;
        continue;
      }

      // 2. Col Offset
      const offsetMatch = cls.match(this.OFFSET_REGEX);
      if (offsetMatch) {
        const bp: Breakpoint = (offsetMatch[1] as Breakpoint) || 'xs';
        responsive.colOffset![bp] = parseInt(offsetMatch[2], 10);
        continue;
      }

      // 3. Col Order
      const orderMatch = cls.match(this.ORDER_REGEX);
      if (orderMatch) {
        const bp: Breakpoint = (orderMatch[1] as Breakpoint) || 'xs';
        const raw = orderMatch[2];
        responsive.colOrder![bp] = raw === 'first' || raw === 'last' ? raw : parseInt(raw, 10);
        continue;
      }

      // 4. Display
      const displayMatch = cls.match(this.DISPLAY_REGEX);
      if (displayMatch) {
        const bp: Breakpoint = (displayMatch[1] as Breakpoint) || 'xs';
        responsive.display![bp] = displayMatch[2] as DisplayValue;
        continue;
      }

      // 5. Flex Direction
      const flexDirMatch = cls.match(this.FLEX_DIR_REGEX);
      if (flexDirMatch) {
        const bp: Breakpoint = (flexDirMatch[1] as Breakpoint) || 'xs';
        responsive.flexDirection![bp] = flexDirMatch[2] as FlexDirection;
        continue;
      }

      // 6. Justify Content
      const justifyMatch = cls.match(this.JUSTIFY_REGEX);
      if (justifyMatch) {
        const bp: Breakpoint = (justifyMatch[1] as Breakpoint) || 'xs';
        responsive.justifyContent![bp] = justifyMatch[2] as JustifyContent;
        continue;
      }

      // 7. Align Items
      const alignMatch = cls.match(this.ALIGN_REGEX);
      if (alignMatch) {
        const bp: Breakpoint = (alignMatch[1] as Breakpoint) || 'xs';
        responsive.alignItems![bp] = alignMatch[2] as AlignItems;
        continue;
      }

      // 8. Spacing (m, p)
      const spacingMatch = cls.match(this.SPACING_REGEX);
      if (spacingMatch) {
        const type = spacingMatch[1] === 'm' ? 'margin' : 'padding';
        const dir = spacingMatch[2] || 'all';
        const bp: Breakpoint = (spacingMatch[3] as Breakpoint) || 'xs';
        const val = spacingMatch[4] === 'auto' ? 'auto' : (parseInt(spacingMatch[4], 10) as SpacingScale);

        if (!responsive[type]![bp]) {
          responsive[type]![bp] = {};
        }
        (responsive[type]![bp] as any)[dir] = val;
        continue;
      }

      // 9. Gutters (g, gx, gy)
      const gutterMatch = cls.match(this.GUTTER_REGEX);
      if (gutterMatch) {
        const axis = gutterMatch[1];
        const bp: Breakpoint = (gutterMatch[2] as Breakpoint) || 'xs';
        const val = parseInt(gutterMatch[3], 10) as SpacingScale;

        if (axis === 'x') {
          responsive.gutterX![bp] = val;
        } else if (axis === 'y') {
          responsive.gutterY![bp] = val;
        } else {
          responsive.gutter![bp] = val;
        }
        continue;
      }

      // 10. Shadows
      const shadowMatch = cls.match(this.SHADOW_REGEX);
      if (shadowMatch) {
        staticBootstrapProps.shadow = shadowMatch[1] as any;
        continue;
      }

      // 11. Rounded
      const roundedMatch = cls.match(this.ROUNDED_REGEX);
      if (roundedMatch) {
        staticBootstrapProps.borderRadius = roundedMatch[1] as any;
        continue;
      }

      // 12. Theme text-bg
      const themeMatch = cls.match(this.THEME_BG_REGEX);
      if (themeMatch) {
        staticBootstrapProps.themeColor = themeMatch[1] as any;
        continue;
      }

      // Unmatched custom classes retained
      unmanagedClasses.push(cls);
    }

    return { responsive, staticBootstrapProps, unmanagedClasses };
  }
}

// 6. Conflict Prevention & Namespace Token Cleansing
export function cleanseConflictingTokens(classList: string[], namespacePrefix: string, bp: Breakpoint): string[] {
  const infix = getBreakpointInfix(bp);
  // Matches tokens like: `d-md-block`, `d-block`, `col-md-6`, `col-12`
  const prefixRegex = new RegExp(`^${namespacePrefix}${infix ? `-${bp}` : '(?:-[a-z0-9]+)?'}(?:-[a-z0-9]+)*$`);
  return classList.filter((c) => !prefixRegex.test(c));
}

// Factory to create a default root VisualNode
export function createDefaultVisualNode(id: string, tag: string = 'div', initialClasses: string = ''): VisualNode {
  const parsed = ClassParser.parseClassList(initialClasses);
  return {
    id,
    tag,
    responsive: parsed.responsive,
    staticBootstrapProps: parsed.staticBootstrapProps,
    unmanagedClasses: parsed.unmanagedClasses,
    children: [],
  };
}
