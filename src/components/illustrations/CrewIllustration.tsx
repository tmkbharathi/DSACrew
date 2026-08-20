import React from 'react';

export const CrewIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto' }) => {
  return (
    <div className={`relative select-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 680 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[360px]"
      >
        <defs>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#2d6a4f" floodOpacity="0.08" />
          </filter>
          <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1e293b" floodOpacity="0.1" />
          </filter>
          <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f7fbf8" />
          </linearGradient>
          <linearGradient id="streakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fffdf9" />
          </linearGradient>
        </defs>

        {/* Soft Background Table / Ground Ellipse */}
        <ellipse cx="340" cy="310" rx="310" ry="75" fill="#f4ede0" fillOpacity="0.8" />
        <ellipse cx="340" cy="305" rx="270" ry="60" fill="#ede4d4" fillOpacity="0.5" />

        {/* Floating Bubble Top Left: "Let's solve this together! 💚" */}
        <g filter="url(#cardShadow)">
          <rect x="230" y="55" width="180" height="42" rx="21" fill="url(#bubbleGrad)" stroke="#d8f3dc" strokeWidth="1.5" />
          <polygon points="310,97 325,97 318,108" fill="#ffffff" stroke="#d8f3dc" strokeWidth="1.5" />
          <polygon points="311,96 324,96 318,106" fill="#ffffff" />
          <text x="245" y="81" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="bold" fill="#1b4332">
            Let's solve this together! 💚
          </text>
        </g>

        {/* Floating Streak Card Top Right */}
        <g filter="url(#cardShadow)">
          <rect x="470" y="45" width="165" height="90" rx="14" fill="url(#streakGrad)" stroke="#fed7aa" strokeWidth="1.5" />
          <text x="485" y="68" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="600" fill="#64748b">
            Streak
          </text>
          <text x="560" y="68" fontFamily="system-ui, sans-serif" fontSize="13" fontWeight="bold" fill="#ea580c">
            7 Days 🔥
          </text>

          {/* Days M T W T F S S */}
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <g key={i} transform={`translate(${485 + i * 20}, 82)`}>
              <circle cx="7" cy="7" r="7" fill="#2d6a4f" />
              <path d="M4 7 L6 9 L10 5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x="7" y="24" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="600" fill="#94a3b8">
                {day}
              </text>
            </g>
          ))}
        </g>

        {/* Floating Code Icon Badge Top Center */}
        <g filter="url(#cardShadow)">
          <circle cx="340" cy="35" r="18" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="1.5" />
          <text x="340" y="40" textAnchor="middle" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#0284c7">
            &lt;/&gt;
          </text>
        </g>

        {/* Character 1 (Left - Girl with glasses & green hoodie) */}
        <g id="girl-coder">
          {/* Long dark hair behind */}
          <path d="M190 190 Q170 230 180 300 Q215 300 225 240 Z" fill="#2d3748" />
          {/* Body / Green Hoodie */}
          <path d="M195 245 C175 270 160 330 160 340 L260 340 C260 330 250 270 230 245 Z" fill="#40916c" />
          <path d="M205 245 L220 280 L210 320" stroke="#2d6a4f" strokeWidth="2" fill="none" />
          {/* Head & Neck */}
          <rect x="204" y="225" width="16" height="25" rx="5" fill="#fbd38d" />
          <ellipse cx="212" cy="195" rx="24" ry="28" fill="#fbd38d" />
          {/* Bangs / Hair Front */}
          <path d="M188 190 C188 165 236 165 236 190 C230 180 220 180 212 185 C205 180 195 180 188 190 Z" fill="#2d3748" />
          {/* Eyes & Smile */}
          <ellipse cx="204" cy="195" rx="2.5" ry="3" fill="#1a202c" />
          <ellipse cx="220" cy="195" rx="2.5" ry="3" fill="#1a202c" />
          <path d="M208 206 Q212 211 216 206" stroke="#c05621" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Round Glasses */}
          <circle cx="204" cy="195" r="7" stroke="#ffffff" strokeWidth="1.8" fill="none" />
          <circle cx="220" cy="195" r="7" stroke="#ffffff" strokeWidth="1.8" fill="none" />
          <line x1="211" y1="195" x2="213" y2="195" stroke="#ffffff" strokeWidth="1.8" />
          {/* Hands on Laptop */}
          <ellipse cx="230" cy="290" rx="9" ry="6" fill="#fbd38d" />
          {/* Laptop (Lavender) */}
          <polygon points="215,290 275,290 290,320 200,320" fill="#cbd5e1" />
          <polygon points="230,240 285,240 280,290 225,290" fill="#c084fc" stroke="#a855f7" strokeWidth="1.5" />
          <text x="255" y="270" textAnchor="middle" fontFamily="monospace" fontSize="12" fontWeight="bold" fill="#ffffff">
            &lt;/&gt;
          </text>
        </g>

        {/* Character 2 (Center - Boy cheering with fist raised) */}
        <g id="cheering-boy">
          {/* Body / Dark Green Hoodie */}
          <path d="M305 220 C280 250 270 330 270 340 L380 340 C380 330 370 250 345 220 Z" fill="#2d6a4f" />
          {/* Raised Arm & Fist */}
          <path d="M350 230 Q375 190 370 170" stroke="#2d6a4f" strokeWidth="20" strokeLinecap="round" fill="none" />
          <circle cx="370" cy="165" r="10" fill="#fbd38d" />
          {/* Neck & Head */}
          <rect x="317" y="200" width="18" height="25" rx="5" fill="#fbd38d" />
          <ellipse cx="326" cy="170" rx="26" ry="30" fill="#fbd38d" />
          {/* Hair (messy wavy black hair) */}
          <path d="M298 165 C298 135 354 135 354 165 C345 155 330 150 326 158 C320 150 305 155 298 165 Z" fill="#1a202c" />
          {/* Happy Open Smile & Eyes */}
          <ellipse cx="317" cy="170" rx="2.5" ry="3.5" fill="#1a202c" />
          <ellipse cx="335" cy="170" rx="2.5" ry="3.5" fill="#1a202c" />
          <path d="M318 182 Q326 193 334 182 Z" fill="#e53e3e" stroke="#c53030" strokeWidth="1" />
          {/* Blush */}
          <ellipse cx="310" cy="177" rx="4" ry="2" fill="#feb2b2" opacity="0.6" />
          <ellipse cx="342" cy="177" rx="4" ry="2" fill="#feb2b2" opacity="0.6" />
        </g>

        {/* Character 3 (Right - Boy with yellow hoodie, glasses, peace sign) */}
        <g id="peace-boy">
          {/* Body / Mustard Yellow Hoodie */}
          <path d="M405 235 C385 260 375 330 375 340 L480 340 C480 330 470 260 450 235 Z" fill="#eab308" />
          {/* Raised Arm & Peace Sign ✌️ */}
          <path d="M460 245 Q495 220 500 200" stroke="#eab308" strokeWidth="16" strokeLinecap="round" fill="none" />
          <circle cx="505" cy="195" r="9" fill="#fbd38d" />
          <line x1="500" y1="190" x2="495" y2="175" stroke="#fbd38d" strokeWidth="3" strokeLinecap="round" />
          <line x1="507" y1="190" x2="512" y2="175" stroke="#fbd38d" strokeWidth="3" strokeLinecap="round" />
          {/* Neck & Head */}
          <rect x="420" y="215" width="16" height="25" rx="5" fill="#fbd38d" />
          <ellipse cx="428" cy="185" rx="24" ry="27" fill="#fbd38d" />
          {/* Black Hair with stylish fringe */}
          <path d="M404 180 C404 150 452 150 452 180 C445 170 435 168 428 175 C420 168 410 170 404 180 Z" fill="#1a202c" />
          {/* Eyes & Friendly Smile */}
          <ellipse cx="420" cy="185" rx="2.5" ry="3" fill="#1a202c" />
          <ellipse cx="436" cy="185" rx="2.5" ry="3" fill="#1a202c" />
          <path d="M424 196 Q428 202 432 196" stroke="#c05621" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Glasses */}
          <circle cx="420" cy="185" r="6.5" stroke="#475569" strokeWidth="1.5" fill="none" />
          <circle cx="436" cy="185" r="6.5" stroke="#475569" strokeWidth="1.5" fill="none" />
          <line x1="426.5" y1="185" x2="429.5" y2="185" stroke="#475569" strokeWidth="1.5" />
          {/* Laptop (Dark Slate with LeetCode sticker) */}
          <polygon points="415,280 475,280 490,320 400,320" fill="#94a3b8" />
          <polygon points="425,235 480,235 475,280 420,280" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <text x="448" y="260" textAnchor="middle" fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#ffffff">
            &lt;/&gt;
          </text>
          {/* LeetCode Green Badge sticker */}
          <rect x="426" y="260" width="16" height="12" rx="3" fill="#2d6a4f" />
          <text x="434" y="268" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="bold" fill="#ffffff">
            Leet
          </text>
        </g>

        {/* Coffee Mug on Table */}
        <g transform="translate(225, 305)">
          <rect x="0" y="0" width="18" height="22" rx="4" fill="#52b788" />
          <path d="M18 5 C23 5 23 15 18 15" stroke="#52b788" strokeWidth="2.5" fill="none" />
          <text x="9" y="14" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#ffffff">
            &lt;/&gt;
          </text>
        </g>

        {/* Small Potted Desk Plant */}
        <g transform="translate(255, 305)">
          <polygon points="2,12 16,12 13,22 5,22" fill="#d97706" />
          <path d="M9 12 Q4 3 9 0 Q14 3 9 12" fill="#2d6a4f" />
          <path d="M9 10 Q16 4 17 0 Q12 4 9 10" fill="#52b788" />
        </g>

        {/* Books Stack */}
        <g transform="translate(285, 308)">
          <rect x="0" y="6" width="38" height="8" rx="2" fill="#ea580c" />
          <rect x="3" y="0" width="34" height="6" rx="2" fill="#0284c7" />
        </g>
      </svg>
    </div>
  );
};
