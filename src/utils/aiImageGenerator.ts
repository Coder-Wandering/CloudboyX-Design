// AI Open Graph Social Share Image Generator Utility
// Generates custom 1200x630 social banners based on site title and customizable styles

export interface OgImageGeneratorOptions {
  title: string;
  description?: string;
  style:
    | 'saas-tech'
    | 'creative-studio'
    | 'gradient-mesh'
    | 'dark-cyber'
    | 'corporate-minimal'
    | 'sunset-vibrant';
  author?: string;
  category?: string;
  themePrimaryColor?: string;
  themeSecondaryColor?: string;
  badgeText?: string;
}

export const AI_OG_STYLE_PRESETS = [
  {
    id: 'saas-tech' as const,
    label: 'Next-Gen SaaS & AI',
    description: 'Electric cyan & violet glow, dark obsidian mesh, futuristic digital waveforms',
    previewGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    accentColor: '#38bdf8',
    bgDark: true,
  },
  {
    id: 'creative-studio' as const,
    label: 'Creative Studio',
    description: 'Warm peach & amber fluid forms, clean editorial typography, luxury aesthetic',
    previewGradient: 'from-amber-400 via-rose-400 to-orange-500',
    accentColor: '#fb923c',
    bgDark: false,
  },
  {
    id: 'gradient-mesh' as const,
    label: 'Glassmorphism Mesh',
    description: 'Frosted glass container, multi-point radiant mesh glows, modern startup vibe',
    previewGradient: 'from-violet-600 via-fuchsia-600 to-pink-500',
    accentColor: '#e879f9',
    bgDark: true,
  },
  {
    id: 'dark-cyber' as const,
    label: 'Cyber Grid & Code',
    description: 'Matrix tech grid, emerald/lime neon highlights, terminal developer flair',
    previewGradient: 'from-emerald-600 via-teal-700 to-slate-900',
    accentColor: '#34d399',
    bgDark: true,
  },
  {
    id: 'corporate-minimal' as const,
    label: 'Executive Corporate',
    description: 'Deep navy & titanium slate, razor-sharp clean hierarchy, authoritative look',
    previewGradient: 'from-blue-700 via-slate-800 to-indigo-950',
    accentColor: '#60a5fa',
    bgDark: true,
  },
  {
    id: 'sunset-vibrant' as const,
    label: 'Sunset Dynamic',
    description: 'Vibrant sunset orange & magenta energy, bold punchy social presence',
    previewGradient: 'from-pink-500 via-red-500 to-yellow-500',
    accentColor: '#f43f5e',
    bgDark: false,
  },
];

export const PREGENERATED_AI_OG_PRESETS = [
  {
    id: 'ai-tech-wave',
    label: 'AI Studio: Tech Wave',
    subtitle: 'Generated with Gemini · Obsidian & Cyan Waveform',
    url: '/src/assets/images/og_social_tech_banner_1791622646810.jpg',
    tag: 'SaaS / AI',
  },
  {
    id: 'ai-creative-fluid',
    label: 'AI Studio: Fluid 3D',
    subtitle: 'Generated with Gemini · Warm Amber & Sculptural Design',
    url: '/src/assets/images/og_social_creative_banner_1791622656962.jpg',
    tag: 'Creative Agency',
  },
];

/**
 * Client-side high-resolution (1200x630) Open Graph canvas banner generator
 */
