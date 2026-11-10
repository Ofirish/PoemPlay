# PoemPlay — Collaborative Two-Player Poetry Canvas

A dedicated two-player collaborative rhyming experience where partners craft verses line-by-line in real-time. No game scores or timers—just pure poetic co-creation, elegant typography, independent visual themes, line-revision approval flows, and publication-grade export styling.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions incorporate the choices confirmed in Phase 1:
> - **Session Sharing**: Real-time magic link room via server storage and continuous live synchronization (`/api/poems/:id`), enabling private collaboration across devices with a shareable URL or secret key.
> - **Creative Mode**: Pure artistic canvas without AI rhyming assistants or intrusive scoring widgets, honoring genuine human creative dialogue and rhythm.
> - **Line Revision Workflow**: Inline approval frames rendered directly underneath proposed lines with explicit partner Accept/Reject controls.

- **Confirmed Decision 1**: Session sync operates via lightweight server-backed endpoints (`/api/poems/:id`) with immediate optimistic client updates and sub-second polling, ensuring seamless co-presence on mobile and desktop without authentication hurdles.
- **Confirmed Decision 2**: Themes are strictly client-side—Player 1 can compose in *French Bulldog* or *Futuristic* while Player 2 experiences *Pink*, *Calm*, or *Daddy and Toy*, without forcing the partner's display.
- **Confirmed Decision 3**: Final export features 5 bespoke border selections (Minimalist, Rustic, Modern, Ornate Classical, Celestial Artisan) with customizable title typography and header styles for high-resolution PNG and PDF downloads.
- **Confirmed Decision 4**: Continuous draft persistence—every word and keystroke in the active line input and revision fields is instantly saved to local cache with zero data loss on browser refresh, tab switch, or reload.
- **Confirmed Decision 5**: Contextual help guide with an unobtrusive `?` button in the upper right corner, presenting an illustrated walkthrough of turns, magic links, approval frames, themes, and exports.
- **Confirmed Decision 6**: Editable participant names with personal design palettes—players can change their display name at any time and choose from a curated mini design palette (accent color tint, signature font, and personal monogram symbol like quill, star, crescent, blossom, heart, crown, or paw).
- **Confirmed Decision 7**: Player names displayed beside each line—each verse proudly and delicately shows the author's personalized name badge beside the text.
- **Confirmed Decision 8**: Corner in-game mini-chat window—a discreet, collapsible floating messenger in the corner where both partners can chat in real-time, reply to messages, react with any keyboard emoji/heart, and reference poem lines by number (e.g. `[Line 2]`) which click-to-scroll and highlight that line.
- **Confirmed Decision 9**: Starting screen dual mode—poets can either create a new room (with title suggestions, poet name, auto-generated secret keys) or enter an existing room by entering a full magic link URL or a direct secret key. Both formats are completely viable and automatically parse room ID and player perspective.
- **Confirmed Decision 10**: Lined Notebook authentic paper aesthetic—pre-drawn horizontal blue ruled lines across the entire page beforehand, authentic red margin line, and binder punch holes. Verses get 100% horizontal canvas width with author metadata and quick action bars positioned neatly above the verse line.
- **Confirmed Decision 11**: Direct PDF Export & Live Artwork Preview—integrated `jsPDF` for 100% reliable `.pdf` generation that works seamlessly in all browsers and iframes without relying on browser print dialogs. Added dedicated live preview cards to both the Fine-Art Export Studio (with mobile switcher tabs and zoom controls) and the New Poem verification menu.
- **Confirmed Decision 12**: Single-launcher Quill architecture for Chat—chat is opened exclusively from the floating Quill launcher without duplicate floating buttons or second quills. When chat is closed, it minimizes completely back into the Quill. When new messages arrive, the Quill displays a glowing pulse and dynamic unread counter badge.
- **Confirmed Decision 13**: Current Poet Attribution & Mobile Header Precision—poet attribution is cleanly positioned *above* each verse line. On the lined notebook sheet, the header row displays the **Current Poet** (`Current: [Badge] · Turn status`) cleanly seated on the blue ruled line without any overlapping toggle buttons or badge truncation. In the fine-art export studio and other themes, attribution supports focusing on the Current Poet or displaying Both Poets.
- **Confirmed Decision 14**: Notebook Red Line Precision & Zero Overlap—the vertical red margin line is positioned strictly to the left (`left-14 sm:left-20` on canvas, `x = 90` on canvas export) with the container left padding at `pl-0`. The margin column strictly houses line numbers and author initials with right padding (`pr-2.5 sm:pr-3`), line action buttons are relocated to the far right edge of the verse row, and all verse text begins at `pl-3 sm:pl-5` to the right of the red line. This completely eliminates all element overlap across all screen sizes and export documents.

