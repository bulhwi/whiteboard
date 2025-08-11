import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Tool, PenColor, PenThickness, WhiteboardState } from '../types/whiteboard';

interface WhiteboardContextType {
  tool: Tool;
  setTool: (tool: Tool) => void;
  penColor: PenColor;
  setPenColor: (color: PenColor) => void;
  penThickness: PenThickness;
  setPenThickness: (thickness: PenThickness) => void;
  whiteboardState: WhiteboardState;
  setWhiteboardState: React.Dispatch<React.SetStateAction<WhiteboardState>>;
  clearCanvas: () => void;
}

const WhiteboardContext = createContext<WhiteboardContextType | undefined>(undefined);

const DEFAULT_WHITEBOARD_STATE: WhiteboardState = {
  strokes: [],
  textElements: [],
  users: [],
  messages: [],
};

export const WhiteboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tool, setTool] = useState<Tool>('pen');
  const [penColor, setPenColor] = useState<PenColor>('black');
  const [penThickness, setPenThickness] = useState<PenThickness>(2);
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>(DEFAULT_WHITEBOARD_STATE);

  const clearCanvas = () => {
    setWhiteboardState(prev => ({
      ...prev,
      strokes: [],
      textElements: [],
      // Keep messages and users intact
    }));
  };

  return (
    <WhiteboardContext.Provider
      value={{
        tool,
        setTool,
        penColor,
        setPenColor,
        penThickness,
        setPenThickness,
        whiteboardState,
        setWhiteboardState,
        clearCanvas,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboardContext = (): WhiteboardContextType => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error('useWhiteboardContext must be used within a WhiteboardProvider');
  }
  return context;
};