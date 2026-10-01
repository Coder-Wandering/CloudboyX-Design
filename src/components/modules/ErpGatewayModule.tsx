import React, { useState } from 'react';
import {
  Cpu,
  Database,
  ShieldCheck,
  TrendingUp,
  Activity,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Server,
  Layers,
  ArrowUpRight,
  Zap,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

interface ErpGatewayModuleProps {
  onSyncWithSite?: () => void;
}

export const ErpGatewayModule: React.FC<ErpGatewayModuleProps> = ({ onSyncWithSite }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditDone, setAuditDone] = useState(false);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditDone(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditDone(true);
    }, 1200);
  };

  const handleSyncCatalog = () => {
    setSyncedCount(48);
    if (onSyncWithSite) onSyncWithSite();
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AI-Native Operations
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ledger Live & Synchronized
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>CloudboyX AI ERP Gateway</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Connected enterprise data for AI and automation. Effortlessly build tens of thousands of
              sites with APIs, AI, reusable assets, and advanced roles and permissions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://cloudboyx-erp.ai.studio"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5"
            >
              <span>Launch ERP Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Ledger Uptime</span>
            <span className="text-sm font-bold text-white font-mono">99.98%</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Processing Speed</span>
            <span className="text-sm font-bold text-white font-mono">14,820 tx/s</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Settled Volume</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">$48,290,140</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Audit Integrity</span>
            <span className="text-sm font-bold text-blue-300 font-mono">Zero Discrepancy</span>
          </div>
        </div>
      </div>

      {/* Strategic Ledger Health & Performance Indicators */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Strategic Ledger Health & Performance Indicators</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time telemetry and balance auditing across unified ERP operations
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isAuditing ? 'Auditing Nodes...' : 'Run Ledger Audit'}</span>
          </button>
        </div>

        {auditDone && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Strategic Ledger Health Audit verified 100% compliant. All 24 node ledgers balanced
              with zero unallocated transactions.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Indicator 1 */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>Core Journal Consistency</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">
                100%
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated double-entry reconciliation across bank feeds, customer invoices, and EDI
              settlements.
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Indicator 2 */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Workflow Orchestration</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                Active &bull; 12 Agents
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Autonomous agents reconcile accounts, detect revenue leakage, and dynamically route
              purchase orders.
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '94%' }} />
            </div>
          </div>

          {/* Indicator 3 */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Security & Role Isolation</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                SOC2 Type II
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enterprise-grade encryption with granular access policies, audit logging, and automated
              session revocation.
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: '99%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* CloudboyX Enterprise Suite Pillars */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          CloudboyX Enterprise Suite Pillars
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">Built-in Analytics</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Instant telemetry across multi-tenant sites and customer conversion funnels.
            </p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">Adaptive Workflows</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Dynamically evolve operational logic as organization requirements change.
            </p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">Unified Data & Intelligence</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              One central cloud brain for inventory, billing, sites, and contract forecasting.
            </p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">Pay For What You Need</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Elastic modular billing scaling seamlessly from single startups to Fortune 500 fleets.
            </p>
          </div>
        </div>

        {/* Action button to sync ERP products/pricing directly into builder */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            <strong>Website Builder Integration:</strong> Connect active ERP product SKUs, pricing
            tiers, and customer testimonials straight into Bootstrap blocks.
          </div>
          <button
            type="button"
            onClick={handleSyncCatalog}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {syncedCount ? `Synced ${syncedCount} ERP SKUs` : 'Sync ERP Catalog to Builder'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
