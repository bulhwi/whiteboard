import { useEffect } from 'react';
import { useWhiteboardContext } from '../context/WhiteboardContext';
import { useRealtimeSync } from './useRealtimeSync';

export const useKeyboard = () => {
  const { clearCanvas } = useWhiteboardContext();
  const { broadcastClear } = useRealtimeSync();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 'R' 키로 캔버스 리셋
      if ((event.key === 'r' || event.key === 'R') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // input이나 textarea에 포커스된 상태에서는 동작하지 않음
        const activeElement = document.activeElement;
        if (activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
        )) {
          return;
        }

        event.preventDefault();
        clearCanvas();
        broadcastClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearCanvas, broadcastClear]);
};