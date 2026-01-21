import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../src/lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success', 'Account created! identifying...');
        }
        setLoading(false);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0A0A0A', paddingTop: insets.top, paddingHorizontal: 24, justifyContent: 'center' }}>
            <Animated.View entering={FadeInDown.duration(600).springify()} style={{ alignItems: 'center', marginBottom: 40 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(168, 85, 247, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ionicons name="person-add" size={36} color="#A855F7" />
                </View>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>Create Account</Text>
                <Text style={{ color: '#9ca3af', marginTop: 8 }}>Start your journey today</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(600).springify()}>
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>EMAIL</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="habit@tracker.com"
                        placeholderTextColor="#4b5563"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{ backgroundColor: '#111', borderRadius: 12, padding: 16, color: 'white', borderWidth: 1, borderColor: '#222' }}
                    />
                </View>

                <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>PASSWORD</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#4b5563"
                        secureTextEntry
                        style={{ backgroundColor: '#111', borderRadius: 12, padding: 16, color: 'white', borderWidth: 1, borderColor: '#222' }}
                    />
                </View>

                <View style={{ marginBottom: 32 }}>
                    <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8, letterSpacing: 1 }}>CONFIRM PASSWORD</Text>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••••"
                        placeholderTextColor="#4b5563"
                        secureTextEntry
                        style={{ backgroundColor: '#111', borderRadius: 12, padding: 16, color: 'white', borderWidth: 1, borderColor: '#222' }}
                    />
                </View>

                <TouchableOpacity onPress={handleSignup} disabled={loading}>
                    <LinearGradient
                        colors={['#A855F7', '#6366F1'] as const}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ padding: 16, borderRadius: 12, alignItems: 'center', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>CREATE ACCOUNT</Text>}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
                    <Text style={{ color: '#9ca3af' }}>Already have an account? </Text>
                    <Link href="/login" asChild>
                        <TouchableOpacity>
                            <Text style={{ color: '#A855F7', fontWeight: 'bold' }}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </View>
    );
}
