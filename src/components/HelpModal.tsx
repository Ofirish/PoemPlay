import { X, Sparkles, Heart, Feather, Link, RefreshCw, MessageSquare, Download } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-base">
              ?
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 font-display-playfair">
                How PoemPlay Works
              </h2>
              <p className="text-[11px] text-stone-500">
                A peaceful, collaborative rhyming canvas for two creators
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer transition-colors"
            aria-label="Close help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 p-6 space-y-5 overflow-y-auto text-sm text-stone-700 leading-relaxed">
          {/* Section 1 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                1. Pure Rhyming Dialogue (No Scoring)
              </h3>
              <p className="text-xs text-stone-600">
                One partner writes an opening line, and the other responds with a matching rhyme in cadence. There are no timers, stress, or scores—just artistic dialogue between two minds.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                2. Private Magic Link & Secret Key
              </h3>
              <p className="text-xs text-stone-600">
                Share your room with one click using the <span className="font-medium text-stone-800">Copy Magic Link</span> button. Your secret room key keeps your co-creation completely private and continuously synchronized.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                3. Personal Design Schemes (Including Lined Notebook)
              </h3>
              <p className="text-xs text-stone-600">
                Choose from <span className="italic">Lined Notebook</span> (white page, blue lines & margin names), <span className="italic">Pink, Cute, Purple, Futuristic, Calm, French Bulldog</span> (with blue & black eyes!), and <span className="italic">Daddy & Toy</span>. Your design choice is completely independent and not forced onto your partner!
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                4. Inline Line Revision Approval Frames
              </h3>
              <p className="text-xs text-stone-600">
                Either partner can propose an edit or deletion to any verse. The proposal appears in a framed box directly beneath the original line. Once the other partner clicks <span className="font-semibold text-emerald-700">Accept</span>, the poem updates in real-time.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                5. Keystroke-Level Draft Autosave
              </h3>
              <p className="text-xs text-stone-600">
                Every single word you type is instantly saved locally as you write. If you accidentally refresh the page, close the browser, or switch tabs, your draft is safely restored.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                6. Corner Chat with Numbered Line Links
              </h3>
              <p className="text-xs text-stone-600">
                Banter in the corner chat without leaving your poem. Tap "Reply" to quote messages, react with any keyboard emoji, or reference line numbers (e.g. <span className="font-mono text-indigo-700">#2</span>) which click-to-scroll right to that line!
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1">
                7. Fine-Art Export to Image or PDF
              </h3>
              <p className="text-xs text-stone-600">
                When finished, export your poem with 5 elegant borders (Minimalist, Rustic, Modern, Classical Ornate, Celestial Artisan), custom typography, and download as high-res PNG or print-ready PDF.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Got it, Let's Rhyme!
          </button>
        </div>
      </div>
    </div>
  );
}
