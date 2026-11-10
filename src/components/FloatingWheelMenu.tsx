import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Feather,
  MessageSquare,
  Share2,
  Check,
  Download,
  Palette,
  User,
  RotateCcw,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';

interface FloatingWheelMenuProps {
  onToggleChat: () => void;
  isChatOpen: boolean;
  unreadChatCount: number;
  hasNewPartnerMessage: boolean;
  onCopyMagicLink: () => void;
  hasCopiedLink: boolean;
  onOpenExportStudio: () => void;
  onOpenThemeModal: () => void;
  onOpenNameModal: () => void;
  onOpenNewPoemModal: () => void;
  onOpenHelp: () => void;
}

interface MenuItem {
  id: string;
  shortLabel: string; // Prompt: "add a one-word label under each button that will tell the player what the button contains"
  fullLabel: string;
  icon: React.ReactNode;
  colorClass: string; // Prompt: colorful buttons, especially theme
  onClick: () => void;
  badge?: number | string | null;
  highlight?: boolean;
}

interface ItemCoordinate {
  tx: number;
  ty: number;
}

export function FloatingWheelMenu({
  onToggleChat,
  isChatOpen,
  unreadChatCount,
  hasNewPartnerMessage,
  onCopyMagicLink,
  hasCopiedLink,
  onOpenExportStudio,
  onOpenThemeModal,
  onOpenNameModal,
  onOpenNewPoemModal,
  onOpenHelp,
}: FloatingWheelMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    // Initial position: Bottom-right corner of viewport with generous spacing
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - 88),
        y: Math.max(16, window.innerHeight - 96),
      };
    }
    return { x: 300, y: 500 };
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const dragDistanceRef = useRef(0);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(Math.max(16, prev.x), window.innerWidth - 76),
        y: Math.min(Math.max(16, prev.y), window.innerHeight - 76),
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag handlers for mouse & touch
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    dragDistanceRef.current = Math.sqrt(dx * dx + dy * dy);

    const newX = Math.min(
      Math.max(16, dragStartRef.current.posX + dx),
      window.innerWidth - 76
    );
    const newY = Math.min(
      Math.max(16, dragStartRef.current.posY + dy),
      window.innerHeight - 76
    );
    setPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handlePointerMove(e.clientX, e.clientY);
      }
    };
    const onMouseUp = () => handlePointerUp();

    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleHubClick = () => {
    // Only toggle menu if not dragged
    if (dragDistanceRef.current < 6) {
      setIsOpen((prev) => !prev);
    }
  };

  // Menu items with vibrant colors, especially the Theme ("Steam") button and 1-word labels
  const menuItems: MenuItem[] = [
    {
      id: 'chat',
      shortLabel: 'Chat',
      fullLabel: isChatOpen ? 'Close Chat' : 'Rhyme Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-rose-500/30 border-2 border-rose-200',
      onClick: () => {
        onToggleChat();
        setIsOpen(false);
      },
      badge: unreadChatCount > 0 ? unreadChatCount : null,
      highlight: hasNewPartnerMessage,
    },
    {
      id: 'themes',
      shortLabel: 'Theme', // Prompt: "Make the Steam [Theme] button colorful and add a one-word label under each button"
      fullLabel: 'Canvas Themes',
      icon: (
        <span className="relative flex items-center justify-center">
          <Palette className="w-4 h-4" />
          <Sparkles className="w-2.5 h-2.5 text-amber-200 absolute -top-1.5 -right-1.5" />
        </span>
      ),
      colorClass:
        'bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-amber-400 text-white shadow-purple-500/40 border-2 border-white ring-2 ring-fuchsia-400',
      onClick: () => {
        onOpenThemeModal();
        setIsOpen(false);
      },
    },
    {
      id: 'link',
      shortLabel: 'Link',
      fullLabel: hasCopiedLink ? 'Link Copied!' : 'Magic Link',
      icon: hasCopiedLink ? (
        <Check className="w-4 h-4 text-emerald-100" />
      ) : (
        <Share2 className="w-4 h-4" />
      ),
      colorClass:
        'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 border-2 border-emerald-200',
      onClick: onCopyMagicLink,
      highlight: hasCopiedLink,
    },
    {
      id: 'name',
      shortLabel: 'Profile',
      fullLabel: 'Poet Profile',
      icon: <User className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-indigo-500/30 border-2 border-indigo-200',
      onClick: () => {
        onOpenNameModal();
        setIsOpen(false);
      },
    },
    {
      id: 'export',
      shortLabel: 'Export',
      fullLabel: 'Export Studio',
      icon: <Download className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sky-500/30 border-2 border-sky-200',
      onClick: () => {
        onOpenExportStudio();
        setIsOpen(false);
      },
    },
    {
      id: 'new-poem',
      shortLabel: 'New',
      fullLabel: 'New Poem',
      icon: <RotateCcw className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-amber-500/30 border-2 border-amber-200',
      onClick: () => {
        onOpenNewPoemModal();
        setIsOpen(false);
      },
    },
    {
      id: 'help',
      shortLabel: 'Help',
      fullLabel: 'Help & Guide',
      icon: <HelpCircle className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-stone-700 to-stone-900 text-stone-100 shadow-stone-900/30 border-2 border-stone-500',
      onClick: () => {
        onOpenHelp();
        setIsOpen(false);
      },
    },
  ];

  /**
   * Adaptive Geometry Calculation to Guarantee Zero Overlap:
   * When in a corner or by an edge:
   * Instead of cramming 7 buttons into a narrow arc (which caused overlaps),
   * we use a staggered multi-tier radial fan in corners, and a generous radius along edges.
   */
  const computeCoordinates = (): ItemCoordinate[] => {
    const cx = position.x + 28;
    const cy = position.y + 28;
    const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const distLeft = cx;
    const distRight = winW - cx;
    const distTop = cy;
    const distBottom = winH - cy;

    const EDGE_THRESH = 150;
    const isNearLeft = distLeft < EDGE_THRESH;
    const isNearRight = distRight < EDGE_THRESH;
    const isNearTop = distTop < EDGE_THRESH;
    const isNearBottom = distBottom < EDGE_THRESH;

    // Corner cases: 2-tier staggered fan so buttons have massive spacing and never overlap!
    if (isNearRight && isNearBottom) {
      // Bottom-Right Corner: fan up and left
      // Tier 1 (3 items): R = 78px, angles 185°, 225°, 265°
      // Tier 2 (4 items): R = 146px, angles 178°, 208°, 238°, 268°
      const tier1Angles = [185, 225, 265].map((d) => (d * Math.PI) / 180);
      const tier2Angles = [178, 208, 238, 268].map((d) => (d * Math.PI) / 180);
      return [
        { tx: Math.round(Math.cos(tier1Angles[0]) * 78), ty: Math.round(Math.sin(tier1Angles[0]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[1]) * 78), ty: Math.round(Math.sin(tier1Angles[1]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[2]) * 78), ty: Math.round(Math.sin(tier1Angles[2]) * 78) },
        { tx: Math.round(Math.cos(tier2Angles[0]) * 146), ty: Math.round(Math.sin(tier2Angles[0]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[1]) * 146), ty: Math.round(Math.sin(tier2Angles[1]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[2]) * 146), ty: Math.round(Math.sin(tier2Angles[2]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[3]) * 146), ty: Math.round(Math.sin(tier2Angles[3]) * 146) },
      ];
    }

    if (isNearLeft && isNearBottom) {
      // Bottom-Left Corner: fan up and right
      const tier1Angles = [275, 315, 355].map((d) => (d * Math.PI) / 180);
      const tier2Angles = [272, 302, 332, 2].map((d) => (d * Math.PI) / 180);
      return [
        { tx: Math.round(Math.cos(tier1Angles[0]) * 78), ty: Math.round(Math.sin(tier1Angles[0]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[1]) * 78), ty: Math.round(Math.sin(tier1Angles[1]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[2]) * 78), ty: Math.round(Math.sin(tier1Angles[2]) * 78) },
        { tx: Math.round(Math.cos(tier2Angles[0]) * 146), ty: Math.round(Math.sin(tier2Angles[0]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[1]) * 146), ty: Math.round(Math.sin(tier2Angles[1]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[2]) * 146), ty: Math.round(Math.sin(tier2Angles[2]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[3]) * 146), ty: Math.round(Math.sin(tier2Angles[3]) * 146) },
      ];
    }

    if (isNearRight && isNearTop) {
      // Top-Right Corner: fan down and left
      const tier1Angles = [95, 135, 175].map((d) => (d * Math.PI) / 180);
      const tier2Angles = [92, 122, 152, 182].map((d) => (d * Math.PI) / 180);
      return [
        { tx: Math.round(Math.cos(tier1Angles[0]) * 78), ty: Math.round(Math.sin(tier1Angles[0]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[1]) * 78), ty: Math.round(Math.sin(tier1Angles[1]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[2]) * 78), ty: Math.round(Math.sin(tier1Angles[2]) * 78) },
        { tx: Math.round(Math.cos(tier2Angles[0]) * 146), ty: Math.round(Math.sin(tier2Angles[0]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[1]) * 146), ty: Math.round(Math.sin(tier2Angles[1]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[2]) * 146), ty: Math.round(Math.sin(tier2Angles[2]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[3]) * 146), ty: Math.round(Math.sin(tier2Angles[3]) * 146) },
      ];
    }

    if (isNearLeft && isNearTop) {
      // Top-Left Corner: fan down and right
      const tier1Angles = [5, 45, 85].map((d) => (d * Math.PI) / 180);
      const tier2Angles = [2, 32, 62, 92].map((d) => (d * Math.PI) / 180);
      return [
        { tx: Math.round(Math.cos(tier1Angles[0]) * 78), ty: Math.round(Math.sin(tier1Angles[0]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[1]) * 78), ty: Math.round(Math.sin(tier1Angles[1]) * 78) },
        { tx: Math.round(Math.cos(tier1Angles[2]) * 78), ty: Math.round(Math.sin(tier1Angles[2]) * 78) },
        { tx: Math.round(Math.cos(tier2Angles[0]) * 146), ty: Math.round(Math.sin(tier2Angles[0]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[1]) * 146), ty: Math.round(Math.sin(tier2Angles[1]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[2]) * 146), ty: Math.round(Math.sin(tier2Angles[2]) * 146) },
        { tx: Math.round(Math.cos(tier2Angles[3]) * 146), ty: Math.round(Math.sin(tier2Angles[3]) * 146) },
      ];
    }

    // Single edge cases: wide 160° arc with expanded 130px radius (giving 58px center-to-center spacing)
    const R_EDGE = 130;
    if (isNearRight) {
      // Half-wheel radiating leftward (100° to 260°)
      const start = (100 * Math.PI) / 180;
      const end = (260 * Math.PI) / 180;
      return menuItems.map((_, i) => {
        const angle = start + (end - start) * (i / (menuItems.length - 1));
        return { tx: Math.round(Math.cos(angle) * R_EDGE), ty: Math.round(Math.sin(angle) * R_EDGE) };
      });
    }

    if (isNearLeft) {
      // Half-wheel radiating rightward (-80° to 80°)
      const start = (-80 * Math.PI) / 180;
      const end = (80 * Math.PI) / 180;
      return menuItems.map((_, i) => {
        const angle = start + (end - start) * (i / (menuItems.length - 1));
        return { tx: Math.round(Math.cos(angle) * R_EDGE), ty: Math.round(Math.sin(angle) * R_EDGE) };
      });
    }

    if (isNearBottom) {
      // Half-wheel radiating upward (190° to 350°)
      const start = (190 * Math.PI) / 180;
      const end = (350 * Math.PI) / 180;
      return menuItems.map((_, i) => {
        const angle = start + (end - start) * (i / (menuItems.length - 1));
        return { tx: Math.round(Math.cos(angle) * R_EDGE), ty: Math.round(Math.sin(angle) * R_EDGE) };
      });
    }

    if (isNearTop) {
      // Half-wheel radiating downward (10° to 170°)
      const start = (10 * Math.PI) / 180;
      const end = (170 * Math.PI) / 180;
      return menuItems.map((_, i) => {
        const angle = start + (end - start) * (i / (menuItems.length - 1));
        return { tx: Math.round(Math.cos(angle) * R_EDGE), ty: Math.round(Math.sin(angle) * R_EDGE) };
      });
    }

    // Open space: 360-degree full circle with 116px radius (giving 97px center-to-center spacing)
    const R_OPEN = 116;
    const step = (2 * Math.PI) / menuItems.length;
    return menuItems.map((_, i) => {
      const angle = i * step - Math.PI / 2;
      return { tx: Math.round(Math.cos(angle) * R_OPEN), ty: Math.round(Math.sin(angle) * R_OPEN) };
    });
  };

  const coordinates = computeCoordinates();

  return (
    <>
      {/* Background click overlay to dismiss wheel menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-35 bg-stone-900/15 backdrop-blur-[1px] transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Draggable Hub and Radial Wheel */}
      <div
        ref={buttonRef}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          touchAction: 'none',
        }}
        className="fixed top-0 left-0 z-40 select-none will-change-transform"
      >
        {/* Radial Wheel Items with One-Word Labels */}
        {menuItems.map((item, index) => {
          const coord = coordinates[index];
          const tx = isOpen ? coord.tx : 0;
          const ty = isOpen ? coord.ty : 0;

          return (
            <div
              key={item.id}
              style={{
                transform: `translate3d(${tx}px, ${ty}px, 0) scale(${isOpen ? 1 : 0.1})`,
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transition: `all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 22}ms`,
              }}
              className="absolute top-1.5 left-1.5 w-12 flex flex-col items-center justify-center group"
            >
              {/* Colorful Round Button */}
              <button
                type="button"
                onClick={item.onClick}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-115 active:scale-95 cursor-pointer ${item.colorClass}`}
                title={item.fullLabel}
                aria-label={item.fullLabel}
              >
                {item.icon}

                {/* Badge if present */}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-600 text-white shadow-xs border border-white animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Prompt: "add a one-word label under each button that will tell the player what the button contains" */}
              <span className="mt-1 text-[10px] font-bold tracking-tight text-stone-900 bg-white/95 px-1.5 py-0.2 rounded-full shadow-xs border border-stone-200/90 pointer-events-none whitespace-nowrap leading-none">
                {item.shortLabel}
              </span>
            </div>
          );
        })}

        {/* Central Quill Hub Button */}
        <div
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onClick={handleHubClick}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl cursor-grab active:cursor-grabbing transition-transform hover:scale-105 active:scale-95 border-2 ${
            hasNewPartnerMessage
              ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-600 border-rose-300 ring-4 ring-rose-400 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.95)]'
              : isOpen
              ? 'bg-stone-800 border-amber-300 ring-2 ring-amber-400'
              : 'bg-stone-900 border-stone-700 hover:border-amber-400/80 shadow-black/40'
          }`}
          title={isOpen ? "Close Studio Menu" : "Studio Settings & Menu (Drag to move)"}
          aria-label="Studio Settings and Menu"
        >
          {hasNewPartnerMessage && (
            <span className="absolute -inset-1 rounded-full bg-rose-400 opacity-75 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X className="w-5 h-5 text-amber-300 transition-transform rotate-0" />
          ) : (
            <Feather className="w-6 h-6 text-amber-300 transition-transform" />
          )}

          {/* Unread badge on hub when collapsed */}
          {!isOpen && unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white border-2 border-white shadow-md animate-bounce">
              {unreadChatCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
