# 📚 Mooday - Technical Documentation

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술적 의사결정](#2-기술적-의사결정)
3. [핵심 구현 내용](#3-핵심-구현-내용)
4. [성능 최적화](#4-성능-최적화)
5. [보안 고려사항](#5-보안-고려사항)
6. [문제 해결 사례](#6-문제-해결-사례)
7. [배운 점](#7-배운-점)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
개인 일정을 효율적으로 관리할 수 있는 크로스플랫폼 모바일 애플리케이션 개발

### 1.2 개발 기간
- 초기 개발: [기간 입력]
- 주요 기능 구현 완료: [날짜 입력]

### 1.3 개발 인원
- 1인 개발 (Full-stack)

---

## 2. 기술적 의사결정

### 2.1 React Native + Expo 선택 이유

#### ✅ 장점
1. **크로스플랫폼 개발**
   - 하나의 코드베이스로 iOS, Android, Web 지원
   - 개발 시간 및 비용 절감 (네이티브 대비 약 70% 절감)

2. **빠른 개발 속도**
   - Hot Reloading으로 즉각적인 피드백
   - Expo의 풍부한 내장 라이브러리
   - 복잡한 네이티브 설정 없이 빠른 프로토타이핑

3. **활발한 커뮤니티**
   - 풍부한 서드파티 라이브러리
   - 문제 해결을 위한 레퍼런스 다수 존재

#### ⚠️ 단점 및 해결 방안
1. **성능 이슈**
   - 문제: 네이티브 앱 대비 성능 차이
   - 해결: React Native Reanimated 사용으로 60fps 애니메이션 구현

2. **네이티브 기능 제한**
   - 문제: 특정 네이티브 API 직접 접근 어려움
   - 해결: Expo Modules API 활용 및 필요시 custom native module 작성 가능

### 2.2 Supabase 선택 이유

#### ✅ 장점
1. **빠른 백엔드 구축**
   - 별도의 백엔드 서버 개발 불필요
   - PostgreSQL 기반의 강력한 데이터베이스
   - 실시간 기능 내장

2. **내장 인증 시스템**
   - 이메일/비밀번호 인증 즉시 사용 가능
   - OAuth 소셜 로그인 지원
   - JWT 기반 세션 관리

3. **Row Level Security (RLS)**
   - 데이터베이스 레벨에서 보안 정책 적용
   - 사용자별 데이터 접근 제어 자동화

4. **개발자 경험**
   - 직관적인 대시보드
   - SQL Editor로 쉬운 데이터베이스 관리
   - 실시간 로그 모니터링

#### 대안 기술 비교

| 기술 | 장점 | 단점 | 선택 여부 |
|------|------|------|-----------|
| **Supabase** | 빠른 개발, RLS, 실시간 | 벤더 종속 | ✅ 선택 |
| Firebase | 높은 성숙도, 대규모 커뮤니티 | 비용, NoSQL 제약 | ❌ |
| AWS Amplify | AWS 생태계 통합 | 복잡한 설정, 높은 러닝커브 | ❌ |
| Custom Backend | 완전한 제어 | 개발 시간 증가 | ❌ |

### 2.3 TypeScript 도입

#### 이유
1. **타입 안정성**: 런타임 에러를 컴파일 타임에 발견
2. **자동완성 및 IntelliSense**: 개발 생산성 향상
3. **리팩토링 용이**: 타입 기반 안전한 코드 변경
4. **코드 문서화**: 타입이 곧 문서 역할

#### 적용 사례

```typescript
// Bad: JavaScript (타입 불명확)
const fetchSchedules = async () => {
  const { data } = await supabase.from('schedules').select('*');
  return data; // data의 구조를 알 수 없음
};

// Good: TypeScript (명확한 타입)
type Schedule = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  owner_type: 'PERSONAL';
  owner_user_id: string;
};

const fetchSchedules = async (): Promise<Schedule[]> => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*');
  
  if (error) throw error;
  return data as Schedule[]; // 타입 보장
};
```

---

## 3. 핵심 구현 내용

### 3.1 Supabase 클라이언트 초기화

**파일**: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// 환경변수로 관리하는 것이 베스트 프랙티스
const SUPABASE_URL = 'https://rmkpzptjwptkqoeidhem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j-aAFik8xQp6K10cub63PA_YbdBvYC1';

export const supabase = createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
);
```

**개선 사항**:
```typescript
// 향후 환경변수 적용 예정
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey;
```

### 3.2 사용자 인증 구현

**파일**: `src/screens/LoginScreen.tsx`

#### 회원가입
```typescript
const signUp = async () => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  } else {
    alert('회원가입 완료!');
  }
};
```

**학습 포인트**:
- Supabase Auth API 활용
- 에러 핸들링 패턴
- 사용자 피드백 (alert → 향후 Toast 메시지로 개선 예정)

#### 로그인
```typescript
const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
  }
  // 성공 시 자동으로 세션이 생성되어 사용자 정보 접근 가능
};
```

**인증 흐름**:
```
User Input (email/password)
    ↓
signInWithPassword()
    ↓
Supabase Auth Server
    ↓
JWT Token 발급
    ↓
Local Storage 저장 (자동)
    ↓
Session 유지
```

### 3.3 일정 CRUD 구현

**파일**: `app/(tabs)/index.tsx`

#### 일정 조회 (Read)
```typescript
const fetchSchedules = async () => {
  // 1. 현재 로그인 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('현재 로그인 유저 ID:', user?.id);
  
  try {
    // 2. 데이터베이스에서 일정 조회
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) throw error;
    console.log('조회된 일정:', data);
  } catch (e) {
    console.error('일정 조회 에러:', e);
  }
};
```

**학습 포인트**:
1. **인증 상태 확인**: `getUser()`로 현재 사용자 정보 조회
2. **데이터 조회**: `.select('*')` 메서드 체이닝
3. **정렬**: `.order()` 메서드로 날짜순 정렬
4. **에러 핸들링**: try-catch 패턴 적용

#### 일정 생성 (Create)
```typescript
const createTestSchedule = async () => {
  console.log('버튼 눌림');
  
  // 1. 사용자 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return; // Early return 패턴

  // 2. 현재 시간 ISO 형식으로 변환
  const now = new Date().toISOString();

  // 3. 데이터 삽입
  const { error } = await supabase.from('schedules').insert({
    title: '테스트 일정',
    start_date: now,
    end_date: now,
    owner_type: 'PERSONAL',
    owner_user_id: user.id, // RLS 정책에 맞춰 사용자 ID 지정
  });

  // 4. 에러 처리 및 UI 업데이트
  if (error) {
    console.error(error);
  } else {
    fetchSchedules(); // 일정 목록 재조회로 UI 업데이트
  }
};
```

**학습 포인트**:
1. **Early Return 패턴**: 사용자 미인증 시 조기 종료
2. **ISO 8601 날짜 형식**: PostgreSQL TIMESTAMP 타입과 호환
3. **외래 키 관계**: `owner_user_id`를 통한 사용자-일정 관계 설정
4. **Optimistic UI 업데이트**: 삽입 후 즉시 재조회

### 3.4 React Hooks 활용

#### useEffect로 초기 데이터 로딩
```typescript
useEffect(() => {
  fetchSchedules();
}, []); // 빈 의존성 배열 = 컴포넌트 마운트 시 1회 실행
```

**학습 포인트**:
- 컴포넌트 라이프사이클 이해
- 의존성 배열 활용
- 비동기 데이터 페칭 패턴

#### useState로 로컬 상태 관리
```typescript
const [schedules, setSchedules] = useState<Schedule[]>([]);
const [loading, setLoading] = useState(true);
```

**학습 포인트**:
- 제네릭을 활용한 타입 안전한 상태 관리
- 로딩 상태 관리 패턴

---

## 4. 성능 최적화

### 4.1 현재 구현

#### 데이터 페칭 최적화
```typescript
// 날짜순 정렬을 DB 레벨에서 처리
const { data } = await supabase
  .from('schedules')
  .select('*')
  .order('start_date', { ascending: true }); // DB에서 정렬
