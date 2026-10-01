import { ClientSupportTicket, ClientInvoice, ClientTrafficMetrics, RecurringInvoiceConfig, ProjectMilestone, ExportedProjectFile } from '../types';

export const INITIAL_CLIENT_TICKETS: ClientSupportTicket[] = [
  {
    id: 'ticket-101',
    title: 'Update Autumn Promotion Banner & Pricing Grid',
    description: 'We are launching our Q4 product tiers on October 1st. Please update the hero subtitle and the 3rd pricing card to reflect the new Annual Pro pricing at $79/mo.',
    category: 'Design Revision',
    priority: 'High',
    status: 'In Progress',
    clientId: 'client-user-1',
    clientEmail: 'sarah.miller@lumina.io',
    clientName: 'Sarah Miller (Lumina Health)',
    createdAt: '2026-09-12T14:32:00Z',
    updatedAt: '2026-09-14T09:15:00Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'client',
        senderName: 'Sarah Miller',
        text: 'Hi Agency Team! We need to push the Q4 promotion live before next Monday. Subtitle copy: "Transform your daily workflow with verified clinical intelligence."',
        timestamp: 'Sep 12, 2:32 PM',
      },
      {
        id: 'msg-2',
        sender: 'agency',
        senderName: 'David (Agency Lead)',
        text: 'Received Sarah! Our design team has already drafted the new pricing card and staging block. We will deploy to preview in a few hours.',
        timestamp: 'Sep 12, 3:45 PM',
      },
      {
        id: 'msg-3',
        sender: 'agency',
        senderName: 'David (Agency Lead)',
        text: 'The preview is ready for your review! Check your dashboard preview link and approve whenever ready.',
        timestamp: 'Sep 14, 9:15 AM',
      },
    ],
  },
  {
    id: 'ticket-102',
    title: 'Custom Google Analytics 4 Measurement ID Integration',
    description: 'We need to swap our tracking ID to G-8829471929 and verify outbound conversion events on the "Book Consultation" button.',
    category: 'Feature Request',
    priority: 'Medium',
    status: 'Open',
    clientId: 'client-user-2',
    clientEmail: 'alex.thorne@apexfin.com',
    clientName: 'Alex Thorne (Apex Finance)',
    createdAt: '2026-09-13T18:10:00Z',
    updatedAt: '2026-09-13T18:10:00Z',
    messages: [
      {
        id: 'msg-4',
        sender: 'client',
        senderName: 'Alex Thorne',
        text: 'Please connect our primary GA4 stream ID so our marketing team can measure conversion funnels accurately.',
        timestamp: 'Sep 13, 6:10 PM',
      },
    ],
  },
  {
    id: 'ticket-103',
    title: 'Mobile Hamburger Menu Alignment on iOS Safari',
    description: 'On iPhone 15 Pro, the navigation dropdown overlay had a 4px gap at the top bar before closing.',
    category: 'Bug Fix',
    priority: 'Urgent',
    status: 'Resolved',
    clientId: 'client-user-1',
    clientEmail: 'sarah.miller@lumina.io',
    clientName: 'Sarah Miller (Lumina Health)',
    createdAt: '2026-09-08T11:20:00Z',
    updatedAt: '2026-09-09T16:00:00Z',
    messages: [
      {
        id: 'msg-5',
        sender: 'client',
        senderName: 'Sarah Miller',
        text: 'Noticed a slight visual artifact when tapping the menu icon on iOS Safari.',
        timestamp: 'Sep 08, 11:20 AM',
      },
      {
        id: 'msg-6',
        sender: 'agency',
        senderName: 'Agency Engineering',
        text: 'Fixed! We updated the Bootstrap navbar z-index and safe-area-inset padding. Verified on iOS 18 Safari.',
        timestamp: 'Sep 09, 4:00 PM',
      },
    ],
  },
];

