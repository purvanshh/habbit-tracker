import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { useAuthStore } from '../src/store/useAuthStore';
import { useHabitStore } from '../src/store/useHabitStore';

function CircularStat({ value, maxValue, label, color }: { value: number; maxValue: number; label: string; color: 'cyan' | 'magenta' }) {
    const size = 100;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
                    <Defs>
                        <SvgGradient id={`stat${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor={color === 'cyan' ? '#6366F1' : '#A855F7'} />
                            <Stop offset="100%" stopColor={color === 'cyan' ? '#00CED1' : '#FF69B4'} />
                        </SvgGradient>
                    </Defs>
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} fill="transparent" />
                    <Circle cx={size / 2} cy={size / 2} r={radius} stroke={`url(#stat${label})`} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </Svg>
                <Text style={{ color: color === 'cyan' ? '#6366F1' : '#A855F7', fontSize: 24, fontWeight: 'bold' }}>{value}</Text>
            </View>
            <Text style={{ color: '#6b7280', fontSize: 10, marginTop: 8, letterSpacing: 1 }}>{label}</Text>
        </View>
    );
}

export default function Profile() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { habits } = useHabitStore();
    const { signOut } = useAuthStore();
    const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
    const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Profile</Text>
            </Animated.View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Profile Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ backgroundColor: '#111', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#222', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#6366F1' }}>
                        <Ionicons name="person" size={40} color="#6366F1" />
                    </View>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Habit Master</Text>
                    <Text style={{ color: '#6b7280', fontSize: 14 }}>Building better habits daily</Text>
                </Animated.View>

                {/* Stats */}
                <Animated.View entering={FadeInUp.delay(150).duration(400)} style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
                    <CircularStat value={habits.length} maxValue={10} label="HABITS" color="cyan" />
                    <CircularStat value={totalStreak} maxValue={100} label="STREAKS" color="magenta" />
                    <CircularStat value={maxStreak} maxValue={30} label="BEST" color="cyan" />
                </Animated.View>

                {/* Settings */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)} style={{ backgroundColor: '#111', borderRadius: 16, overflow: 'hidden' }}>
                    {[
                        { icon: 'notifications', label: 'Notifications', color: '#6366F1', route: '/notifications' },
                        { icon: 'information-circle', label: 'App Info', color: '#A855F7', route: '/app-info' },
                        { icon: 'globe-outline', label: 'Contact Developer', color: '#10B981', action: () => Linking.openURL('https://purvanshsahu.site') },
                        { icon: 'log-out-outline', label: 'Log Out', color: '#EF4444', action: () => signOut() },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => item.action ? item.action() : item.route && router.push(item.route as any)}
                            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: '#222' }}
                        >
                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                            <Text style={{ color: item.color === '#EF4444' ? '#EF4444' : 'white', marginLeft: 16, flex: 1, fontSize: 15 }}>{item.label}</Text>
                            <Ionicons name={item.route ? "chevron-forward" : (item.icon === 'log-out-outline' ? "exit-outline" : "open-outline")} size={18} color={item.color === '#EF4444' ? '#EF4444' : "#6b7280"} />
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </ScrollView>

            <FloatingTabBar onAddPress={() => router.push('/create')} />
        </View>
    );
}
