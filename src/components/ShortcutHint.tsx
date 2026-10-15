import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, X, Command, CornerDownLeft, Sparkles } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  macKeys?: string[];
  description: string;
  category?: 'edit' | 'nav' | 'view';
}

export const ShortcutHint: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [hasDismissedHint, setHasDismissedHint] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }
  }, []);

  // Listen for '?' key to toggle shortcuts and 'Escape' to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const shortcuts: ShortcutItem[] = [
    {
      keys: ['Ctrl', 'Z'],
      macKeys: ['⌘', 'Z'],
      description: 'Undo last change',
      category: 'edit',
    },
    {
      keys: ['Ctrl', 'Y'],
      macKeys: ['⌘', '⇧', 'Z'],
      description: 'Redo undone action',
      category: 'edit',
    },
    {
      keys: ['Esc'],
      description: 'Close sidebars & deselect',
      category: 'nav',
    },
    {
      keys: ['Ctrl', 'B'],
      macKeys: ['⌘', 'B'],
      description: 'Toggle Design Mode sidebar',
      category: 'nav',
    },
    {
      keys: ['Ctrl', 'K'],
      macKeys: ['⌘', 'K'],
      description: 'Filter block templates',
      category: 'nav',
    },
    {
      keys: ['P'],
      description: 'Toggle in-canvas preview',
      category: 'view',
    },
    {
      keys: ['Shift', 'P'],
      macKeys: ['⇧', 'P'],
      description: 'Full-screen live website modal',
      category: 'view',
    },
    {
      keys: ['Alt', '↑ / ↓'],
      description: 'Reorder selected section or group',
      category: 'edit',
    },
    {
      keys: ['Shift', 'Click'],
      macKeys: ['⇧', 'Click'],
      description: 'Multi-select multiple sections',
      category: 'edit',
    },
    {
      keys: ['Ctrl', 'D'],
      macKeys: ['⌘', 'D'],
      description: 'Duplicate selected group or section',
      category: 'edit',
    },
    {
      keys: ['Ctrl', 'C'],
      macKeys: ['⌘', 'C'],
      description: 'Copy block to Clipboard Manager',
      category: 'edit',
    },
    {
      keys: ['Ctrl', 'V'],
      macKeys: ['⌘', 'V'],
      description: 'Quick-paste block below selected',
      category: 'edit',
    },
    {
      keys: ['Shift', 'Ctrl', 'V'],
      macKeys: ['⇧', '⌘', 'V'],
      description: 'Open Clipboard Manager modal',
      category: 'edit',
    },
    {
      keys: ['Ctrl', 'H'],
      macKeys: ['⌘', 'H'],
      description: 'Revision History snapshots',
      category: 'nav',
    },
    {
      keys: ['Delete'],
      macKeys: ['⌫'],
      description: 'Delete selected section',
      category: 'edit',
    },
  ];

  return (
    <div ref={containerRef} className="relative select-none" id="canvas-shortcut-hint-widget">
      {/* Floating Popover Tooltip */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Keyboard Shortcuts"
          className="absolute bottom-full left-0 mb-2.5 w-80 bg-slate-900/95 text-white border border-slate-700/90 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Keyboard className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 leading-tight">Keyboard Shortcuts</h4>
                <p className="text-[10px] text-slate-400">Quick editor actions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              title="Close shortcuts tooltip (Esc)"
              aria-label="Close shortcuts tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Shortcut Items List */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {shortcuts.map((item, idx) => {
              const activeKeys = isMac && item.macKeys ? item.macKeys : item.keys;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-800/60 transition"
                >
                  <span className="text-slate-300 text-[11px] font-medium pr-2 truncate">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {activeKeys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-1.5 py-0.5 min-w-[20px] text-center text-[10px] font-mono font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              Press <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded font-mono text-slate-300">?</kbd> to toggle anytime
            </span>
            <span className="font-mono text-slate-500">{isMac ? 'macOS' : 'Windows'}</span>
          </div>
        </div>
      )}

      {/* Floating Corner Trigger Button */}
      <button
        type="button"
        id="canvas-shortcut-hint-button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/20 scale-105'
            : 'bg-slate-900/85 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-700/80 hover:border-slate-500 hover:scale-105'
        }`}
        title="View Keyboard Shortcuts (Press ? or Click)"
        aria-label="View Keyboard Shortcuts"
      >
        <Keyboard className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isOpen ? 'text-white' : 'text-blue-400'}`} />
        <span className="hidden sm:inline font-semibold text-[11px]">Shortcuts</span>
        <kbd
          className={`font-mono text-[10px] px-1.5 py-0.2 rounded border transition ${
            isOpen
              ? 'bg-blue-700 text-blue-100 border-blue-500'
              : 'bg-slate-800 text-slate-400 border-slate-700 group-hover:text-slate-200 group-hover:border-slate-600'
          }`}
        >
          {isMac ? '⌘' : 'Ctrl'}+Z / Esc
        </kbd>
      </button>
    </div>
  );
};
