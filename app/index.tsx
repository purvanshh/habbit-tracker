import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DotGrid } from '../src/components/DotGrid';
import { FloatingTabBar } from '../src/components/FloatingTabBar';
import { HabitCard } from '../src/components/HabitCard';
import { SwipeSlider } from '../src/components/SwipeSlider';
import { getLogsForHabit, isCompletedToday } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, logHabit, removeHabit, suggestions, isLoading, skipHabit } = useHabitStore();
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
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366F1" />
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
      setTimeout(() => setShowCompletedMessage(false), 2000);
    }
  };

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: '#6b7280', fontSize: 12, letterSpacing: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        </Text>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Dashboard</Text>
      </Animated.View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 180 }}>
        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flame" size={24} color="#6366F1" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>TOTAL STREAKS</Text>
                <Text style={{ color: '#6366F1', fontSize: 28, fontWeight: 'bold' }}>{totalStreaks}</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: '#111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={24} color="#A855F7" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: '#6b7280', fontSize: 10, letterSpacing: 1 }}>ACTIVE HABITS</Text>
                <Text style={{ color: '#A855F7', fontSize: 28, fontWeight: 'bold' }}>{habits.length}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Habit Selector */}
        {habits.length > 0 ? (
          <View>
            <Animated.Text entering={FadeIn.delay(300)} style={{ color: 'white', fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>Your Habits</Animated.Text>
            <FlatList
              data={habits}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={h => h.id}
              style={{ marginBottom: 16 }}
              renderItem={({ item, index }) => (
                <AnimatedTouchable
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                  onPress={() => setSelectedHabitId(item.id)}
                  style={{
                    marginRight: 10,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 20,
                    backgroundColor: selectedHabitId === item.id ? 'rgba(0, 255, 255, 0.15)' : '#111',
                    borderWidth: 1,
                    borderColor: selectedHabitId === item.id ? '#6366F1' : '#222',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name={(item.icon || 'barbell') as any} size={16} color={selectedHabitId === item.id ? '#6366F1' : '#9ca3af'} style={{ marginRight: 8 }} />
                  <Text style={{ color: selectedHabitId === item.id ? '#6366F1' : '#9ca3af' }}>
                    {item.name}
                  </Text>
                </AnimatedTouchable>
              )}
            />

            {selectedHabit && (
              <>
                <HabitCard
                  habit={selectedHabit}
                  onEdit={() => router.push({ pathname: '/edit-habit', params: { id: selectedHabit.id } })}
                  onDelete={() => {
                    removeHabit(selectedHabit.id);
                    if (habits.length > 1) {
                      setSelectedHabitId(habits.find(h => h.id !== selectedHabit.id)?.id || null);
                    } else {
                      setSelectedHabitId(null);
                    }
                  }}
                />

                <Animated.View entering={FadeInUp.delay(600).duration(500)} style={{ marginTop: 16 }}>
                  <DotGrid logs={currentLogs} />
                </Animated.View>

                {/* Weekly Report Banner */}
                <Animated.View entering={FadeInUp.delay(650).duration(500)} style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/weekly-report')}
                    style={{ backgroundColor: '#111', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222' }}
                  >
                    <Ionicons name="document-text" size={24} color="#6366F1" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>Weekly Report</Text>
                      <Text style={{ color: '#6b7280', fontSize: 12 }}>View your progress & insights</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </TouchableOpacity>
                </Animated.View>

                {suggestions.find(s => s.habitId === selectedHabit.id) && (
                  <Animated.View entering={FadeIn.delay(700)} style={{ marginTop: 16, backgroundColor: '#111', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#6366F1' }}>
                    <Text style={{ color: '#6366F1', fontWeight: 'bold', marginBottom: 4 }}>Suggestion</Text>
                    <Text style={{ color: '#d1d5db', fontSize: 13 }}>
                      {suggestions.find(s => s.habitId === selectedHabit.id)?.reason}
                    </Text>
                  </Animated.View>
                )}
              </>
            )}
          </View>
        ) : (
          <Animated.View entering={FadeIn.delay(300).duration(600)} style={{ backgroundColor: '#111', padding: 40, borderRadius: 20, alignItems: 'center' }}>
            <Ionicons name="add-circle" size={60} color="#6366F1" />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>No habits yet</Text>
            <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
              Tap the + button to create your first habit!
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {selectedHabit && !completedToday && (
        <Animated.View entering={FadeInUp.delay(800).springify()} style={{ position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 16 }}>
          <SwipeSlider
            onComplete={handleComplete}
            onSkip={async () => {
              const success = await skipHabit(selectedHabit.id);
              if (success) {
                setCompletedToday(true);
                setShowCompletedMessage(true);
                setTimeout(() => setShowCompletedMessage(false), 2000);
              }
            }}
            canSkip={(selectedHabit.skipsUsedThisWeek || 0) < (selectedHabit.maxSkipsPerWeek || 2)}
          />
        </Animated.View>
      )}

      {showCompletedMessage && (
        <Animated.View entering={FadeIn.duration(300)} style={{ position: 'absolute', bottom: 110, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#111', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#6366F1' }}>
            <Ionicons name="checkmark-circle" size={20} color="#6366F1" />
            <Text style={{ color: '#6366F1', marginLeft: 8, fontWeight: 'bold' }}>Completed Today!</Text>
          </View>
        </Animated.View>
      )}

      <FloatingTabBar onAddPress={() => router.push('/create')} />
    </View>
  );
}
