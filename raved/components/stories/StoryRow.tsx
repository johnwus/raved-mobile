import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { Story } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface StoryRowProps {
  stories: Story[];
}

export const StoryRow: React.FC<StoryRowProps> = ({ stories }) => {
  const router = useRouter();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Create Story Button */}
      <TouchableOpacity 
        style={styles.storyItem}
        onPress={() => router.push('/stories/create' as any)}
      >
        <View style={styles.createStoryRing}>
          <View style={styles.createStoryInner}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </View>
        </View>
        <Text style={styles.storyText}>Your Story</Text>
      </TouchableOpacity>

      {/* Other Stories */}
      {stories.map((story) => (
        <TouchableOpacity 
          key={story.id}
          style={styles.storyItem}
          onPress={() => router.push(`/stories/view?storyId=${story.id}` as any)}
        >
          {story.viewed ? (
            <View style={styles.storyRingInactive}>
              <Image source={{ uri: story.avatar }} style={styles.storyImage} />
            </View>
          ) : (
            <LinearGradient
              colors={['#5D5CDE', '#FF6B6B']}
              style={styles.storyRing}
            >
              <View style={styles.storyImageContainer}>
                <Image source={{ uri: story.avatar }} style={styles.storyImage} />
              </View>
            </LinearGradient>
          )}
          <Text style={styles.storyText} numberOfLines={1}>
            {story.userName.split(' ')[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[4],
  },
  storyItem: {
    alignItems: 'center',
    width: 64,
  },
  createStoryRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createStoryInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyRingInactive: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    padding: 2,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  storyText: {
    fontSize: theme.typography.fontSize[10],
    marginTop: theme.spacing[1],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#6B7280',
    maxWidth: 64,
    textAlign: 'center',
  },
});

