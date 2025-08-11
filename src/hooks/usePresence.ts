import { useEffect, useState, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import type { User } from '../types/whiteboard';

const USER_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue  
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

const generateRandomNickname = (): string => {
  const adjectives = ['빠른', '멋진', '똑똑한', '친절한', '재미있는', '열정적인', '창의적인', '활발한'];
  const nouns = ['토끼', '고양이', '강아지', '팬더', '코끼리', '사자', '호랑이', '여우'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  
  return `${adjective}${noun}${number}`;
};

const MAX_USERS = 10;

export const usePresence = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentUserRef = useRef<User | null>(null);

  useEffect(() => {
    if (!currentUserRef.current) {
      currentUserRef.current = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nickname: generateRandomNickname(),
        color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
      };
      console.log('Created new currentUser:', currentUserRef.current);
    }

    console.log('🚀 Starting Supabase presence connection...');

    let channel: RealtimeChannel;
      channel = supabase.channel('presence', {
        config: {
          presence: {
            key: currentUserRef.current.id,
          },
        },
      });

      channelRef.current = channel;

      channel.on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const activeUsers: User[] = [];
        
        Object.keys(presenceState).forEach(userId => {
          const userPresence = presenceState[userId];
          if (userPresence && userPresence.length > 0) {
            const userData = userPresence[0] as unknown as User;
            activeUsers.push(userData);
          }
        });
        
        setUsers(activeUsers);
        
        // Check if current user should be blocked
        if (activeUsers.length > MAX_USERS) {
          const currentUserId = currentUserRef.current?.id;
          const sortedUsers = activeUsers.sort((a, b) => {
            // Sort by join time - we'll use ID timestamp for simplicity
            const aTime = parseInt(a.id.split('-')[1] || '0');
            const bTime = parseInt(b.id.split('-')[1] || '0');
            return aTime - bTime;
          });
          
          // Block users beyond the 10th position
          const allowedUsers = sortedUsers.slice(0, MAX_USERS);
          const isCurrentUserAllowed = allowedUsers.some(user => user.id === currentUserId);
          
          if (!isCurrentUserAllowed) {
            setIsBlocked(true);
            setShowBlockModal(true);
            channel.untrack();
          }
        }
      });

      channel.on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      });

      channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUserRef.current) {
          await channel.track(currentUserRef.current);
        }
      });


    return () => {
      if (channel) {
        channel.untrack();
        channel.unsubscribe();
      }
    };
  }, []);

  const updateCursor = (x: number, y: number) => {
    if (channelRef.current && currentUserRef.current) {
      const updatedUser = {
        ...currentUserRef.current,
        cursor: { x, y },
      };
      currentUserRef.current = updatedUser;
      channelRef.current.track(updatedUser);
    }
  };

  const closeBlockModal = () => {
    setShowBlockModal(false);
  };

  return {
    users,
    currentUser: currentUserRef.current,
    updateCursor,
    isBlocked,
    showBlockModal,
    closeBlockModal,
  };
};