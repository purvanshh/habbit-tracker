import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';
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

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Keep screen dark while loading
  if (!fontsLoaded) {
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
