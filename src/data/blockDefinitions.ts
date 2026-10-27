import { BlockDefinition, BlockInstance, BlockSettings, SiteTheme } from '../types';

export function getSpacingClasses(settings: Partial<BlockSettings>): string {
  const classes: string[] = [];

  let pt = 0;
  if (typeof settings.paddingTop === 'number') {
    pt = Math.min(Math.max(settings.paddingTop, 0), 5);
  } else if (typeof settings.paddingTop === 'string') {
    const match = settings.paddingTop.match(/\d+/);
    pt = match ? Math.min(Math.max(parseInt(match[0], 10), 0), 5) : 3;
  }

  let pb = 0;
  if (typeof settings.paddingBottom === 'number') {
    pb = Math.min(Math.max(settings.paddingBottom, 0), 5);
  } else if (typeof settings.paddingBottom === 'string') {
    const match = settings.paddingBottom.match(/\d+/);
    pb = match ? Math.min(Math.max(parseInt(match[0], 10), 0), 5) : 3;
  }

  const ps = typeof settings.paddingLeft === 'number' ? Math.min(Math.max(settings.paddingLeft, 0), 5) : 0;
  const pe = typeof settings.paddingRight === 'number' ? Math.min(Math.max(settings.paddingRight, 0), 5) : 0;

  // Optimize padding shorthand if all 4 are equal and > 0
  if (pt === pb && pb === ps && ps === pe && pt > 0) {
    classes.push(`p-${pt}`);
  } else {
    // Vertical padding
    if (pt === pb && pt > 0) {
      classes.push(`py-${pt}`);
    } else {
      if (pt > 0) classes.push(`pt-${pt}`);
      if (pb > 0) classes.push(`pb-${pb}`);
    }
    // Horizontal padding
    if (ps === pe && ps > 0) {
      classes.push(`px-${ps}`);
    } else {
      if (ps > 0) classes.push(`ps-${ps}`);
      if (pe > 0) classes.push(`pe-${pe}`);
    }
  }

  // Margin Top
  if (typeof settings.marginTop === 'number' && settings.marginTop > 0) {
    classes.push(`mt-${Math.min(Math.max(settings.marginTop, 0), 5)}`);
  }
  // Margin Bottom
  if (typeof settings.marginBottom === 'number' && settings.marginBottom > 0) {
    classes.push(`mb-${Math.min(Math.max(settings.marginBottom, 0), 5)}`);
  }
  // Margin Left / Start (ms-*)
  if (settings.marginLeft === 'auto') {
    classes.push('ms-auto');
  } else if (typeof settings.marginLeft === 'number' && settings.marginLeft > 0) {
    classes.push(`ms-${Math.min(Math.max(settings.marginLeft, 0), 5)}`);
  }
  // Margin Right / End (me-*)
  if (settings.marginRight === 'auto') {
    classes.push('me-auto');
  } else if (typeof settings.marginRight === 'number' && settings.marginRight > 0) {
    classes.push(`me-${Math.min(Math.max(settings.marginRight, 0), 5)}`);
  }

  // Optimize mx-auto if both ms-auto and me-auto
  const classStr = classes.join(' ');
  return classStr.replace('ms-auto me-auto', 'mx-auto');
}

function getPaddingClasses(pt: number | string, pb: number | string, settings?: Partial<BlockSettings>): string {
  if (settings) {
    return getSpacingClasses({ ...settings, paddingTop: pt, paddingBottom: pb });
  }
  return getSpacingClasses({ paddingTop: pt, paddingBottom: pb });
}

function getBgStyle(settings: BlockInstance['settings']): { style: string; className: string } {
  const textClass = settings.textColor === 'light' ? 'text-white' : 'text-dark';
  const shadowClass = settings.shadow ? ` ${settings.shadow}` : '';

  if (settings.bgType === 'image' && settings.bgImage) {
    const size = settings.bgSize || 'cover';
    const pos = settings.bgPosition || 'center';
    const repeat = settings.bgRepeat || 'no-repeat';
    // Support data URLs and remote URLs with safe quote escaping
    const safeUrl = settings.bgImage.replace(/"/g, '%22');
    return {
      style: `background-image: url("${safeUrl}"); background-size: ${size}; background-position: ${pos}; background-repeat: ${repeat}; position: relative;`,
      className: `${textClass}${shadowClass}`,
    };
  }
  if (settings.bgType === 'gradient' && settings.bgColor) {
    return {
      style: `background: ${settings.bgColor}; position: relative;`,
      className: `${textClass}${shadowClass}`,
    };
  }
  if (settings.bgType === 'color') {
    const bg = settings.bgColor || '#ffffff';
    if (bg.startsWith('#') || bg.startsWith('rgb') || bg.startsWith('hsl')) {
      return {
        style: `background-color: ${bg};`,
        className: `${textClass}${shadowClass}`,
      };
    }
    return {
      style: '',
      className: `${bg} ${textClass}${shadowClass}`,
    };
  }
  return {
    style: '',
    className: `${textClass}${shadowClass}`,
  };
}

function renderOverlay(settings: BlockInstance['settings']): string {
  if (settings.bgType === 'image' && settings.bgImage) {
    const opacity = (settings.bgOverlayOpacity ?? 50) / 100;
    if (opacity <= 0) return '';
    const overlayBase = settings.bgOverlayColor || (settings.textColor === 'light' ? '#000000' : '#ffffff');
    let overlayColor = overlayBase;
    if (overlayBase.startsWith('#')) {
      const clean = overlayBase.replace('#', '');
      let r = 0, g = 0, b = 0;
      if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16) || 0;
        g = parseInt(clean[1] + clean[1], 16) || 0;
        b = parseInt(clean[2] + clean[2], 16) || 0;
      } else if (clean.length >= 6) {
        r = parseInt(clean.substring(0, 2), 16) || 0;
        g = parseInt(clean.substring(2, 4), 16) || 0;
        b = parseInt(clean.substring(4, 6), 16) || 0;
      }
      overlayColor = `rgba(${r},${g},${b},${opacity})`;
    } else {
      overlayColor = settings.textColor === 'light' ? `rgba(0,0,0,${opacity})` : `rgba(255,255,255,${opacity})`;
    }
    return `<div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: ${overlayColor}; z-index: 1; pointer-events: none;"></div>`;
  }
  return '';
}

function editAttr(isEditor: boolean | undefined, field: string): string {
  return isEditor ? `data-field="${field}" contenteditable="true" spellcheck="false"` : '';
}

