# 🚀 배포 가이드

## Vercel 배포

### 1. 준비사항
- GitHub 계정과 연동된 Vercel 계정
- Supabase 프로젝트 및 API 키

### 2. 자동 배포 설정

1. **GitHub에 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/rl8p-whiteboard.git
   git push -u origin main
   ```

2. **Vercel에서 프로젝트 연결**
   - https://vercel.com/dashboard 방문
   - "New Project" 클릭
   - GitHub 저장소 선택
   - Framework Preset: "Vite" 자동 감지

3. **환경 변수 설정**
   Vercel 대시보드에서 Environment Variables 추가:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. 수동 배포 (Vercel CLI)

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인 및 배포**
   ```bash
   vercel login
   vercel --prod
   ```

## 다른 플랫폼 배포

### Netlify
1. `netlify.toml` 파일 생성:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. 환경 변수 설정:
   - Site settings → Environment variables
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가

### GitHub Pages
1. `.github/workflows/deploy.yml` 생성:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

## 최적화 설정

### 성능 최적화
- ✅ 코드 스플리팅 (vendor, supabase 청크)
- ✅ Terser 최적화 (console 제거)
- ✅ Gzip 압축
- ✅ 캐싱 헤더 설정

### 보안 헤더
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block

## 확인사항

### 배포 후 테스트
1. **기본 기능**
   - [ ] 페이지 로드 정상
   - [ ] 캔버스 그리기 동작
   - [ ] 실시간 동기화 작동

2. **멀티유저 테스트**
   - [ ] 2개 탭에서 실시간 그림 동기화
   - [ ] 채팅 메시지 실시간 동기화
   - [ ] 사용자 presence 표시

3. **성능 검증**
   - [ ] Lighthouse 점수 90+ 목표
   - [ ] 초기 로딩 시간 3초 이하
   - [ ] 실시간 지연시간 100ms 이하

## 문제 해결

### 일반적인 문제
1. **환경 변수 오류**: Vercel 대시보드에서 환경 변수 재확인
2. **빌드 실패**: `npm run build` 로컬에서 먼저 테스트
3. **Supabase 연결 실패**: API 키와 URL 정확성 확인
4. **CORS 에러**: Supabase 설정에서 도메인 추가

### 디버깅
- Vercel Functions 로그: `vercel logs`
- 브라우저 개발자 도구 Network 탭 확인
- Supabase 대시보드에서 실시간 연결 상태 확인

---

**배포 URL 예시**: `https://rl8p-whiteboard.vercel.app`