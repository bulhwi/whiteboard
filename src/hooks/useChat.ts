import { useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { simpleSync } from '../utils/simpleSync';
import { usePresence } from './usePresence';
import type { ChatMessage } from '../types/whiteboard';

interface MessageBroadcastPayload {
  type: 'message';
  message: ChatMessage;
  userId: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [usesFallback, setUsesFallback] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const fallbackCleanupRef = useRef<(() => void) | null>(null);
  const { currentUser } = usePresence();

  useEffect(() => {
    console.log('🚀 Starting Supabase chat connection...');
    console.log('💬 Current user for chat:', currentUser);
    console.log('🔍 Environment mode:', import.meta.env.MODE);

    const channel = supabase.channel('chat-room', {
      config: {
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    channel.on('broadcast', { event: 'message' }, (payload) => {
      const data = payload.payload as MessageBroadcastPayload;
      if (data.userId !== currentUser?.id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    channel.subscribe((status) => {
      console.log('💬 Chat channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Chat connected successfully');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.log('⚠️ Chat failed, switching to simple sync mode');
        activateSimpleSync();
      }
    });

    const activateSimpleSync = () => {
      if (usesFallback) return;
      
      console.log('🔄 Activating simple sync for chat');
      setUsesFallback(true);
      
      fallbackCleanupRef.current = simpleSync.subscribe((data) => {
        console.log('💬 Received messages update:', data.messages.length);
        setMessages(data.messages || []);
      });
    };

    // Auto-activate simple sync after 3 seconds if no successful connection
    const fallbackTimeout = setTimeout(() => {
      if (!usesFallback) {
        console.log('⏰ Auto-activating simple sync for chat due to timeout');
        activateSimpleSync();
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      channel.unsubscribe();
      
      if (fallbackCleanupRef.current) {
        fallbackCleanupRef.current();
      }
    };
  }, [currentUser?.id, usesFallback]);

  const sendMessage = (content: string) => {
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      userName: currentUser.nickname,
      userColor: currentUser.color,
      content: content.trim(),
      timestamp: Date.now(),
    };

    if (usesFallback) {
      // Use simple sync mode
      simpleSync.addMessage(newMessage);
      console.log('📤 Message sent via simple sync:', newMessage.content);
    } else {
      // Add message locally first for immediate feedback (Realtime mode)
      setMessages(prev => [...prev, newMessage]);
      
      if (channelRef.current) {
        // Use Realtime
        const payload: MessageBroadcastPayload = {
          type: 'message',
          message: newMessage,
          userId: currentUser.id,
        };

        channelRef.current.send({
          type: 'broadcast',
          event: 'message',
          payload,
        });
        console.log('📤 Message sent via Supabase:', newMessage.content);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearMessages,
  };
};