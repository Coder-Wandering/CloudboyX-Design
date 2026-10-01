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
} from 'lucide-react';
import { ClientInvoice } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BillingInvoicesTabProps {
  invoices: ClientInvoice[];
  onAddInvoice?: (inv: Omit<ClientInvoice, 'id'>) => void;
  onPayInvoice?: (invId: string) => void;
}

export const BillingInvoicesTab: React.FC<BillingInvoicesTabProps> = ({
  invoices,
  onAddInvoice,
  onPayInvoice,
}) => {
  const { agencyBranding, permissions, activeRole } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [paymentSuccessId, setPaymentSuccessId] = useState<string | null>(null);

  // New invoice state
  const [newInvNumber, setNewInvNumber] = useState(`INV-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [newClientName, setNewClientName] = useState('Sarah Miller (Lumina Health)');
  const [newClientEmail, setNewClientEmail] = useState('sarah.miller@lumina.io');
  const [newPlanName, setNewPlanName] = useState('Monthly Managed Cloud Hosting & Maintenance');
  const [newAmount, setNewAmount] = useState('149.00');
  const [newType, setNewType] = useState<ClientInvoice['type']>('recurring_subscription');
  const [newDueDate, setNewDueDate] = useState('2026-10-15');

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid' || inv.status === 'active')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const handlePay = (invId: string) => {
    if (onPayInvoice) {
      onPayInvoice(invId);
    }
    setPaymentSuccessId(invId);
    setTimeout(() => setPaymentSuccessId(null), 3000);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddInvoice) return;

    onAddInvoice({
      invoiceNumber: newInvNumber,
      clientId: 'client-manual',
      clientName: newClientName,
      clientEmail: newClientEmail,
      type: newType,
      planOrItemName: newPlanName,
      amount: parseFloat(newAmount) || 149.0,
      currency: 'USD',
      status: 'pending',
      dueDate: newDueDate,
      billingCycle: newType === 'recurring_subscription' ? 'Monthly' : 'One-off',
      lineItems: [
        {
          description: newPlanName,
          quantity: 1,
          unitPrice: parseFloat(newAmount) || 149.0,
        },
      ],
    });

    setShowCreateModal(false);
  };

  const getStatusPill = (status: ClientInvoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'active':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active Subscription
          </span>
        );
      case 'pending':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Payment
          </span>
        );
      case 'overdue':
      default:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Client Billing & Hosting
            </span>
            <span className="text-xs text-slate-400">
              Direct Billing issued by {agencyBranding.agencyName}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Client Invoices & Hosting Subscriptions
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Track design retainers, one-off page build invoices, and active hosting subscriptions with transparent itemized receipts.
          </p>
        </div>

        {permissions.canManageInvoices && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Client Invoice</span>
          </button>
        )}
      </div>

      {/* High-Level Financial Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Active Hosting Tier
          </span>
          <div className="text-xl font-bold text-white tracking-tight">
            $149.00 <span className="text-xs text-slate-400 font-normal">/ mo</span>
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> High-Availability SLA
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Next Renewal Date
          </span>
          <div className="text-xl font-bold text-white tracking-tight">
            Oct 01, 2026
          </div>
          <p className="text-xs text-slate-400 mt-1">Automatic card renewal</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Paid to Date
          </span>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">All services in good standing</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Pending Balance
          </span>
          <div className={`text-xl font-bold tracking-tight ${pendingAmount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {pendingAmount > 0 ? 'Due within 30 days' : 'No outstanding balances'}
          </p>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Billing History & Statements</h3>
          <span className="text-xs text-slate-400 font-mono">
            {invoices.length} statement records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] bg-slate-900/50">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Description / Plan</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white line-clamp-1">{inv.planOrItemName}</p>
                    <p className="text-[11px] text-slate-400">{inv.clientName}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 capitalize">
                    {inv.type.replace('_', ' ')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusPill(inv.status)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {inv.dueDate}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      View Receipt
                    </button>
                    {inv.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handlePay(inv.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        {paymentSuccessId === inv.id ? 'Paid! ✓' : 'Pay Now'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Invoice / Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: agencyBranding.primaryBrandColor }}
                >
                  {agencyBranding.agencyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{agencyBranding.agencyName}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{agencyBranding.supportEmail}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Billed To</span>
                <p className="font-bold text-white">{selectedInvoice.clientName}</p>
                <p className="text-slate-400 font-mono text-[11px]">{selectedInvoice.clientEmail}</p>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block mb-1 font-semibold uppercase text-[10px]">Invoice Reference</span>
                <p className="font-mono font-bold text-white">{selectedInvoice.invoiceNumber}</p>
                <p className="text-slate-400 text-[11px]">Due Date: {selectedInvoice.dueDate}</p>
                <div className="mt-1 flex justify-end">{getStatusPill(selectedInvoice.status)}</div>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Itemized Services & Deliverables
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {selectedInvoice.lineItems.map((item, i) => (
                      <tr key={i} className="text-slate-300">
                        <td className="py-2.5 px-3">{item.description}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">${selectedInvoice.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Taxes (0% SLA):</span>
                  <span className="font-mono text-white">$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span className="font-mono text-emerald-400">${selectedInvoice.amount.toFixed(2)} {selectedInvoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  alert('Receipt downloaded successfully in PDF format.');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              {selectedInvoice.status === 'pending' ? (
                <button
                  type="button"
                  onClick={() => {
                    handlePay(selectedInvoice.id);
                    setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Process Payment ($ {selectedInvoice.amount.toFixed(2)})</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Paid & Settled
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal (Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Issue Client Invoice</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create an itemized bill or monthly subscription statement.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={newInvNumber}
                    onChange={(e) => setNewInvNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client Name / Org</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Service or Item Description</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Invoice Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ClientInvoice['type'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="recurring_subscription">Monthly Subscription</option>
                    <option value="one_time">One-Time Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
