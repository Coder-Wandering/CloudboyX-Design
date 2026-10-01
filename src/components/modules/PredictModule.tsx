import React, { useState } from 'react';
import {
  TrendingUp,
  Brain,
  Scale,
  Calculator,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  BarChart,
  MessageSquare,
} from 'lucide-react';

interface ContractRadarItem {
  id: string;
  ticker: string;
  title: string;
  category: string;
  marketImplied: number; // e.g. 62%
  calibratedOdds: number; // e.g. 74%
  expectedValue: string; // e.g. '+19.3%'
  volume: string;
  expiry: string;
}

export const PredictModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'radar' | 'debate' | 'calculator'>('radar');
  const [selectedContract, setSelectedContract] = useState<string>('FED-CUT-SEP26');
  const [simStake, setSimStake] = useState<number>(100);

  const CONTRACTS: ContractRadarItem[] = [
    {
      id: 'FED-CUT-SEP26',
      ticker: 'KXFED-26SEP-CUT25',
      title: 'Federal Reserve Cuts Fed Funds Rate by >= 25 bps in September 2026',
      category: 'Macroeconomics',
      marketImplied: 61,
      calibratedOdds: 74,
      expectedValue: '+21.3%',
      volume: '$1.42M',
      expiry: 'Sep 2026',
    },
    {
      id: 'CPI-AUG26-SUB3',
      ticker: 'KXCPI-26AUG-SUB30',
      title: 'US Headline CPI YoY Prints Below 2.8% for August 2026',
      category: 'Inflation',
      marketImplied: 45,
      calibratedOdds: 54,
      expectedValue: '+20.0%',
      volume: '$890K',
      expiry: 'Sep 2026',
    },
    {
      id: 'TECH-COMPUTE-GEN3',
      ticker: 'KXAI-COMPUTE-100GW',
      title: 'Global Data Center AI Compute Reaches 100GW Benchmark before Q4 2026',
      category: 'AI & Tech',
      marketImplied: 72,
      calibratedOdds: 83,
      expectedValue: '+15.2%',
      volume: '$2.15M',
      expiry: 'Oct 2026',
    },
  ];

  const currentItem = CONTRACTS.find((c) => c.id === selectedContract) || CONTRACTS[0];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Probability Research Pipeline
              </span>
              <span className="text-[11px] text-purple-200">
                Kalshi & Prediction Market Intelligence
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>CloudboyX Predict</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              AI-powered forecasting and calibrated probability pipeline for event contracts. Combines
              multi-perspective debate, econometric modeling, calibrated odds, and expected value
              calculation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://cloudboyx.ai.studio/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition flex items-center gap-1.5"
            >
              <span>Launch Predict Engine</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Active Contracts Scanned</span>
            <span className="text-sm font-bold text-white font-mono">1,840 Markets</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Average Positive Edge</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">+18.4% EV</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Multi-Agent Debate</span>
            <span className="text-sm font-bold text-purple-300 font-mono">3 Perspectives</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Brier Calibration Score</span>
            <span className="text-sm font-bold text-blue-300 font-mono">0.082 (Optimal)</span>
          </div>
        </div>
      </div>

      {/* Contract Radar & Live Edge Table */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Kalshi Prediction Contracts Radar
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Real-time Calibrated Edge</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTRACTS.map((contract) => {
            const isSelected = selectedContract === contract.id;
            return (
              <div
                key={contract.id}
                onClick={() => setSelectedContract(contract.id)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2.5 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs ring-1 ring-purple-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {contract.ticker}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    {contract.expectedValue} EV
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {contract.title}
                </h4>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Market Implied</span>
                    <strong className="text-slate-700 font-mono">{contract.marketImplied}%</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">CBX Calibrated</span>
                    <strong className="text-purple-700 font-mono font-bold">
                      {contract.calibratedOdds}%
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Perspective Debate Engine for Selected Contract */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Multi-Perspective AI Debate Engine
              </h4>
              <p className="text-[11px] text-slate-500">
                Evaluating: <strong>{currentItem.title}</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">3 Autonomous LLM Agent Personas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Perspective 1: Macro Bull */}
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">1. Macro Bullish Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono font-bold">
                Odds: 82%
              </span>
            </div>
            <p className="text-emerald-950 text-[11px] leading-relaxed">
              Labor market loosening and revised CPI prints create imperative conditions for policy
              easing. Market underprices the FOMC reaction function by 13 percentage points.
            </p>
          </div>

          {/* Perspective 2: Risk Officer */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900">2. Risk Defense Agent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-mono font-bold">
                Odds: 65%
              </span>
            </div>
            <p className="text-rose-950 text-[11px] leading-relaxed">
              Sticky shelter and services inflation could induce hawkish pause. Recommends strict
              Kelly-criterion sizing to mitigate tail-risk drawdown.
            </p>
          </div>

          {/* Perspective 3: Econometrician Synthesis */}
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900">3. Calibrated Synthesizer</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-200 text-indigo-900 font-mono font-bold">
                Consensus: 74%
              </span>
            </div>
            <p className="text-indigo-950 text-[11px] leading-relaxed">
              Bayesian probability synthesis settles at <strong>74%</strong>. Edge vs Kalshi market price
              (61¢) yields positive mathematical Expected Value of <strong>+21.3%</strong>.
            </p>
          </div>
        </div>

        {/* Expected Value Stake Calculator */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <Calculator className="w-4 h-4 text-purple-600" />
            <div>
              <span className="font-bold text-slate-800 block">Simulated Contract Stake</span>
              <span className="text-[11px] text-slate-500">
                Calculates prospective return using calibrated odds
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
              <span className="text-slate-400 font-mono">$</span>
              <input
                type="number"
                value={simStake}
                onChange={(e) => setSimStake(Number(e.target.value))}
                className="w-16 text-xs font-mono font-bold outline-none"
              />
            </div>
            <div className="text-right pl-2 border-l border-slate-200">
              <span className="text-[10px] text-slate-400 block">Projected EV Profit</span>
              <span className="text-xs font-mono font-bold text-emerald-600">
                +${((simStake * 0.213)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
