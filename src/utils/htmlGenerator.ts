import { BLOCK_DEFINITIONS } from '../data/blockDefinitions';
import { BlockInstance, SiteTheme, SeoSettings, BlockAnimationMeta } from '../types';
import { ClassGenerator } from '../engine/bootstrapCascade';

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export function generateCompleteHtml(
  blocks: BlockInstance[],
  theme: SiteTheme,
  pageTitle: string = 'Bootstrap 5 Website',
  isEditor: boolean = false,
  selectedBlockId: string | null = null,
  seoSettings?: SeoSettings,
  animationMeta?: BlockAnimationMeta | null,
  selectedBlockIds?: string[],
  isMultiSelectMode: boolean = false
): string {
  const primaryRgb = hexToRgb(theme.primaryColor || '#2222FF');
  const effectiveSelectedIds =
    selectedBlockIds && selectedBlockIds.length > 0
      ? selectedBlockIds
      : selectedBlockId
      ? [selectedBlockId]
      : [];
  const finalTitle = seoSettings?.title?.trim() || pageTitle || 'Bootstrap 5 Website';
  const metaDescription =
    seoSettings?.description?.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Modern, responsive, and mobile-first website.';
  const ogImage =
    seoSettings?.ogImageUrl?.trim() ||
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80';
  const favicon =
    seoSettings?.faviconUrl?.trim() ||
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg';

  const rawBlocksHtmlList = blocks
    .map((block, index) => {
      const def = BLOCK_DEFINITIONS.find((b) => b.type === block.type);
      if (!def) return `<!-- Unknown block type: ${block.type} -->`;
      let html = def.renderHtml(block, theme, isEditor);

      // If a standard block has customHtml override from the Block Code Editor, use it
      if (
        block.customHtml !== undefined &&
        block.customHtml.trim() !== '' &&
        block.type !== 'custom-html' &&
        block.type !== 'custom-html-hello-world'
      ) {
        if (block.customHtml.includes(`data-block-id="${block.id}"`)) {
          html = block.customHtml;
        } else {
          const containerTag = block.settings?.semanticTag || 'section';
          html = `<${containerTag} id="block-${block.id}" data-block-id="${block.id}">\n${block.customHtml}\n</${containerTag}>`;
        }
      }

      // Apply user-selected semantic container tag (<section>, <header>, <footer>, <article>, <aside>)
      if (block.settings?.semanticTag) {
        const targetTag = block.settings.semanticTag;
        const openTagRegex = new RegExp(`<([a-zA-Z0-9]+)([^>]*?data-block-id="${block.id}"[^>]*)>`);
        const openMatch = html.match(openTagRegex);
        if (openMatch) {
          const originalTag = openMatch[1];
          if (originalTag.toLowerCase() !== targetTag.toLowerCase()) {
            html = html.replace(openMatch[0], `<${targetTag}${openMatch[2]}>`);
            const closeTagRegex = new RegExp(`</${originalTag}>(\\s*)$`, 'i');
            if (closeTagRegex.test(html)) {
              html = html.replace(closeTagRegex, `</${targetTag}>$1`);
            }
          }
        }
      }

      // Inject per-block customCss if defined and not already injected
      if (
        block.customCss &&
        block.customCss.trim() !== '' &&
        !html.includes(`data-block-scoped-css="${block.id}"`)
      ) {
        html = `<style data-block-scoped-css="${block.id}">\n${block.customCss}\n</style>\n${html}`;
      }

      if (isEditor) {
        const safeName = (block.name || block.type).replace(/"/g, '&quot;');
        const hasCustomCode = Boolean(
          (block.customHtml && block.customHtml.trim()) ||
            (block.customCss && block.customCss.trim()) ||
            block.category === 'html'
        );
        html = html.replace(
          new RegExp(`data-block-id="${block.id}"`),
          `data-block-id="${block.id}" data-block-index="${index}" data-block-name="${safeName}" data-block-category="${block.category}" data-has-custom-code="${hasCustomCode}"`
        );
      }

      // Inject compiled responsive AST classes if visualNode is defined
      if (block.visualNode) {
        const compiledClasses = ClassGenerator.serializeNodeClasses(block.visualNode);
        if (compiledClasses) {
          html = html.replace(
            new RegExp(`(data-block-id="${block.id}"[^>]*class=")([^"]*)(")`),
            `$1$2 ${compiledClasses}$3`
          );
        }
      }

      // Inject CSS entry/movement animation classes if active animation matches this block
      if (animationMeta && animationMeta.blockId === block.id) {
        let animClass = 'block-anim-added';
        if (animationMeta.type === 'moved-up') animClass = 'block-anim-moved-up';
        else if (animationMeta.type === 'moved-down') animClass = 'block-anim-moved-down';
        else if (animationMeta.type === 'duplicated') animClass = 'block-anim-duplicated';

        html = html.replace(
          new RegExp(`(data-block-id="${block.id}"[^>]*class=")([^"]*)(")`),
          `$1$2 ${animClass}$3`
        );
        html = html.replace(
          new RegExp(`data-block-id="${block.id}"`),
          `data-block-id="${block.id}" data-animate="${animationMeta.type}"`
        );
      }

      if (isEditor && effectiveSelectedIds.includes(block.id)) {
        if (/class="[^"]*"/.test(html)) {
          html = html.replace(
            new RegExp(`(data-block-id="${block.id}"[^>]*class=")([^"]*)(")`),
            `$1$2 is-selected-block$3`
          );
        }
      }

      return html;
    });

  let blocksHtml = '';
  if (isEditor) {
    const parts: string[] = [];
    const renderDividerDropdown = (insertIndex: number, slotNumber: number) => `
        <div class="studio-divider-dropdown studio-quick-add-popover" role="menu" aria-label="Quick Add Section Menu">
          <div class="studio-dropdown-header">
            <span class="studio-dropdown-header-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="width: 13px; height: 13px; display: inline-block; vertical-align: -2px; margin-right: 4px; color: #2563eb;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              QUICK ADD SECTION · SLOT #${slotNumber}
            </span>
            <button type="button" class="studio-popover-close-btn" data-close-popover="true" title="Close Popover">×</button>
          </div>

          <div class="studio-quick-add-search-container">
            <input type="text" class="studio-quick-add-search-input" placeholder="Search blocks (hero, features, carousel, pricing...)" data-insert-index="${insertIndex}" />
          </div>

          <div class="studio-quick-add-categories">
            <button type="button" class="studio-quick-cat-btn active" data-cat="all">All</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="headers">Hero</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="features">Features</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="gallery">Media</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="pricing">Pricing</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="forms">Forms</button>
            <button type="button" class="studio-quick-cat-btn" data-cat="content">Content</button>
          </div>

          <div class="studio-quick-add-grid">
            <button type="button" class="studio-quick-card" data-quick-add-type="hero-split" data-cat="headers" data-insert-index="${insertIndex}" title="Insert Hero Split">
              <span class="studio-card-icon">⚡</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Hero Split</div>
                <div class="studio-card-desc">Heading, media & CTA</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="hero-centered" data-cat="headers" data-insert-index="${insertIndex}" title="Insert Hero Centered">
              <span class="studio-card-icon">🎯</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Hero Centered</div>
                <div class="studio-card-desc">Bold impact headline</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="features-3col" data-cat="features" data-insert-index="${insertIndex}" title="Insert 3-Col Features">
              <span class="studio-card-icon">✦</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Features 3-Col</div>
                <div class="studio-card-desc">Grid of 3 cards</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="media-carousel" data-cat="gallery" data-insert-index="${insertIndex}" title="Insert Media Carousel">
              <span class="studio-card-icon">🎬</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Media Carousel</div>
                <div class="studio-card-desc">Video & image slider</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="gallery-grid" data-cat="gallery" data-insert-index="${insertIndex}" title="Insert Gallery Grid">
              <span class="studio-card-icon">🖼</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Gallery Grid</div>
                <div class="studio-card-desc">Showcase cards</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="pricing-tiers" data-cat="pricing" data-insert-index="${insertIndex}" title="Insert Pricing Tiers">
              <span class="studio-card-icon">💎</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Pricing Tiers</div>
                <div class="studio-card-desc">3-Tier comparison</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="contact-split" data-cat="forms" data-insert-index="${insertIndex}" title="Insert Contact Form">
              <span class="studio-card-icon">✉</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Contact & Form</div>
                <div class="studio-card-desc">Inputs & send button</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="testimonials-cards" data-cat="testimonials" data-insert-index="${insertIndex}" title="Insert Testimonials">
              <span class="studio-card-icon">💬</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Testimonials</div>
                <div class="studio-card-desc">Customer reviews</div>
              </div>
            </button>

            <button type="button" class="studio-quick-card" data-quick-add-type="blank-container" data-cat="content" data-insert-index="${insertIndex}" title="Insert Blank Container">
              <span class="studio-card-icon">📦</span>
              <div class="studio-card-info">
                <div class="studio-card-title">Blank Container</div>
                <div class="studio-card-desc">Empty row container</div>
              </div>
            </button>
          </div>

          <div class="studio-quick-add-footer">
            <button type="button" class="studio-quick-action-btn" data-divider-action="paste" data-insert-index="${insertIndex}">
              📋 Paste Clipboard
            </button>
            <button type="button" class="studio-quick-action-btn primary" data-divider-action="library" data-insert-index="${insertIndex}">
              ⚡ Full Library Drawer →
            </button>
          </div>
        </div>
        `;

    if (blocks.length > 0) {
      parts.push(`
      <div class="studio-block-divider-inserter studio-block-divider-top group relative z-[1042] flex items-center justify-center cursor-pointer select-none" data-insert-index="0" data-slot-number="1" contenteditable="false">
        <div class="studio-block-divider-line line-left flex-1 h-[2px]"></div>
        <button type="button" class="studio-block-divider-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs cursor-pointer whitespace-nowrap border" data-insert-index="0" title="Quick Add Section at Top (Slot #1)" aria-haspopup="true">
          <span class="divider-icon-capsule">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          <span class="divider-text-label">+ Quick Add</span>
          <span class="divider-drag-drop-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: inline-block; vertical-align: -1px; margin-right: 4px;">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
            Drop to Place at Top (Slot #1)
          </span>
        </button>
        <div class="studio-block-divider-line line-right flex-1 h-[2px]"></div>
        ${renderDividerDropdown(0, 1)}
      </div>
      `);
    }

    rawBlocksHtmlList.forEach((blockHtml, index) => {
      parts.push(blockHtml);
      parts.push(`
      <div class="studio-block-divider-inserter group relative z-[1042] flex items-center justify-center cursor-pointer select-none" data-insert-index="${index + 1}" data-slot-number="${index + 2}" contenteditable="false">
        <div class="studio-block-divider-line line-left flex-1 h-[2px]"></div>
        <button type="button" class="studio-block-divider-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs cursor-pointer whitespace-nowrap border" data-insert-index="${index + 1}" title="Quick Add Section (Slot #${index + 2})" aria-haspopup="true">
          <span class="divider-icon-capsule">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
          <span class="divider-text-label">+ Quick Add</span>
          <span class="divider-drag-drop-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px; display: inline-block; vertical-align: -1px; margin-right: 4px;">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
            Drop to Place at Slot #${index + 2}
          </span>
        </button>
        <div class="studio-block-divider-line line-right flex-1 h-[2px]"></div>
        ${renderDividerDropdown(index + 1, index + 2)}
      </div>
      `);
    });
    blocksHtml = parts.join('\n\n');
  } else {
    blocksHtml = rawBlocksHtmlList.join('\n\n');
  }

  const editorStyles = isEditor
    ? `
    /* Editor mode styles */
    [data-block-id] {
      position: relative;
      transition: outline 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease, transform 0.2s ease;
      outline: 2px solid transparent;
      outline-offset: -2px;
    }
    [data-block-id]:hover {
      outline: 2px dashed rgba(34, 34, 255, 0.45);
      outline-offset: -2px;
      cursor: default;
    }
    [data-block-id].is-selected-block {
      outline: 2px solid #2222FF !important;
      outline-offset: -2px;
      box-shadow: 0 0 0 4px rgba(34, 34, 255, 0.2);
    }
    [data-block-id].is-dragging-block {
      opacity: 0.45 !important;
      outline: 2px dashed #2222FF !important;
      transform: scale(0.99);
    }
    [data-block-id].drop-target-before::before {
      content: 'Drop here to place section above';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: linear-gradient(90deg, #191970, #2222FF, #00E5D1);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 4px 16px rgba(34, 34, 255, 0.45);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    [data-block-id].drop-target-after::after {
      content: 'Drop here to place section below';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: linear-gradient(90deg, #191970, #2222FF, #00E5D1);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 -4px 16px rgba(34, 34, 255, 0.45);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Visible Drag-Handle & Block Chrome inside Canvas */
    .studio-block-instance-chrome {
      position: absolute;
      top: 10px;
      left: 12px;
      z-index: 1045;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(15, 23, 42, 0.88);
      color: #f8fafc;
      padding: 4px 10px 4px 6px;
      border-radius: 8px;
      border: 1px solid rgba(148, 163, 184, 0.28);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(8px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      line-height: 1;
      opacity: 0.82;
      transition: opacity 0.15s ease, transform 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
      user-select: none;
    }
    [data-block-id]:hover .studio-block-instance-chrome,
    [data-block-id].is-selected-block .studio-block-instance-chrome {
      opacity: 1;
      border-color: rgba(59, 130, 246, 0.65);
      background: rgba(15, 23, 42, 0.96);
    }
    .studio-block-drag-handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 3px 6px;
      border-radius: 5px;
      background: rgba(59, 130, 246, 0.18);
      color: #60a5fa;
      cursor: grab;
      font-weight: 600;
      transition: background-color 0.15s ease, color 0.15s ease;
    }
    .studio-block-drag-handle:hover {
      background: #2563eb;
      color: #ffffff;
    }
    .studio-block-drag-handle:active {
      cursor: grabbing;
    }

    /* Multi-Select Block Chrome Styles */
    .studio-block-multiselect-label {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: 2px;
      user-select: none;
      position: relative;
    }
    .studio-block-multiselect-checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }
    .studio-block-multiselect-box {
      width: 15px;
      height: 15px;
      border-radius: 4px;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      background: rgba(15, 23, 42, 0.6);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      color: transparent;
    }
    .studio-block-multiselect-box svg {
      width: 10px;
      height: 10px;
      stroke: #ffffff;
      opacity: 0;
      transition: opacity 0.15s ease, transform 0.15s ease;
      transform: scale(0.6);
    }
    .studio-block-multiselect-checkbox:checked + .studio-block-multiselect-box {
      background: #0d6efd;
      border-color: #0d6efd;
      box-shadow: 0 0 6px rgba(13, 110, 253, 0.5);
    }
    .studio-block-multiselect-checkbox:checked + .studio-block-multiselect-box svg {
      opacity: 1;
      transform: scale(1);
    }
    body.studio-multiselect-active [data-block-id] {
      cursor: pointer !important;
    }
    body.studio-multiselect-active .studio-block-instance-chrome {
      opacity: 1 !important;
    }
    body.studio-multiselect-active [data-block-id]:hover {
      outline: 2px dashed #0d6efd !important;
    }
    .studio-block-drag-handle svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      pointer-events: none;
    }
    .studio-block-chrome-index {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
    }
    .studio-block-chrome-title {
      font-weight: 600;
      color: #f1f5f9;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .studio-block-code-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 3px 7px;
      margin-left: 2px;
      border-radius: 5px;
      background: rgba(0, 229, 209, 0.16);
      color: #00E5D1;
      border: 1px solid rgba(0, 229, 209, 0.35);
      cursor: pointer;
      font-weight: 700;
      font-size: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      transition: all 0.15s ease;
    }
    .studio-block-code-btn:hover {
      background: #00E5D1;
      color: #0f172a;
      border-color: #00E5D1;
    }
    .studio-block-code-btn svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
      pointer-events: none;
    }

    /* Mobirise-Style On-Canvas Block Action Toolbar (Top-Right of every block) */
    .studio-block-action-toolbar {
      position: absolute;
      top: 10px;
      right: 14px;
      z-index: 1045;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(15, 23, 42, 0.94);
      color: #f8fafc;
      padding: 4px 6px;
      border-radius: 9999px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(12px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      line-height: 1;
      opacity: 0;
      transform: translateY(-4px) scale(0.96);
      transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.15s ease;
      user-select: none;
      pointer-events: auto;
    }
    [data-block-id]:hover .studio-block-action-toolbar,
    [data-block-id].is-selected-block .studio-block-action-toolbar {
      opacity: 1;
      transform: translateY(0) scale(1);
      border-color: rgba(59, 130, 246, 0.7);
    }
    .studio-block-gear-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 5px 11px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #0d6efd 0%, #00b4d8 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 2px 8px rgba(13, 110, 253, 0.45);
      cursor: pointer;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.02em;
      transition: all 0.15s ease;
    }
    .studio-block-gear-btn:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%);
      transform: scale(1.04);
      box-shadow: 0 4px 14px rgba(13, 110, 253, 0.65);
    }
    .studio-block-gear-btn svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      transition: transform 0.4s ease;
    }
    .studio-block-gear-btn:hover svg {
      transform: rotate(60deg);
    }
    .studio-block-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.85);
      color: #cbd5e1;
      border: 1px solid rgba(148, 163, 184, 0.2);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .studio-block-action-btn:hover {
      background: #334155;
      color: #ffffff;
      border-color: rgba(148, 163, 184, 0.5);
      transform: scale(1.08);
    }
    .studio-block-action-btn.btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
      border-color: #ef4444;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
    }
    .studio-block-action-btn.btn-code:hover {
      background: #00E5D1;
      color: #0f172a;
      border-color: #00E5D1;
      box-shadow: 0 2px 8px rgba(0, 229, 209, 0.4);
    }
    .studio-block-action-btn svg {
      width: 13px;
      height: 13px;
      flex-shrink: 0;
      pointer-events: none;
    }
    [contenteditable="true"] {
      cursor: text !important;
      transition: background-color 0.2s ease, outline 0.2s ease;
      border-radius: 4px;
    }
    [contenteditable="true"]:hover {
      background-color: rgba(13, 110, 253, 0.08);
      outline: 1px dashed rgba(13, 110, 253, 0.5);
    }
    [contenteditable="true"]:focus {
      background-color: rgba(13, 110, 253, 0.12);
      outline: 2px solid #0d6efd;
    }

    /* Visual Hover-Overlay & Persistent '+' Icon Divider Inserters between canvas blocks */
    .studio-block-divider-inserter {
      position: relative;
      height: 32px;
      margin: -16px 0;
      z-index: 1042;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1; /* Persistent visibility on block boundaries */
      transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
      user-select: none;
      pointer-events: auto;
    }
    .studio-block-divider-inserter:hover {
      height: 44px;
      margin: -22px 0;
      z-index: 1045;
    }
    .studio-block-divider-top {
      margin-top: 6px;
      margin-bottom: -16px;
    }
    .studio-block-divider-top:hover {
      margin-top: 10px;
      margin-bottom: -16px;
    }
    .studio-block-divider-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.45) 20%, #2563eb 50%, rgba(59, 130, 246, 0.45) 80%, transparent);
      pointer-events: none;
      opacity: 0;
      transform: scaleX(0.72);
      transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .studio-block-divider-line.line-left {
      transform-origin: right center;
    }
    .studio-block-divider-line.line-right {
      transform-origin: left center;
    }
    .studio-block-divider-inserter:hover .studio-block-divider-line {
      opacity: 1;
      transform: scaleX(1);
    }
    /* Persistent '+' Icon Button & Expandable Hover Pill */
    .studio-block-divider-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 4px 9px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.94);
      color: #2563eb;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(59, 130, 246, 0.35);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(37, 99, 235, 0.12);
      cursor: pointer;
      letter-spacing: 0.02em;
      white-space: nowrap;
      pointer-events: auto;
      opacity: 0.82; /* Persistent discoverable icon badge in idle */
      transform: scale(0.92);
      transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
      backdrop-filter: blur(6px);
    }
    .studio-block-divider-btn .divider-icon-capsule {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.12);
      color: #2563eb;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms ease, color 200ms ease;
    }
    .studio-block-divider-btn .divider-text-label {
      max-width: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-width 220ms ease, opacity 200ms ease, margin 200ms ease;
      white-space: nowrap;
    }
    .studio-block-divider-inserter:hover .studio-block-divider-btn {
      opacity: 1;
      transform: scale(1.05);
      padding: 5px 15px;
      background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.5);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45), 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    .studio-block-divider-inserter:hover .studio-block-divider-btn .divider-text-label {
      max-width: 90px;
      opacity: 1;
      margin-left: 2px;
    }
    .studio-block-divider-inserter:hover .studio-block-divider-btn .divider-icon-capsule {
      background: rgba(255, 255, 255, 0.3);
      color: #ffffff;
      transform: rotate(90deg);
    }
    .studio-block-divider-btn:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%) !important;
      border-color: #ffffff !important;
      transform: scale(1.08) !important;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.65) !important;
    }
    .studio-block-divider-btn:active {
      transform: scale(0.96) !important;
    }
    .studio-block-divider-btn svg {
      width: 10px;
      height: 10px;
      stroke-width: 3.2;
      flex-shrink: 0;
    }

    [data-bs-theme="dark"] .studio-block-divider-line {
      background: linear-gradient(90deg, transparent, rgba(0, 229, 209, 0.4) 20%, #00E5D1 50%, rgba(0, 229, 209, 0.4) 80%, transparent);
    }
    [data-bs-theme="dark"] .studio-block-divider-btn {
      background: rgba(15, 23, 42, 0.92);
      color: #00E5D1;
      border-color: rgba(0, 229, 209, 0.4);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), 0 0 10px rgba(0, 229, 209, 0.15);
    }
    [data-bs-theme="dark"] .studio-block-divider-btn .divider-icon-capsule {
      background: rgba(0, 229, 209, 0.18);
      color: #00E5D1;
    }
    [data-bs-theme="dark"] .studio-block-divider-inserter:hover .studio-block-divider-btn {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #38bdf8;
      border-color: #38bdf8;
      box-shadow: 0 6px 20px rgba(0, 229, 209, 0.4);
    }
    [data-bs-theme="dark"] .studio-block-divider-inserter:hover .studio-block-divider-btn .divider-icon-capsule {
      background: rgba(56, 189, 248, 0.25);
      color: #38bdf8;
    }

    /* Drag-and-Drop Boundary Target Detection & Luminous Blue Glow Placement Overlay */
    .studio-block-divider-btn .divider-drag-drop-label {
      display: none;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }
    .studio-block-divider-inserter.is-drag-over-boundary {
      height: 54px !important;
      margin: -27px 0 !important;
      z-index: 1060 !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
    .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-line {
      opacity: 1 !important;
      height: 3.5px !important;
      transform: scaleX(1) !important;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.75) 10%, #2563eb 50%, rgba(59, 130, 246, 0.75) 90%, transparent) !important;
      box-shadow: 0 0 16px rgba(37, 99, 235, 0.95), 0 0 32px rgba(59, 130, 246, 0.7), 0 0 5px #60a5fa !important;
    }
    .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn {
      opacity: 1 !important;
      transform: scale(1.15) translateY(0) !important;
      padding: 6px 18px !important;
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #0284c7 100%) !important;
      color: #ffffff !important;
      border: 2px solid #ffffff !important;
      box-shadow: 0 0 24px rgba(37, 99, 235, 0.95), 0 0 45px rgba(59, 130, 246, 0.65), 0 4px 14px rgba(0, 0, 0, 0.3) !important;
      animation: studioBoundaryPulse 1.3s infinite ease-in-out;
    }
    .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn .divider-text-label {
      display: none !important;
    }
    .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn .divider-drag-drop-label {
      display: inline-flex !important;
    }
    .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn .divider-icon-capsule {
      background: rgba(255, 255, 255, 0.35) !important;
      color: #ffffff !important;
      transform: rotate(90deg) scale(1.1) !important;
    }
    @keyframes studioBoundaryPulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(37, 99, 235, 0.9), 0 0 36px rgba(59, 130, 246, 0.6), 0 4px 14px rgba(0, 0, 0, 0.3);
      }
      50% {
        box-shadow: 0 0 32px rgba(37, 99, 235, 1), 0 0 60px rgba(59, 130, 246, 0.9), 0 6px 20px rgba(0, 0, 0, 0.4);
      }
    }

    [data-bs-theme="dark"] .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-line {
      background: linear-gradient(90deg, transparent, rgba(0, 229, 209, 0.75) 10%, #00E5D1 50%, rgba(0, 229, 209, 0.75) 90%, transparent) !important;
      box-shadow: 0 0 18px rgba(0, 229, 209, 0.95), 0 0 36px rgba(56, 189, 248, 0.7), 0 0 5px #38bdf8 !important;
    }
    [data-bs-theme="dark"] .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0369a1 100%) !important;
      color: #38bdf8 !important;
      border: 2px solid #38bdf8 !important;
      box-shadow: 0 0 25px rgba(0, 229, 209, 0.95), 0 0 50px rgba(56, 189, 248, 0.65), 0 4px 14px rgba(0, 0, 0, 0.5) !important;
    }
    [data-bs-theme="dark"] .studio-block-divider-inserter.is-drag-over-boundary .studio-block-divider-btn .divider-icon-capsule {
      background: rgba(56, 189, 248, 0.35) !important;
      color: #38bdf8 !important;
    }

    /* Quick Add Popover Dropdown */
    .studio-quick-add-popover,
    .studio-divider-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) scale(0.94);
      opacity: 0;
      pointer-events: none;
      z-index: 1060;
      width: 480px;
      max-width: 95vw;
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.95);
      border-radius: 16px;
      padding: 14px;
      box-shadow: 0 20px 35px -8px rgba(15, 23, 42, 0.25), 0 10px 15px -5px rgba(15, 23, 42, 0.1);
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    [data-bs-theme="dark"] .studio-quick-add-popover,
    [data-bs-theme="dark"] .studio-divider-dropdown {
      background: #0f172a;
      border-color: rgba(51, 65, 85, 0.9);
      box-shadow: 0 20px 35px -8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 229, 209, 0.12);
    }
    .studio-quick-add-popover.is-open,
    .studio-divider-dropdown.is-open {
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: translateX(-50%) scale(1) !important;
    }
    .studio-block-divider-inserter.has-open-dropdown,
    .studio-block-divider-inserter:has(.is-open) {
      opacity: 1 !important;
      z-index: 1055 !important;
    }
    .studio-block-divider-inserter.has-open-dropdown .studio-block-divider-btn,
    .studio-block-divider-inserter:has(.is-open) .studio-block-divider-btn {
      opacity: 1 !important;
      transform: scale(1.05) !important;
      padding: 5px 15px !important;
      border-color: #2563eb !important;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.35) !important;
    }
    .studio-block-divider-inserter.has-open-dropdown .studio-block-divider-btn .divider-text-label,
    .studio-block-divider-inserter:has(.is-open) .studio-block-divider-btn .divider-text-label {
      max-width: 90px !important;
      opacity: 1 !important;
      margin-left: 2px !important;
    }
    [data-bs-theme="dark"] .studio-block-divider-inserter.has-open-dropdown .studio-block-divider-btn,
    [data-bs-theme="dark"] .studio-block-divider-inserter:has(.is-open) .studio-block-divider-btn {
      border-color: #00E5D1 !important;
      box-shadow: 0 0 0 3px rgba(0, 229, 209, 0.35) !important;
    }

    .studio-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    }
    [data-bs-theme="dark"] .studio-dropdown-header {
      border-bottom-color: rgba(51, 65, 85, 0.8);
    }
    .studio-dropdown-header-title {
      font-size: 10.5px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #64748b;
      display: flex;
      align-items: center;
    }
    [data-bs-theme="dark"] .studio-dropdown-header-title {
      color: #94a3b8;
    }
    .studio-popover-close-btn {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      transition: background 150ms ease, color 150ms ease;
    }
    .studio-popover-close-btn:hover {
      background: rgba(226, 232, 240, 0.6);
      color: #1e293b;
    }
    [data-bs-theme="dark"] .studio-popover-close-btn:hover {
      background: rgba(51, 65, 85, 0.6);
      color: #f8fafc;
    }
    .studio-quick-add-search-input {
      width: 100%;
      padding: 7px 12px;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      font-size: 12px;
      outline: none;
      background: #f8fafc;
      color: #1e293b;
      transition: border-color 150ms ease, box-shadow 150ms ease;
      box-sizing: border-box;
    }
    .studio-quick-add-search-input:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }
    [data-bs-theme="dark"] .studio-quick-add-search-input {
      background: #1e293b;
      border-color: #334155;
      color: #f8fafc;
    }
    [data-bs-theme="dark"] .studio-quick-add-search-input:focus {
      border-color: #00E5D1;
      box-shadow: 0 0 0 2px rgba(0, 229, 209, 0.25);
    }
    .studio-quick-add-categories {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .studio-quick-cat-btn {
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 600;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #64748b;
      cursor: pointer;
      white-space: nowrap;
      transition: all 150ms ease;
    }
    .studio-quick-cat-btn:hover {
      border-color: #cbd5e1;
      color: #1e293b;
    }
    .studio-quick-cat-btn.active {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }
    [data-bs-theme="dark"] .studio-quick-cat-btn {
      background: #1e293b;
      border-color: #334155;
      color: #94a3b8;
    }
    [data-bs-theme="dark"] .studio-quick-cat-btn.active {
      background: #00E5D1;
      border-color: #00E5D1;
      color: #0f172a;
    }
    .studio-quick-add-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      max-height: 240px;
      overflow-y: auto;
      padding: 2px;
    }
    .studio-quick-card {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      text-align: left;
      cursor: pointer;
      transition: all 150ms ease;
    }
    .studio-quick-card:hover {
      border-color: #2563eb;
      background: #eff6ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.12);
    }
    .studio-quick-card.is-hidden {
      display: none !important;
    }
    [data-bs-theme="dark"] .studio-quick-card {
      background: #1e293b;
      border-color: #334155;
      color: #f8fafc;
    }
    [data-bs-theme="dark"] .studio-quick-card:hover {
      background: #0f172a;
      border-color: #00E5D1;
      box-shadow: 0 4px 12px rgba(0, 229, 209, 0.2);
    }
    .studio-card-icon {
      font-size: 16px;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .studio-card-info {
      flex: 1;
      min-width: 0;
    }
    .studio-card-title {
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }
    [data-bs-theme="dark"] .studio-card-title {
      color: #f1f5f9;
    }
    .studio-card-desc {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    [data-bs-theme="dark"] .studio-card-desc {
      color: #94a3b8;
    }
    .studio-quick-add-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(226, 232, 240, 0.8);
    }
    [data-bs-theme="dark"] .studio-quick-add-footer {
      border-top-color: rgba(51, 65, 85, 0.8);
    }
    .studio-quick-action-btn {
      padding: 5px 10px;
      border-radius: 7px;
      font-size: 10.5px;
      font-weight: 600;
      border: 1px solid #cbd5e1;
      background: #f1f5f9;
      color: #334155;
      cursor: pointer;
      transition: all 150ms ease;
    }
    .studio-quick-action-btn:hover {
      background: #e2e8f0;
      color: #0f172a;
    }
    .studio-quick-action-btn.primary {
      background: #2563eb;
      border-color: #2563eb;
      color: #ffffff;
    }
    .studio-quick-action-btn.primary:hover {
      background: #1d4ed8;
    }
    [data-bs-theme="dark"] .studio-quick-action-btn {
      background: #1e293b;
      border-color: #334155;
      color: #cbd5e1;
    }
    [data-bs-theme="dark"] .studio-quick-action-btn:hover {
      background: #334155;
      color: #ffffff;
    }
    [data-bs-theme="dark"] .studio-quick-action-btn.primary {
      background: #00E5D1;
      border-color: #00E5D1;
      color: #0f172a;
    }
    [data-bs-theme="dark"] .studio-quick-action-btn.primary:hover {
      background: #38bdf8;
    }

    /* Direct Tailwind Transition & Transform Utility Classes for Editor Canvas */
    .transition-all { transition-property: all; }
    .duration-300 { transition-duration: 300ms; }
    .duration-200 { transition-duration: 200ms; }
    .duration-150 { transition-duration: 150ms; }
    .duration-75 { transition-duration: 75ms; }
    .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
    .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
    .scale-x-75 { transform: scaleX(0.75); }
    .scale-x-100 { transform: scaleX(1); }
    .origin-right { transform-origin: right center; }
    .origin-left { transform-origin: left center; }

    /* CSS Entry Animations for Added and Moved Blocks */
    @keyframes studioBlockEnter {
      0% {
        opacity: 0;
        transform: translateY(28px) scale(0.985);
        filter: drop-shadow(0 12px 24px rgba(13, 110, 253, 0.22));
      }
      65% {
        opacity: 1;
        transform: translateY(-3px) scale(1.003);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: none;
      }
    }

    @keyframes studioBlockMovedUp {
      0% {
        opacity: 0.75;
        transform: translateY(36px) scale(0.99);
      }
      70% {
        transform: translateY(-2px) scale(1.002);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes studioBlockMovedDown {
      0% {
        opacity: 0.75;
        transform: translateY(-36px) scale(0.99);
      }
      70% {
        transform: translateY(2px) scale(1.002);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes studioBlockHighlight {
      0% {
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.65), 0 0 20px rgba(13, 110, 253, 0.4);
      }
      40% {
        box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.4), 0 0 32px rgba(13, 110, 253, 0.35);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(13, 110, 253, 0), 0 0 0 rgba(13, 110, 253, 0);
      }
    }

    @keyframes studioBadgeFade {
      0% {
        opacity: 0;
        transform: translate(-50%, 8px) scale(0.88);
      }
      15% {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
      80% {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -8px) scale(0.95);
      }
    }

    .block-anim-added {
      animation: studioBlockEnter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both, studioBlockHighlight 1.5s ease-out both;
      z-index: 10;
      position: relative;
    }

    .block-anim-duplicated {
      animation: studioBlockEnter 0.48s cubic-bezier(0.16, 1, 0.3, 1) both, studioBlockHighlight 1.5s ease-out both;
      z-index: 10;
      position: relative;
    }

    .block-anim-moved-up {
      animation: studioBlockMovedUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both, studioBlockHighlight 1.3s ease-out both;
      z-index: 10;
      position: relative;
    }

    .block-anim-moved-down {
      animation: studioBlockMovedDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both, studioBlockHighlight 1.3s ease-out both;
      z-index: 10;
      position: relative;
    }

    .studio-animation-floating-badge {
      position: absolute;
      top: 14px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(13, 110, 253, 0.95);
      color: #ffffff;
      padding: 5px 16px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.03em;
      box-shadow: 0 10px 25px -3px rgba(13, 110, 253, 0.45), 0 3px 8px rgba(0, 0, 0, 0.2);
      pointer-events: none;
      z-index: 9999;
      animation: studioBadgeFade 1.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(6px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Bootstrap 5 12-Column Responsive Visual Grid Guidelines Overlay */
    .studio-bootstrap-grid-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9990;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;
    }
    .studio-bootstrap-grid-overlay.is-visible {
      opacity: 1;
      visibility: visible;
    }
    .studio-grid-container {
      height: 100vh;
      position: relative;
    }
    .studio-grid-col {
      height: 100%;
      position: relative;
    }
    .studio-col-stripe {
      height: 100%;
      background: rgba(13, 110, 253, 0.05);
      border-left: 1px dashed rgba(13, 110, 253, 0.32);
      border-right: 1px dashed rgba(13, 110, 253, 0.32);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      box-shadow: inset 0 0 16px rgba(13, 110, 253, 0.02);
      transition: background-color 0.15s ease, border-color 0.15s ease;
    }
    .studio-col-badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 10px;
      font-weight: 800;
      color: #0d6efd;
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid rgba(13, 110, 253, 0.4);
      padding: 2px 5px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
      backdrop-filter: blur(4px);
      letter-spacing: -0.02em;
    }
    .studio-col-name {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9px;
      font-weight: 700;
      color: #0d6efd;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(13, 110, 253, 0.25);
      padding: 2px 4px;
      border-radius: 3px;
      margin-bottom: 8px;
    }
    [data-bs-theme="dark"] .studio-col-stripe {
      background: rgba(0, 229, 209, 0.06);
      border-left: 1px dashed rgba(0, 229, 209, 0.35);
      border-right: 1px dashed rgba(0, 229, 209, 0.35);
    }
    [data-bs-theme="dark"] .studio-col-badge {
      color: #00E5D1;
      background: rgba(15, 23, 42, 0.96);
      border-color: rgba(0, 229, 209, 0.45);
      box-shadow: 0 2px 8px rgba(0, 229, 209, 0.2);
    }
    [data-bs-theme="dark"] .studio-col-name {
      color: #00E5D1;
      background: rgba(15, 23, 42, 0.9);
      border-color: rgba(0, 229, 209, 0.3);
    }
  `
    : '';

  const editorScript = isEditor
    ? `
    <script>
      (function() {
        var selectedIds = ${JSON.stringify(effectiveSelectedIds)};
        var isMultiSelectMode = ${JSON.stringify(Boolean(isMultiSelectMode))};
        var animationMeta = ${JSON.stringify(animationMeta || null)};

        function triggerAnimation(meta) {
          if (!meta || !meta.blockId) return;
          var targetEl = document.querySelector('[data-block-id="' + meta.blockId + '"]');
          if (!targetEl) return;

          var animClass = 'block-anim-added';
          var badgeText = '✦ New Section Added';
          if (meta.type === 'moved-up') {
            animClass = 'block-anim-moved-up';
            badgeText = '▲ Section Moved Up';
          } else if (meta.type === 'moved-down') {
            animClass = 'block-anim-moved-down';
            badgeText = '▼ Section Moved Down';
          } else if (meta.type === 'duplicated') {
            animClass = 'block-anim-duplicated';
            badgeText = '✦ Section Duplicated';
          }

          // Clear prior animations and badges
          targetEl.classList.remove('block-anim-added', 'block-anim-moved-up', 'block-anim-moved-down', 'block-anim-duplicated');
          var existingBadges = targetEl.querySelectorAll('.studio-animation-floating-badge');
          existingBadges.forEach(function(b) {
            if (b.parentNode) b.parentNode.removeChild(b);
          });

          // Force reflow
          void targetEl.offsetWidth;
          targetEl.classList.add(animClass);

          // Add floating indicator badge
          var badge = document.createElement('div');
          badge.className = 'studio-animation-floating-badge';
          badge.textContent = badgeText;
          targetEl.appendChild(badge);

          setTimeout(function() {
            if (badge.parentNode) {
              badge.parentNode.removeChild(badge);
            }
          }, 1800);

          // Smooth scroll to target block
          try {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch(e) {}
        }

        function updateSelection(ids) {
          if (!Array.isArray(ids)) {
            ids = ids ? [ids] : [];
          }
          selectedIds = ids;
          document.querySelectorAll('[data-block-id]').forEach(function(el) {
            var bId = el.getAttribute('data-block-id');
            var isSel = ids.indexOf(bId) !== -1;
            if (isSel) {
              el.classList.add('is-selected-block');
            } else {
              el.classList.remove('is-selected-block');
            }
            var cb = el.querySelector('.studio-block-multiselect-checkbox');
            if (cb) {
              cb.checked = isSel;
            }
          });
        }

        // Inject visible drag-handle icon chrome and wire standard HTML5 Drag-and-Drop API
        var draggedBlockId = null;
        var draggedBlockIndex = null;

        function clearDropTargets() {
          document.querySelectorAll('[data-block-id]').forEach(function(el) {
            el.classList.remove('drop-target-before', 'drop-target-after', 'is-dragging-block');
          });
          document.querySelectorAll('.studio-block-divider-inserter').forEach(function(ins) {
            ins.classList.remove('is-drag-over-boundary');
          });
        }

        function initBlockDragHandles() {
          var blockEls = document.querySelectorAll('[data-block-id]');
          blockEls.forEach(function(blockEl, idx) {
            if (blockEl.querySelector('.studio-block-instance-chrome')) return;

            var blockId = blockEl.getAttribute('data-block-id');
            var blockIndexAttr = blockEl.getAttribute('data-block-index');
            var blockIndex = blockIndexAttr !== null ? parseInt(blockIndexAttr, 10) : idx;
            var blockName = blockEl.getAttribute('data-block-name') || ('Section ' + (blockIndex + 1));

            var chrome = document.createElement('div');
            chrome.className = 'studio-block-instance-chrome';
            chrome.setAttribute('contenteditable', 'false');

            var isInitiallySelected = selectedIds.indexOf(blockId) !== -1;

            var selectLabel = document.createElement('label');
            selectLabel.className = 'studio-block-multiselect-label';
            selectLabel.setAttribute('title', 'Select section for multi-selection group actions');
            selectLabel.innerHTML =
              '<input type="checkbox" class="studio-block-multiselect-checkbox"' + (isInitiallySelected ? ' checked' : '') + ' />' +
              '<span class="studio-block-multiselect-box">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
              '<polyline points="20 6 9 17 4 12"/>' +
              '</svg>' +
              '</span>';

            var checkboxEl = selectLabel.querySelector('input');
            checkboxEl.addEventListener('click', function(ev) {
              ev.stopPropagation();
            });
            checkboxEl.addEventListener('change', function(ev) {
              ev.stopPropagation();
              window.parent.postMessage({
                type: 'BLOCK_MULTI_SELECT_TOGGLE',
                blockId: blockId,
                checked: checkboxEl.checked
              }, '*');
            });
            chrome.appendChild(selectLabel);

            var dragHandle = document.createElement('div');
            dragHandle.className = 'studio-block-drag-handle';
            dragHandle.setAttribute('draggable', 'true');
            dragHandle.setAttribute('role', 'button');
            dragHandle.setAttribute('aria-label', 'Drag to reorder ' + blockName);
            dragHandle.setAttribute('title', 'Drag to reorder section in canvas');
            dragHandle.innerHTML =
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/>' +
              '<circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>' +
              '</svg>' +
              '<span>Drag</span>';

            var indexSpan = document.createElement('span');
            indexSpan.className = 'studio-block-chrome-index';
            indexSpan.textContent = '#' + (blockIndex + 1);

            var titleSpan = document.createElement('span');
            titleSpan.className = 'studio-block-chrome-title';
            titleSpan.textContent = blockName;

            var codeBtn = document.createElement('button');
            codeBtn.type = 'button';
            codeBtn.className = 'studio-block-code-btn';
            codeBtn.setAttribute('title', 'Edit Block HTML & CSS Code');
            codeBtn.setAttribute('data-action', 'open-code-editor');
            codeBtn.innerHTML =
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
              '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' +
              '</svg>' +
              '<span>HTML/CSS</span>';

            codeBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              updateSelection(blockId);
              window.parent.postMessage({
                type: 'OPEN_BLOCK_CODE_EDITOR',
                blockId: blockId
              }, '*');
            });

            chrome.appendChild(dragHandle);
            chrome.appendChild(indexSpan);
            chrome.appendChild(titleSpan);
            chrome.appendChild(codeBtn);
            blockEl.appendChild(chrome);

            // On-Canvas Floating Action Toolbar (Mobirise Gear Parameters, Up, Down, Duplicate, Code, Delete)
            var toolbar = document.createElement('div');
            toolbar.className = 'studio-block-action-toolbar';
            toolbar.setAttribute('contenteditable', 'false');

            // Gear (Block Parameters)
            var gearBtn = document.createElement('button');
            gearBtn.type = 'button';
            gearBtn.className = 'studio-block-gear-btn';
            gearBtn.setAttribute('title', 'Block Parameters (Settings & Styling)');
            gearBtn.setAttribute('data-action', 'open-block-parameters');
            gearBtn.innerHTML =
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' +
              '<circle cx="12" cy="12" r="3"/>' +
              '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>' +
              '</svg>' +
              '<span>Parameters</span>';

            gearBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              updateSelection(blockId);
              window.parent.postMessage({
                type: 'OPEN_BLOCK_PARAMETERS',
                blockId: blockId
              }, '*');
            });

            // Move Up
            var upBtn = document.createElement('button');
            upBtn.type = 'button';
            upBtn.className = 'studio-block-action-btn';
            upBtn.setAttribute('title', 'Move Section Up');
            if (blockIndex === 0) {
              upBtn.style.opacity = '0.35';
              upBtn.style.pointerEvents = 'none';
            }
            upBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
            upBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              window.parent.postMessage({ type: 'MOVE_BLOCK_UP', blockId: blockId }, '*');
            });

            // Move Down
            var downBtn = document.createElement('button');
            downBtn.type = 'button';
            downBtn.className = 'studio-block-action-btn';
            downBtn.setAttribute('title', 'Move Section Down');
            if (blockIndex === blockEls.length - 1) {
              downBtn.style.opacity = '0.35';
              downBtn.style.pointerEvents = 'none';
            }
            downBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';
            downBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              window.parent.postMessage({ type: 'MOVE_BLOCK_DOWN', blockId: blockId }, '*');
            });

            // Duplicate
            var dupBtn = document.createElement('button');
            dupBtn.type = 'button';
            dupBtn.className = 'studio-block-action-btn';
            dupBtn.setAttribute('title', 'Duplicate Section');
            dupBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            dupBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              window.parent.postMessage({ type: 'DUPLICATE_BLOCK', blockId: blockId }, '*');
            });

            // HTML/CSS Code
            var codeActionBtn = document.createElement('button');
            codeActionBtn.type = 'button';
            codeActionBtn.className = 'studio-block-action-btn btn-code';
            codeActionBtn.setAttribute('title', 'Edit Block HTML/CSS Code');
            codeActionBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
            codeActionBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              updateSelection(blockId);
              window.parent.postMessage({ type: 'OPEN_BLOCK_CODE_EDITOR', blockId: blockId }, '*');
            });

            // Delete
            var delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.className = 'studio-block-action-btn btn-delete';
            delBtn.setAttribute('title', 'Delete Section');
            delBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
            delBtn.addEventListener('click', function(ev) {
              ev.preventDefault();
              ev.stopPropagation();
              window.parent.postMessage({ type: 'DELETE_BLOCK', blockId: blockId }, '*');
            });

            toolbar.appendChild(gearBtn);
            toolbar.appendChild(upBtn);
            toolbar.appendChild(downBtn);
            toolbar.appendChild(dupBtn);
            toolbar.appendChild(codeActionBtn);
            toolbar.appendChild(delBtn);

            blockEl.appendChild(toolbar);

            // Enable block draggable when pressing the drag handle
            dragHandle.addEventListener('mousedown', function() {
              blockEl.setAttribute('draggable', 'true');
            });
            dragHandle.addEventListener('mouseup', function() {
              blockEl.removeAttribute('draggable');
            });

            function onDragStartHandler(e) {
              e.stopPropagation();
              draggedBlockId = blockId;
              draggedBlockIndex = blockIndex;
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                try {
                  e.dataTransfer.setData(
                    'application/x-canvas-block-reorder',
                    JSON.stringify({ blockId: blockId, index: blockIndex })
                  );
                } catch (err) {}
              }
              setTimeout(function() {
                blockEl.classList.add('is-dragging-block');
              }, 0);
              window.parent.postMessage({
                type: 'BLOCK_DRAG_START',
                blockId: blockId,
                index: blockIndex
              }, '*');
            }

            dragHandle.addEventListener('dragstart', onDragStartHandler);
            blockEl.addEventListener('dragstart', function(e) {
              if (blockEl.getAttribute('draggable') === 'true') {
                onDragStartHandler(e);
              }
            });

            blockEl.addEventListener('dragover', function(e) {
              var isReorderDrag =
                draggedBlockId !== null ||
                (e.dataTransfer &&
                  e.dataTransfer.types &&
                  Array.prototype.indexOf.call(e.dataTransfer.types, 'application/x-canvas-block-reorder') !== -1);
              if (!isReorderDrag) return;

              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
              }

              if (draggedBlockId === blockId) {
                blockEl.classList.remove('drop-target-before', 'drop-target-after');
                return;
              }

              var rect = blockEl.getBoundingClientRect();
              var midpoint = rect.top + rect.height / 2;
              var position = e.clientY < midpoint ? 'before' : 'after';

              document.querySelectorAll('[data-block-id]').forEach(function(other) {
                if (other !== blockEl) {
                  other.classList.remove('drop-target-before', 'drop-target-after');
                }
              });

              if (position === 'before') {
                blockEl.classList.add('drop-target-before');
                blockEl.classList.remove('drop-target-after');
              } else {
                blockEl.classList.add('drop-target-after');
                blockEl.classList.remove('drop-target-before');
              }

              window.parent.postMessage({
                type: 'BLOCK_DRAG_OVER',
                targetBlockId: blockId,
                targetIndex: blockIndex,
                position: position
              }, '*');
            });

            blockEl.addEventListener('dragleave', function(e) {
              if (!blockEl.contains(e.relatedTarget)) {
                blockEl.classList.remove('drop-target-before', 'drop-target-after');
              }
            });

            blockEl.addEventListener('drop', function(e) {
              var sourceIdx = draggedBlockIndex;
              var sourceId = draggedBlockId;
              if (sourceIdx === null && e.dataTransfer) {
                try {
                  var raw = e.dataTransfer.getData('application/x-canvas-block-reorder');
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    sourceIdx = parsed.index;
                    sourceId = parsed.blockId;
                  }
                } catch (err) {}
              }

              if (sourceIdx === null || sourceIdx === undefined) return;
              e.preventDefault();
              e.stopPropagation();

              var rect = blockEl.getBoundingClientRect();
              var position = e.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
              var rawInsertIndex = position === 'before' ? blockIndex : blockIndex + 1;
              var destinationIndex = sourceIdx < rawInsertIndex ? rawInsertIndex - 1 : rawInsertIndex;

              clearDropTargets();
              blockEl.removeAttribute('draggable');
              draggedBlockId = null;
              draggedBlockIndex = null;

              if (sourceIdx !== destinationIndex) {
                window.parent.postMessage({
                  type: 'BLOCK_REORDERED',
                  sourceIndex: sourceIdx,
                  destinationIndex: destinationIndex,
                  sourceBlockId: sourceId,
                  targetBlockId: blockId,
                  position: position
                }, '*');
              } else {
                window.parent.postMessage({ type: 'BLOCK_DRAG_END' }, '*');
              }
            });

            function onDragEndHandler() {
              clearDropTargets();
              blockEl.removeAttribute('draggable');
              draggedBlockId = null;
              draggedBlockIndex = null;
              window.parent.postMessage({ type: 'BLOCK_DRAG_END' }, '*');
            }

            dragHandle.addEventListener('dragend', onDragEndHandler);
            blockEl.addEventListener('dragend', onDragEndHandler);
          });
        }

        // Attach drag-and-drop detection, blue glow overlay and exact placement indicator to block boundaries
        function initBoundaryDragAndDrop() {
          var inserters = document.querySelectorAll('.studio-block-divider-inserter');
          inserters.forEach(function(inserter) {
            var insertIndexAttr = inserter.getAttribute('data-insert-index');
            var insertIndex = insertIndexAttr !== null ? parseInt(insertIndexAttr, 10) : 0;
            var slotNumber = inserter.getAttribute('data-slot-number') || (insertIndex + 1);

            inserter.addEventListener('dragenter', function(e) {
              e.preventDefault();
              clearDropTargets();
              inserter.classList.add('is-drag-over-boundary');
              window.parent.postMessage({
                type: 'BLOCK_BOUNDARY_DRAG_OVER',
                insertIndex: insertIndex,
                slotNumber: slotNumber
              }, '*');
            });

            inserter.addEventListener('dragover', function(e) {
              e.preventDefault();
              e.stopPropagation();
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
              }
              if (!inserter.classList.contains('is-drag-over-boundary')) {
                clearDropTargets();
                inserter.classList.add('is-drag-over-boundary');
              }
              // Clear any block-level drop indicators while hovering boundary
              document.querySelectorAll('[data-block-id]').forEach(function(b) {
                b.classList.remove('drop-target-before', 'drop-target-after');
              });
            });

            inserter.addEventListener('dragleave', function(e) {
              if (!inserter.contains(e.relatedTarget)) {
                inserter.classList.remove('is-drag-over-boundary');
              }
            });

            inserter.addEventListener('drop', function(e) {
              e.preventDefault();
              e.stopPropagation();

              var sourceIdx = draggedBlockIndex;
              var sourceId = draggedBlockId;
              if (sourceIdx === null && e.dataTransfer) {
                try {
                  var raw = e.dataTransfer.getData('application/x-canvas-block-reorder');
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    sourceIdx = parsed.index;
                    sourceId = parsed.blockId;
                  }
                } catch (err) {}
              }

              clearDropTargets();

              // Case A: Reordering existing block into this boundary
              if (sourceIdx !== null && sourceIdx !== undefined) {
                var destinationIndex = sourceIdx < insertIndex ? insertIndex - 1 : insertIndex;
                draggedBlockId = null;
                draggedBlockIndex = null;

                if (sourceIdx !== destinationIndex) {
                  window.parent.postMessage({
                    type: 'BLOCK_REORDERED',
                    sourceIndex: sourceIdx,
                    destinationIndex: destinationIndex,
                    sourceBlockId: sourceId,
                    placedAtBoundary: true,
                    targetIndex: insertIndex
                  }, '*');
                } else {
                  window.parent.postMessage({ type: 'BLOCK_DRAG_END' }, '*');
                }
                return;
              }

              // Case B: Dropping a new block from library or external draggable component
              var blockType = null;
              if (e.dataTransfer) {
                blockType =
                  e.dataTransfer.getData('application/bootstrap-block') ||
                  e.dataTransfer.getData('text/plain');
              }
              if (blockType) {
                window.parent.postMessage({
                  type: 'ADD_BLOCK_AT_INDEX',
                  blockType: blockType,
                  insertIndex: insertIndex
                }, '*');
                window.parent.postMessage({ type: 'BLOCK_DRAG_END' }, '*');
              }
            });
          });
        }

        initBlockDragHandles();
        initBoundaryDragAndDrop();

        document.addEventListener('dragend', function() {
          clearDropTargets();
        });

        if (selectedId) {
          updateSelection(selectedId);
        }

        if (animationMeta) {
          triggerAnimation(animationMeta);
        }

        // Intercept link clicks in editor mode to prevent page unloading
        document.addEventListener('click', function(e) {
          var link = e.target.closest('a');
          if (link) {
            var href = link.getAttribute('href');
            // If it's an anchor or dummy link, keep default anchor scroll or prevent reload
            if (!href || href.startsWith('#')) {
              // let it scroll or do nothing
            } else {
              e.preventDefault();
            }
          }

          // Close popover on close button click
          var closePopoverBtn = e.target.closest('[data-close-popover]');
          if (closePopoverBtn) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
              d.classList.remove('is-open');
            });
            document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
              ins.classList.remove('has-open-dropdown');
            });
            return;
          }

          // Check if clicking a Quick Add Block Card
          var quickCard = e.target.closest('[data-quick-add-type]');
          if (quickCard) {
            e.preventDefault();
            e.stopPropagation();
            var blockType = quickCard.getAttribute('data-quick-add-type');
            var targetIdxAttr = quickCard.getAttribute('data-insert-index');
            var targetIdx = targetIdxAttr !== null ? parseInt(targetIdxAttr, 10) : 0;
            document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
              d.classList.remove('is-open');
            });
            document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
              ins.classList.remove('has-open-dropdown');
            });
            window.parent.postMessage({
              type: 'ADD_BLOCK_AT_INDEX',
              blockType: blockType,
              insertIndex: targetIdx
            }, '*');
            return;
          }

          // Check if clicking category filter tabs inside Quick Add Popover
          var catBtn = e.target.closest('.studio-quick-cat-btn');
          if (catBtn) {
            e.preventDefault();
            e.stopPropagation();
            var popover = catBtn.closest('.studio-quick-add-popover');
            if (popover) {
              var cat = catBtn.getAttribute('data-cat') || 'all';
              popover.querySelectorAll('.studio-quick-cat-btn').forEach(function(b) {
                b.classList.remove('active');
              });
              catBtn.classList.add('active');
              var searchInput = popover.querySelector('.studio-quick-add-search-input');
              var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
              popover.querySelectorAll('.studio-quick-card').forEach(function(card) {
                var cardCat = card.getAttribute('data-cat') || '';
                var matchesCat = cat === 'all' || cardCat === cat;
                var text = card.textContent.toLowerCase();
                var matchesSearch = !query || text.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(matchesCat && matchesSearch));
              });
            }
            return;
          }

          // Check if clicking a divider dropdown item
          var dropdownItem = e.target.closest('[data-divider-action]');
          if (dropdownItem) {
            e.preventDefault();
            e.stopPropagation();
            var action = dropdownItem.getAttribute('data-divider-action');
            var targetIdxAttr = dropdownItem.getAttribute('data-insert-index');
            var targetIdx = targetIdxAttr !== null ? parseInt(targetIdxAttr, 10) : 0;

            document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
              d.classList.remove('is-open');
            });
            document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
              ins.classList.remove('has-open-dropdown');
            });

            if (action === 'library') {
              window.parent.postMessage({
                type: 'ADD_SECTION_AT_INDEX',
                insertIndex: targetIdx
              }, '*');
            } else if (action === 'paste') {
              window.parent.postMessage({
                type: 'PASTE_BLOCK_AT_INDEX',
                insertIndex: targetIdx
              }, '*');
            } else if (action === 'blank') {
              window.parent.postMessage({
                type: 'ADD_BLANK_CONTAINER_AT_INDEX',
                insertIndex: targetIdx
              }, '*');
            }
            return;
          }

          // Check if clicking a divider inserter button to toggle dropdown menu
          var dividerBtn = e.target.closest('.studio-block-divider-btn');
          if (dividerBtn) {
            e.preventDefault();
            e.stopPropagation();
            var parentInserter = dividerBtn.closest('.studio-block-divider-inserter');
            var dropdown = parentInserter ? parentInserter.querySelector('.studio-quick-add-popover, .studio-divider-dropdown') : null;
            var insertIndex = parseInt(dividerBtn.getAttribute('data-insert-index') || '0', 10);
            if (dropdown) {
              var wasOpen = dropdown.classList.contains('is-open');
              document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
                d.classList.remove('is-open');
              });
              document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
                ins.classList.remove('has-open-dropdown');
              });
              if (!wasOpen) {
                dropdown.classList.add('is-open');
                if (parentInserter) {
                  parentInserter.classList.add('has-open-dropdown');
                }
                var searchInp = dropdown.querySelector('.studio-quick-add-search-input');
                if (searchInp) {
                  setTimeout(function() { searchInp.focus(); }, 60);
                }
                window.parent.postMessage({
                  type: 'OPEN_QUICK_ADD_POPOVER',
                  insertIndex: insertIndex
                }, '*');
              }
            }
            return;
          }

          // Prevent click inside popover from closing itself
          if (e.target.closest('.studio-quick-add-popover, .studio-divider-dropdown')) {
            return;
          }

          // Close all open divider dropdowns when clicking anywhere else
          document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
            d.classList.remove('is-open');
          });
          document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
            ins.classList.remove('has-open-dropdown');
          });

          // Check if clicking an explicit open-code-editor trigger inside a block
          var codeTrigger = e.target.closest('[data-action="open-code-editor"]');
          if (codeTrigger) {
            var parentBlock = codeTrigger.closest('[data-block-id]');
            if (parentBlock) {
              e.preventDefault();
              var targetBlockId = parentBlock.getAttribute('data-block-id');
              updateSelection(targetBlockId);
              window.parent.postMessage({
                type: 'OPEN_BLOCK_CODE_EDITOR',
                blockId: targetBlockId
              }, '*');
              return;
            }
          }

          // Check if clicking a block
          var blockEl = e.target.closest('[data-block-id]');
          if (blockEl) {
            var blockId = blockEl.getAttribute('data-block-id');
            var isMultiToggle = Boolean(e.shiftKey || e.ctrlKey || e.metaKey || isMultiSelectMode);
            window.parent.postMessage({
              type: 'BLOCK_CLICKED',
              blockId: blockId,
              isMultiToggle: isMultiToggle,
              shiftKey: e.shiftKey,
              ctrlKey: e.ctrlKey,
              metaKey: e.metaKey
            }, '*');
          }
        });

        // Inline contenteditable changes and popover search filter
        document.addEventListener('input', function(e) {
          // Quick add search filtering
          var searchInput = e.target.closest('.studio-quick-add-search-input');
          if (searchInput) {
            var popover = searchInput.closest('.studio-quick-add-popover');
            if (popover) {
              var query = searchInput.value.toLowerCase().trim();
              var activeCatBtn = popover.querySelector('.studio-quick-cat-btn.active');
              var activeCat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') || 'all' : 'all';
              popover.querySelectorAll('.studio-quick-card').forEach(function(card) {
                var cardCat = card.getAttribute('data-cat') || '';
                var matchesCat = activeCat === 'all' || cardCat === activeCat;
                var text = card.textContent.toLowerCase();
                var matchesSearch = !query || text.indexOf(query) !== -1;
                card.classList.toggle('is-hidden', !(matchesCat && matchesSearch));
              });
            }
            return;
          }

          var target = e.target.closest('[data-field]');
          if (target) {
            var blockEl = target.closest('[data-block-id]');
            if (blockEl) {
              var blockId = blockEl.getAttribute('data-block-id');
              var field = target.getAttribute('data-field');
              var value = target.innerText || target.textContent;
              window.parent.postMessage({
                type: 'INLINE_TEXT_CHANGED',
                blockId: blockId,
                field: field,
                value: value
              }, '*');
            }
          }
        });

        // Forward editor keyboard shortcuts to parent window
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            document.querySelectorAll('.studio-quick-add-popover.is-open, .studio-divider-dropdown.is-open').forEach(function(d) {
              d.classList.remove('is-open');
            });
            document.querySelectorAll('.studio-block-divider-inserter.has-open-dropdown').forEach(function(ins) {
              ins.classList.remove('has-open-dropdown');
            });
          }
          var isEditingText = e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
          if (!isEditingText && (e.ctrlKey || e.metaKey)) {
            var k = e.key.toLowerCase();
            if (k === 'c' || k === 'v' || k === 'z' || k === 'y') {
              window.parent.postMessage({
                type: 'IFRAME_KEYBOARD_SHORTCUT',
                key: e.key,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey
              }, '*');
            }
          }
        });

        // Track mouse hover and drag state to dynamically toggle Bootstrap 5 grid guidelines
        var gridOverlayEl = document.getElementById('studio-bootstrap-grid-overlay');
        var isGridEnabled = true;
        var isHoveringDoc = false;
        var isDraggingDoc = false;
        var forceGridVisible = false;

        function updateGridOverlayVisibility() {
          if (!gridOverlayEl) return;
          var shouldShow = isGridEnabled && (isHoveringDoc || isDraggingDoc || forceGridVisible);
          if (shouldShow) {
            gridOverlayEl.classList.add('is-visible');
          } else {
            gridOverlayEl.classList.remove('is-visible');
          }
        }

        document.addEventListener('mouseenter', function() {
          isHoveringDoc = true;
          updateGridOverlayVisibility();
          window.parent.postMessage({ type: 'IFRAME_MOUSE_ENTER' }, '*');
        });

        document.addEventListener('mouseleave', function() {
          isHoveringDoc = false;
          updateGridOverlayVisibility();
          window.parent.postMessage({ type: 'IFRAME_MOUSE_LEAVE' }, '*');
        });

        document.addEventListener('dragenter', function() {
          isDraggingDoc = true;
          updateGridOverlayVisibility();
        });

        document.addEventListener('dragover', function() {
          isDraggingDoc = true;
          updateGridOverlayVisibility();
        });

        document.addEventListener('drop', function() {
          isDraggingDoc = false;
          updateGridOverlayVisibility();
        });

        document.addEventListener('dragend', function() {
          isDraggingDoc = false;
          updateGridOverlayVisibility();
        });

        // Listen for messages from parent
        window.addEventListener('message', function(e) {
          if (!e.data || typeof e.data !== 'object') return;
          if (e.data.type === 'SET_GRID_OVERLAY') {
            if (typeof e.data.enabled === 'boolean') {
              isGridEnabled = e.data.enabled;
            }
            if (typeof e.data.visible === 'boolean') {
              forceGridVisible = e.data.visible;
            }
            updateGridOverlayVisibility();
          }
          if (e.data.type === 'ANIMATE_BLOCK') {
            triggerAnimation(e.data.meta);
          }
          if (e.data.type === 'SCROLL_TO_BLOCK') {
            var el = document.querySelector('[data-block-id="' + e.data.blockId + '"]');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              updateSelection(e.data.blockId);
            }
          }
          if (e.data.type === 'SELECT_BLOCK') {
            updateSelection([e.data.blockId]);
          }
          if (e.data.type === 'SET_SELECTED_BLOCKS') {
            var ids = e.data.blockIds || (e.data.blockId ? [e.data.blockId] : []);
            if (typeof e.data.isMultiSelect === 'boolean') {
              isMultiSelectMode = e.data.isMultiSelect;
              document.body.classList.toggle('studio-multiselect-active', isMultiSelectMode);
            }
            updateSelection(ids);
          }
          if (e.data.type === 'TOGGLE_MULTI_SELECT_MODE') {
            isMultiSelectMode = Boolean(e.data.enabled);
            document.body.classList.toggle('studio-multiselect-active', isMultiSelectMode);
          }
        });
      })();
    </script>
  `
    : '';

  // Dynamically resolve Google Fonts to fetch
  const fontsToLoad = new Set<string>([
    'Inter',
    'Poppins',
    'Roboto',
    'Playfair Display',
    'Plus Jakarta Sans',
    'Space Grotesk',
  ]);
  if (theme.fontFamily && theme.fontFamily !== 'System') {
    fontsToLoad.add(theme.fontFamily);
  }
  if (theme.headingFontFamily && theme.headingFontFamily !== 'System') {
    fontsToLoad.add(theme.headingFontFamily);
  }
  const googleFontsQuery = Array.from(fontsToLoad)
    .map((f) => `family=${encodeURIComponent(f.replace(/\s+/g, '+'))}:wght@300;400;500;600;700;800`)
    .join('&');

  const bsThemeAttr = theme.colorMode === 'dark' ? ' data-bs-theme="dark"' : ' data-bs-theme="light"';

  return `<!DOCTYPE html>
<html lang="en"${bsThemeAttr}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${finalTitle}</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="${finalTitle}">
  <meta name="description" content="${metaDescription}">
  ${seoSettings?.keywords ? `<meta name="keywords" content="${seoSettings.keywords}">` : ''}
  ${seoSettings?.author ? `<meta name="author" content="${seoSettings.author}">` : ''}
  ${seoSettings?.canonicalUrl ? `<link rel="canonical" href="${seoSettings.canonicalUrl}">` : ''}

  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/x-icon" href="${favicon}">
  <link rel="shortcut icon" href="${favicon}">
  <link rel="apple-touch-icon" href="${favicon}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${finalTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:image" content="${ogImage}">
  ${seoSettings?.canonicalUrl ? `<meta property="og:url" content="${seoSettings.canonicalUrl}">` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${finalTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${ogImage}">
  ${seoSettings?.twitterHandle ? `<meta name="twitter:site" content="${seoSettings.twitterHandle.startsWith('@') ? seoSettings.twitterHandle : `@${seoSettings.twitterHandle}`}">\n  <meta name="twitter:creator" content="${seoSettings.twitterHandle.startsWith('@') ? seoSettings.twitterHandle : `@${seoSettings.twitterHandle}`}">` : ''}

  <!-- Dynamic Google Fonts CDN Fetcher -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${googleFontsQuery}&display=swap" rel="stylesheet">

  <!-- Bootstrap 5.3.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

  <style>
    :root {
      /* CloudboyX Brand Palette */
      --cbx-white: #FFFFFF;
      --cbx-cyan: #00E5D1;
      --cbx-blue: #2222FF;
      --cbx-navy: #191970;
      --cbx-dark: #1C1C23;

      --bs-primary: ${theme.primaryColor || '#2222FF'};
      --bs-primary-rgb: ${primaryRgb};
      --bs-secondary: ${theme.secondaryColor || '#00E5D1'};
      --bs-dark: ${theme.darkColor || '#1C1C23'};
      --bs-light: ${theme.lightColor || '#FFFFFF'};
      --bs-body-font-family: '${theme.fontFamily}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      ${theme.headingFontFamily ? `--bs-heading-font-family: '${theme.headingFontFamily}', sans-serif;` : ''}
    }

    body {
      font-family: var(--bs-body-font-family);
      color: #1e293b;
      overflow-x: hidden;
    }

    ${theme.headingFontFamily ? `h1, h2, h3, h4, h5, h6, .display-1, .display-2, .display-3, .display-4, .display-5, .display-6 { font-family: var(--bs-heading-font-family); }` : ''}

    .btn-primary {
      background-color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }

    .btn-primary:hover, .btn-primary:focus {
      filter: brightness(0.92);
    }

    .btn-outline-primary {
      color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }

    .btn-outline-primary:hover {
      background-color: var(--bs-primary) !important;
      color: #ffffff !important;
    }

    .text-primary {
      color: var(--bs-primary) !important;
    }

    .bg-primary {
      background-color: var(--bs-primary) !important;
    }

    .bg-primary-subtle {
      background-color: rgba(var(--bs-primary-rgb), 0.12) !important;
    }

    .border-primary {
      border-color: var(--bs-primary) !important;
    }

    .transition {
      transition: all 0.25s ease-in-out;
    }

    .hover-shadow:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
    }

    ${editorStyles}
  </style>

  <!-- Injected Project Custom CSS -->
  <style id="studio-custom-css">
${theme.customCss || ''}
  </style>
</head>
<body>
${blocksHtml}

${
  isEditor
    ? `
<!-- Bootstrap 5 12-Column Responsive Visual Grid Guidelines Overlay -->
<div id="studio-bootstrap-grid-overlay" class="studio-bootstrap-grid-overlay" aria-hidden="true">
  <div class="container studio-grid-container">
    <div class="row h-100 g-3">
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">1</span><span class="studio-col-name">col-1</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">2</span><span class="studio-col-name">col-2</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">3</span><span class="studio-col-name">col-3</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">4</span><span class="studio-col-name">col-4</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">5</span><span class="studio-col-name">col-5</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">6</span><span class="studio-col-name">col-6</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">7</span><span class="studio-col-name">col-7</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">8</span><span class="studio-col-name">col-8</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">9</span><span class="studio-col-name">col-9</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">10</span><span class="studio-col-name">col-10</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">11</span><span class="studio-col-name">col-11</span></div></div>
      <div class="col-1 studio-grid-col"><div class="studio-col-stripe"><span class="studio-col-badge">12</span><span class="studio-col-name">col-12</span></div></div>
    </div>
  </div>
</div>`
    : ''
}

<!-- Bootstrap 5.3.3 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
${editorScript}
</body>
</html>`;
}

