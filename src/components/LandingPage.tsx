import React, { useState } from 'react';
import {
  Sparkles,
  Layout,
  Code2,
  Smartphone,
  Layers,
  Palette,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  ChevronDown,
  Monitor,
  Tablet,
  ExternalLink,
  Shield,
  Key,
  Globe,
  Type,
  Receipt,
  Activity,
  TrendingUp,
  Workflow,
  Building2,
  Server,
  Clock,
  Lock,
  Boxes,
  Check,
  FileCode,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';
import { CloudboyXModulesModal } from './modules/CloudboyXModulesModal';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';

interface LandingPageProps {
  onEnterBuilder: () => void;
  onOpenAdmin?: () => void;
  onOpenModules?: () => void;
  themeMode?: 'light' | 'dark';
  onToggleThemeMode?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterBuilder,
  onOpenAdmin,
  onOpenModules,
  themeMode = 'light',
  onToggleThemeMode,
}) => {
  const { user, isDemoUnlocked, isAdmin } = useAuth();
  const isDark = themeMode === 'dark';
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'admin'>('signup');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [interactiveMockTab, setInteractiveMockTab] = useState<'design' | 'typography' | 'modules'>('typography');
  const [mockFontPairing, setMockFontPairing] = useState<'visionary' | 'modern' | 'editorial'>('visionary');
  const [activeModuleTab, setActiveModuleTab] = useState<'erp' | 'map' | 'connect' | 'predict'>('erp');
  const [isModulesModalOpen, setIsModulesModalOpen] = useState(false);

  const openAuth = (mode: 'signin' | 'signup' | 'admin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    onEnterBuilder();
  };

  const isAuthenticated = !!user || isDemoUnlocked;

  const handleOpenModules = () => {
    if (onOpenModules) {
      onOpenModules();
    } else {
      setIsModulesModalOpen(true);
    }
  };

  const features = [
    {
      icon: <Type className="w-5 h-5 text-blue-600" />,
      title: 'Dynamic Google Fonts Engine',
      description:
        'Live search across the Google Fonts catalog with instant specimen rendering, heading & body font pairing, and automated single-request CDN stylesheet injection.',
    },
    {
      icon: <Receipt className="w-5 h-5 text-emerald-600" />,
      title: 'White-Label Agency & Invoicing',
      description:
        'Deploy dedicated client dashboards with custom branding, granular role-based permissions (Agency Admin, Editor, Reviewer), and itemized recurring invoicing (Monthly, Quarterly, Annual).',
    },
    {
      icon: <Boxes className="w-5 h-5 text-purple-600" />,
      title: 'Connected Enterprise Modules',
      description:
        'Pre-linked bridges to the CloudboyX AI ERP Gateway, 24/7 MAP Price Protection scanner, Webhook/EDI Connect studio, and Kalshi Predict engine.',
    },
    {
      icon: <Layout className="w-5 h-5 text-indigo-600" />,
      title: 'Semantic Bootstrap 5.3 Blocks',
      description:
        'Craft entire landing pages with standard Bootstrap rows, columns, and elevation utility presets (.shadow-sm, .shadow, .shadow-lg) without custom CSS overhead.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-cyan-600" />,
      title: 'Responsive Breakpoint HUD',
      description:
        'Test and fine-tune designs across mobile (375px), tablet (768px), desktop (1200px), and widescreen viewports with native Bootstrap cascade logic.',
    },
    {
      icon: <Code2 className="w-5 h-5 text-amber-600" />,
      title: '100% Clean HTML Export',
      description:
        'Zero framework lock-in. Export semantic, production-ready HTML5 with official Bootstrap 5 CDN scripts and Google Fonts embeds in a single click.',
    },
  ];

  const modules = [
    {
      id: 'erp',
      title: 'AI ERP Gateway',
      subtitle: 'Autonomous Enterprise Ledger & Catalog Bridge',
      url: 'https://cloudboyx-erp.ai.studio',
      badge: '14,820 tx/s',
      color: 'border-blue-500/30 bg-blue-500/5',
      accentColor: 'text-blue-600',
      icon: <Server className="w-5 h-5 text-blue-600" />,
      description:
        'Connects enterprise resource planning with real-time financial tracking, double-entry blockchain reconciliation, zero ledger discrepancies, and direct product catalog sync into the website builder.',
      metrics: [
        { label: 'Throughput', val: '14,820 tx/s' },
        { label: 'Ledger Uptime', val: '99.98%' },
        { label: 'Discrepancies', val: '0 (Reconciled)' },
      ],
      highlights: [
        'Live double-entry cryptographic block auditing',
        'Automatic website catalog synchronization',
        'Multi-currency balance reconciliation',
      ],
    },
    {
      id: 'map',
      title: 'Map Protection Scanner',
      subtitle: 'Automated 24/7 Minimum Advertised Price Enforcement',
      url: 'https://map-protection-scanner.ai.studio',
      badge: '99.4% Enforcement',
      color: 'border-rose-500/30 bg-rose-500/5',
      accentColor: 'text-rose-600',
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
      description:
        'Autonomous monitoring across Amazon, Walmart, eBay, and Google Shopping. Instantly flags rogue reseller price deltas and generates legal cease-and-desist notices.',
      metrics: [
        { label: 'Active Retail Crawlers', val: '4 Channels' },
        { label: 'Enforcement Rate', val: '99.4%' },
        { label: 'Avg Delta Identified', val: '-18.5%' },
      ],
      highlights: [
        'Real-time retail price delta auditing',
        'Automated Cease & Desist dispatching',
        'Seller compliance reputation grading',
      ],
    },
    {
      id: 'connect',
      title: 'CloudboyX Connect',
      subtitle: 'Enterprise Webhook & ANSI X12 EDI Studio',
      url: 'https://cloudboyx.ai.studio',
      badge: '20 req/s Monitored',
      color: 'border-indigo-500/30 bg-indigo-500/5',
      accentColor: 'text-indigo-600',
      icon: <Workflow className="w-5 h-5 text-indigo-600" />,
      description:
        'High-speed Webhook & EDI studio supporting ANSI X12 EDI 850 purchase order dispatching, Kalshi Exchange 20 req/s rate monitoring, simulated $1,000.00 bankroll tracking, and Slack/Telegram alerts.',
      metrics: [
        { label: 'Feed Rate', val: '20 req/s' },
        { label: 'Active Bankroll', val: '$1,000.00' },
        { label: 'Protocol', val: 'ANSI X12 EDI 850' },
      ],
      highlights: [
        'Real-time webhook signature verification',
        'Instant ANSI X12 EDI 850 packet generation',
        'Telegram and Slack broadcast webhooks',
      ],
    },
    {
      id: 'predict',
      title: 'CloudboyX Predict',
      subtitle: 'AI Multi-Agent Event Contract Intelligence',
      url: 'https://cloudboyx.ai.studio/',
      badge: '3-Way AI Consensus',
      color: 'border-purple-500/30 bg-purple-500/5',
      accentColor: 'text-purple-600',
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      description:
        'Kalshi prediction market contract research pipeline with autonomous 3-way multi-agent debates (Bullish Analyst, Risk Defense, Econometric Synthesizer) and expected value (EV) stake profit calculators.',
      metrics: [
        { label: 'AI Debate Agents', val: '3 Models' },
        { label: 'Risk Sizing', val: 'Kelly Criterion' },
        { label: 'Edge Threshold', val: '+4.2% EV' },
      ],
      highlights: [
        'Autonomous multi-perspective agent debate',
        'Expected Value (EV) calculation engine',
        'Live market contract radar & odds ingestion',
      ],
    },
  ];

  const templatesPreview = [
    {
      title: 'The Visionary Architect',
      category: 'Enterprise SaaS',
      badge: 'CloudboyX Brand',
      color: 'from-slate-900 via-slate-800 to-blue-950',
      description: 'Display Space Grotesk + Plus Jakarta Sans typography, obsidian jet dark accents, and connected ERP & MAP status widgets.',
    },
    {
      title: 'SaaS Launchpad',
      category: 'Software & Tech',
      badge: 'High Conversion',
      color: 'from-blue-600 to-indigo-700',
      description: 'High-converting hero with interactive pricing tier, feature matrix, customer testimonial grid, and lead capture form.',
    },
    {
      title: 'Creative Studio',
      category: 'Design & Agency',
      badge: 'Bento Grid',
      color: 'from-violet-600 to-purple-800',
      description: 'Editorial typography, dark mode accents, dynamic portfolio grid, client roster, and custom contact form block.',
    },
    {
      title: 'Mobile App Showcase',
      category: 'Mobile Product',
      badge: 'Responsive',
      color: 'from-emerald-600 to-teal-800',
      description: 'App store download triggers, interactive feature tabs, client review marquee, and clean FAQ accordion.',
    },
  ];

  const faqs = [
    {
      q: 'How does the dynamic Google Fonts system work?',
      a: 'CloudboyX Design lets you browse and search Google Fonts with live specimen previews. You can choose different fonts for headings and body copy (like Space Grotesk for headings and Plus Jakarta Sans for body). When you export your project, the platform automatically generates a single optimized Google Fonts CDN <link> bundle and attaches the matching CSS font-family rules.',
    },
    {
      q: 'What is the CloudboyX Enterprise Suite and how does it connect?',
      a: 'The Enterprise Suite connects four specialized operational modules: AI ERP Gateway (for ledger reconciliation and catalog sync), Map Protection (for 24/7 retail price enforcement), CloudboyX Connect (for Webhook and EDI 850 packet dispatching), and CloudboyX Predict (for event contract AI debate and EV calculations). You can launch and monitor all four directly inside the builder or through the dedicated portal.',
    },
    {
      q: 'Can agencies white-label the builder and bill clients directly?',
      a: 'Yes! The Agency Client Portal allows agencies to customize their sub-domain, company logo, and primary brand colors. You can invite team members with granular roles (Owner, Agency Admin, Editor, Client Reviewer) and generate itemized client invoices with recurring billing cycles (Monthly, Quarterly, or Annual).',
    },
    {
      q: 'Does the generated code have any vendor lock-in?',
      a: 'None whatsoever. The builder generates 100% clean, standard Bootstrap 5.3 HTML5 code with semantic markup (<nav>, <header>, <section>, <footer>) and official Bootstrap CDN references. You can copy the code or download it to deploy on GitHub Pages, Netlify, Vercel, or any standard web server.',
    },
    {
      q: 'How does Firebase Authentication secure my workspaces?',
      a: 'Authentication is handled securely via Firebase Auth supporting Google Sign-In and Email/Password. Your project layouts, custom styling, invoices, and client portal configurations remain saved to your secure profile.',
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#0b0f19] text-slate-100 selection:bg-cyan-900 selection:text-cyan-200'
          : 'bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-200 ${
          isDark
            ? 'bg-[#0b0f19]/95 border-slate-800 text-slate-100 shadow-sm'
            : 'bg-white/95 border-slate-200/80 text-slate-900 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-md shadow-slate-900/20 border border-slate-800">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold text-base tracking-tight leading-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  CloudboyX
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                    isDark
                      ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  Design
                </span>
              </div>
              <span className={`text-[10px] font-medium tracking-wide block leading-none ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Bootstrap 5 & Enterprise Intelligence
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <nav
            className={`hidden md:flex items-center gap-7 text-xs font-semibold ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <a href="#features" className={`transition ${isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
              Features
            </a>
            <a href="#preview" className={`transition ${isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
              Live Preview
            </a>
            <a
              href="#modules"
              className={`transition flex items-center gap-1 ${
                isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'
              }`}
            >
              <span>Enterprise Suite</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </a>
            <a href="#branding" className={`transition ${isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
              Brand Identity
            </a>
            <a href="#templates" className={`transition ${isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
              Templates
            </a>
            <a href="#faq" className={`transition ${isDark ? 'hover:text-cyan-400' : 'hover:text-blue-600'}`}>
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Switch in Header */}
            {onToggleThemeMode && (
              <ThemeToggleSwitch
                themeMode={themeMode}
                onToggle={onToggleThemeMode}
                size="sm"
                className="mr-1"
              />
            )}

            <button
              type="button"
              onClick={handleOpenModules}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                isDark
                  ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                  : 'text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-blue-500" />
              <span>4 Modules</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isAdmin ? 'Agency Portal' : 'Client Portal'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onEnterBuilder}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
                  }`}
                >
                  <span>Launch Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuth('admin')}
                  className={`px-2.5 py-2 text-xs font-semibold rounded-xl transition flex items-center gap-1 ${
                    isDark
                      ? 'text-slate-400 hover:text-violet-300 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-violet-700 hover:bg-violet-50'
                  }`}
                  title="Administrator Portal Login"
                >
                  <Key className="w-3.5 h-3.5 text-violet-500" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signin')}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="nav-signup-btn"
                  onClick={() => openAuth('signup')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className={`relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white'
            : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900'
        }`}
      >
        {/* Glow decoration in dark mode */}
        {isDark && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-20">
            <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Eyebrow Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border shadow-sm transition ${
              isDark
                ? 'bg-slate-900 text-slate-200 border-slate-800'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-300'}>The Visionary Architect Edition</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-300 font-semibold">Bootstrap 5.3 + Google Fonts</span>
          </div>

          {/* Main Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] transition-colors ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Design & Deploy Production Websites With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400">
              Connected Enterprise Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`max-w-3xl mx-auto text-base sm:text-lg leading-relaxed font-normal transition-colors ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            The visual Bootstrap 5.3 canvas crafted for modern agencies and enterprises. Features
            dynamic Google Fonts pairing, white-label client portal & recurring billing, and deep connectors for
            AI ERP Gateway, MAP Price Protection, Webhook/EDI, and Kalshi Event Predict.
          </p>

          {/* Main Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              type="button"
              id="hero-signup-cta"
              onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Open Visual Workspace' : 'Start Designing Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleOpenModules}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 border ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <Boxes className="w-4 h-4 text-blue-500" />
              <span>Explore Enterprise Suite</span>
            </button>
          </div>

          {/* Benefit Bullets */}
          <div className={`pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium transition-colors ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Google Fonts Live Pairing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>White-Label Client Invoicing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>4 Connected CloudboyX Modules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>100% Clean HTML5 Export</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup Showcase */}
        <div className="mt-14 max-w-6xl mx-auto px-4 sm:px-6" id="preview">
          <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 shadow-2xl border border-slate-800 ring-1 ring-white/10">
            {/* Top Bar with Viewport Toggles */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
                  builder.cloudboyx.io/workspace • live canvas
                </span>
              </div>

              {/* Viewport simulation */}
              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition ${
                    previewDevice === 'desktop'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop Preview (1200px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded transition ${
                    previewDevice === 'tablet'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet Preview (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition ${
                    previewDevice === 'mobile'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile Preview (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <span>Launch Interactive Studio</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {/* Window Interior Simulation */}
            <div className="pt-3 bg-slate-950 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[460px]">
              {/* Mock Interactive Sidebar */}
              <div className="w-full md:w-72 bg-slate-900 border-r border-slate-800 p-4 text-left space-y-4 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Visual Controls HUD
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    BS 5.3 + CDN
                  </span>
                </div>

                {/* Tab Switcher inside Mockup */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setInteractiveMockTab('typography')}
                    className={`py-1 rounded-lg transition ${
                      interactiveMockTab === 'typography'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Fonts
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractiveMockTab('design')}
                    className={`py-1 rounded-lg transition ${
                      interactiveMockTab === 'design'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Shadows
                  </button>
                  <button
                    type="button"
                    onClick={() => setInteractiveMockTab('modules')}
                    className={`py-1 rounded-lg transition ${
                      interactiveMockTab === 'modules'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Modules
                  </button>
                </div>

                {/* Sub-tab: Typography Demo */}
                {interactiveMockTab === 'typography' && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300">
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>Active Typography Pair</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">
                          Google CDN
                        </span>
                      </div>
                      <div className="space-y-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setMockFontPairing('visionary')}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                            mockFontPairing === 'visionary'
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">Visionary Architect</div>
                            <div className="text-[9px] opacity-80">Space Grotesk + Plus Jakarta Sans</div>
                          </div>
                          {mockFontPairing === 'visionary' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setMockFontPairing('modern')}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                            mockFontPairing === 'modern'
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">Digital Native</div>
                            <div className="text-[9px] opacity-80">Outfit + Inter</div>
                          </div>
                          {mockFontPairing === 'modern' && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setMockFontPairing('editorial')}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                            mockFontPairing === 'editorial'
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-[11px]">Luxury Editorial</div>
                            <div className="text-[9px] opacity-80">Playfair Display + Plus Jakarta</div>
                          </div>
                          {mockFontPairing === 'editorial' && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab: Design & Elevation */}
                {interactiveMockTab === 'design' && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-xs">
                      <div className="flex items-center justify-between text-blue-300 font-semibold mb-1">
                        <span>Bootstrap Shadows</span>
                        <code className="text-[10px] bg-blue-500/20 px-1 py-0.5 rounded font-mono">.shadow-lg</code>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Multi-level elevation presets applied directly to active block cards.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs text-slate-300">
                      <span className="font-semibold block mb-1">Theme Colors</span>
                      <div className="flex gap-1.5 mt-1">
                        <div className="w-5 h-5 rounded-md bg-[#0b0f19] border border-cyan-500/40" title="Obsidian Jet" />
                        <div className="w-5 h-5 rounded-md bg-blue-600" title="Primary Blue" />
                        <div className="w-5 h-5 rounded-md bg-indigo-600" title="Indigo" />
                        <div className="w-5 h-5 rounded-md bg-emerald-600" title="Success" />
                        <div className="w-5 h-5 rounded-md bg-cyan-500" title="Cyan Accent" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-tab: Connected Modules */}
                {interactiveMockTab === 'modules' && (
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400">
                        <span>AI ERP Gateway</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">14,820 tx/s ledger synced</span>
                    </div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-rose-400">
                        <span>MAP Protection</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Amazon, Walmart crawling</span>
                    </div>

                    <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
                        <span>Connect & Predict</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">EDI 850 + Kalshi 20 req/s</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition text-center block shadow-md shadow-blue-500/20"
                  >
                    Open Live Studio
                  </button>
                </div>
              </div>

              {/* Mock Preview Stage */}
              <div className={`flex-1 p-4 md:p-6 overflow-y-auto flex items-center justify-center transition-colors ${
                isDark ? 'bg-slate-950' : 'bg-slate-100'
              }`}>
                <div
                  className={`rounded-xl shadow-xl transition-all duration-300 border overflow-hidden w-full ${
                    isDark ? 'bg-slate-900 border-slate-800 shadow-slate-950/80' : 'bg-white border-slate-200 shadow-xl'
                  } ${
                    previewDevice === 'mobile'
                      ? 'max-w-[340px]'
                      : previewDevice === 'tablet'
                      ? 'max-w-[560px]'
                      : 'max-w-[760px]'
                  }`}
                  style={{
                    fontFamily:
                      mockFontPairing === 'visionary'
                        ? 'Plus Jakarta Sans, sans-serif'
                        : mockFontPairing === 'editorial'
                        ? 'Plus Jakarta Sans, sans-serif'
                        : 'Inter, sans-serif',
                  }}
                >
                  {/* Mock Navbar */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-bold transition-colors ${
                    isDark ? 'border-slate-800 text-white bg-slate-900' : 'border-slate-100 text-slate-800 bg-white'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-slate-900'}`} />
                      <span
                        style={{
                          fontFamily:
                            mockFontPairing === 'visionary'
                              ? 'Space Grotesk, sans-serif'
                              : mockFontPairing === 'editorial'
                              ? 'Playfair Display, serif'
                              : 'Outfit, sans-serif',
                        }}
                      >
                        CloudboyX Architecture
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>ERP Gateway</span>
                      <span>MAP Guard</span>
                      <button className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                        isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        Launch Demo
                      </button>
                    </div>
                  </div>

                  {/* Mock Hero Block with Dynamic Typography */}
                  <div className={`p-6 md:p-8 text-center space-y-3 transition-colors ${
                    isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white' : 'bg-gradient-to-b from-slate-50 to-white text-slate-900'
                  }`}>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDark ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-700'
                    }`}>
                      Bootstrap 5.3 + {mockFontPairing === 'visionary' ? 'Space Grotesk' : mockFontPairing === 'editorial' ? 'Playfair Display' : 'Outfit'}
                    </span>
                    <h3
                      className={`text-xl md:text-2xl font-bold transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                      style={{
                        fontFamily:
                          mockFontPairing === 'visionary'
                            ? 'Space Grotesk, sans-serif'
                            : mockFontPairing === 'editorial'
                            ? 'Playfair Display, serif'
                            : 'Outfit, sans-serif',
                      }}
                    >
                      Precision Web Engineering Without Lock-in
                    </h3>
                    <p className={`text-xs max-w-md mx-auto leading-relaxed transition-colors ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Build responsive layouts with semantic Bootstrap classes, Google Fonts CDN injection,
                      and live bridges into enterprise ledger and price monitoring suites.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                        View Live Components
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                      }`}>
                        Inspect Exported HTML
                      </span>
                    </div>
                  </div>

                  {/* Mock 3-Column Enterprise Widgets */}
                  <div className={`p-5 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t transition-colors ${
                    isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-100 bg-slate-50/60'
                  }`}>
                    <div className={`p-3 rounded-lg border shadow-sm text-left transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-blue-500 font-mono">ERP GATEWAY</span>
                        <span className="text-[9px] text-emerald-400 font-semibold">Active</span>
                      </div>
                      <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>14,820 tx/s</h5>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Automated ledger reconcile</p>
                    </div>
                    <div className={`p-3 rounded-lg border shadow-sm text-left transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-rose-500 font-mono">MAP SCANNER</span>
                        <span className="text-[9px] text-emerald-400 font-semibold">Crawling</span>
                      </div>
                      <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>99.4% MAP Match</h5>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Multi-channel price audit</p>
                    </div>
                    <div className={`p-3 rounded-lg border shadow-sm text-left transition-colors ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-purple-400 font-mono">CONNECT & PREDICT</span>
                        <span className="text-[9px] text-emerald-400 font-semibold">Online</span>
                      </div>
                      <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>EDI 850 + Kalshi</h5>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>3-agent AI debate consensus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section
        id="features"
        className={`py-20 border-t transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
              Comprehensive Platform Capabilities
            </span>
            <h2
              className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Engineered for Modern Web Builders & Agencies
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Combines the simplicity of visual canvas authoring with Google Fonts dynamic typography,
              Bootstrap 5.3 standards, and integrated enterprise tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition group ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200/70 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition border shadow-xs ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-cyan-400'
                      : 'bg-white border-slate-200 text-blue-600'
                  }`}
                >
                  {item.icon}
                </div>
                <h3
                  className={`text-base font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dedicated Section: Connected CloudboyX Enterprise Suite */}
      <section id="modules" className="py-20 bg-slate-950 text-white border-t border-slate-800 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-25">
          <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unified Enterprise Ecosystem</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              4 Connected CloudboyX Custom Modules
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every website created in CloudboyX Design can link directly to our battle-tested operational modules.
              Audit ledgers, protect retailer pricing, dispatch EDI packets, and predict event contract outcomes.
            </p>
          </div>

          {/* Module Selector Navigation */}
          <div className="flex justify-center">
            <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveModuleTab('erp')}
                className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                  activeModuleTab === 'erp'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>1. AI ERP Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('map')}
                className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                  activeModuleTab === 'map'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. MAP Protection</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('connect')}
                className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                  activeModuleTab === 'connect'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>3. CloudboyX Connect</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleTab('predict')}
                className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
                  activeModuleTab === 'predict'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>4. CloudboyX Predict</span>
              </button>
            </div>
          </div>

          {/* Active Module Detail Card */}
          {modules
            .filter((m) => m.id === activeModuleTab)
            .map((mod) => (
              <div
                key={mod.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl transition"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                        {mod.icon}
                      </div>
                      <div>
                        <h3
                          className="text-2xl font-bold text-white tracking-tight"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-400">{mod.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{mod.badge}</span>
                    </span>

                    <a
                      href={mod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                    >
                      <span>Open External Module</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                  {/* Left Column: Description & Highlights */}
                  <div className="lg:col-span-2 space-y-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {mod.description}
                    </p>

                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Core Architecture Features
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mod.highlights.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300"
                          >
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Telemetry Metrics */}
                  <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Live Telemetry
                    </span>
                    <div className="space-y-2.5">
                      {mod.metrics.map((met, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <span className="text-xs text-slate-400">{met.label}</span>
                          <span className="text-xs font-mono font-bold text-cyan-300">{met.val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleOpenModules}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition text-center"
                      >
                        Launch In-App Module Modal
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Brand Identity Showcase: The Visionary Architect */}
      <section
        id="branding"
        className={`py-20 border-t transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Brand Philosophy
              </span>
              <h2
                className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                The Visionary Architect
              </h2>
              <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                CloudboyX identity represents clarity without compromise. Crafted using pure mathematical
                ratios, Space Grotesk display typography paired with Plus Jakarta Sans body, and Obsidian Jet
                contrast framing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem('admin_setting_theme_brand', 'visionary_architect');
                onEnterBuilder();
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 self-start md:self-auto shadow-md ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-950 hover:bg-slate-800 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apply Brand Preset to Builder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Display Typography */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Display Typography
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDark ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Heading 1-6
                </span>
              </div>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Space Grotesk
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Monospace-derived proportions with proportional curves, bringing mathematical structure,
                clarity, and modern authority to high-impact headlines.
              </p>
            </div>

            {/* Body Typography */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Body Typography
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDark ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Paragraph & UI
                </span>
              </div>
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Plus Jakarta Sans
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Refined geometric sans-serif tuned specifically for high-density interfaces, dashboard metrics,
                and extended readability across retina displays.
              </p>
            </div>

            {/* Signature Palette */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Color Tokens
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDark ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Neutral Contrast
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="text-center space-y-1">
                  <div className="h-10 rounded-lg bg-[#0b0f19] border border-slate-700 shadow-xs" />
                  <span className={`text-[10px] font-mono block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Obsidian</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="h-10 rounded-lg bg-blue-600 shadow-xs" />
                  <span className={`text-[10px] font-mono block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Cobalt</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="h-10 rounded-lg bg-cyan-500 shadow-xs" />
                  <span className={`text-[10px] font-mono block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Electric</span>
                </div>
                <div className="text-center space-y-1">
                  <div className={`h-10 rounded-lg shadow-xs border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                  }`} />
                  <span className={`text-[10px] font-mono block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Snow</span>
                </div>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Optically balanced contrast levels strictly adhering to WCAG AAA standards for maximum legibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agency White-Label & Client Billing Showcase */}
      <section
        className={`py-20 border-t transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-slate-100/60 text-slate-900 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Client & Invoicing Operations
            </span>
            <h2
              className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Built For Digital Agencies & Studios
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Transform your Bootstrap website projects into a recurring agency revenue engine.
              White-label the client portal, manage roles, and issue recurring invoices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>
                <Globe className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Full White-Label Branding
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Replace CloudboyX branding with your agency's logo, customized hex primary accents, and
                personalized client portal domain greetings.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-indigo-950/60 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}>
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Recurring Client Invoicing
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Generate itemized invoices for design sprints and retainers with automated Monthly,
                Quarterly, and Annual billing cycles and direct payment links.
              </p>
            </div>

            {/* Card 3 */}
            <div className={`p-6 rounded-2xl border space-y-4 transition ${
              isDark ? 'bg-slate-900 border-slate-800 shadow-sm' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isDark ? 'bg-purple-950/60 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Granular Role Permissions
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Configure role access levels across Owner, Agency Admin, Editor, and Client Reviewer to
                safeguard templates while giving clients visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Showcase Section */}
      <section
        id="templates"
        className={`py-20 border-t transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-white text-slate-900 border-slate-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Production Starters
              </span>
              <h2
                className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Curated High-Performance Templates
              </h2>
              <p className={`text-sm max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Select from production-ready starter templates designed for enterprise platforms,
                SaaS launches, agency portfolios, and mobile products.
              </p>
            </div>

            <button
              type="button"
              onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 self-start md:self-auto ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>Explore All in Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templatesPreview.map((tmpl, idx) => (
              <div
                key={idx}
                className={`rounded-2xl overflow-hidden border shadow-xs hover:shadow-lg transition flex flex-col ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                {/* Visual Banner */}
                <div
                  className={`h-36 bg-gradient-to-br ${tmpl.color} p-4 flex flex-col justify-between text-white`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                      {tmpl.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-900">
                      {tmpl.badge}
                    </span>
                  </div>
                  <h4 className="text-base font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {tmpl.title}
                  </h4>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {tmpl.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
                    className={`w-full py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 ${
                      isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                        : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700'
                    }`}
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section
        id="faq"
        className={`py-20 border-t transition-colors duration-200 ${
          isDark
            ? 'bg-slate-950 text-white border-slate-800'
            : 'bg-slate-50 text-slate-900 border-slate-200/80'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
              Knowledge Base
            </span>
            <h2
              className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden shadow-xs transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-white border-slate-200/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className={`w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm transition ${
                      isDark
                        ? 'text-white hover:bg-slate-800/60'
                        : 'text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? (isDark ? 'rotate-180 text-cyan-400' : 'rotate-180 text-blue-600') : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className={`px-5 pb-4 pt-1 text-xs leading-relaxed border-t transition-colors ${
                        isDark
                          ? 'text-slate-400 border-slate-800 bg-slate-950/60'
                          : 'text-slate-600 border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Hero */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Ready to Build With The Visionary Architect?
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Create an account or sign in to start composing responsive Bootstrap 5 websites with live
            Google Fonts pairing, agency client invoicing, and connected enterprise modules.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="bottom-signup-cta"
              onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signup'))}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{isAuthenticated ? 'Enter Workspace' : 'Sign Up Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => (isAuthenticated ? onEnterBuilder() : openAuth('signin'))}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-sm font-semibold transition"
            >
              {isAuthenticated ? 'Resume Project' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white">CloudboyX Design</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">The Visionary Architect Edition</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Bootstrap 5.3 Visual Builder • Google Fonts Integration • Agency Client Portal
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
            <a
              href="https://cloudboyx-erp.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition"
            >
              AI ERP Gateway
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://map-protection-scanner.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-rose-400 transition"
            >
              MAP Protection
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://cloudboyx.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition"
            >
              Connect & Predict
            </a>
            <span className="text-slate-700">•</span>
            <button
              type="button"
              onClick={() => (isAdmin && onOpenAdmin ? onOpenAdmin() : openAuth('admin'))}
              className="hover:text-violet-400 font-medium transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-violet-400" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* CloudboyX Connected Custom Modules Modal */}
      <CloudboyXModulesModal
        isOpen={isModulesModalOpen}
        onClose={() => setIsModulesModalOpen(false)}
        onApplyTheme={() => {
          localStorage.setItem('admin_setting_theme_brand', 'visionary_architect');
          onEnterBuilder();
        }}
      />
    </div>
  );
};
