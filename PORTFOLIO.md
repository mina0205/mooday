# 📅 Mooday - 개인 일정 관리 애플리케이션

<div align="center">

![Mooday](./assets/images/icon.png)

**React Native + Expo + Supabase 기반 크로스플랫폼 일정 관리 앱**

[🇰🇷 한국어](#korean) | [🇺🇸 English](#english)

</div>

---

<a name="korean"></a>

## 🇰🇷 한국어

### 📖 프로젝트 개요

**Mooday**는 사용자의 일정을 효율적으로 관리할 수 있는 크로스플랫폼 모바일 애플리케이션입니다. React Native와 Expo를 활용하여 iOS, Android, Web 모두에서 동작하며, Supabase를 백엔드로 사용하여 실시간 데이터 동기화와 사용자 인증을 구현했습니다.

### 🎯 프로젝트 목적

- 사용자 친화적인 일정 관리 인터페이스 제공
- 실시간 데이터 동기화를 통한 원활한 사용자 경험
- 크로스플랫폼 지원으로 다양한 디바이스에서 접근 가능
- 안전한 사용자 인증 및 데이터 보안

### 🛠 기술 스택

#### Frontend
- **React Native** (v0.81.5): 크로스플랫폼 모바일 개발
- **Expo** (v54.0.30): 빠른 개발 및 배포 환경
- **TypeScript** (v5.9.2): 타입 안정성 및 코드 품질 향상
- **Expo Router** (v6.0.21): 파일 기반 라우팅 시스템
- **React Navigation**: 네비게이션 관리

#### Backend & Database
- **Supabase**: 
  - PostgreSQL 데이터베이스
  - 실시간 구독 기능
  - 사용자 인증 (Auth)
  - RESTful API

#### UI/UX
- **React Native Reanimated** (v4.1.1): 부드러운 애니메이션
- **Expo Haptics**: 햅틱 피드백
- **Safe Area Context**: 안전 영역 처리
- **Gesture Handler**: 제스처 인식

#### Development Tools
- **ESLint**: 코드 품질 관리
- **Expo Dev Tools**: 개발 환경 최적화

### ✨ 주요 기능

#### 1. 사용자 인증
- ✅ 이메일/비밀번호 기반 회원가입
- ✅ 로그인/로그아웃 기능
- ✅ Supabase Auth를 통한 안전한 세션 관리
- ✅ 사용자별 데이터 격리

#### 2. 일정 관리
- ✅ 일정 생성 (Create)
- ✅ 일정 조회 (Read) - 날짜순 정렬
- ✅ 개인 일정 소유권 관리
- ✅ 실시간 데이터 동기화

#### 3. UI/UX
- ✅ 탭 기반 네비게이션
- ✅ 반응형 디자인
- ✅ 다크모드 지원 (자동)
- ✅ 직관적인 사용자 인터페이스

### 📁 프로젝트 구조

```
mooday/
├── app/                          # Expo Router 기반 화면 구조
│   ├── (tabs)/                   # 탭 네비게이션
│   │   ├── _layout.tsx          # 탭 레이아웃 설정
│   │   ├── index.tsx            # 홈 화면 (일정 목록)
│   │   └── explore.tsx          # 탐색 화면
│   ├── _layout.tsx              # 루트 레이아웃
│   ├── login.tsx                # 로그인 화면 진입점
│   └── modal.tsx                # 모달 화면
│
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase 클라이언트 설정
│   └── screens/
│       ├── HomeScreen.tsx       # 홈 화면 로직
│       └── LoginScreen.tsx      # 로그인/회원가입 화면
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                      # UI 컴포넌트
│   ├── themed-text.tsx          # 테마 적용 텍스트
│   ├── themed-view.tsx          # 테마 적용 뷰
│   └── ...
│
├── assets/                       # 이미지, 폰트 등 정적 자원
├── constants/                    # 상수 정의
├── hooks/                        # 커스텀 훅
└── scripts/                      # 유틸리티 스크립트
```

### 🗄 데이터베이스 스키마

#### schedules 테이블
```sql
- id: UUID (Primary Key)
- title: TEXT (일정 제목)
- start_date: TIMESTAMP (시작 시간)
- end_date: TIMESTAMP (종료 시간)
- owner_type: TEXT (소유 타입: PERSONAL)
- owner_user_id: UUID (사용자 ID, Foreign Key)
- created_at: TIMESTAMP (생성 시간)
- updated_at: TIMESTAMP (수정 시간)
```

### 💡 핵심 구현 내용

#### 1. Supabase 통합
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
);
```

#### 2. 사용자 인증 구현
- `signUp`: 이메일/비밀번호 회원가입
- `signIn`: 로그인 처리
- `getUser`: 현재 로그인 사용자 정보 조회

#### 3. 일정 CRUD 구현
```typescript
// 일정 조회
const { data, error } = await supabase
  .from('schedules')
  .select('*')
  .order('start_date', { ascending: true });

