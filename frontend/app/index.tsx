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
import { getLogsForHabit } from '../src/core/db';
import { HabitLog } from '../src/core/types';
import { useHabitStore } from '../src/store/useHabitStore';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, logHabit, removeHabit, suggestions, isLoading, skipHabit, useFreezeToken, activateVacation, pendingSyncCount, lastSyncedAt } = useHabitStore();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [currentLogs, setCurrentLogs] = useState<HabitLog[]>([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'completed' | 'skipped' | null>(null);
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHabitId) {
      getLogsForHabit(selectedHabitId).then(logs => {
        setCurrentLogs(logs);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const todaysLog = logs.find(l => {
          const logDate = new Date(l.timestamp);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === todayTimestamp;
        });

        if (todaysLog) {
          setCompletedToday(true);
          setCompletionStatus(todaysLog.status as any);
        } else {
          setCompletedToday(false);
          setCompletionStatus(null);
        }
      });
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
      setCompletionStatus('completed');
      setShowCompletedMessage(true);
      setTimeout(() => setShowCompletedMessage(false), 2000);
    }
  };

  useEffect(() => {
    if (selectedHabit) {
      const needsWarning = !completedToday && (selectedHabit.freezeTokens ?? 0) === 0 && !selectedHabit.vacationMode;
      setBannerMessage(needsWarning ? "You're about to lose your streak" : null);
    } else {
      setBannerMessage(null);
    }
  }, [selectedHabit, completedToday]);

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(60).duration(240)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
        <Text style={{ color: '#6b7280', fontSize: 12, letterSpacing: 2 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        </Text>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Dashboard</Text>
      </Animated.View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 180 }}>
        {pendingSyncCount > 0 && (
          <View style={{ backgroundColor: '#2e1065', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#4c1d95', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Sync Pending</Text>
            <Text style={{ color: '#c084fc' }}>{pendingSyncCount} item(s)</Text>
          </View>
        )}
        {pendingSyncCount === 0 && lastSyncedAt && (
          <View style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 }}>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>Last synced</Text>
            <Text style={{ color: '#e2e8f0', fontWeight: '600' }}>{new Date(lastSyncedAt).toLocaleString()}</Text>
          </View>
        )}
        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(120).duration(240)} style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
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
            <Animated.Text entering={FadeIn.delay(140)} style={{ color: 'white', fontWeight: 'bold', marginBottom: 12, fontSize: 16 }}>Your Habits</Animated.Text>
            <FlatList
              data={habits}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={h => h.id}
              style={{ marginBottom: 16 }}
              renderItem={({ item, index }) => (
                <AnimatedTouchable
                  entering={FadeInDown.delay(220 + index * 70).springify()}
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
                  onEdit={() => router.push({ pathname: '/edit-habit', params: { id: selectedHabit.id } } as any)}
                  onDelete={() => {
                    removeHabit(selectedHabit.id);
                    if (habits.length > 1) {
                      setSelectedHabitId(habits.find(h => h.id !== selectedHabit.id)?.id || null);
                    } else {
                      setSelectedHabitId(null);
                    }
                  }}
                />

                <View style={{ backgroundColor: '#0f172a', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1e293b', marginBottom: 12 }}>
                  <Text style={{ color: '#cbd5e1', fontWeight: '700', marginBottom: 8 }}>Streak Protection</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>{selectedHabit.freezeTokens ?? 0} Freeze Tokens</Text>
                    <TouchableOpacity onPress={async () => { await useFreezeToken(selectedHabit.id); }} disabled={(selectedHabit.freezeTokens ?? 0) === 0} style={{ backgroundColor: (selectedHabit.freezeTokens ?? 0) === 0 ? '#1f2937' : '#2563eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                      <Text style={{ color: 'white', fontWeight: '600' }}>Use Freeze</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <Text style={{ color: '#cbd5e1' }}>{selectedHabit.vacationMode ? 'Vacation active' : 'Vacation inactive'}</Text>
                    <TouchableOpacity onPress={async () => { await activateVacation(selectedHabit.id); }} disabled={selectedHabit.vacationMode} style={{ backgroundColor: selectedHabit.vacationMode ? '#1f2937' : '#10b981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                      <Text style={{ color: 'white', fontWeight: '600' }}>{selectedHabit.vacationMode ? 'Active' : 'Activate Vacation'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {bannerMessage && (
                  <View style={{ backgroundColor: '#7f1d1d', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#991b1b', marginBottom: 12 }}>
                    <Text style={{ color: '#fecdd3', fontWeight: '700' }}>{bannerMessage}</Text>
                  </View>
                )}

                <Animated.View entering={FadeInUp.delay(280).duration(220)} style={{ marginTop: 16 }}>
                  <DotGrid logs={currentLogs} />
                </Animated.View>

                {/* Weekly Report Banner */}
                <Animated.View entering={FadeInUp.delay(320).duration(220)} style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/weekly-report' as any)}
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
                  <Animated.View entering={FadeIn.delay(340)} style={{ marginTop: 16, backgroundColor: '#111', borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: '#6366F1' }}>
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
          <Animated.View entering={FadeIn.delay(140).duration(240)} style={{ backgroundColor: '#111', padding: 40, borderRadius: 20, alignItems: 'center' }}>
            <Ionicons name="add-circle" size={60} color="#6366F1" />
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>No habits yet</Text>
            <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
              Tap the + button to create your first habit!
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {selectedHabit && !completedToday && (
        <Animated.View entering={FadeInUp.delay(360).springify()} style={{ position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 16 }}>
          <SwipeSlider
            onComplete={handleComplete}
            onSkip={async () => {
              const success = await skipHabit(selectedHabit.id);
              if (success) {
                setCompletedToday(true);
                setCompletionStatus('skipped');
                setShowCompletedMessage(true);
                setTimeout(() => setShowCompletedMessage(false), 2000);
              }
            }}
            canSkip={(selectedHabit.skipsUsedThisWeek || 0) < (selectedHabit.maxSkipsPerWeek || 2)}
          />
        </Animated.View>
      )}

      {showCompletedMessage && (
        <Animated.View entering={FadeIn.duration(180)} style={{ position: 'absolute', bottom: 110, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#111', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: completionStatus === 'skipped' ? '#F59E0B' : '#6366F1' }}>
            <Ionicons name={completionStatus === 'skipped' ? "alert-circle" : "checkmark-circle"} size={20} color={completionStatus === 'skipped' ? "#F59E0B" : "#6366F1"} />
            <Text style={{ color: completionStatus === 'skipped' ? '#F59E0B' : '#6366F1', marginLeft: 8, fontWeight: 'bold' }}>
              {completionStatus === 'skipped' ? 'Skipped Today' : 'Completed Today!'}
            </Text>
          </View>
        </Animated.View>
      )}

      <FloatingTabBar onAddPress={() => router.push('/create' as any)} />
    </View>
  );
}
