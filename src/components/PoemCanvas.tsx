import { useState, useEffect, useRef, Fragment } from 'react';
import {
  Send,
  Edit3,
  Trash2,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Quote,
  Feather,
  Eye,
  Lock,
  Unlock,
} from 'lucide-react';
import { RoomData, PlayerRole, PoemLine, LineProposal, DesignThemeId } from '../types';
import { THEMES } from '../lib/themes';
import { renderNameBadge } from './NamePaletteModal';
import { FrenchBulldogMascot, DaddyAndToyMascot } from './ThemeMascots';
import confetti from 'canvas-confetti';

function extractGlimpseParts(text: string, count: number) {
  if (!text || count <= 0) {
    return { maskedPart: '•••• •••• ••••', revealedWords: '' };
  }
  const words = text.trim().split(/\s+/);
  if (words.length <= count) {
    return { maskedPart: '', revealedWords: words.join(' ') };
  }
  const hiddenWords = words.slice(0, words.length - count);
  const revealedWords = words.slice(words.length - count).join(' ');
  const maskedPart = hiddenWords
    .map((w) => '•'.repeat(Math.max(2, Math.min(w.length, 6))))
    .join(' ');
  return { maskedPart, revealedWords };
}

interface PoemCanvasProps {
  room: RoomData;
  currentPlayerRole: PlayerRole;
  currentThemeId: DesignThemeId;
  highlightedLineNumber: number | null;
  showPoetNames: boolean;
  onToggleShowPoetNames: () => void;
  onSubmitLine: (text: string) => Promise<void>;
  onProposeEdit: (lineId: string, newText: string) => Promise<void>;
  onProposeDelete: (lineId: string) => Promise<void>;
  onVoteProposal: (proposalId: string, accept: boolean) => Promise<void>;
  onWithdrawProposal: (proposalId: string) => Promise<void>;
  onChangeTitle: (newTitle: string) => Promise<void>;
  onOpenNewPoemModal?: () => void;
}

