<!-- b9c038ac-d1a6-453b-b48a-4abefd7913f0 ba87a293-6b46-4837-8481-087404ac3183 -->
# Fitness Carrot - Full-Stack Next.js Application

## Phase 1: Project Foundation & Configuration

### 1.1 Initialize Next.js Project

- Create Next.js 15+ project with TypeScript, Tailwind CSS, App Router
- Configure `next.config.mjs` with image domains and env variables
- Set up `tsconfig.json` with path aliases (`@/`)
- Install core dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`

### 1.2 Project Structure Setup

Create professional folder structure following SOLID principles:

```
src/
├── app/
│   ├── (public)/          # Public routes (marketing, landing)
│   ├── (client)/          # Authenticated user routes
│   ├── (admin)/           # Admin panel routes
│   ├── api/               # API route handlers
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── features/          # Feature-specific components
│   └── layouts/           # Layout components
├── lib/
│   ├── server/
│   │   ├── db/           # Prisma client & schemas
│   │   ├── services/     # Business logic layer
│   │   └── actions/      # Global server actions
│   ├── client/
│   │   └── hooks/        # Client-side hooks (useIsMobile, etc.)
│   ├── shared/
│   │   ├── schemas/      # Zod validation schemas
│   │   └── utils/        # Shared utilities
│   └── types/            # TypeScript types
├── hooks/                 # Global React hooks
├── providers/             # Context providers
└── styles/               # Global styles
```

### 1.3 Database & Prisma Setup

- Install Prisma: `prisma`, `@prisma/client`
- Initialize Prisma with PostgreSQL
- Create Prisma singleton pattern in `src/lib/server/db/prisma.ts`
- Define initial schema models:
  - User (with role: USER, TRAINER, ADMIN)
  - Profile (fitness goals, measurements)
  - Workout, Exercise, WorkoutLog
  - Meal, MealPlan, NutritionLog
  - TrainerClient (trainer-client relationships)
  - Subscription, Product (marketplace)
- Run migrations and generate Prisma client

## Phase 2: Authentication & Authorization

### 2.1 NextAuth.js v5 Configuration

- Install: `next-auth@beta`, `@auth/prisma-adapter`
- Create `auth.ts` and `auth.config.ts` (edge-compatible)
- Configure Prisma adapter for database sessions
- Set up Credentials provider with bcrypt password hashing
- Implement JWT strategy with role-based claims
- Add session/jwt callbacks to include user role and id
- Create API route: `app/api/auth/[...nextauth]/route.ts`

### 2.2 Middleware & Route Protection

- Create `middleware.ts` for route protection
- Implement role-based access control (RBAC):
  - `/dashboard/*` → authenticated users only
  - `/admin/*` → admin role only
  - `/trainer/*` → trainer/admin roles
- Add authorized callback in `auth.config.ts`
- Create server-side auth helpers in layouts for double-layer security

### 2.3 Auth UI Components

- Login page: `app/(public)/login/page.tsx`
- Register page with role selection: `app/(public)/register/page.tsx`
- Logout functionality with server actions
- Password reset flow (optional for MVP)

## Phase 3: UI Foundation & Layouts

### 3.1 shadcn/ui Installation

- Initialize shadcn/ui with Tailwind configuration
- Install core components: `button`, `card`, `input`, `form`, `dialog`, `dropdown-menu`, `avatar`, `badge`, `table`, `tabs`, `select`, `calendar`, `chart`
- Configure theme colors for Fitness Carrot branding
- Set up dark mode support with theme provider

### 3.2 Responsive Design Infrastructure

- Create `useIsMobile()` hook in `src/lib/client/hooks/useIsMobile.ts`
- Create `useBreakpoint()` hook for granular control
- Set up Tailwind breakpoint utilities
- Implement combination strategy: conditional rendering for major layout shifts, CSS for minor adjustments

### 3.3 Three Layout System with Route Groups

**Public Layout** - `app/(public)/layout.tsx`:

- Marketing header with logo, navigation, CTA buttons
- Hero sections, features showcase
- Footer with links, social media
- Routes: `/`, `/about`, `/features`, `/pricing`, `/login`, `/register`

**Client/User Layout** - `app/(client)/layout.tsx`:

- Dashboard sidebar with navigation (Dashboard, Workouts, Nutrition, Progress, Profile)
- Top navbar with user avatar, notifications, settings
- Mobile: Bottom navigation bar + hamburger menu
- Routes: `/dashboard`, `/workouts`, `/nutrition`, `/progress`, `/profile`, `/trainer` (if applicable)

**Admin Layout** - `app/(admin)/layout.tsx`:

- Admin sidebar (Users, Trainers, Content, Subscriptions, Analytics)
- Admin header with impersonation banner
- Full-width data tables and analytics
- Routes: `/admin/users`, `/admin/trainers`, `/admin/products`, `/admin/analytics`

### 3.4 Shared Layout Components

- `components/layouts/PublicHeader.tsx`
- `components/layouts/PublicFooter.tsx`
- `components/layouts/DashboardSidebar.tsx` (adaptive: full on desktop, drawer on mobile)
- `components/layouts/DashboardNav.tsx`
- `components/layouts/AdminSidebar.tsx`
- `components/layouts/MobileNav.tsx` (bottom nav for mobile)

## Phase 4: Core Features - Workout Tracking

### 4.1 Workout Management

- **Workout Library** - `app/(client)/workouts/page.tsx`:
  - Browse workout templates (Server Component with fetch)
  - Filter by muscle group, difficulty, equipment
  - Create custom workouts (Client Component form)
- **Workout Detail** - `app/(client)/workouts/[id]/page.tsx`:
  - Display exercises with sets/reps
  - Start workout session button
  - Edit/delete workout (with role check)

### 4.2 Workout Logging

- Active workout session component with timer
- Log sets, reps, weight for each exercise
- Rest timer between sets
- Complete workout and save to database
- Server Actions: `createWorkout`, `logWorkout`, `updateWorkoutLog`
- Use `revalidatePath('/workouts')` after mutations

### 4.3 Exercise Database

- Pre-populated exercise library (seed data)
- Exercise details: name, description, muscle groups, equipment
- Video/image thumbnails (if available)
- Admin can add/edit exercises

## Phase 5: Nutrition Planning

### 5.1 Meal Planning System

- **Meal Plans** - `app/(client)/nutrition/page.tsx`:
  - View daily meal plan
  - Calorie and macro tracking (protein, carbs, fats)
  - Add meals from database or custom
- **Meal Database** - browseable, searchable
- **Nutrition Log** - daily food diary
- Charts showing calorie/macro trends over time

### 5.2 Nutrition Server Layer

- Service layer: `lib/server/services/nutritionService.ts`
- Actions: `createMealPlan`, `logMeal`, `calculateMacros`
- Zod schemas: `mealSchema`, `nutritionLogSchema`
- Prisma queries with proper relations

## Phase 6: Trainer-Client Management

### 6.1 Trainer Dashboard

- **Trainer Routes** - `app/(client)/trainer/page.tsx`:
  - List of assigned clients
  - Client progress overview
  - Assign workouts/meal plans to clients
  - Messaging system (basic)

### 6.2 Client Assignment Flow

- Trainers can invite clients (send invitation code/link)
- Clients can request trainer assignment
- Admin can manage trainer-client relationships
- Role-based component rendering: show trainer features only if `user.role === 'TRAINER'`

### 6.3 Progress Tracking for Trainers

- View client workout logs
- View client nutrition logs
- Body measurement tracking over time
- Progress photos (upload to cloud storage)

## Phase 7: Marketplace & Subscriptions

### 7.1 Product Catalog

- **Products Page** - `app/(public)/products/page.tsx`:
  - Browse workout programs, meal plans, coaching packages
  - Product cards with pricing, description
  - Server Component with tagged fetch for caching
- **Product Detail** - `app/(public)/products/[id]/page.tsx`:
  - Full product description, reviews
  - Purchase button → checkout flow

### 7.2 Subscription Management

- User subscription status in database
- Check subscription in middleware/layouts
- Restrict premium features based on subscription
- Admin panel to manage subscriptions: `app/(admin)/subscriptions/page.tsx`

### 7.3 Payment Integration (Placeholder)

- Set up Stripe or payment provider integration structure
- Checkout page with server actions
- Webhook handler for payment confirmation
- Update user subscription status after successful payment

## Phase 8: Progress & Analytics

### 8.1 User Progress Dashboard

- **Progress Page** - `app/(client)/progress/page.tsx`:
  - Weight/body measurement charts (using recharts or Chart.js)
  - Workout volume over time
  - Nutrition adherence graphs
  - Personal records (PRs) for exercises

### 8.2 Data Visualization

- Install charting library: `recharts` or `chart.js` with `react-chartjs-2`
- Create reusable chart components in `components/features/charts/`
- Server-side data aggregation in service layer
- Client-side interactive charts

### 8.3 Admin Analytics

- **Admin Dashboard** - `app/(admin)/page.tsx`:
  - User growth metrics
  - Revenue tracking (subscriptions)
  - Most popular workouts/meals
  - Trainer performance metrics

## Phase 9: Advanced Features & Polish

### 9.1 Search & Filtering

- Global search for workouts, exercises, meals
- Advanced filtering with URL search params
- Server-side filtering and pagination
- Use `useSearchParams` for client-side state management

### 9.2 Notifications System

- Basic in-app notifications (new workout assigned, subscription expiring)
- Notification component in dashboard header
- Mark as read functionality
- Prisma Notification model

### 9.3 User Profile & Settings

- **Profile Page** - `app/(client)/profile/page.tsx`:
  - Edit personal info, fitness goals
  - Upload profile picture
  - Change password
  - Subscription management
- Form validation with react-hook-form + Zod
- Server action: `updateProfile`

### 9.4 Responsive Testing & Optimization

- Test all layouts on mobile (375px), tablet (768px), desktop (1024px+)
- Optimize images with Next.js Image component
- Implement loading skeletons for better UX
- Add error boundaries and error pages
- Performance audit with Lighthouse

## Phase 10: Caching, Security & Deployment

### 10.1 Caching Strategy

- Tag all workout fetches with `['workouts']`
- Tag nutrition data with `['meals', 'nutrition']`
- Use `revalidateTag` in mutations
- Implement ISR for public product pages
- Configure proper cache headers

### 10.2 Security Hardening

- Environment variables validation with Zod
- CSRF protection (built into NextAuth)
- Rate limiting for API routes (optional)
- Input sanitization for user-generated content
- SQL injection prevention (Prisma handles this)

### 10.3 Testing Setup

- Install testing libraries: `vitest`, `@testing-library/react`
- Unit tests for utility functions
- Integration tests for server actions
- E2E tests for critical flows (optional)

### 10.4 Deployment Preparation

- Create `README.md` with setup instructions
- Document environment variables in `.env.example`
- Set up Vercel/deployment configuration
- Database migration strategy for production
- Seed script for initial data

## Key Architecture Decisions

**SOLID Principles Applied:**

- **SRP**: RSC for data fetching, Client Components for interactivity, Service layer for business logic
- **OCP**: Component composition with `children` prop, layouts extensible through route groups
- **LSP**: Consistent prop interfaces across similar components
- **ISP**: Focused context providers (AuthContext, ThemeContext), not monolithic AppContext
- **DIP**: Components depend on hooks (abstractions), not direct implementations

**Performance Optimizations:**

- Server Components by default, strategic `'use client'` only on interactive leaves
- Tagged caching with domain-driven `revalidateTag` strategy
- Image optimization with Next.js Image
- Code splitting via dynamic imports for heavy components
- Database query optimization with Prisma select/include

**Responsive Strategy:**

- Major layout changes: `useIsMobile()` hook with conditional rendering (sidebar → bottom nav)
- Minor adjustments: Tailwind breakpoint classes (`hidden md:block`, `grid-cols-1 md:grid-cols-3`)
- Touch-friendly UI on mobile (larger buttons, bottom sheets instead of dropups)

### To-dos

- [ ] Initialize Next.js 15+ project with TypeScript, Tailwind, and configure project structure
- [ ] Set up Prisma with PostgreSQL, create schema models, and implement singleton pattern
- [ ] Configure NextAuth.js v5 with Prisma adapter, JWT strategy, and role-based claims
- [ ] Create middleware for route protection and RBAC (public/client/admin)
- [ ] Initialize shadcn/ui, install core components, and configure theme
- [ ] Create three layout systems using Route Groups with responsive design
- [ ] Implement useIsMobile and useBreakpoint hooks for adaptive rendering
- [ ] Build login/register pages with forms and validation
- [ ] Implement workout tracking system (library, logging, sessions)
- [ ] Build nutrition planning and meal logging features
- [ ] Create trainer-client management system with assignment flows
- [ ] Implement product catalog and subscription management
- [ ] Build progress tracking dashboard with charts and admin analytics
- [ ] Create user profile and settings pages with update functionality
- [ ] Implement tagged caching strategy with revalidation
- [ ] Test and optimize all layouts across mobile, tablet, and desktop
- [ ] Create documentation, seed scripts, and prepare for deployment