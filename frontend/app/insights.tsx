import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingTabBar } from "../src/components/FloatingTabBar";
import { useHabitStore } from "../src/store/useHabitStore";

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    insights,
    suggestions,
    habits,
    refreshInsights,
    applyAdjustment,
    useFreezeToken,
    activateVacation,
  } = useHabitStore();

  useEffect(() => {
    refreshInsights();
  }, []);

  const { bestHabit, atRisk, streakHighlight, focus } = insights;

  const Pill = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: "#111827",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#1f2937",
      }}
    >
      <Text style={{ color: "#cbd5e1", fontSize: 12 }}>{children}</Text>
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0A0A0A", paddingTop: insets.top }}
    >
      <Animated.View
        entering={FadeInDown.duration(200)}
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}
      >
        <Text style={{ color: "#6b7280", fontSize: 12, letterSpacing: 2 }}>
          SMART ANALYSIS
        </Text>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
          Insights
        </Text>
      </Animated.View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 120, gap: 16 }}
      >
        {/* Weekly Digest */}
        <Animated.View entering={FadeInDown.delay(60).duration(200)}>
          <View
            style={{
              backgroundColor: "#0B1224",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#1f2937",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="sparkles" size={18} color="#a855f7" />
              <Text
                style={{
                  color: "#cbd5e1",
                  fontWeight: "700",
                  fontSize: 15,
                  marginLeft: 8,
                }}
              >
                Weekly Digest
              </Text>
            </View>
            {bestHabit ? (
              <View
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#1e293b",
                }}
              >
                <Text
                  style={{
                    color: "#e2e8f0",
                    fontWeight: "700",
                    fontSize: 15,
                    marginBottom: 8,
                  }}
                >
                  {bestHabit.name}
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
                >
                  <Pill>{`${Math.round(bestHabit.successRate * 100)}% success`}</Pill>
                  <Pill>{`${bestHabit.completions} completions`}</Pill>
                </View>
              </View>
            ) : (
              <Text style={{ color: "#64748b" }}>
                Complete a few days to see insights.
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Streak Highlight */}
        {streakHighlight && (
          <Animated.View entering={FadeInDown.delay(100).duration(200)}>
            <View
              style={{
                backgroundColor: "#111827",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#1f2937",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="flame" size={18} color="#f59e0b" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Streak Highlight
                </Text>
              </View>
              <Text
                style={{ color: "#e2e8f0", fontWeight: "700", marginBottom: 8 }}
              >
                {streakHighlight.name}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: streakHighlight.needsAction ? 12 : 0,
                }}
              >
                <Pill>{`${streakHighlight.currentStreak} current`}</Pill>
                <Pill>{`${streakHighlight.longestStreak} longest`}</Pill>
                <Pill>{`${streakHighlight.freezeTokens} freeze tokens`}</Pill>
              </View>
              {streakHighlight.needsAction && (
                <TouchableOpacity
                  onPress={() => useFreezeToken(streakHighlight.habitId)}
                  style={{
                    backgroundColor: "#b91c1c",
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    Use Freeze to protect
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}

        {/* At Risk Habits */}
        {atRisk.length > 0 && (
          <Animated.View entering={FadeInDown.delay(140).duration(200)}>
            <View
              style={{
                backgroundColor: "#111827",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#1f2937",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="alert-circle" size={18} color="#f97316" />
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  At Risk
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {atRisk.map((item) => (
                  <View
                    key={item.habitId}
                    style={{
                      backgroundColor: "#0b1224",
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#1e293b",
                    }}
                  >
                    <Text
                      style={{
                        color: "#e2e8f0",
                        fontWeight: "700",
                        marginBottom: 8,
                      }}
                    >
                      {item.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      <Pill>{`${Math.round(item.successRate * 100)}% success`}</Pill>
                      <Pill>{`${item.consecutiveFailures} fails streak`}</Pill>
                    </View>
                    {/* Action buttons stacked to prevent overflow */}
                    <View style={{ gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => useFreezeToken(item.habitId)}
                        style={{
                          backgroundColor: "#2563eb",
                          paddingVertical: 10,
                          borderRadius: 10,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "600" }}>
                          Use Freeze Token
                        </Text>
                      </TouchableOpacity>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => activateVacation(item.habitId)}
                          style={{
                            flex: 1,
                            backgroundColor: "#10b981",
                            paddingVertical: 10,
                            borderRadius: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontWeight: "600" }}>
                            Vacation
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            applyAdjustment({
                              habitId: item.habitId,
                              type: "reduce_frequency",
                              reason: "Lower frequency to improve consistency",
                              suggestedAction: "Reduce to 3 days/week",
                            })
                          }
                          style={{
                            flex: 1,
                            backgroundColor: "#f59e0b",
                            paddingVertical: 10,
                            borderRadius: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "#0f172a", fontWeight: "700" }}>
                            Adjust Freq.
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Suggestions from engine */}
        {suggestions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(180).duration(200)}>
            <View
              style={{
                backgroundColor: "#0B1224",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#1f2937",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Ionicons name="bulb" size={18} color="#6366F1" />
                <Text
                  style={{
                    color: "#cbd5e1",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Suggestions
                </Text>
              </View>
              <View style={{ gap: 10 }}>
                {suggestions.map((s, i) => {
                  const habit = habits.find((h) => h.id === s.habitId);
                  return (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#0f172a",
                        borderRadius: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#1e293b",
                        borderLeftWidth: 3,
                        borderLeftColor: "#6366F1",
                      }}
                    >
                      <Text
                        style={{
                          color: "#94a3b8",
                          fontSize: 11,
                          letterSpacing: 1,
                          marginBottom: 4,
                        }}
                      >
                        {habit?.name?.toUpperCase()}
                      </Text>
                      <Text
                        style={{
                          color: "#e2e8f0",
                          marginBottom: 10,
                          lineHeight: 20,
                        }}
                      >
                        {s.reason}
                      </Text>
                      <TouchableOpacity
                        onPress={() => applyAdjustment(s)}
                        style={{
                          backgroundColor: "rgba(99,102,241,0.15)",
                          paddingVertical: 9,
                          borderRadius: 10,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#6366F1",
                        }}
                      >
                        <Text style={{ color: "#6366F1", fontWeight: "700" }}>
                          {s.suggestedAction}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Focus */}
        {focus && (
          <Animated.View entering={FadeIn.delay(220).duration(200)}>
            <View
              style={{
                backgroundColor: "#0f172a",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#1e293b",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="telescope" size={18} color="#38bdf8" />
                <Text
                  style={{
                    color: "#cbd5e1",
                    fontWeight: "700",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Focus This Week
                </Text>
              </View>
              <Text style={{ color: "#e2e8f0", lineHeight: 22 }}>{focus}</Text>
            </View>
          </Animated.View>
        )}

        {/* Empty state */}
        {!bestHabit &&
          !streakHighlight &&
          atRisk.length === 0 &&
          suggestions.length === 0 && (
            <Animated.View
              entering={FadeIn.delay(100).duration(240)}
              style={{ alignItems: "center", paddingTop: 60 }}
            >
              <Ionicons name="bulb-outline" size={60} color="#374151" />
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 16,
                }}
              >
                No insights yet
              </Text>
              <Text
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  marginTop: 8,
                  lineHeight: 22,
                }}
              >
                Keep logging your habits and insights will appear here.
              </Text>
            </Animated.View>
          )}
      </ScrollView>

      <FloatingTabBar onAddPress={() => router.push("/create")} />
    </View>
  );
}
