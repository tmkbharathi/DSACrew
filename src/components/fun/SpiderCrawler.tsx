import React, { useEffect, useState, useRef, useCallback } from 'react';
import { sounds } from './soundEffects';
import { useApp } from '../../context/AppContext';

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
  const { currentUser, soundEnabled } = useApp();
  const isVisible = currentUser?.preferences?.spiderVisible !== false;

  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  const [pos, setPos] = useState<SpiderPos>({
    x: 100,
    y: 120,
    angle: 45,
    isMoving: false,
    isDangling: false,
    silkStartY: 0,
  });

  const [isHovered, setIsHovered] = useState(false);

  const targetRef = useRef<{ x: number; y: number }>({ x: 200, y: 200 });
  const posRef = useRef(pos);
  posRef.current = pos;
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;
  const isVisibleRef = useRef(isVisible);
  isVisibleRef.current = isVisible;

  // Initialize position in the bottom-left empty corner
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minX = 25;
    const maxX = Math.min(220, w * 0.2);
    const minY = Math.max(h - 220, h * 0.7);
    const maxY = h - 45;

    const startX = Math.random() * (maxX - minX) + minX;
    const startY = Math.random() * (maxY - minY) + minY;

    setPos({
      x: startX,
      y: startY,
      angle: 0,
      isMoving: false,
      isDangling: false,
      silkStartY: 0,
    });
    targetRef.current = { x: startX, y: startY };
  }, []);

  // Spider motion loop: picking new random points strictly within bottom-left empty area
  const pickNewTarget = useCallback(() => {
    if (isHoveredRef.current || !isVisibleRef.current) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Bottom-left empty area bounds
    const minX = 25;
    const maxX = Math.min(230, w * 0.22);
    const minY = Math.max(h - 230, h * 0.68);
    const maxY = h - 45;

    // 15% chance to dangle from the top of the bottom-left corner on silk
    const doDangle = Math.random() < 0.15;
    if (doDangle) {
      const dropX = Math.random() * (maxX - minX) + minX;
      const dropY = Math.random() * (maxY - minY) + minY;
      targetRef.current = { x: dropX, y: dropY };
      setPos((prev) => ({
        ...prev,
        isDangling: true,
        silkStartY: Math.max(0, minY - 100),
      }));
      return;
    }

    // Regular crawling target inside the left bottom space
    const newX = Math.floor(Math.random() * (maxX - minX)) + minX;
    const newY = Math.floor(Math.random() * (maxY - minY)) + minY;

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
          </div>
        </div>
      )}

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
