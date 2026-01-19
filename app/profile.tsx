import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { useHabitStore } from '../src/store/useHabitStore';

export default function Profile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits } = useHabitStore();

    const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);

    const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
        <View
            style={[{
                backgroundColor: 'rgba(30, 30, 40, 0.6)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
            }, style]}
        >
            {children}
        </View>
    );

    return (
        <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center mb-6 px-4">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>Profile</Text>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Profile Header */}
                <GlassCard style={{ padding: 24, alignItems: 'center', marginBottom: 16 }}>
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: 'rgba(98, 54, 255, 0.3)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                            borderWidth: 2,
                            borderColor: '#6236FF',
                        }}
                    >
                        <Ionicons name="person" size={40} color="#6236FF" />
                    </View>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>User</Text>
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>Habit Tracker Pro</Text>
                </GlassCard>

                {/* Stats Cards */}
                <View className="flex-row gap-3 mb-4">
                    <GlassCard style={{ flex: 1, padding: 16 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 1 }}>ACTIVE HABITS</Text>
                        <Text style={{ color: '#6236FF', fontSize: 32, fontWeight: 'bold' }}>{habits.length}</Text>
                    </GlassCard>
                    <GlassCard style={{ flex: 1, padding: 16 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 1 }}>TOTAL STREAKS</Text>
                        <Text style={{ color: '#22c55e', fontSize: 32, fontWeight: 'bold' }}>{totalStreak}</Text>
                    </GlassCard>
                </View>

                {/* Settings List */}
                <GlassCard style={{ overflow: 'hidden' }}>
                    {[
                        { icon: 'notifications', label: 'Notifications' },
                        { icon: 'moon', label: 'Dark Mode' },
                        { icon: 'cloud-upload', label: 'Backup Data' },
                        { icon: 'information-circle', label: 'About' },
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 16,
                                borderBottomWidth: index < 3 ? 1 : 0,
                                borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                            }}
                        >
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    backgroundColor: 'rgba(98, 54, 255, 0.15)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name={item.icon as any} size={18} color="#6236FF" />
                            </View>
                            <Text style={{ color: 'white', marginLeft: 12, flex: 1 }}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    ))}
                </GlassCard>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