export function generateSingleBlockPreviewHtml(
  def: {
    type: string;
    category: any;
    name: string;
    defaultSettings: any;
    defaultContent: any;
    renderHtml: (block: BlockInstance, theme: SiteTheme, isEditor?: boolean) => string;
  },
  theme: SiteTheme
): string {
  const dummyBlock: BlockInstance = {
    id: `preview-${def.type}`,
    type: def.type,
    category: def.category,
    name: def.name,
    settings: { ...def.defaultSettings },
    content: { ...def.defaultContent },
  };

  const blockHtml = def.renderHtml(dummyBlock, theme, false);
  const primaryRgb = hexToRgb(theme.primaryColor || '#2222FF');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <style>
    :root {
      --cbx-white: #FFFFFF;
      --cbx-cyan: #00E5D1;
      --cbx-blue: #2222FF;
      --cbx-navy: #191970;
      --cbx-dark: #1C1C23;
      --bs-primary: ${theme.primaryColor || '#2222FF'};
      --bs-primary-rgb: ${primaryRgb};
      --bs-body-font-family: '${theme.fontFamily}', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body {
      font-family: var(--bs-body-font-family);
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow-x: hidden;
    }
    .btn-primary {
      background-color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    .btn-outline-primary {
      color: var(--bs-primary) !important;
      border-color: var(--bs-primary) !important;
    }
    .text-primary {
      color: var(--bs-primary) !important;
    }
    .bg-primary {
      background-color: var(--bs-primary) !important;
    }
    .bg-primary-subtle {
      background-color: rgba(var(--bs-primary-rgb), 0.12) !important;
    }
    /* Prevent links from triggering actual navigation */
    a {
      pointer-events: none;
    }
  </style>
</head>
<body>
  ${blockHtml}
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

export function extractEditableBlockCode(
  block: BlockInstance,
  theme: SiteTheme
): { html: string; css: string; isCustomOverride: boolean } {
  const def = BLOCK_DEFINITIONS.find((b) => b.type === block.type);
  const isCustomCategory = block.category === 'html';

  if (isCustomCategory) {
    const rawHtml =
      block.customHtml ??
      block.content?.rawHtml ??
      `<div class="py-5 text-center">\n  <h2>Custom HTML Block</h2>\n</div>`;
    const rawCss =
      block.customCss ??
      block.content?.rawCss ??
      `/* Custom CSS for #block-${block.id} */\n`;
    return {
      html: rawHtml.trim(),
      css: rawCss.trim(),
      isCustomOverride: Boolean(block.customHtml || block.customCss),
    };
  }

  let defaultRenderedHtml = def
    ? def.renderHtml(block, theme, false).trim()
    : `<!-- Block ${block.type} -->`;

  if (block.settings?.semanticTag) {
    const targetTag = block.settings.semanticTag;
    const openTagRegex = new RegExp(`<([a-zA-Z0-9]+)([^>]*?data-block-id="${block.id}"[^>]*)>`);
    const openMatch = defaultRenderedHtml.match(openTagRegex);
    if (openMatch) {
      const originalTag = openMatch[1];
      if (originalTag.toLowerCase() !== targetTag.toLowerCase()) {
        defaultRenderedHtml = defaultRenderedHtml.replace(openMatch[0], `<${targetTag}${openMatch[2]}>`);
        const closeTagRegex = new RegExp(`</${originalTag}>(\\s*)$`, 'i');
        if (closeTagRegex.test(defaultRenderedHtml)) {
          defaultRenderedHtml = defaultRenderedHtml.replace(closeTagRegex, `</${targetTag}>$1`);
        }
      }
    }
  }

  const defaultCss = `/* Custom Scoped Styles for ${block.name} (#block-${block.id}) */
#block-${block.id} {
  /* Add custom CSS rules or overrides here */
}`;

  return {
    html: (block.customHtml !== undefined && block.customHtml.trim() !== ''
      ? block.customHtml
      : defaultRenderedHtml
    ).trim(),
    css: (block.customCss !== undefined && block.customCss.trim() !== ''
      ? block.customCss
      : defaultCss
    ).trim(),
    isCustomOverride: Boolean(
      (block.customHtml && block.customHtml.trim() !== '') ||
        (block.customCss && block.customCss.trim() !== '')
    ),
  };
}

