-- 동시접속자 수 추적 테이블 생성
-- 한 번에 한 줄씩 실행하면 오류 없이 생성됩니다

-- 1. 테이블 생성
CREATE TABLE active_users (
  id TEXT PRIMARY KEY,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_info TEXT DEFAULT 'unknown'
);