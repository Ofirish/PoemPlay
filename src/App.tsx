/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Feather,
  Sparkles,
  RefreshCw,
  Link,
  LogIn,
  LogOut,
  Copy,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  RoomData,
  PoemLine,
  PlayerRole,
  DesignThemeId,
  ParticipantProfile,
  LineProposal,
  GameMode,
} from './types';
import { THEMES } from './lib/themes';
import {
  getRoom,
  saveRoom,
  subscribeToRoom,
  addLineToRoom,
  updateRoomFields,
} from './lib/firebase';
import { PoemCanvas } from './components/PoemCanvas';
import { FloatingWheelMenu } from './components/FloatingWheelMenu';
import { NewPoemModal } from './components/NewPoemModal';
import { ThemePickerModal } from './components/ThemePickerModal';
import { NamePaletteModal } from './components/NamePaletteModal';
import { HelpModal } from './components/HelpModal';
import { ExportStudioModal } from './components/ExportStudioModal';
import { ThemeSuggestionModal } from './components/ThemeSuggestionModal';
import { GameModeSettingsModal } from './components/GameModeSettingsModal';

const POETIC_NAME_SUGGESTIONS = [
  'Ode to the Starlight',
  'Dialogue in Autumn',
  'Whispers of the Crescent Moon',
  'Echoes of the Morning Sun',
  'Two Voices in Twilight',
  'Sonnet for a Wandering Soul',
  'The Secret River of Rhymes',
  'Velvet Nocturne',
  'Golden Cadence in the Mist',
  'Serenade of the Sea',
  'Dancing with Shadows',
  'Labyrinth of Quiet Verses',
];

const DEFAULT_POETIC_KEYS = [
  'moonlit-sonnet',
  'amber-starlight',
  'azure-whisper',
  'velvet-verse',
  'golden-cadence',
  'emerald-echo',
  'serene-rhyme',
  'notebook-cadence',
];

