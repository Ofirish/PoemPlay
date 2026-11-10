import React from 'react';

/**
 * French Bulldog Mascot:
 * - Light gray body (#D1D5DB)
 * - Dark gray / charcoal patches (#374151)
 * - LEFT eye: Sky Blue (#0EA5E9)
 * - RIGHT eye: Midnight Black (#111827)
 */
export function FrenchBulldogMascot({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="French bulldog with blue left eye and black right eye"
    >
      {/* Bat Ears */}
      {/* Left Ear (Viewer's left) */}
      <path
        d="M26 42 C18 20 22 6 36 12 C44 16 42 34 38 46 Z"
        fill="#D1D5DB"
        stroke="#9CA3AF"
        strokeWidth="2"
      />
      <path d="M28 36 C24 24 27 16 34 18 C38 20 37 30 35 38 Z" fill="#FBCFE8" />

      {/* Right Ear (Viewer's right - with dark gray patch) */}
      <path
        d="M74 42 C82 20 78 6 64 12 C56 16 58 34 62 46 Z"
        fill="#4B5563"
        stroke="#374151"
        strokeWidth="2"
      />
      <path d="M72 36 C76 24 73 16 66 18 C62 20 63 30 65 38 Z" fill="#F472B6" opacity="0.6" />

      {/* Head - Light Gray Base */}
      <path
        d="M24 54 C20 70 32 86 50 86 C68 86 80 70 76 54 C74 40 26 40 24 54 Z"
        fill="#E5E7EB"
        stroke="#9CA3AF"
        strokeWidth="2"
      />

      {/* Dark Gray Patch over Right Eye (Viewer's right) */}
      <path
        d="M50 42 C64 40 76 46 76 60 C76 72 64 74 54 70 C52 58 50 48 50 42 Z"
        fill="#374151"
      />

      {/* Wrinkles on forehead */}
      <path d="M44 46 Q50 49 56 46" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 51 Q50 53 54 51" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />

      {/* Muzzle / Cheeks */}
      <path
        d="M36 68 C36 62 44 60 50 62 C56 60 64 62 64 68 C64 76 58 80 50 80 C42 80 36 76 36 68 Z"
        fill="#F3F4F6"
        stroke="#D1D5DB"
        strokeWidth="1.5"
      />

      {/* Nose */}
      <path
        d="M46 64 C47 62 53 62 54 64 C55 66 52 69 50 69 C48 69 45 66 46 64 Z"
        fill="#1F2937"
      />

      {/* Mouth */}
      <path d="M50 69 L50 73" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M46 73 Q50 75 54 73" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" />

      {/* EYES - Key requirement: LEFT eye blue, RIGHT eye black */}
      {/* Left Eye (Viewer's left): Blue! */}
      <circle cx="36" cy="56" r="6.5" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="1" />
      <circle cx="36" cy="56" r="4.5" fill="#0284C7" />
      <circle cx="36" cy="56" r="2.5" fill="#0C4A6E" />
      <circle cx="37.5" cy="54.5" r="1.5" fill="#FFFFFF" />

      {/* Right Eye (Viewer's right): Midnight Black! */}
      <circle cx="64" cy="56" r="6.5" fill="#FFFFFF" stroke="#374151" strokeWidth="1" />
      <circle cx="64" cy="56" r="4.5" fill="#111827" />
      <circle cx="64" cy="56" r="2.5" fill="#030712" />
      <circle cx="65.5" cy="54.5" r="1.5" fill="#FFFFFF" />

      {/* Chic Parisian Red Collar with Gold Bell */}
      <path d="M34 84 Q50 90 66 84" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="88" r="3" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
    </svg>
  );
}

/**
 * Daddy & Toy Mascot:
 * - Warm cuddly plush teddy bear with heart stitch
 * - Soft kisses and floating hearts
 */
export function DaddyAndToyMascot({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Daddy and plush toy with love hearts and kisses"
    >
      {/* Floating Love Hearts */}
      <path
        d="M20 22 C18 18 12 18 10 22 C8 26 12 30 16 34 L20 38 L24 34 C28 30 32 26 30 22 C28 18 22 18 20 22 Z"
        fill="#F43F5E"
        className="animate-pulse"
      />
      <path
        d="M82 16 C80 12 74 12 72 16 C70 20 74 24 78 28 L82 32 L86 28 C90 24 94 20 92 16 C90 12 84 12 82 16 Z"
        fill="#FB7185"
      />

      {/* Kisses text / iconography */}
      <text x="76" y="44" fill="#E11D48" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        xoxo
      </text>

      {/* Teddy Bear Ears */}
      <circle cx="34" cy="40" r="10" fill="#D97706" />
      <circle cx="34" cy="40" r="5" fill="#FDE68A" />

      <circle cx="66" cy="40" r="10" fill="#D97706" />
      <circle cx="66" cy="40" r="5" fill="#FDE68A" />

      {/* Teddy Bear Head */}
      <circle cx="50" cy="52" r="20" fill="#F59E0B" />

      {/* Bear Muzzle */}
      <ellipse cx="50" cy="58" rx="8" ry="6" fill="#FEF3C7" />
      <ellipse cx="50" cy="56" rx="3.5" ry="2.5" fill="#78350F" />
      <path d="M50 58.5 L50 61" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M47 61 Q50 62.5 53 61" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />

      {/* Bear Eyes with joyful sparkles */}
      <circle cx="43" cy="50" r="2.5" fill="#451A03" />
      <circle cx="44" cy="49" r="0.8" fill="#FFFFFF" />

      <circle cx="57" cy="50" r="2.5" fill="#451A03" />
      <circle cx="58" cy="49" r="0.8" fill="#FFFFFF" />

      {/* Rosy Cheeks */}
      <circle cx="38" cy="56" r="3" fill="#FDA4AF" opacity="0.8" />
      <circle cx="62" cy="56" r="3" fill="#FDA4AF" opacity="0.8" />

      {/* Bear Body */}
      <ellipse cx="50" cy="78" rx="18" ry="16" fill="#F59E0B" />

      {/* Heart patch on chest */}
      <path
        d="M50 72 C48 69 44 69 42 72 C40 75 44 78 47 81 L50 84 L53 81 C56 78 60 75 58 72 C56 69 52 69 50 72 Z"
        fill="#E11D48"
      />

      {/* Hugging Arms holding heart */}
      <ellipse cx="33" cy="74" rx="5" ry="9" fill="#D97706" transform="rotate(25 33 74)" />
      <ellipse cx="67" cy="74" rx="5" ry="9" fill="#D97706" transform="rotate(-25 67 74)" />
    </svg>
  );
}
