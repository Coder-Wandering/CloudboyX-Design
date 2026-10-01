import React from 'react';
import { Sun, Moon } from 'lucide-react';

export interface ThemeToggleSwitchProps {
  themeMode: 'light' | 'dark';
  onToggle: () => void;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  themeMode,
  onToggle,
  showLabel = true,
  className = '',
  size = 'md',
}) => {
  const isDark = themeMode === 'dark';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle();
    }
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      title={`Theme: ${isDark ? 'Dark Mode' : 'Light Mode'} • Click to switch to ${
        isDark ? 'Light' : 'Dark'
      } theme`}
    >
      {showLabel && (
        <span
          className={`text-xs font-semibold tracking-tight transition-colors hidden xl:inline ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Toggle light and dark theme. Current is ${themeMode}`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 ${
          isSmall ? 'w-12 h-6.5 p-0.5' : 'w-14 h-7.5 p-1'
        } ${
          isDark
            ? 'bg-[#0b0f19] border border-slate-700/90 ring-offset-[#0b0f19] shadow-inner'
            : 'bg-slate-200 hover:bg-slate-300 border border-slate-300/80 ring-offset-white shadow-inner'
        }`}
      >
        {/* Track Fixed Background Icons */}
        <span
          aria-hidden="true"
          className={`absolute left-1.5 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
            isDark ? 'opacity-30 text-amber-500/70' : 'opacity-80 text-amber-600'
          }`}
        >
          <Sun className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </span>

        <span
          aria-hidden="true"
          className={`absolute right-1.5 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${
            isDark ? 'opacity-90 text-cyan-400' : 'opacity-35 text-slate-400'
          }`}
        >
          <Moon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </span>

        {/* Sliding Thumb Knob */}
        <span
          aria-hidden="true"
          className={`inline-flex items-center justify-center rounded-full shadow-md transform transition-all duration-200 ease-out pointer-events-none ${
            isSmall ? 'w-5 h-5' : 'w-5.5 h-5.5'
          } ${
            isDark
              ? isSmall
                ? 'translate-x-5.5 bg-slate-800 text-cyan-400 border border-slate-600 shadow-slate-950/80'
                : 'translate-x-6.5 bg-slate-800 text-cyan-400 border border-slate-600 shadow-slate-950/80'
              : 'translate-x-0 bg-white text-amber-500 border border-slate-200 shadow-slate-400/30'
          }`}
        >
          {isDark ? (
            <Moon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          ) : (
            <Sun className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          )}
        </span>
      </button>
    </div>
  );
};
