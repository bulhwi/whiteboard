# 🚀 실제 Supabase 설정 가이드

## 1단계: Supabase 프로젝트 생성
1. https://supabase.com/dashboard 방문
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: `rl8p-whiteboard`
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (ap-northeast-1)` 추천
4. "Create new project" 클릭 (약 2분 소요)

## 2단계: API 키 및 URL 복사
1. 프로젝트가 생성되면 왼쪽 사이드바에서 **Settings** → **API** 클릭
2. 다음 값들을 복사:
   - **Project URL** (예: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** 키 (매우 긴 JWT 토큰)

## 3단계: .env 파일 업데이트
현재 `.env` 파일을 실제 값으로 교체:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

## 4단계: Realtime 기능 확인
1. 왼쪽 사이드바에서 **Database** → **Replication** 클릭
2. Realtime이 활성화되어 있는지 확인

## 5단계: 테스트
1. `.env` 파일 저장 후 개발 서버 재시작:
   ```bash
   npm run dev
   ```
2. 브라우저에서 `localhost:5173` 접속
3. 상단 우측에 "실시간 연결 활성" 표시 확인
4. 두 개의 브라우저 탭으로 실시간 동기화 테스트

## 문제 해결
- **연결 실패 시**: API 키와 URL이 정확한지 확인
- **Realtime 안됨**: Supabase 대시보드에서 Realtime 활성화 확인
- **CORS 에러**: Supabase 설정에서 도메인 추가 (`localhost:5173`)

---
**현재 상태**: 임시 테스트 URL로 설정됨. 실제 프로젝트 생성 후 위 단계를 따라 업데이트하세요.