import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppInfoScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>App Info</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>

                <View style={{ alignItems: 'center', marginBottom: 40, marginTop: 20 }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(99, 102, 241, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <Ionicons name="barbell" size={48} color="#6366F1" />
                    </View>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Habit Tracker</Text>
                    <Text style={{ color: '#6b7280', fontSize: 16 }}>Version 1.0.0</Text>
                </View>

                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                    <Text style={{ color: '#A855F7', fontSize: 14, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 }}>ABOUT</Text>
                    <Text style={{ color: '#D1D5DB', lineHeight: 24 }}>
                        Habit Tracker is designed to help you build consistent habits and track your progress over time.
                        With insightful analytics and a distraction-free interface, focusing on your goals has never been easier.
                    </Text>
                </View>

                <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 20, marginBottom: 20 }}>
                    <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold', marginBottom: 12, letterSpacing: 1 }}>CREDITS</Text>
                    <Text style={{ color: '#D1D5DB', lineHeight: 24, marginBottom: 8 }}>
                        Developed by <Text style={{ fontWeight: 'bold', color: 'white' }}>Purvansh</Text>
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 13 }}>
                        Built with React Native, Expo, and Supabase.
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 24 }}>
                    <TouchableOpacity>
                        <Text style={{ color: '#6b7280', fontSize: 14 }}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={{ color: '#6b7280', fontSize: 14 }}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>

                <Text style={{ color: '#333', textAlign: 'center', marginTop: 40, fontSize: 12 }}>
                    © 2026 Habit Tracker Inc.
                </Text>

            </ScrollView>
        </View>
    );
}