```

**이점**: 클라이언트 측 정렬 연산 불필요

### 4.2 향후 최적화 계획

#### 1. React Query 도입
```typescript
// Before: 수동 상태 관리
const [schedules, setSchedules] = useState<Schedule[]>([]);
const fetchSchedules = async () => { /* ... */ };

// After: React Query 활용
import { useQuery } from '@tanstack/react-query';

const { data: schedules, isLoading, error } = useQuery({
  queryKey: ['schedules'],
  queryFn: fetchSchedules,
  staleTime: 5000, // 5초 동안 캐시 유지
});
```

**이점**:
- 자동 캐싱
- 백그라운드 리페칭
- 낙관적 업데이트 지원

#### 2. 메모이제이션
```typescript
import { useMemo } from 'react';

const upcomingSchedules = useMemo(() => {
  return schedules.filter(s => 
    new Date(s.start_date) > new Date()
  );
}, [schedules]);
```

#### 3. 가상 스크롤 (FlatList 최적화)
```typescript
<FlatList
  data={schedules}
  renderItem={renderScheduleItem}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>
```

---

## 5. 보안 고려사항

### 5.1 Row Level Security (RLS) 정책

#### 현재 적용된 정책

```sql
-- 사용자는 자신의 일정만 조회 가능
CREATE POLICY "Users can view their own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = owner_user_id);

