import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Palette,
  FileText,
  LifeBuoy,
  Video,
  Layout,
  Lock,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Sliders,
  Globe,
  Eye,
  LogOut,
  Layers,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GranularRole, ClientSupportTicket, ClientInvoice, RecurringInvoiceConfig } from '../types';
import { ClientDashboardTab } from './portal/ClientDashboardTab';
import { WhiteLabelBrandingTab } from './portal/WhiteLabelBrandingTab';
import { GranularUsersTab, PortalUserItem } from './portal/GranularUsersTab';
import { SupportTicketsTab } from './portal/SupportTicketsTab';
import { VideoTutorialsTab } from './portal/VideoTutorialsTab';
import { BillingInvoicesTab } from './portal/BillingInvoicesTab';
import { InvoicingPaymentsTab } from './portal/InvoicingPaymentsTab';
import { ErpGatewayModule } from './modules/ErpGatewayModule';
import { MapProtectionModule } from './modules/MapProtectionModule';
import { ConnectModule } from './modules/ConnectModule';
import { PredictModule } from './modules/PredictModule';
import { BrandTimelineModule } from './modules/BrandTimelineModule';
import { INITIAL_CLIENT_TICKETS, INITIAL_CLIENT_INVOICES, INITIAL_RECURRING_CONFIGS } from '../data/agencyClientData';
import { STARTER_TEMPLATES } from '../data/starterTemplates';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export type PortalTab =
  | 'client_dashboard'
  | 'cloudboyx_modules'
  | 'branding'
  | 'users'
  | 'tickets'
  | 'tutorials'
  | 'billing'
  | 'gate'
  | 'templates';

interface AgencyClientPortalProps {
  projectTitle: string;
  blockCount: number;
  initialTab?: PortalTab;
  onBackToBuilder: () => void;
  onBackToLanding: () => void;
}

