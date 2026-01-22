# Habit Tracker Frontend

A modern, mobile-first habit tracker built with React Native and Expo.

## Features

- **Habit Tracking**: Create, view, and complete daily habits easily.
- **Visual Statistics**: Visualize your progress with interactive charts, streak counters, and heatmaps.
- **Smart Suggestions**: Intelligent feedback to help you stay clear and consistent with your goals.
- **Notifications**: Stay on track with timely reminders.
- **Dark Mode**: Sleek, battery-saving dark interface by default.
- **Secure Auth**: Powered by Supabase Authentication.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Routing**: Expo Router (File-based routing)
- **Language**: TypeScript
- **State Management**: Zustand
- **Database & Auth**: Supabase
- **Charts**: `react-native-chart-kit`
- **Animations**: `react-native-reanimated`
- **Styling**: Standard React Native `StyleSheet` & Flexbox

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- [Expo Go](https://expo.dev/client) app installed on your physical device (iOS/Android).
- iOS Simulator (Mac only) or Android Emulator for local simulation.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npx expo start --clear
```

- **Physical Device**: Scan the QR code displayed in the terminal using the Expo Go app.
- **iOS Simulator**: Press `i` in the terminal.
- **Android Emulator**: Press `a` in the terminal.

## Key Screens

- **Home (`/`)**: Daily dashboard of your habits.
- **Statistics (`/report`)**: Detailed analysis of your performance over the last 7 days.
- **Create Habit (`/create`)**: distinct form to add new habits with icons and frequencies.
- **Profile (`/profile`)**: Manage settings, view achievements, and app info.

## Project Structure

- `app/`: Application screens and routing logic (Expo Router).
- `src/components/`: Reusable UI components (Tab Bar, Cards, Inputs).
- `src/core/`: TypeScript definitions (`types.ts`) and database helpers (`db.ts`).
- `src/store/`: Global state management stores (`useHabitStore`, `useAuthStore`).
- `assets/`: Images, fonts, and other static resources.

## Deployment

To deploy or build a production binary, use EAS (Expo Application Services):

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Configure the build:
   ```bash
   eas build:configure
   ```

4. Create a build:
   ```bash
   eas build --platform all
   ```
