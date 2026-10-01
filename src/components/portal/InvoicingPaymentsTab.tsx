import React, { useState } from 'react';
import {
  CreditCard,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  X,
  Printer,
  DollarSign,
  Check,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Sliders,
  Send,
  Building2,
  Trash2,
  Edit3,
  Play,
  PauseCircle,
  MoreVertical,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { ClientInvoice, RecurringInvoiceConfig } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { PortalUserItem } from './GranularUsersTab';

interface InvoicingPaymentsTabProps {
  invoices: ClientInvoice[];
  recurringConfigs: RecurringInvoiceConfig[];
  usersList?: PortalUserItem[];
  onAddInvoice: (inv: Omit<ClientInvoice, 'id'>) => void;
  onUpdateInvoiceStatus: (invId: string, status: ClientInvoice['status'], paidAt?: string) => void;
  onPayInvoice: (invId: string) => void;
  onAddRecurringConfig: (config: Omit<RecurringInvoiceConfig, 'id' | 'createdAt'>) => void;
  onUpdateRecurringConfig: (configId: string, updates: Partial<RecurringInvoiceConfig>) => void;
  onTogglePauseRecurringConfig: (configId: string) => void;
  onDeleteRecurringConfig: (configId: string) => void;
  onGenerateCycleInvoice: (configId: string) => void;
}

type SubView = 'invoices' | 'recurring' | 'cycles';

export const InvoicingPaymentsTab: React.FC<InvoicingPaymentsTabProps> = ({
  invoices,
  recurringConfigs,
  usersList = [],
  onAddInvoice,
  onUpdateInvoiceStatus,
  onPayInvoice,
  onAddRecurringConfig,
  onUpdateRecurringConfig,
  onTogglePauseRecurringConfig,
  onDeleteRecurringConfig,
  onGenerateCycleInvoice,
}) => {
  const { agencyBranding, permissions, activeRole } = useAuth();
  const isManager = permissions.canManageInvoices || activeRole === 'admin' || activeRole === 'agency_team';

  // Sub-view navigation
  const [subView, setSubView] = useState<SubView>('invoices');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientInvoice['status']>('all');
  const [cycleFilter, setCycleFilter] = useState<string>('all');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateRecurringModal, setShowCreateRecurringModal] = useState(false);
  const [editingRecurringConfig, setEditingRecurringConfig] = useState<RecurringInvoiceConfig | null>(null);

  // Notifications & Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Metrics calculation
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.amount, 0);

  // Calculate Monthly Recurring Revenue (MRR) normalized
  const activeRecurringConfigs = recurringConfigs.filter((c) => c.status === 'active');
  const calculatedMRR = activeRecurringConfigs.reduce((acc, c) => {
    if (c.billingCycle === 'Monthly') return acc + c.amount;
    if (c.billingCycle === 'Quarterly') return acc + c.amount / 3;
    if (c.billingCycle === 'Yearly') return acc + c.amount / 12;
    return acc;
  }, 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.planOrItemName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesCycle = cycleFilter === 'all' || inv.billingCycle === cycleFilter;

    return matchesSearch && matchesStatus && matchesCycle;
  });

  // Filtered Recurring Configurations
  const filteredRecurringConfigs = recurringConfigs.filter((config) => {
    const matchesSearch =
      config.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (config.organization && config.organization.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCycle = cycleFilter === 'all' || config.billingCycle === cycleFilter;

    return matchesSearch && matchesCycle;
  });

  // Handle Mark as Paid
  const handleMarkAsPaid = (invId: string) => {
    onUpdateInvoiceStatus(invId, 'paid', new Date().toISOString().split('T')[0]);
    showNotification('Invoice marked as paid and payment timestamp recorded.');
  };

  // Handle Send Reminder
  const handleSendReminder = (inv: ClientInvoice) => {
    showNotification(`Payment reminder dispatched to ${inv.clientEmail} for ${inv.invoiceNumber}.`);
  };

  // Handle Run Cycle Now
  const handleRunConfigCycle = (config: RecurringInvoiceConfig) => {
    onGenerateCycleInvoice(config.id);
    showNotification(`Generated new cycle invoice for ${config.clientName} (${config.planName}).`);
  };

  // Calculate days until next billing
  const getDaysUntil = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const now = new Date('2026-09-15').getTime(); // Using mock current date
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Status Badge UI
  const renderStatusBadge = (status: ClientInvoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Paid
          </span>
        );
      case 'active':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-indigo-400" /> Active Sub
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" /> Pending
          </span>
        );
      case 'overdue':
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Overdue
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {feedbackMessage && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-xs text-indigo-200 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-indigo-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Agency Financial Hub
            </span>
            <span className="text-xs text-slate-400">
              Managed under {agencyBranding.agencyName} • {agencyBranding.customDomain}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Invoicing & Client Payments</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {recurringConfigs.length} Active Billing Cycles
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Track client billing cycles, monitor real-time payment status, trigger automated renewal runs, and manage recurring retainer contracts.
          </p>
        </div>

        {/* Action Buttons for Managers */}
        {isManager && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateRecurringModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Recurring Plan</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateInvoiceModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create One-Off Invoice</span>
            </button>
          </div>
        )}
      </div>

      {/* Financial Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Monthly Recurring Revenue */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Normalized MRR
            </span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${calculatedMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
            <span>{activeRecurringConfigs.length} recurring clients active</span>
          </p>
        </div>

        {/* Metric 2: Total Collected */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Collected
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalBilled > 0 ? `${Math.round((totalCollected / totalBilled) * 100)}% collection rate` : '100%'}
          </p>
        </div>

        {/* Metric 3: Pending Invoices */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Invoices
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {invoices.filter((i) => i.status === 'pending').length} invoice(s) awaiting payment
          </p>
        </div>

        {/* Metric 4: Overdue Balances */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overdue Balances
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className={`text-2xl font-bold tracking-tight ${overdueAmount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            ${overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {overdueAmount > 0 ? 'Requires manager follow-up' : 'All accounts in good standing'}
          </p>
        </div>

        {/* Metric 5: Active Billing Cycles */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cycle Frequencies
            </span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-semibold text-white space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Monthly:</span>
              <span className="text-white font-mono">{recurringConfigs.filter((c) => c.billingCycle === 'Monthly').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Quarterly / Yearly:</span>
              <span className="text-white font-mono">
                {recurringConfigs.filter((c) => c.billingCycle === 'Quarterly' || c.billingCycle === 'Yearly').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSubView('invoices')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              subView === 'invoices'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Invoices & Payments ({invoices.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('recurring')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              subView === 'recurring'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recurring Invoice Configurations ({recurringConfigs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('cycles')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              subView === 'cycles'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Billing Cycles & Renewals</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search client, invoice #..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {subView === 'invoices' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="active">Active Subscription</option>
            </select>
          )}

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Cycles</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
            <option value="One-off">One-off</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: All Invoices & Payment Status */}
      {subView === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Invoice # & Date</th>
                    <th className="p-3.5">Client & Organization</th>
                    <th className="p-3.5">Plan / Description</th>
                    <th className="p-3.5">Billing Cycle</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment Status</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5 pr-5 text-right">Manager Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No invoices match the specified criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-900/50 transition">
                        <td className="p-3.5 pl-5 font-mono text-white font-semibold">
                          <div>{inv.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-500 font-sans">
                            {inv.paidAt ? `Paid ${inv.paidAt}` : `Due ${inv.dueDate}`}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-white">{inv.clientName}</div>
                          <div className="text-[11px] text-slate-400">{inv.clientEmail}</div>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <div className="truncate font-medium text-slate-200" title={inv.planOrItemName}>
                            {inv.planOrItemName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {inv.lineItems?.length || 1} itemized line(s)
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {inv.billingCycle || 'Monthly'}
                          </span>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-white text-sm">
                          ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3.5">{renderStatusBadge(inv.status)}</td>

                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                          {inv.dueDate}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail / Receipt */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                              title="View itemized breakdown"
                            >
                              View
                            </button>

                            {/* Mark as Paid Quick Action */}
                            {inv.status !== 'paid' && isManager && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(inv.id)}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1"
                                title="Record payment"
                              >
                                <Check className="w-3 h-3" />
                                <span className="hidden xl:inline">Paid</span>
                              </button>
                            )}

                            {/* Send Reminder Quick Action */}
                            {inv.status !== 'paid' && isManager && (
                              <button
                                type="button"
                                onClick={() => handleSendReminder(inv)}
                                className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition"
                                title="Send email reminder"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Recurring Invoice Configurations */}
      {subView === 'recurring' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Automated Client Billing Schedules
              </h3>
              <p className="text-xs text-slate-400">
                Configure auto-charge rules, plan amounts, billing cycles, and next invoice generation runs.
              </p>
            </div>
            {isManager && (
              <button
                type="button"
                onClick={() => setShowCreateRecurringModal(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Recurring Configuration</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecurringConfigs.map((config) => {
              const daysUntil = getDaysUntil(config.nextBillingDate);
              const isPaused = config.status === 'paused';

              return (
                <div
                  key={config.id}
                  className={`bg-slate-950 rounded-2xl border p-5 flex flex-col justify-between transition ${
                    isPaused ? 'border-slate-800 opacity-75' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Client & Frequency */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
                          {config.billingCycle} Cycle
                        </span>
                        {config.autoCharge ? (
                          <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Auto-Debit
                          </span>
                        ) : (
                          <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Manual Invoice
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          config.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400 border-slate-700'
                        }`}
                      >
                        {config.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Plan & Amount */}
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{config.planName}</h4>
                      <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                        ${config.amount.toFixed(2)}{' '}
                        <span className="text-xs text-slate-400 font-sans font-normal">
                          / {config.billingCycle.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-white font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{config.clientName}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] truncate">{config.clientEmail}</div>
                      {config.organization && (
                        <div className="text-[11px] text-indigo-400">{config.organization}</div>
                      )}
                    </div>

                    {/* Payment Method on File */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span className="uppercase">{config.paymentMethod.brand}</span> •••• {config.paymentMethod.last4}
                      </span>
                      <span className="text-[11px]">Exp {config.paymentMethod.expiry}</span>
                    </div>

                    {/* Next Cycle Date & Countdown */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                          Next Billing Date
                        </span>
                        <span className="font-mono font-semibold text-white">{config.nextBillingDate}</span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          daysUntil <= 5
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : daysUntil <= 15
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {daysUntil <= 0 ? 'Due Today' : `In ${daysUntil} days`}
                      </span>
                    </div>
                  </div>

                  {/* Manager Controls */}
                  {isManager && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleRunConfigCycle(config)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1"
                        title="Generate invoice for the next cycle now"
                      >
                        <Play className="w-3 h-3" />
                        <span>Generate Invoice</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onTogglePauseRecurringConfig(config.id)}
                          className="p-1.5 text-xs rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title={isPaused ? 'Resume Plan' : 'Pause Plan'}
                        >
                          <PauseCircle className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingRecurringConfig(config)}
                          className="p-1.5 text-xs rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Edit Configuration"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete recurring billing plan for ${config.clientName}?`)) {
                              onDeleteRecurringConfig(config.id);
                              showNotification(`Recurring plan removed for ${config.clientName}`);
                            }
                          }}
                          className="p-1.5 text-xs rounded-lg hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Remove Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Billing Cycles Timeline & Cashflow */}
      {subView === 'cycles' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Upcoming Renewal Schedule & Expected Inflow
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological schedule of client subscription renewals and automatic debits over the upcoming cycles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-xl">
                  Automated Cycle Engine Ready
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {recurringConfigs
                .filter((c) => c.status === 'active')
                .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
                .map((c) => {
                  const days = getDaysUntil(c.nextBillingDate);
                  return (
                    <div key={c.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] uppercase font-bold text-indigo-400">
                            {new Date(c.nextBillingDate).toLocaleString('default', { month: 'short' })}
                          </span>
                          <span className="text-xs font-bold text-white font-mono leading-none">
                            {new Date(c.nextBillingDate).getDate()}
                          </span>
                        </div>

                        <div>
                          <div className="font-semibold text-white text-xs flex items-center gap-2">
                            <span>{c.clientName}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                              {c.billingCycle}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{c.planName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-mono font-bold text-white text-sm">
                            ${c.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {c.autoCharge ? `Auto •••• ${c.paymentMethod.last4}` : 'Invoice by Email'}
                          </div>
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-xl ${
                            days <= 5
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : days <= 15
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {days <= 0 ? 'Due Today' : `In ${days} days`}
                        </span>

                        {isManager && (
                          <button
                            type="button"
                            onClick={() => handleRunConfigCycle(c)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          >
                            Bill Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: View Itemized Invoice & Official Receipt */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-white">{agencyBranding.agencyName}</span>
                  <span className="text-xs text-slate-500">Official Invoice</span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill To & Metadata Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Billed To</span>
                <div className="font-semibold text-white">{selectedInvoice.clientName}</div>
                <div className="text-slate-400">{selectedInvoice.clientEmail}</div>
                <div className="text-slate-500 font-mono text-[11px] pt-1">
                  Client ID: {selectedInvoice.clientId}
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Cycle & Due Date</span>
                <div className="flex justify-between">
                  <span className="text-slate-400">Billing Frequency:</span>
                  <span className="font-semibold text-white">{selectedInvoice.billingCycle || 'Monthly'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Due Date:</span>
                  <span className="font-mono font-semibold text-white">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Payment Status:</span>
                  {renderStatusBadge(selectedInvoice.status)}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Service / Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {(selectedInvoice.lineItems || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center font-mono">{item.quantity}</td>
                      <td className="p-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-900/60 font-bold border-t border-slate-800 text-white">
                  <tr>
                    <td colSpan={3} className="p-3 text-right text-slate-400 uppercase text-[11px]">
                      Total Due
                    </td>
                    <td className="p-3 text-right font-mono text-base text-emerald-400">
                      ${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Export PDF</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedInvoice.status !== 'paid' && isManager && (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAsPaid(selectedInvoice.id);
                      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paidAt: '2026-09-15' });
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Record Payment as Received</span>
                  </button>
                )}

                {selectedInvoice.status !== 'paid' && !isManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onPayInvoice(selectedInvoice.id);
                      setSelectedInvoice({ ...selectedInvoice, status: 'paid', paidAt: '2026-09-15' });
                      showNotification('Payment processed successfully via credit card.');
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Invoice Online</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Recurring Invoice Configuration */}
      {(showCreateRecurringModal || editingRecurringConfig) && (
        <RecurringConfigModal
          existingConfig={editingRecurringConfig}
          usersList={usersList}
          onClose={() => {
            setShowCreateRecurringModal(false);
            setEditingRecurringConfig(null);
          }}
          onSave={(configData) => {
            if (editingRecurringConfig) {
              onUpdateRecurringConfig(editingRecurringConfig.id, configData);
              showNotification(`Updated recurring configuration for ${configData.clientName}.`);
            } else {
              onAddRecurringConfig(configData);
              showNotification(`Created new recurring billing plan for ${configData.clientName}.`);
            }
            setShowCreateRecurringModal(false);
            setEditingRecurringConfig(null);
          }}
        />
      )}

      {/* MODAL 3: Create One-Off Invoice */}
      {showCreateInvoiceModal && (
        <CreateOneOffInvoiceModal
          usersList={usersList}
          onClose={() => setShowCreateInvoiceModal(false)}
          onSave={(invData) => {
            onAddInvoice(invData);
            showNotification(`Invoice ${invData.invoiceNumber} created successfully.`);
            setShowCreateInvoiceModal(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-Modal: Recurring Configuration Creator & Editor
interface RecurringConfigModalProps {
  existingConfig: RecurringInvoiceConfig | null;
  usersList: PortalUserItem[];
  onClose: () => void;
  onSave: (data: Omit<RecurringInvoiceConfig, 'id' | 'createdAt'>) => void;
}

const RecurringConfigModal: React.FC<RecurringConfigModalProps> = ({
  existingConfig,
  usersList,
  onClose,
  onSave,
}) => {
  const [clientName, setClientName] = useState(existingConfig?.clientName || 'Sarah Miller (Lumina Health)');
  const [clientEmail, setClientEmail] = useState(existingConfig?.clientEmail || 'sarah.miller@lumina.io');
  const [organization, setOrganization] = useState(existingConfig?.organization || 'Lumina Health Clinic');
  const [planName, setPlanName] = useState(
    existingConfig?.planName || 'Managed Cloud Hosting & Monthly Maintenance'
  );
  const [billingCycle, setBillingCycle] = useState<RecurringInvoiceConfig['billingCycle']>(
    existingConfig?.billingCycle || 'Monthly'
  );
  const [amount, setAmount] = useState(existingConfig ? String(existingConfig.amount) : '149.00');
  const [status, setStatus] = useState<RecurringInvoiceConfig['status']>(existingConfig?.status || 'active');
  const [nextBillingDate, setNextBillingDate] = useState(existingConfig?.nextBillingDate || '2026-10-01');
  const [autoCharge, setAutoCharge] = useState(existingConfig ? existingConfig.autoCharge : true);
  const [cardBrand, setCardBrand] = useState(existingConfig?.paymentMethod.brand || 'visa');
  const [cardLast4, setCardLast4] = useState(existingConfig?.paymentMethod.last4 || '4242');
  const [cardExpiry, setCardExpiry] = useState(existingConfig?.paymentMethod.expiry || '08/28');
  const [notes, setNotes] = useState(existingConfig?.notes || '');

  // Quick Plan Presets
  const applyPreset = (preset: { name: string; cycle: RecurringInvoiceConfig['billingCycle']; amt: string }) => {
    setPlanName(preset.name);
    setBillingCycle(preset.cycle);
    setAmount(preset.amt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      clientId: `client-${Date.now()}`,
      clientName,
      clientEmail,
      organization,
      planName,
      billingCycle,
      amount: parseFloat(amount) || 149.0,
      currency: 'USD',
      status,
      nextBillingDate,
      autoCharge,
      paymentMethod: {
        brand: cardBrand as any,
        last4: cardLast4,
        expiry: cardExpiry,
      },
      lineItems: [
        {
          description: planName,
          quantity: 1,
          unitPrice: parseFloat(amount) || 149.0,
        },
      ],
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              {existingConfig ? 'Edit Recurring Configuration' : 'Configure Recurring Client Billing'}
            </h3>
            <p className="text-xs text-slate-400">
              Set automated billing cycles, card on file, and scheduled invoice renewals.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase font-bold text-slate-400">Plan Presets:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  name: 'Managed Cloud Hosting & Monthly Maintenance',
                  cycle: 'Monthly',
                  amt: '149.00',
                })
              }
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              Managed Hosting ($149/mo)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  name: 'Enterprise Growth & Dedicated Dev Retainer',
                  cycle: 'Monthly',
                  amt: '850.00',
                })
              }
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              Enterprise Retainer ($850/mo)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  name: 'Quarterly Maintenance & Security Audit',
                  cycle: 'Quarterly',
                  amt: '450.00',
                })
              }
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
            >
              Quarterly Audit ($450/qtr)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Client & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Contact Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Email Address</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Organization / Company Name</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Plan / Package Title</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Cycle, Amount & Next Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Billing Frequency</label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Recurring Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Next Billing Date</label>
              <input
                type="date"
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Payment Method on File</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCharge}
                  onChange={(e) => setAutoCharge(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span className="text-slate-300">Enable Auto-Charge</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Card Brand</label>
                <select
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">Amex</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Last 4 Digits</label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="08/28"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Internal Notes</label>
            <input
              type="text"
              placeholder="e.g. Net-15 terms, client pays via corporate card"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20 transition"
            >
              {existingConfig ? 'Save Changes' : 'Save Recurring Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-Modal: Create One-Off Invoice
interface CreateOneOffInvoiceModalProps {
  usersList: PortalUserItem[];
  onClose: () => void;
  onSave: (data: Omit<ClientInvoice, 'id'>) => void;
}

const CreateOneOffInvoiceModal: React.FC<CreateOneOffInvoiceModalProps> = ({
  usersList,
  onClose,
  onSave,
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [clientName, setClientName] = useState('Sarah Miller (Lumina Health)');
  const [clientEmail, setClientEmail] = useState('sarah.miller@lumina.io');
  const [planOrItemName, setPlanOrItemName] = useState('Custom Block Creation & Conversion Optimization');
  const [amount, setAmount] = useState('500.00');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [billingCycle, setBillingCycle] = useState<ClientInvoice['billingCycle']>('One-off');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      invoiceNumber,
      clientId: 'client-manual',
      clientName,
      clientEmail,
      type: 'one_time',
      planOrItemName,
      amount: parseFloat(amount) || 500.0,
      currency: 'USD',
      status: 'pending',
      dueDate,
      billingCycle,
      lineItems: [
        {
          description: planOrItemName,
          quantity: 1,
          unitPrice: parseFloat(amount) || 500.0,
        },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Create One-Off Client Invoice</h3>
            <p className="text-xs text-slate-400">Issue a custom bill for design hours, custom code, or setup fees.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Client Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Line Item Description</label>
            <input
              type="text"
              value={planOrItemName}
              onChange={(e) => setPlanOrItemName(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Total Amount ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs transition"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
