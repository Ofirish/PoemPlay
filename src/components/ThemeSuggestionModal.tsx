import { X, Palette, Sparkles, Check } from 'lucide-react';
import { ThemeSuggestion, DesignThemeId } from '../types';
import { THEMES } from '../lib/themes';

interface ThemeSuggestionModalProps {
  suggestion: ThemeSuggestion | null;
  onAccept: (themeId: DesignThemeId) => void;
  onDecline: () => void;
}

export function ThemeSuggestionModal({
  suggestion,
  onAccept,
  onDecline,
}: ThemeSuggestionModalProps) {
  if (!suggestion) return null;

  const targetTheme = THEMES[suggestion.themeId] || THEMES.pink;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900">Theme Suggestion</h3>
              <p className="text-[10px] text-stone-500">
                Shared by <span className="font-semibold text-stone-800">{suggestion.proposerName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDecline}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
            title="Dismiss suggestion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            <span className="font-semibold text-stone-900">{suggestion.proposerName}</span> is currently viewing the canvas in the <span className="font-semibold text-stone-900">{targetTheme.name}</span> theme and suggested matching themes with you!
          </p>

          {/* Theme Preview Card */}
          <div className={`p-4 rounded-2xl border shadow-xs transition-all ${targetTheme.bgClass} ${targetTheme.cardBorderClass}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl shrink-0">{targetTheme.icon}</span>
              <div className="min-w-0">
                <h4 className={`text-sm font-bold truncate ${targetTheme.fontDisplayClass}`}>
                  {targetTheme.name}
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                  {targetTheme.subtitle}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-stone-400 italic text-center">
            Your decision is private. Your partner will not be notified if you accept or decline.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors cursor-pointer"
            >
              Keep My Theme
            </button>
            <button
              type="button"
              onClick={() => onAccept(suggestion.themeId)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Try This Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
