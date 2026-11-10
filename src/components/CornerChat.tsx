import { useState, useRef, useEffect, ReactNode } from 'react';
import {
  MessageSquare,
  X,
  Send,
  CornerDownRight,
  Smile,
  Hash,
  ChevronDown,
  Feather,
  Share2,
  Copy,
  Check,
  Download,
  Palette,
  User,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import { ChatMessage, PlayerRole, RoomData, DesignThemeId } from '../types';
import { THEMES } from '../lib/themes';
import { renderNameBadge } from './NamePaletteModal';

interface CornerChatProps {
  room: RoomData;
  currentPlayerRole: PlayerRole;
  currentThemeId: DesignThemeId;
  onClose: () => void;
  onSelectTheme: (themeId: DesignThemeId) => void;
  onShareCurrentTheme: () => void;
  onOpenNameModal: () => void;
  onOpenExportModal: () => void;
  onCopyMagicLink: () => void;
  hasCopiedLink: boolean;
  onSwitchRole: () => void;
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onScrollToLine: (lineNumber: number) => void;
}

const COMMON_EMOJIS = ['❤️', '✨', '🔥', '👏', '🥺', '🌸', '🐾', '💡'];

export function CornerChat({
  room,
  currentPlayerRole,
  currentThemeId,
  onClose,
  onSelectTheme,
  onShareCurrentTheme,
  onOpenNameModal,
  onOpenExportModal,
  onCopyMagicLink,
  hasCopiedLink,
  onSwitchRole,
  onSendMessage,
  onReactMessage,
  onScrollToLine,
}: CornerChatProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const [customEmojiInput, setCustomEmojiInput] = useState('');
  const [showLinePicker, setShowLinePicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.messages.length, isSettingsOpen]);

  const currentProfile =
    currentPlayerRole === 'player1' ? room.player1 : room.player2;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    // Detect if user referenced a line like #1 or Line 1
    const match = text.match(/(?:#|line\s*)(\d+)/i);
    const referencedLineNumber = match ? parseInt(match[1], 10) : undefined;

    onSendMessage({
      author: currentPlayerRole,
      authorName: currentProfile.name,
      text,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            authorName: replyTarget.authorName,
            text: replyTarget.text,
          }
        : undefined,
      referencedLineNumber,
    });

    setInputText('');
    setReplyTarget(null);
    setShowLinePicker(false);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    onReactMessage(messageId, emoji);
    setShowEmojiPickerFor(null);
    setCustomEmojiInput('');
  };

  const insertLineReference = (lineNum: number) => {
    setInputText((prev) => (prev ? `${prev} [Line ${lineNum}]` : `[Line ${lineNum}] `));
    setShowLinePicker(false);
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 select-none">
      {/* Expanded Corner Chat Window */}
      <div className="w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 bg-stone-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
              {isSettingsOpen ? (
                <Feather className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-rose-300" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-stone-900 truncate">
                {isSettingsOpen ? 'Quill Studio Settings' : 'Co-Op Rhyme Chat'}
              </h3>
              <p className="text-[10px] text-stone-400 truncate">
                {isSettingsOpen
                  ? 'Canvas Controls & Preferences'
                  : `Chat as ${currentProfile.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quill Settings Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer shadow-2xs ${
                isSettingsOpen
                  ? 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
              }`}
              title="Quill Settings (Magic Link, Export, Themes, Name)"
              aria-label="Toggle settings"
            >
              <Feather className="w-3.5 h-3.5 text-amber-500" />
              <span>{isSettingsOpen ? 'Chat' : 'Settings'}</span>
            </button>

            {/* Minimize / Close into Quill */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
              title="Minimize chat back into Quill"
              aria-label="Minimize"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
              title="Close chat into Quill"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

          {/* Body: Either Quill Settings OR Chat Messages */}
          {isSettingsOpen ? (
            /* Quill Studio Settings View (Prompt requirement) */
            <div className="flex-1 min-h-0 flex flex-col bg-stone-50/50">
              <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5">
                <Feather className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-semibold">In-Game Studio Controls</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Manage your magic link, export the finished poem, switch themes, and customize your poet name.
                  </p>
                </div>
              </div>

              {/* 1. Magic Link Section */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Share2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Shared Magic Link</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">Room: {room.id}</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Invite your rhyming partner. They will automatically join as Player 2.
                </p>
                <button
                  type="button"
                  onClick={onCopyMagicLink}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    hasCopiedLink
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {hasCopiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Magic Link Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Magic Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. Fine-Art Export Studio Section */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <Download className="w-3.5 h-3.5 text-blue-500" />
                  <span>Export Artwork Studio</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Download high-resolution PNG or printable PDF with 6 decorative borders (including Lined Notebook) & typography.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onOpenExportModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer border border-stone-300/80"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Open Fine-Art Export Studio</span>
                </button>
              </div>

              {/* 3. Theme Changer Section */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    <span>Personal Design Theme</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Client-side only</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Choose your aesthetic canvas. Your partner keeps their own choice.
                </p>

                {/* 8 Themes Grid */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {Object.values(THEMES).map((theme) => {
                    const isSelected = theme.id === currentThemeId;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onSelectTheme(theme.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-semibold'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
                        }`}
                      >
                        <span className="text-base shrink-0">{theme.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] truncate">{theme.name}</p>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Share My Theme Button */}
                <button
                  type="button"
                  onClick={onShareCurrentTheme}
                  className="w-full flex items-center justify-center gap-2 mt-2 py-1.5 px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>Share My Theme with Partner</span>
                </button>
              </div>

              {/* 4. Poet Name & Palette Changer */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your Poet Name & Badge</span>
                  </div>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Current Badge:</span>
                  <div>{renderNameBadge(currentProfile)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenNameModal();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer border border-stone-300/80"
                >
                  <User className="w-3.5 h-3.5 text-stone-600" />
                  <span>Customize Name & Badge</span>
                </button>
              </div>

              {/* 5. Switch Perspective for Testing */}
              <div className="pt-1 flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Testing perspective:</span>
                <button
                  type="button"
                  onClick={onSwitchRole}
                  className="flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-stone-900 underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Switch to {currentPlayerRole === 'player1' ? 'Player 2' : 'Player 1'}</span>
                </button>
              </div>

              </div>

              {/* Pinned Settings Footer: Return to Chat & Close Studio */}
              <div className="p-3 bg-white border-t border-stone-200/80 shrink-0 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Chat</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  Close Studio
                </button>
              </div>
            </div>
          ) : (
            /* Chat Messages View */
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/30">
                {room.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                    <p className="text-xs font-serif italic mb-1">Silence in the study...</p>
                    <p className="text-[11px] text-stone-400">
                      Send a note, encourage a rhyme, or discuss verses!
                    </p>
                  </div>
                ) : (
                  room.messages.map((msg) => {
                    const isMe = msg.author === currentPlayerRole;
                    const authorProfile =
                      msg.author === 'player1' ? room.player1 : room.player2;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* Quoted Reply Preview */}
                        {msg.replyTo && (
                          <div
                            className={`text-[10px] px-2.5 py-1 rounded-t-lg border-x border-t mb-0.5 max-w-[85%] truncate flex items-center gap-1 ${
                              isMe
                                ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                                : 'bg-stone-100 border-stone-200 text-stone-600'
                            }`}
                          >
                            <CornerDownRight className="w-2.5 h-2.5 shrink-0" />
                            <span className="font-semibold">{msg.replyTo.authorName}:</span>
                            <span className="truncate italic">"{msg.replyTo.text}"</span>
                          </div>
                        )}

                        {/* Message Bubble Card */}
                        <div
                          className={`p-3 rounded-2xl max-w-[88%] text-xs shadow-xs relative ${
                            isMe
                              ? 'bg-stone-900 text-stone-100 rounded-br-xs'
                              : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                          }`}
                        >
                          {/* Author Header */}
                          <div className="flex items-center justify-between gap-3 mb-1 text-[10px] pb-1 border-b border-white/10">
                            {renderNameBadge(authorProfile)}
                            <span className={isMe ? 'text-stone-400' : 'text-stone-400'}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Message Content with clickable line link */}
                          <p className="leading-relaxed break-words whitespace-pre-wrap select-text">
                            {renderMessageWithLineLinks(msg.text, onScrollToLine)}
                          </p>

                          {/* Reactions Row */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-white/10">
                              {Object.entries(msg.reactions).map(([emoji, authors]) => {
                                if (!authors || authors.length === 0) return null;
                                const didIReact = authors.includes(currentPlayerRole);
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleAddReaction(msg.id, emoji)}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all cursor-pointer ${
                                      didIReact
                                        ? isMe
                                          ? 'bg-stone-800 border-rose-400 text-rose-300'
                                          : 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                                        : isMe
                                        ? 'bg-stone-800/80 border-stone-700 text-stone-300'
                                        : 'bg-stone-50 border-stone-200 text-stone-600'
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{authors.length}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Action Bar (Reply & React) */}
                        <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-stone-400 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setReplyTarget(msg)}
                            className="hover:text-stone-700 cursor-pointer flex items-center gap-0.5"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Reply
                          </button>

                          {/* Quick Heart */}
                          <button
                            type="button"
                            onClick={() => handleAddReaction(msg.id, '❤️')}
                            className="hover:scale-110 transition-transform cursor-pointer"
                            title="React with heart"
                          >
                            ❤️
                          </button>

                          {/* Quick Sparkle */}
                          <button
                            type="button"
                            onClick={() => handleAddReaction(msg.id, '✨')}
                            className="hover:scale-110 transition-transform cursor-pointer"
                            title="React with sparkles"
                          >
                            ✨
                          </button>

                          {/* Emoji Picker Button */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowEmojiPickerFor(
                                  showEmojiPickerFor === msg.id ? null : msg.id
                                )
                              }
                              className="hover:text-stone-700 cursor-pointer flex items-center"
                              title="Add reaction"
                            >
                              <Smile className="w-3 h-3" />
                            </button>

                            {showEmojiPickerFor === msg.id && (
                              <div className="absolute bottom-5 left-0 z-50 p-2 bg-white rounded-2xl shadow-xl border border-stone-200 flex flex-col gap-1.5 w-44 animate-in fade-in duration-100">
                                <div className="grid grid-cols-4 gap-1">
                                  {COMMON_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleAddReaction(msg.id, emoji)}
                                      className="p-1 text-center hover:bg-stone-100 rounded-lg text-sm transition-transform hover:scale-125 cursor-pointer"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1 pt-1 border-t border-stone-100">
                                  <input
                                    type="text"
                                    value={customEmojiInput}
                                    onChange={(e) => setCustomEmojiInput(e.target.value)}
                                    placeholder="Type emoji..."
                                    maxLength={2}
                                    className="w-full text-xs px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (customEmojiInput.trim()) {
                                        handleAddReaction(msg.id, customEmojiInput.trim());
                                      }
                                    }}
                                    className="px-2 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-semibold cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Replying Banner */}
              {replyTarget && (
                <div className="px-3.5 py-1.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
                  <div className="flex items-center gap-1.5 truncate max-w-[85%]">
                    <CornerDownRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="font-semibold">{replyTarget.authorName}:</span>
                    <span className="truncate italic">"{replyTarget.text}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTarget(null)}
                    className="p-0.5 hover:bg-rose-100 rounded-md text-rose-600 cursor-pointer"
                    title="Cancel reply"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Line Reference Picker Sheet */}
              {showLinePicker && (
                <div className="p-2.5 bg-stone-100 border-t border-stone-200 animate-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between pb-1 mb-1.5 text-xs text-stone-600">
                    <span className="font-semibold flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-stone-500" /> Reference Line in Message
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLinePicker(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {room.lines.length === 0 ? (
                      <span className="text-[11px] text-stone-400 italic">
                        No lines written yet!
                      </span>
                    ) : (
                      room.lines.map((l, i) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => insertLineReference(i + 1)}
                          className="px-2 py-1 rounded-md bg-white border border-stone-200 hover:border-stone-900 text-[11px] text-stone-800 font-medium cursor-pointer shadow-2xs"
                        >
                          Line {i + 1}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Compose Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-stone-200 bg-white flex items-center gap-2 shrink-0"
              >
                {/* Insert Line Link Button */}
                <button
                  type="button"
                  onClick={() => setShowLinePicker(!showLinePicker)}
                  className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
                  title="Reference a poem line (#1, #2...)"
                  aria-label="Reference line"
                >
                  <Hash className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Chat, reply, or type #1..."
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 text-stone-900"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-30 cursor-pointer shrink-0"
                  title="Send message"
                  aria-label="Send"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
      </div>
    </div>
  );
}

/**
 * Parses message text for patterns like `[Line 2]` or `#2` or `Line 3`
 * and turns them into clickable links that scroll to that line on the canvas.
 */
function renderMessageWithLineLinks(
  text: string,
  onScrollToLine: (lineNum: number) => void
) {
  const lineRegex = /(\[?Line\s*(\d+)\]?|#(\d+))/gi;
  const parts: (string | ReactNode)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = lineRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    const lineNum = parseInt(match[2] || match[3], 10);
    parts.push(
      <button
        key={matchIndex}
        type="button"
        onClick={() => onScrollToLine(lineNum)}
        className="inline-flex items-center px-1.5 py-0.2 rounded-sm bg-rose-100 hover:bg-rose-200 text-rose-900 font-mono font-semibold text-[11px] underline decoration-rose-300 underline-offset-2 mx-0.5 cursor-pointer"
        title={`Click to scroll to Line ${lineNum}`}
      >
        Line {lineNum}
      </button>
    );

    lastIndex = lineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}
