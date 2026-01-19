import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DotGrid } from '../src/components/DotGrid';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { HabitCard } from '../src/components/HabitCard';
import { SwipeSlider } from '../src/components/SwipeSlider';
import { getLogsForHabit, isCompletedToday } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, logHabit, removeHabit, suggestions, isLoading } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [currentLogs, setCurrentLogs] = useState<HabitLog[]>([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);

  useEffect(() => {
    if (selectedHabitId) {
      getLogsForHabit(selectedHabitId).then(setCurrentLogs);
      isCompletedToday(selectedHabitId).then(setCompletedToday);
    } else if (habits.length > 0) {
      setSelectedHabitId(habits[0].id);
    }
  }, [selectedHabitId, habits]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6236FF" />
      </View>
    );
  }

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  const handleComplete = async () => {
    if (selectedHabit) {
      await logHabit(selectedHabit.id, 'completed');
      const updatedLogs = await getLogsForHabit(selectedHabit.id);
      setCurrentLogs(updatedLogs);
      setCompletedToday(true);
      setShowCompletedMessage(true);
      setTimeout(() => {
        setShowCompletedMessage(false);
      }, 2000);
    }
  };

  // Calculate stats
  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
  const completedHabitsToday = habits.filter(h => {
    const log = currentLogs.find(l => l.habitId === h.id);
    return log?.status === 'completed';
  }).length;

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
      {/* Header */}
      <View className="flex-row justify-between items-center py-4 px-4">
        <View>
          <Text className="text-gray-400 text-xs font-sans tracking-widest uppercase" style={{ color: '#9ca3af' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Text className="text-white text-2xl font-bold font-sans" style={{ color: 'white' }}>
            Dashboard
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 180 }}>

        {/* Quick Stats Row */}
        <View className="flex-row gap-3 mb-4">
          <GlassCard style={{ flex: 1, padding: 16 }}>
            <View className="flex-row items-center">
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(98, 54, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="flame" size={20} color="#6236FF" />
              </View>
              <View>
                <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 1 }}>TOTAL STREAKS</Text>
                <Text style={{ color: '#6236FF', fontSize: 24, fontWeight: 'bold' }}>{totalStreaks}</Text>
              </View>
            </View>
          </GlassCard>
          <GlassCard style={{ flex: 1, padding: 16 }}>
            <View className="flex-row items-center">
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              </View>
              <View>
                <Text style={{ color: '#9ca3af', fontSize: 10, letterSpacing: 1 }}>ACTIVE HABITS</Text>
                <Text style={{ color: '#22c55e', fontSize: 24, fontWeight: 'bold' }}>{habits.length}</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Habit Selector (Horizontal List) */}
        {habits.length > 0 ? (
          <View>
            <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 8 }}>Your Habits</Text>
            <FlatList
              data={habits}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={h => h.id}
              style={{ marginBottom: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedHabitId(item.id)}
                  style={{
                    marginRight: 10,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: selectedHabitId === item.id ? 'rgba(98, 54, 255, 0.15)' : 'rgba(30, 30, 40, 0.6)',
                    borderWidth: 1,
                    borderColor: selectedHabitId === item.id ? '#6236FF' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text style={{ color: selectedHabitId === item.id ? '#6236FF' : '#9ca3af', fontWeight: selectedHabitId === item.id ? 'bold' : 'normal' }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {selectedHabit && (
              <>
                <HabitCard
                  habit={selectedHabit}
                  onDelete={() => {
                    removeHabit(selectedHabit.id);
                    if (habits.length > 1) {
                      setSelectedHabitId(habits.find(h => h.id !== selectedHabit.id)?.id || null);
                    } else {
                      setSelectedHabitId(null);
                    }
                  }}
                />

                {/* History Dot Grid */}
                <View style={{ marginTop: 16 }}>
                  <DotGrid logs={currentLogs} />
                </View>

                {/* Suggestions / Alerts */}
                {suggestions.find(s => s.habitId === selectedHabit.id) && (
                  <GlassCard style={{ padding: 16, borderLeftWidth: 3, borderLeftColor: '#eab308' }}>
                    <Text style={{ color: '#eab308', fontWeight: 'bold', marginBottom: 4 }}>Suggestion</Text>
                    <Text style={{ color: '#d1d5db', fontSize: 13 }}>
                      {suggestions.find(s => s.habitId === selectedHabit.id)?.reason}
                    </Text>
                    <Text style={{ color: '#9ca3af', fontSize: 12, fontStyle: 'italic', marginTop: 8 }}>
                      {suggestions.find(s => s.habitId === selectedHabit.id)?.suggestedAction}
                    </Text>
                  </GlassCard>
                )}
              </>
            )}
          </View>
        ) : (
          <GlassCard style={{ padding: 40, alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(98, 54, 255, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="add" size={40} color="#6236FF" />
            </View>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No habits yet</Text>
            <Text style={{ color: '#9ca3af', textAlign: 'center' }}>
              Tap the + button below to create your first habit and start building streaks!
            </Text>
          </GlassCard>
        )}

      </ScrollView>

      {/* Footer Slider - Only show if habit selected and not completed today */}
      {selectedHabit && !completedToday && (
        <View style={{ position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 16 }}>
          <SwipeSlider onComplete={handleComplete} />
        </View>
      )}

      {/* Completed Message - Auto-hides after 2 seconds */}
      {showCompletedMessage && (
        <View style={{ position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 16, alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.3)', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text style={{ color: '#22c55e', marginLeft: 8, fontWeight: 'bold' }}>Completed Today!</Text>
          </View>
        </View>
      )}

      {/* Floating Tab Bar */}
      <FloatingTabBar onAddPress={() => router.push('/create')} />
    </View>
  );
}
