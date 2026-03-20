import React from 'react';
import { View, Text, Image } from 'react-native';
import { MotiView } from 'moti';

export const BrandingHeader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const iconSize = size === 'sm' ? 24 : size === 'md' ? 40 : 64;
  const textSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl';

  return (
    <MotiView 
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-row items-center space-x-2"
    >
      <View className="rounded-xl overflow-hidden shadow-lg shadow-violet-600/20 border border-violet-500/30">
        <Image 
          source={require('../assets/images/icon.png')} 
          style={{ width: iconSize, height: iconSize }}
          resizeMode="cover"
        />
      </View>
      <View>
        <Text className={`${textSize} text-white font-black italic tracking-tighter uppercase`}>
          Universal <Text className="text-violet-500">Headshots</Text>
        </Text>
        {size !== 'sm' && (
          <Text className="text-[8px] text-gray-500 font-bold uppercase tracking-widest -mt-1">
            Global • Traditional • Professional
          </Text>
        )}
      </View>
    </MotiView>
  );
};
