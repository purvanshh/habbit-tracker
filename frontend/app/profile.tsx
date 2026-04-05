import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgGradient,
} from "react-native-svg";
import { FloatingTabBar } from "../src/components/FloatingTabBar";
import { badgeCatalog } from "../src/core/badges";
import { useAuthStore } from "../src/store/useAuthStore";
import { useHabitStore } from "../src/store/useHabitStore";

function CircularStat({
  value,
  maxValue,
  label,
  color,
}: {
  value: number;
  maxValue: number;
  label: string;
  color: "cyan" | "magenta";
}) {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg
          width={size}
          height={size}
          style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
        >
          <Defs>
            <SvgGradient id={`stat${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop
                offset="0%"
                stopColor={color === "cyan" ? "#6366F1" : "#A855F7"}
              />
              <Stop
                offset="100%"
                stopColor={color === "cyan" ? "#00CED1" : "#FF69B4"}
              />
            </SvgGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#stat${label})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <Text
          style={{
            color: color === "cyan" ? "#6366F1" : "#A855F7",
            fontSize: 24,
            fontWeight: "bold",
          }}
        >
          {value}
        </Text>
      </View>
      <Text
        style={{
          color: "#6b7280",
          fontSize: 10,
          marginTop: 8,
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, badges, loadBadges } = useHabitStore();
  const { user, signOut, updateProfile, isSavingProfile } = useAuthStore();

  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
  const maxStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  // Derive stored values from user metadata
  const storedName = (user?.user_metadata?.full_name as string) || "";
  const storedBio = (user?.user_metadata?.bio as string) || "";

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(storedName);
  const [editBio, setEditBio] = useState(storedBio);

  // Sync local state when user metadata changes
  useEffect(() => {
    setEditName((user?.user_metadata?.full_name as string) || "");
    setEditBio((user?.user_metadata?.bio as string) || "");
  }, [user]);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert("Name required", "Please enter your full name.");
      return;
    }
    const result = await updateProfile({
      fullName: editName.trim(),
      bio: editBio.trim(),
    });
    if (result.error) {
      Alert.alert("Error", result.error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(storedName);
    setEditBio(storedBio);
    setIsEditing(false);
  };

  const displayName =
    storedName || user?.email?.split("@")[0] || "Habit Master";
  const displayEmail = user?.email || "";

  const unlockedBadges = badges
    .map((b) => {
      const meta = badgeCatalog.find((c) => c.id === b.badgeId);
      if (!meta) return null;
      return { ...meta, unlockedAt: b.unlockedAt };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: number;
  }>;

  const inputStyle = {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#333",
  } as const;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#0A0A0A" }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}
        >
          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
            Profile
          </Text>
        </Animated.View>

        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Card */}
          <Animated.View
            entering={FadeInDown.delay(60).duration(200)}
            style={{
              backgroundColor: "#111",
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: "#1f2937",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: isEditing ? 20 : 0,
              }}
            >
              {/* Avatar */}
              <LinearGradient
                colors={["#6366F1", "#A855F7"] as const}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "bold" }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>

              {/* Name + email (view mode) */}
              {!isEditing && (
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                    numberOfLines={1}
                  >
                    {displayName}
                  </Text>
                  {displayEmail ? (
                    <Text
                      style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {displayEmail}
                    </Text>
                  ) : null}
                  {storedBio ? (
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 13,
                        marginTop: 6,
                        lineHeight: 18,
                      }}
                    >
                      {storedBio}
                    </Text>
                  ) : null}
                </View>
              )}

              {/* Edit toggle */}
              {!isEditing && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={{
                    backgroundColor: "rgba(99,102,241,0.12)",
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(99,102,241,0.3)",
                  }}
                >
                  <Ionicons name="pencil" size={16} color="#6366F1" />
                </TouchableOpacity>
              )}
            </View>

            {/* Edit form */}
            {isEditing && (
              <View style={{ gap: 12 }}>
                <View>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    FULL NAME
                  </Text>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Your full name"
                    placeholderTextColor="#4b5563"
                    autoCapitalize="words"
                    style={inputStyle}
                  />
                </View>
                <View>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: 11,
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    BIO
                  </Text>
                  <TextInput
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="A short bio..."
                    placeholderTextColor="#4b5563"
                    multiline
                    numberOfLines={3}
                    style={[
                      inputStyle,
                      { minHeight: 80, textAlignVertical: "top" },
                    ]}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                      backgroundColor: "#1a1a1a",
                      borderWidth: 1,
                      borderColor: "#333",
                    }}
                  >
                    <Text style={{ color: "#9ca3af", fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSavingProfile}
                    style={{ flex: 2, borderRadius: 12, overflow: "hidden" }}
                  >
                    <LinearGradient
                      colors={["#6366F1", "#A855F7"] as const}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        paddingVertical: 12,
                        alignItems: "center",
                        opacity: isSavingProfile ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "700" }}>
                        {isSavingProfile ? "Saving..." : "Save Changes"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Stats */}
          <Animated.View
            entering={FadeInUp.delay(90).duration(200)}
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 24,
            }}
          >
            <CircularStat
              value={habits.length}
              maxValue={10}
              label="HABITS"
              color="cyan"
            />
            <CircularStat
              value={totalStreak}
              maxValue={100}
              label="STREAKS"
              color="magenta"
            />
            <CircularStat
              value={maxStreak}
              maxValue={30}
              label="BEST"
              color="cyan"
            />
          </Animated.View>

          {/* Badges */}
          <Animated.View
            entering={FadeInUp.delay(110).duration(200)}
            style={{
              backgroundColor: "#111",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
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
              <Ionicons name="ribbon" size={18} color="#F59E0B" />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginLeft: 8,
                }}
              >
                Badges
              </Text>
            </View>
            {unlockedBadges.length === 0 ? (
              <Text style={{ color: "#6b7280", fontSize: 13 }}>
                Earn badges by completing weekly reports and streaks.
              </Text>
            ) : (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {unlockedBadges.map((badge) => (
                  <View
                    key={badge.id}
                    style={{
                      width: "48%",
                      backgroundColor: "#0f172a",
                      borderRadius: 14,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "#1f2937",
                    }}
                  >
                    <Text
                      style={{
                        color: "#facc15",
                        fontWeight: "700",
                        marginBottom: 6,
                      }}
                    >
                      {badge.name}
                    </Text>
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      {badge.description}
                    </Text>
                    <Text style={{ color: "#6b7280", fontSize: 11 }}>
                      Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Settings */}
          <Animated.View
            entering={FadeInUp.delay(120).duration(200)}
            style={{
              backgroundColor: "#111",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {[
              {
                icon: "notifications",
                label: "Notifications",
                color: "#6366F1",
                route: "/notifications",
              },
              {
                icon: "information-circle",
                label: "App Info",
                color: "#A855F7",
                route: "/app-info",
              },
              {
                icon: "globe-outline",
                label: "Contact Developer",
                color: "#10B981",
                action: () => Linking.openURL("https://purvanshsahu.site"),
              },
              {
                icon: "log-out-outline",
                label: "Log Out",
                color: "#EF4444",
                action: () => signOut(),
              },
            ].map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() =>
                  item.action
                    ? item.action()
                    : item.route && router.push(item.route as any)
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 16,
                  borderBottomWidth: i < 3 ? 1 : 0,
                  borderBottomColor: "#222",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.color}
                />
                <Text
                  style={{
                    color: item.color === "#EF4444" ? "#EF4444" : "white",
                    marginLeft: 16,
                    flex: 1,
                    fontSize: 15,
                  }}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name={
                    item.route
                      ? "chevron-forward"
                      : item.icon === "log-out-outline"
                        ? "exit-outline"
                        : "open-outline"
                  }
                  size={18}
                  color={item.color === "#EF4444" ? "#EF4444" : "#6b7280"}
                />
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        <FloatingTabBar onAddPress={() => router.push("/create")} />
      </View>
    </KeyboardAvoidingView>
  );
}
