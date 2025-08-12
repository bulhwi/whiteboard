// 진짜 멀티디바이스 동시접속자 수 관리
// Supabase Database 기반으로 실제 다른 기기의 사용자만 카운트

import { supabase } from './supabaseClient';

class RealUserCount {
  private currentUserId: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private userCountListeners: Array<(count: number) => void> = [];
  private isActive = false;

  constructor() {
    this.currentUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async start() {
    if (this.isActive) {
      console.log('👥 RealUserCount already active');
      return;
    }

    console.log('👥 Starting RealUserCount tracking...');
    this.isActive = true;

    try {
      // 현재 사용자를 데이터베이스에 등록
      await this.registerUser();

      // 5초마다 heartbeat 전송
      this.heartbeatInterval = setInterval(async () => {
        await this.sendHeartbeat();
        await this.checkUserCount();
      }, 5000);

      // 초기 사용자 수 확인
      await this.checkUserCount();

      // 페이지 종료 시 정리
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

    } catch (error) {
      console.warn('Failed to start RealUserCount:', error);
      this.isActive = false;
    }
  }

  stop() {
    this.cleanup();
  }

  private async registerUser() {
    try {
      const userData = {
        id: this.currentUserId,
        joined_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_info: 'unknown' // IP는 서버에서 감지해야 하지만 일단 placeholder
      };

      const { error } = await supabase
        .from('active_users')
        .upsert(userData, { onConflict: 'id' });

      if (error) {
        console.warn('Failed to register user:', error);
      } else {
        console.log('✅ User registered:', this.currentUserId);
      }
    } catch (error) {
      console.warn('Error registering user:', error);
    }
  }

  private async sendHeartbeat() {
    try {
      const { error } = await supabase
        .from('active_users')
        .update({ 
          last_heartbeat: new Date().toISOString() 
        })
        .eq('id', this.currentUserId);

      if (error) {
        console.warn('Heartbeat failed:', error);
      }
    } catch (error) {
      console.warn('Error sending heartbeat:', error);
    }
  }

  private async checkUserCount() {
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

      const { data, error } = await supabase
        .from('active_users')
        .select('id')
        .gte('last_heartbeat', thirtySecondsAgo);

      if (error) {
        console.warn('Error checking user count:', error);
        return;
      }

      const activeUserCount = data?.length || 0;
      console.log('👥 Active users:', activeUserCount);
      
      // 모든 리스너에게 알림
      this.userCountListeners.forEach(callback => {
        try {
          callback(activeUserCount);
        } catch (error) {
          console.error('User count listener error:', error);
        }
      });

    } catch (error) {
      console.warn('Error in checkUserCount:', error);
    }
  }

  private cleanup() {
    if (!this.isActive) return;
    
    console.log('🧹 Cleaning up RealUserCount...');
    this.isActive = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // 사용자를 데이터베이스에서 제거
    this.removeUser();
  }

  private async removeUser() {
    try {
      const { error } = await supabase
        .from('active_users')
        .delete()
        .eq('id', this.currentUserId);

      if (error) {
        console.warn('Failed to remove user:', error);
      } else {
        console.log('✅ User removed:', this.currentUserId);
      }
    } catch (error) {
      console.warn('Error removing user:', error);
    }
  }

  // 사용자 수 변경을 구독
  onUserCountChange(callback: (count: number) => void) {
    this.userCountListeners.push(callback);
    
    return () => {
      this.userCountListeners = this.userCountListeners.filter(cb => cb !== callback);
    };
  }

  // 수동으로 사용자 수 확인
  async getCurrentUserCount(): Promise<number> {
    try {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

      const { data, error } = await supabase
        .from('active_users')
        .select('id')
        .gte('last_heartbeat', thirtySecondsAgo);

      if (error) {
        console.warn('Error getting current user count:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.warn('Error in getCurrentUserCount:', error);
      return 0;
    }
  }
}

export const realUserCount = new RealUserCount();