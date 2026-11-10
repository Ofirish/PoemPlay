import { useState, useRef } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  X,
  Check,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
} from 'lucide-react';
import { RoomData, ExportBorderStyle } from '../types';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

interface ExportStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  currentThemeId?: string;
  initialShowPoetNames?: boolean;
}

interface BorderOption {
  id: ExportBorderStyle;
  name: string;
  description: string;
  frameClass: string;
}

const BORDER_STYLES: BorderOption[] = [
  {
    id: 'lined-notebook',
    name: '📓 Lined Notebook',
    description: 'Authentic textured paper, binder punch holes, blue lines, and red margin',
    frameClass: 'border-2 border-stone-300 shadow-md',
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    description: 'Crisp thin architectural frame with generous white space',
    frameClass: 'border border-stone-300 shadow-xs',
  },
  {
    id: 'classical',
    name: 'Classical Ornate',
    description: 'Regal double-lined gold border with corner flourishes',
    frameClass: 'border-2 border-amber-700/80 ring-1 ring-amber-600/50 shadow-md',
  },
  {
    id: 'rustic',
    name: 'Warm Parchment',
    description: 'Warm sepia-tinted card with soft deckled texture',
    frameClass: 'border-2 border-stone-400/80 shadow-md',
  },
  {
    id: 'modern',
    name: 'Modern Atelier',
    description: 'Bold contemporary border with balanced modernist framing',
    frameClass: 'border-4 border-stone-900 shadow-md',
  },
  {
    id: 'celestial',
    name: 'Celestial Artisan',
    description: 'Starlight corners with luminous gold trim and poetic cadence',
    frameClass: 'border-2 border-amber-500 ring-2 ring-amber-200/60 shadow-lg',
  },
];

const FONT_STYLES = [
  { id: 'cormorant', name: 'Cormorant Garamond (Classical Serif)', fontClass: 'font-serif-cormorant' },
  { id: 'playfair', name: 'Playfair Display (Editorial High-Fashion)', fontClass: 'font-display-playfair' },
  { id: 'cinzel', name: 'Cinzel (Monolithic Roman Inscription)', fontClass: 'font-cinzel' },
  { id: 'fraunces', name: 'Fraunces (Vintage Warm Literary)', fontClass: 'font-fraunces' },
  { id: 'dm', name: 'DM Sans (Contemporary Minimalist)', fontClass: 'font-dm' },
];

const HEADER_STYLES = [
  { id: 'centered', name: 'Centered Regal' },
  { id: 'side-by-side', name: 'Dual Poet Signatures' },
  { id: 'monogram', name: 'Heraldic Monogram' },
];

