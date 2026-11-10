import { useState } from 'react';
import {
  Download,
  AlertTriangle,
  RotateCcw,
  X,
  Check,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { RoomData, GameMode } from '../types';

interface NewPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  onConfirmNewPoem: (mode?: GameMode, targetLines?: number, revealedWords?: number) => Promise<void> | void;
  onOpenExportStudio: () => void;
}

export function NewPoemModal({
  isOpen,
  onClose,
  room,
  onConfirmNewPoem,
  onOpenExportStudio,
}: NewPoemModalProps) {
  // Step 1 = First verification ("Are you sure?"); Step 2 = Export suggestion & second verification
  const [step, setStep] = useState<1 | 2>(1);
  const [hasDownloadedJson, setHasDownloadedJson] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [selectedMode, setSelectedMode] = useState<GameMode>(room.gameMode || 'classic');
  const [targetLines, setTargetLines] = useState<number>(room.targetLineCount || 8);
  const [revealedWords, setRevealedWords] = useState<number>(room.revealedWordCount ?? 2);

  if (!isOpen) return null;

  const handleDownloadJson = () => {
    const exportData = {
      app: 'PoemPlay',
      version: '1.0',
      title: room.title || 'Untitled Rhyme',
      createdAt: new Date(room.createdAt).toISOString(),
      exportedAt: new Date().toISOString(),
      poets: {
        player1: room.player1,
        player2: room.player2,
      },
      lineCount: room.lines.length,
      lines: room.lines.map((l, index) => ({
        lineNumber: index + 1,
        authorRole: l.author,
        authorName: l.author === 'player1' ? room.player1.name : room.player2.name,
        text: l.text,
        timestamp: new Date(l.timestamp).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (room.title || 'poem')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    a.download = `${safeTitle}-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setHasDownloadedJson(true);
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await onConfirmNewPoem(selectedMode, targetLines, revealedWords);
      onClose();
      setStep(1);
      setHasDownloadedJson(false);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setHasDownloadedJson(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header - Fixed & Pinned */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2 text-stone-900">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Start a New Poem</h3>
              <p className="text-[11px] text-stone-500">
                {step === 1 ? 'Verification 1 of 2' : 'Verification 2 of 2: Export & Backup'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
            title="Close without resetting"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Initial Verification */}
        {step === 1 && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold">Reset Collaborative Canvas?</p>
                  <p className="text-amber-800 leading-relaxed">
                    Starting a new poem will clear all {room.lines.length} lines on the current canvas
                    for both you and your partner.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <p>
                  Current Poem: <span className="font-semibold text-stone-900 font-serif">"{room.title}"</span>
                </p>
                <p>Lines written: <span className="font-semibold text-stone-900">{room.lines.length}</span></p>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed">
                In the next step, you will be prompted to safely export or back up your poem as a PDF, PNG, or JSON file before continuing.
              </p>
            </div>

            {/* Pinned Footer for Step 1 */}
            <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/90 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer transition-colors"
              >
                Keep Current Poem
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Next: Backup Options →
              </button>
            </div>
          </>
        )}

        {/* Step 2: Second Verification & Export Suggestion */}
        {step === 2 && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Save Your Art
                </span>
                <h4 className="text-base font-bold text-stone-900">
                  Would you like to export "{room.title}" first?
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Save your verses before wiping the canvas so you don't lose any creative rhymes!
                </p>
              </div>

              {/* Live Poem Preview Card so poets can see what they're exporting */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/90 shadow-inner max-h-36 overflow-y-auto space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 pb-1 border-b border-stone-200">
                  <span className="font-serif italic truncate">"{room.title || 'Untitled Rhyme'}"</span>
                  <span className="text-[10px] text-stone-400 shrink-0 font-mono">{room.lines.length} verses</span>
                </div>
                {room.lines.length === 0 ? (
                  <p className="text-stone-400 italic text-[11px] text-center py-2">Canvas is empty</p>
                ) : (
                  room.lines.map((l, i) => (
                    <div key={l.id} className="text-xs text-stone-800 flex items-start gap-2">
                      <span className="text-[10px] text-stone-400 font-mono shrink-0 pt-0.5">{i + 1}.</span>
                      <span className="leading-snug break-words flex-1">{l.text}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Export Choices */}
              <div className="space-y-2 pt-1">
                {/* Option A: PDF or PNG via Export Studio Editor */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenExportStudio();
                    handleClose();
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-stone-900 bg-stone-50 hover:bg-stone-100 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-blue-600 transition-colors">
                        Export to PDF or PNG Artwork
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Opens the full Export Studio to customize borders and fonts
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-semibold shrink-0">Open Editor →</span>
                </button>

                {/* Option B: Download File (JSON) */}
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                        {hasDownloadedJson ? 'JSON File Saved!' : 'Save as File (JSON Backup)'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Instant complete data backup of all lines, authors, and timestamps
                      </p>
                    </div>
                  </div>
                  {hasDownloadedJson ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold shrink-0">Download</span>
                  )}
                </button>
              </div>

              {/* Game Mode Configuration for New Poem */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Choose Game Mode for New Poem</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('classic')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedMode === 'classic'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <p className="text-xs font-bold">Classic Canvas</p>
                    <p className={`text-[10px] mt-0.5 ${selectedMode === 'classic' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Continuous open poem
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('glimpse')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedMode === 'glimpse'
                        ? 'border-amber-600 bg-amber-600 text-white shadow-2xs'
                        : 'border-amber-200 bg-white hover:bg-amber-50 text-amber-950'
                    }`}
                  >
                    <p className="text-xs font-bold">Glimpse Mode</p>
                    <p className={`text-[10px] mt-0.5 ${selectedMode === 'glimpse' ? 'text-amber-100' : 'text-amber-800'}`}>
                      Hidden lines mystery
                    </p>
                  </button>
                </div>

                {selectedMode === 'glimpse' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60">
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900 mb-1">
                        Lines (2-998)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={998}
                        value={targetLines}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setTargetLines(isNaN(val) ? 8 : Math.max(2, Math.min(998, val)));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-stone-900 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900 mb-1">
                        Revealed Words (0-5)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={revealedWords}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setRevealedWords(isNaN(val) ? 2 : Math.max(0, Math.min(5, val)));
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-stone-900 shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {hasDownloadedJson && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>JSON backup downloaded to your computer!</span>
                </div>
              )}
            </div>

            {/* Pinned Footer for Step 2 - Submit button ALWAYS visible */}
            <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50/90 flex flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>
                  {isResetting
                    ? 'Creating Fresh Canvas...'
                    : hasDownloadedJson
                    ? 'Backup Done! Start New Poem Now'
                    : 'Clear & Start New Poem (Double Verified)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-1 text-xs text-stone-500 hover:text-stone-900 cursor-pointer text-center"
              >
                Cancel / Return to Current Poem
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
