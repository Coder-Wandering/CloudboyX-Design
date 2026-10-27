import { VisualNode } from './engine/bootstrapCascade';

export * from './engine/bootstrapCascade';

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export type BlockCategory =
  | 'html'
  | 'headers'
  | 'navbars'
  | 'features'
  | 'content'
  | 'dividers'
  | 'pricing'
  | 'gallery'
  | 'testimonials'
  | 'team'
  | 'forms'
  | 'footers';

export interface BlockField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'icon' | 'color' | 'select' | 'boolean';
  options?: { label: string; value: string }[];
}

export interface BlockSettings {
  bgType: 'color' | 'image' | 'gradient';
  bgColor: string; // e.g. '#ffffff', '#0f172a', 'bg-dark', 'bg-primary'
  bgImage?: string;
  bgOverlayOpacity?: number; // 0 to 100
  bgOverlayColor?: string; // custom hex color for image overlay
  bgSize?: 'cover' | 'contain' | 'auto';
  bgPosition?: 'center' | 'top' | 'bottom';
  bgRepeat?: 'no-repeat' | 'repeat';
  paddingTop: number | string; // 0 to 5 or 'pt-*' / 'py-*'
  paddingBottom: number | string; // 0 to 5 or 'pb-*' / 'py-*'
  paddingLeft?: number; // 0 to 5 (mapped to ps-*)
  paddingRight?: number; // 0 to 5 (mapped to pe-*)
  marginTop?: number; // 0 to 5 (mapped to mt-*)
  marginBottom?: number; // 0 to 5 (mapped to mb-*)
  marginLeft?: number | 'auto'; // 0 to 5 or 'auto' (mapped to ms-*)
  marginRight?: number | 'auto'; // 0 to 5 or 'auto' (mapped to me-*)
  containerWidth: 'container' | 'container-fluid';
  textColor: 'dark' | 'light';
  textAlign: 'start' | 'center' | 'end' | 'left' | 'right';
  showTitle: boolean;
  showSubtitle: boolean;
  showDescription: boolean;
  showButtons: boolean;
  showMedia: boolean;
  showIcons: boolean;
  columns?: number; // 1, 2, 3, 4, 6
  buttonVariant?: 'primary' | 'secondary' | 'dark' | 'light' | 'outline-primary' | 'outline-light' | 'success' | 'warning';
  buttonPill?: boolean;
  cardShadow?: boolean;
  shadow?: 'shadow-none' | 'shadow-sm' | 'shadow' | 'shadow-lg';
  layoutTemplate?: '1-column' | '2-column' | '3-column' | '4-column' | 'masonry' | 'asymmetric-left' | 'asymmetric-right' | 'zigzag';
  gutterSize?: 'g-1' | 'g-2' | 'g-3' | 'g-4' | 'g-5';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
  alignItems?: 'start' | 'center' | 'stretch';
  cardHeight?: 'auto' | 'h-100';
  semanticTag?: 'section' | 'header' | 'footer' | 'article' | 'aside';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  fullHeight?: boolean;
  bgParallax?: boolean;
  bgOverlay?: boolean;
  darkSection?: boolean;
  // Media Carousel Settings
  aspectRatio?: '16x9' | '4x3' | '21x9' | '1x1' | string;
  carouselAutoplay?: boolean;
  carouselInterval?: number;
  carouselIndicators?: boolean;
  carouselControls?: boolean;
  carouselTransition?: 'slide' | 'crossfade' | string;
  carouselPauseOnHover?: boolean;
}

export type CommentTag = 'TODO' | 'NOTE' | 'FIXME' | 'REVIEW' | 'DESIGN' | 'API';

export interface BlockComment {
  id: string;
  blockId: string;
  blockName?: string;
  text: string;
  author: string;
  role?: string;
  tag: CommentTag;
  createdAt: number;
  updatedAt?: number;
  resolved?: boolean;
}

export interface BlockInstance {
  id: string;
  type: string;
  category: BlockCategory;
  name: string;
  settings: BlockSettings;
  content: Record<string, any>;
  visualNode?: VisualNode;
  customHtml?: string;
  customCss?: string;
  comments?: BlockComment[];
}

export interface BlockPreset {
  id: string;
  name: string;
  description?: string;
  category: BlockCategory | 'custom';
  tags?: string[];
  isBuiltIn?: boolean;
  createdAt: number;
  block: {
    type: string;
    category: BlockCategory;
    name: string;
    settings: BlockSettings;
    content: Record<string, any>;
    visualNode?: VisualNode;
  };
}

export type BlockAnimationType = 'added' | 'moved-up' | 'moved-down' | 'duplicated';

