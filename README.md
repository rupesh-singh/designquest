# 🔍 DesignQuest

> **Master System Design Through Investigation** - An immersive, gamified platform where you learn system design by solving real-world incidents and outages.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

## 📖 Overview

DesignQuest is an investigation-themed learning platform inspired by [sqlpd.com](https://sqlpd.com) where you become a system design detective. You learn through:
- **Incident-driven scenarios** (e.g., "Servers are crashing, users are screaming!")
- **Investigation-style questions** with multiple formats
- **Agent progression system** (XP, ranks, streaks, cases solved)
- **Immediate feedback** with detailed explanations

## 🎨 Design Theme

The platform uses a **dark, suspenseful investigation theme**:
- **Color Palette**: Deep blacks with amber/gold accents
  - Header: `#0f1318` (dark charcoal with blue-gray tint)
  - Background: Gradient from `#0a0a0a` → `#111111` → `#0a0a0a` (spotlight effect)
  - Cards: `#141414` / `#181818`
  - Accent: Amber-600 (muted gold)
  - Success: Emerald-600
  - Alert: Red-600
- **Terminology**: Cases, Investigations, Incidents, Agent Dossier, Case Files
- **Agent Ranks**: Junior Agent → Field Agent → Lead Detective → Senior Investigator → Chief Architect

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Visit **http://localhost:3000**

## 📁 Project Structure

```
DesignQuest/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # Authentication endpoints
│   │   │   │   ├── login/        # POST /api/auth/login
│   │   │   │   ├── signup/       # POST /api/auth/signup
│   │   │   │   ├── logout/       # POST /api/auth/logout
│   │   │   │   └── me/           # GET /api/auth/me
│   │   │   ├── modules/          # Learning modules
│   │   │   │   ├── route.ts      # GET /api/modules (list all)
│   │   │   │   └── [slug]/       # GET /api/modules/:slug
│   │   │   ├── lessons/          
│   │   │   │   └── [slug]/       # GET /api/lessons/:slug
│   │   │   └── progress/         # User progress
│   │   │       ├── submit/       # POST - submit answer
│   │   │       └── complete/     # POST - complete lesson
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── dashboard/            # User dashboard
│   │   ├── learn/                # Learning paths
│   │   │   ├── page.tsx          # All modules view
│   │   │   ├── [slug]/           # Module detail (lessons list)
│   │   │   │   └── [lessonSlug]/ # Lesson view (questions)
│   │   ├── profile/              # Agent profile & stats
│   │   ├── layout.tsx            # Root layout with Navbar & gradient bg
│   │   ├── page.tsx              # Landing page (investigation theme)
│   │   └── globals.css           # Global styles (dark theme)
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx        # Button with variants & loading
│   │   │   ├── Input.tsx         # Form input with label/error
│   │   │   ├── Card.tsx          # Card, CardHeader, CardContent, CardFooter
│   │   │   └── ProgressBar.tsx   # Animated progress bar
│   │   ├── layout/
│   │   │   └── Navbar.tsx        # Navigation with auth state
│   │   ├── lessons/
│   │   │   ├── QuestionCard.tsx      # Multiple choice & trade-off questions
│   │   │   ├── TextInputQuestion.tsx # Free-text answer questions
│   │   │   └── ModuleCard.tsx        # Module display card
│   │   └── gamification/
│   │       └── XPDisplay.tsx     # XP, level, streak display
│   │
│   ├── lib/                      # Utility functions
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── auth.ts               # Auth utilities (server-side)
│   │   ├── xp.ts                 # XP/level calculations (client-safe)
│   │   ├── evaluation.ts         # Answer evaluation logic
│   │   └── utils.ts              # General utilities (cn function)
│   │
│   ├── store/
│   │   └── authStore.ts          # Zustand auth state management
│   │
│   └── types/
│       └── index.ts              # TypeScript type definitions
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Sample content seeder
│
├── dev.db                        # SQLite database (gitignored)
│
├── .env                          # Environment variables
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## 🗄️ Database Schema

```prisma
model User {
  id            String    @id
  username      String    @unique
  passwordHash  String
  displayName   String?
  xpPoints      Int       @default(0)
  level         Int       @default(1)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)
  lastActiveAt  DateTime?
  progress      UserProgress[]
  badges        UserBadge[]
}

model Module {
  id          String   @id
  title       String
  slug        String   @unique
  description String
  difficulty  String   # beginner | intermediate | advanced
  orderIndex  Int
  icon        String   # Emoji
  colorTheme  String   # Hex color
  lessons     Lesson[]
}

