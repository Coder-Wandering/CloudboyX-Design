import { BLOCK_DEFINITIONS } from './blockDefinitions';
import { BlockInstance, BlockSettings, StarterTemplate } from '../types';

function makeBlock(type: string, overrides: { settings?: Partial<BlockSettings>; content?: Record<string, any> } = {}): BlockInstance {
  const def = BLOCK_DEFINITIONS.find((b) => b.type === type) || BLOCK_DEFINITIONS[0];
  return {
    id: `block-${Math.random().toString(36).substring(2, 9)}`,
    type: def.type,
    category: def.category,
    name: def.name,
    settings: { ...def.defaultSettings, ...(overrides.settings || {}) },
    content: { ...def.defaultContent, ...(overrides.content || {}) },
  };
}

interface TemplateSeed {
  id: string;
  name: string;
  category: StarterTemplate['category'];
  style: NonNullable<StarterTemplate['style']>;
  thumbnailUrl: string;
  description: string;
  badge?: string;
  accentColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  colorMode?: 'light' | 'dark';
  buttonStyle?: 'rounded' | 'rounded-pill' | 'rounded-0';
  heroType: 'hero-split' | 'hero-centered';
  navType: 'navbar-standard' | 'navbar-megamenu';
  midBlocks: string[];
  tags: string[];
  heroTitle: string;
  heroSubtitle: string;
}

const PHOTO_POOL: Record<NonNullable<StarterTemplate['style']>, string[]> = {
  Agency: [
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80',
  ],
  SaaS: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=900&q=80',
  ],
  Portfolio: [
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
  ],
  'E-Commerce': [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  ],
  Corporate: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
  ],
  Startup: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=900&q=80',
  ],
  'Health & Mobile': [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
  ],
  'Events & Dining': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
  ],
  'Eco & Community': [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  ],
  Minimal: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=900&q=80',
  ],
};

interface StyleBlueprintGroup {
  style: NonNullable<StarterTemplate['style']>;
  category: StarterTemplate['category'];
  accentPalette: string[];
  fonts: string[];
  items: { name: string; subtitle: string; headline: string; desc: string; tags: string[]; badge?: string; dark?: boolean }[];
}

