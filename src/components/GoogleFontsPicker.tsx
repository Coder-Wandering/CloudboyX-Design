import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Type,
  Sparkles,
  Check,
  ExternalLink,
  Sliders,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SiteTheme } from '../types';

export interface GoogleFontItem {
  name: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';
  weights: string[];
  popularRank?: number;
  sampleText?: string;
  isBrandPreset?: boolean;
}

export const POPULAR_GOOGLE_FONTS: GoogleFontItem[] = [
  // CloudboyX Visionary Architect Brand Fonts
  {
    name: 'Space Grotesk',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700'],
    popularRank: 1,
    isBrandPreset: true,
  },
  {
    name: 'Plus Jakarta Sans',
    category: 'sans-serif',
    weights: ['400', '500', '600', '700', '800'],
    popularRank: 2,
    isBrandPreset: true,
  },
  {
    name: 'Syne',
    category: 'display',
    weights: ['400', '500', '600', '700', '800'],
    popularRank: 3,
    isBrandPreset: true,
  },
  {
    name: 'Outfit',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700'],
    popularRank: 4,
    isBrandPreset: true,
  },

  // Leading Sans-Serif
  {
    name: 'Inter',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700', '800'],
    popularRank: 5,
  },
  {
    name: 'Poppins',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700', '800'],
    popularRank: 6,
  },
  {
    name: 'Roboto',
    category: 'sans-serif',
    weights: ['300', '400', '500', '700'],
    popularRank: 7,
  },
  {
    name: 'Montserrat',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700', '800'],
    popularRank: 8,
  },
  {
    name: 'DM Sans',
    category: 'sans-serif',
    weights: ['400', '500', '700'],
    popularRank: 9,
  },
  {
    name: 'Manrope',
    category: 'sans-serif',
    weights: ['400', '500', '600', '700', '800'],
    popularRank: 10,
  },
  {
    name: 'Figtree',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700'],
    popularRank: 11,
  },
  {
    name: 'Open Sans',
    category: 'sans-serif',
    weights: ['300', '400', '600', '700'],
    popularRank: 12,
  },
  {
    name: 'Lato',
    category: 'sans-serif',
    weights: ['300', '400', '700'],
    popularRank: 13,
  },
  {
    name: 'Work Sans',
    category: 'sans-serif',
    weights: ['300', '400', '500', '600', '700'],
    popularRank: 14,
  },

  // Leading Serif & Editorial
  {
    name: 'Playfair Display',
    category: 'serif',
    weights: ['400', '500', '600', '700'],
    popularRank: 15,
  },
  {
    name: 'Cormorant Garamond',
    category: 'serif',
    weights: ['400', '500', '600', '700'],
    popularRank: 16,
  },
  {
    name: 'Cinzel',
    category: 'serif',
    weights: ['400', '600', '700'],
    popularRank: 17,
  },
  {
    name: 'Merriweather',
    category: 'serif',
    weights: ['300', '400', '700'],
    popularRank: 18,
  },
  {
    name: 'Lora',
    category: 'serif',
    weights: ['400', '500', '600'],
    popularRank: 19,
  },
  {
    name: 'Libre Baskerville',
    category: 'serif',
    weights: ['400', '700'],
    popularRank: 20,
  },
  {
    name: 'Bodoni Moda',
    category: 'serif',
    weights: ['400', '600', '700', '900'],
    popularRank: 21,
  },

  // Display & Expressive
  {
    name: 'Bebas Neue',
    category: 'display',
    weights: ['400'],
    popularRank: 22,
  },
  {
    name: 'Oswald',
    category: 'display',
    weights: ['400', '500', '600', '700'],
    popularRank: 23,
  },
  {
    name: 'Righteous',
    category: 'display',
    weights: ['400'],
    popularRank: 24,
  },
  {
    name: 'Abril Fatface',
    category: 'display',
    weights: ['400'],
    popularRank: 25,
  },

  // Monospace & Engineering
  {
    name: 'JetBrains Mono',
    category: 'monospace',
    weights: ['400', '500', '600', '700'],
    popularRank: 26,
  },
  {
    name: 'Fira Code',
    category: 'monospace',
    weights: ['400', '500', '600'],
    popularRank: 27,
  },
  {
    name: 'Space Mono',
    category: 'monospace',
    weights: ['400', '700'],
    popularRank: 28,
  },
  {
    name: 'Roboto Mono',
    category: 'monospace',
    weights: ['300', '400', '500', '700'],
    popularRank: 29,
  },

  // Handwriting & Creative
  {
    name: 'Caveat',
    category: 'handwriting',
    weights: ['400', '600', '700'],
    popularRank: 30,
  },
  {
    name: 'Dancing Script',
    category: 'handwriting',
    weights: ['400', '600', '700'],
    popularRank: 31,
  },
];

// Dynamically inject Google Fonts into host page so previews render true typefaces
export function loadGoogleFontInDocument(fontFamily: string) {
  if (!fontFamily || fontFamily === 'System') return;
  const safeId = `gf-link-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (!document.getElementById(safeId)) {
    const link = document.createElement('link');
    link.id = safeId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontFamily.replace(/\s+/g, '+')
    )}:wght@300;400;500;600;700;800&display=swap`;
    document.head.appendChild(link);
  }
}

interface GoogleFontsPickerProps {
  currentFont: string;
  currentHeadingFont?: string;
  onSelectFont: (font: string, headingFont?: string) => void;
  onApplyBrandPreset?: () => void;
}