-- 사용자는 자신의 일정만 추가 가능
CREATE POLICY "Users can insert their own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);
```

**학습 포인트**:
- 데이터베이스 레벨 보안 정책
- `auth.uid()` 함수로 현재 JWT 토큰의 사용자 ID 추출
- SELECT, INSERT 등 작업별 정책 분리

### 5.2 환경변수 관리 (향후 개선)

#### 현재 상태
```typescript
// ⚠️ 하드코딩된 API 키
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

#### 개선 계획
```typescript
// .env 파일 사용
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx

// app.config.js에서 주입
export default {
  expo: {
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
```

### 5.3 클라이언트 측 유효성 검사

```typescript
// 향후 추가 예정
const validateSchedule = (data: ScheduleInput) => {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('제목을 입력해주세요');
  }
  
  if (new Date(data.end_date) < new Date(data.start_date)) {
    throw new Error('종료일은 시작일보다 늦어야 합니다');
  }
  
  return true;
};
```

---

## 6. 문제 해결 사례

### 6.1 초기 로딩 상태 관리

#### 문제
일정 목록 화면에 처음 진입 시 빈 화면이 깜빡이는 현상

#### 원인 분석
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchSchedules(); // loading 상태 업데이트 없음
}, []);
```

#### 해결
```typescript
const fetchSchedules = async () => {
  setLoading(true); // 로딩 시작
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*');
    
    if (error) throw error;
    setSchedules(data || []);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false); // 로딩 종료
  }
};
```

#### 학습
- 비동기 작업의 로딩 상태 관리 중요성
- `finally` 블록 활용으로 에러 발생 시에도 로딩 상태 해제

### 6.2 RLS 정책 디버깅

#### 문제
일정 추가 후 조회되지 않는 현상

#### 원인 분석
```sql
-- RLS 정책이 없어서 모든 요청 차단됨
SELECT * FROM schedules; -- 빈 결과 반환
```

#### 해결
1. Supabase 대시보드에서 RLS 정책 확인
2. SELECT, INSERT 정책 생성
3. `auth.uid()` 함수로 현재 사용자 확인

#### 학습
- RLS 정책의 중요성
- Supabase Auth와 PostgreSQL 함수 연동 방식

### 6.3 타입 에러 해결

#### 문제
```typescript
// TypeScript 에러: Type 'null' is not assignable
const user = await supabase.auth.getUser();
console.log(user.id); // 에러 발생 가능
```

#### 해결
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return; // null 체크

console.log(user.id); // 안전하게 접근
```

