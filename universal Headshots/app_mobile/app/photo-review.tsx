import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ImagePlus
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { BrandingHeader } from '../components/BrandingHeader';

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

interface PhotoItem {
  uri: string;
  id: string;
  status: 'pending' | 'checking' | 'good' | 'warning';
  issues?: string[];
}

const QUALITY_CHECKS = [
  { name: 'Face Detected', key: 'face' },
  { name: 'Good Lighting', key: 'lighting' },
  { name: 'Not Blurry', key: 'blur' },
  { name: 'Front-facing', key: 'angle' },
];

// Simulate photo quality check (in production, this would use ML)
const simulatePhotoCheck = async (uri: string): Promise<{ status: 'good' | 'warning'; issues?: string[] }> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  // Randomly assign quality (in production, use actual ML models)
  const random = Math.random();
  if (random > 0.7) {
    return {
      status: 'warning',
      issues: ['Check lighting', 'Consider retaking']
    };
  }
  return { status: 'good' };
};

export default function PhotoReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    const initialUris = params.uris ? JSON.parse(params.uris as string) : [];
    return initialUris.map((uri: string, index: number) => ({
      uri,
      id: `photo_${index}`,
      status: 'pending',
    }));
  });
  const [checking, setChecking] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  // Run quality checks on all photos
  const runQualityChecks = useCallback(async () => {
    setChecking(true);

    const checkedPhotos = await Promise.all(
      photos.map(async (photo) => {
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, status: 'checking' } : p
        ));

        const result = await simulatePhotoCheck(photo.uri);

        return {
          ...photo,
          status: result.status,
          issues: result.issues,
        };
      })
    );

    setPhotos(checkedPhotos);
    setAllChecked(true);
    setChecking(false);
  }, [photos]);

  // Add more photos
  const addMorePhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 8 - photos.length,
      quality: 1,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, index) => ({
        uri: asset.uri,
        id: `photo_${Date.now()}_${index}`,
        status: 'pending' as const,
      }));
      setPhotos([...photos, ...newPhotos]);
      setAllChecked(false);
    }
  };

  // Remove a photo
  const removePhoto = (id: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(photos.filter(p => p.id !== id));
            setAllChecked(false);
          }
        },
      ]
    );
  };

  // Replace a photo
  const replacePhoto = async (id: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos(photos.map(p =>
        p.id === id ? { ...p, uri: result.assets[0].uri, status: 'pending' } : p
      ));
      setAllChecked(false);
    }
  };

  // Proceed to style selection
  const proceedToGeneration = () => {
    if (photos.length < 4) {
      Alert.alert('Not Enough Photos', 'Please upload at least 4 photos.');
      return;
    }

    const goodPhotos = photos.filter(p => p.status === 'good').length;
    const warningPhotos = photos.filter(p => p.status === 'warning').length;

    if (warningPhotos > goodPhotos) {
      Alert.alert(
        'Photo Quality Warning',
        'Many of your photos have quality issues. Consider retaking them for better results.',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'Continue Anyway', onPress: () => router.push('/(tabs)') },
        ]
      );
    } else {
      router.push('/(tabs)');
    }
  };

  const goodCount = photos.filter(p => p.status === 'good').length;
  const warningCount = photos.filter(p => p.status === 'warning').length;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Icon component={ChevronLeft} size={24} color="#8b5cf6" />
          <Text className="text-violet-400 font-bold ml-1">Back</Text>
        </TouchableOpacity>
        <BrandingHeader size="sm" />
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Title */}
        <View className="px-6 mt-4">
          <Text className="text-white text-3xl font-black italic tracking-tighter uppercase">
            Review Photos
          </Text>
          <Text className="text-violet-400 text-[10px] font-black uppercase tracking-widest mt-2">
            {photos.length} Photos Selected
          </Text>
        </View>

        {/* Quality Status */}
        {allChecked && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mx-6 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${warningCount > goodCount ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                  <Icon
                    component={warningCount > goodCount ? AlertCircle : CheckCircle2}
                    size={20}
                    color={warningCount > goodCount ? '#eab308' : '#22c55e'}
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-bold">
                    {goodCount} Good, {warningCount} Warnings
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {warningCount > 0 ? 'Some photos may need retaking' : 'All photos look great!'}
                  </Text>
                </View>
              </View>
            </View>
          </MotiView>
        )}

        {/* Photo Grid */}
        <View className="px-6 mt-6">
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
            {photos.map((photo, index) => (
              <MotiView
                key={photo.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
                className="w-1/3 p-1.5"
              >
                <View className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                  <Image source={{ uri: photo.uri }} className="w-full h-full" resizeMode="cover" />

                  {/* Status Overlay */}
                  {photo.status === 'checking' && (
                    <View className="absolute inset-0 bg-black/60 items-center justify-center">
                      <ActivityIndicator color="#8b5cf6" />
                    </View>
                  )}

                  {photo.status === 'good' && (
                    <View className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                      <Icon component={CheckCircle2} size={14} color="white" />
                    </View>
                  )}

                  {photo.status === 'warning' && (
                    <View className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-full items-center justify-center">
                      <Icon component={AlertCircle} size={14} color="white" />
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View className="absolute bottom-0 left-0 right-0 flex-row">
                    <TouchableOpacity
                      onPress={() => replacePhoto(photo.id)}
                      className="flex-1 bg-black/60 py-2 items-center"
                    >
                      <Icon component={RefreshCw} size={14} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removePhoto(photo.id)}
                      className="flex-1 bg-red-500/60 py-2 items-center"
                    >
                      <Icon component={X} size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {photo.issues && photo.issues.length > 0 && (
                  <Text className="text-yellow-500 text-[8px] text-center mt-1 px-1">
                    {photo.issues.join(', ')}
                  </Text>
                )}
              </MotiView>
            ))}

            {/* Add More Button */}
            {photos.length < 8 && (
              <View className="w-1/3 p-1.5">
                <TouchableOpacity
                  onPress={addMorePhotos}
                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-violet-500/40 items-center justify-center bg-white/5"
                >
                  <Icon component={ImagePlus} size={24} color="#8b5cf6" />
                  <Text className="text-violet-400 text-[10px] font-bold uppercase mt-2">Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Photo Tips */}
        <View className="px-6 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 mx-6">
          <Text className="text-white font-bold mb-3">Photo Requirements</Text>
          {QUALITY_CHECKS.map((check, i) => (
            <View key={i} className="flex-row items-center mb-2">
              <View className="w-1.5 h-1.5 rounded-full bg-violet-500 mr-2" />
              <Text className="text-gray-400 text-sm">{check.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#0A0A0F] border-t border-white/10 px-6 py-6">
        {!allChecked ? (
          <TouchableOpacity
            onPress={runQualityChecks}
            disabled={checking || photos.length < 4}
            className={`h-16 rounded-[24px] items-center justify-center ${
              checking || photos.length < 4 ? 'bg-gray-700' : 'bg-violet-600'
            }`}
          >
            {checking ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-black text-lg italic tracking-tighter uppercase">
                Check Photo Quality
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={proceedToGeneration}
            className="h-16 rounded-[24px] items-center justify-center bg-violet-600 shadow-xl shadow-violet-600/40"
          >
            <View className="flex-row items-center">
              <Icon component={Sparkles} size={20} color="white" className="mr-2" />
              <Text className="text-white font-black text-lg italic tracking-tighter uppercase">
                Continue to Styles
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <Text className="text-gray-600 text-center text-[10px] font-bold uppercase tracking-widest mt-3">
          {photos.length}/8 Photos • Min 4 Required
        </Text>
      </View>
    </SafeAreaView>
  );
}
