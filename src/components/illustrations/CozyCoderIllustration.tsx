import React from 'react';

export const CozyCoderIllustration: React.FC<{ className?: string }> = ({ className = 'w-full max-w-md h-auto' }) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      {/* Background warm glowing ambient lighting */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-100/60 blur-3xl -top-6 -right-6 pointer-events-none" />
      <div className="absolute w-64 h-64 rounded-full bg-emerald-100/40 blur-2xl -bottom-4 -left-4 pointer-events-none" />

      {/* Main Illustration SVG */}
      <svg
        viewBox="0 0 500 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm transition-transform duration-500 hover:scale-[1.02]"
      >
        {/* Soft Background Window with light */}
        <rect x="180" y="30" width="140" height="180" rx="16" fill="#F4EDE0" opacity="0.65" />
        <rect x="190" y="40" width="55" height="75" rx="8" fill="#FFFDF8" opacity="0.9" />
        <rect x="255" y="40" width="55" height="75" rx="8" fill="#FFFDF8" opacity="0.9" />
        <rect x="190" y="125" width="55" height="75" rx="8" fill="#FFFDF8" opacity="0.9" />
        <rect x="255" y="125" width="55" height="75" rx="8" fill="#FFFDF8" opacity="0.9" />

        {/* Ambient Pendant Lamp */}
        <line x1="250" y1="0" x2="250" y2="70" stroke="#8D9A93" strokeWidth="2" strokeDasharray="3,3" />
        <path d="M 235 85 Q 250 65, 265 85 Z" fill="#E8B04C" />
        <ellipse cx="250" cy="85" rx="15" ry="4" fill="#F6D179" />
        <circle cx="250" cy="94" r="28" fill="#FFE8A3" opacity="0.35" filter="blur(6px)" />

        {/* Wooden Study Desk */}
        <path
          d="M 60 305 L 440 305 Q 448 305, 448 315 L 440 328 Q 436 332, 428 332 L 72 332 Q 64 332, 60 328 L 52 315 Q 52 305, 60 305 Z"
          fill="#DDB892"
        />
        <rect x="68" y="332" width="364" height="6" fill="#B08968" opacity="0.8" />
        {/* Desk Legs */}
        <line x1="90" y1="338" x2="90" y2="410" stroke="#7F5539" strokeWidth="10" strokeLinecap="round" />
        <line x1="410" y1="338" x2="410" y2="410" stroke="#7F5539" strokeWidth="10" strokeLinecap="round" />

        {/* Potted Indoor House Plant on Desk Left */}
        <path d="M 95 305 L 125 305 L 120 330 L 100 330 Z" fill="#E6CCB2" />
        {/* Plant Leaves */}
        <path d="M 110 305 Q 85 270, 75 255 Q 100 270, 110 305" fill="#52B788" />
        <path d="M 110 305 Q 110 250, 105 235 Q 120 260, 110 305" fill="#2D6A4F" />
        <path d="M 110 305 Q 135 265, 148 250 Q 130 275, 110 305" fill="#74C69D" />

        {/* Developer Character */}
        {/* Chair Back */}
        <rect x="180" y="210" width="100" height="95" rx="20" fill="#2B3A42" />

        {/* Body & Green Hoodie */}
        <path
          d="M 170 305 Q 170 235, 230 235 Q 290 235, 290 305 Z"
          fill="#40916C"
        />
        {/* Hoodie Strings / Logo */}
        <circle cx="230" cy="275" r="3" fill="#D8F3DC" />
        <path d="M 222 285 L 222 295 M 238 285 L 238 295" stroke="#D8F3DC" strokeWidth="2" strokeLinecap="round" />

        {/* Head and Neck */}
        <rect x="220" y="195" width="20" height="25" rx="4" fill="#FAD2B1" />
        <ellipse cx="230" cy="170" rx="26" ry="30" fill="#FAD2B1" />

        {/* Friendly Hair */}
        <path
          d="M 204 165 C 204 135, 256 135, 256 165 C 256 155, 250 142, 235 142 C 220 142, 210 152, 204 165 Z"
          fill="#2C3E50"
        />
        <path
          d="M 204 160 Q 215 152, 230 155 Q 248 148, 256 162 C 258 175, 248 180, 248 180 C 248 165, 235 160, 225 162 C 215 164, 208 175, 204 160 Z"
          fill="#2C3E50"
        />

        {/* Friendly Face Profile */}
        <circle cx="238" cy="168" r="3" fill="#2C3E50" /> {/* Eye */}
        <path d="M 233 162 Q 238 159, 243 162" stroke="#2C3E50" strokeWidth="1.8" strokeLinecap="round" fill="none" /> {/* Eyebrow */}
        <path d="M 245 174 Q 248 178, 244 180" stroke="#E09F67" strokeWidth="1.8" strokeLinecap="round" fill="none" /> {/* Nose */}
        <path d="M 236 186 Q 242 190, 247 186" stroke="#C86D51" strokeWidth="2" strokeLinecap="round" fill="none" /> {/* Smile */}
        <circle cx="242" cy="180" r="4" fill="#F4A261" opacity="0.35" /> {/* Blush */}

        {/* Character Arms onto Desk */}
        <path
          d="M 180 280 Q 210 295, 240 295 Q 255 295, 270 290"
          stroke="#40916C"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hands */}
        <circle cx="252" cy="295" r="7" fill="#FAD2B1" />
        <circle cx="270" cy="292" r="7" fill="#FAD2B1" />

        {/* Modern Laptop with </> Logo */}
        {/* Laptop Screen */}
        <rect
          x="280"
          y="230"
          width="90"
          height="65"
          rx="6"
          fill="#1E2922"
          stroke="#2D3748"
          strokeWidth="2"
        />
        {/* Glowing Screen Content */}
        <rect x="284" y="234" width="82" height="57" rx="3" fill="#0D1117" />
        {/* Code Logo on Screen */}
        <text
          x="325"
          y="268"
          textAnchor="middle"
          fill="#3FB950"
          fontSize="18"
          fontWeight="bold"
          fontFamily="monospace"
        >
          &lt;/&gt;
        </text>
        {/* Laptop Keyboard Base on Desk */}
        <path
          d="M 270 295 L 380 295 L 372 305 L 278 305 Z"
          fill="#4A5568"
        />

        {/* Cozy Warm Ceramic Coffee Mug on Desk Right */}
        <rect x="395" y="280" width="22" height="25" rx="5" fill="#E76F51" />
        <path d="M 417 286 Q 425 292, 417 298" stroke="#E76F51" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Gentle Steam from Coffee */}
        <path d="M 402 274 Q 398 266, 404 258" stroke="#DDA15E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M 408 272 Q 412 264, 408 256" stroke="#DDA15E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
      </svg>
    </div>
  );
};
