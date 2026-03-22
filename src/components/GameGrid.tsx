import React, { useRef, useEffect, useState } from 'react';
import { Cell, GRID_SIZE, COLORS, GrowthStage, PlantType } from '../types';

interface GameGridProps {
  grid: Cell[][];
  lastAction?: { target?: [number, number]; type: string };
  water?: { A: number; B: number };
}

const GameGrid: React.FC<GameGridProps> = ({ grid, lastAction, water }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shake, setShake] = useState(false);

  const isDrought = water && water.A < 10 && water.B < 10;

  useEffect(() => {
    if (lastAction?.type === 'sabotage_steal') {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    const drawCell = (x: number, y: number, cell: Cell) => {
      const cx = x * cellSize;
      const cy = y * cellSize;

      // Draw background
      ctx.fillStyle = COLORS.empty;
      ctx.fillRect(cx, cy, cellSize, cellSize);
      ctx.strokeStyle = COLORS.grid;
      ctx.strokeRect(cx, cy, cellSize, cellSize);

      if (cell.type === 'empty') return;

      const centerX = cx + cellSize / 2;
      const centerY = cy + cellSize / 2;
      const scale = cell.stage === 'seed' ? 0.3 : cell.stage === 'sprout' ? 0.5 : cell.stage === 'mature' ? 0.8 : 1.0;
      const baseSize = cellSize * 0.4;

      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Pulse animation if it was just watered
      if (lastAction?.type === 'water' && lastAction.target?.[0] === x && lastAction.target?.[1] === y) {
        const pulse = 1.2;
        ctx.scale(scale * pulse, scale * pulse);
      } else {
        ctx.scale(scale, scale);
      }

      // Draw owner indicator
      if (cell.owner) {
        ctx.beginPath();
        ctx.arc(0, 0, baseSize * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = cell.owner === 'A' ? `${COLORS.A}22` : `${COLORS.B}22`;
        ctx.fill();
      }

      switch (cell.type) {
        case 'flower':
          drawFlower(ctx, baseSize, cell.stage);
          break;
        case 'vine':
          drawVine(ctx, baseSize, cell.stage);
          break;
        case 'tree':
          drawTree(ctx, baseSize, cell.stage);
          break;
        case 'weed':
          drawWeed(ctx, baseSize);
          break;
      }

      ctx.restore();
    };

    const drawFlower = (ctx: CanvasRenderingContext2D, size: number, stage: GrowthStage) => {
      if (stage === 'seed') {
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (stage === 'sprout') {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(-size * 0.1, 0, size * 0.2, size);
      } else {
        // Stem
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(-size * 0.1, -size * 0.5, size * 0.2, size);
        
        if (stage === 'bloom') {
          // Petals
          ctx.fillStyle = COLORS.flower;
          for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.ellipse(size * 0.6, 0, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          // Center
          ctx.fillStyle = '#FFEB3B';
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Mature leaves
          ctx.fillStyle = '#388E3C';
          ctx.beginPath();
          ctx.ellipse(-size * 0.4, 0, size * 0.4, size * 0.2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(size * 0.4, 0, size * 0.4, size * 0.2, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawVine = (ctx: CanvasRenderingContext2D, size: number, stage: GrowthStage) => {
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(-size, size);
      ctx.bezierCurveTo(-size, -size, size, size, size, -size);
      ctx.stroke();

      if (stage === 'bloom') {
        ctx.fillStyle = COLORS.vine;
        ctx.beginPath();
        ctx.arc(size * 0.5, -size * 0.5, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawTree = (ctx: CanvasRenderingContext2D, size: number, stage: GrowthStage) => {
      // Trunk
      ctx.fillStyle = COLORS.tree;
      ctx.fillRect(-size * 0.2, -size * 0.2, size * 0.4, size * 1.2);

      if (stage === 'mature' || stage === 'bloom') {
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(0, -size * 0.5, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        if (stage === 'bloom') {
          // Canopy details or fruit
          ctx.fillStyle = '#FF5722';
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * size * 0.5, -size * 0.5 + Math.sin(angle) * size * 0.5, size * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (stage === 'sprout') {
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, -size * 0.2, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawWeed = (ctx: CanvasRenderingContext2D, size: number) => {
      const time = Date.now() / 200;
      const wiggle = Math.sin(time) * 0.1;
      ctx.rotate(wiggle);

      ctx.fillStyle = COLORS.weed;
      for (let i = 0; i < 3; i++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.8, -size * 0.2);
        ctx.lineTo(size * 0.8, size * 0.2);
        ctx.closePath();
        ctx.fill();
      }
    };

    // Clear and draw all
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        drawCell(x, y, grid[y][x]);
      }
    }

    // Draw water droplet effect if watered
    if (lastAction?.type === 'water' && lastAction.target) {
      const [tx, ty] = lastAction.target;
      const dropX = tx * cellSize + cellSize / 2;
      const dropY = ty * cellSize + cellSize / 2;
      
      ctx.fillStyle = COLORS.water;
      ctx.beginPath();
      ctx.arc(dropX, dropY - 20, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Drought Effect
    if (isDrought) {
      // Subtle dimming
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fog effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(100, 100, 100, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

  }, [grid, lastAction, isDrought]);

  return (
    <div className={`relative transition-transform duration-100 ${shake ? 'animate-shake' : ''}`}>
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border-4 border-stone-800 rounded-lg shadow-2xl bg-stone-100"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
};

export default GameGrid;
