import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getNotifications, markNotificationRead } from '../src/core/db';
import { AppNotification } from '../src/core/types';

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleMarkAsRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'alert-circle';
            default: return 'information-circle';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'success': return '#10B981';
            case 'warning': return '#F59E0B';
            default: return '#6366F1';
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                        <Ionicons name="notifications-off-outline" size={64} color="#333" />
                        <Text style={{ color: '#6b7280', marginTop: 16 }}>No notifications yet</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                        <TouchableOpacity
                            onPress={() => !item.isRead && handleMarkAsRead(item.id)}
                            style={{
                                backgroundColor: item.isRead ? '#111' : '#1a1a1a',
                                padding: 16,
                                borderRadius: 16,
                                marginBottom: 12,
                                flexDirection: 'row',
                                borderLeftWidth: 4,
                                borderLeftColor: item.isRead ? '#333' : getColor(item.type)
                            }}
                        >
                            <View style={{ marginRight: 16, justifyContent: 'center' }}>
                                <Ionicons name={getIcon(item.type) as any} size={24} color={getColor(item.type)} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{item.title}</Text>
                                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>{item.message}</Text>
                                <Text style={{ color: '#4B5563', fontSize: 12, marginTop: 8 }}>
                                    {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            {!item.isRead && (
                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1', alignSelf: 'center', marginLeft: 8 }} />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                )}
            />
        </View>
    );
}
