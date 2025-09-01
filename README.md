
# DormDuty

> A modern roommate management platform that simplifies shared living through smart chore scheduling, expense tracking, and seamless communication.

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?logo=react)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)

## 🏠 Overview

DormDuty transforms the chaos of shared living into an organized, harmonious experience. Whether you're managing a dorm, apartment, or house with roommates, DormDuty provides the tools you need to coordinate responsibilities, track expenses, and maintain clear communication.

### ✨ Key Features

- **📋 Smart Chore Management**: Automated scheduling with customizable frequencies (daily, weekly, monthly, or custom patterns)
- **💰 Expense Tracking & Splitting**: Automatic calculation and fair distribution of shared costs
- **📢 Real-time Announcements**: Stay connected with your roommates through integrated messaging
- **📱 Cross-platform Mobile App**: Native experience on iOS and Android with web support
- **🔐 Secure Authentication**: Firebase-powered user management with room-based permissions
- **📊 Activity Tracking**: Monitor completion rates and maintain accountability
- **📸 Photo Verification**: Optional proof of chore completion

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **Docker** & Docker Compose
- **Expo CLI** for mobile development

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DormDuty
   ```

2. **Start the backend services**
   ```bash
   docker-compose up
   ```

3. **Set up the mobile client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Access the application**
   - API Documentation: http://localhost:8000/docs
   - Mobile App: Use Expo Go app to scan the QR code

## 🏗️ Architecture

### 📱 Frontend (React Native + Expo)
- **Framework**: React Native 0.79.5 with Expo 53
- **Navigation**: File-based routing with Expo Router
- **State Management**: TanStack React Query for server state
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Authentication**: Firebase Auth integration
- **UI Components**: React Native Paper with custom theming

### ⚡ Backend (FastAPI + PostgreSQL)
- **API Framework**: FastAPI 0.115.12 with automatic OpenAPI documentation
- **Database**: PostgreSQL 17 with connection pooling
- **Architecture**: Repository pattern with clean separation of concerns
- **Authentication**: Firebase token validation
- **Data Validation**: Pydantic models for type safety

### 🔧 Key Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| **Mobile** | React Native + Expo | Cross-platform mobile development |
| **Backend** | FastAPI + Python | High-performance API development |
| **Database** | PostgreSQL | Reliable data persistence |
| **Authentication** | Firebase Auth | Secure user management |
| **State Management** | TanStack React Query | Efficient server state synchronization |
| **Styling** | NativeWind | Utility-first mobile styling |
| **DevOps** | Docker Compose | Containerized development environment |

## 📊 Project Structure

```
DormDuty/
├── api/                    # FastAPI Python backend
│   ├── src/
│   │   ├── main.py        # Application entry point
│   │   ├── models/        # Pydantic data models
│   │   ├── repository/    # Database access layer
│   │   ├── router/        # API route handlers
│   │   └── services/      # Business logic & utilities
│   └── requirements.txt   # Python dependencies
├── client/                # React Native mobile app
│   ├── app/              # File-based routing (Expo Router)
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   └── package.json     # Node.js dependencies
├── docker-compose.yml   # Development environment
└── init.sql            # Database schema & seed data
```

## 🌟 Core Features Deep Dive

### Room Management
- Multi-tenant architecture with secure room isolation
- Admin and member permission systems
- Invite-based membership with join codes

### Chore Scheduling
- Flexible scheduling patterns (daily, weekly, monthly, custom)
- Automatic task rotation among roommates
- Progress tracking with completion history
- Optional photo verification for accountability

### Expense Management
- Smart expense splitting among selected members
- Category-based organization
- Receipt attachment support
- Automatic calculation and balance tracking

### Communication
- Room-wide announcements
- Real-time notifications
- Activity feeds and updates

## 🛠️ Development Commands

### Backend (API)
```bash
# Start full development environment
docker-compose up

# Run API directly (requires PostgreSQL running)
cd api
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

# Database setup
docker-compose up db  # PostgreSQL container only
```

### Frontend (Mobile Client)
```bash
cd client

# Development modes
npm run dev         # Development client
npm start          # Standard Expo start
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web browser

# Code quality
npm run lint       # ESLint
```

## 🔒 Security & Privacy

- **Firebase Authentication**: Industry-standard user authentication
- **Room-based Access Control**: Data isolation between different living spaces
- **API Security**: Token-based authentication for all endpoints
- **Data Privacy**: User data is scoped to their specific rooms only

## 🚀 Deployment

The application is designed for easy deployment with Docker:

```bash
# Production build
docker-compose -f docker-compose.prod.yml up
```

Environment configuration supports development, preview, and production stages with appropriate database and authentication settings.

## 📱 Mobile Platform Support

- **iOS**: Native iOS app via Expo
- **Android**: Native Android app via Expo  
- **Web**: Progressive Web App support
- **Development**: Hot reload with Expo development client

## 🤝 Contributing

We welcome contributions! This project follows modern development practices:

- **TypeScript**: Strict type checking throughout
- **ESLint**: Code quality and consistency
- **Component Architecture**: Reusable, composable UI components
- **API-First Design**: Well-documented REST API with OpenAPI specs

## 📄 License

[License information to be added]

## 🔗 Links

- **API Documentation**: Available at `/docs` when running locally
- **Firebase Console**: [Project-specific Firebase dashboard]
- **Development Guide**: See `CLAUDE.md` for detailed development instructions

---
