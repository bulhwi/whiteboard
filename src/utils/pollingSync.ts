// Polling-based synchronization as fallback for Realtime
class PollingSync {
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private listeners: Array<(data: any) => void> = [];
  private lastUpdateTime = Date.now();

  start() {
    if (this.isPolling) return;
    
    console.log('📡 Starting polling-based sync (Realtime fallback)');
    this.isPolling = true;
    
    // Poll every 2 seconds
    this.pollInterval = setInterval(() => {
      this.pollForUpdates();
    }, 2000);
  }

  stop() {
    if (!this.isPolling) return;
    
    console.log('🛑 Stopping polling sync');
    this.isPolling = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async pollForUpdates() {
    try {
      // In a real implementation, you would poll a database table
      // For now, we'll simulate with localStorage for cross-tab sync
      const data = this.getLocalData();
      this.notifyListeners(data);
    } catch (error) {
      console.error('Polling error:', error);
    }
  }

  private getLocalData() {
    try {
      const stored = localStorage.getItem('whiteboard-fallback-data');
      return stored ? JSON.parse(stored) : { users: [], messages: [], strokes: [] };
    } catch {
      return { users: [], messages: [], strokes: [] };
    }
  }

  updateData(type: 'user' | 'message' | 'stroke', data: any) {
    try {
      const current = this.getLocalData();
      
      if (type === 'user') {
        const existingIndex = current.users.findIndex((u: any) => u.id === data.id);
        if (existingIndex >= 0) {
          current.users[existingIndex] = data;
        } else {
          current.users.push(data);
        }
        // Remove users older than 30 seconds (simulate leaving)
        current.users = current.users.filter((u: any) => 
          Date.now() - (parseInt(u.id.split('-')[1]) || 0) < 30000
        );
      } else if (type === 'message') {
        current.messages.push(data);
        // Keep only last 50 messages
        current.messages = current.messages.slice(-50);
      } else if (type === 'stroke') {
        current.strokes.push(data);
        // Keep only last 1000 strokes
        current.strokes = current.strokes.slice(-1000);
      }

      localStorage.setItem('whiteboard-fallback-data', JSON.stringify(current));
      this.lastUpdateTime = Date.now();
    } catch (error) {
      console.error('Error updating fallback data:', error);
    }
  }

  onDataChange(callback: (data: any) => void) {
    this.listeners.push(callback);
    
    // Send current data immediately
    callback(this.getLocalData());
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Listener callback error:', error);
      }
    });
  }

  clearData() {
    localStorage.removeItem('whiteboard-fallback-data');
    this.notifyListeners({ users: [], messages: [], strokes: [] });
  }
}

export const pollingSync = new PollingSync();