console.log('[Index] File Loaded');
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Upload,
  CheckCircle2,
  Download,
  ChevronRight,
  Camera,
  X,
  Palette,
  Zap,
  HelpCircle,
  Coins,
  Info
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import Constants from '@/constants/Constants';
import { idService } from '../../services/idService';
import { authService } from '../../services/authService';
import { notifyHeadshotsComplete, notifyHeadshotsFailed } from '../../services/notificationService';
import { BrandingHeader } from '../../components/BrandingHeader';

const STYLES = {
  MALE: {
    GLOBAL: [
      { id: 'm_ceo', name: 'Elite CEO', preview: 'https://images.unsplash.com/photo-1560250097-0b93528c311a' },
      { id: 'm_tech', name: 'Tech Visionary', preview: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7' }
    ],
    USA: [
      { id: 'm_wall_st', name: 'Wall Street', preview: 'https://images.unsplash.com/photo-1556157382-97eda2d62296' },
      { id: 'm_casual_pro', name: 'Silicon Valley', preview: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' }
    ],
    BRAZIL: [
      { id: 'm_brazil_exec', name: 'São Paulo Executive', preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }
    ],
    JAPAN: [
      { id: 'm_japan_pro', name: 'Tokyo Professional', preview: 'https://images.unsplash.com/photo-1504257432389-523431e11832' }
    ],
    FRANCE: [
      { id: 'm_france_chic', name: 'Parisian Creative', preview: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4' }
    ],
    UK: [
      { id: 'm_london_fin', name: 'London Finance', preview: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce' }
    ],
    INDIA: [
      { id: 'm_kurta', name: 'Royal Kurta Pro', preview: 'https://images.unsplash.com/photo-1558221673-4474f310f000' }
    ],
    UAE: [
      { id: 'm_thobe', name: 'Dubai Elite', preview: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c' }
    ]
  },
  FEMALE: {
    GLOBAL: [
      { id: 'f_boardroom', name: 'Boardroom Chic', preview: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2' },
      { id: 'f_creative', name: 'Artistic Lead', preview: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' }
    ],
    USA: [
      { id: 'f_ny_exec', name: 'Manhattan Pro', preview: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }
    ],
    BRAZIL: [
      { id: 'f_rio_pro', name: 'Ipanema Chic', preview: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04' }
    ],
    JAPAN: [
      { id: 'f_osaka_led', name: 'Kyoto Grace', preview: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' }
    ],
    FRANCE: [
      { id: 'f_parisian', name: 'Parisian Elite', preview: 'https://images.unsplash.com/photo-1517841905240-472988babdf9' }
    ],
    UK: [
      { id: 'f_london_media', name: 'London Media', preview: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1' }
    ],
    INDIA: [
      { id: 'f_saree', name: 'Imperial Saree', preview: 'https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f01' }
    ],
    UAE: [
      { id: 'f_abaya', name: 'Abaya Elegance', preview: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f' }
    ]
  },
  NON_BINARY: {
    GLOBAL: [
      { id: 'nb_pro', name: 'Modern Neutral', preview: 'https://images.unsplash.com/photo-1542206395976-33caa456a4b1' }
    ],
    USA: [
      { id: 'nb_sf_creative', name: 'SF Creative Neutral', preview: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
    ],
    LATAM: [
      { id: 'nb_mexico_city', name: 'Condesa Modern', preview: 'https://images.unsplash.com/photo-1517070208541-6ddc4d3efbcb' }
    ],
    EUROPE: [
      { id: 'nb_berlin', name: 'Berlin Creative', preview: 'https://images.unsplash.com/photo-1554151228-14d9def656e4' }
    ]
  }
};

// Generation cost in credits
const GENERATION_COST = 1;

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

export default function Dashboard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('MALE');
  const [country, setCountry] = useState('GLOBAL');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number>(0); // User's credit balance
  const [checkingCredits, setCheckingCredits] = useState(false);

  const touchStart = useRef({ x: 0, y: 0 });

  // Load user identity and credits
  useEffect(() => {
    const initIdentity = async () => {
      const id = await idService.getDeviceId();
      setDeviceId(id);
      const user = await authService.getCurrentUser();
      if (user) setUserId(user.uid);

      // Fetch credits from backend (mock for now)
      // In production: fetchCredits(user?.uid);
      setCredits(5); // Mock: 5 credits
    };
    initIdentity();
  }, []);

  // Back handler
  useEffect(() => {
    const handleBackPress = () => {
      if (step > 1) {
        setStep(step - 1);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [step]);

  // Pick images
  const pickImage = async () => {
    console.log('[Dashboard] pickImage called');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 8 - images.length,
      quality: 1,
    });
    if (!result.canceled) {
      const newImages = [...images, ...result.assets.map(a => a.uri)];
      setImages(newImages);

      // Auto navigate to review if we have enough photos
      if (newImages.length >= 4) {
        Alert.alert(
          'Photos Selected',
          `${newImages.length} photos selected. Would you like to review them or add more?`,
          [
            { text: 'Add More', style: 'cancel' },
            {
              text: 'Review',
              onPress: () => router.push({
                pathname: '/photo-review',
                params: { uris: JSON.stringify(newImages) }
              })
            }
          ]
        );
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Check credits before generation
  const checkCredits = async (): Promise<boolean> => {
    setCheckingCredits(true);

    // In production, fetch from backend
    // const response = await fetch(`${Constants.ENDPOINTS.CREDITS}/${userId}`);
    // const data = await response.json();
    // const userCredits = data.balance;

    const userCredits = credits; // Mock

    if (userCredits < GENERATION_COST) {
      setCheckingCredits(false);
      Alert.alert(
        'Insufficient Credits',
        `You need ${GENERATION_COST} credit to generate headshots. Would you like to purchase credits?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Buy Credits', onPress: () => router.push('/modal') }
        ]
      );
      return false;
    }

    setCheckingCredits(false);
    return true;
  };

  // Start generation
  const startGeneration = async () => {
    if (images.length < 4) {
      Alert.alert('Selection Required', 'Please upload at least 4 photos.');
      return;
    }

    // Check credits first
    const hasCredits = await checkCredits();
    if (!hasCredits) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('userId', userId || 'anonymous');
      formData.append('gender', gender);
      formData.append('country', country);
      formData.append('deviceId', deviceId || 'unknown');
      formData.append('style', selectedStyle || '');

      images.forEach((uri, index) => {
        formData.append('photos', { uri, name: `photo_${index}.jpg`, type: 'image/jpeg' } as any);
      });

      const token = await authService.getIdToken();

      const response = await fetch(Constants.ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      setBatchId(result.batchId);

      // Deduct credits locally (backend should also verify)
      setCredits(c => c - GENERATION_COST);

      // Navigate to processing screen
      router.push({
        pathname: '/processing',
        params: { batchId: result.batchId }
      });

    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  console.log('[Dashboard] State:', { step, imagesCount: images.length });

  // Step 1: Photo Upload
  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="space-y-6">
        {/* Photo Guide Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="bg-violet-600/10 rounded-[24px] p-5 border border-violet-500/20"
        >
          <View className="flex-row items-start">
            <View className="bg-violet-500/20 p-3 rounded-2xl mr-4">
              <Icon component={Info} size={24} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">First Time?</Text>
              <Text className="text-gray-400 text-sm mb-3">
                Learn how to take the best photos for AI headshot generation.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/photo-guide')}
                className="flex-row items-center"
              >
                <Text className="text-violet-400 font-bold mr-2">View Photo Guide</Text>
                <Icon component={ChevronRight} size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Title */}
        <View>
          <Text className="text-white text-3xl font-black italic tracking-tighter uppercase leading-tight">
            Studio Workspace
          </Text>
          <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest mt-2">
            Phase 1: Input Assets
          </Text>
        </View>

        {/* Photo Grid */}
        {images.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {images.map((uri, idx) => (
              <View key={idx} className="w-[23%] aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/10">
                <Image source={{ uri }} className="w-full h-full" />
                <TouchableOpacity
                  onPress={() => removeImage(idx)}
                  className="absolute top-2 right-2 bg-black/80 rounded-full p-1 border border-white/20"
                >
                  <Icon component={X} size={10} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 8 && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-[23%] aspect-square rounded-2xl bg-white/5 border border-dashed border-violet-500/40 items-center justify-center"
              >
                <Icon component={Camera} size={24} color="#8b5cf6" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickImage}
            className="bg-white/5 border-2 border-dashed border-violet-500/20 rounded-[40px] p-12 items-center justify-center"
          >
            <Icon component={Upload} size={32} color="#8b5cf6" />
            <Text className="text-white text-xl font-black italic tracking-tighter uppercase mt-4">Import Assets</Text>
            <Text className="text-gray-500 text-center font-bold uppercase tracking-widest text-[9px] mt-2">Upload 4-8 clear photos</Text>
          </TouchableOpacity>
        )}

        {/* Actions */}
        {images.length > 0 && (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={pickImage}
              className="bg-white/5 border border-white/10 h-14 rounded-[20px] items-center justify-center flex-row"
            >
              <Icon component={Camera} size={18} color="#8b5cf6" />
              <Text className="text-white font-bold ml-2">Add More Photos</Text>
              <Text className="text-gray-500 text-xs ml-2">({images.length}/8)</Text>
            </TouchableOpacity>

            {images.length >= 4 && (
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/photo-review',
                  params: { uris: JSON.stringify(images) }
                })}
                className="bg-violet-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-violet-600/40"
              >
                <View className="flex-row items-center">
                  <Text className="text-white font-black text-lg italic tracking-tighter uppercase mr-2">
                    Review {images.length} Photos
                  </Text>
                  <Icon component={ChevronRight} size={20} color="white" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Step 2: Style Selection
  const renderStep2 = () => (
    <View className="flex-1">
      <View className="bg-red-600 p-2 items-center mb-6 rounded-xl">
        <Text className="text-white font-black text-[10px] uppercase">Render Engine: Style Portfolio Active</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View className="space-y-8">
          <View className="flex-row justify-between items-end">
            <View className="flex-1">
              <Text className="text-white text-3xl font-black italic tracking-tighter uppercase">Style Studio</Text>
              <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest mt-2">{country} • {gender.replace('_', ' ')}</Text>
            </View>
            <View className="bg-white/5 p-1 rounded-full flex-row border border-white/10">
              {['MALE', 'FEMALE', 'NON_BINARY'].map(g => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`px-4 py-2 rounded-full ${gender === g ? 'bg-violet-600' : ''}`}
                >
                  <Text className={`text-[9px] font-black uppercase ${gender === g ? 'text-white' : 'text-gray-500'}`}>{g.split('_')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
            <View className="flex-row space-x-3">
              {Object.keys(STYLES[gender as keyof typeof STYLES] || {}).map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCountry(c)}
                  className={`px-5 py-2.5 rounded-full border-2 ${country === c ? 'bg-violet-600/10 border-violet-500' : 'bg-white/5 border-white/5'}`}
                >
                  <Text className={`text-[10px] font-black uppercase tracking-tighter ${country === c ? 'text-violet-400' : 'text-gray-500'}`}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {((STYLES[gender as keyof typeof STYLES] as any)?.[country] || (STYLES[gender as keyof typeof STYLES] as any)?.['GLOBAL'] || []).map((s: any) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedStyle(s.id)}
                className={`bg-violet-900/40 rounded-[32px] border-2 overflow-hidden ${selectedStyle === s.id ? 'border-violet-400' : 'border-white/10'}`}
                style={{ width: '48%', height: 240, marginBottom: 16 }}
              >
                <View className="absolute inset-0 bg-violet-600/10 items-center justify-center">
                  <ActivityIndicator size="small" color="#8b5cf6" />
                </View>

                <Image
                  source={{ uri: s.preview }}
                  className="absolute inset-0 w-full h-full opacity-60"
                />

                <LinearGradient colors={['transparent', 'rgba(10,10,15,0.95)']} className="absolute inset-0" />
                <View className="absolute bottom-4 left-4 right-4">
                  <Text className="text-violet-400 text-[8px] font-black tracking-widest uppercase mb-0.5">{country}</Text>
                  <Text className="text-white font-black text-xs uppercase tracking-tighter italic">{s.name}</Text>
                </View>
                {selectedStyle === s.id && (
                  <View className="absolute top-4 right-4 bg-violet-600 rounded-full p-2 border-2 border-white/20">
                    <Icon component={CheckCircle2} size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {((STYLES[gender as keyof typeof STYLES] as any)?.[country] || (STYLES[gender as keyof typeof STYLES] as any)?.['GLOBAL'] || []).length === 0 && (
              <View className="w-full p-8 bg-red-600/20 rounded-3xl border border-red-500/20">
                <Text className="text-red-400 font-bold text-center">No styles available for {country}/{gender}</Text>
              </View>
            )}
          </View>

          {/* Credit Info */}
          <View className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Icon component={Coins} size={20} color="#fbbf24" />
                <View className="ml-3">
                  <Text className="text-white font-bold">Generation Cost</Text>
                  <Text className="text-gray-500 text-xs">{GENERATION_COST} credit per batch</Text>
                </View>
              </View>
              <View className="bg-violet-600/20 px-3 py-2 rounded-full">
                <Text className="text-violet-400 font-bold text-sm">{credits} Credits</Text>
              </View>
            </View>
          </View>

          {selectedStyle && (
            <TouchableOpacity
              onPress={startGeneration}
              disabled={uploading || checkingCredits}
              className={`bg-violet-600 h-18 py-5 rounded-[24px] items-center justify-center shadow-2xl shadow-violet-600/40 ${uploading || checkingCredits ? 'opacity-50' : ''}`}
            >
              {uploading || checkingCredits ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-black text-xl italic tracking-tighter uppercase">Forge Portfolios</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => setStep(1)} className="py-2 items-center">
            <Text className="text-gray-500 font-bold uppercase tracking-widest text-[9px]">← Reset Assets</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <View className="flex-1">
        {/* Header with Credits */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <BrandingHeader />

          <View className="flex-row items-center">
            {/* Credits Badge */}
            <TouchableOpacity
              onPress={() => router.push('/modal')}
              className="flex-row items-center bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30 mr-3"
            >
              <Icon component={Coins} size={14} color="#fbbf24" />
              <Text className="text-yellow-400 font-bold text-sm ml-1.5">{credits}</Text>
            </TouchableOpacity>

            <View className="bg-violet-600/20 px-3 py-1 rounded-full border border-violet-500/30">
              <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest">Step {step}/2</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mt-4 flex-1">
          {step === 1 ? renderStep1() : renderStep2()}
        </View>

        <View className="px-6 py-6 items-center">
          <Text className="text-gray-600 text-[8px] font-black tracking-widest">© 2026 UNIVERSAL HEADSHOTS</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
