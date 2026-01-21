# 🎯 Habit Tracker - Complete Full-Stack Application

A comprehensive habit tracking application built with React Native (Expo) frontend and Node.js backend, featuring advanced analytics, streak tracking, and intelligent habit management.

## 📱 **Frontend - React Native Mobile App**

### **🚀 Features**

- **Beautiful UI/UX**: Dark theme with smooth animations using Reanimated
- **Habit Management**: Create, edit, delete habits with custom icons and schedules
- **Smart Tracking**: Daily/weekly/custom frequency with skip allowances
- **Streak System**: Visual streak tracking with milestone celebrations
- **Analytics Dashboard**: Comprehensive statistics and progress visualization
- **Weekly Reports**: AI-driven insights and habit optimization suggestions
- **Calendar View**: Monthly completion visualization with color-coded status
- **Swipe Interactions**: Intuitive swipe-to-complete and skip gestures
- **Notifications**: Smart reminders and achievement notifications
- **Offline Support**: Local SQLite database with sync capabilities

### **🛠️ Tech Stack**

- **Framework**: React Native with Expo Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Database**: SQLite (local) + Supabase (cloud)
- **Styling**: NativeWind (Tailwind CSS)
- **Animations**: React Native Reanimated
- **Charts**: React Native Chart Kit
- **Navigation**: Expo Router (file-based routing)
- **Fonts**: Inter & Bebas Neue
- **Icons**: Expo Vector Icons

### **📁 Frontend Structure**

```
app/                    # File-based routing
├── _layout.tsx        # Root layout with providers
├── index.tsx          # Dashboard/home screen
├── create.tsx         # Create new habit
├── edit-habit.tsx     # Edit existing habit
├── calendar.tsx       # Monthly calendar view
├── report.tsx         # Statistics screen
├── weekly-report.tsx  # Weekly analytics
└── profile.tsx        # User profile

src/
├── components/        # Reusable UI components
│   ├── DotGrid.tsx   # Habit completion grid
│   ├── HabitCard.tsx # Individual habit display
│   ├── SwipeSlider.tsx # Swipe-to-complete
│   └── FloatingTabBar.tsx # Bottom navigation
├── core/             # Business logic
│   ├── types.ts      # TypeScript definitions
│   ├── db.ts         # Database operations
│   └── HabitEngine.ts # Analytics engine
├── store/            # State management
│   └── useHabitStore.ts # Zustand store
└── services/         # External services
    └── NotificationService.ts
```

## 🖥️ **Backend - Node.js API Server**

### **🚀 Features**

- **RESTful API**: Complete CRUD operations for habits and logs
- **Authentication**: JWT-based auth via Supabase
- **User Isolation**: Row Level Security ensuring data privacy
- **Analytics Engine**: Advanced reporting and insights generation
- **Skip Management**: Weekly skip limits and tracking
- **Habit Adjustments**: Automatic difficulty and frequency optimization
- **Calendar Data**: Monthly completion aggregation
- **Health Monitoring**: Server status and performance tracking

### **🛠️ Tech Stack**

- **Runtime**: Node.js with Express.js
- **Language**: JavaScript (ES6+)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (JWT)
- **Security**: Row Level Security, CORS, Input validation
- **Development**: Nodemon for hot reloading

### **📁 Backend Structure**

```
server/
├── config/           # Configuration files
│   └── supabase.js   # Database connection
├── controllers/      # Business logic
│   ├── habitController.js    # Habit CRUD operations
│   ├── logController.js      # Habit logging
│   └── analyticsController.js # Reports & stats
├── middleware/       # Express middleware
│   ├── auth.js       # Authentication
│   └── supabaseCheck.js # DB connection check
├── routes/           # API route definitions
│   ├── habits.js     # /api/habits routes
│   ├── logs.js       # /api/logs routes
│   └── analytics.js  # /api/analytics routes
├── utils/            # Helper functions
│   └── helpers.js    # Utility functions
├── database/         # Database schema
│   └── schema.sql    # PostgreSQL schema
├── .env.example      # Environment template
├── README.md         # API documentation
├── SETUP.md          # Setup instructions
└── index.js          # Server entry point
```

## 🗄️ **Database Schema**

### **Core Tables**

- **habits**: Habit definitions, settings, and metadata
- **habit_logs**: Completion, skip, and failure records
- **weekly_reports**: Generated analytics and insights
- **habit_adjustments**: Automatic optimization history

### **Key Features**

- Row Level Security for user data isolation
- Automatic timestamp management
- Optimized indexes for performance
- Data cleanup functions for maintenance

## 🔗 **API Endpoints**

### **Habits Management**

```
GET    /api/habits              # Get all user habits
POST   /api/habits              # Create new habit
GET    /api/habits/:id          # Get specific habit
PUT    /api/habits/:id          # Update habit
DELETE /api/habits/:id          # Delete habit
POST   /api/habits/:id/pause    # Pause habit
POST   /api/habits/:id/resume   # Resume habit
```

### **Habit Logging**

```
POST   /api/logs                # Log completion/failure
POST   /api/logs/skip           # Skip with limit check
GET    /api/logs                # Get all user logs
GET    /api/logs/habit/:id      # Get habit-specific logs
GET    /api/logs/habit/:id/today # Check today's status
GET    /api/logs/week           # Get week logs
```

