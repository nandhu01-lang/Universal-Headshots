import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MotiView, MotiText } from 'moti';
import { useRouter } from 'expo-router';
import { ChevronRight, Sparkles, Globe, UserCheck, Zap } from 'lucide-react-native';
import { BrandingHeader } from '../components/BrandingHeader';

const Icon = ({ component: Component, size, color, fill }: any) => (
  <Component size={size} color={color} fill={fill} />
);

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-[#0A0A0F]" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Premium Background Pattern (Subtle Gradient) */}
      <View className="absolute top-0 left-0 right-0 h-[600px] bg-violet-950/20" />
      
      <View className="px-6 pt-16">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="items-center mb-6"
        >
          <BrandingHeader size="lg" />
        </MotiView>

        {/* Featured Multicultural Collage */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1000, type: 'timing' }}
          className="items-center mb-8"
        >
          <View className="w-full aspect-square rounded-[40px] overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-600/30">
            <Image 
              source={require('../assets/images/multicultural_headshots.png')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {/* Floating Badge */}
          <MotiView 
            animate={{ translateY: [0, -5, 0] }}
            transition={{ loop: true, duration: 3000 }}
            className="absolute -bottom-4 bg-violet-600 px-4 py-2 rounded-full shadow-lg flex-row items-center space-x-2"
          >
            <Icon component={Zap} size={14} color="white" fill="white" />
            <Text className="text-white font-black text-[10px] uppercase tracking-tighter">Neural Studio v2.1</Text>
          </MotiView>
        </MotiView>

        {/* Value Proposition */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          className="mb-10"
        >
          <Text className="text-white text-5xl font-black italic tracking-tighter uppercase leading-[0.85]">
            Universal{'\n'}
            <Text className="text-violet-500">Identity</Text>
          </Text>
          <Text className="text-gray-400 text-lg mt-4 font-bold uppercase tracking-widest text-[10px]">
            Professional headshots for every culture, style, and tradition.
          </Text>
        </MotiView>

        {/* Info Cards */}
        <View className="space-y-4 mb-10">
          <MotiView 
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 400 }}
            className="bg-white/5 border border-white/10 p-4 rounded-3xl flex-row items-center space-x-4"
          >
            <View className="w-12 h-12 bg-violet-600/20 rounded-2xl items-center justify-center">
              <Icon component={Globe} size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Global Styles</Text>
              <Text className="text-gray-500 text-xs">Traditional & modern attire from diverse global cultures</Text>
            </View>
          </MotiView>

          <MotiView 
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 500 }}
            className="bg-white/5 border border-white/10 p-4 rounded-3xl flex-row items-center space-x-4"
          >
            <View className="w-12 h-12 bg-violet-600/20 rounded-2xl items-center justify-center">
              <Icon component={UserCheck} size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Studio Quality</Text>
              <Text className="text-gray-500 text-xs">Neural-engine precision for professional results</Text>
            </View>
          </MotiView>
        </View>

        {/* Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          className="space-y-4"
        >
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)')}
            className="bg-violet-600 h-16 rounded-3xl items-center justify-center flex-row shadow-xl shadow-violet-600/40"
          >
            <Text className="text-white text-lg font-black uppercase tracking-widest mr-2">Start Designing</Text>
            <Icon component={ChevronRight} size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="h-16 rounded-3xl items-center justify-center border border-white/10"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Sign In / Register</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/features')}
            className="h-12 rounded-3xl items-center justify-center"
          >
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Explore Features</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </ScrollView>
  );
}
