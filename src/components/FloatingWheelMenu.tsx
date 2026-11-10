import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Feather,
  LogOut,
  Eye,
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
  onBackToLogin: () => void;
  onOpenGameModeModal: () => void;
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
  shortLabel: string; // One-word label under each button
  fullLabel: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
  badge?: number | string | null;
  highlight?: boolean;
}

interface ItemCoordinate {
  tx: number;
  ty: number;
}

export function FloatingWheelMenu({
  onBackToLogin,
  onOpenGameModeModal,
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

  // Menu items with vibrant colors and 1-word labels
  const menuItems: MenuItem[] = [
    {
      id: 'rules',
      shortLabel: 'Rules',
      fullLabel: 'Game Mode & Glimpse Rules',
      icon: <Eye className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-amber-500 to-yellow-600 text-white shadow-amber-500/30 border-2 border-amber-200',
      onClick: () => {
        onOpenGameModeModal();
        setIsOpen(false);
      },
    },
    {
      id: 'exit',
      shortLabel: 'Exit',
      fullLabel: 'Back to Setup / Exit Room',
      icon: <LogOut className="w-4 h-4" />,
      colorClass:
        'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/30 border-2 border-rose-200',
      onClick: () => {
        onBackToLogin();
        setIsOpen(false);
      },
    },
    {
      id: 'themes',
      shortLabel: 'Theme',
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
        'bg-gradient-to-tr from-orange-500 to-amber-600 text-white shadow-orange-500/30 border-2 border-orange-200',
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
   * Adaptive Geometry Calculation:
   * Dynamically calculates coordinates for any number of menu items in open space, edges, or corners.
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

    // Determine arc angles
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    let radius = 120;

    if (isNearRight && isNearBottom) {
      startAngle = Math.PI; // 180°
      endAngle = Math.PI * 1.5; // 270°
    } else if (isNearLeft && isNearBottom) {
      startAngle = Math.PI * 1.5; // 270°
      endAngle = Math.PI * 2; // 360°
    } else if (isNearRight && isNearTop) {
      startAngle = Math.PI * 0.5; // 90°
      endAngle = Math.PI; // 180°
    } else if (isNearLeft && isNearTop) {
      startAngle = 0; // 0°
      endAngle = Math.PI * 0.5; // 90°
    } else if (isNearRight) {
      startAngle = (100 * Math.PI) / 180;
      endAngle = (260 * Math.PI) / 180;
      radius = 130;
    } else if (isNearLeft) {
      startAngle = (-80 * Math.PI) / 180;
      endAngle = (80 * Math.PI) / 180;
      radius = 130;
    } else if (isNearBottom) {
      startAngle = (190 * Math.PI) / 180;
      endAngle = (350 * Math.PI) / 180;
      radius = 130;
    } else if (isNearTop) {
      startAngle = (10 * Math.PI) / 180;
      endAngle = (170 * Math.PI) / 180;
      radius = 130;
    } else {
      // Full circle in open space
      const step = (2 * Math.PI) / menuItems.length;
      return menuItems.map((_, i) => {
        const angle = i * step - Math.PI / 2;
        return { tx: Math.round(Math.cos(angle) * 116), ty: Math.round(Math.sin(angle) * 116) };
      });
    }

    // Corner cases: 2-tier staggered fan so all 8 items fit comfortably
    if ((isNearRight || isNearLeft) && (isNearTop || isNearBottom)) {
      const innerRadius = 78;
      const outerRadius = 146;
      const halfCount = Math.ceil(menuItems.length / 2);
      return menuItems.map((_, i) => {
        const isOuter = i >= halfCount;
        const tierIndex = isOuter ? i - halfCount : i;
        const tierTotal = isOuter ? menuItems.length - halfCount : halfCount;
        const angleStep = (endAngle - startAngle) / Math.max(1, tierTotal - 1);
        const angle = startAngle + tierIndex * angleStep;
        const r = isOuter ? outerRadius : innerRadius;
        return { tx: Math.round(Math.cos(angle) * r), ty: Math.round(Math.sin(angle) * r) };
      });
    }

    // Edge cases
    const angleStep = (endAngle - startAngle) / Math.max(1, menuItems.length - 1);
    return menuItems.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return { tx: Math.round(Math.cos(angle) * radius), ty: Math.round(Math.sin(angle) * radius) };
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
            isOpen
              ? 'bg-stone-800 border-amber-300 ring-2 ring-amber-400'
              : 'bg-stone-900 border-stone-700 hover:border-amber-400/80 shadow-black/40'
          }`}
          title={isOpen ? "Close Studio Menu" : "Studio Settings & Menu (Drag to move)"}
          aria-label="Studio Settings and Menu"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-amber-300 transition-transform rotate-0" />
          ) : (
            <Feather className="w-6 h-6 text-amber-300 transition-transform" />
          )}
        </div>
      </div>
    </>
  );
}
