import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Brain,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Zap,
  Wand2,
  Camera,
  Image as ImageIcon
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandingHeader } from '../components/BrandingHeader';
import Constants from '@/constants/Constants';

const { width } = Dimensions.get('window');

const Icon = ({ component: Component, ...props }: any) => <Component {...props} />;

const STAGES = [
  { id: 'upload', name: 'Uploading Photos', icon: Upload, duration: 10 },
  { id: 'analyze', name: 'Analyzing Features', icon: Camera, duration: 15 },
  { id: 'train', name: 'Training AI Model', icon: Brain, duration: 30 },
  { id: 'generate', name: 'Generating Headshots', icon: Wand2, duration: 35 },
  { id: 'finalize', name: 'Finalizing', icon: Sparkles, duration: 10 },
];

const TIPS = [
  { title: 'Did you know?', text: 'AI models train on over 1 billion parameters to create your perfect headshot.' },
  { title: 'Pro Tip', text: 'The more variety in your photos, the better the AI can capture your likeness.' },
  { title: 'Processing', text: 'Each headshot is generated individually to ensure unique, high-quality results.' },
  { title: 'Almost there!', text: 'Your professional headshots will be ready to download in 4K resolution.' },
  { title: 'Fun Fact', text: 'Our AI has been trained on professional photography from top studios worldwide.' },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const batchId = params.batchId as string;

  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<any>(null);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // Pulse animation for the active stage
  useEffect(() => {
    if (isComplete) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, isComplete]);

  // Rotate tips every 8 seconds
  useEffect(() => {
    if (isComplete) return;
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(tipInterval);
  }, [isComplete]);

  // Simulate stage progression (in production, this would check actual API status)
  useEffect(() => {
    if (!batchId || isComplete) return;

    let stageIndex = 0;
    const totalDuration = STAGES.reduce((acc, s) => acc + s.duration, 0);

    // Check actual status from backend
    const checkStatus = async () => {
      try {
        const response = await fetch(`${Constants.ENDPOINTS.STATUS}/${batchId}`);
        const data = await response.json();
        setStatusData(data);

        if (data.status === 'COMPLETED') {
          setIsComplete(true);
          setOverallProgress(100);
          setCurrentStage(STAGES.length - 1);
          setStageProgress(100);
          return true;
        } else if (data.status === 'FAILED') {
          setError(data.error || 'Generation failed');
          return true;
        }

        // Update progress based on backend response
        if (data.progress !== undefined) {
          setOverallProgress(data.progress);

          // Calculate current stage based on progress
          const progressPerStage = 100 / STAGES.length;
          const newStage = Math.min(
            Math.floor(data.progress / progressPerStage),
            STAGES.length - 1
          );
          setCurrentStage(newStage);
          setStageProgress((data.progress % progressPerStage) / progressPerStage * 100);
        }

        return false;
      } catch (e) {
        console.error('Status check failed:', e);
        return false;
      }
    };

    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      const done = await checkStatus();
      if (done) {
        clearInterval(pollInterval);
      }
    }, 3000);

    // Initial check
    checkStatus();

    return () => clearInterval(pollInterval);
  }, [batchId, isComplete]);

  // Estimate time remaining
  const estimateTimeRemaining = () => {
    if (isComplete) return 'Complete!';
    const remainingProgress = 100 - overallProgress;
    const estimatedMinutes = Math.ceil((remainingProgress / 100) * 5); // Assuming 5 min total
    return `~${estimatedMinutes} min remaining`;
  };

  const handleViewResults = () => {
    if (statusData?.images) {
      router.push({
        pathname: '/results',
        params: { images: JSON.stringify(statusData.images), batchId }
      });
    } else {
      router.push('/(tabs)/portfolio');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Generation?',
      'If you cancel now, you will lose your progress and credits will not be refunded.',
      [
        { text: 'Continue Waiting', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#0A0A0F] items-center justify-center px-6">
        <View className="w-24 h-24 bg-red-500/20 rounded-full items-center justify-center mb-6">
          <Icon component={X} size={40} color="#ef4444" />
        </View>
        <Text className="text-white text-2xl font-black italic tracking-tighter uppercase mb-4">
          Generation Failed
        </Text>
        <Text className="text-gray-400 text-center mb-8">{error}</Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="bg-violet-600 px-8 py-4 rounded-full"
        >
          <Text className="text-white font-black uppercase">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0A0A0F]">
      <View className="flex-1 px-6">
        {/* Header */}
        <View className="py-4 flex-row items-center justify-between">
          <BrandingHeader size="sm" />
          {!isComplete && (
            <TouchableOpacity onPress={handleCancel} className="bg-white/5 p-2 rounded-full">
              <Icon component={X} size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1 justify-center">
          {isComplete ? (
            // Completion View
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="items-center"
            >
              <View className="w-32 h-32 bg-green-500/20 rounded-full items-center justify-center mb-6">
                <Icon component={CheckCircle2} size={60} color="#22c55e" />
              </View>

              <Text className="text-white text-3xl font-black italic tracking-tighter uppercase mb-2">
                Complete!
              </Text>
              <Text className="text-gray-400 text-center mb-8 px-8">
                Your professional headshots have been generated and are ready to view.
              </Text>

              <TouchableOpacity
                onPress={handleViewResults}
                className="bg-violet-600 h-16 px-12 rounded-[24px] items-center justify-center shadow-xl shadow-violet-600/40"
              >
                <View className="flex-row items-center">
                  <Icon component={ImageIcon} size={20} color="white" />
                  <Text className="text-white font-black text-lg italic tracking-tighter uppercase ml-2">
                    View Results
                  </Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ) : (
            // Processing View
            <>
              {/* Progress Circle */}
              <View className="items-center mb-12">
                <View className="w-48 h-48 rounded-full border-4 border-white/10 items-center justify-center relative">
                  <Animated.View
                    style={{
                      position: 'absolute',
                      width: 192,
                      height: 192,
                      borderRadius: 96,
                      borderWidth: 4,
                      borderColor: '#8b5cf6',
                      borderTopColor: 'transparent',
                      borderLeftColor: 'transparent',
                      transform: [{ rotate: `${overallProgress * 3.6}deg` }],
                    }}
                  />
                  <View className="items-center">
                    <Animated.View
                      style={{
                        transform: [{ scale: pulseAnim }],
                      }}
                    >
                      <View className="w-20 h-20 bg-violet-600/20 rounded-full items-center justify-center mb-2">
                        {currentStage < STAGES.length ? (
                          <Icon
                            component={STAGES[currentStage].icon}
                            size={32}
                            color="#8b5cf6"
                          />
                        ) : (
                          <Icon component={Sparkles} size={32} color="#8b5cf6" />
                        )}
                      </View>
                    </Animated.View>

                    <Text className="text-white text-4xl font-black italic">
                      {Math.round(overallProgress)}%
                    </Text>
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                      {estimateTimeRemaining()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Current Stage */}
              <View className="mb-8">
                <Text className="text-white text-center font-black text-lg uppercase tracking-tighter mb-4">
                  {STAGES[currentStage]?.name || 'Processing...'}
                </Text>

                {/* Stage Indicators */}
                <View className="flex-row justify-center">
                  {STAGES.map((stage, i) => (
                    <View key={stage.id} className="flex-row items-center">
                      <MotiView
                        from={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: 1,
                          scale: i <= currentStage ? 1 : 0.8,
                        }}
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          i < currentStage
                            ? 'bg-green-500'
                            : i === currentStage
                            ? 'bg-violet-600'
                            : 'bg-white/10'
                        }`}
                      >
                        {i < currentStage ? (
                          <Icon component={CheckCircle2} size={20} color="white" />
                        ) : (
                          <Icon component={stage.icon} size={18} color={i === currentStage ? 'white' : '#6b7280'} />
                        )}
                      </MotiView>

                      {i < STAGES.length - 1 && (
                        <View
                          className={`h-0.5 w-8 mx-1 ${
                            i < currentStage ? 'bg-green-500' : 'bg-white/10'
                          }`}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Rotating Tip */}
              <MotiView
                key={currentTip}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 mx-6"
              >
                <View className="flex-row items-center mb-2">
                  <View className="bg-violet-500/20 p-1.5 rounded-lg mr-2">
                    <Icon component={Zap} size={16} color="#8b5cf6" />
                  </View>
                  <Text className="text-violet-400 font-bold text-sm">
                    {TIPS[currentTip].title}
                  </Text>
                </View>
                <Text className="text-gray-400 text-sm leading-relaxed">
                  {TIPS[currentTip].text}
                </Text>
              </MotiView>
            </>
          )}
        </View>

        {/* Bottom Info */}
        {!isComplete && (
          <View className="pb-6 items-center">
            <View className="flex-row items-center">
              <Icon component={Clock} size={14} color="#6b7280" />
              <Text className="text-gray-600 text-xs ml-2">
                Typical processing time: 3-5 minutes
              </Text>
            </View>
            <Text className="text-gray-700 text-[10px] mt-2">
              Batch ID: {batchId?.slice(0, 8)}...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