function getGridClasses(settings: BlockSettings, defaultCols: number = 3) {
  const gutter = settings.gutterSize || 'g-4';
  const justify = settings.justifyContent ? `justify-content-${settings.justifyContent}` : 'justify-content-center';
  const align = settings.alignItems ? `align-items-${settings.alignItems}` : '';
  const rowClass = `row ${gutter} ${justify} ${align}`.trim();

  const cols = settings.columns || defaultCols;
  const template = settings.layoutTemplate;

  const getItemColClass = (index: number, total: number = 3) => {
    if (template === '1-column' || cols === 1) {
      return 'col-12 col-md-10 col-lg-8 mx-auto';
    }
    if (template === '2-column' || cols === 2) {
      return 'col-md-6';
    }
    if (template === '4-column' || cols === 4) {
      return 'col-md-6 col-lg-3';
    }
    if (template === 'asymmetric-left') {
      return index === 0 ? 'col-lg-8' : (total <= 2 ? 'col-lg-4' : 'col-md-6 col-lg-4');
    }
    if (template === 'asymmetric-right') {
      return index === total - 1 ? 'col-lg-8' : (index === 0 && total <= 2 ? 'col-lg-4' : 'col-md-6 col-lg-4');
    }
    if (template === 'masonry') {
      return total >= 4 ? 'col-sm-6 col-lg-4' : (cols === 2 ? 'col-md-6' : 'col-md-6 col-lg-4');
    }
    if (cols === 6) return 'col-sm-6 col-md-4 col-lg-2';
    if (cols === 4) return 'col-md-6 col-lg-3';
    if (cols === 2) return 'col-md-6';
    if (cols === 1) return 'col-12 col-md-10 col-lg-8 mx-auto';
    return 'col-md-4';
  };

  return { rowClass, getItemColClass, gutter, template, cols };
}

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  // 0A. CUSTOM HTML BLOCK (Video Remix: Drag/Add to Page & Click to Open Split-Pane Code Editor)
  {
    type: 'custom-html',
    category: 'html',
    name: 'Custom HTML Block',
    description: 'This block appears in the Blocks list: add it to a page and open the split-pane HTML & CSS Code Editor to write custom code.',
    iconName: 'Code2',
    tags: ['html', 'custom', 'code', 'css', 'editor', 'embed', 'script', 'svg', 'raw'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 4,
      paddingBottom: 4,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: true,
    },
    defaultContent: {
      rawHtml: `<div class="cbx-custom-html-stage" data-action="open-code-editor">
  <h2 class="cbx-custom-heading">Custom HTML Block</h2>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2222FF" width="120" height="120">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
  </svg>
  <p class="cbx-custom-prompt">Click to Open Code Editor</p>
</div>`,
      rawCss: `.cbx-custom-html-stage {
  padding: 64px 20px;
  color: #64748b;
  text-align: center;
  cursor: pointer;
  border: 2px dashed rgba(34, 34, 255, 0.22);
  border-radius: 16px;
  transition: all 0.2s ease;
}
.cbx-custom-html-stage:hover {
  border-color: #00E5D1;
  background: rgba(34, 34, 255, 0.03);
}
.cbx-custom-heading {
  font-size: 48px;
  font-weight: 300;
  color: #475569;
  margin-bottom: 12px;
}
.cbx-custom-prompt {
  font-size: 32px;
  font-weight: 300;
  color: #64748b;
  margin-top: 12px;
  margin-bottom: 0;
}`,
    },
    renderHtml: (block) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const spacing = getPaddingClasses(settings.paddingTop, settings.paddingBottom, settings);
      const htmlMarkup =
        block.customHtml ??
        content.rawHtml ??
        `<div class="py-5 text-center"><h3>Custom HTML Block</h3></div>`;
      const cssMarkup = block.customCss ?? content.rawCss ?? '';

      return `
<section data-block-id="${block.id}" data-custom-html-block="true" class="${spacing} ${className}" style="${style}">
  ${renderOverlay(settings)}
  ${cssMarkup ? `<style data-block-scoped-css="${block.id}">${cssMarkup}</style>` : ''}
  <div class="${settings.containerWidth || 'container'} position-relative" style="z-index: 2;">
    ${htmlMarkup}
  </div>
</section>`;
    },
  },

  // 0B. HELLO WORLD CUSTOM HTML REMIX BLOCK
  {
    type: 'custom-html-hello-world',
    category: 'html',
    name: 'Hello World HTML Remix',
    description: 'Pre-built Custom HTML & CSS showcase block with SVG vector art and live editable stylesheet.',
    iconName: 'Code2',
    tags: ['html', 'custom', 'hello world', 'svg', 'heart', 'code', 'css'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: true,
    },
    defaultContent: {
      rawHtml: `<div class="cbx-hello-world-block" data-action="open-code-editor">
  <p class="cbx-hello-title">Hello World</p>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e11d48" width="120" height="120" class="my-2">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
  </svg>
  <p class="cbx-hello-subtitle">CloudboyX Sites</p>
</div>`,
      rawCss: `.cbx-hello-world-block {
  padding: 60px 0;
  color: #64748b;
  text-align: center;
}
.cbx-hello-title {
  font-size: 54px;
  font-weight: 300;
  color: #475569;
  margin-bottom: 8px;
}
.cbx-hello-subtitle {
  font-size: 38px;
  font-weight: 300;
  color: #64748b;
  margin-top: 8px;
  margin-bottom: 0;
}`,
    },
    renderHtml: (block) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const spacing = getPaddingClasses(settings.paddingTop, settings.paddingBottom, settings);
      const htmlMarkup = block.customHtml ?? content.rawHtml ?? '';
      const cssMarkup = block.customCss ?? content.rawCss ?? '';

      return `
<section data-block-id="${block.id}" data-custom-html-block="true" class="${spacing} ${className}" style="${style}">
  ${renderOverlay(settings)}
  ${cssMarkup ? `<style data-block-scoped-css="${block.id}">${cssMarkup}</style>` : ''}
  <div class="${settings.containerWidth || 'container'} position-relative" style="z-index: 2;">
    ${htmlMarkup}
  </div>
</section>`;
    },
  },

  // 0C. BLANK CONTAINER BLOCK
  {
    type: 'blank-container',
    category: 'content',
    name: 'Blank Container',
    description: 'Empty responsive Bootstrap 5 container with clean dashed canvas placeholder ready for custom content or nested components.',
    iconName: 'Box',
    tags: ['container', 'blank', 'empty', 'section', 'wrapper', 'layout', 'grid', 'placeholder'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 4,
      paddingBottom: 4,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: false,
      showDescription: true,
      showButtons: false,
      showMedia: false,
      showIcons: false,
    },
    defaultContent: {
      title: 'Blank Container',
      description: 'An empty responsive Bootstrap 5 section. Use block parameters to customize layout, spacing, or add content.',
      rawHtml: `<div class="p-5 border-2 border-dashed border-secondary-subtle rounded-4 text-center my-2 bg-light-subtle">
  <div class="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
      <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l6.29 2.516a.5.5 0 0 1 .307.464v10.5a.5.5 0 0 1-.307.464l-6.29 2.516a1.5 1.5 0 0 1-1.114 0l-6.29-2.516A.5.5 0 0 1 0 13.714V3.216a.5.5 0 0 1 .307-.464L7.443.184z"/>
    </svg>
  </div>
  <h4 class="fw-semibold text-body mb-2" data-field="title" contenteditable="true">Blank Container</h4>
  <p class="text-secondary mx-auto mb-0" style="max-width: 480px;" data-field="description" contenteditable="true">An empty responsive Bootstrap 5 container. Click here or use block settings to customize padding, background, or add custom HTML.</p>
</div>`,
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const spacing = getPaddingClasses(settings.paddingTop ?? 4, settings.paddingBottom ?? 4, settings);
      const title = content.title ?? 'Blank Container';
      const desc = content.description ?? 'An empty responsive Bootstrap 5 container.';
      const innerHtml =
        block.customHtml ??
        content.rawHtml ??
        `<div class="p-5 border-2 border-dashed border-secondary-subtle rounded-4 text-center my-2 bg-light-subtle">
  <h4 class="fw-semibold text-body mb-2" ${editAttr(isEditor, 'title')}>${title}</h4>
  <p class="text-secondary mx-auto mb-0" style="max-width: 480px;" ${editAttr(isEditor, 'description')}>${desc}</p>
</div>`;
      const cssMarkup = block.customCss ?? content.rawCss ?? '';

      return `
<section id="block-${block.id}" data-block-id="${block.id}" data-blank-container="true" class="${spacing} ${className}" style="${style}">
  ${renderOverlay(settings)}
  ${cssMarkup ? `<style data-block-scoped-css="${block.id}">${cssMarkup}</style>` : ''}
  <div class="${settings.containerWidth || 'container'} position-relative" style="z-index: 2;">
    ${innerHtml}
  </div>
</section>`;
    },
  },

  // 1. NAVBAR STANDARD
  {
    type: 'navbar-standard',
    category: 'navbars',
    name: 'Standard Navbar',
    description: 'Responsive navbar with logo, nav links, and CTA button',
    iconName: 'Menu',
    tags: ['navbar', 'navigation', 'menu', 'header', 'links', 'brand', 'button'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 3,
      paddingBottom: 3,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: false,
      showDescription: false,
      showButtons: true,
      showMedia: true,
      showIcons: false,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      brandName: 'CloudboyX Design',
      brandIcon: 'bi-boxes',
      link1: 'Features',
      link2: 'Services',
      link3: 'Portfolio',
      link4: 'Pricing',
      buttonText: 'Get Started',
      buttonLink: '#contact',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const isDark = settings.textColor === 'light';
      const navTheme = isDark ? 'navbar-dark' : 'navbar-light';
      const btnClass = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} px-4 shadow-sm`;

      return `
<nav id="block-${block.id}" data-block-id="${block.id}" class="navbar navbar-expand-lg ${navTheme} ${className} ${settings.shadow ? '' : 'shadow-sm'} sticky-top" style="${style}">
  <div class="${settings.containerWidth}">
    <a class="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4" href="#">
      ${settings.showMedia ? `<i class="bi ${content.brandIcon || 'bi-boxes'} text-primary fs-3"></i>` : ''}
      <span ${editAttr(isEditor, 'brandName')}>${content.brandName}</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav-${block.id}">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="nav-${block.id}">
      <ul class="navbar-nav mx-auto mb-2 mb-lg-0 fw-medium">
        <li class="nav-item"><a class="nav-link px-3" href="#features" ${editAttr(isEditor, 'link1')}>${content.link1}</a></li>
        <li class="nav-item"><a class="nav-link px-3" href="#services" ${editAttr(isEditor, 'link2')}>${content.link2}</a></li>
        <li class="nav-item"><a class="nav-link px-3" href="#portfolio" ${editAttr(isEditor, 'link3')}>${content.link3}</a></li>
        <li class="nav-item"><a class="nav-link px-3" href="#pricing" ${editAttr(isEditor, 'link4')}>${content.link4}</a></li>
      </ul>
      ${settings.showButtons ? `
      <div class="d-flex align-items-center gap-2">
        <a href="${content.buttonLink}" class="${btnClass}" ${editAttr(isEditor, 'buttonText')}>${content.buttonText}</a>
      </div>` : ''}
    </div>
  </div>
</nav>`;
    },
  },

  // 1B. NAVBAR MEGA MENU
  {
    type: 'navbar-megamenu',
    category: 'navbars',
    name: 'Mega Menu Navbar',
    description: 'Enterprise navbar featuring a multi-column mega menu with spotlight card, icon solutions, search, and dual CTAs',
    iconName: 'Menu',
    tags: ['navbar', 'navigation', 'megamenu', 'mega menu', 'dropdown', 'header', 'menu', 'search', 'links', 'enterprise'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 3,
      paddingBottom: 3,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: false,
      showDescription: false,
      showButtons: true,
      showMedia: true,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
      cardShadow: true,
    },
    defaultContent: {
      brandName: 'CloudboyX',
      brandBadge: 'Enterprise',
      brandIcon: 'bi-grid-1x2-fill',
      megaTriggerText: 'Products & Solutions',

      // Spotlight Section
      spotlightBadge: '✨ NEW RELEASE',
      spotlightTitle: 'Cloud Studio v4.0',
      spotlightDesc: 'Visual full-stack canvas with real-time Bootstrap 5 compiler and one-click CDN deployment.',
      spotlightLinkText: 'Explore Platform',
      spotlightLinkUrl: '#studio',

      // Column 1: Core Platform
      col1Title: 'Platform Modules',
      item1Title: 'Visual Builder',
      item1Desc: 'Zero-latency visual design engine',
      item1Icon: 'bi-window-stack',
      item2Title: 'Component Library',
      item2Desc: 'Production-ready Bootstrap 5 blocks',
      item2Icon: 'bi-layers-fill',
      item3Title: 'Cloud Hosting',
      item3Desc: 'High-speed global edge distribution',
      item3Icon: 'bi-cloud-arrow-up',

      // Column 2: Developer Ecosystem
      col2Title: 'Developer Tools',
      item4Title: 'Documentation',
      item4Desc: 'API references & quickstarts',
      item4Icon: 'bi-book-half',
      item5Title: 'SDKs & REST API',
      item5Desc: 'Custom endpoints and webhooks',
      item5Icon: 'bi-code-slash',
      item6Title: 'Enterprise Support',
      item6Desc: '24/7 dedicated engineering team',
      item6Icon: 'bi-shield-check',

      // Mega Menu Bottom Ribbon
      footerCalloutText: 'Need dedicated VPC or custom compliance?',
      footerCalloutLink: 'Schedule Architecture Review →',
      footerCalloutUrl: '#contact-sales',

      // Standard nav links
      link1: 'Pricing',
      link2: 'Customers',
      link3: 'Docs',

      // Right actions
      searchPlaceholder: 'Search...',
      secondaryButtonText: 'Sign In',
      secondaryButtonUrl: '#login',
      primaryButtonText: 'Start Free Trial',
      primaryButtonUrl: '#signup',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const isDark = settings.textColor === 'light';
      const navTheme = isDark ? 'navbar-dark' : 'navbar-light';
      const btnClass = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} px-3.5 py-1.5 shadow-sm fw-medium`;

      return `
<nav id="block-${block.id}" data-block-id="${block.id}" class="navbar navbar-expand-lg ${navTheme} ${className} ${settings.shadow ? '' : 'shadow-sm'} sticky-top" style="${style}">
  <div class="${settings.containerWidth}">
    <!-- Brand -->
    <a class="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-decoration-none" href="#">
      ${settings.showMedia ? `<i class="bi ${content.brandIcon || 'bi-grid-1x2-fill'} text-primary fs-3"></i>` : ''}
      <span ${editAttr(isEditor, 'brandName')}>${content.brandName}</span>
      ${content.brandBadge ? `<span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5" style="font-size: 0.65rem;" ${editAttr(isEditor, 'brandBadge')}>${content.brandBadge}</span>` : ''}
    </a>

    <!-- Mobile Toggler Button -->
    <button class="navbar-toggler border-0 shadow-none p-1" type="button" data-bs-toggle="collapse" data-bs-target="#megaNav-${block.id}" aria-controls="megaNav-${block.id}" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Nav Collapse Container -->
    <div class="collapse navbar-collapse" id="megaNav-${block.id}">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
        <!-- Mega Menu Dropdown -->
        <li class="nav-item dropdown dropdown-mega position-static dropdown-hover">
          <a class="nav-link dropdown-toggle fw-semibold px-3 d-flex align-items-center gap-1.5" href="#" id="megaMenuLink-${block.id}" role="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
            <i class="bi bi-grid-fill text-primary" style="font-size: 0.85rem;"></i>
            <span ${editAttr(isEditor, 'megaTriggerText')}>${content.megaTriggerText}</span>
          </a>

          <div class="dropdown-menu dropdown-menu-start w-100 p-0 border-0 shadow-lg rounded-4 overflow-hidden mt-1 mt-lg-2" aria-labelledby="megaMenuLink-${block.id}" style="${isDark ? 'background-color: #1e293b; color: #f8fafc;' : 'background-color: #ffffff; color: #0f172a;'}">
            <div class="p-3 p-lg-4">
              <div class="row g-3 g-lg-4">
                <!-- Col 1: Spotlight Card -->
                <div class="col-12 col-lg-4">
                  <div class="card h-100 border-0 rounded-4 p-3 p-lg-4 position-relative overflow-hidden" style="${isDark ? 'background-color: #0f172a; border: 1px solid #334155 !important;' : 'background-color: #f8fafc; border: 1px solid #e2e8f0 !important;'}">
                    <div class="card-body p-0 d-flex flex-column justify-content-between">
                      <div>
                        <div class="d-flex align-items-center gap-2 mb-2.5">
                          <span class="badge bg-primary text-white rounded-pill px-2.5 py-1 text-uppercase fw-bold" style="font-size: 0.65rem; letter-spacing: 0.05em;" ${editAttr(isEditor, 'spotlightBadge')}>${content.spotlightBadge}</span>
                        </div>
                        <h5 class="fw-bold mb-1.5 fs-5 ${isDark ? 'text-white' : 'text-dark'}" ${editAttr(isEditor, 'spotlightTitle')}>${content.spotlightTitle}</h5>
                        <p class="${isDark ? 'text-slate-400' : 'text-secondary'} small mb-4 lh-base" ${editAttr(isEditor, 'spotlightDesc')}>${content.spotlightDesc}</p>
                      </div>
                      <a href="${content.spotlightLinkUrl || '#'}" class="text-primary fw-semibold small text-decoration-none d-inline-flex align-items-center gap-1.5">
                        <span ${editAttr(isEditor, 'spotlightLinkText')}>${content.spotlightLinkText}</span>
                        <i class="bi bi-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Col 2: Platform Links -->
                <div class="col-12 col-lg-4">
                  <div class="text-uppercase fw-bold small mb-2 px-2.5 ${isDark ? 'text-slate-400' : 'text-secondary'}" style="font-size: 0.72rem; letter-spacing: 0.06em;" ${editAttr(isEditor, 'col1Title')}>${content.col1Title}</div>
                  <div class="d-flex flex-column gap-1">
                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item1Icon || 'bi-window-stack'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item1Title')}>${content.item1Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item1Desc')}>${content.item1Desc}</div>
                      </div>
                    </a>

                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-info-subtle text-info d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item2Icon || 'bi-layers-fill'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item2Title')}>${content.item2Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item2Desc')}>${content.item2Desc}</div>
                      </div>
                    </a>

                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-success-subtle text-success d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item3Icon || 'bi-cloud-arrow-up'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item3Title')}>${content.item3Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item3Desc')}>${content.item3Desc}</div>
                      </div>
                    </a>
                  </div>
                </div>

                <!-- Col 3: Resources & Tools -->
                <div class="col-12 col-lg-4">
                  <div class="text-uppercase fw-bold small mb-2 px-2.5 ${isDark ? 'text-slate-400' : 'text-secondary'}" style="font-size: 0.72rem; letter-spacing: 0.06em;" ${editAttr(isEditor, 'col2Title')}>${content.col2Title}</div>
                  <div class="d-flex flex-column gap-1">
                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-warning-subtle text-warning d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item4Icon || 'bi-book-half'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item4Title')}>${content.item4Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item4Desc')}>${content.item4Desc}</div>
                      </div>
                    </a>

                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-danger-subtle text-danger d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item5Icon || 'bi-code-slash'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item5Title')}>${content.item5Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item5Desc')}>${content.item5Desc}</div>
                      </div>
                    </a>

                    <a href="#" class="text-decoration-none p-2 rounded-3 d-flex align-items-start gap-3 transition" style="${isDark ? 'color: #e2e8f0;' : 'color: #1e293b;'}" onmouseover="this.style.backgroundColor='${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,110,253,0.06)'}'" onmouseout="this.style.backgroundColor='transparent'">
                      <div class="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-center shrink-0" style="width: 38px; height: 38px;">
                        <i class="bi ${content.item6Icon || 'bi-shield-check'} fs-5"></i>
                      </div>
                      <div>
                        <div class="fw-semibold small leading-tight" ${editAttr(isEditor, 'item6Title')}>${content.item6Title}</div>
                        <div class="${isDark ? 'text-slate-400' : 'text-secondary'} small text-truncate" style="font-size: 0.78rem;" ${editAttr(isEditor, 'item6Desc')}>${content.item6Desc}</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bottom Ribbon Callout -->
            <div class="px-4 py-2.5 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2" style="${isDark ? 'background-color: #0b1120; border-top: 1px solid #334155;' : 'background-color: #f1f5f9; border-top: 1px solid #e2e8f0;'}">
              <div class="d-flex align-items-center gap-2 small ${isDark ? 'text-slate-300' : 'text-secondary'}">
                <i class="bi bi-shield-check text-success fs-6"></i>
                <span ${editAttr(isEditor, 'footerCalloutText')}>${content.footerCalloutText}</span>
              </div>
              <a href="${content.footerCalloutUrl || '#'}" class="small text-primary fw-semibold text-decoration-none d-flex align-items-center gap-1">
                <span ${editAttr(isEditor, 'footerCalloutLink')}>${content.footerCalloutLink}</span>
              </a>
            </div>
          </div>
        </li>

        <!-- Standard Nav Links -->
        <li class="nav-item"><a class="nav-link px-3 fw-medium" href="#pricing" ${editAttr(isEditor, 'link1')}>${content.link1}</a></li>
        <li class="nav-item"><a class="nav-link px-3 fw-medium" href="#customers" ${editAttr(isEditor, 'link2')}>${content.link2}</a></li>
        <li class="nav-item"><a class="nav-link px-3 fw-medium" href="#docs" ${editAttr(isEditor, 'link3')}>${content.link3}</a></li>
      </ul>

      <!-- Right Action Controls -->
      <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">
        ${settings.showIcons ? `
        <div class="d-none d-xl-flex align-items-center me-2 position-relative">
          <span class="position-absolute start-0 ps-3 text-muted" style="pointer-events: none;">
            <i class="bi bi-search" style="font-size: 0.8rem;"></i>
          </span>
          <input type="text" class="form-control form-control-sm rounded-pill ps-4 pe-3 ${isDark ? 'bg-dark text-white border-secondary' : 'bg-light border-0'}" placeholder="${content.searchPlaceholder || 'Search...'}" style="font-size: 0.8rem; width: 160px;" />
        </div>` : ''}

        ${content.secondaryButtonText ? `
        <a href="${content.secondaryButtonUrl || '#'}" class="btn btn-sm btn-link text-decoration-none fw-semibold ${isDark ? 'text-slate-300 hover:text-white' : 'text-secondary hover:text-dark'} px-2.5" ${editAttr(isEditor, 'secondaryButtonText')}>
          ${content.secondaryButtonText}
        </a>` : ''}

        ${settings.showButtons ? `
        <a href="${content.primaryButtonUrl || '#'}" class="${btnClass}" ${editAttr(isEditor, 'primaryButtonText')}>
          ${content.primaryButtonText}
        </a>` : ''}
      </div>
    </div>
  </div>

  <style>
    #block-${block.id} .dropdown-mega {
      position: static !important;
    }
    #block-${block.id} .dropdown-mega > .dropdown-menu {
      border-top: 3px solid var(--bs-primary, #0d6efd) !important;
    }
    @media (min-width: 992px) {
      #block-${block.id} .dropdown-hover:hover > .dropdown-menu {
        display: block;
        margin-top: 0;
        animation: megaMenuFadeIn-${block.id} 0.2s ease forwards;
      }
    }
    @keyframes megaMenuFadeIn-${block.id} {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</nav>`;
    },
  },

  // 2. HERO SPLIT
  {
    type: 'hero-split',
    category: 'headers',
    name: 'Split Header & Media',
    description: 'High-impact split hero with bold headline, dual buttons, and image showcase',
    iconName: 'LayoutTemplate',
    tags: ['hero', 'header', 'banner', 'cta', 'split', 'stats', 'image', 'buttons'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#f8fafc',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: true,
      showMedia: true,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      badgeText: '✨ Bootstrap 5 Visual Builder',
      title: 'Build stunning responsive websites in minutes',
      description: 'Create mobile-friendly web pages visually without writing code manually. Drag, customize, and export clean, production-ready Bootstrap 5 code anytime.',
      primaryBtnText: 'Start Building Free',
      secondaryBtnText: 'Explore Features',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Website Dashboard Mockup',
      stat1Number: '99.8%',
      stat1Label: 'Uptime Reliability',
      stat2Number: '4.9/5',
      stat2Label: 'Client Satisfaction',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const btnPrimary = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} btn-lg px-4 py-3 shadow`;
      const btnSecondary = `btn btn-outline-${settings.textColor === 'light' ? 'light' : 'secondary'} ${settings.buttonPill ? 'rounded-pill' : ''} btn-lg px-4 py-3`;

      return `
<header id="block-${block.id}" data-block-id="${block.id}" class="position-relative overflow-hidden ${padding} ${className}" style="${style}">
  ${renderOverlay(settings)}
  <div class="${settings.containerWidth} position-relative" style="z-index: 2;">
    <div class="row align-items-center g-5">
      <div class="col-lg-6">
        ${settings.showSubtitle ? `
        <div class="d-inline-flex align-items-center gap-2 px-3 py-1 mb-3 rounded-pill border bg-body-tertiary shadow-sm">
          <span class="badge bg-primary rounded-pill">New</span>
          <span class="small fw-semibold" ${editAttr(isEditor, 'badgeText')}>${content.badgeText}</span>
        </div>` : ''}
        ${settings.showTitle ? `
        <h1 class="display-4 fw-extrabold tracking-tight mb-3 lh-sm" ${editAttr(isEditor, 'title')}>
          ${content.title}
        </h1>` : ''}
        ${settings.showDescription ? `
        <p class="lead opacity-75 mb-4 fs-5" ${editAttr(isEditor, 'description')}>
          ${content.description}
        </p>` : ''}
        ${settings.showButtons ? `
        <div class="d-flex flex-wrap gap-3 mb-4">
          <a href="#contact" class="${btnPrimary}" ${editAttr(isEditor, 'primaryBtnText')}>${content.primaryBtnText}</a>
          <a href="#features" class="${btnSecondary}" ${editAttr(isEditor, 'secondaryBtnText')}>${content.secondaryBtnText}</a>
        </div>` : ''}
        ${settings.showIcons ? `
        <div class="pt-3 border-top d-flex gap-4">
          <div>
            <h4 class="fw-bold mb-0 text-primary" ${editAttr(isEditor, 'stat1Number')}>${content.stat1Number}</h4>
            <small class="text-body-secondary" ${editAttr(isEditor, 'stat1Label')}>${content.stat1Label}</small>
          </div>
          <div class="border-start ps-4">
            <h4 class="fw-bold mb-0 text-primary" ${editAttr(isEditor, 'stat2Number')}>${content.stat2Number}</h4>
            <small class="text-body-secondary" ${editAttr(isEditor, 'stat2Label')}>${content.stat2Label}</small>
          </div>
        </div>` : ''}
      </div>
      ${settings.showMedia ? `
      <div class="col-lg-6">
        <div class="position-relative">
          <img src="${content.imageUrl}" alt="${content.imageAlt}" class="img-fluid rounded-4 shadow-lg border w-100" style="max-height: 480px; object-fit: cover;" />
        </div>
      </div>` : ''}
    </div>
  </div>
</header>`;
    },
  },

  // 3. HERO CENTERED
  {
    type: 'hero-centered',
    category: 'headers',
    name: 'Centered Hero Banner',
    description: 'Grand centered hero with background image overlay and call-to-action buttons',
    iconName: 'AlignCenter',
    tags: ['hero', 'header', 'banner', 'centered', 'background', 'overlay', 'cta', 'call to action'],
    defaultSettings: {
      bgType: 'image',
      bgColor: '#1e293b',
      bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
      bgOverlayOpacity: 65,
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'light',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: true,
      showMedia: false,
      showIcons: false,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      subtitle: 'MODERN WEB CRAFTSMANSHIP',
      title: 'Craft Websites Visually with Bootstrap 5',
      description: 'The intuitive no-code visual designer that gives you 100% clean, standard Bootstrap code. Responsive by default, mobile-optimized, and ultra fast.',
      button1: 'Get Started Now',
      button2: 'Watch Demo',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const btnPrimary = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} btn-lg px-5 py-3 shadow`;
      const btnSecondary = `btn btn-outline-light ${settings.buttonPill ? 'rounded-pill' : ''} btn-lg px-5 py-3`;

      return `
<header id="block-${block.id}" data-block-id="${block.id}" class="position-relative overflow-hidden ${padding} ${className} text-center" style="${style}">
  ${renderOverlay(settings)}
  <div class="${settings.containerWidth} position-relative py-5" style="z-index: 2;">
    <div class="row justify-content-center">
      <div class="col-lg-9 col-xl-8">
        ${settings.showSubtitle ? `
        <span class="text-uppercase fw-bold letter-spacing-2 text-warning d-block mb-3" ${editAttr(isEditor, 'subtitle')}>
          ${content.subtitle}
        </span>` : ''}
        ${settings.showTitle ? `
        <h1 class="display-3 fw-bold mb-4" ${editAttr(isEditor, 'title')}>
          ${content.title}
        </h1>` : ''}
        ${settings.showDescription ? `
        <p class="lead mb-5 opacity-90 fs-4 mx-auto" style="max-width: 720px;" ${editAttr(isEditor, 'description')}>
          ${content.description}
        </p>` : ''}
        ${settings.showButtons ? `
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a href="#pricing" class="${btnPrimary}" ${editAttr(isEditor, 'button1')}>${content.button1}</a>
          <a href="#features" class="${btnSecondary}" ${editAttr(isEditor, 'button2')}>${content.button2}</a>
        </div>` : ''}
      </div>
    </div>
  </div>
</header>`;
    },
  },

  // 4. FEATURES 3-COLUMN CARDS
  {
    type: 'features-3col',
    category: 'features',
    name: '3-Column Feature Cards',
    description: 'Three elevated cards with icons, descriptions, and callouts',
    iconName: 'Grid3X3',
    tags: ['features', 'cards', 'services', 'columns', 'icons', 'grid', 'card'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: false,
      showIcons: true,
      cardShadow: true,
      columns: 3,
    },
    defaultContent: {
      subtitle: 'POWERFUL CAPABILITIES',
      title: 'Everything You Need to Build',
      description: 'Discover the visual tools and clean architecture that make web authoring effortless.',
      item1Icon: 'bi-palette',
      item1Title: 'Visual Drag & Edit',
      item1Text: 'Customize parameters, toggle elements on and off, and edit any text inline directly inside the canvas.',
      item2Icon: 'bi-phone',
      item2Title: 'Fully Responsive',
      item2Text: 'Built strictly on Bootstrap 5 standard flexbox and grid, looking sharp on phones, tablets, and desktops.',
      item3Icon: 'bi-code-slash',
      item3Title: 'Clean Bootstrap Code',
      item3Text: 'Export pure, compliant HTML & CSS without lock-in, external bloat, or proprietary script runtimes.',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const cardShadow = settings.cardShadow ? 'shadow-sm hover-shadow transition' : '';
      const { rowClass, getItemColClass } = getGridClasses(settings, 3);
      const isMasonry = settings.layoutTemplate === 'masonry';
      const mOffset = (idx: number) => (isMasonry && idx === 1 ? 'style="margin-top: 1.5rem;"' : '');

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="${rowClass}">
      <div class="${getItemColClass(0, 3)}" ${mOffset(0)}>
        <div class="card h-100 border rounded-4 p-4 ${cardShadow}">
          <div class="card-body text-center p-2">
            ${settings.showIcons ? `
            <div class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-4 p-3 mb-4" style="width: 64px; height: 64px;">
              <i class="bi ${content.item1Icon || 'bi-palette'} fs-2"></i>
            </div>` : ''}
            <h4 class="card-title fw-bold mb-3" ${editAttr(isEditor, 'item1Title')}>${content.item1Title}</h4>
            <p class="card-text text-body-secondary" ${editAttr(isEditor, 'item1Text')}>${content.item1Text}</p>
          </div>
        </div>
      </div>
      <div class="${getItemColClass(1, 3)}" ${mOffset(1)}>
        <div class="card h-100 border rounded-4 p-4 ${cardShadow}">
          <div class="card-body text-center p-2">
            ${settings.showIcons ? `
            <div class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-4 p-3 mb-4" style="width: 64px; height: 64px;">
              <i class="bi ${content.item2Icon || 'bi-phone'} fs-2"></i>
            </div>` : ''}
            <h4 class="card-title fw-bold mb-3" ${editAttr(isEditor, 'item2Title')}>${content.item2Title}</h4>
            <p class="card-text text-body-secondary" ${editAttr(isEditor, 'item2Text')}>${content.item2Text}</p>
          </div>
        </div>
      </div>
      <div class="${getItemColClass(2, 3)}" ${mOffset(2)}>
        <div class="card h-100 border rounded-4 p-4 ${cardShadow}">
          <div class="card-body text-center p-2">
            ${settings.showIcons ? `
            <div class="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-4 p-3 mb-4" style="width: 64px; height: 64px;">
              <i class="bi ${content.item3Icon || 'bi-code-slash'} fs-2"></i>
            </div>` : ''}
            <h4 class="card-title fw-bold mb-3" ${editAttr(isEditor, 'item3Title')}>${content.item3Title}</h4>
            <p class="card-text text-body-secondary" ${editAttr(isEditor, 'item3Text')}>${content.item3Text}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 5. FEATURES SPLIT MEDIA
  {
    type: 'features-split',
    category: 'features',
    name: 'Feature with Media & Bullets',
    description: 'Side-by-side showcase with checklist highlights and an action button',
    iconName: 'Columns2',
    tags: ['features', 'split', 'media', 'bullets', 'checklist', 'image', 'card'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#f8fafc',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: true,
      showMedia: true,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      subtitle: 'EFFORTLESS CUSTOMIZATION',
      title: 'Customize Every Parameter Visually',
      description: 'Control layout boundaries, typography styles, padding scales, and backgrounds without touching a line of CSS.',
      bullet1: 'One-click block reordering, duplication, and removal',
      bullet2: 'Direct inline text & heading editing on canvas',
      bullet3: 'Instant live code view and single-file HTML export',
      btnText: 'Discover All Features',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
      imageAlt: 'Analytics Dashboard',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const btnClass = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} px-4 py-2 mt-2`;

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="row align-items-center g-5">
      ${settings.showMedia ? `
      <div class="col-lg-6">
        <img src="${content.imageUrl}" alt="${content.imageAlt}" class="img-fluid rounded-4 shadow border" />
      </div>` : ''}
      <div class="${settings.showMedia ? 'col-lg-6' : 'col-lg-8 mx-auto'}">
        ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
        ${settings.showTitle ? `<h2 class="display-6 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
        ${settings.showDescription ? `<p class="text-body-secondary fs-5 mb-4" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
        
        <ul class="list-unstyled mb-4 d-flex flex-column gap-3">
          <li class="d-flex align-items-center gap-3">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span class="fw-medium" ${editAttr(isEditor, 'bullet1')}>${content.bullet1}</span>
          </li>
          <li class="d-flex align-items-center gap-3">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span class="fw-medium" ${editAttr(isEditor, 'bullet2')}>${content.bullet2}</span>
          </li>
          <li class="d-flex align-items-center gap-3">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span class="fw-medium" ${editAttr(isEditor, 'bullet3')}>${content.bullet3}</span>
          </li>
        </ul>

        ${settings.showButtons ? `<a href="#contact" class="${btnClass}" ${editAttr(isEditor, 'btnText')}>${content.btnText}</a>` : ''}
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 6. CONTENT / ABOUT WITH STATS
  {
    type: 'content-about',
    category: 'content',
    name: 'About & Metrics Story',
    description: 'Story headline with narrative paragraphs and 3 high-impact metric boxes',
    iconName: 'FileText',
    tags: ['about', 'content', 'story', 'stats', 'metrics', 'company', 'numbers'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: false,
      showIcons: true,
    },
    defaultContent: {
      subtitle: 'OUR MISSION & CRAFT',
      title: 'Empowering Creators Worldwide',
      paragraph1: 'We believe building professional websites should not require hundreds of complex dependencies or cumbersome setups. CloudboyX pioneered visual block assembly, and our Bootstrap 5 editor brings that power directly into your browser.',
      paragraph2: 'Every section is carefully engineered according to official Bootstrap standards, ensuring responsive fluidity, high contrast accessibility, and effortless code reuse.',
      stat1Val: '10,000+',
      stat1Text: 'Websites Launched',
      stat2Val: '99.9%',
      stat2Text: 'Bootstrap Compliance',
      stat3Val: '0 kb',
      stat3Text: 'Vendor Lock-in',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="row g-5 mb-5 align-items-center">
      <div class="col-lg-5">
        ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
        ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      </div>
      <div class="col-lg-7">
        <p class="lead text-body-secondary mb-3" ${editAttr(isEditor, 'paragraph1')}>${content.paragraph1}</p>
        <p class="text-body-secondary mb-0" ${editAttr(isEditor, 'paragraph2')}>${content.paragraph2}</p>
      </div>
    </div>
    <div class="row g-4 text-center">
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-body-tertiary border">
          <h3 class="display-4 fw-extrabold text-primary mb-1" ${editAttr(isEditor, 'stat1Val')}>${content.stat1Val}</h3>
          <p class="text-body-secondary fw-medium mb-0" ${editAttr(isEditor, 'stat1Text')}>${content.stat1Text}</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-body-tertiary border">
          <h3 class="display-4 fw-extrabold text-primary mb-1" ${editAttr(isEditor, 'stat2Val')}>${content.stat2Val}</h3>
          <p class="text-body-secondary fw-medium mb-0" ${editAttr(isEditor, 'stat2Text')}>${content.stat2Text}</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-body-tertiary border">
          <h3 class="display-4 fw-extrabold text-primary mb-1" ${editAttr(isEditor, 'stat3Val')}>${content.stat3Val}</h3>
          <p class="text-body-secondary fw-medium mb-0" ${editAttr(isEditor, 'stat3Text')}>${content.stat3Text}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 7. PRICING 3-TIERS
  {
    type: 'pricing-tiers',
    category: 'pricing',
    name: '3-Tier Pricing Table',
    description: 'Pricing plans with featured badge, feature checklists, and action buttons',
    iconName: 'CreditCard',
    tags: ['pricing', 'plans', 'tiers', 'subscription', 'table', 'cards', 'billing', 'card'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#f8fafc',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: true,
      showMedia: false,
      showIcons: true,
      cardShadow: true,
      buttonPill: true,
    },
    defaultContent: {
      subtitle: 'SIMPLE & TRANSPARENT',
      title: 'Flexible Plans for Every Project',
      description: 'Choose the plan that fits your business needs. Upgrade or cancel anytime.',
      // Tier 1
      tier1Name: 'Starter',
      tier1Price: '$0',
      tier1Period: '/ forever',
      tier1Feat1: 'Up to 3 Website Projects',
      tier1Feat2: 'Standard Bootstrap 5 Blocks',
      tier1Feat3: 'Single-file HTML Export',
      tier1Btn: 'Get Started Free',
      // Tier 2 (Featured)
      tier2Name: 'Professional',
      tier2Price: '$29',
      tier2Period: '/ month',
      tier2Badge: 'Most Popular',
      tier2Feat1: 'Unlimited Websites & Blocks',
      tier2Feat2: 'Custom Theme Palette Generator',
      tier2Feat3: 'Production ZIP Code Export',
      tier2Feat4: 'Priority Support & Updates',
      tier2Btn: 'Start 14-Day Free Trial',
      // Tier 3
      tier3Name: 'Enterprise',
      tier3Price: '$89',
      tier3Period: '/ month',
      tier3Feat1: 'Team Collaboration Seats',
      tier3Feat2: 'Custom Component Library',
      tier3Feat3: 'Dedicated Cloud CDN Hosting',
      tier3Feat4: 'White-Label Branding',
      tier3Btn: 'Contact Enterprise',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const { rowClass, getItemColClass } = getGridClasses(settings, 3);

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="${rowClass}">
      <!-- Tier 1 -->
      <div class="${getItemColClass(0, 3)}">
        <div class="card h-100 rounded-4 border p-4 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold mb-3" ${editAttr(isEditor, 'tier1Name')}>${content.tier1Name}</h4>
            <div class="d-flex align-items-baseline mb-4">
              <span class="display-4 fw-bold" ${editAttr(isEditor, 'tier1Price')}>${content.tier1Price}</span>
              <span class="text-body-secondary ms-1" ${editAttr(isEditor, 'tier1Period')}>${content.tier1Period}</span>
            </div>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-4">
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier1Feat1')}>${content.tier1Feat1}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier1Feat2')}>${content.tier1Feat2}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier1Feat3')}>${content.tier1Feat3}</span></li>
            </ul>
            <a href="#contact" class="btn btn-outline-primary ${settings.buttonPill ? 'rounded-pill' : ''} w-100 py-2" ${editAttr(isEditor, 'tier1Btn')}>${content.tier1Btn}</a>
          </div>
        </div>
      </div>
      <!-- Tier 2 Featured -->
      <div class="${getItemColClass(1, 3)}">
        <div class="card h-100 rounded-4 border-2 border-primary p-4 shadow-lg position-relative bg-body">
          <span class="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary px-3 py-2 text-uppercase fw-semibold" ${editAttr(isEditor, 'tier2Badge')}>
            ${content.tier2Badge}
          </span>
          <div class="card-body">
            <h4 class="fw-bold text-primary mb-3" ${editAttr(isEditor, 'tier2Name')}>${content.tier2Name}</h4>
            <div class="d-flex align-items-baseline mb-4">
              <span class="display-4 fw-bold text-primary" ${editAttr(isEditor, 'tier2Price')}>${content.tier2Price}</span>
              <span class="text-body-secondary ms-1" ${editAttr(isEditor, 'tier2Period')}>${content.tier2Period}</span>
            </div>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-4">
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill text-primary fs-5"></i><span class="fw-medium" ${editAttr(isEditor, 'tier2Feat1')}>${content.tier2Feat1}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill text-primary fs-5"></i><span class="fw-medium" ${editAttr(isEditor, 'tier2Feat2')}>${content.tier2Feat2}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill text-primary fs-5"></i><span class="fw-medium" ${editAttr(isEditor, 'tier2Feat3')}>${content.tier2Feat3}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill text-primary fs-5"></i><span class="fw-medium" ${editAttr(isEditor, 'tier2Feat4')}>${content.tier2Feat4}</span></li>
            </ul>
            <a href="#contact" class="btn btn-primary ${settings.buttonPill ? 'rounded-pill' : ''} w-100 py-3 shadow" ${editAttr(isEditor, 'tier2Btn')}>${content.tier2Btn}</a>
          </div>
        </div>
      </div>
      <!-- Tier 3 -->
      <div class="${getItemColClass(2, 3)}">
        <div class="card h-100 rounded-4 border p-4 shadow-sm">
          <div class="card-body">
            <h4 class="fw-bold mb-3" ${editAttr(isEditor, 'tier3Name')}>${content.tier3Name}</h4>
            <div class="d-flex align-items-baseline mb-4">
              <span class="display-4 fw-bold" ${editAttr(isEditor, 'tier3Price')}>${content.tier3Price}</span>
              <span class="text-body-secondary ms-1" ${editAttr(isEditor, 'tier3Period')}>${content.tier3Period}</span>
            </div>
            <ul class="list-unstyled d-flex flex-column gap-3 mb-4">
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier3Feat1')}>${content.tier3Feat1}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier3Feat2')}>${content.tier3Feat2}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier3Feat3')}>${content.tier3Feat3}</span></li>
              <li class="d-flex align-items-center gap-2"><i class="bi bi-check2 text-primary fs-5"></i><span ${editAttr(isEditor, 'tier3Feat4')}>${content.tier3Feat4}</span></li>
            </ul>
            <a href="#contact" class="btn btn-outline-dark ${settings.buttonPill ? 'rounded-pill' : ''} w-100 py-2" ${editAttr(isEditor, 'tier3Btn')}>${content.tier3Btn}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 8. GALLERY / PORTFOLIO GRID
  {
    type: 'gallery-grid',
    category: 'gallery',
    name: 'Portfolio Gallery Grid',
    description: 'Responsive 6-item media gallery with labels and category highlights',
    iconName: 'Image',
    tags: ['gallery', 'portfolio', 'work', 'projects', 'images', 'photos', 'grid', 'cards'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: false,
    },
    defaultContent: {
      subtitle: 'SELECTED WORKS',
      title: 'Our Visual Showcase',
      description: 'Explore projects designed and published using modern responsive layouts.',
      item1Img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      item1Title: 'Fintech Portal',
      item1Category: 'Web App',
      item2Img: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=600&q=80',
      item2Title: 'Minimal Brand Studio',
      item2Category: 'Identity',
      item3Img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      item3Title: 'Commerce Store',
      item3Category: 'E-Commerce',
      item4Img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      item4Title: 'Analytics Hub',
      item4Category: 'SaaS Platform',
      item5Img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      item5Title: 'Creative Agency',
      item5Category: 'Design',
      item6Img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
      item6Title: 'Architectural Digest',
      item6Category: 'Publication',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const { rowClass, getItemColClass } = getGridClasses(settings, 3);
      const isMasonry = settings.layoutTemplate === 'masonry';

      const items = [
        { img: content.item1Img, title: content.item1Title, cat: content.item1Category, tKey: 'item1Title', cKey: 'item1Category' },
        { img: content.item2Img, title: content.item2Title, cat: content.item2Category, tKey: 'item2Title', cKey: 'item2Category' },
        { img: content.item3Img, title: content.item3Title, cat: content.item3Category, tKey: 'item3Title', cKey: 'item3Category' },
        { img: content.item4Img, title: content.item4Title, cat: content.item4Category, tKey: 'item4Title', cKey: 'item4Category' },
        { img: content.item5Img, title: content.item5Title, cat: content.item5Category, tKey: 'item5Title', cKey: 'item5Category' },
        { img: content.item6Img, title: content.item6Title, cat: content.item6Category, tKey: 'item6Title', cKey: 'item6Category' },
      ];

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="${rowClass}">
      ${items.map((it, idx) => {
        const colClass = getItemColClass(idx, items.length);
        const imgHeight = isMasonry ? [310, 210, 260, 320, 220, 270][idx % 6] : 240;
        return `
      <div class="${colClass}">
        <div class="card border-0 rounded-4 overflow-hidden shadow-sm h-100 position-relative group">
          <img src="${it.img}" alt="${it.title}" class="card-img-top w-100" style="height: ${imgHeight}px; object-fit: cover;" />
          <div class="card-body p-3 bg-body">
            <span class="badge bg-primary-subtle text-primary mb-1" ${editAttr(isEditor, it.cKey)}>${it.cat}</span>
            <h5 class="fw-bold mb-0" ${editAttr(isEditor, it.tKey)}>${it.title}</h5>
          </div>
        </div>
      </div>`;
      }).join('')}
    </div>
  </div>
</section>`;
    },
  },

  // 8B. MEDIA CAROUSEL (IMAGES & VIDEOS)
  {
    type: 'media-carousel',
    category: 'gallery',
    name: 'Media Carousel (Video & Image)',
    description: 'Interactive responsive Bootstrap 5 carousel supporting mixed videos (MP4, YouTube, Vimeo) and images with slide captions, touch swipe, and playback controls',
    iconName: 'Film',
    tags: ['carousel', 'slider', 'media', 'video', 'images', 'youtube', 'vimeo', 'gallery', 'showcase', 'slideshow', 'mp4'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#0f172a',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'light',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: true,
      aspectRatio: '16x9',
      carouselAutoplay: true,
      carouselInterval: 5000,
      carouselIndicators: true,
      carouselControls: true,
      carouselTransition: 'slide',
      carouselPauseOnHover: true,
    },
    defaultContent: {
      subtitle: 'INTERACTIVE MEDIA CAROUSEL',
      title: 'Dynamic Video & Image Showcase',
      description: 'Streamline storytelling with mixed MP4 video clips, streaming embeds, and high-resolution photo slides.',
      slides: [
        {
          id: 'slide-1',
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
          title: 'High-Definition Video Experience',
          caption: 'Native HTML5 video playback with responsive aspect ratio containment and smooth controls.',
          badge: 'HTML5 Video',
        },
        {
          id: 'slide-2',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
          poster: '',
          title: 'Modern Creative Workspace',
          caption: 'High-resolution responsive imagery with rich typography and backdrop blur caption overlays.',
          badge: 'Photo Slide',
        },
        {
          id: 'slide-3',
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          title: 'Embedded YouTube & Cloud Video',
          caption: 'Seamlessly frame external streaming video providers without aspect ratio distortion or layout shifts.',
          badge: 'Cloud Embed',
        },
        {
          id: 'slide-4',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
          poster: '',
          title: 'Responsive Architecture',
          caption: 'Auto-adapts layout between mobile devices, tablets, and ultra-wide desktop monitors.',
          badge: 'Responsive',
        },
      ],
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const carouselId = `carousel-${block.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;

      let rawSlides = content.slides;
      if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
        rawSlides = [
          {
            id: 'slide-1',
            type: content.slide1Type || 'video',
            url: content.slide1Url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            poster: content.slide1Poster || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
            title: content.slide1Title || 'High-Definition Video Experience',
            caption: content.slide1Caption || 'Native HTML5 video playback with responsive aspect ratio containment.',
            badge: content.slide1Badge || 'HTML5 Video',
          },
          {
            id: 'slide-2',
            type: content.slide2Type || 'image',
            url: content.slide2Url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
            poster: '',
            title: content.slide2Title || 'Modern Creative Workspace',
            caption: content.slide2Caption || 'High-resolution responsive imagery with rich typography.',
            badge: content.slide2Badge || 'Photo Slide',
          },
        ];
      }

      const ratio = settings.aspectRatio || '16x9';
      const isFade = settings.carouselTransition === 'crossfade';
      const autoplay = settings.carouselAutoplay !== false;
      const interval = typeof settings.carouselInterval === 'number' ? settings.carouselInterval : 5000;
      const showIndicators = settings.carouselIndicators !== false;
      const showControls = settings.carouselControls !== false;
      const pauseOnHover = settings.carouselPauseOnHover !== false;

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    ${(settings.showTitle || settings.showSubtitle || settings.showDescription) ? `
    <div class="text-${settings.textAlign} mb-4">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle || 'INTERACTIVE MEDIA CAROUSEL'}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title || 'Dynamic Video & Image Showcase'}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 720px;" ${editAttr(isEditor, 'description')}>${content.description || 'Explore rich visual storytelling with responsive video clips and photography.'}</p>` : ''}
    </div>` : ''}

    <div class="position-relative mx-auto" style="max-width: 1060px;">
      <div id="${carouselId}" class="carousel slide ${isFade ? 'carousel-fade' : ''} rounded-4 overflow-hidden shadow-2xl border border-secondary border-opacity-25" data-bs-ride="${autoplay ? 'carousel' : 'false'}" data-bs-interval="${interval}" ${pauseOnHover ? 'data-bs-pause="hover"' : 'data-bs-pause="false"'}>
        ${showIndicators && rawSlides.length > 1 ? `
        <div class="carousel-indicators mb-3">
          ${rawSlides.map((_, idx) => `
            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${idx}" class="${idx === 0 ? 'active' : ''}" aria-current="${idx === 0 ? 'true' : 'false'}" aria-label="Slide ${idx + 1}"></button>
          `).join('')}
        </div>` : ''}

        <div class="carousel-inner">
          ${rawSlides.map((slide, idx) => {
            const isActive = idx === 0;
            const isVideo = slide.type === 'video';
            const url = slide.url || '';
            const isEmbed = isVideo && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com'));

            let mediaHtml = '';
            if (isVideo) {
              if (isEmbed) {
                let embedSrc = url;
                if (url.includes('watch?v=')) {
                  embedSrc = url.replace('watch?v=', 'embed/');
                }
                mediaHtml = `<iframe src="${embedSrc}" title="${slide.title || 'Video slide'}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-100 h-100 border-0"></iframe>`;
              } else {
                mediaHtml = `<video class="w-100 h-100" style="object-fit: cover;" controls playsinline preload="metadata" ${slide.poster ? `poster="${slide.poster}"` : ''}><source src="${url}" type="video/mp4">Your browser does not support HTML5 video.</video>`;
              }
            } else {
              mediaHtml = `<img src="${url}" alt="${slide.title || 'Slide Image'}" class="w-100 h-100" style="object-fit: cover;" loading="lazy" />`;
            }

            return `
          <div class="carousel-item ${isActive ? 'active' : ''}">
            <div class="ratio ratio-${ratio} bg-black">
              ${mediaHtml}
            </div>
            ${(slide.title || slide.caption || slide.badge) ? `
            <div class="carousel-caption text-start p-4 p-md-5 d-flex flex-column justify-content-end pointer-events-none" style="background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 55%, transparent 100%); bottom: 0; left: 0; right: 0;">
              ${slide.badge ? `<span class="badge bg-primary text-white text-uppercase tracking-wider fw-bold mb-2 align-self-start shadow-sm">${slide.badge}</span>` : ''}
              ${slide.title ? `<h3 class="h3 fw-bold text-white mb-2 text-shadow" style="text-shadow: 0 2px 4px rgba(0,0,0,0.6);">${slide.title}</h3>` : ''}
              ${slide.caption ? `<p class="lead text-white-50 mb-0 d-none d-sm-block text-shadow" style="max-width: 650px; text-shadow: 0 1px 3px rgba(0,0,0,0.6); font-size: 1rem;">${slide.caption}</p>` : ''}
            </div>` : ''}
          </div>`;
          }).join('')}
        </div>

        ${showControls && rawSlides.length > 1 ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev" aria-label="Previous Slide">
          <span class="carousel-control-prev-icon p-3 rounded-circle bg-dark bg-opacity-50" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next" aria-label="Next Slide">
          <span class="carousel-control-next-icon p-3 rounded-circle bg-dark bg-opacity-50" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>` : ''}
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 9. TESTIMONIALS
  {
    type: 'testimonials-cards',
    category: 'testimonials',
    name: 'Customer Testimonials',
    description: 'Three review cards with 5-star ratings, quotes, and client avatars',
    iconName: 'MessageSquareQuote',
    tags: ['testimonials', 'reviews', 'quotes', 'social proof', 'stars', 'ratings', 'customers', 'cards', 'feedback'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#f8fafc',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: true,
      cardShadow: true,
    },
    defaultContent: {
      subtitle: 'PROVEN CLIENT RESULTS',
      title: 'Loved by Creators and Developers',
      description: 'Here is what our community has to say about creating with our visual block editor.',
      r1Quote: '"CloudboyX was my favorite tool for years, and having this fast Bootstrap 5 builder with visual parameter toggles in the browser is a game changer."',
      r1Name: 'Sarah Jenkins',
      r1Role: 'Founder, Studio North',
      r1Avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      r2Quote: '"Exporting pristine Bootstrap HTML without bizarre class names or heavy proprietary scripts saved us weeks of front-end development."',
      r2Name: 'Alex Rivera',
      r2Role: 'Lead Engineer, ScaleUp',
      r2Avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      r3Quote: '"The ability to visually adjust block settings, paddings, and background images directly in real-time makes client prototyping ridiculously quick."',
      r3Name: 'Elena Rostova',
      r3Role: 'UX Consultant',
      r3Avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const { rowClass, getItemColClass } = getGridClasses(settings, 3);
      const isMasonry = settings.layoutTemplate === 'masonry';
      const mOffset = (idx: number) => (isMasonry && idx === 1 ? 'style="margin-top: 1.5rem;"' : '');

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="${rowClass}">
      <div class="${getItemColClass(0, 3)}" ${mOffset(0)}>
        <div class="card h-100 border rounded-4 p-4 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="text-warning mb-3">
              <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i>
            </div>
            <p class="card-text text-body-secondary fs-5 fst-italic mb-4 flex-grow-1" ${editAttr(isEditor, 'r1Quote')}>${content.r1Quote}</p>
            <div class="d-flex align-items-center gap-3 pt-3 border-top">
              <img src="${content.r1Avatar}" alt="${content.r1Name}" class="rounded-circle" width="48" height="48" style="object-fit: cover;" />
              <div>
                <h6 class="fw-bold mb-0" ${editAttr(isEditor, 'r1Name')}>${content.r1Name}</h6>
                <small class="text-body-secondary" ${editAttr(isEditor, 'r1Role')}>${content.r1Role}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="${getItemColClass(1, 3)}" ${mOffset(1)}>
        <div class="card h-100 border rounded-4 p-4 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="text-warning mb-3">
              <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i>
            </div>
            <p class="card-text text-body-secondary fs-5 fst-italic mb-4 flex-grow-1" ${editAttr(isEditor, 'r2Quote')}>${content.r2Quote}</p>
            <div class="d-flex align-items-center gap-3 pt-3 border-top">
              <img src="${content.r2Avatar}" alt="${content.r2Name}" class="rounded-circle" width="48" height="48" style="object-fit: cover;" />
              <div>
                <h6 class="fw-bold mb-0" ${editAttr(isEditor, 'r2Name')}>${content.r2Name}</h6>
                <small class="text-body-secondary" ${editAttr(isEditor, 'r2Role')}>${content.r2Role}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="${getItemColClass(2, 3)}" ${mOffset(2)}>
        <div class="card h-100 border rounded-4 p-4 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="text-warning mb-3">
              <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i> <i class="bi bi-star-fill"></i>
            </div>
            <p class="card-text text-body-secondary fs-5 fst-italic mb-4 flex-grow-1" ${editAttr(isEditor, 'r3Quote')}>${content.r3Quote}</p>
            <div class="d-flex align-items-center gap-3 pt-3 border-top">
              <img src="${content.r3Avatar}" alt="${content.r3Name}" class="rounded-circle" width="48" height="48" style="object-fit: cover;" />
              <div>
                <h6 class="fw-bold mb-0" ${editAttr(isEditor, 'r3Name')}>${content.r3Name}</h6>
                <small class="text-body-secondary" ${editAttr(isEditor, 'r3Role')}>${content.r3Role}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 10. TEAM SHOWCASE
  {
    type: 'team-showcase',
    category: 'team',
    name: 'Team & Leadership Cards',
    description: 'Elevated profile cards with member portraits, job roles, bios, and social links',
    iconName: 'Users',
    tags: ['team', 'members', 'staff', 'about', 'people', 'leadership', 'avatars', 'social', 'cards'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: true,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      subtitle: 'OUR TALENTED PEOPLE',
      title: 'Meet the Minds Behind the Studio',
      description: 'A passionate group of designers, engineers, and creators dedicated to crafting accessible web tools.',
      m1Name: 'Sarah Jenkins',
      m1Role: 'Founder & Head of Product',
      m1Bio: 'Former design lead with over a decade of building user-first web applications and design systems.',
      m1Image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      m2Name: 'Alex Rivera',
      m2Role: 'Chief Technology Officer',
      m2Bio: 'Open-source enthusiast, Bootstrap core contributor, and web performance architect.',
      m2Image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      m3Name: 'Elena Rostova',
      m3Role: 'Design Systems Lead',
      m3Bio: 'Specializes in responsive layouts, typography scales, and accessible component libraries.',
      m3Image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const { rowClass, getItemColClass } = getGridClasses(settings, 3);
      const isMasonry = settings.layoutTemplate === 'masonry';
      const mOffset = (idx: number) => (isMasonry && idx === 1 ? 'style="margin-top: 1.5rem;"' : '');

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="${rowClass}">
      <div class="${getItemColClass(0, 3)}" ${mOffset(0)}>
        <div class="card h-100 border rounded-4 shadow-sm text-center p-4 hover-shadow transition">
          ${settings.showMedia ? `
          <div class="mb-4">
            <img src="${content.m1Image}" alt="${content.m1Name}" class="rounded-circle shadow-sm mx-auto" style="width: 120px; height: 120px; object-fit: cover;" />
          </div>` : ''}
          <h4 class="fw-bold mb-1" ${editAttr(isEditor, 'm1Name')}>${content.m1Name}</h4>
          <p class="text-primary fw-medium small mb-3" ${editAttr(isEditor, 'm1Role')}>${content.m1Role}</p>
          <p class="text-body-secondary small mb-4" ${editAttr(isEditor, 'm1Bio')}>${content.m1Bio}</p>
          ${settings.showIcons ? `
          <div class="d-flex justify-content-center gap-3 mt-auto fs-5 text-body-secondary">
            <a href="#" class="text-reset"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-github"></i></a>
          </div>` : ''}
        </div>
      </div>
      <div class="${getItemColClass(1, 3)}" ${mOffset(1)}>
        <div class="card h-100 border rounded-4 shadow-sm text-center p-4 hover-shadow transition">
          ${settings.showMedia ? `
          <div class="mb-4">
            <img src="${content.m2Image}" alt="${content.m2Name}" class="rounded-circle shadow-sm mx-auto" style="width: 120px; height: 120px; object-fit: cover;" />
          </div>` : ''}
          <h4 class="fw-bold mb-1" ${editAttr(isEditor, 'm2Name')}>${content.m2Name}</h4>
          <p class="text-primary fw-medium small mb-3" ${editAttr(isEditor, 'm2Role')}>${content.m2Role}</p>
          <p class="text-body-secondary small mb-4" ${editAttr(isEditor, 'm2Bio')}>${content.m2Bio}</p>
          ${settings.showIcons ? `
          <div class="d-flex justify-content-center gap-3 mt-auto fs-5 text-body-secondary">
            <a href="#" class="text-reset"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-github"></i></a>
          </div>` : ''}
        </div>
      </div>
      <div class="${getItemColClass(2, 3)}" ${mOffset(2)}>
        <div class="card h-100 border rounded-4 shadow-sm text-center p-4 hover-shadow transition">
          ${settings.showMedia ? `
          <div class="mb-4">
            <img src="${content.m3Image}" alt="${content.m3Name}" class="rounded-circle shadow-sm mx-auto" style="width: 120px; height: 120px; object-fit: cover;" />
          </div>` : ''}
          <h4 class="fw-bold mb-1" ${editAttr(isEditor, 'm3Name')}>${content.m3Name}</h4>
          <p class="text-primary fw-medium small mb-3" ${editAttr(isEditor, 'm3Role')}>${content.m3Role}</p>
          <p class="text-body-secondary small mb-4" ${editAttr(isEditor, 'm3Bio')}>${content.m3Bio}</p>
          ${settings.showIcons ? `
          <div class="d-flex justify-content-center gap-3 mt-auto fs-5 text-body-secondary">
            <a href="#" class="text-reset"><i class="bi bi-twitter-x"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="text-reset"><i class="bi bi-github"></i></a>
          </div>` : ''}
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 11. CONTACT FORM & INFO
  {
    type: 'contact-split',
    category: 'forms',
    name: 'Contact Form & Details',
    description: 'Working Bootstrap form with floating labels and company contact card',
    iconName: 'Mail',
    tags: ['contact', 'form', 'email', 'address', 'phone', 'inputs', 'message', 'support', 'card'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#ffffff',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: true,
      showMedia: false,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      subtitle: 'GET IN TOUCH',
      title: 'Ready to Start Your Next Project?',
      description: 'Fill out the form below or reach out to our team directly. We answer all inquiries within 24 hours.',
      address: '742 Evergreen Terrace, Suite 400, Springfield',
      phone: '+1 (555) 234-5678',
      email: 'hello@cloudboyx.io',
      hours: 'Mon - Fri: 9:00 AM - 6:00 PM EST',
      btnText: 'Send Message',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);
      const btnClass = `btn btn-${settings.buttonVariant || 'primary'} ${settings.buttonPill ? 'rounded-pill' : ''} px-5 py-3 w-100 shadow`;

      return `
<section id="contact" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="row g-5">
      <div class="col-lg-5">
        ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
        ${settings.showTitle ? `<h2 class="display-6 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
        ${settings.showDescription ? `<p class="text-body-secondary fs-5 mb-4" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
        
        <div class="p-4 rounded-4 bg-body-tertiary border d-flex flex-column gap-3">
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-geo-alt-fill text-primary fs-4 mt-1"></i>
            <div>
              <span class="d-block fw-bold">Office Headquarters</span>
              <span class="text-body-secondary" ${editAttr(isEditor, 'address')}>${content.address}</span>
            </div>
          </div>
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-telephone-fill text-primary fs-4 mt-1"></i>
            <div>
              <span class="d-block fw-bold">Phone Support</span>
              <span class="text-body-secondary" ${editAttr(isEditor, 'phone')}>${content.phone}</span>
            </div>
          </div>
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-envelope-fill text-primary fs-4 mt-1"></i>
            <div>
              <span class="d-block fw-bold">Email Inquiries</span>
              <span class="text-body-secondary" ${editAttr(isEditor, 'email')}>${content.email}</span>
            </div>
          </div>
          <div class="d-flex align-items-start gap-3">
            <i class="bi bi-clock-fill text-primary fs-4 mt-1"></i>
            <div>
              <span class="d-block fw-bold">Working Hours</span>
              <span class="text-body-secondary" ${editAttr(isEditor, 'hours')}>${content.hours}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="card rounded-4 border p-4 p-md-5 shadow-sm">
          <form onsubmit="event.preventDefault(); alert('Message sent successfully!');">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="text" class="form-control rounded-3" id="contact-name" placeholder="John Doe" required />
                  <label for="contact-name">Your Full Name</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input type="email" class="form-control rounded-3" id="contact-email" placeholder="name@example.com" required />
                  <label for="contact-email">Email Address</label>
                </div>
              </div>
              <div class="col-12">
                <div class="form-floating mb-3">
                  <select class="form-select rounded-3" id="contact-subject">
                    <option selected>General Website Inquiry</option>
                    <option>Custom Development</option>
                    <option>Design Consultation</option>
                    <option>Partnership Request</option>
                  </select>
                  <label for="contact-subject">How can we help?</label>
                </div>
              </div>
              <div class="col-12">
                <div class="form-floating mb-4">
                  <textarea class="form-control rounded-3" placeholder="Tell us about your project..." id="contact-msg" style="height: 140px;" required></textarea>
                  <label for="contact-msg">Your Message</label>
                </div>
              </div>
              <div class="col-12">
                <button type="submit" class="${btnClass}" ${editAttr(isEditor, 'btnText')}>${content.btnText}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 11. FAQ ACCORDION
  {
    type: 'faq-accordion',
    category: 'content',
    name: 'FAQ Accordion',
    description: 'Bootstrap accordion for frequently asked questions with interactive collapsing',
    iconName: 'HelpCircle',
    tags: ['faq', 'questions', 'accordion', 'collapse', 'answers', 'support', 'help'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#f8fafc',
      paddingTop: 5,
      paddingBottom: 5,
      containerWidth: 'container',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: true,
      showSubtitle: true,
      showDescription: true,
      showButtons: false,
      showMedia: false,
      showIcons: false,
    },
    defaultContent: {
      subtitle: 'QUESTIONS & ANSWERS',
      title: 'Frequently Asked Questions',
      description: 'Have questions about how this visual Bootstrap 5 editor works? Find quick answers here.',
      q1: 'Is the exported code genuine Bootstrap 5?',
      a1: 'Yes! The exported code utilizes official Bootstrap 5.3.3 CSS and JS bundles directly from standard CDNs. There are zero proprietary runtime scripts or hidden vendor lock-ins.',
      q2: 'Can I edit text directly inside the canvas like CloudboyX?',
      a2: 'Absolutely. Simply click on any heading, paragraph, button, or badge in the live preview canvas to type and edit in real-time.',
      q3: 'Can I host this exported HTML anywhere?',
      a3: 'Yes, because the exported HTML is a single standalone document or static asset, you can host it on GitHub Pages, Netlify, Vercel, Apache, NGINX, or any standard web server.',
      q4: 'How do I customize the block parameters and backgrounds?',
      a4: 'Click the Gear icon on any block or select it to open the Block Parameters panel. You can change background colors, background images with overlays, container width, paddings, and toggle elements on/off.',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);

      return `
<section id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className}" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="text-${settings.textAlign} mb-5">
      ${settings.showSubtitle ? `<p class="text-primary fw-bold text-uppercase mb-2" ${editAttr(isEditor, 'subtitle')}>${content.subtitle}</p>` : ''}
      ${settings.showTitle ? `<h2 class="display-5 fw-bold mb-3" ${editAttr(isEditor, 'title')}>${content.title}</h2>` : ''}
      ${settings.showDescription ? `<p class="lead text-body-secondary mx-auto" style="max-width: 700px;" ${editAttr(isEditor, 'description')}>${content.description}</p>` : ''}
    </div>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="accordion accordion-flush rounded-4 overflow-hidden border shadow-sm" id="acc-${block.id}">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#col-1-${block.id}">
                <span ${editAttr(isEditor, 'q1')}>${content.q1}</span>
              </button>
            </h2>
            <div id="col-1-${block.id}" class="accordion-collapse collapse show" data-bs-parent="#acc-${block.id}">
              <div class="accordion-body text-body-secondary leading-relaxed" ${editAttr(isEditor, 'a1')}>
                ${content.a1}
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#col-2-${block.id}">
                <span ${editAttr(isEditor, 'q2')}>${content.q2}</span>
              </button>
            </h2>
            <div id="col-2-${block.id}" class="accordion-collapse collapse" data-bs-parent="#acc-${block.id}">
              <div class="accordion-body text-body-secondary leading-relaxed" ${editAttr(isEditor, 'a2')}>
                ${content.a2}
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#col-3-${block.id}">
                <span ${editAttr(isEditor, 'q3')}>${content.q3}</span>
              </button>
            </h2>
            <div id="col-3-${block.id}" class="accordion-collapse collapse" data-bs-parent="#acc-${block.id}">
              <div class="accordion-body text-body-secondary leading-relaxed" ${editAttr(isEditor, 'a3')}>
                ${content.a3}
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#col-4-${block.id}">
                <span ${editAttr(isEditor, 'q4')}>${content.q4}</span>
              </button>
            </h2>
            <div id="col-4-${block.id}" class="accordion-collapse collapse" data-bs-parent="#acc-${block.id}">
              <div class="accordion-body text-body-secondary leading-relaxed" ${editAttr(isEditor, 'a4')}>
                ${content.a4}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
    },
  },

  // 12. FOOTER MULTI-COLUMN
  {
    type: 'footer-columns',
    category: 'footers',
    name: 'Multi-Column Footer',
    description: '4-column footer with company bio, links, newsletter, and social icons',
    iconName: 'PanelBottom',
    tags: ['footer', 'bottom', 'copyright', 'social', 'links', 'newsletter', 'navigation'],
    defaultSettings: {
      bgType: 'color',
      bgColor: '#0f172a',
      paddingTop: 5,
      paddingBottom: 4,
      containerWidth: 'container',
      textColor: 'light',
      textAlign: 'start',
      showTitle: true,
      showSubtitle: false,
      showDescription: true,
      showButtons: true,
      showMedia: true,
      showIcons: true,
      buttonVariant: 'primary',
      buttonPill: true,
    },
    defaultContent: {
      brandName: 'CloudboyX Design',
      brandDesc: 'The visual no-code website builder for creating rapid, mobile-ready web pages with pure Bootstrap 5 standards.',
      col1Title: 'Products',
      col1Link1: 'Visual Editor',
      col1Link2: 'Bootstrap 5 Blocks',
      col1Link3: 'Themes & Styles',
      col1Link4: 'Code Export',
      col2Title: 'Resources',
      col2Link1: 'Documentation',
      col2Link2: 'Bootstrap Docs',
      col2Link3: 'Community Forum',
      col2Link4: 'Changelog',
      col3Title: 'Stay Updated',
      col3Desc: 'Subscribe to our newsletter for new blocks, templates, and UI features.',
      copyright: '© 2026 CloudboyX Design. All rights reserved. Built with Bootstrap 5.',
    },
    renderHtml: (block, theme, isEditor) => {
      const { settings, content } = block;
      const { style, className } = getBgStyle(settings);
      const padding = getSpacingClasses(settings);

      return `
<footer id="block-${block.id}" data-block-id="${block.id}" class="${padding} ${className} border-top" style="${style}">
  <div class="${settings.containerWidth}">
    <div class="row ${settings.gutterSize || 'g-4'} mb-5">
      <div class="col-lg-4">
        <a class="d-flex align-items-center gap-2 text-decoration-none text-white fw-bold fs-4 mb-3" href="#">
          <i class="bi bi-boxes text-primary fs-3"></i>
          <span ${editAttr(isEditor, 'brandName')}>${content.brandName}</span>
        </a>
        <p class="opacity-75 mb-4 pe-lg-4" ${editAttr(isEditor, 'brandDesc')}>${content.brandDesc}</p>
        <div class="d-flex gap-3 fs-5">
          <a href="#" class="text-white opacity-75 hover-opacity-100"><i class="bi bi-twitter-x"></i></a>
          <a href="#" class="text-white opacity-75 hover-opacity-100"><i class="bi bi-github"></i></a>
          <a href="#" class="text-white opacity-75 hover-opacity-100"><i class="bi bi-linkedin"></i></a>
          <a href="#" class="text-white opacity-75 hover-opacity-100"><i class="bi bi-youtube"></i></a>
        </div>
      </div>
      <div class="col-6 col-md-3 col-lg-2">
        <h6 class="fw-bold text-uppercase mb-3 text-white" ${editAttr(isEditor, 'col1Title')}>${content.col1Title}</h6>
        <ul class="list-unstyled d-flex flex-column gap-2 opacity-75">
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col1Link1')}>${content.col1Link1}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col1Link2')}>${content.col1Link2}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col1Link3')}>${content.col1Link3}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col1Link4')}>${content.col1Link4}</a></li>
        </ul>
      </div>
      <div class="col-6 col-md-3 col-lg-2">
        <h6 class="fw-bold text-uppercase mb-3 text-white" ${editAttr(isEditor, 'col2Title')}>${content.col2Title}</h6>
        <ul class="list-unstyled d-flex flex-column gap-2 opacity-75">
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col2Link1')}>${content.col2Link1}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col2Link2')}>${content.col2Link2}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col2Link3')}>${content.col2Link3}</a></li>
          <li><a href="#" class="text-white text-decoration-none" ${editAttr(isEditor, 'col2Link4')}>${content.col2Link4}</a></li>
        </ul>
      </div>
      <div class="col-md-6 col-lg-4">
        <h6 class="fw-bold text-uppercase mb-3 text-white" ${editAttr(isEditor, 'col3Title')}>${content.col3Title}</h6>
        <p class="opacity-75 mb-3" ${editAttr(isEditor, 'col3Desc')}>${content.col3Desc}</p>
        <form onsubmit="event.preventDefault(); this.innerHTML = '<span class=\\'text-success fw-bold\\'>✓ Subscribed!</span>';" class="d-flex gap-2">
          <input type="email" class="form-control rounded-pill px-3" placeholder="Enter your email..." required />
          <button type="submit" class="btn btn-primary rounded-pill px-4">Join</button>
        </form>
      </div>
    </div>
    <div class="pt-4 border-top border-secondary border-opacity-25 text-center opacity-75 small">
      <p class="mb-0" ${editAttr(isEditor, 'copyright')}>${content.copyright}</p>
    </div>
  </div>
</footer>`;
    },
  },
  {
    type: 'section-divider',
    category: 'dividers',
    name: 'Section Divider',
    description: 'Customizable section spacing, border rules, or SVG wave/curve transitions',
    iconName: 'Waves',
    tags: ['divider', 'spacer', 'wave', 'curve', 'separator', 'border', 'transition'],
    defaultSettings: {
      bgType: 'color',
      bgColor: 'transparent',
      paddingTop: 0,
      paddingBottom: 0,
      containerWidth: 'container-fluid',
      textColor: 'dark',
      textAlign: 'center',
      showTitle: false,
      showSubtitle: false,
      showDescription: false,
      showButtons: false,
      showMedia: false,
      showIcons: false,
    },
    defaultContent: {
      dividerType: 'wave-smooth',
      height: 70,
      fillColor: '#0d6efd',
      bgColor: 'transparent',
      flipHorizontal: false,
      flipVertical: false,
      lineWidth: 2,
      lineStyle: 'solid',
      lineOpacity: 80,
      badgeText: '✦ Section Break',
      badgeIcon: 'bi-stars',
      showBadge: false,
    },
    renderHtml: (block, theme, isEditor) => {
      const content = block.content || {};
      const dividerType = content.dividerType || 'wave-smooth';
      const height = typeof content.height === 'number' ? content.height : 70;
      const fillColor = content.fillColor || theme.primaryColor || '#0d6efd';
      const bgColor = content.bgColor || 'transparent';
      const flipH = content.flipHorizontal ? -1 : 1;
      const flipV = content.flipVertical ? -1 : 1;
      const transformStyle = (flipH !== 1 || flipV !== 1) ? `transform: scale(${flipH}, ${flipV});` : '';
      const lineWidth = content.lineWidth || 2;
      const lineOpacity = typeof content.lineOpacity === 'number' ? content.lineOpacity / 100 : 0.8;
      const badgeText = content.badgeText || '✦ Section Break';

      let inner = '';
      if (dividerType === 'wave-smooth') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <path d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,58.7C672,43,768,21,864,21.3C960,21,1056,43,1152,53.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="${fillColor}"></path>
  </svg>
</div>`;
      } else if (dividerType === 'wave-layered') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <path opacity="0.35" d="M0,0L60,10.7C120,21,240,43,360,53.3C480,64,600,64,720,58.7C840,53,960,43,1080,48C1200,53,1320,75,1380,85.3L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" fill="${fillColor}"></path>
    <path d="M0,48L48,58.7C96,69,192,91,288,96C384,101,480,91,576,80C672,69,768,59,864,58.7C960,59,1056,69,1152,74.7C1248,80,1344,80,1392,80L1440,80L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="${fillColor}"></path>
  </svg>
</div>`;
      } else if (dividerType === 'curve-concave') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <path d="M0,0 Q720,100 1440,0 L1440,100 L0,100 Z" fill="${fillColor}"></path>
  </svg>
</div>`;
      } else if (dividerType === 'curve-convex') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <path d="M0,100 Q720,0 1440,100 L1440,100 L0,100 Z" fill="${fillColor}"></path>
  </svg>
</div>`;
      } else if (dividerType === 'tilt-slant') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <polygon points="0,0 1440,100 1440,100 0,100" fill="${fillColor}"></polygon>
  </svg>
</div>`;
      } else if (dividerType === 'triangle-arrow') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <polygon points="0,0 720,80 1440,0 1440,80 0,80" fill="${fillColor}"></polygon>
  </svg>
</div>`;
      } else if (dividerType === 'zigzag') {
        inner = `
<div class="w-100 overflow-hidden" style="line-height: 0; background-color: ${bgColor};">
  <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none" style="width: 100%; height: ${height}px; display: block; ${transformStyle}">
    <path d="M0,0 L60,60 L120,0 L180,60 L240,0 L300,60 L360,0 L420,60 L480,0 L540,60 L600,0 L660,60 L720,0 L780,60 L840,0 L900,60 L960,0 L1020,60 L1080,0 L1140,60 L1200,0 L1260,60 L1320,0 L1380,60 L1440,0 L1440,60 L0,60 Z" fill="${fillColor}"></path>
  </svg>
</div>`;
      } else if (dividerType === 'line-solid') {
        inner = `
<div class="container py-3">
  <hr class="my-0" style="border: none; border-top: ${lineWidth}px solid ${fillColor}; opacity: ${lineOpacity};" />
</div>`;
      } else if (dividerType === 'line-dashed') {
        inner = `
<div class="container py-3">
  <div style="border-top: ${lineWidth}px dashed ${fillColor}; opacity: ${lineOpacity};"></div>
</div>`;
      } else if (dividerType === 'line-dotted') {
        inner = `
<div class="container py-3">
  <div style="border-top: ${lineWidth * 1.5}px dotted ${fillColor}; opacity: ${lineOpacity};"></div>
</div>`;
      } else if (dividerType === 'line-gradient') {
        inner = `
<div class="container py-3">
  <div style="height: ${lineWidth}px; background: linear-gradient(90deg, transparent, ${fillColor}, transparent); opacity: ${lineOpacity};"></div>
</div>`;
      } else if (dividerType === 'line-badge') {
        inner = `
<div class="container py-3 position-relative text-center">
  <hr class="position-absolute top-50 start-0 w-100 my-0" style="border: none; border-top: ${lineWidth}px solid ${fillColor}; opacity: ${lineOpacity}; z-index: 1;" />
  <span class="position-relative badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm" style="z-index: 2;" ${editAttr(isEditor, 'badgeText')}>
    ${badgeText}
  </span>
</div>`;
      } else {
        inner = `<div style="height: ${height}px; width: 100%;" class="d-block"></div>`;
      }

      return `
<div id="block-${block.id}" data-block-id="${block.id}" class="studio-section-divider-block position-relative" style="background-color: ${bgColor};">
  ${inner}
</div>`;
    },
  },
];
