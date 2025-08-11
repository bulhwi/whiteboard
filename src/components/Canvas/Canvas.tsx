import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useWhiteboardContext } from '../../context/WhiteboardContext';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { usePresence } from '../../hooks/usePresence';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import type { DrawPoint, DrawStroke } from '../../types/whiteboard';

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

// Memoized cursor component for performance
const UserCursor = React.memo<{
  user: { id: string; nickname: string; color: string; cursor?: { x: number; y: number } };
}>(({ user }) => {
  if (!user.cursor) return null;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${(user.cursor.x / CANVAS_WIDTH) * 100}%`,
        top: `${(user.cursor.y / CANVAS_HEIGHT) * 100}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
        style={{ backgroundColor: user.color }}
      />
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {user.nickname}
      </div>
    </div>
  );
});

UserCursor.displayName = 'UserCursor';

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawPoint[]>([]);
  const lastDrawTime = useRef(0);
  
  const { tool, penColor, penThickness, whiteboardState, setWhiteboardState } = useWhiteboardContext();
  const { broadcastStroke } = useRealtimeSync();
  const { users, currentUser, updateCursor, isBlocked } = usePresence();
  const { measureRenderStart, measureRenderEnd, trackCanvasOperation } = usePerformanceMonitor();

  // Memoize filtered users to prevent unnecessary re-renders
  const otherUsers = useMemo(() => 
    users.filter(user => user.id !== currentUser?.id && user.cursor),
    [users, currentUser?.id]
  );

  const getCanvasPoint = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): DrawPoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      const mouseEvent = event as React.MouseEvent<HTMLCanvasElement>;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawStroke) => {
    if (stroke.points.length < 2) return;

    // Batch canvas state changes to minimize redraws
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    measureRenderStart();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Use ImageData for faster clearing on large canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Batch strokes by color and thickness for better performance
    const strokeGroups = new Map<string, DrawStroke[]>();
    
    whiteboardState.strokes.forEach(stroke => {
      const key = `${stroke.color}-${stroke.thickness}`;
      if (!strokeGroups.has(key)) {
        strokeGroups.set(key, []);
      }
      strokeGroups.get(key)!.push(stroke);
    });
    
    // Draw grouped strokes with minimal context switches
    strokeGroups.forEach((strokes, key) => {
      const [color, thickness] = key.split('-');
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = parseInt(thickness);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
      
      ctx.restore();
    });

    // Draw current stroke if exists
    if (currentStroke.length > 1) {
      const tempStroke: DrawStroke = {
        id: 'temp',
        points: currentStroke,
        color: penColor,
        thickness: penThickness,
        timestamp: Date.now(),
      };
      drawStroke(ctx, tempStroke);
    }
    
    trackCanvasOperation();
    measureRenderEnd();
  }, [whiteboardState.strokes, currentStroke, penColor, penThickness, drawStroke, measureRenderStart, measureRenderEnd, trackCanvasOperation]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen' || isBlocked) return;
    
    event.preventDefault();
    setIsDrawing(true);
    const point = getCanvasPoint(event);
    setCurrentStroke([point]);
  };

  // Throttled mouse move to improve performance
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    
    // Throttle cursor updates to 60fps (16ms)
    const now = Date.now();
    if (now - lastDrawTime.current < 16) return;
    lastDrawTime.current = now;
    
    updateCursor(point.x, point.y);
    
    if (!isDrawing || tool !== 'pen') return;
    
    event.preventDefault();
    setCurrentStroke(prev => [...prev, point]);
  }, [getCanvasPoint, updateCursor, isDrawing, tool]);

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
    
    event.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: DrawStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: currentStroke,
        color: penColor,
        thickness: penThickness,
        timestamp: Date.now(),
      };

      setWhiteboardState(prev => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
      
      broadcastStroke(newStroke);
    }

    setCurrentStroke([]);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isBlocked) return;
    
    event.preventDefault();
    const point = getCanvasPoint(event);
    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
    
    event.preventDefault();
    const point = getCanvasPoint(event);
    setCurrentStroke(prev => [...prev, point]);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
    
    event.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: DrawStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: currentStroke,
        color: penColor,
        thickness: penThickness,
        timestamp: Date.now(),
      };

      setWhiteboardState(prev => ({
        ...prev,
        strokes: [...prev.strokes, newStroke],
      }));
      
      broadcastStroke(newStroke);
    }

    setCurrentStroke([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border-2 border-gray-300 rounded-lg shadow-lg relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="cursor-crosshair w-full h-auto block touch-none"
        style={{ maxHeight: '70vh' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Other users' cursors - optimized with memoization */}
      {otherUsers.map(user => (
        <UserCursor key={user.id} user={user} />
      ))}
    </div>
  );
};

export default Canvas;