const GROUPS: StyleBlueprintGroup[] = [
  {
    style: 'Agency',
    category: 'Agency & Portfolio',
    accentPalette: ['#2563eb', '#d97706', '#7c3aed', '#e11d48', '#0f766e'],
    fonts: ['Plus Jakarta Sans', 'Playfair Display', 'Space Grotesk', 'Poppins'],
    items: [
      { name: 'Kinetix Digital Agency', subtitle: 'BRAND & MOTION STUDIO', headline: 'Digital Flagships for Cultural Pioneers', desc: 'Full-service creative studio layout with case study lookbook, interactive capability cards, and studio leadership.', tags: ['Agency', 'Motion', 'Case Studies'], badge: 'Popular' },
      { name: 'Monolith Brand Architecture', subtitle: 'STRATEGIC DESIGN PARTNER', headline: 'Identity Systems Engineered to Endure', desc: 'Editorial agency template with bold Swiss grid typography, brand manifesto, client roster, and project inquiry.', tags: ['Branding', 'Swiss Grid', 'Agency'], dark: true },
      { name: 'Vanguard Interactive Lab', subtitle: 'WEBGL & EXPERIENCES', headline: 'Immersive Web Experiences That Convert', desc: 'Dark-mode creative technology studio template with interactive showcase grid, awards counter, and contact.', tags: ['WebGL', 'Interactive', 'Dark UI'], badge: 'Featured', dark: true },
      { name: 'Atelier Nord Design Co.', subtitle: 'SCANDINAVIAN DIGITAL CRAFT', headline: 'Quiet Luxury Meets High-Velocity Web', desc: 'Minimalist Nordic design agency layout featuring airy galleries, client testimonials, and service tiers.', tags: ['Nordic', 'Minimal Agency', 'Lookbook'] },
      { name: 'Hyperion Growth Creative', subtitle: 'PERFORMANCE DESIGN AGENCY', headline: 'Creative Campaigns Backed by Revenue Data', desc: 'Conversion-focused marketing agency template with ROI metrics, split feature breakdowns, and pricing retainers.', tags: ['Growth', 'Marketing', 'Retainers'], badge: 'High-Converting' },
      { name: 'Prisma Studio Collective', subtitle: 'MULTIDISCIPLINARY COLLECTIVE', headline: 'Where Art Direction Meets Product Strategy', desc: 'Vibrant agency showcase with team bios, selected works gallery, and transparent retainer packages.', tags: ['Art Direction', 'Collective', 'Team'] },
      { name: 'Nocturne Creative House', subtitle: 'BOUTIQUE LUXURY AGENCY', headline: 'Bespoke Digital Worlds for Iconic Houses', desc: 'High-contrast obsidian theme for fashion, hospitality, and luxury brand consultancies.', tags: ['Luxury', 'Boutique', 'Fashion'], dark: true },
      { name: 'Forma Product Studio', subtitle: 'UX/UI & DESIGN SYSTEMS', headline: 'Scalable Design Systems for Enterprise Teams', desc: 'Product design consultancy template highlighting component libraries, UX audits, and design sprints.', tags: ['Design Systems', 'UX/UI', 'Sprints'] },
      { name: 'Pulse Social & Content Lab', subtitle: 'VIRAL MEDIA & PRODUCTION', headline: 'Short-Form Storytelling at Global Scale', desc: 'Social media & video production agency template with creator reels grid, client logos, and campaign booking.', tags: ['Social Media', 'Video', 'Creators'] },
      { name: 'studio/zero Architecture', subtitle: 'SPATIAL & DIGITAL DESIGN', headline: 'Bridging Physical Spaces and Digital Portals', desc: 'Architectural visualization and spatial design agency template with full-bleed project photography.', tags: ['Architecture', 'Spatial', 'Gallery'] },
    ],
  },
  {
    style: 'SaaS',
    category: 'SaaS & AI',
    accentPalette: ['#0d6efd', '#4f46e5', '#0284c7', '#059669', '#9333ea'],
    fonts: ['Plus Jakarta Sans', 'Inter', 'Space Grotesk'],
    items: [
      { name: 'VectorFlow AI Platform', subtitle: 'ENTERPRISE LLM ORCHESTRATION', headline: 'Deploy Production AI Agents in Minutes', desc: 'Modern AI SaaS landing page with megamenu navigation, latency benchmarks, developer pricing, and FAQ.', tags: ['AI Agents', 'LLM', 'SaaS'], badge: 'Popular', dark: true },
      { name: 'MetricPulse Analytics', subtitle: 'REAL-TIME PRODUCT ANALYTICS', headline: 'Turn User Behavior Into Revenue Velocity', desc: 'Product analytics SaaS template with cohort retention highlights, 3-tier pricing, and customer proof.', tags: ['Analytics', 'BI', 'Metrics'], badge: 'High-Converting' },
      { name: 'SyncroHQ Team Workspace', subtitle: 'ASYNC COLLABORATION SUITE', headline: 'One Unified Canvas for Distributed Teams', desc: 'Collaborative SaaS workspace layout with split workflow showcase, integrations grid, and team plans.', tags: ['Collaboration', 'Remote Work', 'Productivity'] },
      { name: 'ShieldVault Zero-Trust', subtitle: 'CLOUD SECURITY POSTURE', headline: 'Continuous Compliance & Threat Isolation', desc: 'Cybersecurity SaaS template featuring SOC-2 trust metrics, architecture overview, and enterprise demo form.', tags: ['Cybersecurity', 'Zero-Trust', 'SOC-2'], dark: true },
      { name: 'PipeForge Data ETL', subtitle: 'ZERO-LATENCY DATA PIPELINES', headline: 'Stream Billions of Rows Without Maintenance', desc: 'Data engineering platform template with connector showcase, throughput counters, and usage-based pricing.', tags: ['Data Engineering', 'ETL', 'Cloud'], badge: 'Featured' },
      { name: 'BillStream Revenue Ops', subtitle: 'AUTOMATED SUBSCRIPTION BILLING', headline: 'Global Usage Billing & Tax Automation', desc: 'Fintech SaaS billing platform with multi-currency features, dunning recovery stats, and pricing comparison.', tags: ['Billing', 'FinTech', 'RevOps'] },
      { name: 'CodePilot DevSecOps', subtitle: 'AUTONOMOUS CODE REVIEW', headline: 'Catch Vulnerabilities Before Every Merge', desc: 'Developer tool template with GitHub integration callouts, speed benchmarks, and self-hosted tier.', tags: ['DevTools', 'Git', 'Security'], dark: true },
      { name: 'VoxDesk AI Support', subtitle: 'OMNICHANNEL CUSTOMER AI', headline: 'Resolve 84% of Support Tickets Instantly', desc: 'Customer experience SaaS landing page with CSAT metrics, live workflow split view, and ROI calculator.', tags: ['Customer Support', 'Helpdesk', 'AI'] },
      { name: 'FleetGrid Kubernetes Ops', subtitle: 'MULTI-CLOUD ORCHESTRATION', headline: 'Cut Cloud Compute Spend by 45% Automatically', desc: 'Cloud infrastructure FinOps template with cluster visualization, enterprise SLA specs, and technical FAQ.', tags: ['Kubernetes', 'FinOps', 'Cloud'] },
      { name: 'QuotaHero Sales CRM', subtitle: 'PIPELINE INTELLIGENCE CRM', headline: 'Close Enterprise Deals With Predictive Signals', desc: 'Modern B2B sales CRM layout with deal pipeline preview, VP of Sales testimonials, and seat pricing.', tags: ['CRM', 'Sales', 'B2B'] },
    ],
  },
  {
    style: 'Portfolio',
    category: 'Agency & Portfolio',
    accentPalette: ['#0f172a', '#6366f1', '#ea580c', '#0d9488', '#be123c'],
    fonts: ['Space Grotesk', 'Playfair Display', 'Plus Jakarta Sans', 'Inter'],
    items: [
      { name: ' Julian Vance — Principal Designer', subtitle: 'PRODUCT & SYSTEMS DESIGNER', headline: 'Crafting Intuitive Interfaces for Complex Tools', desc: 'Personal portfolio for senior product designers featuring case study cards, design philosophy, and contact.', tags: ['Product Designer', 'Case Studies', 'CV'], badge: 'Popular' },
      { name: 'Elena Rostova Photography', subtitle: 'EDITORIAL & PORTRAIT ARCHIVE', headline: 'Visual Stories Captured on Medium Format', desc: 'Visual photographer portfolio with 6-item exhibition gallery grid, client publications, and booking form.', tags: ['Photography', 'Visual Arts', 'Gallery'], dark: true },
      { name: 'Marcus Chen — Full-Stack Engineer', subtitle: 'DISTRIBUTED SYSTEMS & RUST', headline: 'Building High-Throughput Open Source Software', desc: 'Software engineer portfolio with open-source project cards, architecture write-ups, and speaking schedule.', tags: ['Developer', 'Open Source', 'Engineering'], dark: true },
      { name: 'Sora Takahashi Motion Reel', subtitle: '3D & PROCEDURAL ART DIRECTOR', headline: 'Kinetic Typography & Real-Time Shaders', desc: '3D motion designer showcase with dark cinema framing, selected client commercials, and studio gear specs.', tags: ['3D Art', 'Motion Design', 'Showreel'], badge: 'Featured', dark: true },
      { name: 'Clara Moreau Editorial Stylist', subtitle: 'PARIS & MILAN ART DIRECTION', headline: 'Curated Visual Narratives for Print & Runway', desc: 'Editorial portfolio with serif typography, runway lookbook grid, and agency representation details.', tags: ['Fashion', 'Editorial', 'Art Direction'] },
      { name: 'Devon Brooks — Sound & Score', subtitle: 'COMPOSER & AUDIO ARCHITECT', headline: 'Original Scores for Film & Interactive Media', desc: 'Composer & sound designer portfolio with filmography credits, studio gallery, and licensing contact.', tags: ['Music', 'Film Score', 'Audio'], dark: true },
      { name: 'Nadia Al-Mansoor Architecture', subtitle: 'SUSTAINABLE CIVIC ARCHITECTURE', headline: 'Regenerative Timber & Cultural Pavilions', desc: 'Architect monograph portfolio showcasing built pavilions, awards timeline, and studio biography.', tags: ['Architect', 'Monograph', 'Civic'] },
      { name: 'Liam O’Connor — Indie Maker', subtitle: 'BOOTSTRAPPED PRODUCT CREATOR', headline: 'Shipping Profitable Micro-SaaS Products', desc: 'Indie hacker & creator portfolio listing active products, MRR milestones, newsletter, and consulting tiers.', tags: ['Indie Maker', 'Creator', 'Products'] },
      { name: 'Freya Lindqvist Ceramic Studio', subtitle: 'SCULPTURAL OBJECTS & EXHIBITIONS', headline: 'Hand-Thrown Porcelain Inspired by Nordic Coasts', desc: 'Fine artist and ceramicist portfolio with gallery exhibition grid, collector inquiry form, and studio story.', tags: ['Fine Art', 'Ceramics', 'Exhibition'] },
      { name: 'Alex Rivera — Executive Advisor', subtitle: 'FRACTIONAL CPO & BOARD MEMBER', headline: 'Scaling Product Organizations From Series A to IPO', desc: 'Executive portfolio & advisory site with track record metrics, founder testimonials, and retainer options.', tags: ['Advisory', 'Executive', 'CPO'] },
    ],
  },
  {
    style: 'E-Commerce',
    category: 'E-Commerce & Retail',
    accentPalette: ['#111827', '#b45309', '#047857', '#be185d', '#1d4ed8'],
    fonts: ['Plus Jakarta Sans', 'Playfair Display', 'Poppins'],
    items: [
      { name: 'Chronos Horology Flagship', subtitle: 'SWISS MECHANICAL TIMEPIECES', headline: 'Precision Calibers Crafted for Generations', desc: 'Luxury watchmaker e-commerce store with collection gallery, craftsmanship story, and boutique concierge.', tags: ['Luxury', 'Watches', 'Retail'], badge: 'Featured', dark: true },
      { name: 'Botanica Skin Atelier', subtitle: 'CLINICAL ORGANIC SKINCARE', headline: 'Bio-Active Formulations for Radiant Skin', desc: 'Direct-to-consumer beauty & skincare storefront with bestseller grid, clinical results, and routine bundles.', tags: ['Skincare', 'DTC', 'Beauty'], badge: 'High-Converting' },
      { name: 'Kōhī Specialty Roasters', subtitle: 'SINGLE-ORIGIN MICRO LOTS', headline: 'Small-Batch Coffee Roasted to Order Daily', desc: 'Specialty coffee subscription & shop template with origin gallery, roast subscription tiers, and wholesale.', tags: ['Coffee', 'Subscription', 'Food & Bev'] },
      { name: 'AcousticLab Hi-Fi Audio', subtitle: 'REFERENCE STUDIO HEADPHONES', headline: 'Uncolored Planar Magnetic Soundstage', desc: 'Consumer electronics product launch template with acoustic specs, press reviews, and pre-order tiers.', tags: ['Audio', 'Hardware', 'Product Launch'], dark: true },
      { name: 'Veloce Carbon Bicycles', subtitle: 'AERO ROAD & GRAVEL FRAMES', headline: 'Wind-Tunnel Engineered Italian Carbon', desc: 'Performance cycling storefront with geometry highlights, build kits pricing, and test-ride booking.', tags: ['Cycling', 'Sports', 'Flagship'] },
      { name: 'Maison Lune Home Objects', subtitle: 'ARTISANAL LIVING & LIGHTING', headline: 'Timeless Furniture in Solid Walnut & Brass', desc: 'Interior design & furniture catalog template with room lookbook, trade program info, and showroom details.', tags: ['Furniture', 'Interiors', 'Home'] },
      { name: 'NomadPack Technical Gear', subtitle: 'WEATHERPROOF MODULAR PACKS', headline: 'Built for Harsh Expeditions & Daily Carry', desc: 'Outdoor & travel gear DTC template with durability guarantee, modular accessories grid, and customer reviews.', tags: ['Outdoor', 'Travel Gear', 'DTC'], badge: 'Popular' },
      { name: 'Solen Eyewear Studio', subtitle: 'ACETATE & TITANIUM FRAMES', headline: 'Handcrafted Optical Frames With Custom Lenses', desc: 'Modern eyewear boutique layout with virtual try-on callout, frame gallery, and prescription pricing.', tags: ['Eyewear', 'Fashion', 'Optical'] },
      { name: 'Verdant Indoor Plant Co.', subtitle: 'CURATED ARCHITECTURAL PLANTS', headline: 'Living Greenery Delivered in Ceramic Planters', desc: 'Plant delivery storefront with care guide features, bundle pricing, and apartment styling gallery.', tags: ['Plants', 'Home Decor', 'Retail'] },
      { name: 'Aether Smart Home Hub', subtitle: 'MATTER-NATIVE AMBIENT HOME', headline: 'Effortless Climate & Lighting Intelligence', desc: 'Connected hardware storefront with industrial design showcase, app ecosystem, and starter kit bundles.', tags: ['Smart Home', 'IoT', 'Hardware'] },
    ],
  },
  {
    style: 'Corporate',
    category: 'Business & Finance',
    accentPalette: ['#1e3a8a', '#0f766e', '#334155', '#0369a1', '#4338ca'],
    fonts: ['Plus Jakarta Sans', 'Inter', 'Roboto'],
    items: [
      { name: 'Sterling & Vance Law LLP', subtitle: 'GLOBAL CORPORATE LITIGATION', headline: 'Strategic Counsel for Complex Cross-Border Matters', desc: 'Prestigious law firm template featuring practice areas, managing partners showcase, and confidential consultation.', tags: ['Legal', 'Law Firm', 'Corporate'], badge: 'Popular' },
      { name: 'Apex Capital Management', subtitle: 'INSTITUTIONAL WEALTH & ASSET MGMT', headline: 'Disciplined Multi-Asset Strategies Across Cycles', desc: 'Private wealth & asset management layout with AUM metrics, investment philosophy, and fiduciary FAQ.', tags: ['Wealth', 'Finance', 'Advisory'] },
      { name: 'NexaGrid Global Logistics', subtitle: 'AUTONOMOUS SUPPLY CHAIN NETWORK', headline: 'Predictive Freight & Cold-Chain Infrastructure', desc: 'Enterprise logistics & supply chain corporate site with global route stats, fleet gallery, and quote form.', tags: ['Logistics', 'Supply Chain', 'Enterprise'] },
      { name: 'Vanguard Executive Search', subtitle: 'C-SUITE & BOARD RECRUITMENT', headline: 'Placing Transformational Leaders Worldwide', desc: 'Executive recruiting firm layout with industry specializations, partner profiles, and placement metrics.', tags: ['Recruiting', 'HR', 'Executive'] },
      { name: 'Bastion Cyber Defense Corp', subtitle: 'SOVEREIGN INFRASTRUCTURE DEFENSE', headline: 'Protecting Critical Energy & Financial Networks', desc: 'Enterprise defense & security consultancy template with incident response retainers and compliance credentials.', tags: ['Defense', 'Enterprise', 'Security'], dark: true },
      { name: 'Meridian Commercial Realty', subtitle: 'CLASS-A LIFE SCIENCE & OFFICE REITS', headline: 'Developing Premier Urban Innovation Campuses', desc: 'Commercial real estate development template with property portfolio grid, leasing specs, and investor relations.', tags: ['Real Estate', 'REIT', 'Commercial'], badge: 'Featured' },
      { name: 'Aurelius Strategy Group', subtitle: 'MANAGEMENT & M&A CONSULTING', headline: 'Unlocking Post-Merger Synergies & Digital Scale', desc: 'Management consulting firm layout with industry insights, partner bios, and global office locations.', tags: ['Consulting', 'M&A', 'Strategy'] },
      { name: 'Helios Industrial Robotics', subtitle: 'PRECISION FACTORY AUTOMATION', headline: 'Zero-Downtime Robotic Assembly Cells', desc: 'Industrial manufacturing & robotics corporate template with throughput stats, ISO certifications, and RFQ form.', tags: ['Manufacturing', 'Robotics', 'Industrial'] },
      { name: 'Clearwater Actuarial & Risk', subtitle: 'ENTERPRISE REINSURANCE ANALYTICS', headline: 'Climate & Catastrophe Modeling for Insurers', desc: 'Insurance & actuarial consultancy template with risk modeling features, leadership team, and client testimonials.', tags: ['Insurance', 'Risk', 'Finance'] },
      { name: 'Summit Infrastructure Partners', subtitle: 'SUSTAINABLE SOVEREIGN TRANSIT', headline: 'Financing Next-Generation Rail & Grid Assets', desc: 'Infrastructure private equity layout with ESG impact metrics, project gallery, and institutional contact.', tags: ['Infrastructure', 'Private Equity', 'ESG'] },
    ],
  },
  {
    style: 'Startup',
    category: 'SaaS & AI',
    accentPalette: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
    fonts: ['Space Grotesk', 'Plus Jakarta Sans', 'Poppins'],
    items: [
      { name: 'NovaPay Instant Checkout', subtitle: 'ONE-CLICK BIOMETRIC PAYMENTS', headline: 'Boost Checkout Conversion by 38% Overnight', desc: 'Fintech startup launch page with interactive split hero, merchant testimonials, and transparent transaction pricing.', tags: ['FinTech', 'Payments', 'Startup'], badge: 'High-Converting' },
      { name: 'SynthVoice Studio AI', subtitle: 'ULTRA-REALISTIC VOICE CLONING', headline: 'Multilingual Dubbing in 40+ Languages Instantly', desc: 'Generative audio AI startup template with creator plans, studio use cases, and licensing FAQ.', tags: ['Generative AI', 'Audio', 'Creators'], badge: 'New', dark: true },
      { name: 'OrbitSpace Micro-Satellites', subtitle: 'HYPERSPECTRAL EARTH IMAGING', headline: 'Daily Sub-Meter Planetary Intelligence API', desc: 'Aerospace & frontier tech startup layout with orbital telemetry stats, imagery gallery, and API tiers.', tags: ['SpaceTech', 'API', 'Frontier'], dark: true },
      { name: 'LoopHire AI Recruiter', subtitle: 'AUTONOMOUS TECHNICAL SCREENING', headline: 'Hire Senior Engineers 4x Faster Without Bias', desc: 'HR-Tech startup landing page featuring live coding assessment highlights, pricing tiers, and social proof.', tags: ['HRTech', 'Recruiting', 'Startup'] },
      { name: 'CarbonLedger Climate API', subtitle: 'AUTOMATED SCOPE 1-3 ACCOUNTING', headline: 'Audit-Ready Carbon Reporting for Modern Enterprises', desc: 'Climate-tech SaaS startup template with ERP integrations, sustainability stats, and enterprise pricing.', tags: ['ClimateTech', 'ESG', 'API'] },
      { name: 'PixelForge Game Engine Web', subtitle: 'MULTIPLAYER BROWSER GAMING', headline: 'Build 120FPS WebGPU Games With Zero Installs', desc: 'Gaming tech startup page with showcase reel, developer pricing, and Discord community callout.', tags: ['Gaming', 'WebGPU', 'Engine'], dark: true },
      { name: 'LegalMind Contract Copilot', subtitle: 'AI REDLINE & PLAYBOOK ENGINE', headline: 'Review Commercial Contracts in 90 Seconds', desc: 'LegalTech startup template with General Counsel testimonials, security compliance, and team plans.', tags: ['LegalTech', 'AI', 'B2B'], badge: 'Popular' },
      { name: 'FleetPulse EV Charging OS', subtitle: 'SMART DEPOT LOAD BALANCING', headline: 'Software-Defined Charging for Commercial Fleets', desc: 'Mobility & EV startup layout with uptime metrics, hardware compatibility, and fleet calculator.', tags: ['Mobility', 'EV', 'CleanTech'] },
      { name: 'DocuFlow API Platform', subtitle: 'PROGRAMMATIC PDF & E-SIGNATURES', headline: 'Embed Compliant Document Workflows in 10 Lines', desc: 'Developer-first API startup template with SDK features, latency stats, and free developer tier.', tags: ['API', 'DevTools', 'Documents'] },
      { name: 'Bio Folding Labs', subtitle: 'COMPUTATIONAL DRUG DISCOVERY', headline: 'Accelerating Molecule Simulation With Generative AI', desc: 'Biotech startup template featuring scientific advisory board, publication highlights, and pharma partnerships.', tags: ['BioTech', 'AI Science', 'Research'] },
    ],
  },
  {
    style: 'Health & Mobile',
    category: 'Mobile & Health',
    accentPalette: ['#0d9488', '#2563eb', '#059669', '#7c3aed', '#e11d48'],
    fonts: ['Plus Jakarta Sans', 'Inter', 'Poppins'],
    items: [
      { name: 'VitalSync Longevity Clinic', subtitle: 'PREVENTIVE DIAGNOSTICS & BIOMARKERS', headline: 'Comprehensive Whole-Body Health Intelligence', desc: 'Modern longevity & concierge medicine template with diagnostic panels, physician team, and membership pricing.', tags: ['Longevity', 'Healthcare', 'Clinic'], badge: 'Popular' },
      { name: 'MindfulOS Meditation App', subtitle: 'NEUROSCIENCE AUDIO SESSIONS', headline: 'Deep Focus & Restorative Sleep in 10 Minutes', desc: 'Consumer wellness mobile app landing page with App Store rating stats, audio features, and annual plans.', tags: ['Mobile App', 'Wellness', 'Sleep'] },
      { name: 'OrthoCare Dental Studio', subtitle: 'DIGITAL SMILE ARCHITECTURE', headline: 'Pain-Free 3D Guided Cosmetic Dentistry', desc: 'Boutique dental & orthodontics clinic template with smile gallery, specialist doctors, and appointment form.', tags: ['Dental', 'Clinic', 'Medical'] },
      { name: 'PulseFit Wearable Coach', subtitle: 'REAL-TIME HRV & RECOVERY APP', headline: 'Train Smarter With Biometric Readiness Scores', desc: 'Fitness mobile app template with dark OLED aesthetic, athlete testimonials, and Pro membership tiers.', tags: ['Fitness', 'Wearables', 'Mobile App'], badge: 'Featured', dark: true },
      { name: 'TeleMed Direct Pediatrics', subtitle: '24/7 BOARD-CERTIFIED PEDIATRICIANS', headline: 'Urgent Pediatric Care From Home in 3 Minutes', desc: 'Telehealth platform layout with insurance FAQ, doctor credentials, and family membership plans.', tags: ['Telehealth', 'Pediatrics', 'Family'] },
      { name: 'Kinesis Sports Rehab Hub', subtitle: 'BIOMECHANICS & PHYSICAL THERAPY', headline: 'Return to Peak Athletic Performance Faster', desc: 'Sports medicine & physical therapy template with facility gallery, recovery programs, and booking.', tags: ['Sports Medicine', 'Physio', 'Rehab'] },
      { name: 'NutriGenome Personalized Lab', subtitle: 'DNA-TAILORED METABOLIC NUTRITION', headline: 'Continuous Glucose & Microbiome Coaching', desc: 'Health-tech nutrition template with biomarker features, clinical studies, and kit pricing.', tags: ['Nutrition', 'Metabolic', 'HealthTech'] },
      { name: 'Serenity Fertility & Women’s Health', subtitle: 'COMPASSIONATE REPRODUCTIVE CARE', headline: 'World-Class Embryology With Personalized Support', desc: 'Specialized medical center layout with success statistics, care team showcase, and private consultation.', tags: ['Medical Center', 'Care', 'Specialists'] },
      { name: 'PocketBudget Personal Finance App', subtitle: 'AI EXPENSE & NET WORTH TRACKER', headline: 'Master Your Cashflow With Zero Spreadsheets', desc: 'Consumer mobile finance app landing page with bank sync security, user reviews, and lifetime plan.', tags: ['Mobile App', 'iOS & Android', 'Consumer'] },
      { name: 'ClearSight Laser Vision Institute', subtitle: 'NEXT-GEN SMILE & LASIK SURGERY', headline: '20/15 High-Definition Vision in 15 Minutes', desc: 'Ophthalmology clinic template with surgeon credentials, financing tiers, and candidacy self-test.', tags: ['Vision', 'Surgery', 'Clinic'] },
    ],
  },
  {
    style: 'Events & Dining',
    category: 'Events & Dining',
    accentPalette: ['#b45309', '#991b1b', '#c2410c', '#4f46e5', '#0f766e'],
    fonts: ['Playfair Display', 'Plus Jakarta Sans', 'Space Grotesk'],
    items: [
      { name: 'Osteria Bellini Fine Dining', subtitle: 'MICHELIN-SELECTED ITALIAN KITCHEN', headline: 'Handmade Artisanal Pasta & Rare Piedmont Vintages', desc: 'Upscale restaurant template with tasting menu tiers, culinary gallery, chef biography, and table reservations.', tags: ['Restaurant', 'Fine Dining', 'Tasting Menu'], badge: 'Popular', dark: true },
      { name: 'DevSummit 2026 Conference', subtitle: 'GLOBAL AI & SYSTEMS ENGINEERING SUMMIT', headline: '3 Days of Deep Technical Keynotes in San Francisco', desc: 'Tech conference & event template featuring speaker lineup, ticket pricing tiers, venue gallery, and FAQ.', tags: ['Conference', 'Tech Event', 'Tickets'], badge: 'Featured', dark: true },
      { name: 'The Velvet Room Jazz & Cocktail Lounge', subtitle: 'SPEAKEASY MIXOLOGY & LIVE VINYL', headline: 'Intimate Acoustic Sets & Bespoke Botanical Elixirs', desc: 'Nightlife & cocktail lounge layout with weekly lineup, private event packages, and VIP table booking.', tags: ['Hospitality', 'Lounge', 'Live Music'], dark: true },
      { name: 'Villa Solis Boutique Resort', subtitle: 'AMALFI CLIFFSIDE SANCTUARY', headline: 'Private Infinity Suites Overlooking the Tyrrhenian Sea', desc: 'Luxury boutique hotel template with suite photography grid, seasonal rates, and concierge inquiry.', tags: ['Hotel', 'Hospitality', 'Travel'] },
      { name: 'Artisanal Sourdough & Patisserie', subtitle: 'STONE-MILLED ORGANIC BAKERY', headline: 'Wild-Fermented Loaves & Laminated Viennoiserie', desc: 'Neighborhood bakery & cafe layout with daily menu highlights, catering packages, and location hours.', tags: ['Bakery', 'Cafe', 'Catering'] },
      { name: 'SoundWave Electronic Festival', subtitle: 'OPEN-AIR DESERT MUSIC FESTIVAL', headline: '4 Stages of Immersive Audio-Visual Architecture', desc: 'Music festival landing page with headliner showcase, GA/VIP pass pricing, and travel FAQ.', tags: ['Festival', 'Live Events', 'Tickets'], dark: true },
      { name: 'Château Lumière Wedding Estate', subtitle: 'HISTORIC VINEYARD & ORANGERIE', headline: 'Unforgettable Celebrations Set in 80 Acres of Vines', desc: 'Wedding venue & event estate template with seasonal photo gallery, package pricing, and tour booking.', tags: ['Weddings', 'Venue', 'Events'] },
      { name: 'Sakura Omakase Counter', subtitle: '12-SEAT EDOMAE SUSHI EXPERIENCE', headline: 'Line-Caught Toyosu Fish Flown Daily to New York', desc: 'Intimate chef’s counter template with 18-course progression, master chef bio, and seating reservations.', tags: ['Omakase', 'Japanese', 'Culinary'], dark: true },
      { name: 'Bistro Marais Wine Bar', subtitle: 'NATURAL WINES & SMALL PLATES', headline: 'Biodynamic Vintages & Seasonal Parisian Bistro Fare', desc: 'Vibrant neighborhood wine bar layout with cellar list, private dining room specs, and reservation form.', tags: ['Wine Bar', 'Bistro', 'Dining'] },
      { name: 'DesignWeek Global Expo', subtitle: 'ANNUAL INDUSTRIAL DESIGN FAIR', headline: '200+ Exhibitors Shaping the Future of Materiality', desc: 'International exhibition & trade show template with pavilion map, exhibitor passes, and keynote schedule.', tags: ['Expo', 'Design Fair', 'Events'] },
      { name: 'Nomad Culinary Pop-Up Series', subtitle: 'ROOFTOP SUPPER CLUB & CHEF COLLABS', headline: 'Secret 7-Course Dinners in Iconic Architectural Spaces', desc: 'Experiential dining & ticketed supper club template with upcoming city calendar and member drops.', tags: ['Supper Club', 'Pop-Up', 'Tickets'], dark: true },
      { name: 'Solstice Wellness Retreat', subtitle: 'AEGEAN COASTAL MINDFULNESS SANCTUARY', headline: '7-Day Immersive Breathwork & Culinary Retreats', desc: 'Destination retreat template with villa accommodations, daily itinerary, and all-inclusive packages.', tags: ['Retreat', 'Hospitality', 'Wellness'] },
    ],
  },
  {
    style: 'Eco & Community',
    category: 'Eco & Community',
    accentPalette: ['#047857', '#15803d', '#0f766e', '#0369a1', '#b45309'],
    fonts: ['Plus Jakarta Sans', 'Playfair Display', 'Inter'],
    items: [
      { name: 'OceanCleanse Marine Foundation', subtitle: 'AUTONOMOUS PLASTIC INTERCEPTION', headline: 'Removing 50,000 Tons of River & Gyre Plastic', desc: 'Environmental non-profit template with impact metrics, interceptor vessel gallery, and donor tiers.', tags: ['Non-Profit', 'Ocean', 'Impact'], badge: 'Featured' },
      { name: 'HelioGrid Community Solar', subtitle: 'COOPERATIVE CLEAN MICROGRIDS', headline: 'Lower Your Utility Bill With Local Solar Shares', desc: 'Clean energy cooperative template with subscriber savings tiers, installation gallery, and signup form.', tags: ['Solar', 'Clean Energy', 'Community'] },
      { name: 'OpenCivic Urban Foundation', subtitle: 'PUBLIC PARKS & TRANSIT ADVOCACY', headline: 'Reclaiming City Streets for Pedestrians & Trees', desc: 'Civic organization layout featuring urban redesign projects, board leadership, and volunteer portal.', tags: ['Civic', 'Urbanism', 'Foundation'] },
      { name: 'RegenFarms Soil Collective', subtitle: 'PASTURE-RAISED & CARBON-NEGATIVE', headline: 'Supporting 400 Family Farms Transitioning to Organic', desc: 'Regenerative agriculture collective with farm partner gallery, CSA box tiers, and stewardship story.', tags: ['Agriculture', 'Organic', 'Collective'], badge: 'Popular' },
      { name: 'CodeForAll Youth Academy', subtitle: 'TUITION-FREE ENGINEERING FELLOWSHIP', headline: 'Launching Underrepresented Talent Into Tech Careers', desc: 'Educational non-profit template with graduate placement stats, mentor showcase, and corporate sponsorship.', tags: ['Education', 'Non-Profit', 'Fellowship'] },
      { name: 'WildPeaks Alpine Conservation', subtitle: 'GLACIER & WATERSHED PROTECTION', headline: 'Preserving High-Altitude Ecosystems for Future Generations', desc: 'Conservation trust website with trail restoration gallery, annual impact report, and membership tiers.', tags: ['Conservation', 'Mountains', 'Trust'] },
      { name: 'CircularLab Zero-Waste Packaging', subtitle: 'MYCELIUM & KELP BIO-MATERIALS', headline: 'Home-Compostable Packaging for Global Brands', desc: 'Sustainable materials company template with lifecycle stats, B2B sample kits, and material specs.', tags: ['Circular Economy', 'BioMaterials', 'Sustainability'] },
      { name: 'GlobalWater Well Initiative', subtitle: 'SOLAR-POWERED VILLAGE BOREHOLES', headline: '100% of Public Donations Fund Clean Water Access', desc: 'Charity & humanitarian template with GPS-tracked well gallery, transparent financials, and monthly giving.', tags: ['Charity', 'Humanitarian', 'Clean Water'] },
      { name: 'Pollinator City Network', subtitle: 'URBAN ROOFTOP APIARIES & MEADOWS', headline: 'Restoring Native Bee Corridors Across 40 Cities', desc: 'Ecological community project template with hive sponsorship tiers, honey shop, and school workshops.', tags: ['Biodiversity', 'Urban Eco', 'Community'] },
      { name: 'ReCraft Community Tool Library', subtitle: 'NEIGHBORHOOD MAKERSPACE & REPAIR CAFE', headline: 'Borrow 2,500+ Tools & Learn Woodworking Skills', desc: 'Local cooperative & makerspace layout with workshop calendar, membership tiers, and volunteer signup.', tags: ['Makerspace', 'Co-op', 'Repair'] },
      { name: 'TidalPower Coastal Alliance', subtitle: 'OFFSHORE WAVE & TIDAL ENERGY', headline: 'Predictable Marine Renewable Power for Island Grids', desc: 'Clean marine energy initiative template with turbine specs, environmental studies, and partner portal.', tags: ['Marine Energy', 'CleanTech', 'Alliance'] },
      { name: 'SeedBank Heritage Archive', subtitle: 'HEIRLOOM BOTANICAL PRESERVATION', headline: 'Safeguarding 18,000 Rare Crop Varieties for Farmers', desc: 'Botanical research & seed library template with catalog gallery, research fellows, and grant programs.', tags: ['Botanical', 'Archive', 'Research'] },
    ],
  },
  {
    style: 'Minimal',
    category: 'Minimal',
    accentPalette: ['#18181b', '#334155', '#2563eb', '#4f46e5', '#0f766e'],
    fonts: ['Inter', 'Plus Jakarta Sans', 'Space Grotesk', 'Playfair Display'],
    items: [
      { name: 'MonoType Literary & Essay Journal', subtitle: 'LONGFORM DIGITAL PUBLICATION', headline: 'Slow Journalism on Technology, Art, and Society', desc: 'Ultra-clean editorial & newsletter template with distraction-free typography and membership tiers.', tags: ['Newsletter', 'Editorial', 'Minimal'], badge: 'Popular' },
      { name: 'SwissGrid Architectural Index', subtitle: 'NEO-BRUTALIST SWISS LAYOUT', headline: 'Form Follows Rigorous Typographic Structure', desc: 'Minimalist Swiss grid template with crisp borders, monochrome palette, and project archive.', tags: ['Swiss Style', 'Monochrome', 'Grid'] },
      { name: 'QuietApp Waitlist Launch', subtitle: 'STEALTH PRODUCT LAUNCH PAGE', headline: 'A Calmer Way to Organize Your Personal Knowledge', desc: 'High-focus early access waitlist template with centered hero, 3 core principles, and invite request.', tags: ['Waitlist', 'Launch', 'Minimal'] },
      { name: 'Atelier Blank Dark Skeleton', subtitle: 'OBSIDIAN MINIMAL STARTER', headline: 'Pure Dark-Mode Foundation Ready for Custom Blocks', desc: 'Distraction-free dark mode starter canvas with navbar, centered hero, feature trio, and clean footer.', tags: ['Dark Mode', 'Starter', 'Skeleton'], dark: true },
      { name: 'Kanso Industrial Design Notes', subtitle: 'OBJECT DESIGN & PHILOSOPHY', headline: 'Less, But Better: Industrial Objects for Daily Life', desc: 'Dieter Rams-inspired minimal product showcase with generous whitespace and specification cards.', tags: ['Industrial Design', 'Whitespace', 'Clean'], badge: 'Curated' },
      { name: 'Paper & Ink Independent Press', subtitle: 'SMALL-BATCH ART MONOGRAPHS', headline: 'Linen-Bound Books Printed in Kyoto & Zurich', desc: 'Independent book publisher template with catalog grid, author essays, and stockist directory.', tags: ['Publishing', 'Books', 'Minimal'] },
      { name: 'Zenith Solo Consultant', subtitle: 'INDEPENDENT TECHNICAL ADVISOR', headline: 'Pragmatic Architecture Reviews for Series-B Teams', desc: 'Single-page consultant template with clear service scope, flat-fee pricing, and direct booking.', tags: ['Consultant', 'Single Page', 'Clean'] },
      { name: 'PlainText Documentation Hub', subtitle: 'OPEN SPECIFICATION & MANIFESTO', headline: 'Readable, Portable Standards for the Open Web', desc: 'Clean documentation & specification landing page with FAQ accordion, principles, and contributor links.', tags: ['Docs', 'Open Web', 'Minimal'] },
      { name: 'Aura Monochrome Resume', subtitle: 'MINIMAL EXECUTIVE CURRICULUM VITAE', headline: '15 Years of Product Leadership & Venture Building', desc: 'Refined monochrome CV & personal site with career milestones, board roles, and direct contact.', tags: ['Resume', 'CV', 'Monochrome'] },
      { name: 'ZeroNoise Podcast & Audio Lab', subtitle: 'CONVERSATIONS WITH SYSTEM BUILDERS', headline: 'Weekly Unedited Dialogues With Founders & Scientists', desc: 'Minimalist podcast & media show template with episode highlights, sponsor tiers, and newsletter.', tags: ['Podcast', 'Media', 'Minimal'], dark: true },
      { name: 'Linearity Micro-Changelog', subtitle: 'PRODUCT RELEASES & ROADMAP', headline: 'Shipping Craft & Performance Improvements Every Week', desc: 'Clean product changelog and public roadmap template with release highlights and feedback form.', tags: ['Changelog', 'Roadmap', 'Product'] },
      { name: 'Nordic Light Studio Loft', subtitle: 'DAYLIGHT PHOTOGRAPHY RENTAL SPACE', headline: 'South-Facing Cyclorama & Brutalist Concrete Loft', desc: 'Minimalist studio rental website with equipment inventory, hourly booking tiers, and gallery.', tags: ['Studio Rental', 'Space', 'Minimal'] },
    ],
  },
];