---

### 1. Overview & Core Concept

- **What It Does**: Two participants connect to a shared poem room via a secret key or magic link. One writes an opening line; the other responds with a matching rhyme in cadence. Each verse grows organically as partners alternate. At any point, either participant can propose an edit or deletion to any line, which surfaces as an inline proposal card requiring the partner's approval. When complete, the poem can be exported as a publication-ready artifact with selectable borders, header formats, and fonts.
- **Target Audience & Mood**: Poets, couples, close friends, parent-and-child pairs, and wordsmiths seeking an intimate, distraction-free space for shared creativity.
- **Key Value**: Beautiful typography, zero competition, effortless connection without account creation, bespoke personalized themes, and fine-art exports.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Room Creation & Entry**:
   - Creator enters an optional room title or secret key (or clicks "Create New Canvas" for a graceful auto-generated phrase like `amber-starlight`).
   - Generates a 1-click Magic Link with a copyable secret key and QR/URL preview.
   - Creator selects their persona (e.g., "Player 1 / Initiator" or custom name).
2. **Turn-Taking Rhyme Canvas**:
   - Visual indicator highlights whose turn it is to write the next line (with an option to gently nudge or alternate freely).
   - Author inputs their line and clicks **Submit**. The line instantly appears on both screens with subtle entry transitions.
   - Stanza grouping (couplets, quatrains, or continuous scroll) with line numbers and author indicators.
3. **Inline Revision & Approval Flow**:
   - Hovering or tapping any line reveals edit/delete affordances.
   - Proposing an edit or deletion places a framed inline revision box directly below the original line.
   - The proposer sees a "Proposal pending partner review" state with a cancel button.
   - The partner sees the proposed alteration with diff styling and instant `Accept` (updates the poem) and `Reject` (discards proposal) buttons.
4. **Continuous Draft Persistence**:
   - Every character typed into the active verse input is saved to local storage with immediate recovery on reload. If the player refreshes the page or reopens the magic link, their unsubmitted draft appears exactly where they left it.
5. **Theme Switcher (Individual Choice)**:
   - A floating theme selector allows each participant to toggle among all 7 themes independently:
     1. **Pink**: Soft blush rose quartz, champagne gold accents, gentle serif typography.
     2. **Cute**: Pastel butter cream, mint accents, soft rounded geometric typography, playful warmth.
     3. **Purple**: Deep velvet amethyst, lavender mist, violet-ink contrasts, ethereal literary tone.
     4. **Futuristic**: Deep obsidian/cyan, subtle grid lineaments, sleek neo-grotesque type.
     5. **Calm**: Eucalyptus sage, warm linen/oatmeal, earth stone neutrals, contemplative reading cadence.
     6. **French Bulldog**: Light gray canvas, charcoal patch accents, custom SVG bulldog emblem with the iconic blue left eye and black right eye, Parisian bistro chic typography.
     7. **Daddy & Toy**: Warm ruby and peach tones, plush toy and heart motifs, gentle kiss iconography, cozy emotional warmth.