### **Analytics & Reports**

```
GET    /api/analytics/dashboard      # Dashboard statistics
GET    /api/analytics/calendar       # Monthly calendar data
POST   /api/analytics/reports/generate # Generate weekly report
GET    /api/analytics/reports        # Get user reports
GET    /api/analytics/reports/latest # Get latest report
```

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js (v16+)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator
- Supabase account (free tier available)

### **Frontend Setup**

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

### **Backend Setup**

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Set up database schema in Supabase SQL Editor
# Copy and run contents of database/schema.sql

# Start development server
npm run dev
```

### **Supabase Setup**

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API to get your credentials
4. Run the SQL schema from `server/database/schema.sql`
5. Update your `.env` file with the credentials

## 🔄 **Frontend-Backend Integration**

### **Migration from Local to Cloud**

The app currently uses local SQLite. To integrate with the backend:

1. **Add Supabase client to frontend:**

```bash
npm install @supabase/supabase-js
```

2. **Replace database calls with API calls:**

```javascript
// OLD: Local SQLite
import { getHabits } from "../core/db";

// NEW: API calls
const apiClient = {
  async getHabits(token) {
    const response = await fetch("http://localhost:3000/api/habits", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
```

3. **Update Zustand store:**

```javascript
const useHabitStore = create((set) => ({
  initialize: async () => {
    const response = await apiClient.getHabits();
    if (response.success) {
      set({ habits: response.data });
    }
  },
}));
```

## 📊 **Key Features Deep Dive**

### **Smart Habit Management**

- **Flexible Scheduling**: Daily, weekly, or custom day patterns
- **Effort Rating**: 1-5 scale for difficulty tracking
- **Time Windows**: Morning, afternoon, evening, or anytime
- **Skip Allowances**: Weekly skip limits to maintain flexibility
- **Pause/Resume**: Temporary habit suspension

### **Advanced Analytics**

- **Streak Tracking**: Visual streak counters with milestone rewards
- **Success Rates**: Percentage-based completion tracking
- **Trend Analysis**: Improving, stable, or declining patterns
- **Risk Detection**: Automatic identification of at-risk habits
- **Weekly Reports**: Comprehensive insights and recommendations

### **Intelligent Optimization**

- **Automatic Adjustments**: AI-driven difficulty and frequency optimization
- **Time Window Analysis**: Best performance time identification
- **Habit Suggestions**: Personalized recommendations for improvement
- **Stability Scoring**: Habit consistency measurement

## 🎨 **Design System**

### **Color Palette**

- **Primary**: Indigo (#6366F1) and Purple (#A855F7)
- **Background**: Deep black (#0A0A0A) with dark grays
- **Success**: Emerald green for completions
- **Warning**: Amber for skips
- **Error**: Red for failures

### **Typography**

- **Headers**: Bebas Neue (bold, display)
- **Body**: Inter (regular and bold weights)
- **UI Elements**: System fonts with proper scaling

### **Animations**

- **Smooth Transitions**: 200-600ms duration
- **Spring Physics**: Natural feeling interactions
- **Stagger Effects**: Sequential element animations
- **Gesture Responses**: Immediate visual feedback

## 🔒 **Security & Privacy**

### **Authentication**

- JWT-based authentication via Supabase
- Secure token storage and refresh
- Session management and expiration

### **Data Protection**

- Row Level Security in database
- User data isolation
- Input validation and sanitization
- CORS protection for API endpoints

### **Privacy**

- Local-first approach with cloud sync
- No personal data collection beyond habits
- User-controlled data retention
- Secure data transmission (HTTPS)

## 🚀 **Deployment**

### **Frontend Deployment**

- **Expo Application Services (EAS)**: For app store deployment
- **Web Deployment**: Vercel, Netlify for web version
- **Over-the-Air Updates**: Instant app updates without store approval

### **Backend Deployment**

- **Railway/Render**: Easy Node.js hosting
- **Heroku**: Traditional PaaS deployment
- **Docker**: Containerized deployment
- **Environment Variables**: Secure configuration management

## 📈 **Performance Optimizations**

### **Frontend**

- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Compressed assets and caching
- **Animation Performance**: 60fps smooth animations
- **Memory Management**: Efficient state updates

### **Backend**

- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Caching**: Response caching for analytics
- **Error Handling**: Graceful failure management

## 🧪 **Testing Strategy**

### **Frontend Testing**

- **Unit Tests**: Component and utility testing
- **Integration Tests**: Store and API integration
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Animation and rendering

### **Backend Testing**

- **API Tests**: Endpoint functionality
- **Authentication Tests**: Security validation
- **Database Tests**: Data integrity
- **Load Tests**: Performance under stress

## 📚 **Documentation**

- **API Documentation**: Complete endpoint reference in `server/README.md`
- **Setup Guide**: Step-by-step instructions in `server/SETUP.md`
- **Component Docs**: Inline documentation for all components
- **Database Schema**: Complete schema documentation

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 **License**

This project is licensed under the ISC License.

## 🆘 **Support**

For issues and questions:

- Check the health endpoint: `http://localhost:3000/health`
- Review server logs for errors
- Verify Supabase configuration
- Test API endpoints with provided examples

---

**Built with ❤️ for better habit formation and personal growth! 🌱**