export const INITIAL_CLIENT_INVOICES: ClientInvoice[] = [
  {
    id: 'inv-2026-001',
    invoiceNumber: 'INV-2026-001',
    clientId: 'client-user-1',
    clientName: 'Sarah Miller (Lumina Health)',
    clientEmail: 'sarah.miller@lumina.io',
    type: 'recurring_subscription',
    planOrItemName: 'Managed Cloud Hosting & Monthly Maintenance',
    amount: 149.0,
    currency: 'USD',
    status: 'paid',
    dueDate: '2026-09-01',
    paidAt: '2026-09-01',
    billingCycle: 'Monthly',
    lineItems: [
      { description: 'High-Availability Cloud Hosting (99.99% Uptime SLA)', quantity: 1, unitPrice: 89.0 },
      { description: 'Automated Daily Backups & SSL Security Renewal', quantity: 1, unitPrice: 30.0 },
      { description: 'Monthly Content Updates (2 Hours Included)', quantity: 1, unitPrice: 30.0 },
    ],
  },
  {
    id: 'inv-2026-002',
    invoiceNumber: 'INV-2026-002',
    clientId: 'client-user-1',
    clientName: 'Sarah Miller (Lumina Health)',
    clientEmail: 'sarah.miller@lumina.io',
    type: 'recurring_subscription',
    planOrItemName: 'Managed Cloud Hosting & Monthly Maintenance',
    amount: 149.0,
    currency: 'USD',
    status: 'active',
    dueDate: '2026-10-01',
    billingCycle: 'Monthly',
    lineItems: [
      { description: 'High-Availability Cloud Hosting (99.99% Uptime SLA)', quantity: 1, unitPrice: 89.0 },
      { description: 'Automated Daily Backups & SSL Security Renewal', quantity: 1, unitPrice: 30.0 },
      { description: 'Monthly Content Updates (2 Hours Included)', quantity: 1, unitPrice: 30.0 },
    ],
  },
  {
    id: 'inv-2026-003',
    invoiceNumber: 'INV-2026-003',
    clientId: 'client-user-1',
    clientName: 'Sarah Miller (Lumina Health)',
    clientEmail: 'sarah.miller@lumina.io',
    type: 'one_time',
    planOrItemName: 'Custom Landing Page Block & Conversion Optimization',
    amount: 750.0,
    currency: 'USD',
    status: 'paid',
    dueDate: '2026-08-25',
    paidAt: '2026-08-24',
    billingCycle: 'One-off',
    lineItems: [
      { description: 'Design & Build 4 Custom Bootstrap 5 Visual Blocks', quantity: 1, unitPrice: 500.0 },
      { description: 'Mobile Speed & Core Web Vitals Optimization', quantity: 1, unitPrice: 250.0 },
    ],
  },
  {
    id: 'inv-2026-004',
    invoiceNumber: 'INV-2026-004',
    clientId: 'client-user-2',
    clientName: 'Alex Thorne (Apex Finance)',
    clientEmail: 'alex.thorne@apexfin.com',
    type: 'one_time',
    planOrItemName: 'Website Launch & Full Production Deployment',
    amount: 1200.0,
    currency: 'USD',
    status: 'pending',
    dueDate: '2026-09-30',
    billingCycle: 'One-off',
    lineItems: [
      { description: 'Complete Responsive Corporate Website Build (8 Blocks)', quantity: 1, unitPrice: 950.0 },
      { description: 'DNS Configuration & Custom Domain Setup', quantity: 1, unitPrice: 250.0 },
    ],
  },
  {
    id: 'inv-2026-005',
    invoiceNumber: 'INV-2026-005',
    clientId: 'client-user-3',
    clientName: 'Elena Rostova (Nexus AI)',
    clientEmail: 'elena@nexusai.tech',
    type: 'recurring_subscription',
    planOrItemName: 'Enterprise Growth & Dedicated Dev Retainer',
    amount: 850.0,
    currency: 'USD',
    status: 'paid',
    dueDate: '2026-09-10',
    paidAt: '2026-09-09',
    billingCycle: 'Monthly',
    recurringConfigId: 'rec-002',
    paymentMethod: 'Mastercard •••• 8841',
    lineItems: [
      { description: 'Enterprise High-Performance CDN & Hosting Tier', quantity: 1, unitPrice: 350.0 },
      { description: 'Dedicated Bi-Weekly Block Iteration & SEO Updates (5 hrs)', quantity: 1, unitPrice: 500.0 },
    ],
  },
  {
    id: 'inv-2026-006',
    invoiceNumber: 'INV-2026-006',
    clientId: 'client-user-4',
    clientName: 'Jordan Reed (Veritas Law)',
    clientEmail: 'j.reed@veritaslaw.com',
    type: 'recurring_subscription',
    planOrItemName: 'Quarterly Maintenance & Security Audit',
    amount: 450.0,
    currency: 'USD',
    status: 'overdue',
    dueDate: '2026-09-05',
    billingCycle: 'Quarterly',
    recurringConfigId: 'rec-003',
    paymentMethod: 'Visa •••• 3192',
    lineItems: [
      { description: 'Quarterly Security Hardening, SSL Review & Dependency Patching', quantity: 1, unitPrice: 450.0 },
    ],
  },
  {
    id: 'inv-2026-007',
    invoiceNumber: 'INV-2026-007',
    clientId: 'client-user-5',
    clientName: 'Chloe Bennett (Aurora Studio)',
    clientEmail: 'chloe@aurorastudio.design',
    type: 'recurring_subscription',
    planOrItemName: 'Annual Pro Hosting & Dedicated Support',
    amount: 1490.0,
    currency: 'USD',
    status: 'active',
    dueDate: '2026-11-15',
    billingCycle: 'Yearly',
    recurringConfigId: 'rec-004',
    paymentMethod: 'Amex •••• 1004',
    lineItems: [
      { description: 'Annual Managed Cloud Infrastructure (12 Months)', quantity: 1, unitPrice: 1200.0 },
      { description: 'Annual Staging Environment & Instant Rollback System', quantity: 1, unitPrice: 290.0 },
    ],
  },
];

