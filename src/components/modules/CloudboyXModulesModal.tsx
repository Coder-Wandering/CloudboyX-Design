import React, { useState } from 'react';
import {
  X,
  Cpu,
  ShieldAlert,
  Webhook,
  Brain,
  History,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ErpGatewayModule } from './ErpGatewayModule';
import { MapProtectionModule } from './MapProtectionModule';
import { ConnectModule } from './ConnectModule';
import { PredictModule } from './PredictModule';
import { BrandTimelineModule } from './BrandTimelineModule';

export type CloudboyXModuleId = 'erp' | 'map' | 'connect' | 'predict' | 'brand';

interface CloudboyXModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule?: CloudboyXModuleId;
  onApplyTheme?: () => void;
}

export const CloudboyXModulesModal: React.FC<CloudboyXModulesModalProps> = ({
  isOpen,
  onClose,
  initialModule = 'erp',
  onApplyTheme,
}) => {
  const [activeModule, setActiveModule] = useState<CloudboyXModuleId>(initialModule);

  if (!isOpen) return null;

  const MODULE_TABS = [
    {
      id: 'erp' as const,
      label: 'AI ERP Gateway',
      url: 'https://cloudboyx-erp.ai.studio',
      icon: <Cpu className="w-4 h-4 text-blue-500" />,
      badge: 'Operational',
    },
    {
      id: 'map' as const,
      label: 'Map Protection',
      url: 'https://map-protection-scanner.ai.studio',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
      badge: '98.4% MAP',
    },
    {
      id: 'connect' as const,
      label: 'CloudboyX Connect',
      url: 'https://cloudboyx.ai.studio',
      icon: <Webhook className="w-4 h-4 text-indigo-500" />,
      badge: '$1,000 Bankroll',
    },
    {
      id: 'predict' as const,
      label: 'CloudboyX Predict',
      url: 'https://cloudboyx.ai.studio/',
      icon: <Brain className="w-4 h-4 text-purple-500" />,
      badge: '+18.4% EV',
    },
    {
      id: 'brand' as const,
      label: 'Brand Evolution Timeline',
      icon: <History className="w-4 h-4 text-amber-500" />,
      badge: 'Visionary Architect',
    },
  ];

  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.getAttribute('data-bs-theme') === 'dark');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-5xl h-[92vh] max-h-[900px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header Bar */}
        <div className={`p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-900 text-white'
            }`}>
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  CloudboyX Enterprise Infrastructure Suite
                </h3>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-blue-950 text-blue-300 border-blue-800' : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  4 Connected Custom Modules
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Connected data, brand protection, Webhook/EDI gateway, and prediction pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Module Switcher Tabs */}
        <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto shrink-0 text-xs transition-colors ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {MODULE_TABS.map((tab) => {
            const isSelected = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModule(tab.id)}
                className={`px-3 py-2 rounded-xl font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                      : 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-100 text-slate-700'
                      : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-colors ${
          isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50/50 text-slate-900'
        }`}>
          {activeModule === 'erp' && <ErpGatewayModule />}
          {activeModule === 'map' && <MapProtectionModule />}
          {activeModule === 'connect' && <ConnectModule />}
          {activeModule === 'predict' && <PredictModule />}
          {activeModule === 'brand' && <BrandTimelineModule onApplyTheme={onApplyTheme} />}
        </div>
      </div>
    </div>
  );
};
