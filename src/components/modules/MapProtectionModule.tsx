import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowUpRight,
  Store,
  RefreshCw,
  Globe,
  Sliders,
  Send,
  Eye,
} from 'lucide-react';

export const MapProtectionModule: React.FC = () => {
  const [scanUrl, setScanUrl] = useState('https://amazon.com/dp/B0CLOUD9X');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'compliant' | 'violation';
    seller: string;
    mapPrice: number;
    listedPrice: number;
    channel: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'violations' | 'scanner'>('overview');

  const handleRunScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        status: 'violation',
        seller: 'Apex Global Logistics LLC (Unauthorized Reseller)',
        mapPrice: 299.0,
        listedPrice: 249.99,
        channel: 'Amazon Marketplace & Google Shopping',
      });
    }, 1200);
  };

  const VIOLATION_LIST = [
    {
      id: 'V-9021',
      seller: 'BargainDirect Store',
      channel: 'eBay Motors & Tech',
      sku: 'CBX-ENTERPRISE-POD',
      mapPrice: '$499.00',
      detectedPrice: '$419.00',
      delta: '-16.0%',
      status: 'Warning Dispatched',
      time: '12 mins ago',
    },
    {
      id: 'V-9018',
      seller: 'PrimeDeals Hub',
      channel: 'Walmart Marketplace',
      sku: 'CBX-AI-GATEWAY-V2',
      mapPrice: '$1,299.00',
      detectedPrice: '$1,149.00',
      delta: '-11.5%',
      status: 'Cease & Desist Sent',
      time: '44 mins ago',
    },
    {
      id: 'V-9005',
      seller: 'ElectroWorld LLC',
      channel: 'Google Shopping',
      sku: 'CBX-EDI-CONNECTOR',
      mapPrice: '$799.00',
      detectedPrice: '$729.00',
      delta: '-8.7%',
      status: 'Resolved (Price Corrected)',
      time: '3 hours ago',
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                Brand Integrity & MAP Enforcement
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Active Market Sweep (24/7)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>CloudboyX Map Protection</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated Minimum Advertised Price (MAP) scanner and unauthorized reseller tracking.
              Safeguard brand equity, protect retail margins, and enforce compliance across every sales
              channel.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://map-protection-scanner.ai.studio"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-500/25 transition flex items-center gap-1.5"
            >
              <span>Launch MAP Scanner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">MAP Compliance Rate</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">98.4%</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Channels Monitored</span>
            <span className="text-sm font-bold text-white font-mono">1,450+ Stores</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Active Violations</span>
            <span className="text-sm font-bold text-rose-400 font-mono">2 Detected</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Auto-Notice Dispatch</span>
            <span className="text-sm font-bold text-blue-300 font-mono">Enabled</span>
          </div>
        </div>
      </div>

      {/* Interactive URL Scanner Tool */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Product & Store URL Scanner
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Target Amazon, Walmart, eBay, or Direct D2C</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="url"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              placeholder="Enter product page URL to audit MAP pricing..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition"
            />
          </div>
          <button
            type="button"
            onClick={handleRunScan}
            disabled={isScanning || !scanUrl}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Auditing Price Crawl...' : 'Scan Product URL'}</span>
          </button>
        </div>

        {/* Scan Results Output */}
        {scanResult && (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>MAP Violation Detected!</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold font-mono text-[10px]">
                Delta: -${(scanResult.mapPrice - scanResult.listedPrice).toFixed(2)} (
                {(
                  ((scanResult.mapPrice - scanResult.listedPrice) / scanResult.mapPrice) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 pt-1">
              <div>
                <span className="text-[11px] text-slate-500 block">Identified Seller:</span>
                <strong className="text-slate-900">{scanResult.seller}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Approved MAP Baseline:</span>
                <strong className="text-slate-900 font-mono">${scanResult.mapPrice.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Crawled Cart Price:</span>
                <strong className="text-rose-700 font-mono font-bold">
                  ${scanResult.listedPrice.toFixed(2)}
                </strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-rose-200/80">
              <button
                type="button"
                onClick={() => alert('Cease & Desist notification queued and sent to seller.')}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Dispatch Automated C&D Notice</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Violation Incidents Feed */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Recent Enforcement & Compliance Logs
          </h4>
          <span className="text-[11px] text-slate-400">Updated continuously</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] border-b border-slate-200">
              <tr>
                <th className="p-2.5">ID / SKU</th>
                <th className="p-2.5">Seller & Channel</th>
                <th className="p-2.5">MAP / Detected</th>
                <th className="p-2.5">Price Delta</th>
                <th className="p-2.5">Enforcement Action</th>
                <th className="p-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VIOLATION_LIST.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-2.5">
                    <span className="font-mono font-bold text-slate-900 block">{item.id}</span>
                    <span className="text-[10px] text-slate-400">{item.sku}</span>
                  </td>
                  <td className="p-2.5">
                    <span className="font-semibold text-slate-800 block">{item.seller}</span>
                    <span className="text-[10px] text-slate-500">{item.channel}</span>
                  </td>
                  <td className="p-2.5 font-mono">
                    <span className="text-slate-500 line-through text-[11px] block">
                      {item.mapPrice}
                    </span>
                    <span className="font-bold text-rose-600">{item.detectedPrice}</span>
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold font-mono text-[10px] border border-rose-200">
                      {item.delta}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span className="text-[11px] font-medium text-slate-700 block">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-right text-[11px] text-slate-400">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