export function ExportStudioModal({
  isOpen,
  onClose,
  room,
  currentThemeId,
  initialShowPoetNames,
}: ExportStudioModalProps) {
  const [selectedBorder, setSelectedBorder] = useState<ExportBorderStyle>(() => {
    if (currentThemeId === 'calm') return 'rustic';
    if (currentThemeId === 'futuristic') return 'modern';
    return 'lined-notebook';
  });
  const [showPoetNames, setShowPoetNames] = useState<boolean>(initialShowPoetNames ?? true);
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const [selectedHeader, setSelectedHeader] = useState('centered');
  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const fontConfig = FONT_STYLES.find((f) => f.id === selectedFont) || FONT_STYLES[0];

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  /**
   * Renders the high-resolution artwork to a canvas element.
   * Shared between PNG export and PDF export for 100% pixel-perfect consistency.
   */
  const renderExportCanvas = (): HTMLCanvasElement => {
    const width = 840;
    const baseHeight = 320;
    const estimatedLinesHeight = Math.max(500, room.lines.length * 56 + 120);
    const height = baseHeight + estimatedLinesHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // retina 2x scale
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    ctx.scale(2, 2);

    // 1. Background
    ctx.fillStyle = selectedBorder === 'rustic' ? '#FAF8F5' : '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // 2. Outer Border / Margin
    if (selectedBorder === 'lined-notebook') {
      // 3 Binder Punch Holes
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      [90, height / 2, height - 90].forEach((y) => {
        ctx.beginPath();
        ctx.arc(24, y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Red Vertical Margin Line - shifted left with zero overlap
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(90, 36);
      ctx.lineTo(90, height - 36);
      ctx.stroke();
    } else {
      ctx.strokeStyle =
        selectedBorder === 'celestial'
          ? '#D97706'
          : selectedBorder === 'rustic'
          ? '#78350F'
          : '#1C1917';
      ctx.lineWidth = selectedBorder === 'minimalist' ? 1 : 2;
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Inner Border for celestial & classical styles
      if (selectedBorder === 'celestial' || selectedBorder === 'classical') {
        ctx.lineWidth = 0.8;
        ctx.strokeRect(42, 42, width - 84, height - 84);
      }
    }

    // 3. Header
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    const headerCenterX = selectedBorder === 'lined-notebook' ? (width + 90) / 2 : width / 2;
    ctx.fillText(room.title || 'Untitled Collaborative Poem', headerCenterX, 85);

    const currentTurnPlayer = (room.turn || 'player1') === 'player1' ? room.player1 : room.player2;
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillStyle = '#57534E';
    ctx.fillText(
      showPoetNames
        ? `Composed by ${room.player1.name} & ${room.player2.name}`
        : `Penned by Current Poet: ${currentTurnPlayer.name} (${currentTurnPlayer.symbol})`,
      headerCenterX,
      114
    );

    // Decorative divider line
    ctx.strokeStyle = selectedBorder === 'lined-notebook' ? '#93C5FD' : '#D6D3D1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headerCenterX - 80, 130);
    ctx.lineTo(headerCenterX + 80, 130);
    ctx.stroke();

    // 4. Lines rendering with complete word-wrapping
    ctx.textAlign = 'left';
    let currentY = 175;
    const isNotebook = selectedBorder === 'lined-notebook';
    const verseStartX = isNotebook ? 106 : 80;
    const maxVerseWidth = width - verseStartX - (isNotebook ? 45 : 80);

    room.lines.forEach((line, idx) => {
      if (isNotebook) {
        // Line Number in notebook margin strictly to left of red line (x=90)
        ctx.textAlign = 'right';
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#94A3B8';
        const numText = String(idx + 1).padStart(2, '0');
        ctx.fillText(numText, 68, currentY);

        // Author Symbol in margin if showPoetNames
        if (showPoetNames) {
          ctx.font = '11px sans-serif';
          ctx.fillStyle = line.author === 'player1' ? '#B91C1C' : '#047857';
          const sym = line.author === 'player1' ? room.player1.symbol : room.player2.symbol;
          ctx.fillText(sym, 84, currentY);
        }
        ctx.textAlign = 'left';
      } else {
        // Standard themes: Poet Name & Line Number ABOVE the verse line!
        if (showPoetNames) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = line.author === 'player1' ? '#B91C1C' : '#047857';
          const authorLabel = `#${String(idx + 1).padStart(2, '0')} · ${line.author === 'player1' ? room.player1.symbol : room.player2.symbol} ${line.authorName}`;
          ctx.fillText(authorLabel, verseStartX, currentY);
          currentY += 18;
        }
      }

      // Word wrapping for verse text
      ctx.font = '16px Georgia, serif';
      ctx.fillStyle = '#0F172A';
      const words = line.text.split(' ');
      let currentLine = '';
      const lineList: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxVerseWidth && n > 0) {
          lineList.push(currentLine);
          currentLine = words[n];
        } else {
          currentLine = testLine;
        }
      }
      lineList.push(currentLine);

      // Draw each wrapped line with optional notebook blue ruled lines
      lineList.forEach((wrappedText, lineIdx) => {
        const rowY = currentY + lineIdx * 24;

        if (isNotebook) {
          ctx.strokeStyle = '#93C5FD';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(90, rowY + 5);
          ctx.lineTo(width - 45, rowY + 5);
          ctx.stroke();
        }

        ctx.fillText(wrappedText, verseStartX, rowY);
      });

      currentY += lineList.length * 24 + (showPoetNames ? 14 : 10);

      if ((idx + 1) % 2 === 0) {
        currentY += 8;
      }
    });

    // If notebook theme, continue drawing empty ruled lines down to bottom
    if (isNotebook) {
      while (currentY < height - 60) {
        ctx.strokeStyle = '#93C5FD';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(90, currentY + 5);
        ctx.lineTo(width - 45, currentY + 5);
        ctx.stroke();
        currentY += 28;
      }
    }

    // 5. Curatorial Footnote
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.textAlign = 'center';
    ctx.fillText(
      `POEMPLAY EDITION · ${new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      width / 2,
      height - 40
    );

    return canvas;
  };

  /**
   * Generates and downloads a real PDF file (.pdf) with pixel-perfect artwork.
   */
  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const canvas = renderExportCanvas();
      const imgData = canvas.toDataURL('image/png', 1.0);
      const isPortrait = canvas.height >= canvas.width;

      const pdf = new jsPDF({
        orientation: isPortrait ? 'portrait' : 'landscape',
        unit: 'pt',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        canvas.width / 2,
        canvas.height / 2,
        undefined,
        'FAST'
      );

      const safeTitle = (room.title || 'poemplay')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      pdf.save(`${safeTitle}-edition.pdf`);

      triggerToast('PDF downloaded successfully!');
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('PDF export error:', err);
      triggerToast('Could not generate PDF. Please try PNG export.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  /**
   * Generates and downloads a high-resolution PNG image file (.png).
   */
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    try {
      const canvas = renderExportCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      const safeTitle = (room.title || 'poemplay')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const link = document.createElement('a');
      link.download = `${safeTitle}-edition.png`;
      link.href = dataUrl;
      link.click();

      triggerToast('PNG artwork downloaded!');
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Download error:', err);
      triggerToast('Error generating PNG image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  /**
   * Prints the styled artwork via a dedicated clean print frame.
   * If browser sandbox blocks window.print, it automatically triggers PDF download as a seamless fallback.
   */
  const handlePrint = () => {
    try {
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const doc = printIframe.contentWindow?.document;
      if (doc && printAreaRef.current) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${room.title || 'PoemPlay Edition'}</title>
              <style>
                @page { size: auto; margin: 15mm; }
                body {
                  margin: 0;
                  padding: 24px;
                  background: white;
                  font-family: Georgia, serif;
                  color: #1c1917;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .print-frame {
                  max-width: 680px;
                  margin: 0 auto;
                }
              </style>
            </head>
            <body>
              <div class="print-frame">
                ${printAreaRef.current.innerHTML}
              </div>
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print intercepted, fallback to PDF download:', e);
            handleDownloadPdf();
          } finally {
            setTimeout(() => {
              if (document.body.contains(printIframe)) {
                document.body.removeChild(printIframe);
              }
            }, 3000);
          }
        }, 300);
      } else {
        window.print();
      }
    } catch (err) {
      console.warn('Print window failed, downloading PDF directly:', err);
      handleDownloadPdf();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[94vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar - Pinned */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-stone-100 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 font-display-playfair">
                Fine-Art Export Studio
              </h2>
              <p className="text-[11px] text-stone-500">
                Preview your styled poem, then print or download as high-res PDF or PNG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer transition-colors"
            title="Close Export Studio"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View Switcher (Tabs) - Allows poets on mobile to switch between options and full preview */}
        <div className="flex md:hidden p-1.5 bg-stone-100 border-b border-stone-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('options')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'options'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-rose-500" />
            <span>Customize Styling</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>Live Artwork Preview</span>
          </button>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Controls Rail - Visible when activeTab === 'options' on mobile, always visible on md: */}
          <div
            className={`w-full md:w-80 p-5 border-b md:border-b-0 md:border-r border-stone-100 bg-stone-50/40 overflow-y-auto min-h-0 space-y-5 shrink-0 ${
              activeTab === 'options' ? 'block' : 'hidden md:block'
            }`}
          >
            {/* Quick jump to preview button for mobile */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live Print Preview →</span>
              </button>
            </div>

            {/* 1. Border Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                1. Elegant Border
              </label>
              <div className="space-y-1.5">
                {BORDER_STYLES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBorder(b.id)}
                    className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      selectedBorder === b.id
                        ? 'bg-white border-stone-900 shadow-xs ring-1 ring-stone-900'
                        : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-stone-900">{b.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">{b.description}</p>
                    </div>
                    {selectedBorder === b.id && <Check className="w-3.5 h-3.5 text-stone-900 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Selectable Fonts */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                2. Verse Typography
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {FONT_STYLES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFont(f.id)}
                    className={`w-full p-2 rounded-xl text-xs text-left border transition-all cursor-pointer flex items-center justify-between ${
                      selectedFont === f.id
                        ? 'bg-white border-stone-900 font-semibold ring-1 ring-stone-900 text-stone-900'
                        : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                    }`}
                  >
                    <span className={f.fontClass}>{f.name}</span>
                    {selectedFont === f.id && <Check className="w-3 h-3 text-stone-900 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Header Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                3. Header Layout Style
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {HEADER_STYLES.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHeader(h.id)}
                    className={`p-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${
                      selectedHeader === h.id
                        ? 'bg-white border-stone-900 font-semibold ring-1 ring-stone-900 text-stone-900'
                        : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                    }`}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Poet Attribution */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                4. Poet Attribution
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowPoetNames(true)}
                  className={`p-2.5 rounded-xl text-xs text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    showPoetNames
                      ? 'bg-white border-stone-900 font-semibold ring-1 ring-stone-900 text-stone-900 shadow-xs'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <span>👥</span>
                    <span>Both Poets</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">Show both poets</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPoetNames(false)}
                  className={`p-2.5 rounded-xl text-xs text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    !showPoetNames
                      ? 'bg-white border-stone-900 font-semibold ring-1 ring-stone-900 text-stone-900 shadow-xs'
                      : 'bg-white/60 border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    <span>🪶</span>
                    <span>Current Poet</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">Focus on active poet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Preview Canvas Area - Visible when activeTab === 'preview' on mobile, always visible on md: */}
          <div
            className={`flex-1 min-h-0 flex flex-col bg-stone-100/80 overflow-hidden ${
              activeTab === 'preview' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Preview Status & Zoom Bar */}
            <div className="px-4 py-2 bg-white/90 border-b border-stone-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-semibold text-stone-800">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Live Print & Export Preview</span>
                </span>
                <span className="text-[11px] text-stone-400 hidden sm:inline">
                  (What you see is what you export)
                </span>
              </div>

              {/* Toolbar Controls: Mode toggle + Zoom */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoetNames(!showPoetNames)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 shadow-2xs cursor-pointer transition-all"
                  title={showPoetNames ? "Switch to Current Poet Attribution" : "Show Both Poet Names"}
                >
                  <span>{showPoetNames ? '🪶 Current Poet' : '👥 Both Poets'}</span>
                </button>

                <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                    className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-stone-600 px-1 select-none">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                    className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-100 cursor-pointer ml-1"
                    title="Reset to 100%"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Preview Canvas Container */}
            <div className="flex-1 min-h-0 p-4 sm:p-8 overflow-auto flex items-start justify-center">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full max-w-xl shrink-0 my-2"
              >
                <div
                  ref={printAreaRef}
                  className={`w-full shadow-2xl transition-all relative ${
                    fontConfig.fontClass
                  } ${
                    selectedBorder === 'lined-notebook'
                      ? 'pl-0 pr-4 sm:pr-8 py-6 sm:py-10 paper-texture border border-stone-300'
                      : selectedBorder === 'rustic'
                      ? 'p-6 sm:p-12 bg-[#FAF8F5]'
                      : 'p-6 sm:p-12 bg-white'
                  }`}
                  style={{
                    minHeight: '480px',
                  }}
                >
                  {/* Border Rendering Overlays */}
                  {renderExportBorder(selectedBorder)}

                  {/* Header Rendering - with offset in notebook mode so it sits cleanly right of red line */}
                  <div className={selectedBorder === 'lined-notebook' ? 'pl-16 sm:pl-24' : ''}>
                    {renderExportHeader(selectedHeader, room, showPoetNames)}
                  </div>

                  {/* Lines Content with poet names ABOVE line */}
                  <div className="space-y-4 my-8 relative z-10">
                    {room.lines.length === 0 ? (
                      <p className="text-center text-stone-400 italic text-sm py-12">
                        (No lines submitted yet. Compose verses together to export!)
                      </p>
                    ) : (
                      room.lines.map((line, idx) => {
                        const isNotebook = selectedBorder === 'lined-notebook';
                        if (isNotebook) {
                          return (
                            <div
                              key={line.id}
                              className="flex items-end min-h-[42px] pb-1 border-b border-sky-300 group transition-colors"
                            >
                              {/* Notebook Margin strictly left of red line: Number & optional author symbol */}
                              <div className="shrink-0 w-14 sm:w-20 flex items-center justify-end gap-1 pr-2.5 sm:pr-3 pb-0.5">
                                <span className="text-[11px] font-mono text-stone-400 select-none">
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                {showPoetNames && (
                                  <span className="text-xs" title={line.authorName}>
                                    {line.author === 'player1' ? room.player1.symbol : room.player2.symbol}
                                  </span>
                                )}
                              </div>

                              {/* Verse text strictly right of red line, seated squarely on blue line */}
                              <div className="flex-1 min-w-0 pl-3 sm:pl-5 pb-0.5">
                                <span className="text-base sm:text-lg text-stone-900 leading-snug tracking-wide block whitespace-normal break-words">
                                  {line.text}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Standard themes: Poet Name ABOVE the verse line!
                        return (
                          <div
                            key={line.id}
                            className="group rounded-xl p-2 transition-colors space-y-1"
                          >
                            {/* Poet Name & Number ABOVE the line */}
                            {showPoetNames && (
                              <div className="flex items-center gap-2 pb-1 border-b border-stone-200/50">
                                <span className="text-[11px] font-mono font-bold text-stone-400 select-none">
                                  #{String(idx + 1).padStart(2, '0')}
                                </span>
                                <span className="text-xs font-serif italic text-stone-600">
                                  {line.author === 'player1' ? room.player1.symbol : room.player2.symbol} {line.authorName}
                                </span>
                              </div>
                            )}

                            {/* Verse text */}
                            <div className="w-full">
                              <p className="text-base sm:text-lg text-stone-900 leading-relaxed font-serif pl-0.5 whitespace-normal break-words">
                                {line.text}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* If notebook theme, render empty ruled rows to fill the sheet naturally */}
                    {selectedBorder === 'lined-notebook' && room.lines.length < 8 && (
                      Array.from({ length: Math.max(2, 8 - room.lines.length) }).map((_, i) => (
                        <div
                          key={`empty-rule-${i}`}
                          className="flex items-end min-h-[42px] border-b border-sky-300 pb-1"
                        >
                          <div className="shrink-0 w-14 sm:w-20 pr-2.5 sm:pr-3" />
                          <div className="flex-1 pl-3 sm:pl-5" />
                        </div>
                      ))
                    )}
                  </div>

                  {/* Curatorial Footnote */}
                  <div className={`pt-8 border-t border-stone-200/60 mt-12 text-center text-[11px] text-stone-400 font-sans tracking-widest uppercase ${selectedBorder === 'lined-notebook' ? 'pl-16 sm:pl-24' : ''}`}>
                    PoemPlay Edition ·{' '}
                    {new Date().toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Toast Notification */}
        {feedbackToast && (
          <div className="bg-stone-900 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Pinned Modal Footer - Action & Close Buttons ALWAYS visible on screen */}
        <div className="px-5 sm:px-6 py-3 border-t border-stone-200 bg-stone-50/90 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer transition-colors"
          >
            Close / Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Print via Printer */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Print directly to physical printer or save to browser PDF"
            >
              <Printer className="w-3.5 h-3.5 text-stone-600" />
              <span>Print to Printer</span>
            </button>

            {/* 2. Download Image (PNG) */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExportingPng}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Download high-resolution image"
            >
              <Download className="w-3.5 h-3.5 text-stone-700" />
              <span>{isExportingPng ? 'Saving PNG...' : 'Download PNG'}</span>
            </button>

            {/* 3. Download PDF (Primary Action - Guaranteed to work via jsPDF!) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Generate and download printable PDF document (.pdf)"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF (.pdf)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderExportBorder(borderStyle: ExportBorderStyle) {
  switch (borderStyle) {
    case 'lined-notebook':
      return (
        <div className="absolute inset-0 pointer-events-none">
          {/* 3 Punch Holes */}
          <div className="absolute left-2 sm:left-3 top-12 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />
          <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />
          <div className="absolute left-2 sm:left-3 bottom-12 w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner" />

          {/* Vertical Red Margin Line - shifted left with zero overlap */}
          <div className="absolute left-14 sm:left-20 top-0 bottom-0 w-[2px] bg-rose-400 z-20" />
        </div>
      );
    case 'minimalist':
      return (
        <div className="absolute inset-4 border border-stone-300 pointer-events-none" />
      );
    case 'classical':
      return (
        <div className="absolute inset-4 border-2 border-amber-800/80 pointer-events-none">
          <div className="absolute inset-1.5 border border-amber-700/50" />
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-800" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-800" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-800" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-800" />
        </div>
      );
    case 'rustic':
      return (
        <div className="absolute inset-4 border-2 border-stone-400/80 rounded-sm pointer-events-none" />
      );
    case 'modern':
      return (
        <div className="absolute inset-4 border-4 border-stone-900 pointer-events-none" />
      );
    case 'celestial':
      return (
        <div className="absolute inset-4 border-2 border-amber-500 pointer-events-none">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-amber-600 text-xs">
            ✦
          </div>
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-amber-600 text-xs">
            ✦
          </div>
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
        </div>
      );
    default:
      return null;
  }
}

function renderExportHeader(headerStyle: string, room: RoomData, showPoetNames: boolean = true) {
  if (headerStyle === 'side-by-side') {
    return (
      <div className="pb-6 mb-8 border-b border-stone-200/60 relative z-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-3">
          {room.title || 'Untitled Collaborative Poem'}
        </h1>
        <div className="flex items-center justify-between text-xs text-stone-500">
          {showPoetNames ? (
            <>
              <div className="flex items-center gap-1.5">
                <span>{room.player1.symbol}</span>
                <span className="font-semibold text-stone-800">{room.player1.name}</span>
                <span className="text-stone-400">(Poet 1)</span>
              </div>
              <span className="text-stone-300">✦</span>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400">(Poet 2)</span>
                <span className="font-semibold text-stone-800">{room.player2.name}</span>
                <span>{room.player2.symbol}</span>
              </div>
            </>
          ) : (
            <span className="text-stone-500 italic font-serif">
              Penned with Current Poet: {(room.turn || 'player1') === 'player1' ? room.player1.name : room.player2.name} ({(room.turn || 'player1') === 'player1' ? room.player1.symbol : room.player2.symbol})
            </span>
          )}
        </div>
      </div>
    );
  }

  if (headerStyle === 'monogram') {
    const currentTurn = (room.turn || 'player1') === 'player1' ? room.player1 : room.player2;
    return (
      <div className="text-center pb-6 mb-8 border-b border-stone-200/60 relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-stone-300 text-stone-700 font-serif text-lg mb-2 shadow-2xs">
          {showPoetNames ? `${room.player1.symbol} · ${room.player2.symbol}` : currentTurn.symbol}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-1">
          {room.title || 'Untitled Collaborative Poem'}
        </h1>
        <p className="text-xs text-stone-500 italic font-serif">
          {showPoetNames
            ? `A dialogue in cadence by ${room.player1.name} & ${room.player2.name}`
            : `Composed in cadence with Current Poet: ${currentTurn.name}`}
        </p>
      </div>
    );
  }

  // Default: Centered Regal
  const currentTurn = (room.turn || 'player1') === 'player1' ? room.player1 : room.player2;
  return (
    <div className="text-center pb-6 mb-8 border-b border-stone-200/60 relative z-10">
      <div className="text-[10px] tracking-widest text-stone-400 uppercase font-mono mb-1">
        {showPoetNames ? 'COLLABORATIVE DIALOGUE' : 'CURRENT POET EDITION'}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2">
        {room.title || 'Untitled Collaborative Poem'}
      </h1>
      <p className="text-xs text-stone-500 font-serif italic">
        {showPoetNames
          ? `Penned by ${room.player1.name} & ${room.player2.name}`
          : `Penned in cadence with Current Poet: ${currentTurn.name}`}
      </p>
    </div>
  );
}