model Lesson {
  id           String   @id
  moduleId     String
  title        String
  slug         String   @unique
  storyContent String   # The narrative/scenario
  orderIndex   Int
  xpReward     Int
  questions    Question[]
  progress     UserProgress[]
}

model Question {
  id            String   @id
  lessonId      String
  type          String   # multiple_choice | trade_off | multi_select | text_input
  scenarioText  String
  options       String   # JSON array of options
  correctAnswer String   # JSON (string or array)
  explanation   String
  hints         String?  # JSON array
  xpValue       Int
  orderIndex    Int
}

model UserProgress {
  userId      String
  lessonId    String
  completed   Boolean
  score       Int
  attempts    Int
  xpEarned    Int
  completedAt DateTime?
  @@unique([userId, lessonId])
}

model Badge {
  id          String
  name        String   @unique
  description String
  icon        String
  criteria    String   # JSON
  xpBonus     Int
  users       UserBadge[]
}

model UserBadge {
  userId    String
  badgeId   String
  earnedAt  DateTime
  @@unique([userId, badgeId])
}
```

## 🎮 Question Types & Evaluation

### 1. Multiple Choice (`multiple_choice`)
- Single correct answer
- Binary scoring (correct/incorrect)

### 2. Trade-off (`trade_off`)
- Multiple answers with different scores (0-100)
- Rewards "good" answers, not just "perfect" ones
- Shows why each option is rated

### 3. Multi-Select (`multi_select`)
- Multiple correct answers
- Partial credit scoring
- Penalty for wrong selections

### 4. Text Input (`text_input`)
- Free-form text answers
- **Keyword-based evaluation** (current implementation)
- Checks for concepts mentioned
- Partial credit based on coverage

#### Text Input Evaluation Structure
```typescript
interface ConceptKeywords {
  concept: string;      // e.g., "caching"
  keywords: string[];   // ["cache", "redis", "memcached"]
  weight: number;       // Points for this concept
  required: boolean;    // Must mention for passing
}
```

## 🔐 Authentication Flow

1. **Signup**: `POST /api/auth/signup`
   - Creates user with hashed password (bcryptjs)
   - Sets HTTP-only JWT cookie (7 days)

2. **Login**: `POST /api/auth/login`
   - Verifies password
   - Updates streak
   - Sets JWT cookie

3. **Auth Check**: `GET /api/auth/me`
   - Validates JWT from cookie
   - Returns user data

4. **Logout**: `POST /api/auth/logout`
   - Clears auth cookie

## 📊 Gamification System

### XP & Levels
- XP earned from answering questions and completing lessons
- Level formula: Progressive XP requirements
  - Level 2: 100 XP
  - Level 3: 250 XP (100 + 150)
  - Level 4: 475 XP (250 + 225)
  - Each level needs 1.5x more XP than previous

### Streaks
- Daily login tracking
- Consecutive days increase streak
- Missing a day resets streak
- Longest streak saved for bragging rights

### Badges (Schema ready, implementation TODO)
- First Steps: Complete first lesson
- Cache Master: Complete caching module
- Week Warrior: 7-day streak
- Perfect Score: 100% on any lesson

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
npm run db:seed      # Seed sample content
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset DB and re-seed
```

## 🌍 Environment Variables

```env
# .env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
```

---

# 📋 Development Phases

## ✅ Phase 1: MVP (COMPLETED)

### Features Implemented
- [x] User authentication (signup/login/logout)
- [x] Learning modules with lessons
- [x] Question types: multiple_choice, trade_off, multi_select, text_input
- [x] Keyword-based text evaluation
- [x] XP and level system
- [x] Streak tracking
- [x] Progress saving per lesson
- [x] Responsive UI with Tailwind
- [x] **Dark investigation theme** with layered depth
- [x] **Profile page** with agent dossier, stats, and case progress
- [x] **Cases solved tracking** in header and profile
- [x] Sample content (3 modules, 4 lessons)

### Sample Content
1. **Caching Fundamentals** (beginner)
   - Introduction to Caching (4 questions)
   - Cache Invalidation Strategies (2 questions)
2. **Load Balancing** (beginner)
   - Load Balancing Basics (2 questions)
3. **Database Scaling** (intermediate)
   - SQL vs NoSQL (2 questions)

---

## 🔮 Phase 2: Enhanced Learning (TODO)

