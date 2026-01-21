# Habit Tracker API

A robust Node.js backend API for the Habit Tracker application, built with Express.js and Supabase for authentication and data storage.

## 🚀 Features

- **User Authentication**: JWT-based authentication via Supabase
- **Habit Management**: CRUD operations for habits with advanced features
- **Habit Logging**: Track completions, skips, and failures
- **Analytics & Reports**: Weekly reports and dashboard statistics
- **Calendar Integration**: Monthly completion data
- **Skip Management**: Weekly skip limits and tracking
- **Pause/Resume**: Temporarily pause habits
- **Row Level Security**: Data isolation per user

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. **Clone and navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase credentials:

   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=development
   ```

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `database/schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

## 🔗 API Endpoints

### Habits

#### GET /api/habits

Get all habits for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "habit_id",
      "name": "Morning Exercise",
      "icon": "barbell",
      "frequency": "daily",
      "selected_days": [1, 2, 3, 4, 5],
      "effort_rating": 3,
      "time_window": "morning",
      "streak": 5,
      "is_paused": false,
      "skips_used_this_week": 1,
      "max_skips_per_week": 2
    }
  ]
}
```

#### POST /api/habits

Create a new habit.

**Request Body:**

```json
{
  "name": "Read 10 pages",
  "icon": "book",
  "frequency": "daily",
  "selectedDays": [1, 2, 3, 4, 5],
  "effortRating": 2,
  "timeWindow": "evening"
}
```

#### PUT /api/habits/:id

Update an existing habit.

#### DELETE /api/habits/:id

Delete a habit and all associated logs.

#### POST /api/habits/:id/pause

Pause a habit for specified days.

**Request Body:**

```json
{
  "days": 3
}
```

#### POST /api/habits/:id/resume

Resume a paused habit.

### Habit Logs

#### POST /api/logs

Log a habit completion or failure.

**Request Body:**

```json
{
  "habitId": "habit_id",
  "status": "completed"
}
```

#### POST /api/logs/skip

Skip a habit (with weekly limit validation).

**Request Body:**

```json
{
  "habitId": "habit_id"
}
```

#### GET /api/logs

Get all logs for the user with optional filtering.

**Query Parameters:**

- `limit`: Number of logs to return (default: 100)
- `offset`: Pagination offset (default: 0)
- `startDate`: Filter logs from this date
- `endDate`: Filter logs until this date

#### GET /api/logs/habit/:habitId

Get logs for a specific habit.

#### GET /api/logs/habit/:habitId/today

Check if a habit is completed today.

#### GET /api/logs/week

Get logs for a specific week.

**Query Parameters:**

- `weekStart`: Week start timestamp
- `weekEnd`: Week end timestamp

### Analytics

#### GET /api/analytics/dashboard

Get dashboard statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalHabits": 5,
    "totalStreaks": 25,
    "maxStreak": 10,
    "weekCompletions": 15,
    "weekMissed": 3,
    "weekSuccessRate": 83
  }
}
```

#### POST /api/analytics/reports/generate

Generate a weekly report.

**Query Parameters:**

- `weekStart`: Optional week start timestamp
- `weekEnd`: Optional week end timestamp

#### GET /api/analytics/reports

Get user's weekly reports.

#### GET /api/analytics/reports/latest

Get the latest weekly report.

#### GET /api/analytics/calendar

Get calendar completion data for a specific month.

**Query Parameters:**

- `year`: Year (required)
- `month`: Month 1-12 (required)

## 🗄️ Database Schema

The API uses the following main tables:

- **habits**: Store habit definitions and settings
- **habit_logs**: Track habit completions, skips, and failures
- **weekly_reports**: Store generated analytics reports
- **habit_adjustments**: Track automatic habit adjustments

See `database/schema.sql` for the complete schema.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row Level Security**: Database-level data isolation
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Proper cross-origin request handling
- **Rate Limiting**: Built-in Express rate limiting

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests (to be implemented)

## 🤝 Integration with Frontend

The API is designed to work seamlessly with the existing React Native frontend. Key integration points:

1. **Authentication**: Use Supabase client on frontend to get JWT tokens
2. **API Calls**: Replace local SQLite calls with HTTP requests to this API
3. **Data Sync**: Maintain the same data structure and business logic
4. **Offline Support**: Consider implementing caching strategies

### Example Frontend Integration

```javascript
// Replace local database calls with API calls
const apiClient = {
  baseURL: "http://localhost:3000/api",

  async getHabits(token) {
    const response = await fetch(`${this.baseURL}/habits`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async logHabit(token, habitId, status) {
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

## 🐛 Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 📊 Monitoring & Logging

- Request logging middleware
- Error tracking and reporting
- Health check endpoint at `/health`
- Performance monitoring ready

## 🔧 Development

### Adding New Endpoints

1. Create controller function in appropriate controller file
2. Add route in corresponding route file
3. Update this README with endpoint documentation
4. Add input validation and error handling

### Database Migrations

When updating the schema:

1. Update `database/schema.sql`
2. Create migration scripts for existing data
3. Test thoroughly in development environment

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For issues and questions:

1. Check the API health endpoint: `/health`
2. Review server logs for error details
3. Verify Supabase configuration and connectivity
4. Ensure all environment variables are set correctly

---

**Happy habit tracking! 🎯**
