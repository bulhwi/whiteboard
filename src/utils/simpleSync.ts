// Ultra-simple memory-based synchronization
class SimpleSync {
  private data = {
    users: [] as any[],
    messages: [] as any[],
    strokes: [] as any[]
  };
  private listeners: Array<(data: any) => void> = [];

  // Add data and immediately notify all listeners
  addUser(user: any) {
    console.log('🔄 Adding user to simple sync:', user.nickname);
    
    // Remove existing user with same id
    this.data.users = this.data.users.filter(u => u.id !== user.id);
    
    // Add new user
    this.data.users.push(user);
    
    // Remove old users (older than 30 seconds)
    const now = Date.now();
    this.data.users = this.data.users.filter(u => {
      const userTime = parseInt(u.id.split('-')[1]) || 0;
      return (now - userTime) < 30000;
    });
    
    console.log('👥 Total users:', this.data.users.length);
    this.notifyAll();
  }

  addMessage(message: any) {
    console.log('📨 Adding message to simple sync:', message.content);
    
    this.data.messages.push(message);
    
    // Keep only last 50 messages
    this.data.messages = this.data.messages.slice(-50);
    
    console.log('💬 Total messages:', this.data.messages.length);
    this.notifyAll();
  }

  addStroke(stroke: any) {
    console.log('🎨 Adding stroke to simple sync');
    
    this.data.strokes.push(stroke);
    
    // Keep only last 500 strokes
    this.data.strokes = this.data.strokes.slice(-500);
    
    console.log('✏️ Total strokes:', this.data.strokes.length);
    this.notifyAll();
  }

  clearStrokes() {
    console.log('🧹 Clearing all strokes');
    this.data.strokes = [];
    this.notifyAll();
  }

  clearAll() {
    console.log('🧹 Clearing all data');
    this.data = {
      users: [],
      messages: [],
      strokes: []
    };
    this.notifyAll();
  }

  // Subscribe to data changes
  subscribe(callback: (data: any) => void) {
    console.log('📊 New subscription added');
    this.listeners.push(callback);
    
    // Immediately send current data
    callback(this.data);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📊 Subscription removed');
    };
  }

  private notifyAll() {
    console.log('📢 Notifying all listeners:', {
      users: this.data.users.length,
      messages: this.data.messages.length,
      strokes: this.data.strokes.length
    });
    
    this.listeners.forEach(callback => {
      try {
        callback(this.data);
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  // Get current data
  getData() {
    return this.data;
  }
}

export const simpleSync = new SimpleSync();