<div align="center">

# 📅 Mooday

### Your Personal Schedule Management App

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.30-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Development](#-development)

</div>

---

## 🎯 Project Overview

**Mooday** is a modern, cross-platform schedule management application built with React Native and Expo. It provides a seamless experience across iOS, Android, and Web platforms with real-time data synchronization powered by Supabase.

### Why Mooday?

- 🚀 **Fast & Responsive**: Built with React Native for native performance
- 🔄 **Real-time Sync**: Supabase backend ensures data is always up-to-date
- 🎨 **Beautiful UI**: Modern, intuitive interface with dark mode support
- 🔐 **Secure**: Built-in authentication and row-level security
- 📱 **Cross-Platform**: One codebase, three platforms (iOS, Android, Web)

---

## ✨ Features

### Current Features

<table>
<tr>
<td width="50%">

#### 🔐 Authentication
- Email/Password registration
- Secure login/logout
- Session management
- User-specific data isolation

</td>
<td width="50%">

#### 📅 Schedule Management
- Create new schedules
- View all schedules (date-sorted)
- Personal schedule ownership
- Real-time data updates

</td>
</tr>
<tr>
<td width="50%">

#### 🎨 UI/UX
- Tab-based navigation
- Responsive design
- Automatic dark mode
- Smooth animations
- Haptic feedback

</td>
<td width="50%">

#### 🛠 Developer Experience
- TypeScript for type safety
- File-based routing with Expo Router
- ESLint code quality checks
- Hot reloading for fast development

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Frontend

```
React Native 0.81.5
├── Expo 54.0.30 (Development Framework)
├── TypeScript 5.9.2 (Type Safety)
├── Expo Router 6.0.21 (Navigation)
├── React Navigation (Bottom Tabs)
├── React Native Reanimated 4.1.1 (Animations)
└── Expo Haptics (Haptic Feedback)
```

### Backend & Database

```
Supabase
├── PostgreSQL (Database)
├── Supabase Auth (Authentication)
├── Real-time Subscriptions
├── RESTful API
└── Row Level Security (RLS)
```

### Development Tools

```
Development Environment
├── ESLint 9.25.0 (Linting)
├── Expo Dev Tools (Debugging)
├── TypeScript Compiler (Type Checking)
└── Git (Version Control)
```

---

## 🏗 Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)            │
├─────────────────────────────────────────────────────────┤
│  Presentation Layer                                      │
│  ├── app/ (Expo Router Screens)                         │
│  │   ├── (tabs)/ - Tab Navigation                       │
│  │   │   ├── index.tsx - Home Screen                    │
│  │   │   └── explore.tsx - Explore Screen               │
│  │   └── login.tsx - Authentication Screen              │
│  │                                                        │
│  └── components/ (Reusable UI Components)               │
│      ├── themed-text.tsx                                │
│      ├── themed-view.tsx                                │
│      └── ui/ - UI Component Library                     │
├─────────────────────────────────────────────────────────┤
│  Business Logic Layer                                    │
│  └── src/screens/                                        │
│      ├── HomeScreen.tsx - Schedule Management Logic     │
│      └── LoginScreen.tsx - Auth Logic                   │
├─────────────────────────────────────────────────────────┤
│  Data Access Layer                                       │
│  └── src/lib/                                            │
│      └── supabase.ts - Supabase Client Configuration    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                      │
├─────────────────────────────────────────────────────────┤
│  Authentication (Supabase Auth)                          │
│  ├── Email/Password Authentication                       │
│  ├── Session Management                                  │
│  └── User Identity                                       │
├─────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                   │
│  └── schedules Table                                     │
│      ├── id (UUID, Primary Key)                         │
│      ├── title (TEXT)                                   │
│      ├── start_date (TIMESTAMP)                         │
│      ├── end_date (TIMESTAMP)                           │
│      ├── owner_type (TEXT)                              │
│      └── owner_user_id (UUID, Foreign Key)             │
├─────────────────────────────────────────────────────────┤
│  Security (Row Level Security)                           │
│  └── User-specific data access policies                 │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → React Component → Business Logic → Supabase API
                    ↓                                  ↓
              Local State Update ← Response ← Database Query
                    ↓
              UI Re-render
```

---

## 📁 Project Structure

```
mooday/
│
├── 📱 app/                      # Expo Router - File-based Routing
│   ├── (tabs)/                 # Tab Navigation Group
│   │   ├── _layout.tsx        # Tab Bar Configuration
│   │   ├── index.tsx          # 🏠 Home Screen (Schedule List)
│   │   └── explore.tsx        # 🔍 Explore Screen
│   │
│   ├── _layout.tsx            # 🌐 Root Layout (Global Setup)
│   ├── login.tsx              # 🔐 Login Screen Entry
│   └── modal.tsx              # 📋 Modal Screens
│
├── 🎯 src/
│   ├── lib/
│   │   └── supabase.ts        # ⚙️ Supabase Client Setup
│   │
│   └── screens/               # 📲 Screen Components
│       ├── HomeScreen.tsx     # Home Screen Logic
│       └── LoginScreen.tsx    # Authentication Logic
│
├── 🧩 components/              # Reusable UI Components
│   ├── ui/                    # Base UI Components
│   │   ├── collapsible.tsx
│   │   └── icon-symbol.tsx
│   │
│   ├── themed-text.tsx        # Themed Text Component
│   ├── themed-view.tsx        # Themed View Component
│   ├── parallax-scroll-view.tsx
│   └── ...
│
├── 🎨 assets/                  # Static Resources
│   ├── images/                # App Icons & Images
│   └── fonts/                 # Custom Fonts
│
├── 🔧 constants/               # App Constants
├── 🪝 hooks/                   # Custom React Hooks
├── 📜 scripts/                 # Utility Scripts
│
├── 📄 Configuration Files
│   ├── package.json           # Dependencies & Scripts
│   ├── tsconfig.json          # TypeScript Configuration
│   ├── app.json               # Expo Configuration
│   └── eslint.config.js       # ESLint Rules
│
└── 📚 Documentation
    ├── README.md              # Standard Documentation
    ├── PORTFOLIO.md           # Portfolio Documentation
    └── README_ENHANCED.md     # Enhanced Documentation (This File)
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control
- **Expo CLI** - `npm install -g expo-cli`

**For Platform-Specific Development:**
- **iOS**: Xcode (Mac only) or iOS Simulator
- **Android**: Android Studio & Android Emulator
- **Web**: Modern web browser

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/mooday.git
cd mooday
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Configure Supabase**

Create a Supabase project at [supabase.com](https://supabase.com) and update `src/lib/supabase.ts`:

```typescript
const SUPABASE_URL = 'your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

4. **Set up database**

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  owner_type TEXT NOT NULL DEFAULT 'PERSONAL',
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their schedules
CREATE POLICY "Users can view their own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = owner_user_id);

-- Create policy for users to insert their schedules
CREATE POLICY "Users can insert their own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);
```

### Running the App

#### Start Development Server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

#### Run on Specific Platform

```bash
# iOS (Mac only)
npm run ios

# Android
npm run android

# Web
npm run web
```

#### Using Expo Go App

1. Install **Expo Go** on your mobile device
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from the terminal or Expo Dev Tools

---

## 💻 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator (Mac only)
npm run web        # Run in web browser
npm run lint       # Run ESLint
```

### Code Style

This project uses **ESLint** for code quality. Run linting with:

```bash
npm run lint
```

### TypeScript

Type checking is enforced with TypeScript. Configure types in `tsconfig.json`.

### Project Conventions

- **Components**: PascalCase (e.g., `HomeScreen.tsx`)
- **Files**: kebab-case for utilities (e.g., `supabase.ts`)
- **Types**: PascalCase interfaces/types
- **Constants**: UPPER_SNAKE_CASE

---

## 🔐 Authentication Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ├─── Sign Up (email/password)
       │         ↓
       │    Supabase Auth
       │         ↓
       │    Create User Account
       │         ↓
       │    Return Session Token
       │         ↓
       │    Redirect to Home
       │
       └─── Sign In (email/password)
                 ↓
            Supabase Auth
                 ↓
            Verify Credentials
                 ↓
            Return Session Token
                 ↓
            Redirect to Home
```

---

## 📊 Database Schema

### schedules Table

| Column           | Type                     | Description                |
|------------------|--------------------------|----------------------------|
| `id`             | UUID                     | Primary Key                |
| `title`          | TEXT                     | Schedule title             |
| `start_date`     | TIMESTAMP WITH TIME ZONE | Start date and time        |
| `end_date`       | TIMESTAMP WITH TIME ZONE | End date and time          |
| `owner_type`     | TEXT                     | Type of owner (PERSONAL)   |
| `owner_user_id`  | UUID                     | Foreign Key to auth.users  |
| `created_at`     | TIMESTAMP WITH TIME ZONE | Creation timestamp         |
| `updated_at`     | TIMESTAMP WITH TIME ZONE | Last update timestamp      |

### Relationships

- `owner_user_id` → `auth.users.id` (CASCADE DELETE)

---

## 🧪 API Examples

### Fetch All Schedules

```typescript
const { data, error } = await supabase
  .from('schedules')
  .select('*')
  .order('start_date', { ascending: true });
```

### Create Schedule

```typescript
const { error } = await supabase
  .from('schedules')
  .insert({
    title: 'Meeting',
    start_date: '2024-02-16T10:00:00Z',
    end_date: '2024-02-16T11:00:00Z',
    owner_type: 'PERSONAL',
    owner_user_id: user.id,
  });
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## 🎯 Roadmap

### Phase 1: Core Features (Current)
- [x] User authentication
- [x] Create schedules
- [x] View schedules
- [x] Tab navigation

### Phase 2: Enhanced Features
- [ ] Update/Delete schedules
- [ ] Calendar view
- [ ] Schedule categories
- [ ] Search & filter
- [ ] Dark theme customization

### Phase 3: Advanced Features
- [ ] Push notifications
- [ ] Recurring schedules
- [ ] Schedule sharing
- [ ] Collaboration features
- [ ] Export to calendar apps

### Phase 4: Polish & Scale
- [ ] Performance optimization
- [ ] Offline mode
- [ ] Unit & E2E tests
- [ ] CI/CD pipeline
- [ ] Analytics integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is for portfolio purposes.

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development framework
- **Supabase Team** - For the powerful backend platform
- **React Native Community** - For continuous support and packages

---

## 📧 Contact

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- Email: your.email@example.com
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

---

<div align="center">

**⭐ If you like this project, please give it a star! ⭐**

Made with ❤️ and React Native

[Report Bug](https://github.com/yourusername/mooday/issues) · [Request Feature](https://github.com/yourusername/mooday/issues)

</div>
