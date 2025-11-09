# CareTrek - Senior Care Mobile Application

## Project Overview
CareTrek is a cross-platform mobile application designed to connect seniors with their family members, providing health monitoring, emergency alerts, and location tracking. The app will be developed using Java-based technologies to ensure cross-platform compatibility.

## Technology Stack
- **Framework**: React Native with Java Native Modules (for cross-platform development)
- **Backend**: Spring Boot (Java)
- **Database**: PostgreSQL with H2 for development
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSockets
- **Maps & Location**: Mapbox/Google Maps API
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **State Management**: Redux

## Core Features

### 1. User Authentication
- Role-based access (Senior, Family Member, Admin)
- Phone number verification (OTP)
- Secure login/logout
- Password reset functionality

### 2. Senior User Features
- One-tap SOS with countdown
- Health metrics dashboard
- Medication reminders
- Location sharing
- Simple, accessible interface
- Voice-guided navigation
- Emergency contacts

### 3. Family Member Features
- Real-time location tracking
- Health monitoring dashboard
- Emergency alerts and notifications
- Communication tools (chat, voice calls)
- Multiple senior management
- Activity history and reports

### 4. Admin Features
- User management
- System monitoring
- Reports and analytics
- Content management

## UI/UX Design

### Color Theme
- **Primary**: `#2F855A` (Deep green)
- **Primary Light**: `#48BB78` (Light green)
- **Accent**: `#E2B97C` (Warm beige)
- **Background**: `#FFFBEF` (Soft cream)
- **Surface**: `#FFFFFF` (White)
- **Text**: `#1A202C` (Dark gray/black)
- **Text Secondary**: `#4A5568` (Medium gray)

### Design Principles
- **Accessibility**: Large text, high contrast, voice support
- **Simplicity**: Intuitive navigation, minimal steps to complete actions
- **Consistency**: Uniform design language across all screens
- **Feedback**: Clear visual and haptic feedback for all actions

## Technical Architecture

### Frontend (React Native with Java Native Modules)
- **Components**: Reusable UI components
- **Navigation**: React Navigation
- **State Management**: Redux with Redux Toolkit
- **Native Modules**: Java for Android, Swift/Objective-C for iOS

### Backend (Spring Boot)
- **RESTful API**
- **WebSocket** for real-time updates
- **Security**: Spring Security with JWT
- **Database**: JPA/Hibernate for ORM

### Database Schema (Key Entities)
- **User** (Senior, Family Member, Admin)
- **Health Metrics**
- **Medication Reminders**
- **Locations**
- **Alerts & Notifications**
- **Messages**

## Development Phases

### Phase 1: Setup & Foundation (Week 1-2)
- [ ] Project setup and configuration
- [ ] Authentication system
- [ ] Basic UI components and theme
- [ ] Navigation structure

### Phase 2: Core Features (Week 3-6)
- [ ] Senior profile management
- [ ] Family member linking
- [ ] Basic health tracking
- [ ] Simple SOS functionality

### Phase 3: Advanced Features (Week 7-10)
- [ ] Real-time location tracking
- [ ] Medication reminders
- [ ] Voice-guided navigation
- [ ] Push notifications

### Phase 4: Polish & Testing (Week 11-12)
- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing

## Getting Started

### Prerequisites
- Node.js & npm
- Java Development Kit (JDK) 11+
- Android Studio / Xcode
- React Native CLI

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
cd CareTrek/mobile
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
cd ios
pod install
cd ..
npm run ios
```

## Next Steps
1. Set up the development environment
2. Create the initial project structure
3. Implement authentication flow
4. Develop core UI components
5. Integrate with backend services

## Resources
- [React Native Documentation](https://reactnative.dev/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Mapbox SDK](https://docs.mapbox.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

---
*Last Updated: November 9, 2025*
