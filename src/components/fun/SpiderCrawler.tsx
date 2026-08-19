import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Gamepad2, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { sounds } from './soundEffects';

interface SpiderCrawlerProps {
  onOpenSnakeGame: () => void;
}

interface SpiderPos {
  x: number;
  y: number;
  angle: number; // in degrees
  isMoving: boolean;
  isDangling: boolean;
  silkStartY: number;
}

export const SpiderCrawler: React.FC<SpiderCrawlerProps> = ({ onOpenSnakeGame }) => {
  const [pos, setPos] = useState<SpiderPos>({
    x: 100,
    y: 120,
    angle: 45,
    isMoving: false,
    isDangling: false,
    silkStartY: 0,
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showNotification, setShowNotification] = useState(true);

  const targetRef = useRef<{ x: number; y: number }>({ x: 200, y: 200 });
  const posRef = useRef(pos);
  posRef.current = pos;
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;

  // Initialize random position on mount
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const startX = Math.random() * (w - 200) + 100;
    const startY = Math.random() * (h - 250) + 100;
    setPos({
      x: startX,
      y: startY,
      angle: 0,
      isMoving: false,
      isDangling: false,
      silkStartY: 0,
    });
    targetRef.current = { x: startX, y: startY };

    // Auto-dismiss the initial notification bubble after 7 seconds
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // Spider motion loop: picking new random points and moving smoothly
  const pickNewTarget = useCallback(() => {
    if (isHoveredRef.current || !isVisibleRef.current) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 15% chance to dangle from the top on silk
    const doDangle = Math.random() < 0.15;
    if (doDangle) {
      const dropX = Math.min(Math.max(posRef.current.x + (Math.random() * 200 - 100), 80), w - 80);
      const dropY = Math.random() * 300 + 100;
      targetRef.current = { x: dropX, y: dropY };
      setPos((prev) => ({
        ...prev,
        isDangling: true,
        silkStartY: 0,
      }));
      return;
    }

    // Regular crawling target across viewport
    const pad = 60;
    const newX = Math.floor(Math.random() * (w - pad * 2)) + pad;
    const newY = Math.floor(Math.random() * (h - pad * 2)) + pad;

    targetRef.current = { x: newX, y: newY };
    setPos((prev) => ({
      ...prev,
      isDangling: false,
    }));
  }, []);

  // Main animation / movement ticker
  useEffect(() => {
    if (!isVisible) return;

    let animFrameId: number;
    let lastTime = performance.now();
    let moveTimer = 0;

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      moveTimer += delta;

      if (!isHoveredRef.current) {
        const current = posRef.current;
        const target = targetRef.current;
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 8) {
          // Calculate angle
          const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // +90 because spider faces up by default
          
          // Smoothly rotate
          let diffAngle = (targetAngle - current.angle) % 360;
          if (diffAngle > 180) diffAngle -= 360;
          if (diffAngle < -180) diffAngle += 360;
          const newAngle = current.angle + diffAngle * Math.min(delta * 6, 1);

          // Move speed: around 70-130 px/sec
          const speed = current.isDangling ? 110 : 85;
          const step = Math.min(speed * delta, dist);
          const nx = current.x + (dx / dist) * step;
          const ny = current.y + (dy / dist) * step;

          setPos({
            x: nx,
            y: ny,
            angle: newAngle,
            isMoving: true,
            isDangling: current.isDangling,
            silkStartY: current.silkStartY,
          });
        } else {
          // Reached target -> pause and pick next target after slight delay
          if (current.isMoving) {
            setPos((prev) => ({ ...prev, isMoving: false }));
          }
          if (moveTimer > 2.5 + Math.random() * 3) {
            moveTimer = 0;
            pickNewTarget();
          }
        }
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [isVisible, pickNewTarget]);

  const handleSpiderClick = () => {
    sounds.playSpiderScurry();
    onOpenSnakeGame();
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const toggleMute = () => {
    sounds.enabled = isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      {/* Spider Canvas / Container (Pointer events none so it never blocks workspace clicks, spider itself has pointer-events-auto) */}
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
          {/* Silk Web Line if dangling from ceiling */}
          {pos.isDangling && pos.y > 10 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 39 }}>
              <line
                x1={pos.x}
                y1={0}
                x2={pos.x}
                y2={pos.y}
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="1.2"
                strokeDasharray="3,2"
              />
            </svg>
          )}

          {/* Interactive Spider Entity */}
          <div
            className="absolute pointer-events-auto cursor-pointer transition-transform duration-75 group"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: `translate(-50%, -50%) rotate(${pos.angle}deg) scale(${isHovered ? 1.15 : 1})`,
              transformOrigin: 'center center',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleSpiderClick}
            role="button"
            tabIndex={0}
            title="Click me to relax with Classic Snake Game!"
          >
            {/* Pulsing Aura on Hover */}
            <div
              className={`absolute -inset-3 rounded-full transition-opacity duration-300 ${
                isHovered
                  ? 'bg-emerald-500/25 blur-md opacity-100 animate-pulse'
                  : 'opacity-0'
              }`}
            />

            {/* Spider SVG */}
            <svg
              width="46"
              height="46"
              viewBox="0 0 100 100"
              className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter transition-all duration-200"
            >
              <defs>
                <radialGradient id="spiderBodyGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#30363d" />
                  <stop offset="60%" stopColor="#161b22" />
                  <stop offset="100%" stopColor="#090d13" />
                </radialGradient>
                <radialGradient id="spiderHeadGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#384252" />
                  <stop offset="100%" stopColor="#0d1117" />
                </radialGradient>
                <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3fb950" />
                  <stop offset="100%" stopColor="#238636" />
                </radialGradient>
              </defs>

              {/* Spider Legs - 4 on Left, 4 on Right */}
              {/* Left Legs */}
              <g
                className={pos.isMoving ? 'animate-[spiderLegLeft_0.35s_ease-in-out_infinite_alternate]' : ''}
                stroke="#21262d"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                {/* Leg 1 (Front Left) */}
                <path d="M 44 40 Q 20 20, 10 12" />
                {/* Leg 2 (Mid-Front Left) */}
                <path d="M 42 46 Q 15 35, 6 42" />
                {/* Leg 3 (Mid-Back Left) */}
                <path d="M 42 54 Q 15 65, 8 75" />
                {/* Leg 4 (Back Left) */}
                <path d="M 44 60 Q 20 85, 14 94" />
              </g>

              {/* Right Legs */}
              <g
                className={pos.isMoving ? 'animate-[spiderLegRight_0.35s_ease-in-out_infinite_alternate]' : ''}
                stroke="#21262d"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                {/* Leg 1 (Front Right) */}
                <path d="M 56 40 Q 80 20, 90 12" />
                {/* Leg 2 (Mid-Front Right) */}
                <path d="M 58 46 Q 85 35, 94 42" />
                {/* Leg 3 (Mid-Back Right) */}
                <path d="M 58 54 Q 85 65, 92 75" />
                {/* Leg 4 (Back Right) */}
                <path d="M 56 60 Q 80 85, 86 94" />
              </g>

              {/* Pedipalps / Front Fangs */}
              <path
                d="M 45 30 Q 42 22, 40 24 M 55 30 Q 58 22, 60 24"
                stroke="#30363d"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Abdomen (Rear Body) */}
              <ellipse
                cx="50"
                cy="62"
                rx="15"
                ry="18"
                fill="url(#spiderBodyGrad)"
                stroke="#30363d"
                strokeWidth="1.5"
              />
              
              {/* LeetCode/Coding symbol mark on Abdomen */}
              <path
                d="M 46 58 L 43 62 L 46 66 M 54 58 L 57 62 L 54 66"
                stroke="#3fb950"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />

              {/* Cephalothorax (Front Body/Head) */}
              <ellipse
                cx="50"
                cy="38"
                rx="11"
                ry="11"
                fill="url(#spiderHeadGrad)"
                stroke="#30363d"
                strokeWidth="1.5"
              />

              {/* Glowing Spider Eyes (Green Emerald) */}
              <circle cx="46" cy="33" r="2.2" fill="url(#eyeGlow)" />
              <circle cx="54" cy="33" r="2.2" fill="url(#eyeGlow)" />
              <circle cx="42" cy="36" r="1.3" fill="#3fb950" opacity="0.8" />
              <circle cx="58" cy="36" r="1.3" fill="#3fb950" opacity="0.8" />
            </svg>

            {/* Floating Tooltip / Invitation Bubble */}
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-xl bg-[#161b22]/95 border border-[#30363d] shadow-2xl backdrop-blur-md text-xs whitespace-nowrap transition-all duration-300 pointer-events-none flex items-center gap-2 z-50 ${
                isHovered || showNotification
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-1 scale-95 pointer-events-none'
              }`}
              style={{
                // Counter-rotate tooltip so it stays right-side up regardless of spider's angle
                transform: `translateX(-50%) rotate(${-pos.angle}deg)`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#3fb950] animate-ping" />
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-[#3fb950]" />
                <span>Relax with Snake!</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
                Click me
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Corner Relaxation / Spider Controls Floating Bar */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1.5 bg-[#161b22]/90 border border-[#30363d] px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md text-xs text-slate-300">
        <button
          onClick={onOpenSnakeGame}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-all text-[11px] font-medium"
          title="Open Classic Snake Game"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Play Snake</span>
        </button>

        <button
          onClick={toggleVisibility}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isVisible ? 'Hide Spider' : 'Show Spider'}
        >
          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
        </button>

        <button
          onClick={toggleMute}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isMuted ? 'Unmute Game Sounds' : 'Mute Game Sounds'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Custom keyframe styles for spider leg animations */}
      <style>{`
        @keyframes spiderLegLeft {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(-2px, -3px) rotate(-6deg); }
          100% { transform: translate(1px, 2px) rotate(4deg); }
        }
        @keyframes spiderLegRight {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          50% { transform: translate(2px, 3px) rotate(6deg); }
          100% { transform: translate(-1px, -2px) rotate(-4deg); }
        }
      `}</style>
    </>
  );
};
