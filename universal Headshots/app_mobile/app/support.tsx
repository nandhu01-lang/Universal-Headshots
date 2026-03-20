import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Send, CheckCircle2, Mail, User, MessageSquare, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { BrandingHeader } from '../components/BrandingHeader';
import Constants from '@/constants/Constants';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function SupportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Missing Info', 'Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      // Note: In local dev, use the exact local IP or localhost if running in internal environment
      // For real testing, we'd use the deployed API URL
      const response = await fetch(`${Constants.API_URL}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Support Request Error:', error);
      Alert.alert('Network Error', 'Could not connect to the support server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      {/* Background Glow */}
      <View 
        className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-violet-600/10 rounded-full blur-[100px]" 
      />
      
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between py-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full items-center justify-center"
          >
            <Icon component={ChevronLeft} size={20} color="white" />
          </TouchableOpacity>
          <BrandingHeader />
          <View className="w-10" />
        </View>

        <AnimatePresence>
          {success ? (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-20 items-center justify-center"
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                className="w-24 h-24 rounded-full items-center justify-center mb-8"
              >
                <Icon component={CheckCircle2} size={48} color="white" />
              </LinearGradient>
              <Text className="text-white text-3xl font-black italic uppercase mb-2 tracking-tighter">Universal Headshots</Text>
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Premium Support Center</Text>
              <Text className="text-gray-400 text-center px-12 mb-12">
                Our support team will get back to you at {formData.email} as soon as possible.
              </Text>
              <TouchableOpacity 
                onPress={() => router.back()}
                className="bg-white h-16 w-full rounded-[24px] items-center justify-center"
              >
                <Text className="text-black font-black text-xl italic tracking-tighter">BACK TO HOME</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              className="space-y-8 py-4"
            >
              <View>
                <Text className="text-white text-4xl font-black italic tracking-tight leading-tight mb-2">
                  How can we{'\n'}help you?
                </Text>
                <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                  Direct support for our premium members
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-4">
                <View className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-1">
                  <View className="flex-row items-center space-x-3 mb-1">
                    <Icon component={User} size={14} color="#6b7280" />
                    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Full Name</Text>
                  </View>
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="#374151"
                    className="text-white text-lg font-medium h-12"
                    value={formData.name}
                    onChangeText={(t) => setFormData({...formData, name: t})}
                  />
                </View>

                <View className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-1">
                  <View className="flex-row items-center space-x-3 mb-1">
                    <Icon component={Mail} size={14} color="#6b7280" />
                    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Email Address</Text>
                  </View>
                  <TextInput
                    placeholder="john@example.com"
                    placeholderTextColor="#374151"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-white text-lg font-medium h-12"
                    value={formData.email}
                    onChangeText={(t) => setFormData({...formData, email: t})}
                  />
                </View>

                <View className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-1">
                  <View className="flex-row items-center space-x-3 mb-1">
                    <Icon component={BookOpen} size={14} color="#6b7280" />
                    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Subject</Text>
                  </View>
                  <TextInput
                    placeholder="Service Query"
                    placeholderTextColor="#374151"
                    className="text-white text-lg font-medium h-12"
                    value={formData.subject}
                    onChangeText={(t) => setFormData({...formData, subject: t})}
                  />
                </View>

                <View className="bg-white/5 border border-white/10 rounded-[28px] px-6 py-4 h-48">
                  <View className="flex-row items-center space-x-3 mb-2">
                    <Icon component={MessageSquare} size={14} color="#6b7280" />
                    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Message</Text>
                  </View>
                  <TextInput
                    placeholder="Tell us about your issue..."
                    placeholderTextColor="#374151"
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    className="text-white text-lg font-medium flex-1"
                    value={formData.message}
                    onChangeText={(t) => setFormData({...formData, message: t})}
                  />
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={loading}
                className="mt-4"
              >
                <LinearGradient
                  colors={['#8b5cf6', '#d946ef']}
                  className="h-16 rounded-[24px] items-center justify-center flex-row shadow-xl shadow-violet-500/20"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white font-black text-xl italic tracking-tighter mr-3">
                        SEND MESSAGE
                      </Text>
                      <Icon component={Send} size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="h-20" />
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
}
