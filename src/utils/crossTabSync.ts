// Real cross-tab synchronization using BroadcastChannel + localStorage
class CrossTabSync {
  private data = {
    users: new Map<string, any>(),
    messages: [] as any[],
    strokes: [] as any[]
  };
  
  private listeners: Array<(data: any) => void> = [];
  private broadcastChannel: BroadcastChannel;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private myTabId: string;

  constructor() {
    this.myTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.broadcastChannel = new BroadcastChannel('whiteboard-sync');
    
    // Listen for messages from other tabs
    this.broadcastChannel.onmessage = (event) => {
      this.handleBroadcastMessage(event.data);
    };
    
    // Load initial data from localStorage
    this.loadFromStorage();
    
    // Start heartbeat for user cleanup
    this.startHeartbeat();
    
    console.log('🔄 CrossTabSync initialized, Tab ID:', this.myTabId);
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('whiteboard-crosstab-data');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data.messages = parsed.messages || [];
        this.data.strokes = parsed.strokes || [];
        
        // Convert users back to Map and filter out old ones
        const now = Date.now();
        if (parsed.users) {
          Object.entries(parsed.users).forEach(([id, userData]: [string, any]) => {
            if (userData && userData.lastSeen && (now - userData.lastSeen) < 45000) {
              this.data.users.set(id, userData);
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const dataToSave = {
        users: Object.fromEntries(this.data.users),
        messages: this.data.messages.slice(-50), // Keep only last 50
        strokes: this.data.strokes.slice(-200)   // Keep only last 200
      };
      localStorage.setItem('whiteboard-crosstab-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  private broadcast(type: string, data: any) {
    const message = {
      type,
      data,
      tabId: this.myTabId,
      timestamp: Date.now()
    };
    
    try {
      this.broadcastChannel.postMessage(message);
    } catch (error) {
      console.warn('Failed to broadcast:', error);
    }
  }

  private handleBroadcastMessage(message: any) {
    if (message.tabId === this.myTabId) return; // Ignore own messages
    
    console.log('📨 Received broadcast:', message.type, 'from', message.tabId);
    
    switch (message.type) {
      case 'user-update':
        this.data.users.set(message.data.id, {
          ...message.data,
          lastSeen: Date.now()
        });
        break;
        
      case 'user-remove':
        this.data.users.delete(message.data.id);
        break;
        
      case 'message-add':
        // Avoid duplicates
        if (!this.data.messages.find(m => m.id === message.data.id)) {
          this.data.messages.push(message.data);
          this.data.messages = this.data.messages.slice(-50);
        }
        break;
        
      case 'stroke-add':
        this.data.strokes.push(message.data);
        this.data.strokes = this.data.strokes.slice(-200);
        break;
        
      case 'strokes-clear':
        this.data.strokes = [];
        break;
    }
    
    this.saveToStorage();
    this.notifyListeners();
  }

  private startHeartbeat() {
    // Send heartbeat every 10 seconds
    this.heartbeatInterval = setInterval(() => {
      this.cleanupOldUsers();
    }, 10000);
  }

  private cleanupOldUsers() {
    const now = Date.now();
    let hasChanges = false;
    const currentCount = this.data.users.size;
    
    for (const [userId, user] of this.data.users.entries()) {
      if (user.lastSeen && (now - user.lastSeen) > 30000) { // Reduced to 30 seconds
        console.log('🧹 Removing inactive user:', user.nickname, 'Last seen:', Math.floor((now - user.lastSeen) / 1000), 'seconds ago');
        this.data.users.delete(userId);
        this.broadcast('user-remove', { id: userId });
        hasChanges = true;
      }
    }
    
    const newCount = this.data.users.size;
    if (currentCount !== newCount) {
      console.log('👥 User count changed:', currentCount, '→', newCount);
    }
    
    if (hasChanges) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // Public methods
  addUser(user: any) {
    const userWithMeta = {
      ...user,
      lastSeen: Date.now(),
      tabId: this.myTabId
    };
    
    console.log('👤 Adding user:', user.nickname);
    this.data.users.set(user.id, userWithMeta);
    this.broadcast('user-update', userWithMeta);
    this.saveToStorage();
    this.notifyListeners();
  }

  removeUser(userId: string) {
    console.log('👤 Removing user:', userId);
    this.data.users.delete(userId);
    this.broadcast('user-remove', { id: userId });
    this.saveToStorage();
    this.notifyListeners();
  }

  addMessage(message: any) {
    console.log('💬 Adding message:', message.content);
    
    // Avoid duplicates
    if (!this.data.messages.find(m => m.id === message.id)) {
      this.data.messages.push(message);
      this.data.messages = this.data.messages.slice(-50);
      this.broadcast('message-add', message);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  addStroke(stroke: any) {
    console.log('🎨 Adding stroke');
    this.data.strokes.push(stroke);
    this.data.strokes = this.data.strokes.slice(-200);
    this.broadcast('stroke-add', stroke);
    this.saveToStorage();
    this.notifyListeners();
  }

  clearStrokes() {
    console.log('🧹 Clearing strokes');
    this.data.strokes = [];
    this.broadcast('strokes-clear', {});
    this.saveToStorage();
    this.notifyListeners();
  }

  subscribe(callback: (data: any) => void) {
    console.log('📊 New subscription added');
    this.listeners.push(callback);
    
    // Send current data immediately
    const currentData = {
      users: Array.from(this.data.users.values()),
      messages: [...this.data.messages],
      strokes: [...this.data.strokes]
    };
    callback(currentData);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📊 Subscription removed');
    };
  }

  private notifyListeners() {
    const currentData = {
      users: Array.from(this.data.users.values()),
      messages: [...this.data.messages], 
      strokes: [...this.data.strokes]
    };
    
    console.log('📢 Notifying listeners:', {
      users: currentData.users.length,
      messages: currentData.messages.length,
      strokes: currentData.strokes.length
    });
    
    this.listeners.forEach(callback => {
      try {
        callback(currentData);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.broadcastChannel.close();
  }
}

export const crossTabSync = new CrossTabSync();