export function PoemCanvas({
  room,
  currentPlayerRole,
  currentThemeId,
  highlightedLineNumber,
  showPoetNames,
  onToggleShowPoetNames,
  onSubmitLine,
  onProposeEdit,
  onProposeDelete,
  onVoteProposal,
  onWithdrawProposal,
  onChangeTitle,
  onOpenNewPoemModal,
}: PoemCanvasProps) {
  const theme = THEMES[currentThemeId] || THEMES.pink;

  // Title in-game editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(room.title);

  useEffect(() => {
    setTitleInput(room.title);
  }, [room.title]);

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = titleInput.trim();
    if (clean && clean !== room.title) {
      await onChangeTitle(clean);
    }
    setIsEditingTitle(false);
  };

  // Key requirement: Continuous draft autosave! Every single keystroke saved to localStorage
  const draftStorageKey = `poemplay_draft_${room.id}`;
  const [draftLine, setDraftLine] = useState(() => {
    try {
      return localStorage.getItem(draftStorageKey) || '';
    } catch {
      return '';
    }
  });

  const [activeEditingLineId, setActiveEditingLineId] = useState<string | null>(null);
  const [proposalEditText, setProposalEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Save draft on every keystroke
  useEffect(() => {
    try {
      localStorage.setItem(draftStorageKey, draftLine);
    } catch (e) {
      console.warn('Failed to save draft to local storage:', e);
    }
  }, [draftLine, draftStorageKey]);

  // Handle scroll to highlighted line when triggered from chat
  useEffect(() => {
    if (highlightedLineNumber && lineRefs.current[highlightedLineNumber]) {
      const el = lineRefs.current[highlightedLineNumber];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('ring-2', 'ring-rose-400', 'bg-rose-50/50');
      const timer = setTimeout(() => {
        el?.classList.remove('ring-2', 'ring-rose-400', 'bg-rose-50/50');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [highlightedLineNumber]);

  const isMyTurn = room.turn === currentPlayerRole;
  const myProfile = currentPlayerRole === 'player1' ? room.player1 : room.player2;
  const partnerProfile = currentPlayerRole === 'player1' ? room.player2 : room.player1;

  const lastLine = room.lines[room.lines.length - 1];

  const isGlimpseMode = room.gameMode === 'glimpse';
  const targetLineCount = Math.max(2, Math.min(998, room.targetLineCount || 8));
  const revealedWordCount = Math.max(0, Math.min(5, room.revealedWordCount ?? 2));
  const isGlimpseCompleted = isGlimpseMode && room.lines.length >= targetLineCount;

  const prevLinesCountRef = useRef(room.lines.length);
  useEffect(() => {
    if (
      isGlimpseMode &&
      room.lines.length >= targetLineCount &&
      prevLinesCountRef.current < targetLineCount
    ) {
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }
    prevLinesCountRef.current = room.lines.length;
  }, [isGlimpseMode, room.lines.length, targetLineCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draftLine.trim();
    if (!clean || isSubmitting || !isMyTurn) return;

    setIsSubmitting(true);
    try {
      await onSubmitLine(clean);
      setDraftLine('');
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {
        // ignore
      }
      try {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error submitting line:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (line: PoemLine) => {
    setActiveEditingLineId(line.id);
    setProposalEditText(line.text);
  };

  const handleCancelEdit = () => {
    setActiveEditingLineId(null);
    setProposalEditText('');
  };

  const handleSendEditProposal = async (lineId: string) => {
    const text = proposalEditText.trim();
    if (!text) return;
    try {
      await onProposeEdit(lineId, text);
      setActiveEditingLineId(null);
      setProposalEditText('');
    } catch (err) {
      console.error('Error proposing edit:', err);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Theme Mascot Header if French Bulldog or Daddy & Toy */}
      {currentThemeId === 'french-bulldog' && (
        <div className="flex items-center justify-center gap-3 p-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-slate-300 shadow-xs animate-in fade-in">
          <FrenchBulldogMascot className="w-14 h-14 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-slate-800">
              French Bulldog Salon
            </p>
            <p className="text-[11px] text-slate-500">
              Sky-blue left eye, midnight-black right eye · Parisian poetry companion
            </p>
          </div>
        </div>
      )}

      {currentThemeId === 'daddy-and-toy' && (
        <div className="flex items-center justify-center gap-3 p-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-rose-200 shadow-xs animate-in fade-in">
          <DaddyAndToyMascot className="w-14 h-14 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-rose-800">
              Daddy & Toy · With Hearts & Kisses
            </p>
            <p className="text-[11px] text-rose-600">
              Cuddly warmth, gentle rhymes, and endless love xoxo
            </p>
          </div>
        </div>
      )}

      {/* Poem Paper Sheet */}
      {currentThemeId === 'lined-notebook' ? (
        /* Authentic Lined Notebook Sheet: Title, Poets, and Verses seated directly on blue ruled lines */
        <div className="rounded-3xl border border-stone-300 shadow-xl relative min-h-[640px] pl-0 pr-4 sm:pr-8 py-4 sm:py-8 overflow-hidden notebook-page select-text">
          {/* 3 Binder Punch Holes */}
          <div className="absolute left-2 sm:left-3 top-14 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner pointer-events-none" />
          <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner pointer-events-none" />
          <div className="absolute left-2 sm:left-3 bottom-14 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner pointer-events-none" />

          {/* Continuous Vertical Red Margin Line - shifted left with zero element overlap */}
          <div className="absolute left-14 sm:left-20 top-0 bottom-0 w-[2px] bg-rose-400 pointer-events-none z-20" />

          {/* Floating Coherent Poem / Current Poet view toggle button - Moved completely away from poets names so it never hides them */}
          <div className="absolute top-2.5 right-3 sm:top-4 sm:right-6 z-30">
            <button
              type="button"
              onClick={onToggleShowPoetNames}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 hover:bg-white text-stone-700 shadow-xs border border-stone-200/90 backdrop-blur-xs transition-all cursor-pointer hover:shadow-sm"
              title={showPoetNames ? "Switch to Current Poet Focus" : "Show Both Poet Names"}
            >
              <span>{showPoetNames ? '🪶 Current Poet Focus' : '👥 Both Poets View'}</span>
            </button>
          </div>

          {/* Ruled Sheet Content */}
          <div className="relative z-10 space-y-0">
            {/* 1. Title Row: Left of red line has 'TITLE', right has title text sitting on blue line */}
            <div className="flex items-end min-h-[46px] border-b border-sky-300 pb-1">
              <div className="w-14 sm:w-20 shrink-0 pr-2.5 sm:pr-3 flex items-center justify-end">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-500 uppercase tracking-wider select-none truncate">
                  Title
                </span>
              </div>
              <div className="flex-1 min-w-0 pl-3 sm:pl-5 pr-36 sm:pr-44 flex items-end justify-between group">
                {isEditingTitle ? (
                  <form onSubmit={handleSaveTitle} className="w-full flex items-center gap-2">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      maxLength={60}
                      placeholder="Enter poem title..."
                      className="w-full text-base sm:text-2xl font-serif font-bold text-stone-900 bg-transparent border-none outline-none p-0 focus:ring-0 leading-none"
                      autoFocus
                    />
                    <button type="submit" className="p-1 rounded-md text-stone-700 hover:bg-stone-200 cursor-pointer">
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTitleInput(room.title);
                        setIsEditingTitle(false);
                      }}
                      className="p-1 rounded-md text-stone-400 hover:bg-stone-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <h1
                      onClick={() => setIsEditingTitle(true)}
                      className="text-base sm:text-2xl font-serif font-bold text-stone-900 tracking-tight leading-none cursor-pointer hover:opacity-85 truncate"
                      title="Click to edit poem title"
                    >
                      {room.title || 'Untitled Rhyme'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700 cursor-pointer shrink-0"
                      title="Edit poem title"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. Glimpse Mode Status Banner - Seated cleanly to the right of the red notebook margin line */}
            {isGlimpseMode && (
              <div className="flex items-center min-h-[52px] border-b border-sky-300 py-2">
                <div className="w-14 sm:w-20 shrink-0 pr-2.5 sm:pr-3 flex items-center justify-end">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-600 uppercase tracking-wider select-none truncate">
                    Glimpse
                  </span>
                </div>
                <div className="flex-1 min-w-0 pl-3 sm:pl-5 pr-4 sm:pr-6">
                  {isGlimpseCompleted ? (
                    <div className="p-2.5 sm:p-3 bg-gradient-to-r from-amber-100 via-rose-100 to-emerald-100 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-stone-900 shadow-xs animate-in zoom-in-95">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold text-xs sm:text-sm">✨ GLIMPSE POEM COMPLETE & REVEALED! ✨</p>
                          <p className="text-[10px] sm:text-[11px] text-stone-600">All {targetLineCount} lines unveiled for both poets!</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-200/80 text-amber-950 rounded-xl font-bold font-mono text-[11px] shrink-0">
                        {room.lines.length} / {targetLineCount}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 sm:p-3 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-2xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Eye className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                        <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">Glimpse Mode</span>
                        <span className="font-serif italic text-xs">Line {room.lines.length} of {targetLineCount} written</span>
                        <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-mono">
                          Revealing last {revealedWordCount} word(s)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        <span className="font-mono text-amber-900 font-bold text-xs">
                          {targetLineCount - room.lines.length} left
                        </span>
                        {onOpenNewPoemModal && (
                          <button
                            type="button"
                            onClick={onOpenNewPoemModal}
                            className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg transition-colors cursor-pointer border border-amber-300 flex items-center gap-1 shadow-2xs"
                            title="Adjust Glimpse Mode rules or start a new poem"
                          >
                            <span>⚙️ Rules</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. Poets Row: Seated cleanly on the blue ruled line, displaying BOTH Poets with zero button overlap! */}
            <div className="flex items-end min-h-[42px] border-b border-sky-300 pb-1">
              <div className="w-14 sm:w-20 shrink-0 pr-2.5 sm:pr-3 flex items-center justify-end">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-500 uppercase tracking-wider select-none truncate">
                  Poet
                </span>
              </div>
              <div className="flex-1 min-w-0 pl-3 sm:pl-5 flex items-center gap-2 pb-0.5 overflow-x-auto no-scrollbar">
                {renderNameBadge(room.player1, 'Player 1')}
                <span className="text-stone-400 font-serif italic text-xs select-none">&</span>
                {renderNameBadge(room.player2, 'Player 2')}
                <span className="text-stone-300 font-serif italic select-none">·</span>
                <span className="text-[11px] font-serif italic text-stone-500 whitespace-nowrap">
                  {room.turn === currentPlayerRole ? '✨ Your turn to rhyme' : "⏳ Partner's turn"}
                </span>
              </div>
            </div>

            {/* 4. Spacer Ruled Line */}
            <div className="flex items-end min-h-[38px] border-b border-sky-300">
              <div className="w-14 sm:w-20 shrink-0" />
              <div className="flex-1 pl-3 sm:pl-5 text-[10px] font-mono text-stone-300 italic select-none">
                notebook page · rhyming in cadence
              </div>
            </div>

            {/* 5. Poem Lines (Verses seated directly on blue ruled lines) */}
            {room.lines.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-1">
                <p className="text-base sm:text-lg font-serif italic text-stone-500">
                  {isGlimpseMode
                    ? `Glimpse Poem initialized (${targetLineCount} lines target). Poet 1 writes Line 1!`
                    : 'A fresh lined notebook page awaits your opening verse...'}
                </p>
                <p className="text-xs text-stone-400">
                  {isGlimpseMode
                    ? `Each partner will only see the last ${revealedWordCount} word(s) until Line ${targetLineCount} is reached!`
                    : 'Write a rhyme below. Your lines will appear directly on the blue notebook lines!'}
                </p>
              </div>
            ) : (
              room.lines.map((line, index) => {
                const lineNum = index + 1;
                const authorProfile = line.author === 'player1' ? room.player1 : room.player2;
                const pendingProposal = room.proposals.find(
                  (p) => p.targetLineId === line.id && p.status === 'pending'
                );
                const isProposer = pendingProposal?.proposer === currentPlayerRole;

                // Glimpse mode masking calculations
                const isPastLineHiddenInGlimpse = isGlimpseMode && !isGlimpseCompleted && index < room.lines.length - 1;
                const isLatestLineInGlimpse = isGlimpseMode && !isGlimpseCompleted && index === room.lines.length - 1;
                const { maskedPart, revealedWords } = extractGlimpseParts(line.text, revealedWordCount);

                return (
                  <Fragment key={line.id}>
                    <div id={`poem-line-${lineNum}`} className="group relative">
                      {/* The Ruled Verse Row: Text baseline sits squarely on the blue border line! */}
                      <div className="flex items-end min-h-[44px] border-b border-sky-300 pb-1 hover:bg-sky-50/20 transition-colors">
                        {/* Left of Red Margin Line: Line Number & Clickable Poet Icon */}
                        <div className="w-14 sm:w-20 shrink-0 pr-2.5 sm:pr-3 flex items-center justify-end gap-1">
                          <span className="text-[11px] font-mono font-bold text-stone-400 select-none">
                            {String(lineNum).padStart(2, '0')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (activeEditingLineId === line.id) {
                                handleCancelEdit();
                              } else {
                                handleStartEdit(line);
                              }
                            }}
                            className={`text-xs p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                              activeEditingLineId === line.id
                                ? 'bg-amber-200 ring-2 ring-amber-400 scale-110 shadow-xs'
                                : 'hover:bg-amber-100/70 active:scale-95'
                            }`}
                            title={`Click poet icon to edit Line ${lineNum} (${authorProfile.name})`}
                            aria-label={`Edit Line ${lineNum}`}
                          >
                            <span className="text-xs select-none">
                              {authorProfile.symbol || '🪶'}
                            </span>
                          </button>
                        </div>

                        {/* Right of Red Margin Line: Verse Text seated directly on the blue line with actions on right! */}
                        <div className="flex-1 min-w-0 pl-3 sm:pl-5 flex items-end justify-between group/verse">
                          {isPastLineHiddenInGlimpse ? (
                            <div className="flex items-center gap-2 text-stone-400 font-serif italic text-xs sm:text-sm py-1 select-none">
                              <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="opacity-40 font-mono tracking-widest">••••••••••••••••••••</span>
                              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-mono">
                                Hidden until Line {targetLineCount}
                              </span>
                            </div>
                          ) : isLatestLineInGlimpse ? (
                            <div className="flex items-center gap-2 py-0.5 flex-wrap font-serif text-base sm:text-xl">
                              {maskedPart && (
                                <span className="text-stone-300 select-none tracking-widest font-mono text-sm opacity-60">
                                  {maskedPart}
                                </span>
                              )}
                              {revealedWords ? (
                                <span
                                  onClick={() => {
                                    if (activeEditingLineId === line.id) {
                                      handleCancelEdit();
                                    } else {
                                      handleStartEdit(line);
                                    }
                                  }}
                                  className="bg-amber-200/90 text-amber-950 font-bold px-3 py-0.5 rounded-xl border border-amber-400 shadow-2xs cursor-pointer hover:bg-amber-300 transition-colors inline-flex items-center gap-1.5"
                                  title="Click to view or propose edit"
                                >
                                  <span>{revealedWords}</span>
                                  <span className="text-[10px] font-mono uppercase bg-amber-300 text-amber-950 px-1.5 py-0.2 rounded-md">
                                    Glimpse
                                  </span>
                                </span>
                              ) : (
                                <span className="text-stone-400 italic text-xs font-mono">
                                  🔒 (0 trailing words revealed)
                                </span>
                              )}
                            </div>
                          ) : (
                            <p
                              onClick={() => {
                                if (activeEditingLineId === line.id) {
                                  handleCancelEdit();
                                } else {
                                  handleStartEdit(line);
                                }
                              }}
                              className="text-base sm:text-xl font-serif text-stone-900 leading-snug tracking-wide whitespace-normal break-words m-0 p-0 select-text cursor-pointer hover:text-stone-700"
                              title="Click poet icon or verse to edit line"
                            >
                              {line.text}
                            </p>
                          )}

                          {/* Action buttons on right edge - visible on touch, enhanced on hover */}
                          <div className="flex items-center gap-0.5 opacity-70 sm:opacity-0 sm:group-hover/verse:opacity-100 transition-opacity pl-2 shrink-0 pb-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (activeEditingLineId === line.id) {
                                  handleCancelEdit();
                                } else {
                                  handleStartEdit(line);
                                }
                              }}
                              className="p-1 text-stone-500 hover:text-amber-800 hover:bg-amber-100/60 rounded-md cursor-pointer transition-colors"
                              title="Propose edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onProposeDelete(line.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                              title="Propose deletion"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Active Inline Editing Box (when proposing an edit) */}
                      {activeEditingLineId === line.id && (
                        <div className="my-2 p-3.5 bg-amber-50/95 border border-amber-300 rounded-2xl shadow-xs animate-in fade-in duration-100">
                          <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-amber-600" />
                            Propose Revision to Line {lineNum}
                          </p>
                          <input
                            type="text"
                            value={proposalEditText}
                            onChange={(e) => setProposalEditText(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2 mt-2.5">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendEditProposal(line.id)}
                              className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl cursor-pointer transition-colors shadow-2xs"
                            >
                              Submit Proposal for Approval
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Pending Proposal Frame Under the Line */}
                      {pendingProposal && (
                        <div className="my-2 p-3 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/90 shadow-xs animate-in fade-in duration-150">
                          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-200/80">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>
                                {pendingProposal.type === 'edit'
                                  ? `Proposed Edit by ${pendingProposal.proposerName}`
                                  : `Proposed Deletion by ${pendingProposal.proposerName}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-rose-500 font-mono">
                              Requires partner approval
                            </span>
                          </div>

                          {pendingProposal.type === 'edit' && (
                            <div className="space-y-1 mb-2.5">
                              <p className="text-xs text-stone-500 line-through">
                                Original: "{line.text}"
                              </p>
                              <p className="text-sm sm:text-base font-medium text-stone-900 italic font-serif">
                                Proposed: "{pendingProposal.newText}"
                              </p>
                            </div>
                          )}

                          {pendingProposal.type === 'delete' && (
                            <p className="text-xs text-stone-600 italic mb-2.5">
                              Proposing to remove this line from the poem.
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-2">
                            {isProposer ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-stone-500 italic flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  Waiting for partner...
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onWithdrawProposal(pendingProposal.id)}
                                  className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
                                >
                                  Withdraw
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onVoteProposal(pendingProposal.id, false)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                                >
                                  <X className="w-3 h-3 text-rose-500" />
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onVoteProposal(pendingProposal.id, true)}
                                  className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Check className="w-3 h-3" />
                                  Accept Change
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* One line space ONLY if the same poet submitted consecutive lines; otherwise alternating poets sit directly line-after-line */}
                    {room.lines[index + 1]?.author === line.author && (
                      <div className="flex items-end min-h-[42px] border-b border-sky-300 select-none">
                        <div className="w-14 sm:w-20 shrink-0" />
                        <div className="flex-1 pl-3 sm:pl-5" />
                      </div>
                    )}
                  </Fragment>
                );
              })
            )}

            {/* 5. Continuing Empty Ruled Notebook Lines (fills the sheet like real stationery) */}
            {Array.from({ length: Math.max(5, 12 - room.lines.length) }).map((_, i) => (
              <div key={`empty-line-${i}`} className="flex items-end min-h-[42px] border-b border-sky-300">
                <div className="w-14 sm:w-20 shrink-0 pr-2.5 sm:pr-3 flex items-center justify-end">
                  <span className="text-[10px] font-mono text-stone-300 select-none">
                    {String(room.lines.length + i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-1 pl-3 sm:pl-5" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Other 7 Themes: Classic Curatorial Card Presentation */
        <div className={`rounded-3xl border transition-all p-6 sm:p-12 ${theme.cardClass} ${theme.cardBorderClass}`}>
          {/* Curatorial Header */}
          <div className="text-center pb-6 mb-6 border-b border-stone-200/60 relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2 text-stone-400">
              <Feather className="w-3.5 h-3.5" />
              <span className="text-[11px] tracking-widest uppercase font-mono">
                COLLABORATIVE RHYMING CANVAS
              </span>
              <Feather className="w-3.5 h-3.5 transform -scale-x-100" />
            </div>

            {isEditingTitle ? (
              <form
                onSubmit={handleSaveTitle}
                className="flex items-center justify-center gap-2 max-w-md mx-auto mb-2 animate-in fade-in"
              >
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  maxLength={60}
                  placeholder="Enter poem title..."
                  className="w-full text-center text-xl sm:text-2xl font-medium px-3 py-1 bg-white/95 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 shadow-inner"
                  autoFocus
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 cursor-pointer shadow-xs shrink-0"
                  title="Save title"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(room.title);
                    setIsEditingTitle(false);
                  }}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 cursor-pointer shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 group mb-2">
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  className={`text-2xl sm:text-4xl font-medium tracking-tight cursor-pointer hover:opacity-85 transition-opacity ${theme.fontDisplayClass} ${theme.textPrimaryClass}`}
                  title="Click to edit poem title"
                >
                  {room.title || 'Untitled Rhyme'}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Edit poem title"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span>Co-created by</span>
                {renderNameBadge(room.player1, 'Player 1')}
                <span>&</span>
                {renderNameBadge(room.player2, 'Player 2')}
              </div>

              <button
                type="button"
                onClick={onToggleShowPoetNames}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200 shadow-2xs"
                title={showPoetNames ? "Switch to Current Poet Focus" : "Show Both Poet Names"}
              >
                <span>{showPoetNames ? '🪶 Current Poet Focus' : '👥 Both Poets View'}</span>
              </button>
            </div>
          </div>

          {/* Lines Presentation */}
          <div className="space-y-1.5 relative z-10">
            {room.lines.length === 0 ? (
              <div className="text-center py-20 px-4 space-y-2">
                <p className="text-base sm:text-xl font-serif italic text-stone-500">
                  The blank canvas awaits your first couplet...
                </p>
                <p className="text-xs text-stone-400">
                  Write an opening line below. Your partner will respond with a matching rhyme!
                </p>
              </div>
            ) : (
              room.lines.map((line, index) => {
                const lineNum = index + 1;
                const authorProfile =
                  line.author === 'player1' ? room.player1 : room.player2;
                const pendingProposal = room.proposals.find(
                  (p) => p.targetLineId === line.id && p.status === 'pending'
                );
                const isProposer = pendingProposal?.proposer === currentPlayerRole;
                const isSameAuthorNext = room.lines[index + 1]?.author === line.author;

                return (
                  <div
                    key={line.id}
                    ref={(el) => {
                      lineRefs.current[lineNum] = el;
                    }}
                    id={`poem-line-${lineNum}`}
                    className={`group relative rounded-2xl p-2 sm:p-3 transition-all hover:bg-stone-50/50 space-y-1 ${
                      isSameAuthorNext ? 'mb-6' : ''
                    }`}
                  >
                    {/* Top Bar Above Line: Poet Name, Line Number, and Action Buttons */}
                    <div className="flex items-center justify-between pb-1 border-b border-stone-200/40">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-stone-400 select-none">
                          #{String(lineNum).padStart(2, '0')}
                        </span>
                        {showPoetNames && (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeEditingLineId === line.id) {
                                handleCancelEdit();
                              } else {
                                handleStartEdit(line);
                              }
                            }}
                            className="flex items-center cursor-pointer hover:opacity-85 active:scale-95 transition-transform"
                            title={`Click poet icon to edit Line ${lineNum}`}
                          >
                            {renderNameBadge(authorProfile)}
                          </button>
                        )}
                      </div>

                      {/* Edit and Action Buttons Above the Line */}
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(line)}
                          className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-200/50 transition-colors cursor-pointer"
                          title="Propose edit to line"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onProposeDelete(line.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Propose deleting line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Verse Line Text */}
                    <div className="w-full relative">
                      <p
                        className={`relative z-10 text-base sm:text-2xl font-normal tracking-wide whitespace-normal break-words py-1 pl-1 leading-snug sm:leading-relaxed ${theme.fontBodyClass} ${theme.textPrimaryClass}`}
                      >
                        {line.text}
                      </p>
                    </div>

                    {/* Active Inline Editing Box */}
                    {activeEditingLineId === line.id && (
                      <div className="mt-2 p-3.5 bg-amber-50/95 border border-amber-300 rounded-2xl shadow-xs animate-in fade-in duration-100">
                        <p className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-amber-600" />
                          Propose Revision to Line {lineNum}
                        </p>
                        <input
                          type="text"
                          value={proposalEditText}
                          onChange={(e) => setProposalEditText(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm sm:text-base bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendEditProposal(line.id)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl cursor-pointer transition-colors shadow-2xs"
                          >
                            Submit Proposal for Approval
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending Proposal Frame */}
                    {pendingProposal && (
                      <div className="mt-2 p-3.5 rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/80 shadow-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-rose-200/80">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>
                              {pendingProposal.type === 'edit'
                                ? `Proposed Edit by ${pendingProposal.proposerName}`
                                : `Proposed Deletion by ${pendingProposal.proposerName}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-500 font-mono">
                            Requires partner approval
                          </span>
                        </div>

                        {pendingProposal.type === 'edit' && (
                          <div className="space-y-1 mb-3">
                            <p className="text-xs text-stone-500 line-through">
                              Original: "{line.text}"
                            </p>
                            <p className="text-sm sm:text-base font-medium text-stone-900 italic font-serif">
                              Proposed: "{pendingProposal.newText}"
                            </p>
                          </div>
                        )}

                        {pendingProposal.type === 'delete' && (
                          <p className="text-xs text-stone-600 italic mb-3">
                            Proposing to remove this line from the poem.
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          {isProposer ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-500 italic flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                Waiting for partner...
                              </span>
                              <button
                                type="button"
                                onClick={() => onWithdrawProposal(pendingProposal.id)}
                                className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer"
                              >
                                Withdraw
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onVoteProposal(pendingProposal.id, false)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors"
                              >
                                <X className="w-3 h-3 text-rose-500" />
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => onVoteProposal(pendingProposal.id, true)}
                                className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer transition-colors shadow-2xs"
                              >
                                <Check className="w-3 h-3" />
                                Accept Change
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Turn Banner & Verse Composer */}
      <div
        className={`rounded-3xl border p-5 sm:p-6 transition-all shadow-md ${theme.cardClass} ${theme.cardBorderClass}`}
      >
        {/* Turn Status Indicator */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/60">
          <div className="flex items-center gap-2">
            <span className="text-base">{theme.icon}</span>
            <div>
              <p className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                {isMyTurn ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Your Turn to Rhyme
                  </span>
                ) : (
                  <span className="text-stone-600">
                    Waiting for <span className="font-semibold text-stone-900">{partnerProfile.name}</span> to rhyme
                  </span>
                )}
              </p>
              {lastLine && (
                <p className="text-[11px] text-stone-500 italic truncate max-w-sm sm:max-w-md mt-0.5">
                  Last rhyme was: "{lastLine.text}"
                </p>
              )}
            </div>
          </div>

          <div className="text-[10px] text-stone-400 font-mono tracking-tight text-right">
            <span>Autosave: Active</span>
          </div>
        </div>

        {/* Input Form with Continuous Keystroke Auto-Save */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={draftLine}
              onChange={(e) => setDraftLine(e.target.value)}
              disabled={!isMyTurn}
              placeholder={
                isMyTurn
                  ? 'Compose your rhyming line...'
                  : `Waiting for ${partnerProfile.name}'s turn... (Players alternate turns)`
              }
              className={`w-full px-4 py-3 text-base sm:text-lg rounded-2xl border transition-all focus:outline-none focus:ring-2 shadow-inner disabled:opacity-60 disabled:bg-stone-100/70 disabled:cursor-not-allowed ${theme.inputBgClass} ${theme.fontBodyClass}`}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-400">
                Writing as: {renderNameBadge(myProfile)}
              </span>
            </div>

            <button
              type="submit"
              disabled={!draftLine.trim() || isSubmitting || !isMyTurn}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${theme.accentClass} ${theme.accentHoverClass}`}
              title={
                !isMyTurn
                  ? `Waiting for ${partnerProfile.name}'s turn. Players alternate turns.`
                  : 'Submit line to partner'
              }
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Submitting...'
                  : !isMyTurn
                  ? "Waiting for Partner..."
                  : 'Submit Line'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
