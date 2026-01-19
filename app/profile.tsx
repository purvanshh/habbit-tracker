import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-background px-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80 }}>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold font-sans" style={{ color: 'white' }}>Profile</Text>
            </View>

            <ScrollView>
                {/* Profile Header */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4" style={{ backgroundColor: '#6236FF' }}>
                        <Ionicons name="person" size={48} color="white" />
                    </View>
                    <Text className="text-white text-2xl font-bold" style={{ color: 'white' }}>User</Text>
                    <Text className="text-gray-400 text-sm" style={{ color: '#9ca3af' }}>Habit Tracker Pro</Text>
                </View>

                {/* Stats Cards */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-card p-4 rounded-xl border border-white/5">
                        <Text className="text-gray-400 text-xs uppercase" style={{ color: '#9ca3af' }}>Active Habits</Text>
                        <Text className="text-primary text-3xl font-bold" style={{ color: '#6236FF' }}>0</Text>
                    </View>
                    <View className="flex-1 bg-card p-4 rounded-xl border border-white/5">
                        <Text className="text-gray-400 text-xs uppercase" style={{ color: '#9ca3af' }}>Total Streaks</Text>
                        <Text className="text-green-500 text-3xl font-bold" style={{ color: '#22c55e' }}>0</Text>
                    </View>
                </View>

                {/* Settings List */}
                <View className="bg-card rounded-xl border border-white/5 overflow-hidden">
                    {[
                        { icon: 'notifications', label: 'Notifications' },
                        { icon: 'moon', label: 'Dark Mode' },
                        { icon: 'cloud-upload', label: 'Backup Data' },
                        { icon: 'information-circle', label: 'About' },
                    ].map((item, index) => (
                        <TouchableOpacity
                            key={item.label}
                            className={`flex-row items-center p-4 ${index < 3 ? 'border-b border-white/5' : ''}`}
                        >
                            <Ionicons name={item.icon as any} size={20} color="#9ca3af" />
                            <Text className="text-white ml-3 flex-1" style={{ color: 'white' }}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
