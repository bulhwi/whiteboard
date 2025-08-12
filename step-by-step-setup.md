# Supabase 테이블 설정 (단계별)

동시접속자 수 기능을 위해 아래 SQL을 **한 줄씩** Supabase SQL Editor에서 실행하세요.

## 1단계: 기본 테이블 생성
```sql
CREATE TABLE active_users (
  id TEXT PRIMARY KEY,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_info TEXT DEFAULT 'unknown'
);
```

## 2단계: 인덱스 생성 (성능 향상)
```sql
CREATE INDEX idx_active_users_last_heartbeat ON active_users(last_heartbeat);
```

## 3단계: RLS 정책 설정 (권한 허용)
```sql
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;
```

```sql
CREATE POLICY "Allow all operations" ON active_users FOR ALL USING (true);
```

---

## 만약 오류가 발생하면

가장 간단한 버전만 실행하세요:

```sql
CREATE TABLE active_users (
  id TEXT PRIMARY KEY,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_info TEXT DEFAULT 'unknown'
);
```

이것만으로도 동시접속자 수 기능이 작동합니다!