export interface BlockAnimationMeta {
  blockId: string;
  type: BlockAnimationType;
  timestamp: number;
}

export interface BlockDefinition {
  type: string;
  category: BlockCategory;
  name: string;
  description: string;
  iconName: string;
  tags?: string[];
  thumbnailUrl?: string;
  defaultSettings: BlockSettings;
  defaultContent: Record<string, any>;
  renderHtml: (block: BlockInstance, theme: SiteTheme, isEditor?: boolean) => string;
}

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  darkColor: string;
  lightColor: string;
  fontFamily: string; // Dynamic Google Fonts e.g. 'Space Grotesk', 'Plus Jakarta Sans', 'Inter', etc.
  headingFontFamily?: string; // Optional distinct heading font e.g. 'Space Grotesk'
  googleFontsUrl?: string;
  buttonStyle: 'rounded' | 'rounded-pill' | 'rounded-0';
  colorMode?: 'light' | 'dark'; // Bootstrap 5.3 data-bs-theme mode
  customCss?: string; // Custom injected user CSS
}

export interface StarterTemplate {
  id: string;
  name: string;
  category: 'SaaS & AI' | 'Agency & Portfolio' | 'Business & Finance' | 'E-Commerce & Retail' | 'Mobile & Health' | 'Events & Dining' | 'Eco & Community' | 'Minimal';
  style?: 'Agency' | 'SaaS' | 'Portfolio' | 'E-Commerce' | 'Corporate' | 'Startup' | 'Health & Mobile' | 'Events & Dining' | 'Eco & Community' | 'Minimal';
  thumbnailUrl?: string;
  complexity?: 1 | 2 | 3 | 4 | 5;
  description: string;
  badge?: string;
  accentColor: string;
  previewTags: string[];
  theme?: Partial<SiteTheme>;
  blocks: BlockInstance[];
}

export interface WebsiteProject {
  id: string;
  title: string;
  theme: SiteTheme;
  blocks: BlockInstance[];
}

export interface SeoSettings {
  title: string;
  description: string;
  ogImageUrl: string;
  faviconUrl: string;
  keywords?: string;
  author?: string;
  canonicalUrl?: string;
  twitterHandle?: string;
  headHtml?: string;
  bodyStartHtml?: string;
  bodyEndHtml?: string;
}

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  title: '',
  description: 'Crafted with Bootstrap 5 Visual Studio. Modern, responsive, and mobile-first website.',
  ogImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&h=630&q=80',
  faviconUrl: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/bootstrap-fill.svg',
  keywords: 'bootstrap 5, website builder, responsive design, landing page',
  author: 'Bootstrap 5 Studio',
  canonicalUrl: '',
  twitterHandle: '',
};

export type GranularRole = 'admin' | 'agency_team' | 'client_editor' | 'client_readonly';

export interface RolePermission {
  role: GranularRole;
  label: string;
  description: string;
  badgeColor: string;
  canEditDesign: boolean;
  canPublish: boolean;
  canManageClients: boolean;
  canViewBilling: boolean;
  canManageInvoices: boolean;
  canSubmitTickets: boolean;
  canAccessCode: boolean;
}

export const ROLE_PERMISSIONS: Record<GranularRole, RolePermission> = {
  admin: {
    role: 'admin',
    label: 'Agency Admin',
    description: 'Full system ownership: branding, client accounts, financial billing, code exports, and global gates.',
    badgeColor: 'bg-violet-600 text-white',
    canEditDesign: true,
    canPublish: true,
    canManageClients: true,
    canViewBilling: true,
    canManageInvoices: true,
    canSubmitTickets: true,
    canAccessCode: true,
  },
  agency_team: {
    role: 'agency_team',
    label: 'Agency Team',
    description: 'Internal designers & project managers. Can edit websites, manage block layouts, track client billing cycles, and handle support tickets.',
    badgeColor: 'bg-blue-600 text-white',
    canEditDesign: true,
    canPublish: true,
    canManageClients: true,
    canViewBilling: true,
    canManageInvoices: true,
    canSubmitTickets: true,
    canAccessCode: true,
  },
  client_editor: {
    role: 'client_editor',
    label: 'Client Editor',
    description: 'Client self-service access. Can edit text, replace images, inspect mobile layout, and submit revision tickets.',
    badgeColor: 'bg-emerald-600 text-white',
    canEditDesign: true,
    canPublish: false,
    canManageClients: false,
    canViewBilling: true,
    canManageInvoices: false,
    canSubmitTickets: true,
    canAccessCode: false,
  },
  client_readonly: {
    role: 'client_readonly',
    label: 'Client Read-Only',
    description: 'Review access only. Can view interactive previews, check analytics, and review invoices without editing.',
    badgeColor: 'bg-slate-600 text-white',
    canEditDesign: false,
    canPublish: false,
    canManageClients: false,
    canViewBilling: true,
    canManageInvoices: false,
    canSubmitTickets: true,
    canAccessCode: false,
  },
};

