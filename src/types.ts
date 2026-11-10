export type PlayerRole = 'player1' | 'player2';

export type DesignThemeId =
  | 'pink'
  | 'cute'
  | 'purple'
  | 'futuristic'
  | 'calm'
  | 'french-bulldog'
  | 'daddy-and-toy'
  | 'lined-notebook';

export type BadgeStyle = 'italic' | 'sans' | 'bracket' | 'monogram';

export interface ParticipantProfile {
  name: string;
  color: string;
  style: BadgeStyle;
  symbol: string;
}

export interface PoemLine {
  id: string;
  author: PlayerRole;
  authorName: string;
  text: string;
  timestamp: number;
  stanzaIndex: number;
}

export interface LineProposal {
  id: string;
  targetLineId: string;
  type: 'edit' | 'delete';
  newText?: string;
  proposer: PlayerRole;
  proposerName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  author: PlayerRole;
  authorName: string;
  text: string;
  timestamp: number;
  replyTo?: {
    id: string;
    authorName: string;
    text: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of author IDs
  referencedLineNumber?: number;
}

export interface ThemeSuggestion {
  id: string;
  proposer: PlayerRole;
  proposerName: string;
  themeId: DesignThemeId;
  timestamp: number;
}

export type GameMode = 'classic' | 'glimpse';

export interface RoomData {
  id: string;
  title: string;
  turn: PlayerRole;
  player1: ParticipantProfile;
  player2: ParticipantProfile;
  lines: PoemLine[];
  proposals: LineProposal[];
  messages: ChatMessage[];
  themeSuggestion?: ThemeSuggestion | null;
  gameMode?: GameMode;
  targetLineCount?: number;
  revealedWordCount?: number;
  createdAt: number;
  updatedAt: number;
}

export type ExportBorderStyle =
  | 'minimalist'
  | 'rustic'
  | 'modern'
  | 'classical'
  | 'celestial'
  | 'lined-notebook';

export type ExportFontStyle =
  | 'cormorant'
  | 'playfair'
  | 'cinzel'
  | 'fraunces'
  | 'jakarta';

export type ExportHeaderStyle =
  | 'curatorial'
  | 'monogram'
  | 'archival'
  | 'minimalist';
