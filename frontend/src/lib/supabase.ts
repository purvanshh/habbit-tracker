
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Hardcoded for now as .env support in Expo can be tricky without extra config
// In a real production app, use expo-constants or .env
const SUPABASE_URL = 'https://yyfiynsahetyusgeredt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Zml5bnNhaGV0eXVzZ2VyZWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODAwNTAsImV4cCI6MjA4NDU1NjA1MH0.-iNZg6cJsTtZO44v5oIBD2LbKw7EkFK9FaeRMGrM_Go';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