export const GoogleFontsPicker: React.FC<GoogleFontsPickerProps> = ({
  currentFont,
  currentHeadingFont,
  onSelectFont,
  onApplyBrandPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewText, setPreviewText] = useState('Clarity Without Compromise');
  const [previewSize, setPreviewSize] = useState<number>(18);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load active fonts immediately
  useEffect(() => {
    if (currentFont) {
      loadGoogleFontInDocument(currentFont);
    }
    if (currentHeadingFont) {
      loadGoogleFontInDocument(currentHeadingFont);
    }
  }, [currentFont, currentHeadingFont]);

  // Preload top fonts for immediate responsive rendering
  useEffect(() => {
    POPULAR_GOOGLE_FONTS.slice(0, 8).forEach((font) => {
      loadGoogleFontInDocument(font.name);
    });
  }, []);

  // Filter fonts
  const filteredFonts = useMemo(() => {
    let list = POPULAR_GOOGLE_FONTS;

    if (selectedCategory === 'brand') {
      list = list.filter((f) => f.isBrandPreset);
    } else if (selectedCategory !== 'all') {
      list = list.filter((f) => f.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matched = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );

      // If user typed a custom font name not in curated list, offer it as a custom direct Google Font!
      const exactMatch = list.some((f) => f.name.toLowerCase() === q);
      if (!exactMatch && searchQuery.length >= 3) {
        const customItem: GoogleFontItem = {
          name: searchQuery
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' '),
          category: 'sans-serif',
          weights: ['400', '600', '700'],
        };
        return [customItem, ...matched];
      }

      return matched;
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const handleFontHover = (fontName: string) => {
    if (!loadedFonts.has(fontName)) {
      loadGoogleFontInDocument(fontName);
      setLoadedFonts((prev) => new Set(prev).add(fontName));
    }
  };

  const handleSelect = (fontName: string) => {
    loadGoogleFontInDocument(fontName);
    onSelectFont(fontName);
  };

  return (
    <div className="space-y-4">
      {/* Visionary Architect Brand Preset Banner */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl border border-slate-700/60 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/40 rounded-full font-bold">
                Brand Preset
              </span>
              <span className="text-xs font-bold tracking-tight text-white">
                The Visionary Architect
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              <strong className="text-indigo-300">Space Grotesk</strong> headings &bull;{' '}
              <strong className="text-indigo-300">Plus Jakarta Sans</strong> body &bull; Obsidian Jet
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onApplyBrandPreset && (
              <button
                type="button"
                onClick={onApplyBrandPreset}
                className="px-3 py-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Full Brand</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectFont('Plus Jakarta Sans', 'Space Grotesk')}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-lg transition shrink-0"
            >
              Use Fonts
            </button>
          </div>
        </div>
      </div>

      {/* Live Search & Custom Font Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Google Fonts (e.g. Space Grotesk, Syne, Outfit, Inter)..."
          className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Fonts' },
          { id: 'brand', label: '★ Brand Presets' },
          { id: 'sans-serif', label: 'Sans-Serif' },
          { id: 'serif', label: 'Serif' },
          { id: 'display', label: 'Display' },
          { id: 'monospace', label: 'Monospace' },
          { id: 'handwriting', label: 'Handwriting' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-xs ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preview Text Input & Size Controls */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Live Typography Preview</span>
          <div className="flex items-center gap-2">
            <span>Size: {previewSize}px</span>
            <input
              type="range"
              min="14"
              max="32"
              value={previewSize}
              onChange={(e) => setPreviewSize(Number(e.target.value))}
              className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Custom preview sentence..."
          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 outline-none focus:border-blue-400"
        />
      </div>

      {/* Font Cards Grid */}
      <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
        {filteredFonts.map((font) => {
          const isSelected = currentFont === font.name;
          const isHeadingSelected = currentHeadingFont === font.name;

          return (
            <div
              key={font.name}
              onMouseEnter={() => handleFontHover(font.name)}
              className={`p-3 rounded-xl border transition group ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{font.name}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    {font.category}
                  </span>
                  {font.isBrandPreset && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Visionary Architect
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectFont(currentFont, font.name)}
                    title="Set as Headings Font (h1-h6)"
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border transition ${
                      isHeadingSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isHeadingSelected ? 'Heading Font ✓' : 'Set as Heading'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect(font.name)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Active Body</span>
                      </>
                    ) : (
                      <span>Apply</span>
                    )}
                  </button>
                </div>
              </div>

              {/* True Font Live Preview */}
              <div
                style={{
                  fontFamily: `'${font.name}', sans-serif`,
                  fontSize: `${previewSize}px`,
                }}
                className="text-slate-800 leading-snug truncate py-1 tracking-normal transition-all"
              >
                {previewText || 'The quick brown fox jumps over the lazy dog'}
              </div>

              {/* Weights badge info */}
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Weights: {font.weights.join(', ')}</span>
                <span className="text-slate-300">&bull;</span>
                <a
                  href={`https://fonts.google.com/specimen/${encodeURIComponent(font.name.replace(/\s+/g, '+'))}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-600 flex items-center gap-0.5 text-slate-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Google Fonts spec</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Typography Status Summary */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
        <div className="flex items-center justify-between text-slate-700 font-medium">
          <span>Active Body Typeface:</span>
          <span className="font-bold text-blue-700">{currentFont}</span>
        </div>
        {currentHeadingFont && (
          <div className="flex items-center justify-between text-slate-700 font-medium">
            <span>Active Headings Typeface:</span>
            <span className="font-bold text-indigo-700">{currentHeadingFont}</span>
          </div>
        )}
        <p className="text-[11px] text-slate-400 pt-1">
          Direct Google Fonts CDN link automatically injected into HTML exports, live iframe, and production build.
        </p>
      </div>
    </div>
  );
};
