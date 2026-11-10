import { useState } from 'react';
import { X, Check, User, Sparkles } from 'lucide-react';
import { ParticipantProfile, BadgeStyle } from '../types';

interface NamePaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ParticipantProfile;
  onSave: (updatedProfile: ParticipantProfile) => void;
  playerRole: 'player1' | 'player2';
}

const COLOR_OPTIONS = [
  { id: 'rose', label: 'Rose Gold', textClass: 'text-rose-700', bgClass: 'bg-rose-100', borderClass: 'border-rose-300' },
  { id: 'emerald', label: 'Emerald Ink', textClass: 'text-emerald-800', bgClass: 'bg-emerald-100', borderClass: 'border-emerald-300' },
  { id: 'violet', label: 'Royal Violet', textClass: 'text-purple-800', bgClass: 'bg-purple-100', borderClass: 'border-purple-300' },
  { id: 'cyan', label: 'Cyber Sky', textClass: 'text-sky-800', bgClass: 'bg-sky-100', borderClass: 'border-sky-300' },
  { id: 'terracotta', label: 'Warm Ochre', textClass: 'text-amber-800', bgClass: 'bg-amber-100', borderClass: 'border-amber-300' },
  { id: 'indigo', label: 'Twilight Indigo', textClass: 'text-indigo-800', bgClass: 'bg-indigo-100', borderClass: 'border-indigo-300' },
  { id: 'charcoal', label: 'French Charcoal', textClass: 'text-slate-800', bgClass: 'bg-slate-200', borderClass: 'border-slate-400' },
];

const STYLE_OPTIONS: { id: BadgeStyle; label: string; preview: (name: string, symbol: string) => string }[] = [
  { id: 'italic', label: 'Editorial Italic', preview: (name, s) => `${s} ${name}` },
  { id: 'sans', label: 'Modern Sans', preview: (name, s) => `${s} ${name}` },
  { id: 'bracket', label: 'Literary Brackets', preview: (name, s) => `[${s} ${name}]` },
  { id: 'monogram', label: 'Author Seal', preview: (name, s) => `${s} ${name[0] || 'A'}` },
];

const SYMBOL_OPTIONS = [
  { symbol: '🪶', label: 'Feather Quill' },
  { symbol: '⭐', label: 'Starlight' },
  { symbol: '🌙', label: 'Crescent' },
  { symbol: '🌸', label: 'Wild Rose' },
  { symbol: '💖', label: 'Heart' },
  { symbol: '👑', label: 'Crown' },
  { symbol: '🐾', label: 'Puppy Paw' },
  { symbol: '☕', label: 'Coffee Cup' },
];

export function NamePaletteModal({
  isOpen,
  onClose,
  profile,
  onSave,
  playerRole,
}: NamePaletteModalProps) {
  const [name, setName] = useState(profile.name);
  const [selectedColor, setSelectedColor] = useState(profile.color);
  const [selectedStyle, setSelectedStyle] = useState<BadgeStyle>(profile.style);
  const [selectedSymbol, setSelectedSymbol] = useState(profile.symbol);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || (playerRole === 'player1' ? 'Poet One' : 'Poet Two');
    onSave({
      name: cleanName,
      color: selectedColor,
      style: selectedStyle,
      symbol: selectedSymbol,
    });
    onClose();
  };

  const currentColor = COLOR_OPTIONS.find((c) => c.id === selectedColor) || COLOR_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header - Fixed & Pinned */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Personal Name Palette</h3>
              <p className="text-[11px] text-stone-500">
                Customizes how your name appears beside each rhyming line
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
            title="Close without saving"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body - with min-h-0 and flex-1 so scrolling is guaranteed on all viewports */}
        <form onSubmit={handleSubmit} id="name-palette-form" className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
              Your Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya, Julian, or Bard"
              maxLength={24}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
              autoFocus
            />
          </div>

          {/* Color Tint Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Signature Palette Tint
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => {
                const active = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                      c.bgClass
                    } ${c.textClass} ${
                      active
                        ? `ring-2 ring-stone-900 font-semibold border-stone-900 shadow-2xs`
                        : `border-transparent opacity-85 hover:opacity-100`
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symbol Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Author Monogram Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {SYMBOL_OPTIONS.map((s) => (
                <button
                  key={s.symbol}
                  type="button"
                  onClick={() => setSelectedSymbol(s.symbol)}
                  className={`h-9 rounded-xl flex items-center justify-center text-base border transition-all cursor-pointer ${
                    selectedSymbol === s.symbol
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm scale-105'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                  title={s.label}
                >
                  {s.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Badge Style Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Typography Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStyle(st.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    selectedStyle === st.id
                      ? 'bg-stone-100 border-stone-900 font-semibold text-stone-900 ring-1 ring-stone-900'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-medium text-[11px] text-stone-400 mb-0.5">{st.label}</p>
                  <p
                    className={
                      st.id === 'italic'
                        ? 'font-serif italic text-stone-800'
                        : st.id === 'bracket'
                        ? 'font-mono text-stone-800'
                        : 'font-sans text-stone-800'
                    }
                  >
                    {st.preview(name || 'Poet', selectedSymbol)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <p className="text-[10px] uppercase font-semibold text-stone-400 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Live Line Beside Preview
            </p>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border font-medium ${
                  currentColor.bgClass
                } ${currentColor.textClass} ${currentColor.borderClass} ${
                  selectedStyle === 'italic'
                    ? 'font-serif italic'
                    : selectedStyle === 'bracket'
                    ? 'font-mono'
                    : 'font-sans'
                }`}
              >
                <span>{selectedSymbol}</span>
                <span>{name || 'Your Name'}</span>
              </span>
              <span className="text-xs text-stone-400 italic">"The amber leaf falls softly into light..."</span>
            </div>
          </div>
        </form>

        {/* Footer - Pinned & Always Visible with Cancel & Submit buttons */}
        <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer transition-colors"
          >
            Cancel / Close
          </button>
          <button
            type="submit"
            form="name-palette-form"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Badge Style</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function renderNameBadge(profile: ParticipantProfile, fallbackLabel = 'Poet') {
  const color = COLOR_OPTIONS.find((c) => c.id === profile.color) || COLOR_OPTIONS[0];
  const name = profile.name || fallbackLabel;
  const symbol = profile.symbol || '🪶';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border font-medium ${
        color.bgClass
      } ${color.textClass} ${color.borderClass} ${
        profile.style === 'italic'
          ? 'font-serif italic'
          : profile.style === 'bracket'
          ? 'font-mono'
          : 'font-sans'
      }`}
    >
      <span className="text-xs">{symbol}</span>
      <span className="truncate max-w-[130px] sm:max-w-[180px]">{name}</span>
    </span>
  );
}
