-- 간단한 동시접속자 수 추적을 위한 테이블
-- 이것만 실행하면 동시접속자 수가 정상 작동합니다

-- 실시간 동시접속자 수 관리 테이블
CREATE TABLE active_users (
  id TEXT PRIMARY KEY,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_info TEXT DEFAULT 'unknown'
);

-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_active_users_last_heartbeat ON active_users(last_heartbeat);

-- RLS 비활성화 (간단한 설정)
ALTER TABLE active_users DISABLE ROW LEVEL SECURITY;