### Content Expansion
- [ ] Add more modules:
  - Message Queues (Kafka, RabbitMQ)
  - Rate Limiting & Throttling
  - Microservices Architecture
  - API Design (REST, GraphQL, gRPC)
  - CDN & Edge Computing
- [ ] Add more lessons per module (5-7 each)
- [ ] Add "Real-World Systems" module:
  - Design Twitter
  - Design Uber
  - Design Netflix
  - Design WhatsApp

### Question Improvements
- [ ] Add diagram-based questions (React Flow)
- [ ] Component matching (drag & drop)
- [ ] Architecture builder (visual)
- [ ] Add more hints per question

### Evaluation Improvements
- [ ] Semantic similarity matching for text input
- [ ] Rubric-based scoring
- [ ] LLM-powered evaluation for complex answers (optional)

### Files to Modify
- `prisma/seed.ts` - Add more content
- `src/lib/evaluation.ts` - Enhanced evaluation logic
- `src/components/lessons/` - New question components

---

## 🔮 Phase 3: Gamification & Social (TODO)

### Badges System
- [ ] Implement badge earning logic
- [ ] Badge display on profile
- [ ] Badge notifications
- [ ] Files: Create `src/lib/badges.ts`, update `src/app/api/badges/`

### Profile Page Enhancements
- [x] ~~User stats display~~ ✅ Implemented
- [x] ~~Completed modules/lessons~~ ✅ Implemented
- [ ] Badge showcase
- [ ] Learning history timeline
- [ ] Customizable agent avatar

### Leaderboard
- [ ] Global XP leaderboard
- [ ] Weekly leaderboard
- [ ] Friends leaderboard
- [ ] Files: `src/app/leaderboard/page.tsx`, `src/app/api/leaderboard/`

### Social Features
- [ ] Share progress on social media
- [ ] Invite friends
- [ ] Study groups (future)

---

## 🔮 Phase 4: Interview Prep Mode (TODO)

### Mock Interview
- [ ] Timed design challenges
- [ ] Random question selection
- [ ] Interview scoring rubric
- [ ] Files: `src/app/interview/page.tsx`

### Design Review
- [ ] Submit your design for feedback
- [ ] Community reviews
- [ ] Expert reviews (premium)

### Company-Specific Prep
- [ ] Filter by company (Google, Amazon, Meta, etc.)
- [ ] Company-specific question banks
- [ ] Interview tips per company

---

## 🔮 Phase 5: Advanced Features (TODO)

### Interactive Diagrams
- [ ] Drag-and-drop architecture builder
- [ ] Real-time diagram validation
- [ ] Save/share designs
- [ ] Tech: React Flow, custom nodes
- [ ] Files: `src/components/diagrams/`

### AI Integration
- [ ] LLM-powered feedback on text answers
- [ ] Personalized learning path suggestions
- [ ] AI tutor chatbot
- [ ] Tech: OpenAI API or similar

### Mobile App
- [ ] React Native version
- [ ] Offline mode
- [ ] Push notifications

### Premium Features
- [ ] Payment integration (Stripe)
- [ ] Premium content
- [ ] Certificates
- [ ] Files: `src/app/api/payments/`, `src/app/pricing/`

---

## 🧪 Testing Strategy (TODO)

### Unit Tests
- [ ] Evaluation functions (`src/lib/evaluation.ts`)
- [ ] XP calculations (`src/lib/xp.ts`)
- [ ] Auth utilities (`src/lib/auth.ts`)
- [ ] Tech: Jest, React Testing Library

### Integration Tests
- [ ] API routes
- [ ] Auth flow
- [ ] Progress tracking

### E2E Tests
- [ ] User signup → complete lesson flow
- [ ] Tech: Playwright or Cypress

---

## 📝 Content Creation Guide

### Adding a New Module

1. Add to `prisma/seed.ts`:
```typescript
const newModule = await prisma.module.create({
  data: {
    title: 'Module Title',
    slug: 'module-slug',
    description: 'Description here',
    difficulty: 'beginner', // or intermediate, advanced
    orderIndex: 4, // Next available index
    icon: '🔧', // Emoji
    colorTheme: '#3B82F6', // Hex color
    lessons: {
      create: [
        // Lessons here
      ],
    },
  },
});
```

### Adding a New Lesson

```typescript
{
  title: 'Lesson Title',
  slug: 'lesson-slug',
  storyContent: `📧 SCENARIO TEXT HERE...
  