#### 학습
- TypeScript의 null 체크 강제
- Early return 패턴으로 안전한 코드 작성

---

## 7. 배운 점

### 7.1 기술적 학습

#### React Native 생태계
- ✅ Expo의 편리함과 제약 이해
- ✅ React Native의 브릿지 아키텍처 이해
- ✅ 네이티브 컴포넌트 vs JS 컴포넌트 차이
- ✅ 플랫폼별 코드 분기 처리

#### Supabase & PostgreSQL
- ✅ BaaS (Backend as a Service) 활용 경험
- ✅ PostgreSQL의 RLS 기능 이해
- ✅ JWT 기반 인증 메커니즘
- ✅ 실시간 구독 (Realtime) 기능 이해

#### TypeScript
- ✅ 타입 시스템의 이점 체감
- ✅ 제네릭 활용
- ✅ 인터페이스 vs 타입 차이
- ✅ 타입 가드 패턴

### 7.2 아키텍처 및 설계

#### 컴포넌트 설계
- 화면(Screen) vs 재사용 컴포넌트(Component) 분리
- Atomic Design 패턴 이해
- Props Drilling 문제 인식 (향후 Context API/Redux 도입 고려)

#### 데이터 플로우
```
UI 이벤트 → Business Logic → API 호출 → 상태 업데이트 → UI 리렌더링
```

#### 에러 핸들링 패턴
1. **Try-Catch**: 비동기 작업
2. **Early Return**: 조건 검증
3. **Optional Chaining**: null/undefined 안전 접근

### 7.3 개발 프로세스

#### 학습한 모범 사례
1. **작은 단위로 개발**: 기능별 단계적 구현
2. **테스트 주도 개발**: 기능 구현 전 테스트 케이스 고민
3. **코드 리뷰 습관**: 자기 코드 재검토의 중요성
4. **문서화**: 코드만큼 중요한 문서 작성

#### Git 워크플로우
```bash
feature/auth-login     # 기능별 브랜치 생성
  ↓
개발 & 커밋
  ↓
Pull Request
  ↓
코드 리뷰 (셀프)
  ↓
main 브랜치 병합
```

### 7.4 소프트 스킬

#### 문제 해결 능력
- 에러 메시지 분석 및 디버깅 스킬 향상
- 공식 문서 읽기의 중요성 체감
- 커뮤니티(Stack Overflow, GitHub Issues) 활용

#### 프로젝트 관리
- 기능 우선순위 결정 (MVP 접근)
- 완벽보다 완성을 우선
- 점진적 개선 (Iterative Development)

---

## 📈 성장 지표

### 개발 전
- React Native 경험: 0%
- Supabase 경험: 0%
- TypeScript 숙련도: 초급
- 모바일 앱 개발: 0개

### 개발 후
- React Native 경험: 중급
- Supabase 경험: 중급
- TypeScript 숙련도: 중급
- 완성한 모바일 앱: 1개 (iOS/Android/Web)

---

## 🎓 다음 학습 목표

### 단기 (1-2개월)
- [ ] React Query 마스터
- [ ] 고급 애니메이션 (Reanimated 2)
- [ ] E2E 테스트 (Detox)
- [ ] 상태 관리 라이브러리 (Zustand/Redux)

### 중기 (3-6개월)
- [ ] CI/CD 파이프라인 구축
- [ ] 앱 스토어 배포 경험
- [ ] 성능 프로파일링 및 최적화
- [ ] 마이크로 프론트엔드 아키텍처

### 장기 (6개월 이상)
- [ ] 오픈소스 기여
- [ ] 기술 블로그 운영
- [ ] 컨퍼런스 발표
- [ ] React Native 라이브러리 개발

---

<div align="center">

**"배우고, 만들고, 공유하자"**

이 문서는 Mooday 프로젝트를 통해 학습한 모든 내용을 정리한 기술 문서입니다.

</div>
