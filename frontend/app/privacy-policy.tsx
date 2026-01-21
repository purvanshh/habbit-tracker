import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicy() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Privacy Policy</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text style={{ color: '#D1D5DB', lineHeight: 24, marginBottom: 16 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Last Updated: January 1, 2026</Text>
                </Text>

                <Section title="1. Information We Collect">
                    We collect information you provide directly to us, such as when you create an account, create habits, or log your progress. This may include your email address and habit data.
                </Section>

                <Section title="2. How We Use Your Information">
                    We use the information we collect to provide, maintain, and improve our services, such as calculating streaks, generating weekly reports, and sending notifications.
                </Section>

                <Section title="3. Data Storage">
                    Your data is stored securely using Supabase. We implement Row Level Security (RLS) to ensure that you can only access your own data.
                </Section>

                <Section title="4. Contact Us">
                    If you have any questions about this Privacy Policy, please contact us at support@habittracker.com.
                </Section>
            </ScrollView>
        </View>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#A855F7', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
            <Text style={{ color: '#9CA3AF', lineHeight: 22 }}>{children}</Text>
        </View>
    );
}
