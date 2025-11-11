import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Story } from '../../types';
import { Avatar } from '../ui/Avatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  stories,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [paused, setPaused] = useState(false);

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (visible && currentStory && !paused) {
      startProgressAnimation();
    }
  }, [visible, currentIndex, paused]);

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: currentStory.duration || 2500,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !paused) {
        nextStory();
      }
    });
  };

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const previousStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onClose();
    }
  };

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (locationX < SCREEN_WIDTH / 2) {
      previousStory();
    } else {
      nextStory();
    }
  };

  if (!visible || !currentStory) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.container}
        onPress={handleTap}
      >
        {/* Progress Bars */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.progressContainer}>
            {stories.map((_, index) => (
              <View key={index} style={styles.progressBar}>
                {index === currentIndex && (
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Avatar uri={currentStory.avatar || ''} size={32} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentStory.userName}</Text>
              <Text style={styles.timeAgo}>
                {new Date(currentStory.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Story Content */}
        <View style={styles.storyContent}>
          {currentStory.type === 'image' && (
            <Image
              source={{ uri: currentStory.url }}
              style={styles.storyMedia}
              resizeMode="contain"
            />
          )}
          {currentStory.type === 'video' && (
            <View style={styles.videoContainer}>
              <Image
                source={{ uri: currentStory.url }}
                style={styles.storyMedia}
                resizeMode="contain"
              />
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={64} color="white" />
              </View>
            </View>
          )}
          {currentStory.type === 'text' && currentStory.text && (
            <View style={styles.textStoryContainer}>
              <Text style={styles.textStory}>{currentStory.text}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[2],
    paddingTop: theme.spacing[2],
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    gap: theme.spacing[2],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.typography.fontSize[12],
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing[6],
    right: theme.spacing[4],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  videoContainer: {
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
  textStoryContainer: {
    padding: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStory: {
    color: 'white',
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  actionButtons: {
    position: 'absolute',
    bottom: theme.spacing[6],
    right: theme.spacing[4],
    gap: theme.spacing[4],
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

