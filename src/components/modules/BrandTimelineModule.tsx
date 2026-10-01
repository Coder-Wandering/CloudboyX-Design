import React from 'react';
import {
  Sparkles,
  Calendar,
  Layers,
  Palette,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface BrandTimelineModuleProps {
  onApplyTheme?: () => void;
}

export const BrandTimelineModule: React.FC<BrandTimelineModuleProps> = ({ onApplyTheme }) => {
  const TIMELINE_EVENTS = [
    {
      quarter: '2023 Q1',
      title: 'Founding & CloudboyX Genesis',
      category: 'Founding & Genesis',
      overview:
        'Launched CloudboyX to transform traditional developer infrastructure and AI ecosystems through precision engineering and dedicated craftsmanship.',
      visualShift: 'Initial monolithic logo paired with sharp typography guidelines.',
      milestone: 'Initial release launched with pure organic market reach.',
      isPast: true,
      color: 'bg-blue-600',
    },
    {
      quarter: '2024 Q3',
      title: 'The Visionary Architect Identity Architecture',
      category: 'Identity Shift & Rebrand',
      overview:
        "Structured CloudboyX's refined aesthetic, combining Space Grotesk layout structures alongside Plus Jakarta Sans and our Obsidian Jet themes.",
      visualShift: 'Standardized 5-tone color hierarchy with proportional typographic sizing.',
      milestone: 'Deployed consistently across all digital and print platforms.',
      isPast: true,
      highlight: true,
      color: 'bg-indigo-600',
    },
    {
      quarter: '2025 Q2',
      title: 'Ecosystem Expansion & Scale',
      category: 'Flagship Launch',
      overview:
        'Broadened solutions across enterprise and high-end markets, positioning CloudboyX as the premier platform in AI developer infrastructure.',
      visualShift: 'Embedded dynamic branding components and scalable asset marks.',
      milestone: '300% annual expansion in platform usage.',
      isPast: true,
      color: 'bg-purple-600',
    },
    {
      quarter: '2026+',
      title: 'Next-Gen Horizon & Global Benchmark',
      category: 'Future Horizon & Vision',
      overview:
        'Driving automated workflow intelligence and scalable tools to shape the next phase of AI developer infrastructure.',
      visualShift: 'Seamless user experience paired with premium visual assets.',
      milestone: 'Positioning for worldwide platform market leadership.',
      isFuture: true,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Narrative Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Brand Evolution & Narrative Architecture
              </span>
              <span className="text-[11px] text-slate-400">Generated: 9/15/2026</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>CloudboyX &bull; Clarity Without Compromise</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Archetype: <strong className="text-indigo-300">The Visionary Architect</strong>. A
              multi-year lineage of architectural rigor, precision typography, and unified developer
              infrastructure.
            </p>
          </div>

          {onApplyTheme && (
            <button
              type="button"
              onClick={onApplyTheme}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5 shrink-0 self-start md:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Visionary Architect Theme</span>
            </button>
          )}
        </div>

        {/* 5-Tone Color Hierarchy & Type Specs */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Display Typography</span>
            <span className="text-sm font-bold text-white font-mono">Space Grotesk</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Body Typography</span>
            <span className="text-sm font-bold text-white font-mono">Plus Jakarta Sans</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Primary Obsidian</span>
            <span className="text-sm font-bold text-indigo-300 font-mono">#0b0f19</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Brand Archetype</span>
            <span className="text-sm font-bold text-emerald-400">Visionary Architect</span>
          </div>
        </div>
      </div>

      {/* Visual Timeline Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>Strategic Milestones & Identity Architecture Timeline</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
          {TIMELINE_EVENTS.map((event, idx) => (
            <div key={event.quarter} className="relative group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                  event.color
                } ${event.highlight ? 'ring-4 ring-indigo-200' : ''}`}
              />

              <div
                className={`p-5 rounded-2xl border transition ${
                  event.highlight
                    ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-slate-900 text-white">
                      {event.quarter}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">
                    {event.category}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">{event.overview}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Visual Identity Shift:
                    </span>
                    <span className="text-slate-800 text-[11px]">{event.visualShift}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Key Milestone:
                    </span>
                    <span className="text-slate-800 text-[11px] font-medium text-emerald-700">
                      {event.milestone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
