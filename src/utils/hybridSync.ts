import { crossTabSync } from './crossTabSync';
import { multiDeviceSync } from './multiDeviceSync';

// Hybrid synchronization: BroadcastChannel for same-device tabs + Database for cross-device
class HybridSync {
  private listeners: Array<(data: any) => void> = [];
  private crossTabData: any = { users: [], messages: [], strokes: [] };
  private multiDeviceData: any = { users: [], messages: [], strokes: [] };
  private isStarted = false;

  async start() {
    if (this.isStarted) return;
    
    console.log('🔗 Starting hybrid sync (BroadcastChannel + Database)');
    this.isStarted = true;

    // Subscribe to cross-tab sync (same device)
    crossTabSync.subscribe((data) => {
      console.log('📱 Cross-tab data update:', {
        users: data.users.length,
        messages: data.messages.length,
        strokes: data.strokes.length
      });
      this.crossTabData = data;
      this.mergeAndNotify();
    });

    // Subscribe to multi-device sync (database)
    multiDeviceSync.subscribe((data) => {
      console.log('🌐 Multi-device data update:', {
        users: data.users.length, 
        messages: data.messages.length,
        strokes: data.strokes.length
      });
      this.multiDeviceData = data;
      this.mergeAndNotify();
    });

    // Start multi-device sync
    await multiDeviceSync.start();
  }

  private mergeAndNotify() {
    try {
      // Merge users (prioritize cross-tab for same device, add multi-device users)
      const mergedUsers = new Map();
      
      // Add cross-tab users (same device, more recent)
      this.crossTabData.users.forEach((user: any) => {
        mergedUsers.set(user.id, { ...user, source: 'same-device' });
      });
      
      // Add multi-device users (different devices) if not already present
      this.multiDeviceData.users.forEach((user: any) => {
        if (!mergedUsers.has(user.id)) {
          mergedUsers.set(user.id, {
            id: user.id,
            nickname: user.nickname,
            color: user.color,
            cursor: { x: user.cursor_x || 0, y: user.cursor_y || 0 },
            lastSeen: new Date(user.last_seen).getTime(),
            source: 'multi-device'
          });
        }
      });

      // Merge messages (combine and deduplicate)
      const allMessages = new Map();
      
      this.crossTabData.messages.forEach((msg: any) => {
        allMessages.set(msg.id, msg);
      });
      
      this.multiDeviceData.messages.forEach((msg: any) => {
        if (!allMessages.has(msg.id)) {
          allMessages.set(msg.id, {
            id: msg.id,
            userId: msg.user_id,
            userName: msg.user_name,
            userColor: msg.user_color,
            content: msg.content,
            timestamp: new Date(msg.created_at).getTime()
          });
        }
      });

      // Merge strokes (combine and deduplicate)
      const allStrokes = new Map();
      
      this.crossTabData.strokes.forEach((stroke: any, index: number) => {
        const strokeId = stroke.id || `cross-tab-${index}`;
        allStrokes.set(strokeId, stroke);
      });
      
      this.multiDeviceData.strokes.forEach((stroke: any) => {
        if (!allStrokes.has(stroke.id)) {
          try {
            const points = JSON.parse(stroke.points);
            allStrokes.set(stroke.id, {
              points,
              color: stroke.color,
              thickness: stroke.thickness,
              timestamp: new Date(stroke.created_at).getTime()
            });
          } catch (error) {
            console.warn('Failed to parse stroke points:', error);
          }
        }
      });

      // Create merged data
      const mergedData = {
        users: Array.from(mergedUsers.values()),
        messages: Array.from(allMessages.values()).sort((a, b) => a.timestamp - b.timestamp),
        strokes: Array.from(allStrokes.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
      };

      console.log('🔗 Merged data:', {
        users: mergedData.users.length,
        messages: mergedData.messages.length, 
        strokes: mergedData.strokes.length,
        userSources: mergedData.users.map(u => u.source)
      });

      // Notify all listeners
      this.listeners.forEach(callback => {
        try {
          callback(mergedData);
        } catch (error) {
          console.error('Hybrid sync listener error:', error);
        }
      });
    } catch (error) {
      console.error('Error merging data:', error);
    }
  }

  async addUser(user: any) {
    // Add to both systems
    crossTabSync.addUser(user);
    await multiDeviceSync.addUser(user);
  }

  async addMessage(message: any) {
    // Add to both systems
    crossTabSync.addMessage(message);
    await multiDeviceSync.addMessage(message);
  }

  async addStroke(stroke: any) {
    // Add to both systems
    crossTabSync.addStroke(stroke);
    await multiDeviceSync.addStroke(stroke);
  }

  async clearStrokes() {
    // Clear from both systems
    crossTabSync.clearStrokes();
    await multiDeviceSync.clearStrokes();
  }

  subscribe(callback: (data: any) => void) {
    console.log('📊 New hybrid sync subscription added');
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📊 Hybrid sync subscription removed');
    };
  }
}

export const hybridSync = new HybridSync();