import { useState, useEffect } from 'react';
import { Eye, Feather, X, Check, Settings } from 'lucide-react';
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

const LINE_PRESETS = [4, 6, 8, 12, 16, 20, 50, 100];
const WORD_OPTIONS = [0, 1, 2, 3, 4, 5];

export function GameModeSettingsModal({
  isOpen,
  onClose,
  room,
  onUpdateGameSettings,
}: GameModeSettingsModalProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>(
    room.gameMode || 'classic'
  );
  const [targetLinesInput, setTargetLinesInput] = useState<string>(
    String(room.targetLineCount || 8)
  );
  const [revealedWordsInput, setRevealedWordsInput] = useState<string>(
    String(room.revealedWordCount ?? 2)
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync when modal opens or room mode settings change externally
  useEffect(() => {
    if (isOpen && room) {
      setSelectedMode(room.gameMode || 'classic');
      setTargetLinesInput(String(room.targetLineCount || 8));
      setRevealedWordsInput(String(room.revealedWordCount ?? 2));
    }
  }, [isOpen, room.gameMode, room.targetLineCount, room.revealedWordCount]);

  if (!isOpen) return null;

  const parsedLines = parseInt(targetLinesInput, 10);
  const validLines = isNaN(parsedLines)
    ? 8
    : Math.max(2, Math.min(1000, parsedLines));

  const parsedWords = parseInt(revealedWordsInput, 10);
  const validWords = isNaN(parsedWords)
    ? 2
    : Math.max(0, Math.min(5, parsedWords));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateGameSettings(selectedMode, validLines, validWords);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Game Mode & Glimpse Settings</h3>
              <p className="text-[11px] text-stone-500">
                Synchronizes immediately for both poets in real time
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
        <form onSubmit={handleSave} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Shared Game Mode (Applies to Both Poets)
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
            <div className="p-4 bg-amber-50 border border-amber-300/80 rounded-2xl space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span>Glimpse Rules Configuration</span>
                </span>
                <span className="text-[10px] font-mono bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md">
                  Synced for Both
                </span>
              </div>

              {/* Number of Lines Setting (2 - 1000) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-950">
                    Set Number of Lines in Poem
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    (2 - 1000 lines)
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={targetLinesInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setTargetLinesInput(raw);
                  }}
                  onBlur={() => {
                    setTargetLinesInput(String(validLines));
                  }}
                  placeholder="Enter any number from 2 to 1000"
                  className="w-full px-3.5 py-2.5 text-sm font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                />
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-amber-800 font-medium mr-0.5">Quick pick:</span>
                  {LINE_PRESETS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTargetLinesInput(String(num))}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        validLines === num
                          ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                          : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-amber-800 mt-1.5 leading-snug">
                  The entire poem will remain hidden and automatically unveil on line{' '}
                  <span className="font-bold underline">{validLines}</span>!
                </p>
              </div>

              {/* Number of Shown Words Setting (0 - 5) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-950">
                    Number of Words Shown at Sentence End
                  </label>
                  <span className="text-[10px] font-mono text-amber-800 font-semibold">
                    (0 - 5 words)
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 mb-2">
                  {WORD_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setRevealedWordsInput(String(w))}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        validWords === w
                          ? 'bg-amber-700 text-white border-amber-700 shadow-xs scale-105'
                          : 'bg-white text-amber-950 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {w} {w === 1 ? 'word' : 'words'}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={revealedWordsInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setRevealedWordsInput(raw);
                  }}
                  onBlur={() => {
                    setRevealedWordsInput(String(validWords));
                  }}
                  placeholder="Enter 0, 1, 2, 3, 4, or 5"
                  className="w-full px-3.5 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                />
                <p className="text-[11px] text-amber-800 mt-1.5 leading-snug">
                  {validWords === 0 ? (
                    <span className="font-semibold text-rose-700">
                      Fully Blind Mode: 0 trailing words shown
                    </span>
                  ) : (
                    <span>
                      Each poet sees the last{' '}
                      <span className="font-bold underline">{validWords} word(s)</span> from
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
              <span>{isSaving ? 'Updating Both Screens...' : 'Save Mode for Both Poets'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
