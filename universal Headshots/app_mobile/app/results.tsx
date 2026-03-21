import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
  Share,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Download,
  Heart,
  Share2,
  X,
  Maximize2,
  Zap,
  Grid3X3,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { BrandingHeader } from '../components/BrandingHeader';

const { width, height } = Dimensions.get('window');
const GAP = 12;
const IMAGE_SIZE = (width - 48 - GAP) / 2; // 48 = px-6 * 2, GAP between items

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

interface GeneratedImage {
  id: string;
  uri: string;
  style: string;
  isFavorite: boolean;
  downloaded: boolean;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse images from params or use empty array
  const initialImages: GeneratedImage[] = params.images
    ? JSON.parse(params.images as string).map((uri: string, i: number) => ({
        id: `img_${i}`,
        uri,
        style: 'Professional',
        isFavorite: false,
        downloaded: false,
      }))
    : [
        // Fallback mock data for demo
        { id: '1', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d', style: 'CEO', isFavorite: false, downloaded: false },
        { id: '2', uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', style: 'Executive', isFavorite: true, downloaded: false },
        { id: '3', uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a', style: 'Tech', isFavorite: false, downloaded: false },
        { id: '4', uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', style: 'Creative', isFavorite: false, downloaded: false },
      ];

  const [images, setImages] = useState<GeneratedImage[]>(initialImages);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'favorites'>('grid');
  const [downloading, setDownloading] = useState<string | null>(null);
  const batchId = params.batchId as string;

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setImages(images.map(img =>
      img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
    ));
  };

  // Download single image
  const downloadImage = async (image: GeneratedImage) => {
    setDownloading(image.id);
    try {
      if (Platform.OS === 'ios') {
        // On iOS, save to photo library
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const fileUri = FileSystem.documentDirectory + `${image.id}.jpg`;
          await FileSystem.downloadAsync(image.uri, fileUri);
          await MediaLibrary.saveToLibraryAsync(fileUri);
        }
      } else {
        // On Android
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          const fileUri = FileSystem.cacheDirectory + `${image.id}.jpg`;
          await FileSystem.downloadAsync(image.uri, fileUri);
          await MediaLibrary.saveToLibraryAsync(fileUri);
        }
      }

      setImages(images.map(img =>
        img.id === image.id ? { ...img, downloaded: true } : img
      ));

      Alert.alert('Success', 'Image saved to your gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to download image');
    } finally {
      setDownloading(null);
    }
  };

  // Download all images
  const downloadAll = async () => {
    Alert.alert(
      'Download All',
      `Download all ${images.length} images?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              // In production, this would download a ZIP
              Alert.alert('Success', 'All images downloaded!');
            } catch (error) {
              Alert.alert('Error', 'Failed to download images');
            }
          }
        }
      ]
    );
  };

  // Share image
  const shareImage = async (image: GeneratedImage) => {
    try {
      await Share.share({
        url: image.uri,
        message: 'Check out my professional headshot from Universal Headshots!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Delete image
  const deleteImage = (id: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setImages(images.filter(img => img.id !== id))
        }
      ]
    );
  };

  // Generate more
  const generateMore = () => {
    router.push('/(tabs)');
  };

  const displayedImages = viewMode === 'favorites'
    ? images.filter(img => img.isFavorite)
    : images;

  const favoriteCount = images.filter(img => img.isFavorite).length;
  const downloadedCount = images.filter(img => img.downloaded).length;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
          <Icon component={ChevronLeft} size={24} color="#8b5cf6" />
          <Text className="text-violet-400 font-bold ml-1">Back</Text>
        </TouchableOpacity>

        <BrandingHeader size="sm" />

        <View className="flex-row">
          <TouchableOpacity onPress={downloadAll} className="bg-violet-600/20 p-2 rounded-full mr-2">
            <Icon component={Download} size={20} color="#8b5cf6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View className="px-6 py-4 flex-row justify-between">
        <View className="bg-white/5 rounded-2xl px-4 py-3 flex-1 mr-2">
          <Text className="text-gray-500 text-[10px] uppercase font-bold">Total</Text>
          <Text className="text-white text-xl font-black">{images.length}</Text>
        </View>

        <View className="bg-white/5 rounded-2xl px-4 py-3 flex-1 mr-2">
          <Text className="text-gray-500 text-[10px] uppercase font-bold">Favorites</Text>
          <Text className="text-white text-xl font-black">{favoriteCount}</Text>
        </View>

        <View className="bg-white/5 rounded-2xl px-4 py-3 flex-1">
          <Text className="text-gray-500 text-[10px] uppercase font-bold">Saved</Text>
          <Text className="text-white text-xl font-black">{downloadedCount}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="px-6 mb-4 flex-row">
        {[
          { key: 'grid', label: 'All Results', icon: Grid3X3 },
          { key: 'favorites', label: 'Favorites', icon: Heart },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setViewMode(tab.key as 'grid' | 'favorites')}
            className={`flex-row items-center mr-4 px-4 py-2 rounded-full ${
              viewMode === tab.key ? 'bg-violet-600' : 'bg-white/5'
            }`}
          >
            <Icon
              component={tab.icon}
              size={14}
              color={viewMode === tab.key ? 'white' : '#6b7280'}
            />
            <Text className={`ml-2 text-xs font-bold ${viewMode === tab.key ? 'text-white' : 'text-gray-500'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Image Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {displayedImages.length > 0 ? (
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -GAP / 2 }}>
            {displayedImages.map((image, index) => (
              <MotiView
                key={image.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
                style={{ width: IMAGE_SIZE, marginHorizontal: GAP / 2, marginBottom: GAP }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedImage(image)}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ width: IMAGE_SIZE, height: IMAGE_SIZE * 1.25 }}
                >
                  <Image
                    source={{ uri: image.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  {/* Overlay Actions */}
                  <View className="absolute top-2 right-2 flex-row">
                    <TouchableOpacity
                      onPress={() => toggleFavorite(image.id)}
                      className="w-8 h-8 bg-black/50 rounded-full items-center justify-center"
                    >
                      <Icon
                        component={Heart}
                        size={14}
                        color={image.isFavorite ? '#ef4444' : 'white'}
                        fill={image.isFavorite ? '#ef4444' : 'none'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Downloaded indicator */}
                  {image.downloaded && (
                    <View className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                      <Icon component={CheckCircle2} size={12} color="white" />
                    </View>
                  )}

                  {/* Style label */}
                  <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <Text className="text-white text-xs font-bold">{image.style}</Text>
                  </View>
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Icon component={Heart} size={48} color="#374151" />
            <Text className="text-gray-500 mt-4 text-center">
              {viewMode === 'favorites' ? 'No favorites yet' : 'No images'}
            </Text>
            {viewMode === 'favorites' && (
              <TouchableOpacity onPress={() => setViewMode('grid')} className="mt-4">
                <Text className="text-violet-400 font-bold">View All Results</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Generate More Button */}
        <TouchableOpacity
          onPress={generateMore}
          className="mt-8 mb-8 bg-white/5 border border-white/10 rounded-[24px] p-6 items-center flex-row justify-center"
        >
          <Icon component={Sparkles} size={20} color="#8b5cf6" />
          <Text className="text-white font-black text-lg italic tracking-tighter uppercase ml-3">
            Generate More Headshots
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Full Screen Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
              <TouchableOpacity onPress={() => setSelectedImage(null)}>
                <Icon component={X} size={28} color="white" />
              </TouchableOpacity>

              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => selectedImage && toggleFavorite(selectedImage.id)}
                  className="mr-4"
                >
                  <Icon
                    component={Heart}
                    size={24}
                    color={selectedImage?.isFavorite ? '#ef4444' : 'white'}
                    fill={selectedImage?.isFavorite ? '#ef4444' : 'none'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selectedImage && shareImage(selectedImage)}
                  className="mr-4"
                >
                  <Icon component={Share2} size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selectedImage && deleteImage(selectedImage.id)}
                >
                  <Icon component={Trash2} size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Image */}
            <View className="flex-1 items-center justify-center px-6">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.uri }}
                  className="w-full h-3/4 rounded-2xl"
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Actions */}
            <View className="px-6 pb-8">
              <TouchableOpacity
                onPress={() => selectedImage && downloadImage(selectedImage)}
                disabled={downloading === selectedImage?.id}
                className="bg-violet-600 h-16 rounded-[24px] items-center justify-center"
              >
                {downloading === selectedImage?.id ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="flex-row items-center">
                    <Icon component={Download} size={20} color="white" />
                    <Text className="text-white font-black text-lg italic tracking-tighter uppercase ml-2">
                      {selectedImage?.downloaded ? 'Downloaded' : 'Download'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
