import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Point = { x: number; y: number };
type Direction = 'up' | 'down' | 'left' | 'right';
type GameState = 'idle' | 'running' | 'paused' | 'gameover';

const GRID_SIZE = 22;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 11 },
  { x: 9, y: 11 },
  { x: 8, y: 11 },
];
const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function pointKey(p: Point) {
  return `${p.x},${p.y}`;
}

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map(pointKey));
  const available: Point[] = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const point = { x, y };
      if (!occupied.has(pointKey(point))) available.push(point);
    }
  }
  return available[Math.floor(Math.random() * available.length)] ?? { x: 0, y: 0 };
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(() => randomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    try {
      return Number(window.localStorage?.getItem('snake-best') || 0);
    } catch {
      return 0;
    }
  });

  const speed = useMemo(() => Math.max(70, 150 - Math.floor(score / 5) * 10), [score]);

  const changeDirection = useCallback((dir: Direction) => {
    setNextDirection((current) => (OPPOSITE[dir] === current ? current : dir));
    setGameState((state) => (state === 'idle' ? 'running' : state));
  }, []);

  const restart = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection('right');
    setNextDirection('right');
    setScore(0);
    setGameState('running');
  }, []);

  const togglePause = useCallback(() => {
    setGameState((state) => {
      if (state === 'running') return 'paused';
      if (state === 'paused' || state === 'idle') return 'running';
      return state;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Record<string, Direction | 'pause' | 'restart'> = {
        ArrowUp: 'up',
        w: 'up',
        W: 'up',
        ArrowDown: 'down',
        s: 'down',
        S: 'down',
        ArrowLeft: 'left',
        a: 'left',
        A: 'left',
        ArrowRight: 'right',
        d: 'right',
        D: 'right',
        ' ': 'pause',
        Enter: 'restart',
      };
      const action = keyMap[event.key];
      if (!action) return;
      event.preventDefault();
      if (action === 'pause') togglePause();
      else if (action === 'restart') restart();
      else changeDirection(action);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [changeDirection, restart, togglePause]);

  useEffect(() => {
    if (gameState !== 'running') return;
    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const actualDirection = OPPOSITE[nextDirection] === direction ? direction : nextDirection;
        setDirection(actualDirection);
        const vector = DIRECTIONS[actualDirection];
        const head = currentSnake[0];
        const newHead = { x: head.x + vector.x, y: head.y + vector.y };
        const ateFood = newHead.x === food.x && newHead.y === food.y;
        const nextSnake = ateFood ? [newHead, ...currentSnake] : [newHead, ...currentSnake.slice(0, -1)];
        const hitWall = newHead.x < 0 || newHead.y < 0 || newHead.x >= GRID_SIZE || newHead.y >= GRID_SIZE;
        const bodyToCheck = ateFood ? currentSnake : currentSnake.slice(0, -1);
        const hitSelf = bodyToCheck.some((part) => part.x === newHead.x && part.y === newHead.y);

        if (hitWall || hitSelf) {
          setGameState('gameover');
          setBest((currentBest) => {
            const nextBest = Math.max(currentBest, score);
            try {
              window.localStorage?.setItem('snake-best', String(nextBest));
            } catch {
              // Ignore storage errors in private browsing or restricted WebViews.
            }
            return nextBest;
          });
          return currentSnake;
        }

        if (ateFood) {
          setScore((value) => value + 1);
          setFood(randomFood(nextSnake));
        }
        return nextSnake;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [direction, food, gameState, nextDirection, score, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displaySize = Math.min(window.innerWidth - 32, 560);
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const cell = displaySize / GRID_SIZE;
    ctx.clearRect(0, 0, displaySize, displaySize);

    const gradient = ctx.createLinearGradient(0, 0, displaySize, displaySize);
    gradient.addColorStop(0, '#111633');
    gradient.addColorStop(1, '#050611');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, displaySize, displaySize);

    ctx.strokeStyle = 'rgba(0, 245, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i += 1) {
      const p = i * cell;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, displaySize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(displaySize, p);
      ctx.stroke();
    }

    const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    };

    const drawGlowCell = (point: Point, fill: string, glow: string, radius = 8) => {
      const padding = cell * 0.12;
      const x = point.x * cell + padding;
      const y = point.y * cell + padding;
      const size = cell - padding * 2;
      ctx.shadowBlur = 18;
      ctx.shadowColor = glow;
      ctx.fillStyle = fill;
      ctx.beginPath();
      roundedRect(x, y, size, size, radius);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    snake.forEach((part, index) => {
      drawGlowCell(part, index === 0 ? '#76fff8' : '#39ff88', index === 0 ? '#00f5ff' : '#00ff85', index === 0 ? 10 : 7);
    });
    drawGlowCell(food, '#ff3df2', '#ff3df2', 999);

    if (gameState === 'idle' || gameState === 'paused' || gameState === 'gameover') {
      ctx.fillStyle = 'rgba(3, 4, 16, 0.62)';
      ctx.fillRect(0, 0, displaySize, displaySize);
      ctx.fillStyle = '#f7fbff';
      ctx.textAlign = 'center';
      ctx.font = '700 28px Inter, system-ui, sans-serif';
      ctx.fillText(gameState === 'gameover' ? 'GAME OVER' : gameState === 'paused' ? 'PAUSED' : 'NEON SNAKE', displaySize / 2, displaySize / 2 - 10);
      ctx.font = '500 15px Inter, system-ui, sans-serif';
      ctx.fillText(gameState === 'gameover' ? '按 Enter 或点击重开' : '方向键 / WASD 开始，空格暂停', displaySize / 2, displaySize / 2 + 24);
    }
  }, [food, gameState, snake]);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="title-row">
          <div>
            <p className="eyebrow">Cyber Arcade</p>
            <h1>Neon Snake</h1>
          </div>
          <button className="ghost-button" onClick={restart}>{gameState === 'gameover' ? '再来一局' : '重开'}</button>
        </div>

        <div className="stats">
          <div><span>Score</span><strong>{score}</strong></div>
          <div><span>Best</span><strong>{best}</strong></div>
          <div><span>Status</span><strong>{gameState === 'running' ? '运行中' : gameState === 'paused' ? '暂停' : gameState === 'gameover' ? '结束' : '待开始'}</strong></div>
        </div>

        <canvas ref={canvasRef} aria-label="贪吃蛇游戏画布" />

        <div className="controls">
          <button onClick={() => changeDirection('up')}>↑</button>
          <div>
            <button onClick={() => changeDirection('left')}>←</button>
            <button onClick={togglePause}>{gameState === 'paused' ? '▶' : '⏸'}</button>
            <button onClick={() => changeDirection('right')}>→</button>
          </div>
          <button onClick={() => changeDirection('down')}>↓</button>
        </div>

        <p className="hint">键盘：方向键 / WASD 控制，空格暂停，Enter 重开。手机可用下方按钮。</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
