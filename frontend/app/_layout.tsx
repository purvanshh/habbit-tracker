import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
import { useAuthStore } from '../src/store/useAuthStore';
import { useHabitStore } from '../src/store/useHabitStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Smooth fade animation config
const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0A0A0A' },
  animation: 'fade' as const,
  animationDuration: 200,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter_Regular': Inter_400Regular,
    'Inter_Bold': Inter_700Bold,
    'BebasNeue_Regular': BebasNeue_400Regular,
  });

  const initializeStore = useHabitStore(s => s.initialize);
  const { session, initialize: initializeAuth, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (session) {
      console.log('Session active, initializing habits...');
      initializeStore();
    }
  }, [session, initializeStore]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

    if (!session && !inAuthGroup) {
      // Redirect to the login page
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // Redirect back to the home page
      router.replace('/');
    }
  }, [session, segments, isLoading]);

  // Keep screen dark while loading
  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ animation: 'fade' }} />
          <Stack.Screen name="signup" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen
            name="create"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="report" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="profile" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
