import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Shield, CreditCard, LogOut, ChevronRight, Settings, HelpCircle, Zap } from 'lucide-react-native';
import { BrandingHeader } from '../../components/BrandingHeader';
import { authService } from '../../services/authService';
import { MotiView } from 'moti';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await authService.getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-4 flex-row justify-between items-center">
          <BrandingHeader size="sm" />
          <TouchableOpacity className="bg-white/5 p-2 rounded-full">
            <Icon component={Settings} size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="px-6 mt-10">
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[40px] items-center space-y-4"
          >
            <View className="w-24 h-24 bg-violet-600 rounded-full items-center justify-center shadow-2xl shadow-violet-500/30">
              <Icon component={User} size={48} color="white" />
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-black italic tracking-tighter uppercase">{user?.email || 'Universal User'}</Text>
              <View className="bg-violet-600/20 px-4 py-1.5 rounded-full mt-2 border border-violet-500/30 flex-row items-center space-x-2">
                <Icon component={Zap} size={12} color="#8b5cf6" fill="#8b5cf6" />
                <Text className="text-violet-400 font-black text-[10px] uppercase tracking-widest">Free Explorer</Text>
              </View>
            </View>
          </MotiView>
        </View>

        {/* Quick Stats/Actions */}
        <View className="px-6 mt-10 space-y-4">
           {[
             { title: 'Upgrade to Studio Pro', icon: Zap, color: '#facc15', label: 'Recommended' },
             { title: 'Account Settings', icon: Shield, color: '#8b5cf6' },
             { title: 'Billing & Subscriptions', icon: CreditCard, color: '#8b5cf6' },
             { title: 'Help & Support', icon: HelpCircle, color: '#8b5cf6' },
           ].map((item, i) => (
             <TouchableOpacity 
              key={i}
              className="bg-white/5 border border-white/10 p-5 rounded-3xl flex-row items-center justify-between"
             >
               <View className="flex-row items-center space-x-4">
                 <View className="p-2 rounded-xl bg-white/5">
                   <Icon component={item.icon} size={20} color={item.color} />
                 </View>
                 <View>
                    <Text className="text-white font-bold text-base">{item.title}</Text>
                    {item.label && <Text className="text-violet-500 text-[8px] font-black uppercase tracking-widest mt-0.5">{item.label}</Text>}
                 </View>
               </View>
               <Icon component={ChevronRight} size={20} color="#4b5563" />
             </TouchableOpacity>
           ))}
        </View>

        {/* Logout Section */}
        <View className="px-6 mt-12">
          <TouchableOpacity 
            onPress={handleLogout}
            className="bg-red-500/10 border border-red-500/30 h-16 rounded-[24px] items-center justify-center flex-row space-x-3"
          >
            <Icon component={LogOut} size={20} color="#ef4444" />
            <Text className="text-red-500 font-black text-base uppercase italic tracking-tighter">Sign Out of Studio</Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-12 items-center">
          <Text className="text-gray-600 font-bold text-[10px] tracking-widest uppercase mb-2">Version 2.1.0 • Build 84</Text>
          <Text className="text-gray-700 text-[8px] italic">© 2026 UNIVERSAL HEADSHOTS UNLIMITED</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