// 일정 추가
const { error } = await supabase
  .from('schedules')
  .insert({
    title: '테스트 일정',
    start_date: now,
    end_date: now,
    owner_type: 'PERSONAL',
    owner_user_id: user.id,
  });
```

#### 4. 타입 안정성
```typescript
type Schedule = {
  id: string;
  title: string;
  start_date: string;
};
```

### 🚀 설치 및 실행 방법

#### 사전 요구사항
- Node.js (v18 이상)
- npm 또는 yarn
- Expo CLI
- iOS Simulator (Mac) 또는 Android Emulator

#### 설치
```bash
# 저장소 클론
git clone [repository-url]
cd mooday

# 의존성 설치
npm install
```

#### 개발 서버 실행
```bash
# Expo 개발 서버 시작
npm start

# 또는 특정 플랫폼 실행
npm run ios      # iOS 시뮬레이터
npm run android  # Android 에뮬레이터
npm run web      # 웹 브라우저
```

#### 환경 변수 설정
Supabase 프로젝트 정보를 `src/lib/supabase.ts`에 설정:
```typescript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 🔍 개발 과정 및 문제 해결

#### 1. 크로스플랫폼 호환성
**문제**: iOS, Android, Web에서 일관된 UI/UX 제공의 어려움  
**해결**: 
- React Native의 플랫폼별 스타일링 활용
- `expo-symbols`를 통한 네이티브 아이콘 지원
- Safe Area Context로 각 플랫폼의 안전 영역 처리

#### 2. 상태 관리 및 데이터 동기화
**문제**: 로컬 상태와 서버 데이터의 동기화  
**해결**:
- `useEffect`를 활용한 컴포넌트 마운트 시 데이터 페칭
- 일정 추가 후 즉시 `fetchSchedules()` 호출로 UI 업데이트

#### 3. 사용자 인증 흐름
**문제**: 로그인 상태 관리 및 보안  
**해결**:
- Supabase Auth의 세션 기반 인증 활용
- `getUser()`로 현재 로그인 사용자 확인
- Row Level Security (RLS)를 통한 데이터 접근 제어

#### 4. TypeScript 타입 안정성
**문제**: 동적 데이터의 타입 정의  
**해결**:
- Supabase 스키마에 맞는 타입 정의
- `Schedule` 타입으로 데이터 구조 명확화

### 📊 성과 및 배운 점

#### 기술적 성과
- ✅ React Native 생태계에 대한 깊은 이해
- ✅ Supabase BaaS 플랫폼 활용 경험
- ✅ TypeScript를 활용한 타입 안전한 코드 작성
- ✅ Expo Router의 파일 기반 라우팅 시스템 이해
- ✅ 크로스플랫폼 개발 경험

#### 소프트 스킬
- 사용자 중심 UI/UX 설계
- 데이터베이스 스키마 설계 경험
- RESTful API 통합 경험
- 문제 해결 및 디버깅 능력 향상

### 🎯 향후 개선 계획

