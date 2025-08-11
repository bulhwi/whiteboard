import React, { useCallback } from 'react';
import { useWhiteboardContext } from '../../context/WhiteboardContext';
import Button from '../Shared/Button';
import ColorButton from '../Shared/ColorButton';
import type { Tool, PenColor, PenThickness } from '../../types/whiteboard';

const DrawingTools: React.FC = React.memo(() => {
  const { tool, setTool, penColor, setPenColor, penThickness, setPenThickness } = useWhiteboardContext();

  const handleToolChange = useCallback((newTool: Tool) => {
    setTool(newTool);
  }, [setTool]);

  const handleColorChange = useCallback((color: PenColor) => {
    setPenColor(color);
  }, [setPenColor]);

  const handleThicknessChange = useCallback((thickness: PenThickness) => {
    setPenThickness(thickness);
  }, [setPenThickness]);

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 bg-white border border-gray-300 rounded-lg shadow-md">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-gray-700">도구</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleToolChange('pen')}
            variant="primary"
            size="sm"
            active={tool === 'pen'}
          >
            🖊️ 펜
          </Button>
          <Button
            onClick={() => handleToolChange('text')}
            variant="primary"
            size="sm"
            active={tool === 'text'}
          >
            📝 텍스트
          </Button>
          <Button
            onClick={() => handleToolChange('eraser')}
            variant="primary"
            size="sm"
            active={tool === 'eraser'}
          >
            🧹 지우개
          </Button>
        </div>
      </div>

      {tool === 'pen' && (
        <>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">색상</h3>
            <div className="flex flex-wrap gap-2">
              <ColorButton
                color="#000000"
                selected={penColor === 'black'}
                onClick={() => handleColorChange('black')}
                title="검은색"
                size="md"
              />
              <ColorButton
                color="#ef4444"
                selected={penColor === 'red'}
                onClick={() => handleColorChange('red')}
                title="빨간색"
                size="md"
              />
              <ColorButton
                color="#3b82f6"
                selected={penColor === 'blue'}
                onClick={() => handleColorChange('blue')}
                title="파란색"
                size="md"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">굵기</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleThicknessChange(2)}
                variant="secondary"
                size="sm"
                active={penThickness === 2}
              >
                ✏️ 얇게
              </Button>
              <Button
                onClick={() => handleThicknessChange(5)}
                variant="secondary"
                size="sm"
                active={penThickness === 5}
              >
                🖍️ 굵게
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

DrawingTools.displayName = 'DrawingTools';

export default DrawingTools;