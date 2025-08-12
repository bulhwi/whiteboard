import { useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { usePresence } from './usePresence';
import type { ChatMessage } from '../types/whiteboard';

interface MessageBroadcastPayload {
  type: 'message';
  message: ChatMessage;
  userId: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
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
      console.log('Chat connection status:', status);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser?.id]);

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

    // Add message locally first for immediate feedback
    setMessages(prev => [...prev, newMessage]);

    // Broadcast to other users via Supabase
    const payload: MessageBroadcastPayload = {
      type: 'message',
      message: newMessage,
      userId: currentUser.id,
    };

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload,
      });
      console.log('📤 Message sent via Supabase:', newMessage.content);
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