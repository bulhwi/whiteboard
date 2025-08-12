import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { crossTabSync } from '../utils/crossTabSync';
import { useWhiteboardContext } from '../context/WhiteboardContext';
import { throttle } from '../utils/throttle';
import type { DrawStroke } from '../types/whiteboard';

interface StrokeBroadcastPayload {
  type: 'stroke';
  stroke: DrawStroke;
  userId: string;
}

interface ClearBroadcastPayload {
  type: 'clear';
  userId: string;
}

export const useRealtimeSync = () => {
  const { setWhiteboardState, clearCanvas } = useWhiteboardContext();
  const [usesFallback, setUsesFallback] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackCleanupRef = useRef<(() => void) | null>(null);
  const userIdRef = useRef<string>(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const activateCrossTabSync = () => {
      if (usesFallback) return;
      
      console.log('🔄 Activating cross-tab sync for drawing');
      setUsesFallback(true);
      
      fallbackCleanupRef.current = crossTabSync.subscribe((data) => {
        console.log('🎨 Cross-tab strokes update:', data.strokes.length);
        // Apply strokes from other users
        if (data.strokes) {
          setWhiteboardState(prev => ({
            ...prev,
            strokes: data.strokes,
          }));
        }
      });
    };

    let channel: RealtimeChannel;

    try {
      channel = supabase.channel('whiteboard-room', {
        config: {
          broadcast: { self: false },
        },
      });

      channelRef.current = channel;

      channel.on('broadcast', { event: 'stroke' }, (payload) => {
        const data = payload.payload as StrokeBroadcastPayload;
        if (data.userId !== userIdRef.current) {
          setWhiteboardState(prev => ({
            ...prev,
            strokes: [...prev.strokes, data.stroke],
          }));
        }
      });

      channel.on('broadcast', { event: 'clear' }, (payload) => {
        const data = payload.payload as ClearBroadcastPayload;
        if (data.userId !== userIdRef.current) {
          clearCanvas();
        }
      });

      channel.subscribe((status) => {
        console.log('🎨 Drawing sync status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Drawing sync connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('⚠️ Drawing sync failed, switching to cross-tab sync');
          activateCrossTabSync();
        }
      });

    } catch (error) {
      console.error('Failed to connect to realtime sync:', error);
      activateCrossTabSync();
    }

    // Auto-activate cross-tab sync after 3 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!usesFallback) {
        console.log('⏰ Auto-activating cross-tab sync for drawing due to timeout');
        activateCrossTabSync();
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      
      if (channel) {
        channel.unsubscribe();
      }
      
      if (fallbackCleanupRef.current) {
        fallbackCleanupRef.current();
      }
    };
  }, [setWhiteboardState, clearCanvas, usesFallback]);

  const broadcastStroke = useCallback((stroke: DrawStroke) => {
    if (usesFallback) {
      // Use cross-tab sync mode
      crossTabSync.addStroke(stroke);
    } else if (channelRef.current) {
      // Use Realtime
      const payload: StrokeBroadcastPayload = {
        type: 'stroke',
        stroke,
        userId: userIdRef.current,
      };
      
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'stroke',
          payload,
        });
      } catch (error) {
        console.error('Failed to broadcast stroke:', error);
      }
    }
  }, [usesFallback]);

  // Throttled version for high-frequency updates
  const throttledBroadcastStroke = useMemo(
    () => throttle(broadcastStroke, 50), // Limit to 20 broadcasts per second
    [broadcastStroke]
  );

  const broadcastClear = useCallback(() => {
    if (usesFallback) {
      // Clear cross-tab sync data
      crossTabSync.clearStrokes();
    } else if (channelRef.current) {
      // Use Realtime
      const payload: ClearBroadcastPayload = {
        type: 'clear',
        userId: userIdRef.current,
      };
      
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'clear',
          payload,
        });
      } catch (error) {
        console.error('Failed to broadcast clear:', error);
      }
    }
  }, [usesFallback]);

  return {
    broadcastStroke,
    throttledBroadcastStroke,
    broadcastClear,
    userId: userIdRef.current,
  };
};