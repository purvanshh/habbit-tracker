import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek } from 'date-fns';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DotGrid } from '../src/components/DotGrid';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { HabitCard } from '../src/components/HabitCard';
import { SwipeSlider } from '../src/components/SwipeSlider';
import { getAllLogs, getLogsForHabit, isCompletedToday } from '../src/core/db';
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
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);

  // Effect to load logs when a habit is selected
  useEffect(() => {
    getAllLogs().then(setAllLogs);
    if (selectedHabitId) {
      getLogsForHabit(selectedHabitId).then(setCurrentLogs);
      isCompletedToday(selectedHabitId).then(setCompletedToday);
    } else if (habits.length > 0) {
      setSelectedHabitId(habits[0].id);
    }
  }, [selectedHabitId, habits]);

  // Mini calendar - current week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getCompletionCount = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + 24 * 60 * 60 * 1000;
    return allLogs.filter(
      log => log.timestamp >= dayStart.getTime() && log.timestamp < dayEnd && log.status === 'completed'
    ).length;
  };

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
      getAllLogs().then(setAllLogs);
      // Auto-hide after 2 seconds
      setTimeout(() => {
        setShowCompletedMessage(false);
      }, 2000);
    }
  };

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
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Mini Week Calendar - Always visible */}
        <TouchableOpacity
          onPress={() => router.push('/calendar')}
          className="bg-card rounded-2xl p-4 mb-4 border border-white/5"
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-bold" style={{ color: 'white' }}>This Week</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </View>
          <View className="flex-row justify-around">
            {weekDays.map(day => {
              const count = getCompletionCount(day);
              const isCurrentDay = isToday(day);
              return (
                <View key={day.toISOString()} className="items-center">
                  <Text className="text-gray-500 text-xs mb-1" style={{ color: '#6b7280' }}>
                    {format(day, 'EEE')}
                  </Text>
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${count > 0 ? 'bg-green-500/30' : 'bg-secondary'}`}
                    style={isCurrentDay ? { borderWidth: 2, borderColor: '#6236FF' } : count > 0 ? { backgroundColor: 'rgba(34, 197, 94, 0.3)' } : { backgroundColor: '#2C2C2E' }}
                  >
                    <Text
                      className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}
                      style={{ color: count > 0 ? '#22c55e' : 'white' }}
                    >
                      {format(day, 'd')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </TouchableOpacity>

        {/* Habit Selector (Horizontal List) */}
        {habits.length > 0 ? (
          <View>
            <Text className="text-white font-bold mb-2" style={{ color: 'white' }}>Your Habits</Text>
            <FlatList
              data={habits}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={h => h.id}
              className="py-2"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedHabitId(item.id)}
                  className={`mr-3 px-4 py-3 rounded-xl border ${selectedHabitId === item.id ? 'border-primary' : 'border-white/10 bg-card'}`}
                  style={selectedHabitId === item.id ? { backgroundColor: 'rgba(98, 54, 255, 0.1)', borderColor: '#6236FF' } : {}}
                >
                  <Text style={{ color: selectedHabitId === item.id ? '#6236FF' : '#9ca3af' }}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            {selectedHabit && (
              <>
                <View className="mt-4">
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
                </View>

                <View className="mt-4">
                  <DotGrid logs={currentLogs} />
                </View>

                {/* Suggestions / Alerts */}
                {suggestions.find(s => s.habitId === selectedHabit.id) && (
                  <View className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <Text className="text-yellow-500 font-bold mb-1" style={{ color: '#eab308' }}>Suggestion Available</Text>
                    <Text className="text-gray-300 text-xs" style={{ color: '#d1d5db' }}>
                      {suggestions.find(s => s.habitId === selectedHabit.id)?.reason}
                    </Text>
                    <Text className="text-gray-300 text-xs italic mt-2" style={{ color: '#d1d5db' }}>
                      {suggestions.find(s => s.habitId === selectedHabit.id)?.suggestedAction}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="add-circle-outline" size={64} color="#6b7280" />
            <Text className="text-gray-500 mt-4 text-center" style={{ color: '#6b7280' }}>
              No habits tracked yet.{'\n'}Tap + to create your first habit!
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Footer Slider - Only show if habit selected and not completed today */}
      {selectedHabit && !completedToday && (
        <View className="absolute bottom-24 left-0 right-0 px-4">
          <SwipeSlider onComplete={handleComplete} />
        </View>
      )}

      {/* Completed Message - Auto-hides after 2 seconds */}
      {showCompletedMessage && (
        <View className="absolute bottom-24 left-0 right-0 px-4 items-center">
          <View className="bg-green-500/20 border border-green-500/30 rounded-full px-6 py-3 flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text className="ml-2 font-bold" style={{ color: '#22c55e' }}>Completed Today!</Text>
          </View>
        </View>
      )}

      {/* Floating Tab Bar */}
      <FloatingTabBar onAddPress={() => router.push('/create')} />
    </View>
  );
}
