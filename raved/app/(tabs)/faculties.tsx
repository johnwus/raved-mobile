import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PostCard } from '../../components/posts/PostCard';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { Post } from '../../types';

const facultyData = {
  all: { title: 'All Faculties', members: '12.5k', posts: '8.2k', events: '156', icon: 'globe' },
  arts: { title: 'Arts & Humanities', members: '2.4k', posts: '1.2k', events: '24', icon: 'color-palette', color: ['#A855F7', '#EC4899'] },
  business: { title: 'Business', members: '3.1k', posts: '2.1k', events: '32', icon: 'briefcase', color: ['#3B82F6', '#06B6D4'] },
  engineering: { title: 'Engineering', members: '2.8k', posts: '1.8k', events: '28', icon: 'construct', color: ['#F97316', '#EF4444'] },
  science: { title: 'Science', members: '2.2k', posts: '1.5k', events: '22', icon: 'flask', color: ['#10B981', '#059669'] },
  medicine: { title: 'Medicine', members: '2.0k', posts: '1.6k', events: '50', icon: 'medical', color: ['#EF4444', '#EC4899'] },
  law: { title: 'Law', members: '1.8k', posts: '1.1k', events: '18', icon: 'scale', color: ['#6366F1', '#A855F7'] },
  education: { title: 'Education', members: '1.5k', posts: '0.9k', events: '15', icon: 'school', color: ['#F59E0B', '#F97316'] },
};

type FacultyKey = keyof typeof facultyData;

export default function FacultiesScreen() {
  const { posts } = usePosts();
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyKey>('all');

  const currentData = facultyData[selectedFaculty];
  
  // Filter posts by faculty
  const filteredPosts = selectedFaculty === 'all'
    ? posts
    : posts.filter(post => 
        post.user.faculty?.toLowerCase().includes(selectedFaculty)
      );

  const renderFacultyButton = (key: FacultyKey) => {
    const data = facultyData[key];
    const isSelected = selectedFaculty === key;
    const hasColor = 'color' in data && data.color;
    
    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.facultyButton,
          isSelected && key === 'all' && styles.facultyButtonActive,
          !isSelected && key !== 'all' && {
            backgroundColor: hasColor ? `${data.color[0]}20` : '#F3F4F6',
          },
        ]}
        onPress={() => setSelectedFaculty(key)}
      >
        <Ionicons
          name={data.icon as any}
          size={20}
          color={isSelected && key === 'all' ? 'white' : hasColor ? data.color[0] : '#6B7280'}
        />
        <Text
          style={[
            styles.facultyButtonTitle,
            isSelected && key === 'all' && styles.facultyButtonTitleActive,
            !isSelected && key !== 'all' && hasColor && { color: data.color[0] },
          ]}
        >
          {data.title}
        </Text>
        <Text
          style={[
            styles.facultyButtonMembers,
            isSelected && key === 'all' && styles.facultyButtonMembersActive,
          ]}
        >
          {data.members} members
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Faculty Selection */}
        <View style={styles.facultySelection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Campus Communities</Text>
          </View>
          <View style={styles.facultyGrid}>
            {(Object.keys(facultyData) as FacultyKey[]).map(renderFacultyButton)}
          </View>
        </View>

        {/* Faculty Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentData.members}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentData.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentData.events}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>
        </View>

        {/* Faculty Feed */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Ionicons name="flame" size={18} color={theme.colors.accent} />
            <Text style={styles.feedTitle}>
              Trending in {currentData.title}
            </Text>
          </View>

          {filteredPosts.length > 0 ? (
            <FlatList
              data={filteredPosts}
              renderItem={({ item }) => <PostCard post={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: theme.spacing[4] }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No posts yet in {currentData.title}</Text>
            </View>
          )}

          {filteredPosts.length > 0 && (
            <TouchableOpacity style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  facultySelection: {
    margin: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  facultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  facultyButton: {
    width: '47%',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  facultyButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  facultyButtonTitle: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
    textAlign: 'center',
  },
  facultyButtonTitleActive: {
    color: 'white',
  },
  facultyButtonMembers: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
    opacity: 0.8,
  },
  facultyButtonMembersActive: {
    color: 'white',
    opacity: 0.8,
  },
  statsCard: {
    margin: theme.spacing[4],
    marginTop: 0,
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  feedSection: {
    padding: theme.spacing[4],
    paddingTop: 0,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  feedTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
    gap: theme.spacing[3],
  },
  emptyText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  loadMoreButton: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
});
