import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, LogIn, ChevronLeft, Globe, Phone, Apple } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { authService } from '../../services/authService';
import { BrandingHeader } from '../../components/BrandingHeader';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function LoginScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'EMAIL' | 'PHONE'>('EMAIL');

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const result = isSignUp 
        ? await authService.signUp(email, password)
        : await authService.signIn(email, password);
        
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Auth Failed', result.error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-8"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between py-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-full items-center justify-center"
            >
              <Icon component={ChevronLeft} size={20} color="white" />
            </TouchableOpacity>
            <BrandingHeader size="sm" />
            <View className="w-10" />
          </View>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mt-8 mb-8"
          >
            <Text className="text-white text-4xl font-black italic tracking-tighter uppercase leading-none">
              {isSignUp ? 'Global\nImpact' : 'Universal\nAccess'}
            </Text>
            <Text className="text-violet-400 text-lg mt-4 font-bold uppercase tracking-widest text-[10px]">
              {isSignUp ? 'Join our multicultural studio' : 'Log in to your professional studio'}
            </Text>
          </MotiView>

          {/* Form */}
          <View className="space-y-4">
            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center space-x-3">
              <Icon component={Mail} size={20} color="#6b7280" />
              <TextInput 
                placeholder="Email Address"
                placeholderTextColor="#4b5563"
                className="flex-1 text-white text-base font-bold"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center space-x-3">
              <Icon component={Lock} size={20} color="#6b7280" />
              <TextInput 
                placeholder="Password"
                placeholderTextColor="#4b5563"
                className="flex-1 text-white text-base font-bold"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              onPress={handleAuth}
              disabled={loading}
              className="bg-violet-600 h-16 rounded-[24px] items-center justify-center flex-row space-x-3 mt-4 shadow-lg shadow-violet-600/20"
            >
              <Text className="text-white font-black text-xl italic tracking-tighter">
                {loading ? 'PROCESSING...' : (isSignUp ? 'SIGN UP' : 'LOG IN')}
              </Text>
              {!loading && <Icon component={LogIn} size={20} color="white" />}
              {loading && <ActivityIndicator color="white" size="small" />}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-[1px] bg-white/5" />
            <Text className="mx-4 text-gray-700 font-black text-[10px] tracking-widest uppercase">
              OR CONTINUE WITH
            </Text>
            <View className="flex-1 h-[1px] bg-white/5" />
          </View>

          {/* Social Logins */}
          <View className="space-y-3">
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={async () => {
                  setLoading(true);
                  const result = await authService.signInWithGoogle();
                  if (result.success) {
                    router.replace('/(tabs)');
                  } else {
                    Alert.alert('Google Sign-In Failed', result.error);
                  }
                  setLoading(false);
                }}
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl items-center justify-center flex-row space-x-2"
              >
                <Icon component={Globe} size={18} color="white" />
                <Text className="text-white font-bold text-xs">GOOGLE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={async () => {
                  setLoading(true);
                  const result = await authService.signInWithApple();
                  if (result.success) {
                    router.replace('/(tabs)');
                  } else {
                    Alert.alert('Apple Sign-In Failed', result.error);
                  }
                  setLoading(false);
                }}
                disabled={loading}
                className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl items-center justify-center flex-row space-x-2"
              >
                <Icon component={Apple} size={18} color="white" />
                <Text className="text-white font-bold text-xs tracking-tighter uppercase font-black italic">APPLE</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={() => Alert.alert('Coming Soon', 'Phone number authentication will be available soon.')}
              className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl items-center justify-center flex-row space-x-2"
            >
              <Icon component={Phone} size={18} color="white" />
              <Text className="text-white font-bold text-xs">PHONE NUMBER</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-auto py-10 items-center">
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                {isSignUp ? 'ALREADY HAVE AN ACCOUNT?' : "DON'T HAVE AN ACCOUNT?"} <Text className="text-violet-500">{isSignUp ? 'LOG IN' : 'SIGN UP'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
