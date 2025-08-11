import { useEffect, useRef, useCallback, useMemo } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string>(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
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
        console.log('Realtime connection status:', status);
      });

    } catch (error) {
      console.error('Failed to connect to realtime sync:', error);
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [setWhiteboardState, clearCanvas]);

  const broadcastStroke = useCallback((stroke: DrawStroke) => {
    if (!channelRef.current) return;

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
  }, []);

  // Throttled version for high-frequency updates
  const throttledBroadcastStroke = useMemo(
    () => throttle(broadcastStroke, 50), // Limit to 20 broadcasts per second
    [broadcastStroke]
  );

  const broadcastClear = useCallback(() => {
    if (!channelRef.current) return;

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
  }, []);

  return {
    broadcastStroke,
    throttledBroadcastStroke,
    broadcastClear,
    userId: userIdRef.current,
  };
};