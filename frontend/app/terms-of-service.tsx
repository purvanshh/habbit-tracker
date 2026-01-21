import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsOfService() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Terms of Service</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text style={{ color: '#D1D5DB', lineHeight: 24, marginBottom: 16 }}>
                    <Text style={{ fontWeight: 'bold', color: 'white' }}>Last Updated: January 1, 2026</Text>
                </Text>

                <Section title="1. Acceptance of Terms">
                    By accessing or using Habit Tracker, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.
                </Section>

                <Section title="2. Use of Service">
                    You grant Habit Tracker a non-exclusive, worldwide, royalty-free license to use your data for the purpose of providing the service to you.
                </Section>

                <Section title="3. User Responsibilities">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                </Section>

                <Section title="4. Termination">
                    We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </Section>

                <Section title="5. Changes">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                </Section>
            </ScrollView>
        </View>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#6366F1', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{title}</Text>
            <Text style={{ color: '#9CA3AF', lineHeight: 22 }}>{children}</Text>
        </View>
    );
}