export const AgencyClientPortal: React.FC<AgencyClientPortalProps> = ({
  projectTitle,
  blockCount,
  initialTab,
  onBackToBuilder,
  onBackToLanding,
}) => {
  const {
    user,
    activeRole,
    simulatedRole,
    setSimulatedRole,
    permissions,
    isAdmin,
    isAgencyTeam,
    agencyBranding,
    logOut,
  } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<PortalTab>(() => {
    if (initialTab) return initialTab;
    // If client, start on client dashboard
    if (activeRole.startsWith('client_')) {
      return 'client_dashboard';
    }
    return 'client_dashboard';
  });

  const [activeModuleTab, setActiveModuleTab] = useState<'erp' | 'map' | 'connect' | 'predict' | 'brand'>('erp');

  // Ticket & Invoice State
  const [tickets, setTickets] = useState<ClientSupportTicket[]>(() => {
    const saved = localStorage.getItem('agency_client_tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CLIENT_TICKETS;
  });

  const [invoices, setInvoices] = useState<ClientInvoice[]>(() => {
    const saved = localStorage.getItem('agency_client_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CLIENT_INVOICES;
  });

  const [recurringConfigs, setRecurringConfigs] = useState<RecurringInvoiceConfig[]>(() => {
    const saved = localStorage.getItem('agency_recurring_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_RECURRING_CONFIGS;
  });

  // Users Directory State
  const [usersList, setUsersList] = useState<PortalUserItem[]>([
    {
      id: 'usr-1',
      email: 'david@cloudboyx.io',
      displayName: 'David (Super Admin)',
      role: 'admin',
      createdAt: 'Sep 15, 2026',
      status: 'active',
      organization: 'CloudboyX Core Agency',
    },
    {
      id: 'usr-2',
      email: 'sarah.miller@lumina.io',
      displayName: 'Sarah Miller',
      role: 'client_editor',
      createdAt: 'Sep 12, 2026',
      status: 'active',
      organization: 'Lumina Health Clinic',
    },
    {
      id: 'usr-3',
      email: 'alex.thorne@apexfin.com',
      displayName: 'Alex Thorne',
      role: 'client_readonly',
      createdAt: 'Sep 10, 2026',
      status: 'active',
      organization: 'Apex Finance Corp',
    },
    {
      id: 'usr-4',
      email: 'marcus.design@agency.io',
      displayName: 'Marcus Vance',
      role: 'agency_team',
      createdAt: 'Sep 08, 2026',
      status: 'active',
      organization: 'Agency Creative Staff',
    },
  ]);

  // Access Gate & Announcement Settings
  const [isGateActive, setIsGateActive] = useState<boolean>(() => {
    return localStorage.getItem('admin_setting_gate_active') !== 'false';
  });
  const [announcementText, setAnnouncementText] = useState<string>(() => {
    return (
      localStorage.getItem('admin_setting_announcement') ||
      'Bootstrap 5.3 Engine Active: All visual blocks verified for production export.'
    );
  });
  const [announcementEnabled, setAnnouncementEnabled] = useState<boolean>(() => {
    return localStorage.getItem('admin_setting_announcement_enabled') === 'true';
  });
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Sync tickets to local storage
  useEffect(() => {
    localStorage.setItem('agency_client_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Sync invoices to local storage
  useEffect(() => {
    localStorage.setItem('agency_client_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Sync recurring configs to local storage
  useEffect(() => {
    localStorage.setItem('agency_recurring_configs', JSON.stringify(recurringConfigs));
  }, [recurringConfigs]);

  // Ticket handlers
  const handleAddTicket = (
    newTicket: Omit<ClientSupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>
  ) => {
    const created: ClientSupportTicket = {
      ...newTicket,
      id: `ticket-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'client',
          senderName: newTicket.clientName,
          text: newTicket.description,
          timestamp: 'Just now',
        },
      ],
    };
    setTickets([created, ...tickets]);

    // Try saving to firestore
    try {
      setDoc(doc(db, 'tickets', created.id), created);
    } catch (e) {
      console.warn('Firestore ticket sync fallback to local', e);
    }
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    status: ClientSupportTicket['status']
  ) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const handleSendTicketMessage = (ticketId: string, text: string) => {
    const isAgency = isAgencyTeam || activeRole === 'admin';
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: (isAgency ? 'agency' : 'client') as 'agency' | 'client',
      senderName: isAgency
        ? `${agencyBranding.agencyName} Team`
        : user?.displayName || 'Client Account',
      text,
      timestamp: 'Just now',
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  // Invoice handlers
  const handleAddInvoice = (newInv: Omit<ClientInvoice, 'id'>) => {
    const created: ClientInvoice = {
      ...newInv,
      id: `inv-${Date.now().toString().slice(-4)}`,
    };
    setInvoices([created, ...invoices]);
  };

  const handlePayInvoice = (invId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? { ...inv, status: 'paid', paidAt: new Date().toISOString().split('T')[0] }
          : inv
      )
    );
  };

  const handleUpdateInvoiceStatus = (
    invId: string,
    status: ClientInvoice['status'],
    paidAt?: string
  ) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invId
          ? {
              ...inv,
              status,
              paidAt: status === 'paid' ? paidAt || new Date().toISOString().split('T')[0] : undefined,
            }
          : inv
      )
    );
  };

  // Recurring Config Handlers
  const handleAddRecurringConfig = (configData: Omit<RecurringInvoiceConfig, 'id' | 'createdAt'>) => {
    const newConfig: RecurringInvoiceConfig = {
      ...configData,
      id: `rec-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setRecurringConfigs((prev) => [newConfig, ...prev]);
    try {
      setDoc(doc(db, 'recurring_configs', newConfig.id), newConfig);
    } catch (e) {
      console.warn('Firestore recurring config sync fallback to local', e);
    }
  };

  const handleUpdateRecurringConfig = (configId: string, updates: Partial<RecurringInvoiceConfig>) => {
    setRecurringConfigs((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, ...updates } : c))
    );
    try {
      setDoc(doc(db, 'recurring_configs', configId), updates, { merge: true });
    } catch (e) {
      console.warn('Firestore recurring config update fallback to local', e);
    }
  };

  const handleTogglePauseRecurringConfig = (configId: string) => {
    setRecurringConfigs((prev) =>
      prev.map((c) =>
        c.id === configId
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
  };

  const handleDeleteRecurringConfig = (configId: string) => {
    setRecurringConfigs((prev) => prev.filter((c) => c.id !== configId));
  };

  const handleGenerateCycleInvoice = (configId: string) => {
    const config = recurringConfigs.find((c) => c.id === configId);
    if (!config) return;

    const nextInvNum = `INV-2026-${Math.floor(200 + Math.random() * 800)}`;
    const newInvoice: ClientInvoice = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      invoiceNumber: nextInvNum,
      clientId: config.clientId,
      clientName: config.clientName,
      clientEmail: config.clientEmail,
      type: 'recurring_subscription',
      planOrItemName: config.planName,
      amount: config.amount,
      currency: config.currency,
      status: config.autoCharge ? 'paid' : 'pending',
      paidAt: config.autoCharge ? new Date().toISOString().split('T')[0] : undefined,
      dueDate: config.nextBillingDate,
      billingCycle: config.billingCycle,
      recurringConfigId: config.id,
      lineItems: config.lineItems,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Advance next billing cycle date
    const currentDate = new Date(config.nextBillingDate);
    if (config.billingCycle === 'Monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (config.billingCycle === 'Quarterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
    } else if (config.billingCycle === 'Yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
    const newNextDate = currentDate.toISOString().split('T')[0];

    handleUpdateRecurringConfig(config.id, {
      lastBilledDate: new Date().toISOString().split('T')[0],
      nextBillingDate: newNextDate,
    });
  };

  // User Role handlers
  const handleUpdateUserRole = async (userId: string, newRole: GranularRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
    } catch (e) {
      console.warn('Could not save user role to firestore:', e);
    }
  };

  const handleAddUser = (userItem: Omit<PortalUserItem, 'id' | 'createdAt' | 'status'>) => {
    const newUser: PortalUserItem = {
      ...userItem,
      id: `usr-${Date.now()}`,
      createdAt: 'Sep 15, 2026',
      status: 'active',
    };
    setUsersList([newUser, ...usersList]);
  };

  const handleToggleGate = (val: boolean) => {
    setIsGateActive(val);
    localStorage.setItem('admin_setting_gate_active', String(val));
    triggerFeedback();
  };

  const handleSaveAnnouncement = () => {
    localStorage.setItem('admin_setting_announcement', announcementText);
    localStorage.setItem('admin_setting_announcement_enabled', String(announcementEnabled));
    triggerFeedback();
  };

  const triggerFeedback = () => {
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const isClientRole = activeRole.startsWith('client_');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800 bg-[#0b0f19] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
        {/* Left: Agency Branding / Monogram */}
        <div className="flex items-center gap-3">
          {agencyBranding.agencyLogoUrl ? (
            <img
              src={agencyBranding.agencyLogoUrl}
              alt={agencyBranding.agencyName}
              className="h-8 max-w-[130px] object-contain"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20"
              style={{ backgroundColor: agencyBranding.primaryBrandColor }}
            >
              {agencyBranding.agencyName.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">
                {agencyBranding.agencyName}
              </span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded border uppercase"
                style={{
                  backgroundColor: `${agencyBranding.primaryBrandColor}22`,
                  color: agencyBranding.primaryBrandColor,
                  borderColor: `${agencyBranding.primaryBrandColor}44`,
                }}
              >
                {isClientRole ? 'Client Portal' : 'Agency Portal'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {agencyBranding.customDomain} • {user?.email || 'david@cloudboyx.io'}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Role Simulator Pill (visible for Admin) */}
          {isAdmin && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 text-xs">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400 font-medium">Viewing as:</span>
              <select
                value={simulatedRole || 'admin'}
                onChange={(e) => {
                  const val = e.target.value;
                  setSimulatedRole(val === 'admin' ? null : (val as GranularRole));
                }}
                className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-0.5 text-xs font-semibold focus:outline-hidden"
              >
                <option value="admin">Agency Admin (Default)</option>
                <option value="agency_team">Agency Team (Staff)</option>
                <option value="client_editor">Client Editor</option>
                <option value="client_readonly">Client Read-Only</option>
              </select>
            </div>
          )}

          {permissions.canEditDesign && (
            <button
              type="button"
              onClick={onBackToBuilder}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Enter Builder</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToLanding}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition hidden sm:inline-flex"
          >
            Marketing Site
          </button>

          <button
            type="button"
            onClick={logOut}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
            {/* Tab 1: Client Dashboard */}
            <button
              type="button"
              onClick={() => setActiveTab('client_dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'client_dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client Dashboard</span>
            </button>

            {/* CloudboyX Custom Modules Ecosystem */}
            <button
              type="button"
              onClick={() => setActiveTab('cloudboyx_modules')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cloudboyx_modules'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Enterprise Suite</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
                4 Modules
              </span>
            </button>

            {/* Tab 2: White-Label Branding (Agency Team/Admin) */}
            {permissions.canManageWhiteLabel && (
              <button
                type="button"
                onClick={() => setActiveTab('branding')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'branding'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>White-Label Branding</span>
              </button>
            )}

            {/* Tab 3: Permissions & Users (Agency Team/Admin) */}
            {permissions.canManageTeam && (
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Granular Permissions</span>
              </button>
            )}

            {/* Tab 4: Support Desk & Tickets */}
            <button
              type="button"
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>Revisions & Tickets</span>
            </button>

            {/* Tab 5: Video Tutorials */}
            <button
              type="button"
              onClick={() => setActiveTab('tutorials')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'tutorials'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-indigo-400" />
              <span>Video Guides</span>
            </button>

            {/* Tab 6: Invoicing & Payments */}
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'billing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Invoicing & Payments</span>
            </button>

            {/* Tab 7: System Gates & Settings (Agency Team/Admin) */}
            {permissions.canManageTeam && (
              <button
                type="button"
                onClick={() => setActiveTab('gate')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'gate'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>System Gate</span>
              </button>
            )}

            {/* Tab 8: Engine Presets (Agency Team/Admin) */}
            {permissions.canManageTeam && (
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'templates'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layout className="w-3.5 h-3.5 text-slate-400" />
                <span>Engine Presets</span>
              </button>
            )}
          </div>

          {saveFeedback && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Settings saved</span>
            </div>
          )}
        </div>

        {/* Tab: CloudboyX Custom Modules Ecosystem */}
        {activeTab === 'cloudboyx_modules' && (
          <div className="space-y-6">
            {/* Sub-navigation for Modules */}
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveModuleTab('erp')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeModuleTab === 'erp'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. AI ERP Gateway
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleTab('map')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeModuleTab === 'map'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Map Protection
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleTab('connect')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeModuleTab === 'connect'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. CloudboyX Connect
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleTab('predict')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeModuleTab === 'predict'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                4. CloudboyX Predict
              </button>
              <button
                type="button"
                onClick={() => setActiveModuleTab('brand')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeModuleTab === 'brand'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Brand Evolution Timeline
              </button>
            </div>

            {/* Sub-module View Container */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
              {activeModuleTab === 'erp' && <ErpGatewayModule />}
              {activeModuleTab === 'map' && <MapProtectionModule />}
              {activeModuleTab === 'connect' && <ConnectModule />}
              {activeModuleTab === 'predict' && <PredictModule />}
              {activeModuleTab === 'brand' && (
                <BrandTimelineModule
                  onApplyTheme={() => {
                    localStorage.setItem('admin_setting_theme_brand', 'visionary_architect');
                    alert('Applied Visionary Architect preset (Space Grotesk + Plus Jakarta Sans + Obsidian Jet)');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === 'client_dashboard' && (
          <ClientDashboardTab
            projectTitle={projectTitle}
            blockCount={blockCount}
            onEnterBuilder={onBackToBuilder}
            onOpenTickets={() => setActiveTab('tickets')}
            onOpenTutorials={() => setActiveTab('tutorials')}
            onOpenBilling={() => setActiveTab('billing')}
          />
        )}

        {activeTab === 'branding' && permissions.canManageWhiteLabel && (
          <WhiteLabelBrandingTab />
        )}

        {activeTab === 'users' && permissions.canManageTeam && (
          <GranularUsersTab
            usersList={usersList}
            onUpdateUserRole={handleUpdateUserRole}
            onAddUser={handleAddUser}
          />
        )}

        {activeTab === 'tickets' && (
          <SupportTicketsTab
            tickets={tickets}
            onAddTicket={handleAddTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onSendMessage={handleSendTicketMessage}
          />
        )}

        {activeTab === 'tutorials' && <VideoTutorialsTab />}

        {activeTab === 'billing' && (
          <InvoicingPaymentsTab
            invoices={invoices}
            recurringConfigs={recurringConfigs}
            usersList={usersList}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onPayInvoice={handlePayInvoice}
            onAddRecurringConfig={handleAddRecurringConfig}
            onUpdateRecurringConfig={handleUpdateRecurringConfig}
            onTogglePauseRecurringConfig={handleTogglePauseRecurringConfig}
            onDeleteRecurringConfig={handleDeleteRecurringConfig}
            onGenerateCycleInvoice={handleGenerateCycleInvoice}
          />
        )}

        {activeTab === 'gate' && permissions.canManageTeam && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Access Gate Control
              </h4>
              <p className="text-xs text-slate-400">
                Control whether the landing page enforces authentication before
                granting access to the builder canvas.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gateActive"
                    checked={isGateActive}
                    onChange={() => handleToggleGate(true)}
                    className="accent-indigo-600"
                  />
                  <span className="text-xs font-semibold text-white">
                    Gated (Require Sign-Up / Login)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gateActive"
                    checked={!isGateActive}
                    onChange={() => handleToggleGate(false)}
                    className="accent-indigo-600"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    Open Access (Public Demo Mode)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Global Banner Announcement
                  </h4>
                  <p className="text-xs text-slate-400">
                    Broadcast an alert or release notice across the top of the builder.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Enter notice message..."
                />
              </div>

              <button
                type="button"
                onClick={handleSaveAnnouncement}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                Save Announcement
              </button>
            </div>
          </div>
        )}

        {activeTab === 'templates' && permissions.canManageTeam && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Installed Starter Templates ({STARTER_TEMPLATES.length})
                </h4>
                <p className="text-xs text-slate-400">
                  Pre-configured responsive Bootstrap 5 templates available in the visual builder
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                All Verified Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STARTER_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {tmpl.category}
                      </span>
                      {tmpl.badge && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          {tmpl.badge}
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-white">{tmpl.name}</h5>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{tmpl.blocks.length} sections</span>
                    <span>{tmpl.theme?.fontFamily || 'Inter'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