export const GENERATED_TEMPLATE_CATALOG: StarterTemplate[] = GROUPS.flatMap((group) =>
  group.items.map((item, idx) => {
    const photos = PHOTO_POOL[group.style];
    const thumb = photos[idx % photos.length];
    const heroImg = photos[(idx + 1) % photos.length];
    const accent = group.accentPalette[idx % group.accentPalette.length];
    const font = group.fonts[idx % group.fonts.length];
    const isDark = Boolean(item.dark);

    const blocks: BlockInstance[] = [
      makeBlock(idx % 3 === 0 ? 'navbar-megamenu' : 'navbar-standard', {
        settings: isDark ? { bgColor: '#0f172a', textColor: 'light' } : undefined,
        content: {
          brandName: item.name.split('—')[0].trim(),
          buttonText: 'Get Started',
          primaryButtonText: 'Get Started',
        },
      }),
      makeBlock(idx % 2 === 0 ? 'hero-split' : 'hero-centered', {
        settings: isDark
          ? { bgColor: '#0f172a', textColor: 'light', buttonPill: idx % 2 === 0 }
          : { buttonPill: idx % 2 === 0 },
        content: {
          badgeText: item.subtitle,
          subtitle: item.subtitle,
          title: item.headline,
          description: item.desc,
          primaryBtnText: 'Explore Now',
          secondaryBtnText: 'Learn More',
          button1: 'Explore Now',
          button2: 'Learn More',
          imageUrl: heroImg,
        },
      }),
      makeBlock('features-3col', {
        content: {
          subtitle: item.subtitle,
          title: `Why Leading Teams Choose ${item.name.split(' ')[0]}`,
          description: item.desc,
        },
      }),
      makeBlock(idx % 2 === 0 ? 'gallery-grid' : 'features-split', {
        content: {
          subtitle: 'SHOWCASE & CAPABILITIES',
          title: `Inside ${item.name}`,
          description: item.desc,
        },
      }),
      makeBlock(
        group.style === 'Portfolio' || group.style === 'Agency'
          ? 'testimonials-cards'
          : 'pricing-tiers',
        {
          content: {
            subtitle: 'TRANSPARENT OPTIONS',
            title: `${item.name.split(' ')[0]} Plans & Packages`,
          },
        }
      ),
      makeBlock(idx % 3 === 0 ? 'faq-accordion' : 'contact-split', {
        content: {
          subtitle: 'CONNECT WITH US',
          title: `Start Your Journey With ${item.name.split(' ')[0]}`,
          description: item.desc,
        },
      }),
      makeBlock('footer-columns', {
        settings: isDark ? { bgColor: '#0f172a', textColor: 'light' } : undefined,
        content: {
          brandName: item.name.split('—')[0].trim(),
          brandDesc: item.desc,
        },
      }),
    ];

    return {
      id: `tmpl-${group.style.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx + 1}`,
      name: item.name,
      category: group.category,
      style: group.style,
      thumbnailUrl: thumb,
      description: item.desc,
      badge: item.badge,
      accentColor: accent,
      previewTags: item.tags,
      theme: {
        primaryColor: accent,
        secondaryColor: '#64748b',
        darkColor: '#0f172a',
        lightColor: '#f8fafc',
        fontFamily: font,
        buttonStyle: idx % 2 === 0 ? 'rounded-pill' : 'rounded',
        colorMode: isDark ? 'dark' : 'light',
      },
      blocks,
    };
  })
);