#### 기능 추가
- [ ] 일정 수정/삭제 기능 (Update/Delete)
- [ ] 일정 카테고리 및 태그 시스템
- [ ] 캘린더 뷰 구현
- [ ] 일정 알림 기능 (Push Notification)
- [ ] 반복 일정 설정
- [ ] 일정 공유 기능
- [ ] 검색 및 필터링

#### UI/UX 개선
- [ ] 커스텀 디자인 시스템 구축
- [ ] 애니메이션 효과 강화
- [ ] 접근성(Accessibility) 개선
- [ ] 오프라인 모드 지원

#### 기술적 개선
- [ ] React Query 도입으로 서버 상태 관리 개선
- [ ] Zustand/Redux를 통한 전역 상태 관리
- [ ] Unit/Integration 테스트 작성
- [ ] CI/CD 파이프라인 구축
- [ ] 성능 최적화 (메모이제이션, lazy loading)
- [ ] Error Boundary 추가

#### 보안 강화
- [ ] 환경 변수 관리 개선 (.env 파일 사용)
- [ ] OAuth 소셜 로그인 추가
- [ ] 비밀번호 재설정 기능

### 📞 연락처

프로젝트에 대한 문의나 피드백은 언제든 환영합니다!

---

<a name="english"></a>

## 🇺🇸 English

### 📖 Project Overview

**Mooday** is a cross-platform mobile application for efficient schedule management. Built with React Native and Expo, it works seamlessly across iOS, Android, and Web platforms. The app uses Supabase as its backend to implement real-time data synchronization and user authentication.

### 🎯 Project Purpose

- Provide user-friendly schedule management interface
- Seamless user experience through real-time data synchronization
- Cross-platform support for various device access
- Secure user authentication and data protection

### 🛠 Tech Stack

#### Frontend
- **React Native** (v0.81.5): Cross-platform mobile development
- **Expo** (v54.0.30): Fast development and deployment environment
- **TypeScript** (v5.9.2): Type safety and code quality
- **Expo Router** (v6.0.21): File-based routing system
- **React Navigation**: Navigation management

#### Backend & Database
- **Supabase**: 
  - PostgreSQL database
  - Real-time subscriptions
  - User authentication (Auth)
  - RESTful API

#### UI/UX
- **React Native Reanimated** (v4.1.1): Smooth animations
- **Expo Haptics**: Haptic feedback
- **Safe Area Context**: Safe area handling
- **Gesture Handler**: Gesture recognition

#### Development Tools
- **ESLint**: Code quality management
- **Expo Dev Tools**: Development environment optimization

### ✨ Key Features

#### 1. User Authentication
- ✅ Email/Password-based registration
- ✅ Login/Logout functionality
- ✅ Secure session management via Supabase Auth
- ✅ User-specific data isolation

#### 2. Schedule Management
- ✅ Create schedules
- ✅ Read schedules - sorted by date
- ✅ Personal schedule ownership management
- ✅ Real-time data synchronization

#### 3. UI/UX
- ✅ Tab-based navigation
- ✅ Responsive design
- ✅ Dark mode support (automatic)
- ✅ Intuitive user interface

### 📁 Project Structure

```
mooday/
├── app/                          # Expo Router screen structure
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── index.tsx            # Home screen (schedule list)
│   │   └── explore.tsx          # Explore screen
│   ├── _layout.tsx              # Root layout
│   ├── login.tsx                # Login screen entry
│   └── modal.tsx                # Modal screen
│
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client setup
│   └── screens/
│       ├── HomeScreen.tsx       # Home screen logic
│       └── LoginScreen.tsx      # Login/Signup screen
│
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   ├── themed-text.tsx          # Themed text
│   ├── themed-view.tsx          # Themed view
│   └── ...
│
├── assets/                       # Static resources
├── constants/                    # Constants
├── hooks/                        # Custom hooks
└── scripts/                      # Utility scripts
```

### 🗄 Database Schema

