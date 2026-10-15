import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Layers,
  Sparkles,
  Command,
  CornerDownLeft,
  LayoutTemplate,
  Code2,
  FileText,
  CreditCard,
  PanelBottom,
  Menu,
  MessageSquareQuote,
  Users,
  Image as ImageIcon,
  Mail,
  Waves,
} from 'lucide-react';
import { BlockInstance, BlockCategory } from '../types';

interface GlobalBlockSearchProps {
  blocks: BlockInstance[];
  onSelectBlock: (blockId: string) => void;
  selectedBlockId?: string | null;
  isDark?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  html: Code2,
  headers: LayoutTemplate,
  navbars: Menu,
  features: Layers,
  content: FileText,
  dividers: Waves,
  pricing: CreditCard,
  footers: PanelBottom,
  testimonials: MessageSquareQuote,
  team: Users,
  gallery: ImageIcon,
  forms: Mail,
};

interface SearchMatch {
  block: BlockInstance;
  index: number;
  matchField: string;
  matchSnippet: string;
}

export const GlobalBlockSearch: React.FC<GlobalBlockSearchProps> = ({
  blocks,
  onSelectBlock,
  selectedBlockId,
  isDark = false,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global hotkey Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // If query is empty, show all blocks in canvas order
      return blocks.map((b, idx) => ({
        block: b,
        index: idx,
        matchField: 'Canvas Position',
        matchSnippet: b.settings?.containerWidth || 'Section',
      }));
    }

    const matches: SearchMatch[] = [];

    blocks.forEach((block, index) => {
      const name = (block.name || '').toLowerCase();
      const type = (block.type || '').toLowerCase();
      const cat = (block.category || '').toLowerCase();

      // 1. Direct name match
      if (name.includes(q)) {
        matches.push({
          block,
          index,
          matchField: 'Block Title',
          matchSnippet: block.name,
        });
        return;
      }

      // 2. Category / Type match
      if (cat.includes(q) || type.includes(q)) {
        matches.push({
          block,
          index,
          matchField: 'Category / Type',
          matchSnippet: `${block.category} · ${block.type}`,
        });
        return;
      }

      // 3. Search inner content strings
      let contentMatchFound = false;
      const scanContent = (obj: any): boolean => {
        if (!obj || typeof obj !== 'object') return false;
        for (const [key, val] of Object.entries(obj)) {
          if (typeof val === 'string' && val.toLowerCase().includes(q)) {
            matches.push({
              block,
              index,
              matchField: key.replace(/([A-Z])/g, ' $1'),
              matchSnippet: val.length > 70 ? val.substring(0, 70) + '...' : val,
            });
            contentMatchFound = true;
            return true;
          }
          if (typeof val === 'object' && val !== null) {
            if (scanContent(val)) return true;
          }
        }
        return false;
      };

      scanContent(block.content);

      // 4. Custom code match
      if (!contentMatchFound) {
        if (block.customHtml && block.customHtml.toLowerCase().includes(q)) {
          matches.push({
            block,
            index,
            matchField: 'Custom HTML Code',
            matchSnippet: 'Found keyword in custom HTML code block',
          });
        }
      }
    });

    return matches;
  }, [blocks, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  const handleSelect = (blockId: string) => {
    onSelectBlock(blockId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelect(searchResults[selectedIndex].block.id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative z-30" id="global-block-search-container">
      {/* Search Input Box */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all ${
          isOpen
            ? isDark
              ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-md'
            : isDark
            ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-300'
            : 'bg-slate-50 hover:bg-white border-slate-200/90 text-slate-700 shadow-2xs'
        }`}
      >
        <Search className={`w-3.5 h-3.5 shrink-0 ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="text"
          id="input-global-block-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Find & jump to block..."
          className={`w-28 sm:w-36 md:w-44 text-xs bg-transparent outline-none truncate font-medium ${
            isDark ? 'placeholder:text-slate-500 text-slate-100' : 'placeholder:text-slate-400 text-slate-900'
          }`}
          aria-label="Search canvas blocks"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd
            className={`hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              isDark
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span className="text-[9px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Dropdown Results Overlay */}
      {isOpen && (
        <div
          id="global-block-search-results"
          className={`absolute left-0 mt-1.5 w-72 sm:w-84 max-h-96 overflow-y-auto rounded-2xl border shadow-xl p-1.5 space-y-1 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Header Status */}
          <div className="px-2.5 py-1.5 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold">
              {query ? `Found ${searchResults.length} matches` : `All ${blocks.length} sections in canvas`}
            </span>
            <span className="text-[10px] hidden sm:inline">Use ↑↓ to navigate, ↵ to jump</span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-slate-500">No blocks found matching "{query}"</p>
              <div className="text-[11px] text-slate-400">
                Try searching: <span className="font-semibold text-blue-500">Hero</span>,{' '}
                <span className="font-semibold text-blue-500">Pricing</span>,{' '}
                <span className="font-semibold text-blue-500">Divider</span>,{' '}
                <span className="font-semibold text-blue-500">Navbar</span>
              </div>
            </div>
          ) : (
            <div className="py-1 space-y-0.5">
              {searchResults.map((match, idx) => {
                const isItemActive = idx === selectedIndex;
                const isCurrentlySelectedInCanvas = match.block.id === selectedBlockId;
                const IconComponent = CATEGORY_ICONS[match.block.category] || Layers;

                return (
                  <button
                    key={match.block.id}
                    type="button"
                    onClick={() => handleSelect(match.block.id)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition flex items-center justify-between gap-2.5 cursor-pointer ${
                      isItemActive
                        ? isDark
                          ? 'bg-blue-950/70 border border-blue-800/80 text-white'
                          : 'bg-blue-50/90 border border-blue-200 text-blue-950'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800/50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {/* Section Index badge */}
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                          isCurrentlySelectedInCanvas
                            ? 'bg-blue-600 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{match.index + 1}
                      </span>

                      {/* Icon */}
                      <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>

                      {/* Title & match preview */}
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">
                            {match.block.name || match.block.type}
                          </span>
                          <span className="text-[9.5px] uppercase font-semibold px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-500">
                            {match.block.category}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-75 truncate text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {match.matchField}:
                          </span>{' '}
                          {match.matchSnippet}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center text-slate-400">
                      {isItemActive && <CornerDownLeft className="w-3 h-3 text-blue-500 animate-pulse" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