function getRandomRoomKey(): string {
  const base = DEFAULT_POETIC_KEYS[Math.floor(Math.random() * DEFAULT_POETIC_KEYS.length)];
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${base}-${randomSuffix}`;
}

/**
 * Parses either a full magic link URL or a direct room key.
 * Both formats are viable:
 * - https://example.com/?room=serene-rhyme-123&player=player2
 * - ?room=serene-rhyme-123&player=player1
 * - serene-rhyme-123
 */
export function parseMagicLinkOrKey(rawInput: string): { roomId: string; role?: PlayerRole } {
  const trimmed = rawInput.trim();
  if (!trimmed) return { roomId: '' };

  // 1. Try URL parsing
  try {
    if (trimmed.includes('?') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const urlString = trimmed.startsWith('http')
        ? trimmed
        : `http://localhost${trimmed.startsWith('/') ? '' : '/'}${trimmed.replace(/^\?/, '/?')}`;
      const parsedUrl = new URL(urlString);
      const r = parsedUrl.searchParams.get('room') || parsedUrl.searchParams.get('poem');
      const p = parsedUrl.searchParams.get('player');
      if (r) {
        return {
          roomId: r.trim(),
          role: p === 'player1' ? 'player1' : 'player2',
        };
      }
    }
  } catch {
    // Continue to regex
  }

  // 2. Query string fallback regex (e.g. "room=xyz" or "poem=xyz")
  const queryMatch = trimmed.match(/(?:[?&]|^)(?:room|poem)=([^&#\s]+)/i);
  if (queryMatch) {
    const r = queryMatch[1];
    const playerMatch = trimmed.match(/[?&]player=([^&#\s]+)/i);
    const role = playerMatch && playerMatch[1] === 'player1' ? 'player1' : 'player2';
    return { roomId: r.trim(), role };
  }

  // 3. Raw room key fallback: strip any leading '#' or '/' or quotes
  const cleaned = trimmed.replace(/^[#/?]+/, '').replace(/["']/g, '').trim();
  return { roomId: cleaned, role: 'player2' };
}

export default function App() {
  // Read room and player role from URL parameters with robust localStorage fallback
  const [roomId, setRoomId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('room') || params.get('poem');
    if (fromUrl && fromUrl.trim()) {
      try {
        localStorage.setItem('poemplay_active_room_id', fromUrl.trim());
      } catch {
        // ignore
      }
      return fromUrl.trim();
    }
    try {
      return localStorage.getItem('poemplay_active_room_id') || '';
    } catch {
      return '';
    }
  });

  const [currentPlayerRole, setCurrentPlayerRole] = useState<PlayerRole>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('player');
    const roomParam = params.get('room') || params.get('poem');
    if (p === 'player2') {
      try { localStorage.setItem('poemplay_active_player_role', 'player2'); } catch {}
      return 'player2';
    }
    if (p === 'player1') {
      try { localStorage.setItem('poemplay_active_player_role', 'player1'); } catch {}
      return 'player1';
    }
    // If URL has a room parameter but no player parameter:
    // This is someone opening a shared room link! They join as player2.
    if (roomParam) {
      try { localStorage.setItem('poemplay_active_player_role', 'player2'); } catch {}
      return 'player2';
    }
    try {
      const saved = localStorage.getItem('poemplay_active_player_role') as PlayerRole;
      if (saved === 'player2' || saved === 'player1') return saved;
    } catch {
      // ignore
    }
    return 'player1';
  });

  // Sync active roomId to localStorage
  useEffect(() => {
    if (roomId) {
      try {
        localStorage.setItem('poemplay_active_room_id', roomId);
      } catch {}
    }
  }, [roomId]);

  // Sync active player role to localStorage
  useEffect(() => {
    if (currentPlayerRole) {
      try {
        localStorage.setItem('poemplay_active_player_role', currentPlayerRole);
      } catch {}
    }
  }, [currentPlayerRole]);

  // Prompt requirement: "The default theme must be the lined notebook."
  const [currentThemeId, setCurrentThemeId] = useState<DesignThemeId>(() => {
    try {
      const saved = localStorage.getItem('poemplay_personal_theme') as DesignThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'lined-notebook';
  });

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  // Modals state
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewPoemModalOpen, setIsNewPoemModalOpen] = useState(false);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [showPoetNames, setShowPoetNames] = useState(true);

  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<string | null>(null);
  const [showShareThemeToast, setShowShareThemeToast] = useState(false);

  // Exit Room / Back to Room Setup Handler
  const handleBackToLogin = () => {
    setRoom(null);
    setRoomId('');
    try {
      localStorage.removeItem('poemplay_active_room_id');
      localStorage.removeItem('poemplay_active_player_role');
    } catch {
      // ignore
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('poem');
    url.searchParams.delete('player');
    window.history.replaceState({}, '', url.toString());
  };

  // Starting Screen state (Prompt: poem name suggestion, poet name, magic link creation/auto-generation, and enter existing room)
  const [startMode, setStartMode] = useState<'create' | 'join'>('create');
  const [createTitle, setCreateTitle] = useState(() => POETIC_NAME_SUGGESTIONS[0]);
  const [creatorName, setCreatorName] = useState('Poet One');
  const [customSecretKey, setCustomSecretKey] = useState(() => getRandomRoomKey());

  // Game Mode Selection state (Default Glimpse Mode so line target & word reveal controls are immediately visible!)
  const [createGameMode, setCreateGameMode] = useState<GameMode>('glimpse');
  const [createTargetLinesInput, setCreateTargetLinesInput] = useState<string>('8');
  const [createRevealedWordsInput, setCreateRevealedWordsInput] = useState<string>('2');

  const parsedCreateLines = parseInt(createTargetLinesInput, 10);
  const validCreateTargetLines = isNaN(parsedCreateLines)
    ? 8
    : Math.max(2, Math.min(1000, parsedCreateLines));

  const parsedCreateWords = parseInt(createRevealedWordsInput, 10);
  const validCreateRevealedWords = isNaN(parsedCreateWords)
    ? 2
    : Math.max(0, Math.min(5, parsedCreateWords));

  // Join Existing Room state (magic link or room key, both viable)
  const [joinLinkOrKey, setJoinLinkOrKey] = useState('');
  const [joinPoetName, setJoinPoetName] = useState('Poet Two');
  const [joinRole, setJoinRole] = useState<PlayerRole>('player2');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  // Sync theme changes to local storage
  const handleSelectTheme = (themeId: DesignThemeId) => {
    setCurrentThemeId(themeId);
    try {
      localStorage.setItem('poemplay_personal_theme', themeId);
    } catch {
      // ignore
    }
  };

  // Cycle to a random poetic title suggestion
  const handleSuggestNextTitle = () => {
    const candidates = POETIC_NAME_SUGGESTIONS.filter((s) => s !== createTitle);
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    setCreateTitle(next);
  };

  // Auto-generate fresh random key
  const handleAutoGenerateKey = () => {
    setCustomSecretKey(getRandomRoomKey());
  };



  // Subscribe to room in Firestore when roomId is set
  useEffect(() => {
    if (!roomId) return;

    setIsLoadingRoom(true);
    let isMounted = true;

    // Setup real-time listener with automatic sync for mode, profiles, and lines
    const unsubscribe = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        if (!isMounted) return;
        if (updatedRoom) {
          setRoom((prev) => {
            if (!prev) return updatedRoom;
            // If updatedRoom explicitly cleared lines (e.g. New Poem reset), respect empty array
            if ((updatedRoom.lines || []).length === 0 && (prev.lines || []).length > 0 && updatedRoom.updatedAt >= prev.updatedAt) {
              return updatedRoom;
            }
            // Merge remote lines with any very recent optimistic local lines (< 4s old)
            const remoteIds = new Set((updatedRoom.lines || []).map((l) => l.id));
            const recentOptimistic = (prev.lines || []).filter(
              (l) => !remoteIds.has(l.id) && Date.now() - l.timestamp < 4000
            );
            const mergedLines = [...(updatedRoom.lines || []), ...recentOptimistic].map((l) => ({
              ...l,
              authorName:
                l.author === 'player1'
                  ? updatedRoom.player1?.name || l.authorName
                  : updatedRoom.player2?.name || l.authorName,
            }));
            mergedLines.sort((a, b) => a.timestamp - b.timestamp);

            return {
              ...updatedRoom,
              lines: mergedLines,
            };
          });
        }
        setIsLoadingRoom(false);
      },
      (err) => {
        console.error('Subscription error:', err);
        if (isMounted) setIsLoadingRoom(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [roomId]);

  // Handle URL sync
  const updateUrlWithRoom = useCallback((id: string, role: PlayerRole) => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', id);
    url.searchParams.set('player', role);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Copy Magic Link to clipboard
  const handleCopyMagicLink = () => {
    if (!room) return;
    const origin = window.location.hostname.endsWith('.run.app')
      ? 'https://poemplay.ai.studio'
      : window.location.origin;
    const base = origin + window.location.pathname;
    const url = new URL(base);
    url.searchParams.set('room', room.id);
    url.searchParams.set(
      'player',
      currentPlayerRole === 'player1' ? 'player2' : 'player1'
    );

    navigator.clipboard.writeText(url.toString()).then(() => {
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 2500);
    });
  };

  // Create room handler - Instant transition with background persistence
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoomKey = customSecretKey.trim() || getRandomRoomKey();
    const newRoom: RoomData = {
      id: newRoomKey,
      title: createTitle.trim() || 'Dialogue of Rhymes',
      turn: 'player1',
      player1: {
        name: creatorName.trim() || 'Poet One',
        color: 'rose',
        style: 'italic',
        symbol: '🪶',
      },
      player2: {
        name: 'Poet Two',
        color: 'emerald',
        style: 'sans',
        symbol: '🌸',
      },
      lines: [],
      proposals: [],
      messages: [
        {
          id: 'welcome-1',
          author: 'player1',
          authorName: creatorName.trim() || 'Poet One',
          text:
            createGameMode === 'glimpse'
              ? `Glimpse Mode initialized! Target: ${validCreateTargetLines} lines. Revealing last ${validCreateRevealedWords} word(s) per line.`
              : 'Canvas initialized. Ready to rhyme!',
          timestamp: Date.now(),
        },
      ],
      gameMode: createGameMode,
      targetLineCount: validCreateTargetLines,
      revealedWordCount: validCreateRevealedWords,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Instant optimistic transition!
    setRoom(newRoom);
    setRoomId(newRoomKey);
    setCurrentPlayerRole('player1');
    try {
      localStorage.setItem('poemplay_active_room_id', newRoomKey);
      localStorage.setItem('poemplay_active_player_role', 'player1');
    } catch {
      // ignore
    }
    updateUrlWithRoom(newRoomKey, 'player1');
    setIsLoadingRoom(false);

    // Save in background
    saveRoom(newRoom).catch((err) => {
      console.warn('Background save room note:', err);
    });
  };

  // Helper to handle link or key input changes with auto-detection of role
  const handleJoinInputChange = (val: string) => {
    setJoinLinkOrKey(val);
    setJoinError(null);
    if (val.includes('player=player2')) {
      setJoinRole('player2');
    }
  };

  // Helper to paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleJoinInputChange(text);
      }
    } catch {
      // ignore clipboard permission error
    }
  };

  // Join Existing Room handler (Prompt: magic link or key for the room so they can enter an existing room. Both viable.)
  const handleJoinExistingRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const parsed = parseMagicLinkOrKey(joinLinkOrKey);

    if (!parsed.roomId) {
      setJoinError('Please enter a valid room key or paste your magic link.');
      return;
    }

    setIsJoiningRoom(true);
    // Explicit perspective selection: user can pick Player 2 (default) or Player 1
    const chosenRole: PlayerRole = joinRole || 'player2';
    const poetName = joinPoetName.trim() || (chosenRole === 'player1' ? 'Poet One' : 'Poet Two');

    try {
      const existingRoom = await getRoom(parsed.roomId);

      if (existingRoom) {
        // Update ONLY joining poet's profile name in Firestore, strictly keeping other player's profile intact!
        const existingProfile = chosenRole === 'player1' ? existingRoom.player1 : existingRoom.player2;
        const updatedRoom: RoomData = {
          ...existingRoom,
          [chosenRole]: {
            ...existingProfile,
            name: poetName,
          },
          updatedAt: Date.now(),
        };
        await saveRoom(updatedRoom);
        setRoom(updatedRoom);
      } else {
        // Initialize room if entering with a key that hasn't synced yet
        const newRoom: RoomData = {
          id: parsed.roomId,
          title: 'Dialogue of Rhymes',
          turn: 'player1',
          player1: {
            name: chosenRole === 'player1' ? poetName : 'Poet One',
            color: 'rose',
            style: 'italic',
            symbol: '🪶',
          },
          player2: {
            name: chosenRole === 'player2' ? poetName : 'Poet Two',
            color: 'emerald',
            style: 'sans',
            symbol: '🌸',
          },
          lines: [],
          proposals: [],
          messages: [
            {
              id: `welcome-${Date.now()}`,
              author: chosenRole,
              authorName: poetName,
              text: 'Room opened! Ready to rhyme.',
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await saveRoom(newRoom);
        setRoom(newRoom);
      }

      setRoomId(parsed.roomId);
      setCurrentPlayerRole(chosenRole);
      try {
        localStorage.setItem('poemplay_active_room_id', parsed.roomId);
        localStorage.setItem('poemplay_active_player_role', chosenRole);
      } catch {
        // ignore
      }
      updateUrlWithRoom(parsed.roomId, chosenRole);
    } catch (err) {
      console.error('Failed to join room:', err);
      setJoinError('Could not connect to room. Please check your connection or room key.');
    } finally {
      setIsJoiningRoom(false);
    }
  };

  // Change poem title in-game (any participant): updates ONLY title without touching lines
  const handleChangeTitle = async (newTitle: string) => {
    if (!room) return;
    setRoom((prev) => (prev ? { ...prev, title: newTitle, updatedAt: Date.now() } : null));
    await updateRoomFields(room.id, { title: newTitle });
  };

  // Real-time update of Game Mode settings (target lines & revealed words)
  const handleUpdateGameSettings = async (
    gameMode: GameMode,
    targetLineCount: number,
    revealedWordCount: number
  ) => {
    if (!room) return;
    setRoom((prev) =>
      prev
        ? {
            ...prev,
            gameMode,
            targetLineCount,
            revealedWordCount,
            updatedAt: Date.now(),
          }
        : null
    );
    await updateRoomFields(room.id, {
      gameMode,
      targetLineCount,
      revealedWordCount,
    });
  };

  // Double-verified New Poem Action
  const handleConfirmNewPoem = async (
    newMode?: GameMode,
    newTargetLines?: number,
    newRevealedWords?: number
  ) => {
    if (!room) return;
    const nextSuggestedTitle =
      POETIC_NAME_SUGGESTIONS[
        Math.floor(Math.random() * POETIC_NAME_SUGGESTIONS.length)
      ];

    const selectedMode = newMode || room.gameMode || 'classic';
    const selectedTargetLines = Math.max(
      2,
      Math.min(1000, newTargetLines || room.targetLineCount || 8)
    );
    const selectedRevealedWords = Math.max(
      0,
      Math.min(5, newRevealedWords ?? room.revealedWordCount ?? 2)
    );

    const modeDesc =
      selectedMode === 'glimpse'
        ? `Glimpse Mode (${selectedTargetLines} lines, ${selectedRevealedWords} trailing words revealed)`
        : 'Classic Canvas';

    const updatedMessages = [
      ...room.messages,
      {
        id: `sys-${Date.now()}`,
        author: currentPlayerRole,
        authorName: 'PoemPlay System',
        text: `A fresh poem canvas has opened: "${nextSuggestedTitle}" [Mode: ${modeDesc}]. Ready for new verses!`,
        timestamp: Date.now(),
      },
    ];

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            title: nextSuggestedTitle,
            turn: 'player1',
            lines: [],
            proposals: [],
            messages: updatedMessages,
            gameMode: selectedMode,
            targetLineCount: selectedTargetLines,
            revealedWordCount: selectedRevealedWords,
            updatedAt: Date.now(),
          }
        : null
    );

    await updateRoomFields(room.id, {
      title: nextSuggestedTitle,
      turn: 'player1',
      lines: [],
      proposals: [],
      messages: updatedMessages,
      gameMode: selectedMode,
      targetLineCount: selectedTargetLines,
      revealedWordCount: selectedRevealedWords,
    });

    // Clear autosave draft
    try {
      localStorage.removeItem(`poemplay_draft_${room.id}`);
    } catch {
      // ignore
    }
  };

  // Share active theme with partner: updates ONLY themeSuggestion
  const handleShareMyTheme = async () => {
    if (!room) return;
    const myProfile = currentPlayerRole === 'player1' ? room.player1 : room.player2;
    const suggestion = {
      id: `sug-${Date.now()}`,
      proposer: currentPlayerRole,
      proposerName: myProfile.name,
      themeId: currentThemeId,
      timestamp: Date.now(),
    };

    setRoom((prev) => (prev ? { ...prev, themeSuggestion: suggestion, updatedAt: Date.now() } : null));
    await updateRoomFields(room.id, { themeSuggestion: suggestion });
    setShowShareThemeToast(true);
    setTimeout(() => setShowShareThemeToast(false), 3000);
  };

  // Accept theme suggestion (private to recipient)
  const handleAcceptThemeSuggestion = (suggestedTheme: DesignThemeId) => {
    handleSelectTheme(suggestedTheme);
    if (room?.themeSuggestion) {
      setDismissedSuggestionId(room.themeSuggestion.id);
    }
  };

  // Decline theme suggestion (private to recipient)
  const handleDeclineThemeSuggestion = () => {
    if (room?.themeSuggestion) {
      setDismissedSuggestionId(room.themeSuggestion.id);
    }
  };

  // Line submission handler with atomic Firestore transaction:
  // Guarantees lines from BOTH poets are preserved without race conditions and strict turn alternation!
  const handleSubmitLine = async (text: string) => {
    if (!room || room.turn !== currentPlayerRole) return;
    const authorProfile =
      currentPlayerRole === 'player1' ? room.player1 : room.player2;

    const newLine: PoemLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      author: currentPlayerRole,
      authorName: authorProfile.name,
      text,
      timestamp: Date.now(),
      stanzaIndex: Math.floor((room.lines || []).length / 4),
    };

    const nextTurn: PlayerRole =
      currentPlayerRole === 'player1' ? 'player2' : 'player1';

    // Optimistically show line immediately
    setRoom((prev) => {
      if (!prev) return null;
      const existing = prev.lines || [];
      const hasLine = existing.some((l) => l.id === newLine.id);
      return {
        ...prev,
        lines: hasLine ? existing : [...existing, newLine],
        turn: nextTurn,
        updatedAt: Date.now(),
      };
    });

    // Atomic transaction in Firestore ensures no partner lines are lost
    await addLineToRoom(room.id, newLine, nextTurn);
  };

  // Line proposal edit handler: updates ONLY proposals
  const handleProposeEdit = async (lineId: string, newText: string) => {
    if (!room) return;
    const authorProfile =
      currentPlayerRole === 'player1' ? room.player1 : room.player2;

    const newProposal: LineProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetLineId: lineId,
      type: 'edit',
      newText,
      proposer: currentPlayerRole,
      proposerName: authorProfile.name,
      status: 'pending',
      timestamp: Date.now(),
    };

    const updatedProposals = [
      ...room.proposals.filter((p) => p.targetLineId !== lineId),
      newProposal,
    ];

    setRoom((prev) => (prev ? { ...prev, proposals: updatedProposals, updatedAt: Date.now() } : null));
    await updateRoomFields(room.id, { proposals: updatedProposals });
  };

  // Line proposal delete handler: updates ONLY proposals
  const handleProposeDelete = async (lineId: string) => {
    if (!room) return;
    const authorProfile =
      currentPlayerRole === 'player1' ? room.player1 : room.player2;

    const newProposal: LineProposal = {
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetLineId: lineId,
      type: 'delete',
      proposer: currentPlayerRole,
      proposerName: authorProfile.name,
      status: 'pending',
      timestamp: Date.now(),
    };

    const updatedProposals = [
      ...room.proposals.filter((p) => p.targetLineId !== lineId),
      newProposal,
    ];

    setRoom((prev) => (prev ? { ...prev, proposals: updatedProposals, updatedAt: Date.now() } : null));
    await updateRoomFields(room.id, { proposals: updatedProposals });
  };

  // Partner vote on proposal (Accept/Reject): updates lines and proposals
  const handleVoteProposal = async (proposalId: string, accept: boolean) => {
    if (!room) return;
    const proposal = room.proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    let updatedLines = [...room.lines];

    if (accept) {
      if (proposal.type === 'edit' && proposal.newText) {
        updatedLines = updatedLines.map((l) =>
          l.id === proposal.targetLineId ? { ...l, text: proposal.newText! } : l
        );
      } else if (proposal.type === 'delete') {
        updatedLines = updatedLines.filter((l) => l.id !== proposal.targetLineId);
      }
    }

    const updatedProposals = room.proposals.filter((p) => p.id !== proposalId);

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            lines: updatedLines,
            proposals: updatedProposals,
            updatedAt: Date.now(),
          }
        : null
    );

    await updateRoomFields(room.id, {
      lines: updatedLines,
      proposals: updatedProposals,
    });
  };

  // Withdraw own proposal: updates ONLY proposals
  const handleWithdrawProposal = async (proposalId: string) => {
    if (!room) return;
    const updatedProposals = room.proposals.filter((p) => p.id !== proposalId);
    setRoom((prev) => (prev ? { ...prev, proposals: updatedProposals, updatedAt: Date.now() } : null));
    await updateRoomFields(room.id, { proposals: updatedProposals });
  };



  // Participant profile update handler: updates profile AND syncs authorName across existing lines & proposals
  const handleSaveProfile = async (updatedProfile: ParticipantProfile) => {
    if (!room) return;
    const isPlayer1 = currentPlayerRole === 'player1';
    const profileKey = isPlayer1 ? 'player1' : 'player2';

    const updatedLines = (room.lines || []).map((l) =>
      l.author === currentPlayerRole ? { ...l, authorName: updatedProfile.name } : l
    );
    const updatedProposals = (room.proposals || []).map((p) =>
      p.proposer === currentPlayerRole ? { ...p, proposerName: updatedProfile.name } : p
    );

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            [profileKey]: updatedProfile,
            lines: updatedLines,
            proposals: updatedProposals,
            updatedAt: Date.now(),
          }
        : null
    );
    await updateRoomFields(room.id, {
      [profileKey]: updatedProfile,
      lines: updatedLines,
      proposals: updatedProposals,
    });
  };

  const currentTheme = THEMES[currentThemeId] || THEMES['lined-notebook'];
  const currentProfile = room
    ? currentPlayerRole === 'player1'
      ? room.player1
      : room.player2
    : null;

  // Prompt requirement: "The starting screen must have only the poem name suggestion, the poet name, the first one opens the room, and the magic link creation or auto-generation. Remove the theme selection from the opening screen."
  if (!roomId || (!room && !isLoadingRoom)) {
    return (
      <div className={`min-h-screen flex flex-col justify-between ${currentTheme.bgClass} transition-colors duration-300 relative`}>
        {/* Simple Wordmark Header - NO theme selector */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200/60 bg-white/70 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
              <Feather className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-display-playfair">
              PoemPlay
            </span>
          </div>
          <span className="text-xs text-stone-500 font-serif italic">
            Collaborative Rhyming Canvas
          </span>
        </header>

        {/* Starting Form: Tabbed choice between "Create New Poem" and "Enter Existing Room" (Magic link or room key, both viable!) */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-6 py-8 flex flex-col justify-center">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 border border-stone-200 shadow-xl space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setStartMode('create')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  startMode === 'create'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Feather className="w-3.5 h-3.5 text-rose-500" />
                <span>Create New Poem</span>
              </button>
              <button
                type="button"
                onClick={() => setStartMode('join')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  startMode === 'join'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Link className="w-3.5 h-3.5 text-sky-500" />
                <span>Enter Existing Room</span>
              </button>
            </div>

            {startMode === 'create' ? (
              <>
                <div className="text-center space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 font-display-playfair">
                    Begin Your Poem
                  </h1>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                    Two poets rhyming verse by verse. All studio settings, themes, and exports will be available in-game.
                  </p>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-4 pt-1">
                  {/* 1. Poem Name Suggestion */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Poem Name Suggestion
                      </label>
                      <button
                        type="button"
                        onClick={handleSuggestNextTitle}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                        title="Suggest another poetic title"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>🎲 Suggest Another</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder="e.g. Dialogue in Autumn"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 shadow-inner"
                      required
                    />
                  </div>

                  {/* 2. Poet Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Your Poet Name
                    </label>
                    <input
                      type="text"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Maya, Julian..."
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 shadow-inner"
                      required
                    />
                  </div>

                  {/* 3. Magic Link Creation or Auto-Generation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Magic Link Room Key
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoGenerateKey}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                        title="Auto-generate a new room key"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>🎲 Auto-Generate</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={customSecretKey}
                      onChange={(e) => setCustomSecretKey(e.target.value)}
                      placeholder="e.g. moonlit-sonnet-42"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900 font-mono shadow-inner"
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      A unique secret key for your room. Your partner joins as Player 2 with this magic link.
                    </p>
                  </div>

                  {/* Game Mode Selection (Classic Canvas vs Glimpse Mode) */}
                  <div className="space-y-2 pt-1 border-t border-stone-100">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      Choose Game Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCreateGameMode('classic')}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          createGameMode === 'classic'
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Feather className="w-3.5 h-3.5 text-amber-400" />
                          <span>Classic Canvas</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-snug ${createGameMode === 'classic' ? 'text-stone-300' : 'text-stone-500'}`}>
                          Continuous open poem. All lines visible to both poets continuously.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCreateGameMode('glimpse')}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          createGameMode === 'glimpse'
                            ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                            : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100/80 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Eye className="w-3.5 h-3.5 text-amber-200" />
                          <span>Glimpse Mode</span>
                        </div>
                        <p className={`text-[10px] mt-1 leading-snug ${createGameMode === 'glimpse' ? 'text-amber-100' : 'text-amber-800'}`}>
                          Mystery poem! Each poet only sees trailing words until final line reveal.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Glimpse Mode Custom Settings */}
                  {createGameMode === 'glimpse' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4 text-amber-600" />
                          <span>Glimpse Rules & Reveal Settings</span>
                        </span>
                        <span className="text-[10px] font-mono bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md">
                          Applies to Both Poets
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-amber-950">
                              Poem Length Before Reveal (2 - 1000 lines)
                            </label>
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={createTargetLinesInput}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              setCreateTargetLinesInput(raw);
                            }}
                            onBlur={() => {
                              setCreateTargetLinesInput(String(validCreateTargetLines));
                            }}
                            placeholder="Enter any number from 2 to 1000"
                            className="w-full px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                          />
                          <div className="flex items-center gap-1 flex-wrap mt-1.5">
                            <span className="text-[10px] text-amber-800 mr-0.5">Presets:</span>
                            {[4, 6, 8, 12, 16, 20, 50, 100].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setCreateTargetLinesInput(String(num))}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                  validCreateTargetLines === num
                                    ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-amber-800 mt-1">
                            Full poem unveils on line <span className="font-bold underline">{validCreateTargetLines}</span>!
                          </p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-amber-950 mb-1.5">
                            Words Revealed at End of Line (0 - 5 words)
                          </label>
                          <div className="grid grid-cols-6 gap-1.5 mb-2">
                            {[0, 1, 2, 3, 4, 5].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => setCreateRevealedWordsInput(String(w))}
                                className={`py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                  validCreateRevealedWords === w
                                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
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
                            value={createRevealedWordsInput}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              setCreateRevealedWordsInput(raw);
                            }}
                            onBlur={() => {
                              setCreateRevealedWordsInput(String(validCreateRevealedWords));
                            }}
                            placeholder="Enter 0, 1, 2, 3, 4, or 5"
                            className="w-full px-3 py-2 text-xs font-bold bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 shadow-2xs"
                          />
                          <p className="text-[10px] text-amber-800 mt-1">
                            {validCreateRevealedWords === 0
                              ? 'Fully blind! (0 words revealed at the end of each line)'
                              : `Last ${validCreateRevealedWords} word(s) revealed at the end of each line`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. First One Opens the Room */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoadingRoom}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Feather className="w-4 h-4 text-amber-300" />
                      <span>{isLoadingRoom ? 'Preparing Canvas...' : 'Open Room & Begin Rhyming'}</span>
                    </button>
                    <p className="text-center text-[11px] text-stone-400 mt-2">
                      First poet opens the room. You can share your magic link inside with your co-creator.
                    </p>
                  </div>

                  {/* Quick toggle link to Join */}
                  <div className="pt-2 text-center border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setStartMode('join')}
                      className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Received a magic link or room key?</span>
                      <span className="font-semibold text-sky-600 underline">Enter existing room &rarr;</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Enter Existing Room (User request: magic link or key for the room so they can enter an existing room. Both should be viable.) */
              <>
                <div className="text-center space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-stone-900 font-display-playfair">
                    Enter an Existing Room
                  </h1>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                    Paste the magic link your partner sent you, or type the room key. Both are fully viable!
                  </p>
                </div>

                <form onSubmit={handleJoinExistingRoom} className="space-y-4 pt-1">
                  {/* Magic Link or Room Key Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                        <span>Magic Link or Room Key</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-medium lowercase">
                          link or key
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={handlePasteClipboard}
                        className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                        title="Paste from clipboard"
                      >
                        <Copy className="w-3 h-3" />
                        <span>📋 Paste</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={joinLinkOrKey}
                      onChange={(e) => handleJoinInputChange(e.target.value)}
                      placeholder="Paste link (https://...) or room key (e.g. moonlit-sonnet-42)"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-stone-900 font-mono shadow-inner"
                      required
                      autoFocus
                    />
                    <p className="text-[11px] text-stone-400 mt-1">
                      You can paste a full URL link (e.g. <span className="font-mono text-stone-500">https://...?room=xyz</span>) or a direct room key.
                    </p>
                  </div>

                  {/* Poet Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Your Poet Name
                    </label>
                    <input
                      type="text"
                      value={joinPoetName}
                      onChange={(e) => setJoinPoetName(e.target.value)}
                      placeholder="e.g. Poet Two, Maya..."
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 text-stone-900 shadow-inner"
                      required
                    />
                  </div>

                  {/* Join As Role Selection */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Join Perspective
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setJoinRole('player2')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          joinRole === 'player2'
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>🌸 Player 2</span>
                          {joinRole === 'player2' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${joinRole === 'player2' ? 'text-stone-300' : 'text-stone-400'}`}>
                          Responding Partner (Default)
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setJoinRole('player1')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                          joinRole === 'player1'
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>🪶 Player 1</span>
                          {joinRole === 'player1' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                        <p className={`text-[10px] mt-0.5 ${joinRole === 'player1' ? 'text-stone-300' : 'text-stone-400'}`}>
                          Opening Poet
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {joinError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  {/* Enter Room Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isJoiningRoom || !joinLinkOrKey.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isJoiningRoom ? 'Connecting to Room...' : 'Enter Room & Begin Rhyming'}</span>
                    </button>
                  </div>

                  {/* Quick toggle link back to Create */}
                  <div className="pt-2 text-center border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setStartMode('create')}
                      className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Want to start a brand new poem instead?</span>
                      <span className="font-semibold text-rose-600 underline">Create new poem &rarr;</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-stone-400">
          PoemPlay · Real-time Co-Op Poetry & Rhyme Canvas
        </footer>
      </div>
    );
  }

  // Active Poem Canvas View - Clean in-game presentation (no header button overlaps!)
  return (
    <div className={`min-h-screen flex flex-col justify-between ${currentTheme.bgClass} transition-colors duration-300 relative`}>
      {/* In-Game Header: Includes Game Mode Rules button and Back to Setup / Exit Room button */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 border-b border-stone-200/60 bg-white/80 backdrop-blur-md shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <Feather className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-900 font-display-playfair whitespace-nowrap">
            PoemPlay
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xs text-stone-500 italic font-serif truncate hidden md:block max-w-xs">
            {room?.title ? `"${room.title}"` : 'Collaborative Canvas'}
          </div>

          <button
            type="button"
            onClick={() => setIsGameModeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-all cursor-pointer shadow-2xs"
            title="Set Number of Lines & Words Shown (Glimpse Settings)"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>⚙️ Game Mode Rules</span>
          </button>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-900 hover:bg-stone-800 text-stone-100 border border-stone-700 transition-all cursor-pointer shadow-2xs"
            title="Return to Room Setup / Starting Screen"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>🚪 Back to Setup</span>
          </button>
        </div>
      </header>

      {/* Share Theme Notification Toast for sender */}
      {showShareThemeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-300" />
          <span>Theme suggestion sent to your partner!</span>
        </div>
      )}

      {/* Main Canvas Workspace */}
      <main className="flex-1 flex flex-col justify-start">
        {room && (
          <PoemCanvas
            room={room}
            currentPlayerRole={currentPlayerRole}
            currentThemeId={currentThemeId}
            highlightedLineNumber={null}
            showPoetNames={showPoetNames}
            onToggleShowPoetNames={() => setShowPoetNames((prev) => !prev)}
            onSubmitLine={handleSubmitLine}
            onProposeEdit={handleProposeEdit}
            onProposeDelete={handleProposeDelete}
            onVoteProposal={handleVoteProposal}
            onWithdrawProposal={handleWithdrawProposal}
            onChangeTitle={handleChangeTitle}
            onOpenNewPoemModal={() => setIsNewPoemModalOpen(true)}
            onOpenGameModeModal={() => setIsGameModeModalOpen(true)}
            onOpenNameModal={() => setIsNameModalOpen(true)}
          />
        )}
      </main>

      {/* Floating Movable Wheel Menu */}
      {room && (
        <FloatingWheelMenu
          onBackToLogin={handleBackToLogin}
          onOpenGameModeModal={() => setIsGameModeModalOpen(true)}
          onCopyMagicLink={handleCopyMagicLink}
          hasCopiedLink={hasCopiedLink}
          onOpenExportStudio={() => setIsExportModalOpen(true)}
          onOpenThemeModal={() => setIsThemePickerOpen(true)}
          onOpenNameModal={() => setIsNameModalOpen(true)}
          onOpenNewPoemModal={() => setIsNewPoemModalOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* Double Verification New Poem Modal */}
      {room && (
        <NewPoemModal
          isOpen={isNewPoemModalOpen}
          onClose={() => setIsNewPoemModalOpen(false)}
          room={room}
          onConfirmNewPoem={handleConfirmNewPoem}
          onOpenExportStudio={() => setIsExportModalOpen(true)}
        />
      )}

      {/* Real-time Game Mode & Glimpse Settings Modal */}
      {room && (
        <GameModeSettingsModal
          isOpen={isGameModeModalOpen}
          onClose={() => setIsGameModeModalOpen(false)}
          room={room}
          onUpdateGameSettings={handleUpdateGameSettings}
        />
      )}

      {/* Theme Picker Modal */}
      <ThemePickerModal
        isOpen={isThemePickerOpen}
        onClose={() => setIsThemePickerOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={handleSelectTheme}
        onShareCurrentTheme={handleShareMyTheme}
      />

      {/* Theme Suggestion Pop-Up on Partner's Screen */}
      <ThemeSuggestionModal
        suggestion={
          room?.themeSuggestion &&
          room.themeSuggestion.proposer !== currentPlayerRole &&
          room.themeSuggestion.id !== dismissedSuggestionId
            ? room.themeSuggestion
            : null
        }
        onAccept={handleAcceptThemeSuggestion}
        onDecline={handleDeclineThemeSuggestion}
      />

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {room && currentProfile && (
        <NamePaletteModal
          isOpen={isNameModalOpen}
          onClose={() => setIsNameModalOpen(false)}
          profile={currentProfile}
          onSave={handleSaveProfile}
          playerRole={currentPlayerRole}
        />
      )}

      {room && (
        <ExportStudioModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          room={room}
          currentThemeId={currentThemeId}
          initialShowPoetNames={showPoetNames}
        />
      )}
    </div>
  );
}