#### schedules Table
```sql
- id: UUID (Primary Key)
- title: TEXT (Schedule title)
- start_date: TIMESTAMP (Start time)
- end_date: TIMESTAMP (End time)
- owner_type: TEXT (Owner type: PERSONAL)
- owner_user_id: UUID (User ID, Foreign Key)
- created_at: TIMESTAMP (Created time)
- updated_at: TIMESTAMP (Updated time)
```

### 💡 Core Implementation

#### 1. Supabase Integration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
);
```

#### 2. User Authentication Implementation
- `signUp`: Email/Password registration
- `signIn`: Login processing
- `getUser`: Retrieve current logged-in user info

#### 3. Schedule CRUD Implementation
```typescript
// Fetch schedules
const { data, error } = await supabase
  .from('schedules')
  .select('*')
  .order('start_date', { ascending: true });

// Add schedule
const { error } = await supabase
  .from('schedules')
  .insert({
    title: 'Test Schedule',
    start_date: now,
    end_date: now,
    owner_type: 'PERSONAL',
    owner_user_id: user.id,
  });
```

#### 4. Type Safety
```typescript
type Schedule = {
  id: string;
  title: string;
  start_date: string;
};
```

### 🚀 Installation & Execution

#### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

#### Installation
```bash
# Clone repository
git clone [repository-url]
cd mooday

# Install dependencies
npm install
```

#### Run Development Server
```bash
# Start Expo development server
npm start

# Or run specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

#### Environment Variable Setup
Configure Supabase project info in `src/lib/supabase.ts`:
```typescript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 🔍 Development Process & Problem Solving

#### 1. Cross-Platform Compatibility
**Problem**: Difficulty providing consistent UI/UX across iOS, Android, and Web  
**Solution**: 
- Platform-specific styling in React Native
- Native icon support via `expo-symbols`
- Safe Area handling for each platform with Safe Area Context

#### 2. State Management & Data Synchronization
**Problem**: Synchronization between local state and server data  
**Solution**:
- Data fetching on component mount using `useEffect`
- Immediate UI update via `fetchSchedules()` after schedule creation

#### 3. User Authentication Flow
**Problem**: Login state management and security  
**Solution**:
- Session-based authentication with Supabase Auth
- Current user verification with `getUser()`
- Data access control via Row Level Security (RLS)

#### 4. TypeScript Type Safety
**Problem**: Type definition for dynamic data  
**Solution**:
- Type definitions matching Supabase schema
- Clear data structure with `Schedule` type

### 📊 Achievements & Learnings

#### Technical Achievements
- ✅ Deep understanding of React Native ecosystem
- ✅ Supabase BaaS platform experience
- ✅ Type-safe coding with TypeScript
- ✅ Understanding of Expo Router's file-based routing
- ✅ Cross-platform development experience

#### Soft Skills
- User-centric UI/UX design
- Database schema design experience
- RESTful API integration experience
- Improved problem-solving and debugging skills

### 🎯 Future Improvements

#### Feature Additions
- [ ] Update/Delete schedule functionality
- [ ] Schedule categories and tag system
- [ ] Calendar view implementation
- [ ] Schedule notifications (Push Notifications)
- [ ] Recurring schedule settings
- [ ] Schedule sharing functionality
- [ ] Search and filtering

#### UI/UX Improvements
- [ ] Custom design system
- [ ] Enhanced animation effects
- [ ] Accessibility improvements
- [ ] Offline mode support

#### Technical Improvements
- [ ] React Query for improved server state management
- [ ] Global state management with Zustand/Redux
- [ ] Unit/Integration testing
- [ ] CI/CD pipeline setup
- [ ] Performance optimization (memoization, lazy loading)
- [ ] Error Boundary implementation

#### Security Enhancements
- [ ] Improved environment variable management (.env files)
- [ ] OAuth social login
- [ ] Password reset functionality

### 📞 Contact

Questions or feedback about the project are always welcome!

---

<div align="center">

**Made with ❤️ using React Native & Expo**

</div>
