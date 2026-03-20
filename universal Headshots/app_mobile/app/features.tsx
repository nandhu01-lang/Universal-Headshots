import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Globe, UserCheck, Zap, ShieldCheck, Camera, Palette } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { BrandingHeader } from '../components/BrandingHeader';

const { width } = Dimensions.get('window');

const Icon = ({ component: Component, size, color, fill }: any) => (
  <Component size={size} color={color} fill={fill} />
);

export default function FeaturesScreen() {
  const router = useRouter();

  const features = [
    {
      icon: Globe,
      title: 'Multicultural Library',
      desc: 'Extensive library of traditional and modern professional styles from every corner of the globe.',
      color: '#8b5cf6'
    },
    {
      icon: Sparkles,
      title: 'Neural Identity',
      desc: 'Our v2.1 engine preserves your unique facial features with 99.8% precision.',
      color: '#d946ef'
    },
    {
      icon: Camera,
      title: 'Studio Lighting',
      desc: 'Advanced cinematic lightning and high-end professional camera bokeh effects.',
      color: '#0ea5e9'
    },
    {
      icon: ShieldCheck,
      title: 'Data Privacy',
      desc: 'Bank-grade encryption. Your photos are never stored longer than needed for synthesis.',
      color: '#10b981'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      {/* Background Accent */}
      <View className="absolute top-0 right-0 w-full h-[300px] opacity-20">
        <LinearGradient colors={['#8b5cf6', 'transparent']} className="flex-1" />
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Navigation */}
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

        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-12 mt-4"
        >
          <Text className="text-white text-4xl font-black italic tracking-tighter uppercase leading-tight">
            The World's{'\n'}
            <Text className="text-violet-500">First Universal</Text>{'\n'}
            AI Studio
          </Text>
          <Text className="text-gray-400 text-sm mt-4 font-bold uppercase tracking-widest leading-relaxed">
            We've redefined professional headshots through a multicultural lens, combining neural precision with global identity.
          </Text>
        </MotiView>

        {/* Feature Grid */}
        <View className="space-y-6 mb-12">
          {features.map((item, idx) => (
            <MotiView
              key={idx}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: idx * 100 }}
              className="bg-white/5 border border-white/10 p-5 rounded-[32px] flex-row items-start space-x-5"
            >
              <View 
                style={{ backgroundColor: `${item.color}20` }}
                className="w-14 h-14 rounded-2xl items-center justify-center"
              >
                <Icon component={item.icon} size={28} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg italic tracking-tight uppercase">{item.title}</Text>
                <Text className="text-gray-500 text-sm mt-1 leading-relaxed">{item.desc}</Text>
              </View>
            </MotiView>
          ))}
        </View>

        {/* Visual Showcase (Placeholder for Collage) */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-violet-600/10 border border-violet-500/20 rounded-[40px] p-8 items-center mb-12"
        >
          <View className="w-16 h-16 bg-violet-600/20 rounded-full items-center justify-center mb-6">
            <Icon component={Palette} size={32} color="#8b5cf6" />
          </View>
          <Text className="text-white text-center font-black italic text-xl uppercase tracking-tighter mb-2">Designed for Everyone</Text>
          <Text className="text-gray-500 text-center text-xs px-4">
            From Silicon Valley professionals to traditional Emirati attire, our engine is trained on diverse identities to guarantee a perfect result every time.
          </Text>
        </MotiView>

        {/* Bottom CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          className="mb-20"
        >
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="bg-violet-600 h-16 rounded-3xl items-center justify-center flex-row shadow-2xl shadow-violet-600/40"
          >
            <Text className="text-white text-lg font-black uppercase tracking-widest mr-2">Experience the Forge</Text>
            <Icon component={Zap} size={20} color="white" fill="white" />
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
