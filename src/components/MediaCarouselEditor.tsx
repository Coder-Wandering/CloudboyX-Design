import React, { useState, useRef } from 'react';
import {
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Play,
  Upload,
  Sparkles,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Settings2,
} from 'lucide-react';
import { BlockInstance } from '../types';

export interface CarouselSlideItem {
  id: string;
  type: 'video' | 'image';
  url: string;
  poster?: string;
  title?: string;
  caption?: string;
  badge?: string;
}

interface MediaCarouselEditorProps {
  block: BlockInstance;
  onUpdateContent: (content: Partial<BlockInstance['content']>) => void;
  onUpdateSettings: (settings: Partial<BlockInstance['settings']>) => void;
  isDark?: boolean;
}

const SAMPLE_PRESETS = [
  {
    label: 'Big Buck Bunny (MP4)',
    type: 'video' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
    title: 'High-Definition Video Experience',
    caption: 'Native HTML5 MP4 streaming with responsive aspect ratio containment.',
    badge: 'HTML5 Video',
  },
  {
    label: 'Modern Developer Studio (Photo)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    poster: '',
    title: 'Modern Creative Workspace',
    caption: 'High-resolution photography with backdrop-filter glass caption styling.',
    badge: 'Photo Slide',
  },
  {
    label: 'YouTube Video Embed',
    type: 'video' as const,
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    title: 'Embedded YouTube Stream',
    caption: 'Frame external cloud video streams without layout shift or player errors.',
    badge: 'YouTube Embed',
  },
  {
    label: 'Architecture Digest (Photo)',
    type: 'image' as const,
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    poster: '',
    title: 'Architectural Innovation',
    caption: 'Dynamic visual presence built for mobile, tablet, and desktop screens.',
    badge: 'Architecture',
  },
];

