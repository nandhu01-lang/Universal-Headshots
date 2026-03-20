import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Share2, Grid, Filter, Zap, Image as ImageIcon } from 'lucide-react-native';
import { BrandingHeader } from '../../components/BrandingHeader';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function PortfolioScreen() {
  const [activeTab, setActiveTab] = useState('ALL');
  
  // Mock data for initial render
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-4 flex-row justify-between items-center">
          <BrandingHeader size="sm" />
          <TouchableOpacity className="bg-white/5 p-2.5 rounded-full border border-white/10">
            <Icon component={Zap} size={18} color="#facc15" fill="#facc15" />
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-6">
          <Text className="text-white text-3xl font-black italic tracking-tighter uppercase">Your Portfolio</Text>
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Neural Studio Exports • 4K Quality</Text>
        </View>

        <View className="px-6 mt-8 flex-row justify-between items-center">
          <View className="flex-row space-x-4">
            {['ALL', 'RECENT', 'FAVORITES'].map(tab => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
              >
                <Text className={`text-[10px] font-black uppercase tracking-widest ${activeTab === tab ? 'text-violet-500' : 'text-gray-600'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row space-x-2">
            <Icon component={Grid} size={16} color="#4b5563" />
            <Icon component={Filter} size={16} color="#4b5563" />
          </View>
        </View>

        {/* Portfolio Grid */}
        <View className="px-6 mt-6 flex-row flex-wrap justify-between gap-y-4">
          {items.map((i) => (
            <MotiView
              key={i}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 50 }}
              className="w-[31%] aspect-[3/4] bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
            >
              <Image 
                source={{ uri: `https://images.unsplash.com/photo-1560250097-0b93528c311a` }} 
                className="w-full h-full opacity-40" 
                resizeMode="cover"
              />
              <TouchableOpacity className="absolute bottom-2 right-2 bg-black/40 p-1.5 rounded-full">
                <Icon component={Download} size={12} color="white" />
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <View className="px-6 mt-10">
          <TouchableOpacity className="bg-violet-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-violet-600/40 flex-row space-x-3">
             <Icon component={Download} size={20} color="white" />
             <Text className="text-white font-black text-lg uppercase italic tracking-tighter">Download Entire Collection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="mt-4 h-16 rounded-[24px] items-center justify-center border border-white/10 flex-row space-x-3">
             <Icon component={Share2} size={18} color="white" />
             <Text className="text-white font-black text-sm uppercase tracking-widest italic">Share Portfolio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Empty State Suggestion if no items */}
      {items.length === 0 && (
         <View className="flex-1 items-center justify-center px-12 space-y-6">
            <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center border border-dashed border-white/10">
               <Icon component={ImageIcon} size={40} color="#4b5563" />
            </View>
            <Text className="text-white text-center font-bold">Your studio hasn't generated any headshots yet.</Text>
            <TouchableOpacity className="bg-violet-600 px-8 py-4 rounded-full">
               <Text className="text-white font-black">START GENERATING</Text>
            </TouchableOpacity>
         </View>
      )}
    </SafeAreaView>
  );
}
