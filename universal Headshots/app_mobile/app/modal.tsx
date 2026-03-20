import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, Zap, ShieldCheck, Star, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function PaywallScreen() {
  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Image/Gradient */}
        <LinearGradient
          colors={['#4c1d95', '#0A0A0F']}
          className="h-64 items-center justify-center pt-10"
        >
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-violet-600 rounded-[32px] items-center justify-center shadow-2xl shadow-violet-500/50"
          >
            <Icon component={Zap} size={48} color="white" fill="white" />
          </MotiView>
          <Text className="text-white text-3xl font-black italic mt-6 tracking-tighter">
            PRO BUNDLE
          </Text>
        </LinearGradient>

        <View className="px-8 mt-4">
          <Text className="text-gray-400 text-center text-lg mb-8">
            Unlock the full potential of your professional AI studio.
          </Text>

          {/* Features */}
          <View className="space-y-6">
            {[
              { title: '100+ Professional Headshots', desc: 'Multiple styles from CEO to Tech Founder.', icon: ShieldCheck },
              { title: 'High-Res Studio Export', desc: 'Crystal clear 4K resolutions for prints.', icon: Star },
              { title: 'Priority Studio Generation', desc: 'Skip the queue with faster proprietary AI processing.', icon: Zap },
            ].map((f, i) => (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 200 * i }}
                className="flex-row items-start space-x-4"
              >
                <View className="bg-violet-500/10 p-2 rounded-xl mt-1">
                  <Icon component={f.icon} size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">{f.title}</Text>
                  <Text className="text-gray-500 text-sm">{f.desc}</Text>
                </View>
              </MotiView>
            ))}
          </View>

          {/* Pricing Cards */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 800 }}
            className="mt-12 space-y-4"
          >
            {[
              { title: 'BONUS BASIC 5', price: '$5', desc: '2 Refinements (8 Images)', credits: 2, icon: Zap },
              { title: 'BONUS STARTER 12', price: '$12', desc: '5 Refinements (20 Images)', credits: 5, icon: Star, best: true },
              { title: 'BONUS PRO 18', price: '$18', desc: '10 Refinements (40 Images)', credits: 10, icon: Trophy },
            ].map((pack, i) => (
              <TouchableOpacity 
                key={i}
                className={`bg-white/5 border ${pack.best ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/10'} rounded-[24px] p-6 items-center flex-row justify-between`}
              >
                <View className="flex-row items-center space-x-4">
                  <View className="bg-violet-500/10 p-2 rounded-xl">
                    <Icon component={pack.icon || Zap} size={18} color="#8b5cf6" />
                  </View>
                  <View>
                    <Text className="text-white font-black text-sm italic uppercase tracking-tighter">{pack.title}</Text>
                    <Text className="text-gray-500 text-[10px] font-bold">{pack.desc}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white text-xl font-black italic">{pack.price}</Text>
                  {pack.best && <Text className="text-violet-400 text-[8px] font-black uppercase tracking-widest">BEST VALUE</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </MotiView>

          <TouchableOpacity className="mt-8 items-center">
            <Text className="text-gray-500 font-bold text-[10px] tracking-widest uppercase underline">
              RESTORE PREVIOUS PURCHASE
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
