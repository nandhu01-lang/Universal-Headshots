import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Download,
  Share2,
  Grid,
  Filter,
  Zap,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  X,
  Heart
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { BrandingHeader } from '../../components/BrandingHeader';
import { authService } from '../../services/authService';
import Constants from '@/constants/Constants';

const { width } = Dimensions.get('window');

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

interface Batch {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  style: string;
  imageCount: number;
  thumbnail?: string;
  images?: string[];
}

export default function PortfolioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALL' | 'BATCHES' | 'FAVORITES'>('ALL');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch batch history
  const fetchBatches = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // In production: GET /api/user-batches/:userId
      // Mock data for demonstration
      const mockBatches: Batch[] = [
        {
          id: 'batch_001',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          style: 'CEO Executive',
          imageCount: 12,
          thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
          images: [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          ]
        },
        {
          id: 'batch_002',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          style: 'Creative Professional',
          imageCount: 8,
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          images: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
          ]
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setBatches(mockBatches);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBatches();
  }, [fetchBatches]);

  // Toggle batch expansion
  const toggleBatch = (batchId: string) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  // Toggle favorite
  const toggleFavorite = (imageUri: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageUri)) {
        newFavorites.delete(imageUri);
      } else {
        newFavorites.add(imageUri);
      }
      return newFavorites;
    });
  };

  // Download batch
  const downloadBatch = (batch: Batch) => {
    Alert.alert(
      'Download Batch',
      `Download all ${batch.imageCount} images from "${batch.style}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // In production: Trigger ZIP download
            Alert.alert('Success', 'Download started! Check your downloads folder.');
          }
        }
      ]
    );
  };

  // Share batch
  const shareBatch = async (batch: Batch) => {
    try {
      await Share.share({
        message: `Check out my ${batch.style} headshots from Universal Headshots!`,
        url: batch.thumbnail || ''
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Retry failed batch
  const retryBatch = (batchId: string) => {
    Alert.alert(
      'Retry Generation',
      'Would you like to retry this generation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: () => router.push('/(tabs)') }
      ]
    );
  };

  // Format date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: Batch['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'PROCESSING': return 'bg-yellow-500';
      case 'PENDING': return 'bg-blue-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status: Batch['status']) => {
    switch (status) {
      case 'COMPLETED': return CheckCircle2;
      case 'PROCESSING': return Clock;
      case 'PENDING': return Clock;
      case 'FAILED': return XCircle;
      default: return Clock;
    }
  };

  // Get all images for display
  const getAllImages = () => {
    return batches.flatMap(batch =>
      (batch.images || []).map(uri => ({ uri, batchId: batch.id, style: batch.style }))
    );
  };

  // Get favorite images
  const getFavoriteImages = () => {
    return getAllImages().filter(img => favorites.has(img.uri));
  };

  const displayedImages = activeTab === 'FAVORITES' ? getFavoriteImages() : getAllImages();
  const totalImages = batches.reduce((sum, b) => sum + b.imageCount, 0);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-gray-500 mt-4 font-bold">Loading your portfolio...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
        }
      >
        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center">
          <BrandingHeader size="sm" />
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-violet-600/20 p-2.5 rounded-full border border-violet-500/30"
          >
            <Icon component={Zap} size={18} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Title & Stats */}
        <View className="px-6 mt-6">
          <Text className="text-white text-3xl font-black italic tracking-tighter uppercase">Your Portfolio</Text>
          <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
            {totalImages} Headshots • {batches.length} Sessions
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mt-6 flex-row">
          <View className="flex-1 bg-white/5 rounded-2xl p-4 mr-3 border border-white/10">
            <Text className="text-gray-500 text-[10px] uppercase font-bold">Total</Text>
            <Text className="text-white text-2xl font-black">{totalImages}</Text>
          </View>
          <View className="flex-1 bg-white/5 rounded-2xl p-4 mr-3 border border-white/10">
            <Text className="text-gray-500 text-[10px] uppercase font-bold">Sessions</Text>
            <Text className="text-white text-2xl font-black">{batches.length}</Text>
          </View>
          <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10">
            <Text className="text-gray-500 text-[10px] uppercase font-bold">Favorites</Text>
            <Text className="text-white text-2xl font-black">{favorites.size}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mt-8">
          <View className="flex-row bg-white/5 rounded-full p-1">
            {(['ALL', 'BATCHES', 'FAVORITES'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-full ${activeTab === tab ? 'bg-violet-600' : ''}`}
              >
                <Text className={`text-[10px] font-black uppercase text-center ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        {batches.length === 0 ? (
          /* Empty State */
          <View className="flex-1 items-center justify-center px-12 mt-20">
            <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center border border-dashed border-white/10">
              <Icon component={ImageIcon} size={40} color="#4b5563" />
            </View>
            <Text className="text-white text-center font-bold mt-6">No headshots yet</Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">Your generated headshots will appear here</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-violet-600 px-8 py-4 rounded-full mt-6"
            >
              <Text className="text-white font-black uppercase">Create Headshots</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'BATCHES' ? (
          /* Batch List View */
          <View className="px-6 mt-6 space-y-4">
            {batches.map((batch, index) => (
              <MotiView
                key={batch.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Batch Header */}
                <TouchableOpacity
                  onPress={() => toggleBatch(batch.id)}
                  className="p-4 flex-row items-center"
                >
                  <Image
                    source={{ uri: batch.thumbnail }}
                    className="w-16 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-white font-bold">{batch.style}</Text>
                    <View className="flex-row items-center mt-1">
                      <Icon component={Calendar} size={12} color="#6b7280" />
                      <Text className="text-gray-500 text-xs ml-1">{formatDate(batch.createdAt)}</Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <View className={`w-2 h-2 rounded-full ${getStatusColor(batch.status)} mr-2`} />
                      <Text className="text-gray-400 text-xs uppercase font-bold">{batch.status}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-black text-xl">{batch.imageCount}</Text>
                    <Text className="text-gray-500 text-[10px] uppercase">images</Text>
                    <Icon
                      component={expandedBatch === batch.id ? ChevronUp : ChevronDown}
                      size={20}
                      color="#6b7280"
                      style={{ marginTop: 8 }}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Batch Images */}
                {expandedBatch === batch.id && batch.images && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4"
                  >
                    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
                      {batch.images.map((uri, imgIndex) => (
                        <View key={imgIndex} className="w-1/3 p-1">
                          <TouchableOpacity
                            onPress={() => setSelectedImage(uri)}
                            className="aspect-[3/4] rounded-xl overflow-hidden"
                          >
                            <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                            {favorites.has(uri) && (
                              <View className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                                <Icon component={Heart} size={10} color="white" fill="white" />
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    {/* Batch Actions */}
                    <View className="flex-row mt-4">
                      {batch.status === 'COMPLETED' ? (
                        <>
                          <TouchableOpacity
                            onPress={() => downloadBatch(batch)}
                            className="flex-1 bg-violet-600 py-3 rounded-xl mr-2 flex-row items-center justify-center"
                          >
                            <Icon component={Download} size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Download</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => shareBatch(batch)}
                            className="flex-1 bg-white/10 py-3 rounded-xl flex-row items-center justify-center"
                          >
                            <Icon component={Share2} size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Share</Text>
                          </TouchableOpacity>
                        </>
                      ) : batch.status === 'FAILED' ? (
                        <TouchableOpacity
                          onPress={() => retryBatch(batch.id)}
                          className="flex-1 bg-red-600/20 border border-red-500/30 py-3 rounded-xl flex-row items-center justify-center"
                        >
                          <Icon component={RefreshCw} size={16} color="#ef4444" />
                          <Text className="text-red-400 font-bold ml-2 text-sm">Retry</Text>
                        </TouchableOpacity>
                      ) : (
                        <View className="flex-1 bg-white/5 py-3 rounded-xl flex-row items-center justify-center">
                          <ActivityIndicator size="small" color="#8b5cf6" />
                          <Text className="text-gray-400 font-bold ml-2 text-sm">Processing...</Text>
                        </View>
                      )}
                    </View>
                  </MotiView>
                )}
              </MotiView>
            ))}
          </View>
        ) : (
          /* Grid View (ALL / FAVORITES) */
          <View className="px-6 mt-6 flex-row flex-wrap justify-between">
            {displayedImages.map((item, index) => (
              <MotiView
                key={`${item.batchId}-${index}`}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 30 }}
                className="w-[31%] aspect-[3/4] mb-4 rounded-2xl border border-white/10 overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => setSelectedImage(item.uri)}
                  className="w-full h-full"
                >
                  <Image
                    source={{ uri: item.uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {favorites.has(item.uri) && (
                    <View className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                      <Icon component={Heart} size={12} color="white" fill="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        )}

        {/* Bottom Actions */}
        {batches.length > 0 && activeTab !== 'BATCHES' && (
          <View className="px-6 mt-10">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-violet-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-violet-600/40 flex-row space-x-3"
            >
              <Icon component={Zap} size={20} color="white" />
              <Text className="text-white font-black text-lg uppercase italic tracking-tighter">Generate More</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Full Screen Image Modal */}
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
                  onPress={() => selectedImage && toggleFavorite(selectedImage)}
                  className="mr-4"
                >
                  <Icon
                    component={Heart}
                    size={24}
                    color={selectedImage && favorites.has(selectedImage) ? '#ef4444' : 'white'}
                    fill={selectedImage && favorites.has(selectedImage) ? '#ef4444' : 'none'}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (selectedImage) {
                      Alert.alert('Download', 'Image saved to gallery!');
                    }
                  }}
                >
                  <Icon component={Download} size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Image */}
            <View className="flex-1 items-center justify-center px-6">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-3/4 rounded-2xl"
                  resizeMode="contain"
                />
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
