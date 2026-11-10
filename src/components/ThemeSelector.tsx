import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles, Share2 } from 'lucide-react';
import { DesignThemeId } from '../types';
import { THEMES } from '../lib/themes';

interface ThemeSelectorProps {
  currentTheme: DesignThemeId;
  onSelectTheme: (themeId: DesignThemeId) => void;
  onShareCurrentTheme?: () => void;
}

export function ThemeSelector({
  currentTheme,
  onSelectTheme,
  onShareCurrentTheme,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const active = THEMES[currentTheme];

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-stone-200/80 bg-white/80 hover:bg-white text-stone-700 hover:text-stone-900 shadow-xs transition-all cursor-pointer backdrop-blur-xs focus-visible:ring-2 focus-visible:ring-stone-400"
        title="Personal Aesthetic Theme (not shared with partner)"
        aria-label="Select personal design theme"
      >
        <Palette className="w-3.5 h-3.5 text-stone-500" />
        <span className="flex items-center gap-1.5">
          <span>{active.icon}</span>
          <span className="font-semibold">{active.name}</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200/80 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
            <div>
              <p className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                Personal Theme
              </p>
              <p className="text-[11px] text-stone-500">
                Shown only to you — partner keeps their own choice.
              </p>
            </div>
          </div>

          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {Object.values(THEMES).map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-stone-100 text-stone-900 font-medium'
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg shrink-0">{theme.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{theme.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{theme.subtitle}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-stone-900 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Share my theme button */}
          {onShareCurrentTheme && (
            <div className="pt-2 mt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  onShareCurrentTheme();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-300" />
                Share My Theme with Partner
              </button>
              <p className="text-[10px] text-stone-400 text-center mt-1">
                Suggests your theme to your partner privately
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
