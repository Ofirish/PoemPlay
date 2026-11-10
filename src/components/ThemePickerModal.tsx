import { Palette, Check, Sparkles, X } from 'lucide-react';
import { DesignThemeId } from '../types';
import { THEMES } from '../lib/themes';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: DesignThemeId;
  onSelectTheme: (themeId: DesignThemeId) => void;
  onShareCurrentTheme?: () => void;
}

export function ThemePickerModal({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  onShareCurrentTheme,
}: ThemePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header - Pinned */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Personal Canvas Theme</h3>
              <p className="text-[11px] text-stone-500">
                Independent client choice · Only you see this theme
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
            title="Close without changing"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - with min-h-0 and flex-1 so scrolling is guaranteed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Object.values(THEMES).map((theme) => {
              const isSelected = theme.id === currentThemeId;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme.id);
                  }}
                  className={`flex items-start gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900'
                      : 'bg-stone-50 hover:bg-stone-100/80 text-stone-800 border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{theme.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate">{theme.name}</p>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                    </div>
                    <p
                      className={`text-[10px] leading-tight mt-0.5 ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {theme.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Share with partner banner & button */}
          {onShareCurrentTheme && (
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-rose-900">
                  <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="leading-tight">
                    Want your co-creator to match your style? Send them a private theme suggestion.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onShareCurrentTheme();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  Share Theme
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Pinned with Cancel & Done buttons */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer transition-colors"
          >
            Cancel / Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl cursor-pointer shadow-xs transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