export const INITIAL_RECURRING_CONFIGS: RecurringInvoiceConfig[] = [
  {
    id: 'rec-001',
    clientId: 'client-user-1',
    clientName: 'Sarah Miller (Lumina Health)',
    clientEmail: 'sarah.miller@lumina.io',
    organization: 'Lumina Health Clinic',
    planName: 'Managed Cloud Hosting & Monthly Maintenance',
    billingCycle: 'Monthly',
    amount: 149.0,
    currency: 'USD',
    status: 'active',
    nextBillingDate: '2026-10-01',
    lastBilledDate: '2026-09-01',
    autoCharge: true,
    paymentMethod: {
      brand: 'visa',
      last4: '4242',
      expiry: '08/28',
    },
    lineItems: [
      { description: 'High-Availability Cloud Hosting (99.99% Uptime SLA)', quantity: 1, unitPrice: 89.0 },
      { description: 'Automated Daily Backups & SSL Security Renewal', quantity: 1, unitPrice: 30.0 },
      { description: 'Monthly Content Updates (2 Hours Included)', quantity: 1, unitPrice: 30.0 },
    ],
    notes: 'Auto-charged on 1st of every month. Client notified via automated receipts.',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'rec-002',
    clientId: 'client-user-3',
    clientName: 'Elena Rostova (Nexus AI)',
    clientEmail: 'elena@nexusai.tech',
    organization: 'Nexus AI Labs',
    planName: 'Enterprise Growth & Dedicated Dev Retainer',
    billingCycle: 'Monthly',
    amount: 850.0,
    currency: 'USD',
    status: 'active',
    nextBillingDate: '2026-10-10',
    lastBilledDate: '2026-09-09',
    autoCharge: true,
    paymentMethod: {
      brand: 'mastercard',
      last4: '8841',
      expiry: '11/27',
    },
    lineItems: [
      { description: 'Enterprise High-Performance CDN & Hosting Tier', quantity: 1, unitPrice: 350.0 },
      { description: 'Dedicated Bi-Weekly Block Iteration & SEO Updates (5 hrs)', quantity: 1, unitPrice: 500.0 },
    ],
    notes: 'Premium SLA client. Priority Slack channel integration active.',
    createdAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'rec-003',
    clientId: 'client-user-4',
    clientName: 'Jordan Reed (Veritas Law)',
    clientEmail: 'j.reed@veritaslaw.com',
    organization: 'Veritas Legal Partners',
    planName: 'Quarterly Maintenance & Security Audit',
    billingCycle: 'Quarterly',
    amount: 450.0,
    currency: 'USD',
    status: 'active',
    nextBillingDate: '2026-12-05',
    lastBilledDate: '2026-06-05',
    autoCharge: false,
    paymentMethod: {
      brand: 'visa',
      last4: '3192',
      expiry: '04/27',
    },
    lineItems: [
      { description: 'Quarterly Security Hardening, SSL Review & Dependency Patching', quantity: 1, unitPrice: 450.0 },
    ],
    notes: 'Invoice sent to billing department; net-30 terms.',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'rec-004',
    clientId: 'client-user-5',
    clientName: 'Chloe Bennett (Aurora Studio)',
    clientEmail: 'chloe@aurorastudio.design',
    organization: 'Aurora Design Co',
    planName: 'Annual Pro Hosting & Dedicated Support',
    billingCycle: 'Yearly',
    amount: 1490.0,
    currency: 'USD',
    status: 'active',
    nextBillingDate: '2026-11-15',
    lastBilledDate: '2025-11-15',
    autoCharge: true,
    paymentMethod: {
      brand: 'amex',
      last4: '1004',
      expiry: '09/29',
    },
    lineItems: [
      { description: 'Annual Managed Cloud Infrastructure (12 Months)', quantity: 1, unitPrice: 1200.0 },
      { description: 'Annual Staging Environment & Instant Rollback System', quantity: 1, unitPrice: 290.0 },
    ],
    notes: 'Renews annually in November. Early renewal discount applied.',
    createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'rec-005',
    clientId: 'client-user-2',
    clientName: 'Alex Thorne (Apex Finance)',
    clientEmail: 'alex.thorne@apexfin.com',
    organization: 'Apex Finance Corp',
    planName: 'Standard Starter Hosting & Maintenance',
    billingCycle: 'Monthly',
    amount: 99.0,
    currency: 'USD',
    status: 'paused',
    nextBillingDate: '2026-10-15',
    lastBilledDate: '2026-08-15',
    autoCharge: true,
    paymentMethod: {
      brand: 'visa',
      last4: '9901',
      expiry: '03/28',
    },
    lineItems: [
      { description: 'Bootstrap Staging & Production Hosting Tier', quantity: 1, unitPrice: 99.0 },
    ],
    notes: 'Client requested temporary pause during corporate rebranding.',
    createdAt: '2026-05-15T00:00:00Z',
  },
];