export async function generateClientOgImage(options: OgImageGeneratorOptions): Promise<string> {
  const width = 1200;
  const height = 630;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const {
    title,
    description = '',
    style,
    author = 'Built with CloudboyX Design',
    category = 'Bootstrap 5 Project',
    themePrimaryColor = '#0d6efd',
    badgeText = 'OFFICIAL PREVIEW',
  } = options;

  // Render background according to style
  if (style === 'saas-tech') {
    // Deep obsidian background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0d17');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#050814');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing mesh orbs
    drawGlowingOrb(ctx, 1000, 150, 380, 'rgba(56, 189, 248, 0.25)');
    drawGlowingOrb(ctx, 200, 500, 320, 'rgba(139, 92, 246, 0.22)');
    drawGlowingOrb(ctx, 600, 300, 260, 'rgba(37, 99, 235, 0.2)');

    // Cyber grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Sine wave ribbon
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 3;
    drawWave(ctx, 0, 420, width, 55, 0.005);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 2;
    drawWave(ctx, 0, 440, width, 45, 0.006);
  } else if (style === 'creative-studio') {
    // Warm peach and amber gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#fff7ed');
    bgGrad.addColorStop(0.5, '#fed7aa');
    bgGrad.addColorStop(1, '#ffedd5');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Sculptural organic fluid circles
    drawGlowingOrb(ctx, 1020, 240, 320, 'rgba(251, 146, 60, 0.45)');
    drawGlowingOrb(ctx, 880, 420, 240, 'rgba(244, 63, 94, 0.35)');
    drawGlowingOrb(ctx, 150, 100, 220, 'rgba(253, 224, 71, 0.4)');

    // Concentric modern architectural rings
    ctx.strokeStyle = 'rgba(234, 88, 12, 0.15)';
    ctx.lineWidth = 2;
    for (let r = 80; r <= 360; r += 70) {
      ctx.beginPath();
      ctx.arc(980, 320, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (style === 'gradient-mesh') {
    // Vibrant royal purple / fuchsia mesh
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1e1136');
    bgGrad.addColorStop(0.5, '#2e1065');
    bgGrad.addColorStop(1, '#110726');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    drawGlowingOrb(ctx, 950, 180, 420, 'rgba(232, 121, 249, 0.32)');
    drawGlowingOrb(ctx, 250, 450, 360, 'rgba(129, 140, 248, 0.3)');
    drawGlowingOrb(ctx, 650, 520, 300, 'rgba(244, 63, 94, 0.25)');
  } else if (style === 'dark-cyber') {
    // High-contrast matrix emerald
    ctx.fillStyle = '#050b0a';
    ctx.fillRect(0, 0, width, height);

    drawGlowingOrb(ctx, 950, 200, 350, 'rgba(16, 185, 129, 0.25)');
    drawGlowingOrb(ctx, 300, 500, 300, 'rgba(52, 211, 153, 0.15)');

    // Diagonal futuristic hatching
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    for (let d = -width; d < width * 2; d += 40) {
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d + height, height);
      ctx.stroke();
    }
  } else if (style === 'corporate-minimal') {
    // Executive Deep Navy
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0c1527');
    bgGrad.addColorStop(0.7, '#111e38');
    bgGrad.addColorStop(1, '#090e1a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    drawGlowingOrb(ctx, 1000, 180, 300, 'rgba(59, 130, 246, 0.22)');
    drawGlowingOrb(ctx, 800, 480, 250, 'rgba(14, 165, 233, 0.18)');

    // Architectural left border strip
    const accentGrad = ctx.createLinearGradient(0, 0, 0, height);
    accentGrad.addColorStop(0, '#3b82f6');
    accentGrad.addColorStop(1, '#06b6d4');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, 16, height);
  } else {
    // Sunset dynamic
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#4c0519');
    bgGrad.addColorStop(0.5, '#881337');
    bgGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    drawGlowingOrb(ctx, 980, 220, 380, 'rgba(244, 63, 94, 0.35)');
    drawGlowingOrb(ctx, 300, 500, 320, 'rgba(249, 115, 22, 0.3)');
  }

  const isLightStyle = style === 'creative-studio';

  // Card Container / Glass panel on the left/center
  const cardX = 80;
  const cardY = 70;
  const cardW = width - 160;
  const cardH = height - 140;

  // Frosted glass card backing
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = isLightStyle ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.65)';
  ctx.fill();
  ctx.strokeStyle = isLightStyle ? 'rgba(251, 146, 60, 0.4)' : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Top category badge
  const badgeX = cardX + 48;
  const badgeY = cardY + 52;
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, badgeX, badgeY, 190, 34, 17);
  ctx.fillStyle = isLightStyle ? 'rgba(234, 88, 12, 0.12)' : 'rgba(56, 189, 248, 0.15)';
  ctx.fill();
  ctx.strokeStyle = isLightStyle ? 'rgba(234, 88, 12, 0.35)' : 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Badge icon dot
  ctx.beginPath();
  ctx.arc(badgeX + 20, badgeY + 17, 4, 0, Math.PI * 2);
  ctx.fillStyle = isLightStyle ? '#ea580c' : '#38bdf8';
  ctx.fill();

  // Badge text
  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isLightStyle ? '#c2410c' : '#7dd3fc';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText.toUpperCase(), badgeX + 34, badgeY + 17);
  ctx.restore();

  // Category Tag on right of card
  ctx.save();
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isLightStyle ? '#9a3412' : '#94a3b8';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(category.toUpperCase(), cardX + cardW - 48, badgeY + 17);
  ctx.restore();

  // Site Title (Supports multiline wrapping up to 2 lines)
  ctx.save();
  ctx.font = '800 52px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isLightStyle ? '#1e293b' : '#ffffff';
  ctx.textBaseline = 'top';
  const displayTitle = title.trim() || 'Modern Web Project';
  const maxTitleWidth = cardW - 120;
  const titleLines = wrapText(ctx, displayTitle, maxTitleWidth, 2);

  const startTitleY = cardY + 115;
  const lineHeight = 62;
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, cardX + 48, startTitleY + idx * lineHeight);
  });
  ctx.restore();

  // Subtitle / Description
  ctx.save();
  const descY = startTitleY + titleLines.length * lineHeight + 18;
  ctx.font = '400 21px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isLightStyle ? '#475569' : '#cbd5e1';
  ctx.textBaseline = 'top';

  const cleanDesc =
    description.trim() ||
    'Crafted with Bootstrap 5 Visual Studio. Responsive, modern, and production-ready.';
  const descLines = wrapText(ctx, cleanDesc, cardW - 140, 2);
  descLines.forEach((line, idx) => {
    ctx.fillText(line, cardX + 48, descY + idx * 30);
  });
  ctx.restore();

  // Bottom Card Divider & Branding Footer
  const footerY = cardY + cardH - 68;
  ctx.strokeStyle = isLightStyle ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX + 48, footerY);
  ctx.lineTo(cardX + cardW - 48, footerY);
  ctx.stroke();

  // Left Footer: Author / Brand
  ctx.save();
  ctx.font = '600 15px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = isLightStyle ? '#64748b' : '#94a3b8';
  ctx.textBaseline = 'middle';
  ctx.fillText(author, cardX + 48, footerY + 34);

  // Right Footer: Technology Badges
  const rightTag = 'Bootstrap 5 · Responsive';
  ctx.textAlign = 'right';
  ctx.fillStyle = isLightStyle ? '#ea580c' : '#38bdf8';
  ctx.fillText(rightTag, cardX + cardW - 48, footerY + 34);
  ctx.restore();

  return canvas.toDataURL('image/png', 0.95);
}

// Helpers
function drawGlowingOrb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string
) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  startX: number,
  baseY: number,
  width: number,
  amplitude: number,
  frequency: number
) {
  ctx.beginPath();
  for (let x = 0; x <= width; x += 10) {
    const y = baseY + Math.sin(x * frequency) * amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(currentLine);
      currentLine = words[n];
      if (lines.length === maxLines - 1) {
        // If last allowed line, add ellipsis if overflow
        break;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}
