import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  X,
  RotateCcw,
  Play,
  Pause,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sounds } from './soundEffects';

interface SnakeGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameMode = 'chill' | 'classic' | 'speedrun';

interface Point {
  x: number;
  y: number;
}

interface FoodItem {
  x: number;
  y: number;
  type: 'normal' | 'bonus' | 'coffee';
  expiresAt?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

const GRID_SIZE = 22; // 22 x 22 grid
const CELL_SIZE = 18; // 18px per cell (approx 396px x 396px canvas)

const RELAX_QUOTES = [
  '“Take a deep breath. Even O(n!) problems have simpler perspectives.”',
  '“Resting your brain is the most optimal dynamic programming memoization.”',
  '“You are doing great! Don’t let edge cases stress you out.”',
  '“A calm mind debugs 10x faster than a tired one.”',
  '“Clear your thoughts, hydrate, and conquer the next challenge!”',
];

export const SnakeGameModal: React.FC<SnakeGameModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useApp();
  const isIllustrative = theme === 'illustrative';
  const isIllustrativeRef = useRef(false);
  isIllustrativeRef.current = isIllustrative;

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('leet_snake_highscore') || '0', 10);
  });
  const [mode, setMode] = useState<GameMode>('chill');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state refs for 60fps ticker loop without stale closures
  const snakeRef = useRef<Point[]>([
    { x: 10, y: 11 },
    { x: 10, y: 12 },
    { x: 10, y: 13 },
  ]);
  const dirRef = useRef<Direction>('UP');
  const nextDirRef = useRef<Direction>('UP');
  const foodRef = useRef<FoodItem>({ x: 10, y: 6, type: 'normal' });
  const particlesRef = useRef<Particle[]>([]);
  const gameRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const isGameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const modeRef = useRef<GameMode>('chill');

  // Keep refs synced with React state
  modeRef.current = mode;
  isPausedRef.current = isPaused;
  isGameOverRef.current = isGameOver;

  // Sound mute state sync
  useEffect(() => {
    sounds.enabled = !isMuted;
  }, [isMuted]);

  // Pick random relaxation quote
  const refreshQuote = () => {
    setQuoteIndex(Math.floor(Math.random() * RELAX_QUOTES.length));
  };

  // Spawn random food
  const spawnFood = useCallback((currentSnake: Point[]) => {
    const isOccupied = (px: number, py: number) => {
      return currentSnake.some((segment) => segment.x === px && segment.y === py);
    };

    let nx = 0;
    let ny = 0;
    let attempts = 0;
    do {
      nx = Math.floor(Math.random() * GRID_SIZE);
      ny = Math.floor(Math.random() * GRID_SIZE);
      attempts++;
    } while (isOccupied(nx, ny) && attempts < 100);

    // Random food type: 15% chance golden coin, 10% chance coffee, 75% normal
    const rand = Math.random();
    let type: 'normal' | 'bonus' | 'coffee' = 'normal';
    let expiresAt: number | undefined = undefined;

    if (rand < 0.15) {
      type = 'bonus';
      expiresAt = Date.now() + 8000; // 8 seconds duration
    } else if (rand < 0.25) {
      type = 'coffee';
      expiresAt = Date.now() + 10000;
    }

    foodRef.current = { x: nx, y: ny, type, expiresAt };
  }, []);

  // Spawn particle effect
  const addParticles = (x: number, y: number, color: string, count: number = 12) => {
    const px = x * CELL_SIZE + CELL_SIZE / 2;
    const py = y * CELL_SIZE + CELL_SIZE / 2;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 3 + 1.5;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 2,
        life: 1,
        maxLife: Math.random() * 20 + 20,
      });
    }
  };

  // Start / Reset Game
  const restartGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 11 },
      { x: 10, y: 12 },
      { x: 10, y: 13 },
    ];
    dirRef.current = 'UP';
    nextDirRef.current = 'UP';
    setScore(0);
    scoreRef.current = 0;
    setIsGameOver(false);
    isGameOverRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setIsNewHigh(false);
    particlesRef.current = [];
    spawnFood(snakeRef.current);
    refreshQuote();
    gameRunningRef.current = true;
  }, [spawnFood]);

  // Toggle Pause helper function
  const togglePause = useCallback(() => {
    if (isGameOverRef.current) return;
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      return next;
    });
  }, []);

  // Handle high score updates
  const updateHighScore = useCallback((finalScore: number) => {
    const saved = parseInt(localStorage.getItem('leet_snake_highscore') || '0', 10);
    if (finalScore > saved) {
      localStorage.setItem('leet_snake_highscore', finalScore.toString());
      setHighScore(finalScore);
      setIsNewHigh(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3fb950', '#d29922', '#58a6ff', '#f0883e'],
      });
    }
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys & space inside modal
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        restartGame();
        return;
      }

      // If paused, unpause upon pressing directional key
      if (isPausedRef.current && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        setIsPaused(false);
        isPausedRef.current = false;
      }

      const current = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && current !== 'DOWN') {
        nextDirRef.current = 'UP';
        sounds.playMove();
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && current !== 'UP') {
        nextDirRef.current = 'DOWN';
        sounds.playMove();
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && current !== 'RIGHT') {
        nextDirRef.current = 'LEFT';
        sounds.playMove();
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && current !== 'LEFT') {
        nextDirRef.current = 'RIGHT';
        sounds.playMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, restartGame, togglePause]);

  // Main Game Loop (Only mounted when modal opens)
  useEffect(() => {
    if (!isOpen) return;

    restartGame();

    let animationFrameId: number;
    let lastStepTime = performance.now();

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Determine step interval based on game mode & score
      let interval = 135; // Default chill speed (relaxed)
      if (modeRef.current === 'classic') {
        interval = 105;
      } else if (modeRef.current === 'speedrun') {
        interval = Math.max(60, 120 - Math.floor(scoreRef.current / 30) * 10);
      }

      // Step forward logic (checked directly against refs)
      if (gameRunningRef.current && !isPausedRef.current && !isGameOverRef.current) {
        if (time - lastStepTime > interval) {
          lastStepTime = time;

          // Check if bonus food expired
          if (foodRef.current.expiresAt && Date.now() > foodRef.current.expiresAt) {
            spawnFood(snakeRef.current);
          }

          // Advance direction
          dirRef.current = nextDirRef.current;
          const head = { ...snakeRef.current[0] };

          if (dirRef.current === 'UP') head.y -= 1;
          if (dirRef.current === 'DOWN') head.y += 1;
          if (dirRef.current === 'LEFT') head.x -= 1;
          if (dirRef.current === 'RIGHT') head.x += 1;

          // Check wall collisions based on mode
          if (modeRef.current === 'chill') {
            // Wrap around boundaries
            if (head.x < 0) head.x = GRID_SIZE - 1;
            if (head.x >= GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = GRID_SIZE - 1;
            if (head.y >= GRID_SIZE) head.y = 0;
          } else {
            // Lethal boundaries in classic / speedrun
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
              sounds.playGameOver();
              setIsGameOver(true);
              isGameOverRef.current = true;
              gameRunningRef.current = false;
              updateHighScore(scoreRef.current);
              return;
            }
          }

          // Check self collision (only body segments, ignore tail if it moves)
          const selfCollision = snakeRef.current.some((seg, idx) => {
            return idx !== snakeRef.current.length - 1 && seg.x === head.x && seg.y === head.y;
          });

          if (selfCollision) {
            sounds.playGameOver();
            setIsGameOver(true);
            isGameOverRef.current = true;
            gameRunningRef.current = false;
            updateHighScore(scoreRef.current);
            return;
          }

          // Move snake
          const newSnake = [head, ...snakeRef.current];

          // Check food eating
          const food = foodRef.current;
          if (head.x === food.x && head.y === food.y) {
            let pts = 10;
            let pColor = '#3fb950';

            if (food.type === 'bonus') {
              pts = 50;
              pColor = '#d29922';
              sounds.playBonus();
            } else if (food.type === 'coffee') {
              pts = 25;
              pColor = '#a371f7';
              sounds.playBonus();
            } else {
              sounds.playEat();
            }

            addParticles(food.x, food.y, pColor, 16);
            const newScore = scoreRef.current + pts;
            scoreRef.current = newScore;
            setScore(newScore);

            spawnFood(newSnake);
          } else {
            newSnake.pop(); // Remove tail
          }

          snakeRef.current = newSnake;
        }
      } else {
        // While paused or game over, keep lastStepTime updated so resumption doesn't trigger a burst
        lastStepTime = time;
      }

      // DRAWING ROUTINE
      const isIll = isIllustrativeRef.current;

      // 1. Clear background
      ctx.fillStyle = isIll ? '#f7f2e7' : '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Subtle grid lines
      ctx.strokeStyle = isIll ? 'rgba(216, 203, 187, 0.6)' : 'rgba(48, 54, 61, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
        ctx.stroke();
      }

      // 3. Draw Food Item
      const f = foodRef.current;
      const fx = f.x * CELL_SIZE;
      const fy = f.y * CELL_SIZE;

      if (f.type === 'bonus') {
        // Golden Coin
        ctx.save();
        ctx.shadowColor = isIll ? '#d4a373' : '#d29922';
        ctx.shadowBlur = isIll ? 8 : 12;
        ctx.fillStyle = isIll ? '#f0b865' : '#e3b341';
        ctx.beginPath();
        ctx.arc(fx + CELL_SIZE / 2, fy + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isIll ? '#6b4226' : '#7d4e00';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', fx + CELL_SIZE / 2, fy + CELL_SIZE / 2 + 1);
        ctx.restore();
      } else if (f.type === 'coffee') {
        // Chill Tea/Coffee Cup
        ctx.save();
        ctx.shadowColor = isIll ? 'rgba(163, 113, 247, 0.4)' : '#a371f7';
        ctx.shadowBlur = isIll ? 6 : 10;
        ctx.fillStyle = isIll ? '#8c5e3c' : '#bc8cff';
        ctx.beginPath();
        ctx.roundRect(fx + 3, fy + 4, CELL_SIZE - 6, CELL_SIZE - 7, 3);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☕', fx + CELL_SIZE / 2, fy + CELL_SIZE / 2);
        ctx.restore();
      } else {
        // Classic Green Apple
        ctx.save();
        ctx.shadowColor = isIll ? 'rgba(45, 106, 79, 0.4)' : '#2ea043';
        ctx.shadowBlur = isIll ? 6 : 8;
        ctx.fillStyle = isIll ? '#2d6a4f' : '#3fb950';
        ctx.beginPath();
        ctx.arc(fx + CELL_SIZE / 2, fy + CELL_SIZE / 2, CELL_SIZE / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        // Little leaf
        ctx.fillStyle = isIll ? '#52b788' : '#56d364';
        ctx.fillRect(fx + CELL_SIZE / 2 - 1, fy + 2, 2, 3);
        ctx.restore();
      }

      // 4. Draw Snake
      const snake = snakeRef.current;
      snake.forEach((seg, idx) => {
        const sx = seg.x * CELL_SIZE;
        const sy = seg.y * CELL_SIZE;
        const isHead = idx === 0;

        ctx.save();
        if (isHead) {
          // Glowing Head
          ctx.shadowColor = isIll ? 'rgba(45, 106, 79, 0.4)' : '#3fb950';
          ctx.shadowBlur = isIll ? 6 : 10;
          ctx.fillStyle = isIll ? '#2d6a4f' : '#3fb950';
          ctx.beginPath();
          ctx.roundRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5);
          ctx.fill();

          // Eyes
          ctx.fillStyle = isIll ? '#f7f2e7' : '#0d1117';
          const dir = dirRef.current;
          let eye1 = { x: sx + 4, y: sy + 4 };
          let eye2 = { x: sx + CELL_SIZE - 6, y: sy + 4 };

          if (dir === 'DOWN') {
            eye1 = { x: sx + 4, y: sy + CELL_SIZE - 6 };
            eye2 = { x: sx + CELL_SIZE - 6, y: sy + CELL_SIZE - 6 };
          } else if (dir === 'LEFT') {
            eye1 = { x: sx + 4, y: sy + 4 };
            eye2 = { x: sx + 4, y: sy + CELL_SIZE - 6 };
          } else if (dir === 'RIGHT') {
            eye1 = { x: sx + CELL_SIZE - 6, y: sy + 4 };
            eye2 = { x: sx + CELL_SIZE - 6, y: sy + CELL_SIZE - 6 };
          }

          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, 2, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Body segment with smooth gradient opacity towards tail
          const progress = 1 - (idx / snake.length) * 0.45;
          ctx.fillStyle = isIll
            ? `rgba(45, 106, 79, ${progress})`
            : `rgba(46, 160, 67, ${progress})`;
          ctx.beginPath();
          ctx.roundRect(sx + 2, sy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Draw & Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        if (!isPausedRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1 / p.maxLife;
        }

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, restartGame, spawnFood, updateHighScore]);

  if (!isOpen) return null;

  const handleDpadClick = (dir: Direction) => {
    if (isPausedRef.current) {
      setIsPaused(false);
      isPausedRef.current = false;
    }
    const current = dirRef.current;
    if (dir === 'UP' && current !== 'DOWN') nextDirRef.current = 'UP';
    if (dir === 'DOWN' && current !== 'UP') nextDirRef.current = 'DOWN';
    if (dir === 'LEFT' && current !== 'RIGHT') nextDirRef.current = 'LEFT';
    if (dir === 'RIGHT' && current !== 'LEFT') nextDirRef.current = 'RIGHT';
    sounds.playMove();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`fixed inset-0 backdrop-blur-md transition-colors ${
          isIllustrative ? 'bg-slate-900/40' : 'bg-black/80'
        }`}
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] z-10 border transition-all ${
          isIllustrative
            ? 'bg-white border-[#ede4d4] text-[#212d27]'
            : 'bg-[#161b22] border-[#30363d] text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between transition-colors ${
            isIllustrative ? 'border-[#ede4d4] bg-[#fbf7ee]' : 'border-[#30363d] bg-[#0d1117]/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                isIllustrative
                  ? 'bg-[#d8f3dc] border-[#b7e4c7] text-[#2d6a4f]'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-[#3fb950]'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center gap-2 font-sans ${isIllustrative ? 'text-[#212d27]' : 'text-slate-100'}`}>
                Classic Snake
                <span
                  className={`text-[11px] font-normal px-2 py-0.5 rounded-full border font-sans ${
                    isIllustrative
                      ? 'bg-[#d8f3dc] text-[#2d6a4f] border-[#b7e4c7]'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  Relaxation Room
                </span>
              </h2>
              <p className={`text-xs font-sans ${isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}`}>
                Take a breath & recharge your brain
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Top Pause / Resume Button */}
            {!isGameOver && (
              <button
                onClick={togglePause}
                className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium border font-sans ${
                  isIllustrative
                    ? 'bg-white hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-slate-200 hover:text-emerald-400 border-[#30363d]'
                }`}
                title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
              >
                {isPaused ? (
                  <>
                    <Play className={`w-3.5 h-3.5 ${isIllustrative ? 'fill-[#2d6a4f] text-[#2d6a4f]' : 'fill-emerald-400 text-emerald-400'}`} />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#b07d3b]' : 'text-amber-400'}`} />
                    <span>Pause</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors border ${
                isIllustrative
                  ? 'bg-white hover:bg-[#ede4d4] text-[#212d27] border-[#ede4d4]'
                  : 'bg-[#21262d] hover:bg-[#30363d] text-slate-300 border-[#30363d]'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className={`w-4 h-4 ${isIllustrative ? 'text-[#8d9a93]' : 'text-slate-500'}`} />
              ) : (
                <Volume2 className={`w-4 h-4 ${isIllustrative ? 'text-[#2d6a4f]' : 'text-emerald-400'}`} />
              )}
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isIllustrative
                  ? 'text-[#8d9a93] hover:text-[#212d27] hover:bg-[#ede4d4]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#21262d]'
              }`}
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Controls & Score Bar */}
        <div
          className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
            isIllustrative ? 'bg-[#f4efe6] border-[#ede4d4]' : 'bg-[#0d1117] border-[#30363d]'
          }`}
        >
          {/* Mode Selector */}
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isIllustrative ? 'bg-white border-[#ede4d4]' : 'bg-[#161b22] border-[#30363d]'
            }`}
          >
            <button
              onClick={() => {
                setMode('chill');
                restartGame();
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs font-sans ${
                mode === 'chill'
                  ? isIllustrative
                    ? 'bg-[#2d6a4f] text-white shadow-sm font-bold'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧘 Chill (Wrap Walls)
            </button>
            <button
              onClick={() => {
                setMode('classic');
                restartGame();
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs font-sans ${
                mode === 'classic'
                  ? isIllustrative
                    ? 'bg-[#2d6a4f] text-white shadow-sm font-bold'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🕹️ Classic
            </button>
            <button
              onClick={() => {
                setMode('speedrun');
                restartGame();
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs font-sans ${
                mode === 'speedrun'
                  ? isIllustrative
                    ? 'bg-[#2d6a4f] text-white shadow-sm font-bold'
                    : 'bg-emerald-600 text-white shadow-sm'
                  : isIllustrative
                  ? 'text-[#5c6b63] hover:text-[#212d27]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Speed
            </button>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono">
              <span className={isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}>Score:</span>
              <span className={`font-bold text-sm ${isIllustrative ? 'text-[#2d6a4f]' : 'text-emerald-400'}`}>
                {score}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Trophy className={`w-3.5 h-3.5 ${isIllustrative ? 'text-[#b07d3b]' : 'text-[#d29922]'}`} />
              <span className={isIllustrative ? 'text-[#5c6b63]' : 'text-slate-400'}>Best:</span>
              <span className={`font-bold text-sm ${isIllustrative ? 'text-[#b07d3b]' : 'text-[#d29922]'}`}>
                {highScore}
              </span>
            </div>
          </div>
        </div>

        {/* Game Canvas Area */}
        <div
          className={`p-4 sm:p-5 flex flex-col items-center justify-center overflow-y-auto transition-colors ${
            isIllustrative ? 'bg-[#fbf7ee]/60' : 'bg-[#0d1117]/60'
          }`}
        >
          <div
            className={`relative rounded-2xl overflow-hidden border-2 shadow-inner transition-colors ${
              isIllustrative ? 'border-[#ede4d4] bg-[#f7f2e7]' : 'border-[#30363d] bg-[#0d1117]'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="block cursor-none"
            />

            {/* Pause Overlay */}
            {isPaused && !isGameOver && (
              <div
                className={`absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in ${
                  isIllustrative ? 'bg-slate-900/60' : 'bg-black/75'
                }`}
              >
                <Pause className={`w-12 h-12 animate-pulse ${isIllustrative ? 'text-[#80ed99]' : 'text-emerald-400'}`} />
                <div className="text-lg font-bold text-white font-sans">Game Paused</div>
                <button
                  onClick={togglePause}
                  className={`px-4 py-2 rounded-xl text-white font-medium text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95 ${
                    isIllustrative ? 'bg-[#2d6a4f] hover:bg-[#1b4332]' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Resume (Space)
                </button>
              </div>
            )}

            {/* Game Over Overlay */}
            {isGameOver && (
              <div
                className={`absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 ${
                  isIllustrative ? 'bg-slate-900/75' : 'bg-black/85'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-300 mb-2">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1 font-sans">Game Over</h3>
                
                {isNewHigh ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-bold my-1 animate-bounce">
                    <Trophy className="w-3.5 h-3.5" /> NEW HIGH SCORE! {score} pts
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 mb-1 font-sans">
                    Final Score: <span className={`font-bold font-mono ${isIllustrative ? 'text-[#80ed99]' : 'text-emerald-400'}`}>{score}</span>
                  </p>
                )}

                {/* Zen quote */}
                <p
                  className={`text-xs italic max-w-xs my-3 p-2.5 rounded-xl border ${
                    isIllustrative
                      ? 'bg-[#1c2024]/90 text-slate-300 border-[#3d4a3e]'
                      : 'bg-[#161b22] text-slate-400 border-[#30363d]'
                  }`}
                >
                  {RELAX_QUOTES[quoteIndex]}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={restartGame}
                    className={`px-4 py-2 rounded-xl text-white font-medium text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer ${
                      isIllustrative ? 'bg-[#2d6a4f] hover:bg-[#1b4332]' : 'bg-emerald-600 hover:bg-emerald-500'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Play Again (R)
                  </button>
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                      isIllustrative
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-[#21262d] hover:bg-[#30363d] text-slate-300'
                    }`}
                  >
                    Back to Room
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* D-Pad for Touch / Quick Clicks */}
          <div className="mt-4 flex flex-col items-center sm:hidden">
            <button
              onClick={() => handleDpadClick('UP')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow border transition-colors ${
                isIllustrative
                  ? 'bg-white active:bg-[#2d6a4f] active:text-white border-[#ede4d4] text-[#212d27]'
                  : 'bg-[#21262d] active:bg-emerald-600 border-[#30363d] text-slate-200'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-5 my-1">
              <button
                onClick={() => handleDpadClick('LEFT')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shadow border transition-colors ${
                  isIllustrative
                    ? 'bg-white active:bg-[#2d6a4f] active:text-white border-[#ede4d4] text-[#212d27]'
                    : 'bg-[#21262d] active:bg-emerald-600 border-[#30363d] text-slate-200'
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={togglePause}
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${
                  isIllustrative
                    ? 'bg-white border-[#ede4d4] text-[#212d27]'
                    : 'bg-[#161b22] active:bg-slate-700 border-[#30363d] text-slate-300'
                }`}
              >
                {isPaused ? (
                  <Play className={`w-4 h-4 ${isIllustrative ? 'fill-[#2d6a4f] text-[#2d6a4f]' : 'fill-emerald-400 text-emerald-400'}`} />
                ) : (
                  <Pause className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDpadClick('RIGHT')}
                className={`w-11 h-11 rounded-xl flex items-center justify-center shadow border transition-colors ${
                  isIllustrative
                    ? 'bg-white active:bg-[#2d6a4f] active:text-white border-[#ede4d4] text-[#212d27]'
                    : 'bg-[#21262d] active:bg-emerald-600 border-[#30363d] text-slate-200'
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={() => handleDpadClick('DOWN')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center shadow border transition-colors ${
                isIllustrative
                  ? 'bg-white active:bg-[#2d6a4f] active:text-white border-[#ede4d4] text-[#212d27]'
                  : 'bg-[#21262d] active:bg-emerald-600 border-[#30363d] text-slate-200'
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Footer / Helper notes */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs transition-colors ${
            isIllustrative
              ? 'bg-[#fbf7ee] border-[#ede4d4] text-[#5c6b63]'
              : 'bg-[#161b22] border-[#30363d] text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2 font-sans">
            <span className={`inline-block w-2 h-2 rounded-full ${isIllustrative ? 'bg-[#2d6a4f]' : 'bg-emerald-400'}`} />
            <span>Space / P to Pause • Arrows or WASD to Move</span>
          </div>

          <button
            onClick={restartGame}
            className={`text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer ${
              isIllustrative
                ? 'text-[#5c6b63] hover:text-[#2d6a4f]'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <RotateCcw className="w-3 h-3" /> Restart (R)
          </button>
        </div>
      </div>
    </div>
  );
};