6. **Upper Right Corner Help Guide (`?`)**:
   - An elegant round button `?` fixed in the top right header.
   - Opens a beautifully styled, friendly modal detailing:
     - How turn-based rhyming works.
     - How to share the Magic Link & secret key.
     - How the line edit and delete approval frames function.
     - How each player can choose their own visual theme.
     - How drafts are safeguarded against accidental refresh.
     - How to export the final piece as a framed image or PDF.
7. **Beside-the-Line Player Name Display & Personal Name Palette**:
   - Each written line shows the author's name cleanly situated beside the verse (in an elegant side margin or integrated inline tag).
   - Each player has their own personal **Name Design Palette** modal or dropdown where they can configure:
     - Their display name.
     - Badge tint color (rose gold, emerald ink, lavender, obsidian cyan, warm terracotta, celestial gold, honey peach).
     - Badge style (clean editorial italic, modern sans tag, or minimal bracketed initials).
     - Personal author icon/symbol (feather quill, solitary star, crescent moon, wild rose, heart, royal crest, puppy paw).
   - This personal name design renders next to every line they write and in the corner chat!
8. **Corner In-Game Chat Window (with Named Replies & Emoji/Heart Reactions)**:
   - A floating, collapsible chat bubble in the lower corner of the screen.
   - Allows participants to banter, encourage, discuss rhymes, or confer on edits without leaving the rhyming flow.
   - Messages display each author's custom styled name tag and timestamp.
   - **Numbered Poem Line References**: Every line on the canvas has an elegant line number (Line 1, Line 2, etc.). Players can reference any poem line directly in chat (e.g. typing `#3` or clicking a quote icon next to any poem line). Chat messages render an interactive link (e.g. `[Line 4]`) that smoothly scrolls to and illuminates the referenced verse on the canvas!
   - **Quoted Replies**: Tap or click "Reply" on any message to quote it with a preview link in the compose box, enabling clear back-and-forth dialogue.
   - **Heart & Emoji Reactions**: Quick one-tap Heart button ❤️ plus an emoji picker allowing any keyboard emoji reaction (e.g. ✨, 🔥, 👏, 🐾, 💡, 🥺, 🌸) with live reaction counters!
9. **Fine-Art Export Studio**:
   - Dedicated modal previewing the finished poem with live styling toggles:
     - **5 Border Styles**:
       1. *Minimalist*: Hairline frame with architectural corner tick marks and generous paperspace.
       2. *Rustic*: Deckled border with antique woodblock corner florets and parchment textures.
       3. *Modern*: Asymmetric geometric frame with sleek corner notches and high contrast.
       4. *Classical Ornate*: Victorian bookplate scrollwork and filigree borders.
       5. *Celestial Artisan*: Gilded twin hairline borders with delicate lunar and starlight corner elements.
     - **Header Styles**: Centered Curatorial, Romantic Monogram, Archival Folio with Roman Numerals, Minimalist Byline.
     - **Typography Controls**: Cormorant Garamond, Playfair Display, Cinzel, DM Sans, Plus Jakarta Sans.
     - **Export Formats**: High-Resolution Canvas PNG and Printable PDF download.

---

### 3. Key Product Decisions & Trade-Offs

- **Server-Backed REST + Dynamic Storage**:
  - *Chosen Approach*: Node.js Express server running with an in-memory and file-backed JSON store for active poem rooms, served over `/api/poems/:id`. The frontend synchronizes state with optimistic updates and responsive polling every 1.5 seconds (falling back smoothly if offline).
  - *Why*: Provides true multi-device, multi-browser synchronization with zero external setup friction or third-party database dependencies.
  - *Alternatives Considered*: Client-only `localStorage` (fails across distinct physical devices) or heavy database setups (unnecessary friction for casual poetry sessions).
- **Independent Client-Side Themes**:
  - *Chosen Approach*: Theme state is saved in `localStorage` per participant and applied as data attributes (`data-theme="..."`) on the client container.
  - *Why*: Directly satisfies the prompt requirement: "Design is shown to each participant by its choice and not shared."