Make it engaging and story-driven!`,
  orderIndex: 1,
  xpReward: 50,
  questions: {
    create: [
      // Questions here
    ],
  },
}
```

### Adding Questions

#### Multiple Choice
```typescript
{
  type: 'multiple_choice',
  scenarioText: 'Question text here?',
  options: JSON.stringify([
    { id: 'a', text: 'Option A', feedback: 'Why this is wrong/right' },
    { id: 'b', text: 'Option B', feedback: '...' },
    { id: 'c', text: 'Option C', feedback: '...' },
    { id: 'd', text: 'Option D', feedback: '...' },
  ]),
  correctAnswer: JSON.stringify('b'),
  explanation: 'Detailed explanation...',
  hints: JSON.stringify(['Hint 1', 'Hint 2']),
  xpValue: 20,
  orderIndex: 1,
}
```

#### Trade-off (Weighted)
```typescript
{
  type: 'trade_off',
  scenarioText: 'Scenario with trade-offs...',
  options: JSON.stringify([
    { id: 'a', text: 'Option A', score: 40, feedback: 'Why score 40' },
    { id: 'b', text: 'Option B', score: 80, feedback: 'Why score 80' },
    { id: 'c', text: 'Option C', score: 100, feedback: 'Why best' },
  ]),
  correctAnswer: JSON.stringify('c'),
  explanation: 'Detailed explanation...',
  hints: JSON.stringify(['Hint']),
  xpValue: 25,
  orderIndex: 2,
}
```

#### Multi-Select
```typescript
{
  type: 'multi_select',
  scenarioText: 'Select ALL that apply...',
  options: JSON.stringify([
    { id: 'a', text: 'Option A', correct: true },
    { id: 'b', text: 'Option B', correct: true },
    { id: 'c', text: 'Option C', correct: false },
    { id: 'd', text: 'Option D', correct: true },
  ]),
  correctAnswer: JSON.stringify(['a', 'b', 'd']),
  explanation: 'Explanation...',
  hints: JSON.stringify(['Hint']),
  xpValue: 25,
  orderIndex: 3,
}
```

#### Text Input
```typescript
{
  type: 'text_input',
  scenarioText: 'Open-ended question...',
  options: JSON.stringify([
    // Concepts for keyword evaluation
    { concept: 'caching', keywords: ['cache', 'redis', 'memcached'], weight: 30, required: true },
    { concept: 'ttl', keywords: ['ttl', 'expire', 'expiration'], weight: 20, required: false },
  ]),
  correctAnswer: JSON.stringify(''), // Not used for text
  explanation: 'Model answer with all concepts...',
  hints: JSON.stringify(['Hint 1', 'Hint 2']),
  xpValue: 30,
  orderIndex: 4,
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## � Changelog

### v1.1.0 - Dark Investigation Theme (January 2026)

#### 🎨 UI/UX Overhaul
- **Dark theme** across entire site with layered depth effect
- **Investigation/detective theme** - users are "agents" solving "cases"
- **Color palette refinements**:
  - Header: Dark charcoal with blue-gray tint (`#0f1318`)
  - Background: Gradient spotlight effect (darker edges, lighter center)
  - Cards: Deep blacks (`#141414`, `#181818`)
  - Accents: Muted amber/emerald/red (600-level colors)
- **Header distinction**: Visually separated from background with contrasting color

#### 🆕 New Features
- **Profile page** (`/profile`): Agent dossier with stats, rank, XP progress, and case file progress
- **Agent rank system**: Junior Agent → Field Agent → Lead Detective → Senior Investigator → Chief Architect
- **Cases solved counter**: Displays in header and profile

#### 🐛 Bug Fixes
- Fixed solved count mismatch between header and dashboard
- Fixed Prisma query error in auth (separate count query)
- Fixed profile 404 error

#### 📁 Files Changed
- `src/components/layout/Navbar.tsx` - Dark header, cases solved display
- `src/app/layout.tsx` - Gradient background
- `src/app/profile/page.tsx` - New profile page
- `src/lib/auth.ts` - Fixed solved count query
- `src/store/authStore.ts` - Added solvedCount to user type
- `src/app/globals.css` - Updated CSS variables
- All page components - Removed explicit backgrounds for gradient inheritance

---

## �📄 License

MIT License - feel free to use this for learning!

---

## 🙏 Acknowledgments

- Inspired by [sqlpd.com](https://sqlpd.com)
- System design concepts from various engineering blogs
- Built with Next.js, Prisma, and Tailwind CSS