export interface AgencyBranding {
  agencyName: string;
  agencyLogoUrl: string;
  customDomain: string;
  primaryBrandColor: string;
  supportEmail: string;
  clientWelcomeMessage: string;
  hidePlatformBranding: boolean;
  loginHeroTitle?: string;
  loginHeroSubtitle?: string;
}

export const DEFAULT_AGENCY_BRANDING: AgencyBranding = {
  agencyName: 'CloudboyX Agency',
  agencyLogoUrl: '',
  customDomain: 'client.cloudboyx.io',
  primaryBrandColor: '#2222FF',
  supportEmail: 'support@cloudboyx.io',
  clientWelcomeMessage: 'Welcome to your custom client portal. Monitor real-time visitor metrics, preview your responsive website, and request design revisions anytime.',
  hidePlatformBranding: true,
  loginHeroTitle: 'Client Experience Portal',
  loginHeroSubtitle: 'Access your dedicated website metrics, review staging updates, and collaborate with your design team.',
};

export interface ClientSupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'Design Revision' | 'Bug Fix' | 'Feature Request' | 'Billing & Subscription' | 'Domain & Hosting';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting on Client' | 'Resolved';
  clientId: string;
  clientEmail: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    sender: 'client' | 'agency';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface RecurringInvoiceConfig {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  organization?: string;
  planName: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Yearly';
  amount: number;
  currency: string;
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string; // YYYY-MM-DD
  lastBilledDate?: string;
  autoCharge: boolean;
  paymentMethod: {
    brand: 'visa' | 'mastercard' | 'amex';
    last4: string;
    expiry: string;
  };
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
  createdAt: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  type: 'one_time' | 'recurring_subscription';
  planOrItemName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'active';
  dueDate: string;
  paidAt?: string;
  billingCycle?: 'Monthly' | 'Quarterly' | 'Yearly' | 'One-off';
  recurringConfigId?: string;
  paymentMethod?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  category: 'Getting Started' | 'Editing & Content' | 'Mobile Layouts' | 'Analytics & SEO' | 'Billing & Invoices';
  duration: string;
  thumbnailUrl: string;
  videoUrl: string;
  steps: string[];
}

export interface ClientTrafficMetrics {
  totalPageviews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRatePercent: number;
  mobileTrafficPercent: number;
  topDevices: { name: string; percent: number }[];
  trafficSources: { source: string; percent: number }[];
  recentVisitsTrend: { date: string; views: number }[];
}

export interface MilestoneDeliverable {
  id: string;
  title: string;
  completed: boolean;
  fileDeliverableKey?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  phase: number;
  status: 'completed' | 'in_progress' | 'in_review' | 'upcoming';
  progressPercent: number;
  dueDate: string;
  completedDate?: string;
  assignedLead: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  deliverables: MilestoneDeliverable[];
  clientApproved?: boolean;
  approvedAt?: string;
  approvedBy?: string;
  clientFeedback?: string;
}

export interface ExportedProjectFile {
  id: string;
  fileName: string;
  fileType: 'html' | 'css' | 'js' | 'zip' | 'xml' | 'json';
  fileSize: string;
  version: string;
  updatedAt: string;
  description: string;
  category: 'Markup' | 'Stylesheets' | 'Assets' | 'Full Archive' | 'SEO & Config';
  codeContent: string;
}

export interface ClipboardBlockItem {
  id: string;
  block: BlockInstance;
  copiedAt: number;
  previewTitle?: string;
  previewCategory?: BlockCategory;
}

export interface ClonedTemplateProject {
  id: string;
  sourceTemplateId: string;
  sourceTemplateName: string;
  title: string;
  category: string;
  style?: string;
  thumbnailUrl?: string;
  accentColor?: string;
  blocks: BlockInstance[];
  theme: SiteTheme;
  createdAt: number;
}

export const CLONED_PROJECTS_STORAGE_KEY = 'cloudboyx_cloned_dashboard_projects';

export interface ProjectRevision {
  id: string;
  timestamp: number;
  title: string;
  blockCount: number;
  blocks: BlockInstance[];
  theme: SiteTheme;
  seoSettings?: SeoSettings;
  type: 'autosave' | 'manual' | 'restore_point';
  label?: string;
  description?: string;
  sectionNames?: string[];
}

export const REVISIONS_STORAGE_KEY = 'bootstrap5_visual_editor_revisions';


