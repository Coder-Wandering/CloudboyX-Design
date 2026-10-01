import React from 'react';
import { BlockDefinition, SiteTheme } from '../types';

interface BlockThumbnailProps {
  block: BlockDefinition;
  theme?: SiteTheme;
  className?: string;
  isHovered?: boolean;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface BlockLayoutInfo {
  pattern: string;
  columns: string;
  responsiveBehavior: string;
  elements: string[];
}

export function getBlockLayoutInfo(blockType: string): BlockLayoutInfo {
  switch (blockType) {
    case 'navbar-standard':
      return {
        pattern: 'Horizontal Header Bar',
        columns: 'Single Row (Flex Space-Between)',
        responsiveBehavior: 'Collapses to hamburger toggler on screens < 992px',
        elements: ['Brand Logo & Name', '4 Navigation Links', 'Action Button'],
      };
    case 'navbar-megamenu':
      return {
        pattern: 'Mega Menu Enterprise Navigation',
        columns: 'Multi-Column Dropdown (3 Columns + Spotlight + Ribbon)',
        responsiveBehavior: 'Collapses to responsive accordion menu on screens < 992px',
        elements: ['Brand Logo & Badge', 'Mega Menu Dropdown', 'Spotlight Feature Card', 'Platform & Resource Links', 'Search Bar', 'Login & Action CTAs'],
      };
    case 'hero-split':
      return {
        pattern: 'Split 2-Column Hero',
        columns: '2 Columns (50% / 50%)',
        responsiveBehavior: 'Text stacks above image on mobile (<992px)',
        elements: ['Kicker Pill', 'H1 Headline', 'Lead Text', 'Dual CTA Buttons', '2 Live Stat Counters', 'Product Mockup Image'],
      };
    case 'hero-centered':
      return {
        pattern: 'Centered Headline Showcase',
        columns: 'Single Column (Centered Max-Width)',
        responsiveBehavior: 'Fluid typography scales down for mobile viewports',
        elements: ['Subtitle Kicker', 'Display H1', 'Lead Description', 'Centered Action Buttons', 'Background Overlay'],
      };
    case 'features-3col':
      return {
        pattern: '3-Column Card Grid',
        columns: '3 Columns (33.3% each)',
        responsiveBehavior: '1 column on phones (<768px), 3 columns on desktop',
        elements: ['Section Title & Subtitle', '3 Elevated Feature Cards', 'Icon Circles', 'Card Headings & Copy'],
      };
    case 'features-split':
      return {
        pattern: 'Media + Feature Checklist',
        columns: '2 Columns (50% Media / 50% Text)',
        responsiveBehavior: 'Media stacks above or below text on small screens',
        elements: ['Section Header', 'Photo Showcase Card', '3 Checkmarked Bullet Points', 'Learn More CTA Button'],
      };
    case 'content-about':
      return {
        pattern: 'Editorial Story & Stat Counters',
        columns: 'Narrative Left + Stat Counter Row',
        responsiveBehavior: 'Full-width reading column on mobile, spacious narrative on desktop',
        elements: ['Story Headline', 'Editorial Paragraphs', '3 Metric Stat Highlight Boxes'],
      };
    case 'pricing-tiers':
      return {
        pattern: '3-Tier Pricing Comparison',
        columns: '3 Cards (Highlighted Center Tier)',
        responsiveBehavior: 'Stacked cards on mobile, 3-column comparative table on desktop',
        elements: ['Plan Names', 'Big Price Display', 'Highlighted "Popular" Badge', 'Feature Checklists', 'CTA Buttons'],
      };
    case 'gallery-grid':
      return {
        pattern: '6-Item Media Lookbook',
        columns: '3 Columns x 2 Rows Grid',
        responsiveBehavior: '1 column on mobile, 2 on tablet, 3 on desktop',
        elements: ['Curated Photo Cards', 'Image Aspect Frame', 'Project Title & Category Chips', 'Hover Shadows'],
      };
    case 'testimonials-cards':
      return {
        pattern: '3-Column Testimonial Cards',
        columns: '3 Cards with Star Ratings',
        responsiveBehavior: 'Stacked cards on mobile, horizontal row on desktop',
        elements: ['Quote Marks', '5-Star Rating Indicators', 'Customer Endorsements', 'Author Avatar & Job Title'],
      };
    case 'team-showcase':
      return {
        pattern: 'Leadership & Team Profiles',
        columns: '3 Portrait Profile Cards',
        responsiveBehavior: 'Single card per row on mobile, 3-across on desktop',
        elements: ['Circular / Rounded Photos', 'Member Name & Role Pill', 'Biography Snippet', 'Social Network Icons'],
      };
    case 'contact-split':
      return {
        pattern: 'Split Details & Interactive Form',
        columns: '2 Columns (Contact Info Left / Form Right)',
        responsiveBehavior: 'Info panel stacks above form card on mobile devices',
        elements: ['Office Address', 'Phone & Email', 'Business Hours', 'Interactive Name/Email/Message Form Card'],
      };
    case 'faq-accordion':
      return {
        pattern: 'Collapsible Accordion Stack',
        columns: 'Centered Stacked Accordion Bars',
        responsiveBehavior: 'Adapts smoothly to all container widths',
        elements: ['Section Title', '4 Expandable Question Headers', 'Interactive Chevron Toggles', 'Answer Body Panels'],
      };
    case 'footer-columns':
      return {
        pattern: 'Multi-Column Modern Footer',
        columns: 'Brand Column + 3 Navigation Link Columns',
        responsiveBehavior: 'Columns wrap to 2x2 on tablet and stack vertically on mobile',
        elements: ['Brand Identity & Mission', '3 Navigation Link Columns', 'Copyright & Legal Notice Bar'],
      };
    case 'custom-html':
    case 'custom-html-hello-world':
      return {
        pattern: 'Split-Pane HTML & CSS Code Sandbox',
        columns: 'Custom Container / Freeform Bootstrap 5 Grid',
        responsiveBehavior: 'Adapts to custom Bootstrap 5 classes and scoped CSS media queries',
        elements: ['Raw HTML5 Markup', 'Scoped CSS Stylesheet', 'Inline SVG & Interactive Scripts', 'Code Remix Presets'],
      };
    default:
      return {
        pattern: 'Standard Responsive Section',
        columns: 'Bootstrap Container Grid',
        responsiveBehavior: 'Fluid responsiveness across breakpoints',
        elements: ['Section Header', 'Content Elements', 'Responsive Container'],
      };
  }
}

export const BlockThumbnail: React.FC<BlockThumbnailProps> = ({
  block,
  theme,
  className = '',
  isHovered = false,
  isSelected = false,
  size = 'md',
}) => {
  const primaryColor = theme?.primaryColor || '#0d6efd';
  const secondaryColor = theme?.secondaryColor || '#64748b';
  const darkColor = theme?.darkColor || '#0f172a';

  // Sizing styles
  const sizeClasses = {
    sm: 'w-16 h-10',
    md: 'w-full h-32',
    lg: 'w-full h-44',
  }[size];

  // Specific layout wireframe representations
  const renderWireframe = () => {
    switch (block.type) {
      case 'custom-html':
        return (
          <div className="w-full h-full p-2.5 bg-slate-950 text-white flex flex-col justify-between select-none font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[8px] text-cyan-400 font-bold">HTML + CSS</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-1">
              <div
                className="px-2.5 py-1 rounded-lg border border-dashed border-cyan-500/50 bg-cyan-500/10 text-cyan-300 text-[11px] font-bold mb-1"
              >
                &lt;/&gt;
              </div>
              <span className="text-[9px] text-slate-300 font-sans font-semibold">
                Custom HTML Block
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-800/80 text-[7px] text-slate-400">
              <span className="truncate text-emerald-400">&lt;div class="row"&gt;</span>
              <span className="truncate text-sky-400">.custom &#123; ... &#125;</span>
            </div>
          </div>
        );

      case 'custom-html-hello-world':
        return (
          <div className="w-full h-full p-2.5 bg-white flex flex-col items-center justify-center text-center select-none border border-dashed border-rose-200">
            <span className="text-[9px] font-light text-slate-600 mb-0.5">Hello World</span>
            <span className="text-rose-500 text-base leading-none my-0.5">♥</span>
            <span className="text-[8px] font-light text-slate-400 mt-0.5">HTML + CSS Remix</span>
          </div>
        );

      case 'navbar-standard':
        return (
          <div className="w-full h-full flex flex-col justify-between p-2.5 bg-slate-900/5 select-none">
            {/* Nav mockup bar */}
            <div className="w-full h-8 bg-white rounded-lg shadow-2xs border border-slate-200/90 px-3 flex items-center justify-between">
              {/* Brand Logo & Pill */}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  B
                </span>
                <span className="w-12 h-2 rounded-xs bg-slate-800" />
              </div>

              {/* Nav links */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-8 h-1.5 rounded-xs bg-slate-400" />
                <span className="w-7 h-1.5 rounded-xs bg-slate-300" />
                <span className="w-8 h-1.5 rounded-xs bg-slate-300" />
                <span className="w-6 h-1.5 rounded-xs bg-slate-300" />
              </div>

              {/* Action button */}
              <span
                className="w-11 h-4 rounded-full shadow-2xs flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="w-6 h-1 rounded-full bg-white/90" />
              </span>
            </div>

            {/* Page content hint */}
            <div className="flex-1 flex flex-col justify-center items-center gap-1.5 opacity-40">
              <span className="w-32 h-1.5 rounded-full bg-slate-300" />
              <span className="w-20 h-1 rounded-full bg-slate-200" />
            </div>
          </div>
        );

      case 'navbar-megamenu':
        return (
          <div className="w-full h-full flex flex-col justify-between p-2 bg-slate-900/5 select-none">
            {/* Nav mockup bar */}
            <div className="w-full h-7 bg-white rounded-md shadow-2xs border border-slate-200/90 px-2.5 flex items-center justify-between">
              {/* Brand Logo & Pill */}
              <div className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-xs flex items-center justify-center text-[7px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  M
                </span>
                <span className="w-9 h-1.5 rounded-xs bg-slate-800" />
                <span className="w-4 h-1.5 rounded-full bg-blue-100" />
              </div>

              {/* Nav links with highlighted Mega Menu link */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="px-1 py-0.5 rounded text-[7px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60">
                  Mega ▼
                </span>
                <span className="w-5 h-1.5 rounded-xs bg-slate-300" />
                <span className="w-5 h-1.5 rounded-xs bg-slate-300" />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <span className="w-4 h-1.5 rounded-xs bg-slate-300 hidden md:inline-block" />
                <span
                  className="w-9 h-3.5 rounded-full shadow-2xs flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="w-5 h-0.5 rounded-full bg-white/90" />
                </span>
              </div>
            </div>

            {/* Floating Mega Menu Dropdown Mockup */}
            <div className="w-full flex-1 bg-white/95 backdrop-blur-xs rounded-md border border-slate-200 shadow-xs p-1.5 mt-1 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-1 flex-1">
                {/* Spotlight Col */}
                <div className="bg-slate-50 rounded p-1 border border-slate-100 flex flex-col justify-between">
                  <span className="w-8 h-1 rounded-full bg-blue-500" />
                  <span className="w-12 h-1.5 rounded-xs bg-slate-700" />
                  <span className="w-10 h-1 rounded-xs bg-slate-300" />
                  <span className="w-6 h-1 rounded-full bg-blue-400" />
                </div>
                {/* List Col 1 */}
                <div className="flex flex-col justify-around px-0.5">
                  <span className="w-8 h-1 rounded-xs bg-slate-400 mb-0.5" />
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-blue-100 shrink-0" />
                    <span className="w-7 h-1 rounded-xs bg-slate-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-emerald-100 shrink-0" />
                    <span className="w-7 h-1 rounded-xs bg-slate-600" />
                  </div>
                </div>
                {/* List Col 2 */}
                <div className="flex flex-col justify-around px-0.5">
                  <span className="w-8 h-1 rounded-xs bg-slate-400 mb-0.5" />
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-amber-100 shrink-0" />
                    <span className="w-7 h-1 rounded-xs bg-slate-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-xs bg-purple-100 shrink-0" />
                    <span className="w-7 h-1 rounded-xs bg-slate-600" />
                  </div>
                </div>
              </div>
              {/* Bottom ribbon */}
              <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-between">
                <span className="w-16 h-1 rounded-xs bg-slate-400" />
                <span className="w-10 h-1 rounded-xs bg-blue-500" />
              </div>
            </div>
          </div>
        );

      case 'hero-split':
        return (
          <div className="w-full h-full p-3 flex items-center justify-between gap-3 bg-gradient-to-br from-slate-50 to-slate-100/70 select-none">
            {/* Left Column: Typography & CTAs */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              {/* Badge */}
              <div className="flex items-center gap-1">
                <span
                  className="w-12 h-2.5 rounded-full text-[7px] text-white flex items-center justify-center font-bold px-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  NEW BLOCK
                </span>
              </div>
              {/* Headline */}
              <span className="w-11/12 h-3 rounded-xs bg-slate-900" />
              <span className="w-3/4 h-2.5 rounded-xs bg-slate-800" />
              {/* Lead text */}
              <span className="w-full h-1.5 rounded-xs bg-slate-400/80 mt-0.5" />
              <span className="w-4/5 h-1.5 rounded-xs bg-slate-400/60" />
              {/* Action buttons */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="w-14 h-4 rounded-full flex items-center justify-center shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="w-8 h-1 rounded-full bg-white" />
                </span>
                <span className="w-12 h-4 rounded-full border border-slate-300 bg-white flex items-center justify-center">
                  <span className="w-6 h-1 rounded-full bg-slate-500" />
                </span>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-3 pt-1 border-t border-slate-200/80 mt-1">
                <div className="flex flex-col gap-0.5">
                  <span className="w-6 h-1.5 rounded-xs" style={{ backgroundColor: primaryColor }} />
                  <span className="w-8 h-1 rounded-xs bg-slate-300" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="w-6 h-1.5 rounded-xs" style={{ backgroundColor: primaryColor }} />
                  <span className="w-8 h-1 rounded-xs bg-slate-300" />
                </div>
              </div>
            </div>

            {/* Right Column: Media Preview Card */}
            <div className="w-5/12 h-full max-h-24 rounded-xl border border-slate-200/90 bg-white shadow-xs p-1.5 flex flex-col justify-between overflow-hidden relative">
              <div className="w-full h-3 bg-slate-100 rounded-md flex items-center justify-between px-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="w-8 h-1 rounded-xs bg-slate-300" />
              </div>
              <div className="flex-1 bg-slate-100/80 rounded-md my-1 flex items-center justify-center relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-100/60 flex items-center justify-center">
                  <span
                    className="w-4 h-4 rounded-full opacity-70"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="w-10 h-1.5 rounded-xs bg-slate-300" />
                <span className="w-5 h-2 rounded-xs" style={{ backgroundColor: primaryColor }} />
              </div>
            </div>
          </div>
        );

      case 'hero-centered':
        return (
          <div
            className="w-full h-full p-3 flex flex-col items-center justify-center text-center select-none relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${darkColor} 0%, #1e293b 100%)`,
            }}
          >
            {/* Background ambient glow */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-xl opacity-30 pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />

            {/* Centered Kicker Pill */}
            <span
              className="px-2 py-0.5 rounded-full text-[8px] font-bold text-amber-300 border border-amber-300/30 mb-2 uppercase tracking-wider"
            >
              CRAFTED DESIGN
            </span>

            {/* Big Headline */}
            <span className="w-44 h-3.5 rounded-xs bg-white mb-1 shadow-2xs" />
            <span className="w-32 h-3 rounded-xs bg-slate-200 mb-2" />

            {/* Lead description lines */}
            <span className="w-52 h-1.5 rounded-full bg-slate-400/80 mb-0.5" />
            <span className="w-40 h-1.5 rounded-full bg-slate-400/60 mb-3" />

            {/* Dual Centered Buttons */}
            <div className="flex items-center gap-2">
              <span
                className="w-16 h-4 rounded-full flex items-center justify-center shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="w-9 h-1 rounded-full bg-white" />
              </span>
              <span className="w-14 h-4 rounded-full border border-white/40 bg-white/10 flex items-center justify-center">
                <span className="w-7 h-1 rounded-full bg-white/80" />
              </span>
            </div>
          </div>
        );

      case 'features-3col':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center gap-1 mb-1.5">
              <span
                className="w-14 h-1.5 rounded-xs"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="w-32 h-2.5 rounded-xs bg-slate-800" />
            </div>

            {/* 3 Cards Row */}
            <div className="flex-1 grid grid-cols-3 gap-2 items-stretch">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-2 flex flex-col items-center text-center justify-between"
                >
                  <span
                    className="w-5 h-5 rounded-lg flex items-center justify-center mb-1 text-[9px]"
                    style={{
                      backgroundColor: i === 1 ? primaryColor : '#eff6ff',
                      color: i === 1 ? '#ffffff' : primaryColor,
                    }}
                  >
                    ★
                  </span>
                  <span className="w-12 h-1.5 rounded-xs bg-slate-800 mb-1" />
                  <span className="w-full h-1 rounded-xs bg-slate-300 mb-0.5" />
                  <span className="w-3/4 h-1 rounded-xs bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'features-split':
        return (
          <div className="w-full h-full p-2.5 flex items-center justify-between gap-3 bg-white select-none">
            {/* Media side */}
            <div className="w-5/12 h-full rounded-xl bg-slate-100 border border-slate-200 p-2 flex flex-col justify-between">
              <div className="w-full h-3/4 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-400 text-xs">
                🖼️
              </div>
              <span className="w-10 h-1.5 rounded-xs bg-slate-300" />
            </div>

            {/* Checklist side */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <span
                className="w-12 h-1.5 rounded-xs"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="w-28 h-2.5 rounded-xs bg-slate-900 mb-0.5" />

              {/* 3 bullet checks */}
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex items-center justify-center text-[7px] text-white shrink-0 font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✓
                  </span>
                  <span className="w-28 h-1.5 rounded-xs bg-slate-400/80" />
                </div>
              ))}

              <span
                className="w-14 h-3.5 rounded-md mt-1 flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="w-7 h-1 rounded-full bg-white" />
              </span>
            </div>
          </div>
        );

      case 'content-about':
        return (
          <div className="w-full h-full p-3 flex flex-col justify-between bg-slate-50 select-none">
            <div>
              <span
                className="w-14 h-1.5 rounded-xs block mb-1"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="w-40 h-3 rounded-xs bg-slate-900 block mb-1.5" />
              <span className="w-full h-1.5 rounded-xs bg-slate-400 block mb-0.5" />
              <span className="w-5/6 h-1.5 rounded-xs bg-slate-400 block mb-2" />
            </div>

            {/* 3 Counter stat boxes */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80">
              {[
                { val: '99.9%', label: 'SLA' },
                { val: '140+', label: 'DEALS' },
                { val: '10 YR', label: 'TENURE' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-1.5 border border-slate-200 flex flex-col items-center"
                >
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: primaryColor }}
                  >
                    {item.val}
                  </span>
                  <span className="text-[7px] text-slate-400 font-semibold uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'pricing-tiers':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            <div className="text-center flex flex-col items-center gap-0.5 mb-1">
              <span className="w-24 h-2.5 rounded-xs bg-slate-900" />
              <span className="w-16 h-1.5 rounded-xs bg-slate-400" />
            </div>

            {/* 3 Pricing cards */}
            <div className="grid grid-cols-3 gap-1.5 items-end flex-1">
              {/* Starter */}
              <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-col items-center gap-1">
                <span className="w-8 h-1.5 rounded-xs bg-slate-600" />
                <span className="text-[11px] font-extrabold text-slate-900">$0</span>
                <span className="w-full h-1 rounded-xs bg-slate-200" />
                <span className="w-full h-1 rounded-xs bg-slate-200" />
                <span className="w-full h-2.5 rounded-md bg-slate-100 mt-1" />
              </div>

              {/* Popular / Pro (Elevated) */}
              <div
                className="bg-white rounded-xl border-2 shadow-md p-1.5 flex flex-col items-center gap-1 relative -top-1"
                style={{ borderColor: primaryColor }}
              >
                <span
                  className="w-10 h-2 rounded-full text-[6px] text-white font-bold flex items-center justify-center uppercase"
                  style={{ backgroundColor: primaryColor }}
                >
                  BEST VALUE
                </span>
                <span className="text-[12px] font-black text-slate-900">$79</span>
                <span className="w-full h-1 rounded-xs bg-slate-300" />
                <span className="w-full h-1 rounded-xs bg-slate-300" />
                <span
                  className="w-full h-3 rounded-md flex items-center justify-center text-white mt-1 shadow-2xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="w-6 h-1 rounded-full bg-white" />
                </span>
              </div>

              {/* Enterprise */}
              <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-col items-center gap-1">
                <span className="w-10 h-1.5 rounded-xs bg-slate-600" />
                <span className="text-[11px] font-extrabold text-slate-900">$299</span>
                <span className="w-full h-1 rounded-xs bg-slate-200" />
                <span className="w-full h-1 rounded-xs bg-slate-200" />
                <span className="w-full h-2.5 rounded-md bg-slate-100 mt-1" />
              </div>
            </div>
          </div>
        );

      case 'gallery-grid':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="w-24 h-2 rounded-xs bg-slate-800" />
              <span className="w-10 h-1.5 rounded-xs" style={{ backgroundColor: primaryColor }} />
            </div>

            {/* 6 Grid tiles */}
            <div className="grid grid-cols-3 grid-rows-2 gap-1.5 flex-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-slate-200/90 border border-slate-300/80 p-1 flex flex-col justify-between relative overflow-hidden group"
                >
                  <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-300 rounded-sm flex items-center justify-center text-[10px] text-slate-500">
                    🖼
                  </div>
                  <span className="w-3/4 h-1 rounded-xs bg-slate-500/80 absolute bottom-1 left-1" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials-cards':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            <div className="text-center flex flex-col items-center gap-0.5 mb-1.5">
              <span className="w-28 h-2 rounded-xs bg-slate-800" />
              <div className="flex gap-0.5 text-amber-400 text-[8px]">★★★★★</div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 flex-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-2 flex flex-col justify-between shadow-2xs"
                >
                  <span className="text-[12px] text-slate-300 font-serif leading-none">“</span>
                  <span className="w-full h-1 rounded-xs bg-slate-400 mb-0.5" />
                  <span className="w-4/5 h-1 rounded-xs bg-slate-300 mb-1" />
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                    <span
                      className="w-3 h-3 rounded-full text-[7px] text-white flex items-center justify-center font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      U
                    </span>
                    <span className="w-8 h-1 rounded-xs bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'team-showcase':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            <div className="text-center flex flex-col items-center gap-0.5 mb-1">
              <span className="w-20 h-2 rounded-xs bg-slate-800" />
              <span className="w-12 h-1 rounded-xs" style={{ backgroundColor: primaryColor }} />
            </div>

            <div className="grid grid-cols-3 gap-2 flex-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-slate-200 p-1.5 flex flex-col items-center text-center justify-between shadow-2xs"
                >
                  <span className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px]">
                    👤
                  </span>
                  <span className="w-10 h-1.5 rounded-xs bg-slate-800" />
                  <span
                    className="w-12 h-1 rounded-xs"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex gap-1 pt-1 border-t border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact-split':
        return (
          <div className="w-full h-full p-2.5 flex items-center justify-between gap-2.5 bg-slate-50 select-none">
            {/* Info side */}
            <div className="w-5/12 flex flex-col gap-1.5">
              <span
                className="w-10 h-1.5 rounded-xs"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="w-20 h-2.5 rounded-xs bg-slate-800 mb-0.5" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-200 flex items-center justify-center text-[7px] text-slate-600">
                    📍
                  </span>
                  <span className="w-14 h-1 rounded-xs bg-slate-400" />
                </div>
              ))}
            </div>

            {/* Form side */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-col gap-1">
              <span className="w-12 h-1.5 rounded-xs bg-slate-800 mb-0.5" />
              <div className="w-full h-3 bg-slate-100 rounded-md border border-slate-200/80 px-1 flex items-center">
                <span className="w-8 h-1 rounded-xs bg-slate-300" />
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-md border border-slate-200/80 px-1 flex items-center">
                <span className="w-12 h-1 rounded-xs bg-slate-300" />
              </div>
              <div className="w-full h-5 bg-slate-100 rounded-md border border-slate-200/80 px-1 pt-1">
                <span className="w-16 h-1 rounded-xs bg-slate-300 block mb-0.5" />
              </div>
              <span
                className="w-full h-3.5 rounded-md flex items-center justify-center text-white shadow-2xs mt-0.5"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="w-8 h-1 rounded-full bg-white" />
              </span>
            </div>
          </div>
        );

      case 'faq-accordion':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-50 select-none">
            <div className="text-center flex flex-col items-center gap-0.5 mb-1">
              <span className="w-20 h-2 rounded-xs bg-slate-800" />
              <span className="w-14 h-1 rounded-xs" style={{ backgroundColor: primaryColor }} />
            </div>

            {/* Accordion bars */}
            <div className="flex flex-col gap-1 flex-1 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`rounded-lg border px-2 py-1 flex items-center justify-between transition ${
                    i === 0
                      ? 'bg-white border-blue-300 shadow-2xs'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className="w-28 h-1.5 rounded-xs bg-slate-700" />
                  <span
                    className="text-[9px] font-bold"
                    style={{ color: i === 0 ? primaryColor : '#94a3b8' }}
                  >
                    {i === 0 ? '−' : '+'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'footer-columns':
        return (
          <div className="w-full h-full p-2.5 flex flex-col justify-between bg-slate-900 text-white select-none">
            <div className="grid grid-cols-4 gap-2 pt-1 flex-1">
              {/* Brand Column */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-xs"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="w-8 h-1.5 rounded-xs bg-white" />
                </div>
                <span className="w-full h-1 rounded-xs bg-slate-500" />
                <span className="w-3/4 h-1 rounded-xs bg-slate-600" />
              </div>

              {/* 3 Nav Columns */}
              {[0, 1, 2].map((col) => (
                <div key={col} className="flex flex-col gap-1">
                  <span className="w-8 h-1.5 rounded-xs bg-slate-300 font-bold" />
                  <span className="w-6 h-1 rounded-xs bg-slate-500" />
                  <span className="w-7 h-1 rounded-xs bg-slate-500" />
                  <span className="w-5 h-1 rounded-xs bg-slate-500" />
                </div>
              ))}
            </div>

            {/* Bottom copyright strip */}
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
              <span className="w-20 h-1 rounded-xs bg-slate-600" />
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full p-3 bg-slate-100 flex flex-col items-center justify-center text-center select-none">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white mb-1.5 shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              ❖
            </span>
            <span className="w-20 h-2 rounded-xs bg-slate-800 mb-1" />
            <span className="w-28 h-1.5 rounded-xs bg-slate-400" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${sizeClasses} ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
          : isHovered
          ? 'border-blue-400 shadow-sm'
          : 'border-slate-200/90 shadow-2xs'
      } ${className}`}
    >
      {renderWireframe()}
    </div>
  );
};