export const CLIENT_TRAFFIC_METRICS: ClientTrafficMetrics = {
  totalPageviews: 18450,
  uniqueVisitors: 6920,
  avgSessionDuration: '3m 12s',
  bounceRatePercent: 31.4,
  mobileTrafficPercent: 62.5,
  topDevices: [
    { name: 'Mobile (Smartphones)', percent: 62 },
    { name: 'Desktop & Laptops', percent: 32 },
    { name: 'Tablets & iPads', percent: 6 },
  ],
  trafficSources: [
    { source: 'Google Search (Organic)', percent: 46 },
    { source: 'Direct URL & QR Code', percent: 24 },
    { source: 'LinkedIn & Social Ads', percent: 18 },
    { source: 'Referral & Partner Sites', percent: 12 },
  ],
  recentVisitsTrend: [
    { date: 'Sep 09', views: 2410 },
    { date: 'Sep 10', views: 2680 },
    { date: 'Sep 11', views: 2540 },
    { date: 'Sep 12', views: 2890 },
    { date: 'Sep 13', views: 2320 },
    { date: 'Sep 14', views: 2790 },
    { date: 'Sep 15', views: 2820 },
  ],
};

export const INITIAL_PROJECT_MILESTONES: ProjectMilestone[] = [
  {
    id: 'mls-01',
    title: 'Brand Discovery & Information Architecture',
    description: 'Establish core visual hierarchy, page wireframes, target conversion paths, and multi-device viewport constraints.',
    phase: 1,
    status: 'completed',
    progressPercent: 100,
    dueDate: '2026-08-28',
    completedDate: '2026-08-27',
    assignedLead: {
      name: 'Marcus Vance',
      role: 'Lead UI/UX Architect',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    },
    clientApproved: true,
    approvedAt: '2026-08-28',
    approvedBy: 'Sarah Miller',
    deliverables: [
      { id: 'del-101', title: 'Content Outline & Site Map Taxonomy', completed: true },
      { id: 'del-102', title: 'High-Fidelity Wireframes for Mobile & Desktop', completed: true },
      { id: 'del-103', title: 'Interactive Prototype Review Session', completed: true },
    ],
  },
  {
    id: 'mls-02',
    title: 'Design System & Bootstrap 5 Component Staging',
    description: 'Translate client brand palette, typography scales, responsive hero layouts, feature grids, and CTA banners into live Bootstrap 5 blocks.',
    phase: 2,
    status: 'completed',
    progressPercent: 100,
    dueDate: '2026-09-06',
    completedDate: '2026-09-05',
    assignedLead: {
      name: 'Elena Rostova',
      role: 'Senior Frontend Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
    },
    clientApproved: true,
    approvedAt: '2026-09-06',
    approvedBy: 'Sarah Miller',
    deliverables: [
      { id: 'del-201', title: 'Custom Bootstrap 5 CSS Theme & Color Variables', completed: true },
      { id: 'del-202', title: 'Mobile-Optimized Navbar & Offcanvas Navigation', completed: true },
      { id: 'del-203', title: 'Interactive Pricing Tier Comparison Block', completed: true },
      { id: 'del-204', title: 'Cross-Device Responsiveness Audit (iPhone, iPad, MacBook)', completed: true },
    ],
  },
  {
    id: 'mls-03',
    title: 'Content Ingestion & Lead Capture Integrations',
    description: 'Ingest finalized marketing copy, optimize high-resolution imagery with WebP format, configure contact forms, and link analytics tags.',
    phase: 3,
    status: 'in_progress',
    progressPercent: 85,
    dueDate: '2026-09-18',
    assignedLead: {
      name: 'David Chen',
      role: 'Creative Director & Project Manager',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    deliverables: [
      { id: 'del-301', title: 'Copywriting Ingestion Across All 6 Page Blocks', completed: true },
      { id: 'del-302', title: 'WebP Asset Compression & Retina Scaling', completed: true },
      { id: 'del-303', title: 'Client Contact Form Webhook & Email Notification Relay', completed: true },
      { id: 'del-304', title: 'Privacy Policy & Cookie Consent Modal', completed: false },
    ],
  },
  {
    id: 'mls-04',
    title: 'Client Review, Staging Walkthrough & Revision Cycle',
    description: 'Dedicated client walkthrough on private staging domain. Client review of live mobile QR code, feedback submission, and revision signoff.',
    phase: 4,
    status: 'in_review',
    progressPercent: 60,
    dueDate: '2026-09-24',
    assignedLead: {
      name: 'David Chen',
      role: 'Creative Director & Project Manager',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    },
    deliverables: [
      { id: 'del-401', title: 'Private Staging Preview Deployment', completed: true },
      { id: 'del-402', title: 'Client Revision Desk Round 1 Adjustments', completed: true },
      { id: 'del-403', title: 'Typography & Mobile Spacing Refinements', completed: false },
      { id: 'del-404', title: 'Formal Milestone Signoff by Client Stakeholder', completed: false },
    ],
  },
  {
    id: 'mls-05',
    title: 'Production Domain Cutover, CDN Edge & SEO Launch',
    description: 'Custom domain DNS routing, automated SSL certificate generation, CDN edge caching warmup, and search engine sitemap submission.',
    phase: 5,
    status: 'upcoming',
    progressPercent: 10,
    dueDate: '2026-09-30',
    assignedLead: {
      name: 'Marcus Vance',
      role: 'DevOps & Infrastructure Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    },
    deliverables: [
      { id: 'del-501', title: 'Cloudflare CDN DNS Configuration & Edge Rules', completed: false },
      { id: 'del-502', title: 'Zero-Downtime Live Domain Cutover', completed: false },
      { id: 'del-503', title: 'Google Search Console Sitemap Submission', completed: false },
      { id: 'del-504', title: 'Lighthouse 95+ Performance & Accessibility Verification', completed: false },
    ],
  },
];

export const INITIAL_EXPORTED_FILES: ExportedProjectFile[] = [
  {
    id: 'exp-01',
    fileName: 'index.html',
    fileType: 'html',
    fileSize: '42.8 KB',
    version: 'v2.4.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Production-ready semantic HTML5 with Bootstrap 5.3 responsive container architecture, navigation, and all staged content blocks.',
    category: 'Markup',
    codeContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Production Site - Crafted by CloudboyX Studio</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Custom Agency Theme Stylesheet -->
  <link href="custom-theme.css" rel="stylesheet">
</head>
<body>
  <!-- Navigation Header -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3">
    <div class="container">
      <a class="navbar-brand fw-bold" href="#">CloudboyX Business</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0 gap-3">
          <li class="nav-item"><a class="nav-link active" href="#hero">Overview</a></li>
          <li class="nav-item"><a class="nav-link" href="#features">Services</a></li>
          <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
          <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Hero Section -->
  <section id="hero" class="py-5 bg-primary text-white text-center">
    <div class="container py-5">
      <h1 class="display-4 fw-bold mb-3">Next-Gen Digital Solutions</h1>
      <p class="lead mb-4 mx-auto" style="max-width: 650px;">
        Empowering brands with lightning-fast, high-converting digital web experiences designed for maximum engagement.
      </p>
      <a href="#contact" class="btn btn-light btn-lg px-4 fw-semibold">Schedule Consultation</a>
    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="py-5 bg-light">
    <div class="container py-4">
      <div class="row g-4 text-center">
        <div class="col-md-4">
          <div class="p-4 bg-white rounded-3 shadow-sm h-100">
            <h4 class="fw-bold mb-2">Ultra Responsive</h4>
            <p class="text-muted">Engineered to look impeccable on mobile phones, tablets, and wide retina displays.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 bg-white rounded-3 shadow-sm h-100">
            <h4 class="fw-bold mb-2">SEO Optimized</h4>
            <p class="text-muted">Built-in OpenGraph metadata, structured JSON-LD schemas, and fast Core Web Vitals.</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="p-4 bg-white rounded-3 shadow-sm h-100">
            <h4 class="fw-bold mb-2">Edge Cloud Hosting</h4>
            <p class="text-muted">Delivered via worldwide CDN edge nodes for instantaneous sub-100ms loading speeds.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Bootstrap 5 JavaScript Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`,
  },
  {
    id: 'exp-02',
    fileName: 'custom-theme.css',
    fileType: 'css',
    fileSize: '16.4 KB',
    version: 'v2.4.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Compiled Bootstrap 5 utility overrides, agency brand CSS variables, custom typography rules, and responsive grid helpers.',
    category: 'Stylesheets',
    codeContent: `/* Custom Agency Theme Stylesheet
 * Brand: CloudboyX Design Studio
 * Compiled: 2026-09-15
 */

:root {
  --bs-primary: #4f46e5;
  --bs-primary-rgb: 79, 70, 229;
  --bs-primary-hover: #4338ca;
  --bs-secondary: #0ea5e9;
  --bs-body-font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --bs-border-radius: 0.75rem;
  --bs-box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
}

body {
  font-family: var(--bs-body-font-family);
  color: #1e293b;
  background-color: #f8fafc;
  line-height: 1.6;
}

.btn-primary {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
}

.btn-primary:hover {
  background-color: var(--bs-primary-hover);
  border-color: var(--bs-primary-hover);
  transform: translateY(-1px);
}

.card {
  border: 1px solid #e2e8f0;
  border-radius: var(--bs-border-radius);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--bs-box-shadow);
}
`,
  },
  {
    id: 'exp-03',
    fileName: 'bootstrap-scripts.js',
    fileType: 'js',
    fileSize: '8.2 KB',
    version: 'v2.4.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Client-side initialization scripts, smooth scroll handlers, contact form validation, and mobile offcanvas navigation logic.',
    category: 'Assets',
    codeContent: `/**
 * Client Portal Site Automation Script
 * Version: 2.4.0
 */

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Client form validation
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      if (!contactForm.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      contactForm.classList.add('was-validated');
    });
  }

  console.info('CloudboyX Client Site initialized successfully.');
});
`,
  },
  {
    id: 'exp-04',
    fileName: 'sitemap.xml',
    fileType: 'xml',
    fileSize: '3.1 KB',
    version: 'v1.0.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Search engine sitemap manifest containing verified canonical URLs, change frequencies, and priority tags for Google and Bing.',
    category: 'SEO & Config',
    codeContent: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://clientportal.cloudboyx.io/</loc>
    <lastmod>2026-09-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://clientportal.cloudboyx.io/#services</loc>
    <lastmod>2026-09-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://clientportal.cloudboyx.io/#pricing</loc>
    <lastmod>2026-09-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://clientportal.cloudboyx.io/#contact</loc>
    <lastmod>2026-09-15</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`,
  },
  {
    id: 'exp-05',
    fileName: 'design-tokens.json',
    fileType: 'json',
    fileSize: '4.5 KB',
    version: 'v2.4.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Design system tokens including color palettes (HEX, RGB), typography scales, spacing tokens, and border radii for developer handoff.',
    category: 'SEO & Config',
    codeContent: JSON.stringify(
      {
        brand: 'CloudboyX Design Client Portal',
        version: '2.4.0',
        colors: {
          primary: '#4f46e5',
          primaryDark: '#4338ca',
          secondary: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          neutralDark: '#0f172a',
          neutralLight: '#f8fafc',
        },
        typography: {
          fontFamilyDisplay: 'Plus Jakarta Sans, sans-serif',
          fontFamilyBody: 'Plus Jakarta Sans, sans-serif',
          scale: 'Major Second (1.125)',
          baseFontSize: '16px',
        },
        spacing: {
          containerMaxWidth: '1280px',
          sectionPaddingY: '5rem',
          gridGutter: '1.5rem',
        },
      },
      null,
      2
    ),
  },
  {
    id: 'exp-06',
    fileName: 'standalone-package.html',
    fileType: 'html',
    fileSize: '58.2 KB',
    version: 'v2.4.0',
    updatedAt: '2026-09-15 09:30 AM',
    description: 'Self-contained all-in-one HTML package with embedded CSS and JavaScript. Can be double-clicked to run directly on any computer offline.',
    category: 'Full Archive',
    codeContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Standalone Production Website - CloudboyX Studio</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    :root { --bs-primary: #4f46e5; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
    .hero-banner { background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; padding: 5rem 0; }
  </style>
</head>
<body>
  <div class="hero-banner text-center">
    <div class="container">
      <h1 class="display-4 fw-bold">Standalone Web Client Package</h1>
      <p class="lead">Fully offline-compatible distribution for client delivery.</p>
    </div>
  </div>
</body>
</html>`,
  },
];
