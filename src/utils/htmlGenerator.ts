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
  animationMeta?: BlockAnimationMeta | null
): string {
  const primaryRgb = hexToRgb(theme.primaryColor || '#2222FF');
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

  const renderedBlocksHtml = blocks
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
          html = `<section id="block-${block.id}" data-block-id="${block.id}">\n${block.customHtml}\n</section>`;
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

      return html;
    })
    .join('\n\n');

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
  `
    : '';

  const editorScript = isEditor
    ? `
    <script>
      (function() {
        var selectedId = ${JSON.stringify(selectedBlockId)};
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

        function updateSelection(id) {
          document.querySelectorAll('[data-block-id]').forEach(function(el) {
            if (el.getAttribute('data-block-id') === id) {
              el.classList.add('is-selected-block');
            } else {
              el.classList.remove('is-selected-block');
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

        initBlockDragHandles();

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
            updateSelection(blockId);
            window.parent.postMessage({
              type: 'BLOCK_CLICKED',
              blockId: blockId
            }, '*');
          }
        });

        // Inline contenteditable changes
        document.addEventListener('input', function(e) {
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

        // Listen for messages from parent
        window.addEventListener('message', function(e) {
          if (!e.data || typeof e.data !== 'object') return;
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
            updateSelection(e.data.blockId);
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
${renderedBlocksHtml}

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

  const defaultRenderedHtml = def
    ? def.renderHtml(block, theme, false).trim()
    : `<!-- Block ${block.type} -->`;

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

