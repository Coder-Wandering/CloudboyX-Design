import React, { useState } from 'react';
import {
  Play,
  Clock,
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Video,
  X,
  Volume2,
} from 'lucide-react';
import { VIDEO_TUTORIALS } from '../../data/agencyTutorials';
import { VideoTutorial } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const VideoTutorialsTab: React.FC = () => {
  const { agencyBranding } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeVideo, setActiveVideo] = useState<VideoTutorial | null>(null);

  const categories = ['All', 'Getting Started', 'Editing & Content', 'Mobile Layouts', 'Analytics & SEO', 'Billing & Invoices'];

  const filteredTutorials = VIDEO_TUTORIALS.filter((v) => {
    const matchesCat = activeCategory === 'All' || v.category === activeCategory;
    const matchesQuery =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              White-Label Academy
            </span>
            <span className="text-xs text-slate-400">
              {agencyBranding.agencyName} Client Resource Library
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Video Guides & Onboarding Library
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Watch short, step-by-step video walkthroughs on how to manage your website copy, replace photography, test mobile responsiveness, and understand traffic stats.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
          <Video className="w-4 h-4 text-indigo-400" />
          <span>{VIDEO_TUTORIALS.length} Video Lessons Available</span>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tut) => (
          <div
            key={tut.id}
            onClick={() => setActiveVideo(tut)}
            className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-sm transition group cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container */}
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <img
                  src={tut.thumbnailUrl}
                  alt={tut.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-indigo-500 transition">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Duration & Category Badges */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px]">
                  <span className="bg-slate-950/90 backdrop-blur-xs text-indigo-300 font-semibold px-2 py-0.5 rounded border border-slate-800">
                    {tut.category}
                  </span>
                  <span className="bg-slate-950/90 backdrop-blur-xs text-white font-mono px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{tut.duration}</span>
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5">
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition line-clamp-1 mb-1.5">
                  {tut.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                  {tut.description}
                </p>

                {/* Step Preview Checklist */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                  {tut.steps.slice(0, 2).map((step, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-400 line-clamp-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-slate-800/60 mt-2">
              <button
                type="button"
                className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play Tutorial</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {activeVideo.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Duration: {activeVideo.duration}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{activeVideo.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Display */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnailUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            {/* Guide Step Checklist & Summary */}
            <div className="p-5 bg-slate-950 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Key Video Steps & Takeaways
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {activeVideo.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
