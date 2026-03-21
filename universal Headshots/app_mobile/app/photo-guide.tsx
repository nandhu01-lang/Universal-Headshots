import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, CheckCircle2, XCircle, Camera, Sun, User, Glasses, Smile } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandingHeader } from '../components/BrandingHeader';

const { width } = Dimensions.get('window');

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

const DOs = [
  { icon: Sun, title: 'Good Lighting', desc: 'Face natural light or soft indoor lighting' },
  { icon: User, title: 'Clear Face', desc: 'Front-facing, no obstructions' },
  { icon: Smile, title: 'Neutral Expression', desc: 'Relaxed, slight smile preferred' },
  { icon: Camera, title: 'High Quality', desc: 'Use your best camera' },
];

const DONTs = [
  { icon: Glasses, title: 'No Glasses', desc: 'Remove sunglasses and regular glasses' },
  { icon: XCircle, title: 'No Group Photos', desc: 'Only you in the frame' },
  { icon: XCircle, title: 'No Hats/Headwear', desc: 'Hair should be visible' },
  { icon: XCircle, title: 'No Filters', desc: 'Avoid heavy filters or editing' },
];

const EXAMPLE_PHOTOS = [
  { type: 'good', label: 'Good Example', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { type: 'good', label: 'Good Example', uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { type: 'bad', label: 'Too Dark', uri: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400' },
  { type: 'bad', label: 'Side Profile', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
];

export default function PhotoGuideScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <BrandingHeader size="sm" />
          <TouchableOpacity onPress={() => router.back()} className="bg-white/5 p-2 rounded-full">
            <Icon component={XCircle} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View className="px-6 mt-4">
          <Text className="text-white text-3xl font-black italic tracking-tighter uppercase">
            Photo Guide
          </Text>
          <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest mt-2">
            Better Photos = Better Headshots
          </Text>
        </View>

        {/* Why Good Photos Matter */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mx-6 mt-8 p-6 bg-violet-600/10 rounded-[24px] border border-violet-500/20"
        >
          <Text className="text-white font-black text-lg italic uppercase tracking-tighter mb-2">
            Why Photo Quality Matters
          </Text>
          <Text className="text-gray-400 text-sm leading-relaxed">
            Our AI learns your facial features from the photos you provide. Clear, well-lit photos result in stunning professional headshots. Poor quality photos may produce disappointing results.
          </Text>
        </MotiView>

        {/* DOs Section */}
        <View className="px-6 mt-8">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-500/20 p-2 rounded-xl">
              <Icon component={CheckCircle2} size={20} color="#22c55e" />
            </View>
            <Text className="text-white font-black text-lg uppercase tracking-tighter ml-3">
              Do's
            </Text>
          </View>

          <View className="flex-row flex-wrap" style={{ marginHorizontal: -8 }}>
            {DOs.map((item, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 100 }}
                className="w-1/2 mb-4 px-2"
              >
                <View className="bg-white/5 p-4 rounded-2xl border border-white/10 h-full">
                  <View className="bg-violet-500/10 w-10 h-10 rounded-xl items-center justify-center mb-3">
                    <Icon component={item.icon} size={20} color="#8b5cf6" />
                  </View>
                  <Text className="text-white font-bold text-sm">{item.title}</Text>
                  <Text className="text-gray-500 text-[10px] mt-1">{item.desc}</Text>
                </View>
              </MotiView>
            ))}
          </View>
        </View>

        {/* DON'Ts Section */}
        <View className="px-6 mt-4">
          <View className="flex-row items-center mb-4">
            <View className="bg-red-500/20 p-2 rounded-xl">
              <Icon component={XCircle} size={20} color="#ef4444" />
            </View>
            <Text className="text-white font-black text-lg uppercase tracking-tighter ml-3">
              Don'ts
            </Text>
          </View>

          <View className="flex-row flex-wrap" style={{ marginHorizontal: -8 }}>
            {DONTs.map((item, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 100 }}
                className="w-1/2 mb-4 px-2"
              >
                <View className="bg-white/5 p-4 rounded-2xl border border-white/10 h-full">
                  <View className="bg-red-500/10 w-10 h-10 rounded-xl items-center justify-center mb-3">
                    <Icon component={item.icon} size={20} color="#ef4444" />
                  </View>
                  <Text className="text-white font-bold text-sm">{item.title}</Text>
                  <Text className="text-gray-500 text-[10px] mt-1">{item.desc}</Text>
                </View>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Photo Examples */}
        <View className="px-6 mt-8">
          <Text className="text-white font-black text-lg uppercase tracking-tighter mb-4">
            Examples
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {EXAMPLE_PHOTOS.map((photo, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: 20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 100 }}
                className="mr-4"
              >
                <View className="relative">
                  <Image
                    source={{ uri: photo.uri }}
                    className="w-32 h-40 rounded-2xl"
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl justify-end p-2"
                  >
                    <Text className={`text-[10px] font-black uppercase ${photo.type === 'good' ? 'text-green-400' : 'text-red-400'}`}>
                      {photo.label}
                    </Text>
                  </LinearGradient>
                  <View className={`absolute top-2 right-2 w-6 h-6 rounded-full items-center justify-center ${photo.type === 'good' ? 'bg-green-500' : 'bg-red-500'}`}>
                    <Icon component={photo.type === 'good' ? CheckCircle2 : XCircle} size={14} color="white" />
                  </View>
                </View>
              </MotiView>
            ))}
          </ScrollView>
        </View>

        {/* Tips Section */}
        <View className="px-6 mt-8 p-6 bg-white/5 rounded-[24px] border border-white/10">
          <Text className="text-white font-black text-lg uppercase tracking-tighter mb-4">
            Pro Tips
          </Text>
          {[
            'Upload 4-8 photos for best results',
            'Include variety: different angles, lighting, expressions',
            'Make sure your face is clearly visible in all photos',
            'Recent photos work best (within last 2 years)',
          ].map((tip, i) => (
            <View key={i} className="flex-row items-start mb-3">
              <View className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 mr-3" />
              <Text className="text-gray-400 text-sm flex-1">{tip}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <View className="px-6 mt-8 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-violet-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-violet-600/40"
          >
            <View className="flex-row items-center">
              <Text className="text-white font-black text-lg italic tracking-tighter uppercase mr-2">
                Start Uploading
              </Text>
              <Icon component={ChevronRight} size={20} color="white" />
            </View>
          </TouchableOpacity>

          <Text className="text-gray-600 text-center text-[10px] font-bold uppercase tracking-widest mt-4">
            Upload 4-8 Photos Required
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
