// 간단한 동기화 시스템: BroadcastChannel만 사용
// 데이터베이스 문제로 인한 복잡성 제거

import { crossTabSync } from './crossTabSync';

class SimpleSync {
  private listeners: Array<(data: any) => void> = [];
  private isStarted = false;
  private cleanup: (() => void) | null = null;

  async start() {
    if (this.isStarted) {
      console.log('🔄 SimpleSync already started');
      return;
    }
    
    console.log('🔄 Starting SimpleSync (BroadcastChannel only)');
    this.isStarted = true;

    // crossTabSync만 사용
    this.cleanup = crossTabSync.subscribe((data) => {
      console.log('📱 SimpleSync data update:', {
        users: data.users.length,
        messages: data.messages.length,
        strokes: data.strokes.length
      });
      
      // 모든 리스너에게 알림
      this.listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SimpleSync listener error:', error);
        }
      });
    });
  }

  stop() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    this.isStarted = false;
    console.log('🛑 SimpleSync stopped');
  }

  async addUser(user: any) {
    crossTabSync.addUser(user);
  }

  async addMessage(message: any) {
    crossTabSync.addMessage(message);
  }

  async addStroke(stroke: any) {
    crossTabSync.addStroke(stroke);
  }

  async clearStrokes() {
    crossTabSync.clearStrokes();
  }

  subscribe(callback: (data: any) => void) {
    console.log('📊 New SimpleSync subscription added');
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('📊 SimpleSync subscription removed');
    };
  }
}

export const simpleSync = new SimpleSync();