export const MediaCarouselEditor: React.FC<MediaCarouselEditorProps> = ({
  block,
  onUpdateContent,
  onUpdateSettings,
  isDark = true,
}) => {
  const content = block.content || {};
  const settings = block.settings || {};

  // Extract slides array, fallback to default 2 slides if missing
  const rawSlides: CarouselSlideItem[] = Array.isArray(content.slides) && content.slides.length > 0
    ? content.slides
    : [
        {
          id: 'slide-1',
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          poster: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80',
          title: 'High-Definition Video Experience',
          caption: 'Native HTML5 video playback with responsive aspect ratio containment and smooth controls.',
          badge: 'HTML5 Video',
        },
        {
          id: 'slide-2',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
          poster: '',
          title: 'Modern Creative Workspace',
          caption: 'High-resolution responsive imagery with rich typography and backdrop blur caption overlays.',
          badge: 'Photo Slide',
        },
      ];

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const safeIndex = Math.min(Math.max(0, activeSlideIndex), rawSlides.length - 1);
  const currentSlide = rawSlides[safeIndex] || rawSlides[0];

  const updateSlides = (newSlides: CarouselSlideItem[]) => {
    onUpdateContent({
      slides: newSlides,
    });
  };

  const handleUpdateCurrentSlide = (patch: Partial<CarouselSlideItem>) => {
    const updated = [...rawSlides];
    updated[safeIndex] = {
      ...updated[safeIndex],
      ...patch,
    };
    updateSlides(updated);
  };

  const handleAddSlide = (type: 'video' | 'image') => {
    const newSlide: CarouselSlideItem = {
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      url:
        type === 'video'
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      poster: type === 'video' ? 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80' : '',
      title: type === 'video' ? 'New Video Slide' : 'New Image Slide',
      caption: 'Add compelling description or subtitle text here.',
      badge: type === 'video' ? 'Video' : 'Photo',
    };

    const updated = [...rawSlides, newSlide];
    updateSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (rawSlides.length <= 1) return;
    const updated = rawSlides.filter((_, i) => i !== index);
    updateSlides(updated);
    setActiveSlideIndex(Math.max(0, index - 1));
  };

  const handleDuplicateSlide = (index: number) => {
    const target = rawSlides[index];
    const cloned: CarouselSlideItem = {
      ...target,
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title || 'Slide'} (Copy)`,
    };
    const updated = [...rawSlides];
    updated.splice(index + 1, 0, cloned);
    updateSlides(updated);
    setActiveSlideIndex(index + 1);
  };

  const handleMoveSlide = (from: number, to: number) => {
    if (to < 0 || to >= rawSlides.length) return;
    const updated = [...rawSlides];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    updateSlides(updated);
    setActiveSlideIndex(to);
  };

  const handleFileUpload = (file: File, isPoster = false) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      if (dataUri) {
        if (isPoster) {
          handleUpdateCurrentSlide({ poster: dataUri });
        } else {
          handleUpdateCurrentSlide({ url: dataUri });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="media-carousel-editor"
      data-testid="media-carousel-editor"
      className={`rounded-2xl border p-4 space-y-4 shadow-xs text-xs transition-colors duration-200 ${
        isDark ? 'bg-slate-900/90 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, false);
          e.target.value = '';
        }}
      />
      <input
        ref={posterInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, true);
          e.target.value = '';
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs leading-tight">Media Carousel Manager</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Manage video and image slides, controls, autoplay, and captions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-add-video-slide"
            onClick={() => handleAddSlide('video')}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
            title="Add a new video slide"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>+ Video</span>
          </button>
          <button
            type="button"
            id="btn-add-image-slide"
            onClick={() => handleAddSlide('image')}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
            title="Add a new photo slide"
          >
            <ImageIcon className="w-3 h-3" />
            <span>+ Image</span>
          </button>
        </div>
      </div>

      {/* Slide Navigation Rail / Thumbnail Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Slides in Carousel ({rawSlides.length})
          </label>
          <span className="text-[10px] text-slate-500">Click to select active slide</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {rawSlides.map((slide, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setActiveSlideIndex(idx)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left shrink-0 transition cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-blue-600/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30'
                      : 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                    : isDark
                    ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                    slide.type === 'video'
                      ? 'bg-blue-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {slide.type === 'video' ? '▶' : '🖼'}
                </span>
                <span className="font-semibold text-xs truncate max-w-[110px]">
                  #{idx + 1} {slide.title || (slide.type === 'video' ? 'Video' : 'Image')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Slide Editor Card */}
      {currentSlide && (
        <div
          className={`p-3.5 rounded-xl border space-y-3 ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          {/* Slide Action Bar (Reorder, Duplicate, Delete) */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Slide #{safeIndex + 1} Configuration
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                  currentSlide.type === 'video'
                    ? 'bg-blue-500/20 text-blue-600 dark:text-cyan-400'
                    : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {currentSlide.type}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMoveSlide(safeIndex, safeIndex - 1)}
                disabled={safeIndex === 0}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                title="Move slide left / up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveSlide(safeIndex, safeIndex + 1)}
                disabled={safeIndex === rawSlides.length - 1}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                title="Move slide right / down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDuplicateSlide(safeIndex)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 cursor-pointer"
                title="Duplicate slide"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlide(safeIndex)}
                disabled={rawSlides.length <= 1}
                className="p-1 rounded-md text-rose-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                title="Delete slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Media Type Switcher: Video vs Image */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Media Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateCurrentSlide({ type: 'video' })}
                className={`py-1.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  currentSlide.type === 'video'
                    ? isDark
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Video (MP4 / YouTube)</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateCurrentSlide({ type: 'image' })}
                className={`py-1.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  currentSlide.type === 'image'
                    ? isDark
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image (JPG / PNG / WebP)</span>
              </button>
            </div>
          </div>

          {/* Media URL Input & Upload Action */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {currentSlide.type === 'video' ? 'Video File or Embed URL' : 'Image URL'}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Local File</span>
              </button>
            </div>
            <input
              type="text"
              value={currentSlide.url || ''}
              onChange={(e) => handleUpdateCurrentSlide({ url: e.target.value })}
              placeholder={currentSlide.type === 'video' ? 'https://example.com/video.mp4 or YouTube URL' : 'https://images.unsplash.com/...'}
              className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-cyan-500'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Poster Image URL (If Video) */}
          {currentSlide.type === 'video' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Video Poster Image (Thumbnail before play)
                </label>
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Poster</span>
                </button>
              </div>
              <input
                type="text"
                value={currentSlide.poster || ''}
                onChange={(e) => handleUpdateCurrentSlide({ poster: e.target.value })}
                placeholder="https://images.unsplash.com/poster.jpg"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono transition focus:outline-hidden ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-cyan-500'
                    : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                }`}
              />
            </div>
          )}

          {/* Slide Caption Fields: Badge, Title, Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Slide Badge / Tag
              </label>
              <input
                type="text"
                value={currentSlide.badge || ''}
                onChange={(e) => handleUpdateCurrentSlide({ badge: e.target.value })}
                placeholder="e.g. Featured Demo"
                className={`w-full px-3 py-1.5 rounded-xl border text-xs transition focus:outline-hidden ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Slide Title
              </label>
              <input
                type="text"
                value={currentSlide.title || ''}
                onChange={(e) => handleUpdateCurrentSlide({ title: e.target.value })}
                placeholder="e.g. Modern Developer Workspaces"
                className={`w-full px-3 py-1.5 rounded-xl border text-xs font-semibold transition focus:outline-hidden ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Slide Description / Caption
            </label>
            <textarea
              rows={2}
              value={currentSlide.caption || ''}
              onChange={(e) => handleUpdateCurrentSlide({ caption: e.target.value })}
              placeholder="Descriptive subtitle or narration for this slide..."
              className={`w-full px-3 py-2 rounded-xl border text-xs resize-none transition focus:outline-hidden ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Quick Presets Picker */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              1-Click Sample Media Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    handleUpdateCurrentSlide({
                      type: preset.type,
                      url: preset.url,
                      poster: preset.poster,
                      title: preset.title,
                      caption: preset.caption,
                      badge: preset.badge,
                    })
                  }
                  className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <span className="font-semibold text-[11px] truncate">{preset.label}</span>
                  <span className="text-[9px] text-slate-400 uppercase mt-0.5">{preset.type}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Carousel Playback & Layout Controls */}
      <div
        className={`p-3.5 rounded-xl border space-y-3 ${
          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <Settings2 className="w-3.5 h-3.5 text-blue-500" />
          <h4 className="font-bold text-xs">Carousel Playback &amp; Layout Settings</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Aspect Ratio */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Aspect Ratio
            </label>
            <select
              value={settings.aspectRatio || '16x9'}
              onChange={(e) => onUpdateSettings({ aspectRatio: e.target.value })}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition focus:outline-hidden cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="16x9">16:9 (Standard Widescreen)</option>
              <option value="4x3">4:3 (Classic Video)</option>
              <option value="21x9">21:9 (Cinematic Ultrawide)</option>
              <option value="1x1">1:1 (Square Showcase)</option>
            </select>
          </div>

          {/* Autoplay Interval */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Slide Speed (ms)
            </label>
            <select
              value={settings.carouselInterval || 5000}
              onChange={(e) => onUpdateSettings({ carouselInterval: Number(e.target.value) })}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition focus:outline-hidden cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value={3000}>3 seconds (Fast)</option>
              <option value={5000}>5 seconds (Standard)</option>
              <option value={8000}>8 seconds (Relaxed)</option>
              <option value={10000}>10 seconds (Slow)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.carouselAutoplay !== false}
              onChange={(e) => onUpdateSettings({ carouselAutoplay: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs font-medium">Autoplay Slides</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.carouselIndicators !== false}
              onChange={(e) => onUpdateSettings({ carouselIndicators: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs font-medium">Show Indicator Dots</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.carouselControls !== false}
              onChange={(e) => onUpdateSettings({ carouselControls: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs font-medium">Show Prev/Next Arrows</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.carouselPauseOnHover !== false}
              onChange={(e) => onUpdateSettings({ carouselPauseOnHover: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="text-xs font-medium">Pause on Hover</span>
          </label>
        </div>
      </div>
    </div>
  );
};
