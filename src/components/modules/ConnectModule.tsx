import React, { useState } from 'react';
import {
  Webhook,
  Key,
  Network,
  Bell,
  Radio,
  ExternalLink,
  ArrowUpRight,
  Shield,
  Layers,
  Activity,
  Terminal,
  FileCode,
  CheckCircle2,
  RefreshCw,
  Zap,
  Sliders,
  TrendingUp,
  DollarSign,
  Play,
  Send,
} from 'lucide-react';

export const ConnectModule: React.FC = () => {
  // Navigation & Bankroll State
  const [bankroll, setBankroll] = useState(1000.0);
  const [activeShortcut, setActiveShortcut] = useState<
    'connect' | 'model_studio' | 'contract_analyzer' | 'data_ingestion' | 'export_data'
  >('connect');

  // Studio Actions State
  const [authType, setAuthType] = useState<'BEARER' | 'HMAC_SHA256' | 'MTLS'>('BEARER');
  const [bearerToken, setBearerToken] = useState('cbx_live_sec_994a081fe72c451d');
  const [activeModalAction, setActiveModalAction] = useState<
    'security' | 'matrix' | 'notify' | 'dispatch' | null
  >(null);

  // Operating Architecture State
  const [deploymentMode, setDeploymentMode] = useState<'suite_addon' | 'standalone'>('suite_addon');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<'slack' | 'telegram' | 'both'>('slack');
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Backtest engine simulation
  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestLogs, setBacktestLogs] = useState<string[]>([
    'Initialized Kalshi Historical Feed [2026-Q1 to Q3]...',
    'Injected ANSI X12 EDI 850 (Purchase Order) packet into pipeline',
    'Latency recorded: 18ms | Packet integrity: 100%',
  ]);

  const handleTriggerNotify = () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleDispatchSignal = () => {
    setIsDispatching(true);
    setDispatchSuccess(false);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 3500);
    }, 900);
  };

  const handleRunBacktest = () => {
    setIsBacktesting(true);
    setTimeout(() => {
      setIsBacktesting(false);
      setBacktestLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Backtest cycle complete: 2,400 ticks simulated. Edge +6.2% EV. Slippage < 0.04%.`,
        ...prev.slice(0, 3),
      ]);
    }, 1100);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. TOP NAVIGATION BAR & PORTFOLIO TRACKER */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 text-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Navigation Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20">
            CloudboyX Connect
          </span>
          <button
            type="button"
            onClick={() => setActiveShortcut('connect')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeShortcut === 'connect'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Studio Core
          </button>
          <button
            type="button"
            onClick={() => setActiveShortcut('model_studio')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeShortcut === 'model_studio'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Model Studio
          </button>
          <button
            type="button"
            onClick={() => setActiveShortcut('contract_analyzer')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeShortcut === 'contract_analyzer'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Contract Analyzer
          </button>
          <button
            type="button"
            onClick={() => setActiveShortcut('data_ingestion')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeShortcut === 'data_ingestion'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Data Ingestion
          </button>
          <button
            type="button"
            onClick={() => setActiveShortcut('export_data')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeShortcut === 'export_data'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Export Data
          </button>
        </div>

        {/* Portfolio Tracker: Simulated Bankroll */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block leading-tight">
                Simulated Bankroll
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${bankroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <a
            href="https://cloudboyx.ai.studio"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <span>Live Studio</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. MAIN STUDIO ACTIONS (HERO SECTION) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white border border-blue-800/60 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  Enterprise Webhook & EDI Studio
                </span>
                <span className="text-[11px] text-blue-300">
                  B2B Gateway for Real-Time Market Event Triggers
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Main Studio Operations
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-200 font-medium">Gateway Protocol:</span>
              <span className="text-xs font-mono font-bold bg-blue-500/30 px-2.5 py-1 rounded-lg border border-blue-400/30 text-white">
                ANSI X12 &bull; REST &bull; Webhooks
              </span>
            </div>
          </div>

          {/* 4 Core Operations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Op 1: Security Credentials */}
            <div className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition space-y-2 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Security Credentials</span>
                <span className="text-[11px] text-blue-200 block">
                  Auth Mode: <strong>{authType}</strong>
                </span>
              </div>
              <div className="pt-1">
                <input
                  type="password"
                  value={bearerToken}
                  readOnly
                  className="w-full text-[11px] font-mono px-2 py-1 bg-black/40 rounded border border-white/10 text-slate-300"
                />
              </div>
            </div>

            {/* Op 2: Suite Matrix */}
            <div className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition space-y-2 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Suite Matrix</span>
                <span className="text-[11px] text-indigo-200 block">
                  4 Connected Cloud Modules
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Predict &bull; Connect &bull; AI ERP &bull; Map Protection
              </p>
            </div>

            {/* Op 3: Quick Notify */}
            <div className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition space-y-2 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Quick Notify</span>
                <span className="text-[11px] text-emerald-200 block">Slack & Telegram Alerts</span>
              </div>
              <button
                type="button"
                onClick={handleTriggerNotify}
                className="w-full text-xs font-semibold py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
              >
                {testNotificationSent ? 'Dispatched to Slack!' : 'Test Broadcast'}
              </button>
            </div>

            {/* Op 4: Dispatch Signal / EDI */}
            <div className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition space-y-2 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Dispatch Signal / EDI</span>
                <span className="text-[11px] text-purple-200 block">Manual & Auto Routing</span>
              </div>
              <button
                type="button"
                onClick={handleDispatchSignal}
                disabled={isDispatching}
                className="w-full text-xs font-semibold py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition flex items-center justify-center gap-1"
              >
                <Zap className={`w-3 h-3 ${isDispatching ? 'animate-spin' : ''}`} />
                <span>{isDispatching ? 'Dispatching...' : 'Dispatch Packet'}</span>
              </button>
            </div>
          </div>

          {dispatchSuccess && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Packet dispatched successfully: ANSI X12 EDI 850 translated and transmitted to
                external endpoint with verified cryptographic HMAC signature.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. OPERATING ARCHITECTURE (BOTTOM DARK PANEL) */}
      <div className="p-6 bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Operating Architecture & Telemetry</span>
            </h3>
            <p className="text-xs text-slate-400">
              Underlying infrastructure and automated routing engines driving the platform
            </p>
          </div>

          {/* Deployment Modes Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Deployment Mode:</span>
            <div className="flex items-center bg-slate-900 border border-slate-700 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setDeploymentMode('suite_addon')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  deploymentMode === 'suite_addon'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Suite Add-On
              </button>
              <button
                type="button"
                onClick={() => setDeploymentMode('standalone')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  deploymentMode === 'standalone'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Standalone Gateway
              </button>
            </div>
          </div>
        </div>

        {/* Monitoring Toolsets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health Dashboard */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Health Dashboard</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                Healthy
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Network Latency</span>
                <span className="font-mono font-bold text-white">18ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Packet Success</span>
                <span className="font-mono font-bold text-emerald-400">99.99%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Sockets</span>
                <span className="font-mono text-white">24 TLS 1.3</span>
              </div>
            </div>
          </div>

          {/* API Health Monitor: Kalshi Exchange API Rate Limits */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>API Health Monitor</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                Kalshi Exchange
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Rate Threshold</span>
                <span className="font-mono font-bold text-amber-400">20 req/s Limit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Ingestion Rate</span>
                <span className="font-mono font-bold text-white">12.4 req/s (62%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </div>

          {/* Backtest Engine */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-purple-400" />
                <span>Backtest Engine</span>
              </span>
              <button
                type="button"
                onClick={handleRunBacktest}
                disabled={isBacktesting}
                className="text-[10px] px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
              >
                {isBacktesting ? 'Simulating...' : 'Run Test'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Simulates historical market contract events and validates EDI transmission tolerances.
            </p>
            <div className="text-[10px] font-mono bg-black/40 p-2 rounded border border-slate-800 text-slate-300 h-14 overflow-y-auto">
              {backtestLogs[0]}
            </div>
          </div>
        </div>

        {/* Connectors Creator: Mapping Module for ANSI X12 EDI and REST JSON */}
        <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Connectors Creator & Rule Mapper
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Protocol Translator: ANSI X12 EDI &harr; REST JSON
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-black/40 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-blue-400 font-bold block mb-1">
                Incoming Protocol (ANSI X12):
              </span>
              ISA*00* *00* *ZZ*CLOUDBOYX *01*EXTERNALB2B*...~
              <br />
              GS*PO*CLOUDBOYX*EXTERNALB2B*20260916*1500*1*X*004010~
              <br />
              ST*850*0001~BEG*00*SA*PO-99201**20260916~
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
              <span className="text-emerald-400 font-bold block mb-1">
                Outgoing Transformed REST JSON:
              </span>
              {`{ "event": "market_trigger", "contract": "KALSHI-FED-2026", "probability": 0.84, "orders": [ { "sku": "EDI-850", "units": 100 } ] }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
