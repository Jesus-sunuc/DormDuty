This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### API (Backend)
```bash
# Run API server locally (from project root)
docker-compose up

# Or run API directly (from api directory)
cd api
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000

# Database setup
docker-compose up db  # Start PostgreSQL container
# Database schema is auto-created via init.sql
```

### Client (Mobile App)
```bash
cd client

# Development server
npm run dev              # Dev client mode
npm start               # Standard Expo start
npm run android         # Android emulator
npm run ios            # iOS simulator
npm run web            # Web browser

# Code quality
npm run lint           # ESLint
```

## Architecture Overview

### Project Structure
- **`api/`**: FastAPI Python backend with PostgreSQL
- **`client/`**: React Native mobile app with Expo
- **`docker-compose.yml`**: Local development environment
- **`init.sql`**: Database schema and initial setup

### Backend Architecture (FastAPI)

**Core Pattern**: Repository → Router → FastAPI
- **`src/main.py`**: FastAPI app entry point with all router includes
- **`src/models/`**: Pydantic models for request/response data
- **`src/repository/`**: Data access layer with raw SQL queries
- **`src/router/`**: FastAPI routers grouping related endpoints
- **`src/services/database/helper.py`**: Database connection pool and query executor

**Key Components:**
- Database connection via `psycopg_pool.ConnectionPool`
- `run_sql()` function handles all database queries with optional Pydantic model mapping
- Environment-based configuration (dev/preview/prod)
- Firebase Authentication integration via `fb_uid` fields

**Database Schema:**
- Multi-tenant architecture: Users → Rooms → Memberships → Features
- Core entities: users, rooms, room_membership, chores, expenses, announcements
- All tables use PostgreSQL with proper foreign key relationships

### Frontend Architecture (React Native + Expo)

**Navigation**: Expo Router with file-based routing in `app/` directory
- **`app/(tabs)/`**: Main tab-based navigation
- **`app/index.tsx`**: Authentication redirect logic
- **`app/_layout.tsx`**: Root layout configuration

**State Management:**
- **TanStack React Query**: Server state management and caching
- **Firebase Auth**: User authentication context
- **React Navigation**: Navigation state

**Key Patterns:**
- **Custom hooks** in `hooks/` for API calls and business logic
- **Repository pattern** mirrored on frontend via React Query hooks
- **Component composition** with reusable UI components

**Styling**: NativeWind (Tailwind CSS for React Native) with dark mode support

## Development Environment

### Environment Configuration
- **API**: Uses `.env.dev`, `.env.preview`, `.env.prod` files
- **Database**: PostgreSQL 17 via Docker with connection pooling
- **Authentication**: Firebase Auth with `fb_uid` as primary identifier

### Database Operations
- All queries use raw SQL via the `run_sql()` helper function
- Connection pooling handled automatically
- Schema migrations handled via `init.sql` on container startup

### API Endpoints Structure
All API routes prefixed with `/api/`:
- `/users` - User management and authentication
- `/rooms` - Apartment/room management  
- `/membership` - Room membership and permissions
- `/chores` - Chore assignment and completion
- `/expenses` - Expense tracking and splitting
- `/announcements` - Communication features

### Mobile App Development
- Uses Expo development client for faster iteration
- File-based routing matches backend API structure
- TypeScript throughout with strict type checking
- Real-time updates via React Query's automatic refetching

## Authentication Flow
1. Firebase handles user authentication
2. Backend receives `fb_uid` from client
3. User record created/updated in PostgreSQL
4. Room membership determines feature access
5. All API calls include user context via Firebase ID tokens

## Key Business Logic
- **Room Isolation**: All data scoped to room membership
- **Chore Scheduling**: Complex frequency patterns (daily/weekly/monthly/custom)  
- **Expense Splitting**: Automatic calculation among selected members
- **Permission System**: Room admins vs regular members
- **Photo Verification**: Optional chore completion proof
