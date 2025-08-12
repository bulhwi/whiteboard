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
      // 테이블 존재 확인을 위한 간단한 테스트
      console.log('🔍 Testing database connection...');
      const { error: testError } = await supabase
        .from('active_users')
        .select('id')
        .limit(1);

      if (testError) {
        console.warn('❌ Database test failed:', testError.message);
        console.warn('⚠️ RealUserCount disabled - table may not exist');
        this.isActive = false;
        // Fallback: 사용자 수를 1로 고정
        this.notifyListeners(1);
        return;
      }

      console.log('✅ Database test passed, registering user...');

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
      // Fallback: 사용자 수를 1로 설정
      this.notifyListeners(1);
    }
  }

  private notifyListeners(count: number) {
    this.userCountListeners.forEach(callback => {
      try {
        callback(count);
      } catch (error) {
        console.error('User count listener error:', error);
      }
    });
  }

  stop() {
    this.cleanup();
  }

  private async registerUser() {
    try {
      // 안전한 사용자 데이터 생성 (null/undefined 값 방지)
      const userData = {
        id: String(this.currentUserId || `user-${Date.now()}`),
        joined_at: new Date().toISOString(),
        last_heartbeat: new Date().toISOString(),
        user_agent: String(navigator?.userAgent || 'unknown'),
        ip_info: 'unknown'
      };

      console.log('👤 Registering user with data:', userData);

      const { error } = await supabase
        .from('active_users')
        .upsert(userData, { 
          onConflict: 'id'
        });

      if (error) {
        console.warn('Failed to register user:', error.message, error.details);
      } else {
        console.log('✅ User registered successfully:', this.currentUserId);
      }
    } catch (error) {
      console.warn('Error in registerUser:', error);
    }
  }

  private async sendHeartbeat() {
    try {
      // 데이터 검증
      if (!this.currentUserId) {
        console.warn('No current user ID for heartbeat');
        return;
      }

      const updateData = {
        last_heartbeat: new Date().toISOString()
      };

      console.log('💓 Sending heartbeat for user:', this.currentUserId);

      const { error } = await supabase
        .from('active_users')
        .update(updateData)
        .eq('id', String(this.currentUserId));

      if (error) {
        console.warn('Heartbeat failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log('💓 Heartbeat sent successfully');
      }
    } catch (error) {
      console.warn('Error in sendHeartbeat:', error);
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
      this.notifyListeners(activeUserCount);

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