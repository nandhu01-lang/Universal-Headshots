import React from 'react';
import { Tabs } from 'expo-router';
import { Sparkles, User, Image as ImageIcon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#8b5cf6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 94,
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={80} 
            tint="dark" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              backgroundColor: 'transparent'
            }} 
          />
        ),
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color }) => <Sparkles size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <ImageIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
