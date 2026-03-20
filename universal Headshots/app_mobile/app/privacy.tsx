import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { MotiView } from 'moti';
import { BrandingHeader } from '../components/BrandingHeader';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-6 border-b border-white/5">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-full items-center justify-center"
        >
          <Icon component={ChevronLeft} size={20} color="white" />
        </TouchableOpacity>
        <BrandingHeader />
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-8 py-8" showsVerticalScrollIndicator={false}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
        >
          <Text className="text-white text-4xl font-black italic tracking-tight leading-tight mb-4 uppercase">
            Privacy Policy
          </Text>
          <Text className="text-violet-400 font-bold mb-12">Effective Date: March 18, 2026</Text>

          <View className="space-y-10">
            <View>
              <Text className="text-white font-black uppercase text-xl tracking-wide mb-4">1. Information We Collect</Text>
              <Text className="text-gray-400 leading-relaxed">
                We collect face photos you upload for the sole purpose of generating AI headshots using our proprietary Neural Studio Engine. We also collect authentication data (Google/Github) and payment transaction metadata.
              </Text>
            </View>

            <View>
              <Text className="text-white font-black uppercase text-xl tracking-wide mb-4">2. Data Security</Text>
              <Text className="text-gray-400 leading-relaxed">
                Your photos are processed in secure Google Cloud environments and are automatically purged from our temporary processing storage within 24 hours of successful generation.
              </Text>
            </View>

            <View>
              <Text className="text-white font-black uppercase text-xl tracking-wide mb-4">3. Third Party Services</Text>
              <Text className="text-gray-400 leading-relaxed">
                We use Firebase for authentication, Neural Studio for image generation, and RevenueCat for payment management. These partners maintain their own strict privacy standards.
              </Text>
            </View>

            <View className="h-20" />
          </View>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
