import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import authService from '@/services/auth.service';
import { colors } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const { login } = useAuth();
  const { promptGoogleLogin, googleLoading, googleError, googleDisabled } = useGoogleAuth();

  const isAnyLoading = loading || googleLoading;

  useEffect(() => {
    if (googleError) {
      Alert.alert('Google Login Error', googleError);
    }
  }, [googleError]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      const result = await promptGoogleLogin();
      if (result?.type === 'success' && result.authentication?.idToken) {
        await authService.googleLogin(result.authentication.idToken);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      Alert.alert('Google Login Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerContainer}>
        <View style={styles.headerTextSection}>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to enjoy the best managing experience
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.formSheet}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={24}
              color="#7A9A85"
              style={styles.inputIcon}
            />
            <View style={styles.inputStack}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isAnyLoading}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Feather name="lock" size={24} color="#7A9A85" style={styles.inputIcon} />
            <View style={styles.inputStack}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                editable={!isAnyLoading}
              />
            </View>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#A0A0A0"
              />
            </TouchableOpacity>
          </View>



          {/* Login Button */}
          <TouchableOpacity
            style={[styles.submitButton, isAnyLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={isAnyLoading}
          >
            {loading ? (
              <ActivityIndicator color={colors.secondary} />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.socialButton, isAnyLoading && { opacity: 0.7 }]}
            onPress={handleGooglePress}
            disabled={isAnyLoading || googleDisabled}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer link to register */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={isAnyLoading}>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  headerContainer: { paddingHorizontal: 25, paddingTop: 150, paddingBottom: 20 },
  headerTextSection: { marginTop: 10 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: colors.card, marginBottom: 10 },
  headerSubtitle: { fontSize: 15, color: colors.text.light, lineHeight: 22 },
  formSheet: {
    flex: 1,
    backgroundColor: colors.card,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  inputIcon: { marginRight: 15 },
  inputStack: { flex: 1 },
  inputLabel: { fontSize: 11, color: colors.text.light, marginBottom: 2 },
  input: { fontSize: 16, color: colors.text.primary, fontWeight: '500', padding: 0 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 15, color: colors.text.light, fontSize: 13 },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    height: 55,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  socialButtonText: { marginLeft: 10, fontWeight: '600', color: colors.text.primary },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { color: colors.text.secondary, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 15 },

});