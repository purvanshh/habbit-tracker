# Habit Tracker Backend Setup Guide

## 🚀 Quick Start

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available)

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and fill in project details
4. Wait for the project to be created (2-3 minutes)

#### Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `database/schema.sql`
3. Paste it into the SQL Editor and click **Run**
4. This will create all necessary tables, indexes, and security policies

### 3. Backend Configuration

#### Update Environment Variables

1. Open `server/.env` file
2. Replace the placeholder values:

```env
# Server Configuration
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Environment
NODE_ENV=development
```

#### Start the Server

```bash
cd server
npm install
npm run dev
```

You should see:

```
🚀 Habit Tracker API Server Started
📍 Port: 3000
🌍 Environment: development
📊 Health Check: http://localhost:3000/health
📚 API Base: http://localhost:3000/api
```

### 4. Test the Setup

#### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Habit Tracker API is running",
  "timestamp": "2026-01-21T07:34:27.866Z",
  "version": "1.0.0"
}
```

#### Test API Endpoints (will require authentication)

```bash
curl http://localhost:3000/api/habits
```

Without authentication, you should get:

```json
{
  "success": false,
  "message": "Authentication required",
  "message": "Please provide a valid Bearer token"
}
```

## 🔐 Authentication Setup

### Frontend Integration

To use the API from your React Native app:

1. **Install Supabase client in your frontend:**

   ```bash
   npm install @supabase/supabase-js
   ```

2. **Initialize Supabase client:**

   ```javascript
   import { createClient } from "@supabase/supabase-js";

   const supabase = createClient(
     "https://your-project-id.supabase.co",
     "your_anon_key_here",
   );
   ```

3. **Authenticate users:**

   ```javascript
   // Sign up
   const { data, error } = await supabase.auth.signUp({
     email: "user@example.com",
     password: "password123",
   });

   // Sign in
   const { data, error } = await supabase.auth.signInWithPassword({
     email: "user@example.com",
     password: "password123",
   });
   ```

4. **Make authenticated API calls:**

   ```javascript
   const {
     data: { session },
   } = await supabase.auth.getSession();

   if (session) {
     const response = await fetch("http://localhost:3000/api/habits", {
       headers: {
         Authorization: `Bearer ${session.access_token}`,
         "Content-Type": "application/json",
       },
     });
     const habits = await response.json();
   }
   ```

## 📱 Frontend Migration

### Replace SQLite with API Calls

Instead of using local SQLite, update your frontend to use the API:

```javascript
// OLD: Direct database calls
import { getHabits, addHabitToDB } from "../core/db";

// NEW: API calls
const apiClient = {
  baseURL: "http://localhost:3000/api",

  async getAuthToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  },

  async getHabits() {
    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async createHabit(habitData) {
    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/habits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(habitData),
    });
    return response.json();
  },

  async logHabit(habitId, status) {
    const token = await this.getAuthToken();
    const response = await fetch(`${this.baseURL}/logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ habitId, status }),
    });
    return response.json();
  },
};
```

### Update Your Store

Modify your Zustand store to use API calls instead of direct database operations:

```javascript
// In your useHabitStore.ts
const useHabitStore = create((set, get) => ({
  // ... existing state

  initialize: async () => {
    try {
      const response = await apiClient.getHabits();
      if (response.success) {
        set({ habits: response.data, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to initialize:", error);
      set({ isLoading: false });
    }
  },

  addHabit: async (name, icon, frequency, selectedDays, effort, timeWindow) => {
    const response = await apiClient.createHabit({
      name,
      icon,
      frequency,
      selectedDays,
      effortRating: effort,
      timeWindow,
    });

    if (response.success) {
      set({ habits: [...get().habits, response.data] });
    }
  },

  // ... update other methods similarly
}));
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Deploy to Railway/Render/Heroku

1. Push your code to GitHub
2. Connect your repository to your hosting platform
3. Set environment variables in the platform's dashboard
4. Deploy!

### Update CORS for Production

In `server/index.js`, update the CORS configuration:

```javascript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-app-domain.com"] // Your actual app domain
        : [
            "http://localhost:3000",
            "http://localhost:19006",
            "exp://localhost:19000",
          ],
    // ... rest of config
  }),
);
```

## 🔧 Troubleshooting

### Common Issues

1. **"Database service unavailable"**
   - Check your `.env` file has correct Supabase credentials
   - Ensure credentials don't start with "your\_"

2. **"Authentication required"**
   - Make sure you're sending the Bearer token in the Authorization header
   - Verify the token is valid and not expired

3. **"Habit not found"**
   - Ensure the habit belongs to the authenticated user
   - Check that the habit ID is correct

4. **CORS errors**
   - Update the CORS configuration in `server/index.js`
   - Add your frontend domain to the allowed origins

### Logs and Debugging

- Check server logs in the terminal where you ran `npm run dev`
- Use browser developer tools to inspect network requests
- Test API endpoints with curl or Postman

## 📞 Support

If you encounter issues:

1. Check the server logs for error messages
2. Verify your Supabase configuration
3. Test individual API endpoints with curl
4. Ensure your database schema is properly set up

---

**You're all set! Your habit tracker now has a robust, scalable backend! 🎉**
