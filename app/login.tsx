import { authService } from '@/services/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG_IMAGE = require('@/assets/images/welcome-bg.jpg');

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { login } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Missing Details", "Please enter your mobile number and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(identifier, password);

      if (response.status === 'success') {
        const shop = response.data;
        const authKey = `ak_${shop.id}_${Date.now().toString(36)}`;
        login({
          id: shop.id.toString(),
          name: shop.owner_name,
          shopName: shop.shop_name,
          qrCode: shop.qr_code,
          upiId: shop.upi_id,
          latitude: shop.latitude ? parseFloat(shop.latitude) : undefined,
          longitude: shop.longitude ? parseFloat(shop.longitude) : undefined,
          city: shop.city,
          district: shop.district,
          state: shop.state
        }, authKey);
        router.replace('/(tabs)');
      } else {
        Alert.alert("Login Failed", response.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Connection Error", "Could not verify credentials. Check internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={BG_IMAGE}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Brand in Header */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <Text style={styles.brandText}>SlotB</Text>
                <Text style={[styles.brandText, { color: '#FFFFFF' }]}>.</Text>
                <Text style={styles.brandText}>in</Text>
              </View>
              <Text style={styles.tagline}>PARTNER</Text>
            </View>

            {/* Login Form Card */}
            <GlassCard style={styles.formCard} variant="default">
              <Text style={styles.cardTitle}>Welcome Back</Text>

              <View style={styles.inputGroup}>
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Mobile / Email</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'identifier' && styles.inputFocused
                  ]}>
                    <Ionicons name="person-outline" size={20} color={focusedInput === 'identifier' ? '#FFD700' : '#CCCCCC'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your ID"
                      placeholderTextColor="#999"
                      value={identifier}
                      onChangeText={setIdentifier}
                      onFocus={() => setFocusedInput('identifier')}
                      onBlur={() => setFocusedInput(null)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedInput === 'password' && styles.inputFocused
                  ]}>
                    <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#FFD700' : '#CCCCCC'} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      secureTextEntry
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: '#FFFFFF' }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>LOGIN</Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={{ alignSelf: 'center', marginTop: 8 }}>
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>

            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.footerLink}>Create Account</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 215, 0, 0.6)',
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#FFD700',
    letterSpacing: 6,
    fontWeight: '700',
    marginTop: 4,
  },

  // Card
  formCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 20,
    alignSelf: 'center',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 24,
  },
  fieldContainer: {
    gap: 6,
  },
  label: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputFocused: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    height: '100%',
  },

  // Button
  loginButton: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  linkText: {
    color: '#AAA',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#CCC',
    fontSize: 15,
  },
  footerLink: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '700',
  },
});
