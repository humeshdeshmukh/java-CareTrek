# CareTrek - Senior Care Mobile Application

## Project Overview
CareTrek is a cross-platform mobile application designed to connect seniors with their family members, providing health monitoring, emergency alerts, and location tracking. The app is built using React Native with Java Native Modules for cross-platform compatibility, ensuring native performance while maintaining a single codebase for both iOS and Android platforms.

## Technology Stack
### Cross-Platform Mobile Application
- **Framework**: React Native with Java Native Modules
- **Language**: JavaScript/TypeScript with Java/Swift for native modules
- **Minimum Requirements**:
  - Android: API 24 (Android 7.0)
  - iOS: iOS 13.0+
- **Architecture**: MVVM with Clean Architecture
- **UI Components**: React Native Paper + NativeBase
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6.x
- **Theming**: Styled Components with Theme Provider

### Native Modules (Java/Swift)
- **Android**: Java 11
- **iOS**: Swift 5.5+
- **Common Native Features**:
  - HealthKit/Google Fit Integration
  - Background Location Services
  - Emergency SOS with Hardware Buttons
  - Local Notifications

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (Email/Password, Social Logins)
- **API**: Auto-generated REST and GraphQL APIs
- **Real-time Subscriptions**: Built-in real-time functionality
- **Storage**: Secure file storage with access controls
- **Edge Functions**: Serverless functions in JavaScript/TypeScript
- **Pricing**: Generous free tier with pay-as-you-grow

## Core Features

### 1. User Authentication
- Email/password authentication
- Role-based access (Senior, Family Member, Admin)
- Secure session management with JWT
- Password reset functionality
- Social login (Google, Apple) - Future enhancement

### 2. Senior User Features

#### Health & Safety
- **One-tap SOS** with countdown and automatic location sharing
- **Health Metrics Dashboard**
  - Real-time heart rate monitoring
  - Blood oxygen (SpO2) levels
  - Blood pressure tracking (if supported by device)
  - Step count and activity tracking
  - Sleep quality analysis
- **Fall Detection** with automatic alerts to emergency contacts
- **Emergency Information** access from lock screen

#### Medication Management
- **Medication Reminders** with customizable schedules
- **Pill Identification** using camera
- **Refill Alerts** when medication is running low
- **Medication History** log
- **Missed Dose** notifications

#### Activity & Wellness
- **Daily Activity Tracking**
  - Steps walked
  - Active minutes
  - Distance covered
  - Calories burned
- **Exercise Programs** tailored for seniors
- **Hydration Tracker**
- **Mood Tracker**

#### Communication
- **Quick Call** to emergency contacts
- **Family Group Chat** with large text and voice message support
- **Check-in Notifications** to family members
- **Location Sharing** with family (real-time or scheduled)

#### Smartwatch Integration (FireBolt Watch)
- **Watch Connection Status**
- **Battery Level Monitoring**
- **Health Data Synchronization**
- **Watch Face Customization**
- **Haptic Feedback** for notifications

#### Voice Commands & Accessibility
- **Voice-Activated Controls**
  - "Call [Contact]"
  - "I need help"
  - "What's my next medication?"
  - "Check my heart rate"
- **Screen Reader** compatibility
- **High Contrast Mode**
- **Adjustable Text Sizes**
- **Simplified UI** option

#### Appointments & Reminders
- **Doctor Appointments** with reminders
- **Medication Schedule**
- **Family Visits** calendar
- **Therapy Sessions** tracking
- **Vaccination Reminders**

#### Emergency Features
- **Medical ID** with critical health information
- **Emergency Contacts** quick access
- **Auto-Alert** on fall detection
- **Location History** for emergencies
- **Emergency Mode** with simplified interface
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

### Cross-Platform Architecture
- **Cross-Platform Layer**:
  - Single codebase for iOS and Android
  - React Native for UI and business logic
  - Platform-agnostic components
  - Unified theming and styling

- **Native Bridge Layer**:
  - Java/Swift native modules
  - Platform-specific optimizations
  - Hardware integration
  - Performance-critical operations

- **State Management**:
  - Redux for global state
  - Context API for local state
  - AsyncStorage for persistence
  - Redux Persist for state hydration

### Backend Architecture (Supabase)
- **Database Layer**: PostgreSQL with Row Level Security
- **Auth Layer**: Built-in authentication with JWT
- **API Layer**: Auto-generated REST and GraphQL endpoints
- **Realtime Layer**: WebSocket-based subscriptions
- **Storage Layer**: Secure file storage with access controls
- **Edge Layer**: Serverless functions for custom logic
- **Monitoring**: Built-in logging and analytics

### Database Schema (Key Entities)
- **User** (Senior, Family Member, Admin)
- **Health Metrics**
- **Medication Reminders**
- **Locations**
- **Alerts & Notifications**
- **Messages**

## Development Phases

### Phase 1: Setup & Foundation (Week 1-2)
- [ ] Set up React Native project with TypeScript
- [ ] Configure Supabase project
- [ ] Set up authentication with Supabase Auth
- [ ] Design and implement database schema with RLS
- [ ] Set up development environment

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
#### Android Development
- Android Studio (Latest version)
- Java Development Kit (JDK) 11
- Android SDK (API 24+)
- Android Emulator or physical device

#### Backend Development
- Supabase account (https://supabase.com)
- PostgreSQL client (optional, for direct DB access)
- Node.js 16+ (for Supabase CLI and local development)

### Installation
#### Android App
```bash
# Clone the repository
git clone [repository-url]
cd CareTrek/android

# Open in Android Studio
# Sync project with Gradle files
# Build and run on emulator or device
```

#### Supabase Setup
1. Create a new project at https://supabase.com
2. Enable Email/Password authentication
3. Set up Row Level Security (RLS) policies
4. Configure your environment variables:

```env
# .env file
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Local Development (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start
```

## Next Steps
1. Set up Android development environment
2. Configure Spring Boot backend
3. Implement JWT authentication
4. Design database schema
5. Create API endpoints
6. Develop Android UI components
7. Implement real-time features

## Resources
### Android Development
- [Android Developer Documentation](https://developer.android.com/docs)
- [Material Design Guidelines](https://material.io/design)
- [Android Architecture Components](https://developer.android.com/topic/libraries/architecture)
- [Android Jetpack](https://developer.android.com/jetpack)

### Backend Development
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/installing)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo Vector Icons](https://icons.expo.fyi/)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/react-native)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [Postman](https://www.postman.com/) (API Testing)
- [Docker](https://www.docker.com/) (Containerization)
- [Git](https://git-scm.com/) (Version Control)

---
*Last Updated: November 9, 2025*
