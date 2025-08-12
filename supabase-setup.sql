-- Supabase 테이블 생성 스크립트
-- 실시간 낙서판을 위한 데이터베이스 스키마

-- 0. 실시간 동시접속자 수 관리 테이블 (우선순위 1)
CREATE TABLE IF NOT EXISTS active_users (
  id TEXT PRIMARY KEY,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_info TEXT DEFAULT 'unknown'
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_active_users_last_heartbeat ON active_users(last_heartbeat);

-- RLS (Row Level Security) 활성화
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정
DROP POLICY IF EXISTS "Enable all operations for active_users" ON active_users;
CREATE POLICY "Enable all operations for active_users" ON active_users FOR ALL USING (true);

-- 1. 화이트보드 사용자 테이블
CREATE TABLE IF NOT EXISTS whiteboard_users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  color TEXT NOT NULL,
  device_id TEXT NOT NULL,
  cursor_x REAL DEFAULT 0,
  cursor_y REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 화이트보드 메시지 테이블  
CREATE TABLE IF NOT EXISTS whiteboard_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  content TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 화이트보드 스트로크 테이블
CREATE TABLE IF NOT EXISTS whiteboard_strokes (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  points TEXT NOT NULL,
  color TEXT NOT NULL,
  thickness REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_whiteboard_users_last_seen ON whiteboard_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_whiteboard_users_device_id ON whiteboard_users(device_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_messages_created_at ON whiteboard_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_whiteboard_messages_device_id ON whiteboard_messages(device_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_strokes_created_at ON whiteboard_strokes(created_at);
CREATE INDEX IF NOT EXISTS idx_whiteboard_strokes_device_id ON whiteboard_strokes(device_id);

-- RLS (Row Level Security) 활성화 - 필요시
ALTER TABLE whiteboard_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_messages ENABLE ROW LEVEL SECURITY;  
ALTER TABLE whiteboard_strokes ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정
DROP POLICY IF EXISTS "Enable all operations for whiteboard_users" ON whiteboard_users;
CREATE POLICY "Enable all operations for whiteboard_users" ON whiteboard_users FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for whiteboard_messages" ON whiteboard_messages;
CREATE POLICY "Enable all operations for whiteboard_messages" ON whiteboard_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for whiteboard_strokes" ON whiteboard_strokes;
CREATE POLICY "Enable all operations for whiteboard_strokes" ON whiteboard_strokes FOR ALL USING (true);

-- 자동 정리 함수 (선택사항)
CREATE OR REPLACE FUNCTION cleanup_old_whiteboard_data()
RETURNS void AS $$
BEGIN
  -- 5분 이상 오래된 사용자 삭제
  DELETE FROM whiteboard_users WHERE last_seen < NOW() - INTERVAL '5 minutes';
  
  -- 100개 초과 메시지 삭제
  DELETE FROM whiteboard_messages 
  WHERE id IN (
    SELECT id FROM whiteboard_messages 
    ORDER BY created_at DESC 
    OFFSET 100
  );
  
  -- 1000개 초과 스트로크 삭제  
  DELETE FROM whiteboard_strokes
  WHERE id IN (
    SELECT id FROM whiteboard_strokes
    ORDER BY created_at DESC
    OFFSET 1000
  );
END;
$$ LANGUAGE plpgsql;