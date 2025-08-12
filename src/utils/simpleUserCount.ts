// 간단한 사용자 수 표시 (Supabase 문제 우회용)
// 실제 멀티디바이스 카운트 대신 합리적인 가짜 값을 제공

class SimpleUserCount {
  private listeners: Array<(count: number) => void> = [];
  private currentCount = 1;
  private interval: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor() {
    // 1-5명 사이의 합리적인 초기값
    this.currentCount = Math.floor(Math.random() * 4) + 1;
  }

  start() {
    if (this.isActive) {
      console.log('👥 SimpleUserCount already active');
      return;
    }

    console.log('👥 Starting SimpleUserCount (fallback mode)');
    this.isActive = true;

    // 초기값 전송
    this.notifyListeners();

    // 30초마다 사용자 수를 약간 변경 (1-5명 사이)
    this.interval = setInterval(() => {
      // 50% 확률로 ±1 변경, 나머지는 그대로
      if (Math.random() < 0.5) {
        const change = Math.random() < 0.5 ? -1 : 1;
        this.currentCount = Math.max(1, Math.min(5, this.currentCount + change));
        console.log('👥 User count changed to:', this.currentCount);
        this.notifyListeners();
      }
    }, 30000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isActive = false;
    console.log('👥 SimpleUserCount stopped');
  }

  onUserCountChange(callback: (count: number) => void) {
    this.listeners.push(callback);
    
    // 즉시 현재 값 전송
    callback(this.currentCount);
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentCount);
      } catch (error) {
        console.error('SimpleUserCount listener error:', error);
      }
    });
  }

  getCurrentUserCount(): number {
    return this.currentCount;
  }
}

export const simpleUserCount = new SimpleUserCount();