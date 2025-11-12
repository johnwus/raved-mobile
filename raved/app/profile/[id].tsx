import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { userApi, UserProfile } from '../../services/userApi';

export default function ProfileDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await userApi.getProfile(String(id));
        const p = (res.profile || res) as UserProfile;
        setProfile(p);
        // naive heuristic: consider following if followersCount > 0 is not accurate, require backend flag; fallback to false
        // Optional: fetch stats or connection state if available in profile
        try {
          const postsRes = await userApi.getUserPosts(String(id), 1, 10);
          setPosts(postsRes.posts || postsRes.data || []);
        } catch {}
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    try {
      if (following) {
        await userApi.unfollowUser(profile.id);
        setFollowing(false);
      } else {
        await userApi.followUser(profile.id);
        setFollowing(true);
      }
    } catch (e) {
      console.error('Failed to toggle follow', e);
      Alert.alert('Error', 'Unable to update follow status.');
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    try {
      const chatApi = (await import('../../services/chatApi')).default;
      const response = await chatApi.startChat(profile.id);
      if (response.success && response.conversation) {
        router.push(`/chat/${response.conversation.id}` as any);
      }
    } catch (e) {
      console.error('Failed to start chat', e);
      Alert.alert('Error', 'Unable to start chat.');
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: theme.spacing[4], gap: theme.spacing[4] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SkeletonLoader height={64} width={64} borderRadius={32} />
            <View style={{ flex: 1 }}>
              <SkeletonLoader height={14} style={{ width: '50%' }} />
              <SkeletonLoader height={12} style={{ width: '30%', marginTop: 6 }} />
            </View>
          </View>
          <SkeletonLoader height={12} style={{ width: '80%' }} />
          <SkeletonLoader height={12} style={{ width: '70%' }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileRow}>
          <Avatar uri={profile.avatarUrl || ''} size={72} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
            <Text style={styles.username}>@{profile.username}</Text>
            {!!profile.faculty && <Text style={styles.faculty}>{profile.faculty}</Text>}
          </View>
        </View>
        {!!profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}
        <View style={styles.statsRow}>
          <View style={styles.stat}><Text style={styles.statNumber}>{profile.postsCount}</Text><Text style={styles.statLabel}>Posts</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{profile.followersCount}</Text><Text style={styles.statLabel}>Followers</Text></View>
          <View style={styles.stat}><Text style={styles.statNumber}>{profile.followingCount}</Text><Text style={styles.statLabel}>Following</Text></View>
        </View>
        <View style={styles.actionsRow}>
          <Button title={following ? 'Following' : 'Follow'} onPress={handleFollowToggle} variant={following ? 'outline' : 'primary'} size="small" />
          <Button title="Message" onPress={handleMessage} variant="outline" size="small" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent posts</Text>
          {posts.length === 0 ? (
            <EmptyState icon="image-outline" title="No posts yet" />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item: any) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing[3] }} />}
              contentContainerStyle={{ paddingHorizontal: theme.spacing[4] }}
              renderItem={({ item }: any) => (
                <TouchableOpacity onPress={() => router.push(`/post/${item.id}` as any)}>
                  <Image source={{ uri: item.media?.url || item.thumbnail || '' }} style={styles.postThumb} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: theme.typography.fontSize[18], fontWeight: theme.typography.fontWeight.bold, color: '#111827' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], padding: theme.spacing[4] },
  name: { fontSize: theme.typography.fontSize[18], fontWeight: theme.typography.fontWeight.semibold, color: '#111827' },
  username: { fontSize: theme.typography.fontSize[12], color: '#6B7280', marginTop: 2 },
  faculty: { fontSize: theme.typography.fontSize[12], color: theme.colors.primary, marginTop: 4 },
  bio: { fontSize: theme.typography.fontSize[14], color: '#111827', paddingHorizontal: theme.spacing[4] },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: theme.spacing[3], borderTopWidth: 1, borderTopColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: theme.typography.fontSize[16], fontWeight: theme.typography.fontWeight.bold, color: '#111827' },
  statLabel: { fontSize: theme.typography.fontSize[12], color: '#6B7280' },
  actionsRow: { flexDirection: 'row', gap: theme.spacing[2], paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3] },
  section: { paddingVertical: theme.spacing[3] },
  sectionTitle: { fontSize: theme.typography.fontSize[16], fontWeight: theme.typography.fontWeight.semibold, color: '#111827', paddingHorizontal: theme.spacing[4], marginBottom: theme.spacing[2] },
  postThumb: { width: 120, height: 120, borderRadius: theme.borderRadius.lg, backgroundColor: '#F3F4F6' },
});
