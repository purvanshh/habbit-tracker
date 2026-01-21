# Habit Tracker - Monorepo

A comprehensive, full-stack Habit Tracker application built with **React Native (Expo)** for the frontend and **Node.js (Express + Supabase)** for the backend.

## 📂 Repository Structure

This project is organized as a monorepo:

```
root/
 ├── frontend/      # Mobile Application (React Native / Expo)
 ├── server/        # Backend API (Express.js / Node.js)
 └── README.md      # Method of Operation (You are here)
```

---

## 🚀 Features

### Frontend (Mobile App)
- **Modern UI/UX**: Built with React Native and NativeWind (Tailwind CSS) for a sleek, dark-themed interface.
- **Habit Management**: Create, edit, and delete habits with customizable icons and frequencies.
- **Visual Analytics**: Interactive charts and heatmaps to track progress and streaks.
- **Gestures**: Swipe-to-complete interactions for a fluid user experience.
- **Notifications**: Local notifications to remind you of your goals.

### Backend (API)
- **Robust API**: RESTful endpoints served by Express.js.
- **Authentication**: Secure user authentication via Supabase (JWT).
- **Data Persistence**: Postgres database managed by Supabase.
- **Logic Layer**: Handles complex logic for streaks, skip limits, and detailed analytics.
- **Security**: Row Level Security (RLS) policies to ensure data privacy.

---

## 🛠️ Tech Stack

**Frontend:**
- React Native / Expo (SDK 50+)
- TypeScript
- NativeWind (Tailwind CSS)
- Reanimated 3
- Expo Router
- Zustand (State Management)

**Backend:**
- Node.js
- Express.js
- Supabase (PostgreSQL + Auth)
- Dotenv

---

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Expo Go**: Installed on your physical device (iOS/Android) or an Emulator.
- **Supabase Account**: For database and auth hosting.

---

## 🏁 Getting Started

### 1. Backend Setup (`server/`)

The backend must be running for the frontend to function correctly.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    Create a `.env` file in the `server/` root (or use the root `.env` if configured for monorepo sharing, but standard practice is local):
    ```env
    PORT=3000
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Start the Server:**
    ```bash
    npm run dev
    # The server will run on http://localhost:3000
    ```

### 2. Frontend Setup (`frontend/`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the App:**
    ```bash
    npx expo start
    ```
4.  **Run on Device:** Scan the QR code with the Expo Go app.

---

## 🚀 Deployment

### Backend (Render)
The `server/` directory is production-ready for [Render.com](https://render.com).

1.  **New Web Service**: Connect this repo.
2.  **Root Directory**: Set to `server`.
3.  **Build Command**: `npm install`.
4.  **Start Command**: `npm start`.
5.  **Environment Variables**: Add your Supabase keys in the Render dashboard.

### Frontend (Expo / EAS)
1.  **Configure `app.json`**: Ensure your slug and bundle identifiers are correct.
2.  **Build**:
    ```bash
    cd frontend
    eas build --profile production --platform all
    ```
3.  **Submit**:
    ```bash
    eas submit --platform all
    ```

---

## 🧪 Testing

**Backend Tests:**
Located in `server/tests/`.
```bash
cd server
node tests/test-auth.js
# Run other test scripts as needed
```

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
