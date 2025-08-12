import { supabase } from './supabaseClient';

// Real multi-device synchronization using Supabase Database
class MultiDeviceSync {
  private listeners: Array<(data: any) => void> = [];
  private pollInterval: NodeJS.Timeout | null = null;
  private deviceId: string;

  constructor() {
    this.deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🌐 MultiDeviceSync initialized, Device ID:', this.deviceId);
  }

  async start() {
    console.log('🔄 Starting multi-device sync with database polling...');
    
    // Initialize tables if needed
    await this.initializeTables();
    
    // Start polling every 3 seconds
    this.pollInterval = setInterval(async () => {
      await this.syncWithDatabase();
    }, 3000);
    
    // Do initial sync
    await this.syncWithDatabase();
  }

  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('🛑 Stopped multi-device sync');
  }

  private async initializeTables() {
    try {
      // Try to create tables (will fail silently if they exist)
      await supabase.rpc('create_whiteboard_tables_if_not_exists');
    } catch (error) {
      // Tables might not exist, that's ok for fallback mode
      console.log('📊 Database tables may not exist, using fallback polling');
    }
  }

  private async syncWithDatabase() {
    try {
      const now = Date.now();
      
      // Get active users (within last 45 seconds)
      const { data: users } = await supabase
        .from('whiteboard_users')
        .select('*')
        .gte('last_seen', new Date(now - 45000).toISOString())
        .order('created_at', { ascending: true });

      // Get recent messages (last 50)
      const { data: messages } = await supabase
        .from('whiteboard_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Get recent strokes (last 500)
      const { data: strokes } = await supabase
        .from('whiteboard_strokes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      // Prepare data for listeners
      const syncData = {
        users: users || [],
        messages: (messages || []).reverse(), // Reverse to show oldest first
        strokes: (strokes || []).reverse()    // Reverse to show oldest first
      };

      console.log('🔄 Database sync:', {
        users: syncData.users.length,
        messages: syncData.messages.length, 
        strokes: syncData.strokes.length
      });

      // Notify all listeners
      this.listeners.forEach(callback => {
        try {
          callback(syncData);
        } catch (error) {
          console.error('Sync listener error:', error);
        }
      });

    } catch (error) {
      console.warn('Database sync failed:', error);
      // Continue polling even if database fails
    }
  }

  async addUser(user: any) {
    try {
      console.log('👤 Adding user to database:', user.nickname);
      
      const userRecord = {
        id: user.id,
        nickname: user.nickname,
        color: user.color,
        device_id: this.deviceId,
        last_seen: new Date().toISOString(),
        cursor_x: user.cursor?.x || 0,
        cursor_y: user.cursor?.y || 0
      };

      // Upsert user (insert or update if exists)
      await supabase
        .from('whiteboard_users')
        .upsert(userRecord, { 
          onConflict: 'id' 
        });
        
    } catch (error) {
      console.warn('Failed to add user to database:', error);
    }
  }

  async addMessage(message: any) {
    try {
      console.log('💬 Adding message to database:', message.content);
      
      const messageRecord = {
        id: message.id,
        user_id: message.userId,
        user_name: message.userName,
        user_color: message.userColor,
        content: message.content,
        device_id: this.deviceId,
        created_at: new Date(message.timestamp).toISOString()
      };

      await supabase
        .from('whiteboard_messages')
        .insert(messageRecord);
        
    } catch (error) {
      console.warn('Failed to add message to database:', error);
    }
  }

  async addStroke(stroke: any) {
    try {
      console.log('🎨 Adding stroke to database');
      
      const strokeRecord = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        device_id: this.deviceId,
        points: JSON.stringify(stroke.points),
        color: stroke.color,
        thickness: stroke.thickness,
        created_at: new Date().toISOString()
      };

      await supabase
        .from('whiteboard_strokes')
        .insert(strokeRecord);
        
    } catch (error) {
      console.warn('Failed to add stroke to database:', error);
    }
  }

  async clearStrokes() {
    try {
      console.log('🧹 Clearing all strokes from database');
      
      await supabase
        .from('whiteboard_strokes')
        .delete()
        .neq('id', 'never-matches'); // Delete all
        
    } catch (error) {
      console.warn('Failed to clear strokes from database:', error);
    }
  }

  subscribe(callback: (data: any) => void) {
    console.log('📊 New multi-device subscription added');
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📊 Multi-device subscription removed');
    };
  }

  // Cleanup old records periodically
  async cleanup() {
    try {
      const cutoffTime = new Date(Date.now() - 300000).toISOString(); // 5 minutes ago
      
      // Remove old users
      await supabase
        .from('whiteboard_users')
        .delete()
        .lt('last_seen', cutoffTime);

      // Keep only last 100 messages
      const { data: oldMessages } = await supabase
        .from('whiteboard_messages')
        .select('id')
        .order('created_at', { ascending: false })
        .range(100, 1000);

      if (oldMessages && oldMessages.length > 0) {
        const idsToDelete = oldMessages.map(msg => msg.id);
        await supabase
          .from('whiteboard_messages')
          .delete()
          .in('id', idsToDelete);
      }

      // Keep only last 1000 strokes
      const { data: oldStrokes } = await supabase
        .from('whiteboard_strokes')
        .select('id')
        .order('created_at', { ascending: false })
        .range(1000, 5000);

      if (oldStrokes && oldStrokes.length > 0) {
        const idsToDelete = oldStrokes.map(stroke => stroke.id);
        await supabase
          .from('whiteboard_strokes')
          .delete()
          .in('id', idsToDelete);
      }
      
      console.log('🧹 Database cleanup completed');
    } catch (error) {
      console.warn('Database cleanup failed:', error);
    }
  }
}

export const multiDeviceSync = new MultiDeviceSync();