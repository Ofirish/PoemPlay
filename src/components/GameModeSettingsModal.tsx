import { useState, useEffect } from 'react';
import { Eye, Feather, X, Check, Settings, Sparkles } from 'lucide-react';
import { RoomData, GameMode } from '../types';

interface GameModeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onUpdateGameSettings: (
    gameMode: GameMode,
    targetLineCount: number,
    revealedWordCount: number
  ) => Promise<void>;
}

export function GameModeSettingsModal({
  isOpen,
  onClose,
  room,
  onUpdateGameSettings,
}: GameModeSettingsModalProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>(
    room.gameMode || 'classic'
  );
  const [targetLines, setTargetLines] = useState<number>(
    room.targetLineCount || 8
  );
  const [revealedWords, setRevealedWords] = useState<number>(
    room.revealedWordCount ?? 2
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setSelectedMode(room.gameMode || 'classic');
      setTargetLines(room.targetLineCount || 8);
      setRevealedWords(room.revealedWordCount ?? 2);
    }
  }, [room]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const validLines = Math.max(2, Math.min(998, targetLines || 8));
      const validWords = Math.max(0, Math.min(5, revealedWords ?? 2));
      await onUpdateGameSettings(selectedMode, validLines, validWords);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2 text-stone-900">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Game Mode & Glimpse Settings</h3>
              <p className="text-[11px] text-stone-500">
                Adjust poem length & word reveal rules in real time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMode('classic')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedMode === 'classic'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Feather className="w-4 h-4 text-amber-400" />
                  <span>Classic Canvas</span>
                </div>
                <p
                  className={`text-[10px] mt-1.5 leading-snug ${
                    selectedMode === 'classic' ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  Continuous open canvas. All lines visible continuously.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('glimpse')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  selectedMode === 'glimpse'
                    ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                    : 'border-amber-200 bg-amber-50 hover:bg-amber-100/80 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <Eye className="w-4 h-4 text-amber-200" />
                  <span>Glimpse Mode</span>
                </div>
                <p
                  className={`text-[10px] mt-1.5 leading-snug ${
                    selectedMode === 'glimpse' ? 'text-amber-100' : 'text-amber-800'
                  }`}
                >
                  Hidden poem mystery! Only trailing words are revealed until complete.
                </p>
              </button>
            </div>
          </div>

          {/* Glimpse Rules */}
          {selectedMode === 'glimpse' && (
            <div className="p-4 bg-amber-50 border border-amber-300/80 rounded-2xl space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Glimpse Rules Configuration</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {/* Number of Lines Setting (2 - 998) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-950">
                    Set Number of Lines in Poem
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    (2 - 998 lines)
                  </span>
                </div>
                <input
                  type="number"
                  min={2}
                  max={998}
                  value={targetLines}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setTargetLines(
                      isNaN(val) ? 8 : Math.max(2, Math.min(998, val))
                    );
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                  required
                />
                <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                  The entire poem will remain hidden and automatically unveil on line{' '}
                  <span className="font-bold underline">{targetLines}</span>!
                </p>
              </div>

              {/* Number of Shown Words Setting (0 - 5) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-950">
                    Number of Words Shown at Sentence End
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    (0 - 5 words)
                  </span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={revealedWords}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setRevealedWords(
                      isNaN(val) ? 2 : Math.max(0, Math.min(5, val))
                    );
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                  required
                />
                <p className="text-[11px] text-amber-800 mt-1 leading-snug">
                  {revealedWords === 0 ? (
                    <span className="font-semibold text-rose-700">
                      Fully Blind Mode: 0 trailing words shown
                    </span>
                  ) : (
                    <span>
                      Each poet sees the last{' '}
                      <span className="font-bold underline">{revealedWords} word(s)</span> from
                      their partner's line.
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Updating...' : 'Save Mode Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