- **Inline Revision Card**:
  - *Chosen Approach*: In-place revision frames under the active line with explicit Accept/Reject actions.
  - *Why*: Eliminates modal interruptions and allows both participants to compare the original line and proposed rhyme in spatial context.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                                                             │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │     Theme Engine      │       │     Poem Session      │  │
│  │   (7 Distinct Themes, │       │  (Magic Link & Secret │  │
│  │  Custom CSS Variables)│       │   Key URL Parameter)  │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
│              │                               │              │
│  ┌───────────▼───────────────────────────────▼───────────┐  │
│  │                    Poem Canvas                        │  │
│  │  - Alternating Lines Display                          │  │
│  │  - Inline Proposal Frame (Diff, Accept/Reject)        │  │
│  │  - Active Turn Bar & Line Submission Form             │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │               Export & Art Framing Studio             │  │
│  │  - 5 Border Renderers (Minimalist, Rustic, Modern,    │  │
│  │    Ornate Classical, Celestial Artisan)               │  │
│  │  - Custom Typography & Header Formats                 │  │
│  │  - Canvas PNG & Native Print / PDF Download           │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ HTTP Fetch / Sync
┌──────────────────────────────▼──────────────────────────────┐
│                  Express Backend (server.ts)                │
│                                                             │
│  - GET  /api/poems/:secretKey      (Fetch room state)       │
│  - POST /api/poems/:secretKey/line (Submit rhyme line)      │
│  - POST /api/poems/:secretKey/edit (Propose line change)    │
│  - POST /api/poems/:secretKey/vote (Accept/Reject revision) │
│  - POST /api/poems/:secretKey/chat (Send in-game message)   │
│  - POST /api/poems/:secretKey/name (Update participant name)│
│  - Shared JSON State Store in /tmp/poems.json               │
└─────────────────────────────────────────────────────────────┘
```

#### Core Data Models:
- `PoemSession`:
  - `id`: string (room secret key)
  - `title`: string
  - `lines`: `PoemLine[]`
  - `proposals`: `LineProposal[]`
  - `messages`: `ChatMessage[]`
  - `turn`: `'player1' | 'player2'`
  - `player1Name`: string
  - `player2Name`: string
  - `updatedAt`: number
- `ChatMessage`:
  - `id`: string
  - `author`: `'player1' | 'player2'`
  - `authorName`: string
  - `text`: string
  - `timestamp`: number
  - `replyTo`?: { id: string; authorName: string; text: string }
  - `reactions`?: Record<string, string[]> // emoji -> array of author IDs
- `PoemLine`:
  - `id`: string
  - `author`: `'player1' | 'player2'`
  - `text`: string
  - `timestamp`: number
  - `stanzaIndex`: number
- `LineProposal`:
  - `id`: string
  - `targetLineId`: string
  - `type`: `'edit' | 'delete'`
  - `newText`?: string
  - `proposer`: `'player1' | 'player2'`
  - `status`: `'pending' | 'accepted' | 'rejected'`
  - `timestamp`: number

---

### 5. Implementation Steps (Turn 3 Execution)
1. **Server Setup (`server.ts`)**: Express API with full room persistence, line submission, inline proposal management, and health checks.
2. **Design System & 7 Theme Palettes (`src/index.css` & Theme Context)**: Complete color tokens, custom borders, Google Fonts (`Playfair Display`, `Cormorant Garamond`, `Cinzel`, `Outfit`, `Plus Jakarta Sans`), French Bulldog mascot SVG, and plush Daddy & Toy heart motifs.
3. **Poem Canvas & Real-Time Sync**: Live turn alternator, responsive input bar, line grouping, and real-time polling hook.
4. **Inline Proposal Frames**: Framed diff comparisons beneath lines with interactive Accept/Reject handlers.
5. **Export Studio**: 5 decorative SVG borders, typography selectors, live preview canvas, PNG downloader, and print-ready PDF generator.
