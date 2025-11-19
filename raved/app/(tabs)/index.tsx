// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   RefreshControl,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useTheme } from '../../contexts/ThemeContext';
// import { useAuth } from '../../hooks/useAuth';
// import { usePosts } from '../../hooks/usePosts';
// import { useStore } from '../../hooks/useStore';
// import { theme } from '../../theme';
// import { StoryRow } from '../../components/stories/StoryRow';
// import { PostCard } from '../../components/posts/PostCard';
// import { Avatar } from '../../components/ui/Avatar';
// import { MoreSheet } from '../../components/sheets/MoreSheet';
// import { FloatingActionButtons } from '../../components/ui/FloatingActionButtons';
// import { userApi } from '../../services/userApi';
// import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

// export default function HomeScreen() {
//   const router = useRouter();
//   const { isDark, currentColors } = useTheme();
//   const { user: _user } = useAuth();
//   const { posts, featuredPost, stories, refreshFeed, fetchMore, hasMore } = usePosts();
//   const { isPremium, storeItems } = useStore();
//   const [refreshing, setRefreshing] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [moreSheetVisible, setMoreSheetVisible] = useState(false);
//   const [rankings, setRankings] = useState([]);
//   const [loadingRankings, setLoadingRankings] = useState(false);
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(true);
//   const [showTrending, setShowTrending] = useState(false);

//   // when posts update, stop loadingMore spinner
//   useEffect(() => {
//     console.log('🏠 Index screen - Posts updated:', posts.length);
//     console.log('🏠 Index screen - First post:', posts[0] ? JSON.stringify(posts[0], null, 2) : 'No posts');
//     setLoadingMore(false);
//   }, [posts]);

//   const fetchSuggestions = React.useCallback(async () => {
//     try {
//       const postsApi = (await import('../../services/postsApi')).default;
//       const response = await postsApi.getPostSuggestions(5);
//       console.log('Suggestions response:', response);
//       setSuggestions(response.suggestions || response || []);
//     } catch (error) {
//       console.error('Failed to fetch suggestions:', error);
//       setSuggestions([]);
//     }
//   }, []);

//   const fetchTrending = React.useCallback(async () => {
//     try {
//       const postsApi = (await import('../../services/postsApi')).default;
//       const response = await postsApi.getTrendingPosts(1, 5, '24h');
//       console.log('Trending response:', response);
//       setTrendingPosts(response.posts || response || []);
//     } catch (error) {
//       console.error('Failed to fetch trending:', error);
//       setTrendingPosts([]);
//     }
//   }, []);

//   const fetchRankings = React.useCallback(async () => {
//     try {
//       setLoadingRankings(true);
//       const response = await userApi.getRankings('weekly');
//       console.log('Rankings response:', response);
//       setRankings((response.rankings || response || []).slice(0, 3)); // Only show top 3
//     } catch (error) {
//       console.error('Failed to fetch rankings:', error);
//       setRankings([]);
//     } finally {
//       setLoadingRankings(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (isPremium) {
//       fetchRankings();
//     }
//     fetchSuggestions();
//     fetchTrending();
//   }, [isPremium, fetchRankings, fetchSuggestions, fetchTrending]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await refreshFeed();
//     setRefreshing(false);
//   };

//   const loadMore = useCallback(async () => {
//     if (loadingMore || !hasMore) return;
//     setLoadingMore(true);
//     await fetchMore();
//   }, [loadingMore, hasMore, fetchMore]);

//   const getRankColor = (rank: number) => {
//     switch (rank) {
//       case 1: return '#FCD34D'; // yellow-300
//       case 2: return '#9CA3AF'; // gray-400
//       case 3: return '#FB923C'; // orange-400
//       default: return '#E5E7EB';
//     }
//   };

//   const colors = isDark ? {
//     bg: theme.colors.dark.bg,
//     card: theme.colors.dark.card,
//     text: theme.colors.dark.text,
//     gray500: '#6B7280',
//   } : {
//     background: '#f8fafc',
//     card: '#FFFFFF',
//     text: '#111827',
//     gray500: '#6B7280',
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: 'background' in colors ? colors.background : colors.bg }]}>
//       {/* Header */}
//       <View style={[styles.header, { backgroundColor: colors.card }]}>
//         <TouchableOpacity 
//           style={styles.headerButton}
//           onPress={() => setMoreSheetVisible(true)}
//         >
//           <Ionicons name="menu" size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
//         <View style={styles.headerActions}>
//           <TouchableOpacity 
//             style={styles.headerButton}
//             onPress={() => router.push('/search' as any)}
//           >
//             <Ionicons name="search" size={24} color={colors.text} />
//           </TouchableOpacity>
//           <TouchableOpacity 
//             style={styles.headerButton}
//             onPress={() => router.push('/notifications' as any)}
//           >
//             <Ionicons name="notifications-outline" size={24} color={colors.text} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         onScroll={({ nativeEvent }) => {
//           const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
//           const paddingToBottom = 20;
//           if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
//             if (!loadingMore && hasMore) {
//               loadMore();
//             }
//           }
//         }}
//         scrollEventThrottle={400}
//       >
//         {/* Stories */}
//         <View key="stories-section">
//           <StoryRow stories={stories} />
//         </View>

//         {/* Featured Post */}
//         {featuredPost && (
//           <View key="featured-post-section">
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Ionicons name="star" size={20} color="#FBBF24" />
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured</Text>
//               </View>
//               <PostCard post={featuredPost} />
//             </View>
//           </View>
//         )}

//         {/* Store Teaser */}
//         <View key="store-section">
//           <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Ionicons name="bag-handle" size={20} color={theme.colors.accent} />
//               <Text style={[styles.sectionTitle, { color: colors.text }]}>Fashion Store</Text>
//             </View>

//             <View style={styles.storeGrid}>
//               {storeItems.length === 0 ? (
//                 [0,1,2,3].map((i) => (
//                   <View key={i} style={[styles.storeItem, { backgroundColor: colors.card }]}> 
//                     <SkeletonLoader height={120} />
//                     <View style={styles.storeItemInfo}>
//                       <SkeletonLoader height={14} style={{ width: '80%' }} />
//                       <SkeletonLoader height={16} style={{ width: '40%', marginTop: 6 }} />
//                     </View>
//                   </View>
//                 ))
//               ) : (
//                 storeItems.slice(0, 4).map((item) => (
//                   <TouchableOpacity 
//                     key={item.id}
//                     style={[styles.storeItem, { backgroundColor: colors.card }]}
//                     onPress={() => router.push(`/product/${item.id}` as any)}
//                   >
//                     <Image source={{ uri: item.images[0] }} style={styles.storeItemImage} />
//                     <View style={styles.storeItemInfo}>
//                       <Text style={[styles.storeItemName, { color: colors.text }]} numberOfLines={2}>
//                         {item.name}
//                       </Text>
//                       <Text style={[styles.storeItemPrice, { color: currentColors.primary }]}>
//                         ₵{item.price}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </View>

//             <TouchableOpacity 
//               style={[styles.viewAllButton, { backgroundColor: currentColors.primary }]}
//               onPress={() => router.push('/store' as any)}
//             >
//               <Text style={styles.viewAllButtonText}>View All Items</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Rankings Teaser */}
//         {isPremium ? (
//           <View key="rankings-section" style={styles.section}>
//             <View style={styles.rankingHeader}>
//               <View style={styles.rankingHeaderLeft}>
//                 <Ionicons name="trophy" size={20} color="#F59E0B" />
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>
//                   This Week’s Top Creators
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={() => router.push('/rankings' as any)}>
//                 <Text style={[styles.viewAllLink, { color: currentColors.primary }]}>
//                   View all →
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Top 3 Rankings */}
//             <View style={styles.rankingsTeaser}>
//               {loadingRankings ? (
//                 <ActivityIndicator color={currentColors.primary} />
//               ) : (
//                 rankings.map((ranking: any, index: number) => (
//                   <View
//                     key={ranking.userId || index}
//                     style={[styles.rankingItem, { backgroundColor: colors.card }]}
//                   >
//                     <View
//                       style={[
//                         styles.rankingBadge,
//                         { backgroundColor: getRankColor(index + 1) }
//                       ]}
//                     >
//                       <Text style={styles.rankingBadgeText}>{index + 1}</Text>
//                     </View>
//                     <Avatar uri={ranking.avatar} size={32} />
//                     <View style={styles.rankingUserInfo}>
//                       <Text style={[styles.rankingUserName, { color: colors.text }]}>
//                         {ranking.name}
//                       </Text>
//                       <Text style={[styles.rankingScore, { color: colors.gray500 || '#6B7280' }]}>
//                         {ranking.score} pts
//                       </Text>
//                     </View>
//                   </View>
//                 ))
//               )}
//             </View>

//             {/* Prize Pool Card */}
//             <View style={[styles.prizePoolCard, isDark ? styles.prizePoolCardDark : styles.prizePoolCardLight]}>
//               <View style={styles.prizePoolContent}>
//                 <View>
//                   <Text style={[styles.prizePoolTitle, isDark ? styles.prizePoolTitleDark : styles.prizePoolTitleLight]}>
//                     💰 Monthly Prize Pool
//                   </Text>
//                   <Text style={[styles.prizePoolSubtitle, isDark ? styles.prizePoolSubtitleDark : styles.prizePoolSubtitleLight]}>
//                     ₵150 total rewards this month
//                   </Text>
//                 </View>
//                 <TouchableOpacity 
//                   onPress={() => router.push('/rankings' as any)}
//                   style={styles.competeButton}
//                 >
//                   <LinearGradient
//                     colors={['#F59E0B', '#F97316']}
//                     start={{ x: 0, y: 0 }}
//                     end={{ x: 1, y: 0 }}
//                     style={styles.competeButtonGradient}
//                   >
//                     <Ionicons name="trophy" size={14} color="white" />
//                     <Text style={styles.competeButtonText}>Compete</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <View key="rankings-cta-section" style={[styles.rankingCTACard, { backgroundColor: colors.card }]}>
//             <View style={styles.rankingCTAContent}>
//               <View style={[styles.rankingIcon, { backgroundColor: '#8B5CF6' }]}>
//                 <Ionicons name="trophy" size={24} color="white" />
//               </View>
//               <View style={styles.rankingCTAText}>
//                 <Text style={[styles.rankingCTATitle, { color: colors.text }]}>
//                   Join the Competition!
//                 </Text>
//                 <Text style={[styles.rankingCTASubtitle, { color: colors.gray500 || '#6B7280' }]}>
//                   Compete for ₵150 monthly prizes
//                 </Text>
//               </View>
//               <TouchableOpacity 
//                 style={[styles.upgradeButton, { backgroundColor: '#8B5CF6' }]}
//                 onPress={() => router.push('/subscription' as any)}
//               >
//                 <Ionicons name="star" size={16} color="white" />
//                 <Text style={styles.upgradeButtonText}>Upgrade</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {/* Post Suggestions */}
//         {suggestions.length > 0 && showSuggestions && (
//           <View key="suggestions-section" style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <View style={styles.sectionHeaderLeft}>
//                 <Ionicons name="sparkles" size={20} color="#8B5CF6" />
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>
//                   Suggested for You
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowSuggestions(false)}>
//                 <Ionicons name="close" size={18} color={colors.gray500 || '#6B7280'} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
//               {suggestions.map((suggestion: any) => (
//                 <TouchableOpacity
//                   key={suggestion.id}
//                   style={[styles.suggestionCard, { backgroundColor: colors.card }]}
//                   onPress={() => router.push(`/post/${suggestion.id}` as any)}
//                 >
//                   <Image
//                     source={{ uri: suggestion.media?.url || suggestion.media?.thumbnail || '' }}
//                     style={styles.suggestionImage}
//                   />
//                   <View style={styles.suggestionInfo}>
//                     <Text style={[styles.suggestionUser, { color: colors.text }]} numberOfLines={1}>
//                       {suggestion.user?.name || 'User'}
//                     </Text>
//                     <View style={styles.suggestionStats}>
//                       <Ionicons name="heart" size={12} color="#EF4444" />
//                       <Text style={[styles.suggestionStatText, { color: colors.gray500 || '#6B7280' }]}>
//                         {suggestion.likesCount || 0}
//                       </Text>
//                     </View>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         {/* Trending Posts */}
//         {trendingPosts.length > 0 && (
//           <View key="trending-section" style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <View style={styles.sectionHeaderLeft}>
//                 <Ionicons name="flame" size={20} color="#F59E0B" />
//                 <Text style={[styles.sectionTitle, { color: colors.text }]}>
//                   Trending Now
//                 </Text>
//               </View>
//               <TouchableOpacity onPress={() => setShowTrending(!showTrending)}>
//                 <Ionicons 
//                   name={showTrending ? "chevron-up" : "chevron-down"} 
//                   size={18} 
//                   color={colors.gray500 || '#6B7280'} 
//                 />
//               </TouchableOpacity>
//             </View>
//             {showTrending && (
//               <View style={styles.trendingContainer}>
//                 {trendingPosts.slice(0, 3).map((post: any) => (
//                   <PostCard key={post.id} post={post} />
//                 ))}
//                 {trendingPosts.length > 3 && (
//                   <TouchableOpacity
//                     style={[styles.viewMoreButton, { backgroundColor: colors.card }]}
//                     onPress={() => {
//                       // Navigate to trending view
//                       router.push('/trending' as any);
//                     }}
//                   >
//                     <Text style={[styles.viewMoreText, { color: currentColors.primary }]}>
//                       View More Trending →
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             )}
//           </View>
//         )}

//         {/* Feed */}
//         <View key="feed-section" style={styles.section}>
//           <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
//             Your Feed
//           </Text>
//           <View style={styles.feed}>
//             {posts.length === 0 ? (
//               [0,1,2].map((i) => (
//                 <View key={i} style={{ backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' }}>
//                   <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
//                     <SkeletonLoader height={36} width={36} borderRadius={18} />
//                     <View style={{ flex: 1 }}>
//                       <SkeletonLoader height={12} style={{ width: '50%' }} />
//                       <SkeletonLoader height={10} style={{ width: '30%', marginTop: 6}} />
//                     </View>
//                   </View>
//                   <SkeletonLoader height={300} />
//                   <View style={{ padding: 12 }}>
//                     <SkeletonLoader height={12} style={{ width: '60%' }} />
//                   </View>
//                 </View>
//               ))
//               ) : (
//               posts
//                 .filter((post: any) => post && post.id)
//                 .map((post: any) => (
//                   <PostCard key={post.id} post={post} />
//                 ))
//             )}
//           </View>

//           {loadingMore && (
//             <View style={[styles.loadMoreButton, { backgroundColor: colors.card }]}> 
//               <View style={{ width: '100%' }}>
//                 <View style={{ marginBottom: 8 }}>
//                   <SkeletonLoader height={16} style={{ width: '30%' }} />
//                 </View>
//                 <SkeletonLoader height={16} style={{ width: '20%' }} />
//               </View>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* More Sheet */}
//       <MoreSheet
//         visible={moreSheetVisible}
//         onClose={() => setMoreSheetVisible(false)}
//       />

//       {/* Floating Action Buttons */}
//       <FloatingActionButtons />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: theme.spacing[4],
//     paddingVertical: theme.spacing[3],
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   headerButton: {
//     padding: theme.spacing[2],
//   },
//   headerTitle: {
//     fontSize: theme.typography.fontSize[18],
//     fontWeight: theme.typography.fontWeight.bold,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerActions: {
//     flexDirection: 'row',
//     gap: theme.spacing[2],
//   },
//   section: {
//     padding: theme.spacing[4],
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     gap: theme.spacing[2],
//     marginBottom: theme.spacing[3],
//   },
//   sectionHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[2],
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: theme.typography.fontSize[16],
//     fontWeight: theme.typography.fontWeight.bold,
//     flex: 1,
//   },
//   storeGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: theme.spacing[3],
//     marginBottom: theme.spacing[3],
//   },
//   storeItem: {
//     width: '47%',
//     borderRadius: theme.borderRadius.xl,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   storeItemImage: {
//     width: '100%',
//     height: 120,
//   },
//   storeItemInfo: {
//     padding: theme.spacing[2],
//   },
//   storeItemName: {
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.medium,
//     marginBottom: theme.spacing[1],
//   },
//   storeItemPrice: {
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.extrabold,
//   },
//   viewAllButton: {
//     paddingVertical: theme.spacing[3],
//     borderRadius: theme.borderRadius.xl,
//     alignItems: 'center',
//   },
//   viewAllButtonText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   rankingCTACard: {
//     margin: theme.spacing[4],
//     padding: theme.spacing[4],
//     borderRadius: theme.borderRadius.xl,
//     borderWidth: 1,
//     borderColor: '#8B5CF640',
//   },
//   rankingCTAContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[3],
//   },
//   rankingIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   rankingCTAText: {
//     flex: 1,
//   },
//   rankingCTATitle: {
//     fontSize: theme.typography.fontSize[16],
//     fontWeight: theme.typography.fontWeight.bold,
//     marginBottom: 2,
//   },
//   rankingCTASubtitle: {
//     fontSize: theme.typography.fontSize[12],
//   },
//   upgradeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//     paddingHorizontal: theme.spacing[4],
//     paddingVertical: theme.spacing[2],
//     borderRadius: theme.borderRadius.xl,
//   },
//   upgradeButtonText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   feed: {
//     gap: -6,
//   },
//   loadMoreButton: {
//     paddingVertical: theme.spacing[3],
//     borderRadius: theme.borderRadius.xl,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     marginTop: theme.spacing[4],
//   },
//   loadMoreText: {
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   horizontalScroll: {
//     marginHorizontal: -theme.spacing[4],
//     paddingHorizontal: theme.spacing[4],
//   },
//   suggestionCard: {
//     width: 120,
//     marginRight: theme.spacing[3],
//     borderRadius: theme.borderRadius.xl,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   suggestionImage: {
//     width: '100%',
//     height: 150,
//     backgroundColor: '#F3F4F6',
//   },
//   suggestionInfo: {
//     padding: theme.spacing[2],
//   },
//   suggestionUser: {
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.medium,
//     marginBottom: theme.spacing[1],
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//   },
//   suggestionStatText: {
//     fontSize: theme.typography.fontSize[11],
//   },
//   trendingContainer: {
//     gap: theme.spacing[3],
//   },
//   viewMoreButton: {
//     paddingVertical: theme.spacing[3],
//     borderRadius: theme.borderRadius.xl,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     marginTop: theme.spacing[2],
//   },
//   viewMoreText: {
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   rankingHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: theme.spacing[2],
//   },
//   rankingHeaderLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[2],
//     flex: 1,
//   },
//   viewAllLink: {
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.medium,
//   },
//   rankingsTeaser: {
//     gap: theme.spacing[2],
//     marginBottom: theme.spacing[3],
//   },
//   rankingItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[2],
//     padding: theme.spacing[2],
//     borderRadius: theme.borderRadius.lg,
//   },
//   rankingBadge: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   rankingBadgeText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.bold,
//   },
//   rankingUserInfo: {
//     flex: 1,
//   },
//   rankingUserName: {
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   rankingScore: {
//     fontSize: theme.typography.fontSize[12],
//   },
//   prizePoolCard: {
//     padding: theme.spacing[3],
//     borderRadius: theme.borderRadius.xl,
//     borderWidth: 1,
//   },
//   prizePoolCardLight: {
//     backgroundColor: '#FFFBEB',
//     borderColor: '#FDE68A',
//   },
//   prizePoolCardDark: {
//     backgroundColor: 'rgba(251, 191, 36, 0.2)',
//     borderColor: 'rgba(251, 191, 36, 0.3)',
//   },
//   prizePoolContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   prizePoolTitle: {
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.semibold,
//     marginBottom: 2,
//   },
//   prizePoolTitleLight: {
//     color: '#92400E',
//   },
//   prizePoolTitleDark: {
//     color: '#FCD34D',
//   },
//   prizePoolSubtitle: {
//     fontSize: theme.typography.fontSize[12],
//   },
//   prizePoolSubtitleLight: {
//     color: '#A16207',
//   },
//   prizePoolSubtitleDark: {
//     color: '#FDE68A',
//   },
//   competeButton: {
//     borderRadius: theme.borderRadius.lg,
//     overflow: 'hidden',
//   },
//   competeButtonGradient: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[1.5],
//   },
//   competeButtonText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.medium,
//   },
// });










import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { useStore } from '../../hooks/useStore';
import { theme } from '../../theme';
import { StoryRow } from '../../components/stories/StoryRow';
import { PostCard } from '../../components/posts/PostCard';
import { Avatar } from '../../components/ui/Avatar';
import { MoreSheet } from '../../components/sheets/MoreSheet';
import { FloatingActionButtons } from '../../components/ui/FloatingActionButtons';
import { userApi } from '../../services/userApi';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, currentColors } = useTheme();
  const { user: _user } = useAuth();
  const { posts, featuredPost, stories, refreshFeed, fetchMore, hasMore } = usePosts();
  const { isPremium, storeItems } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreSheetVisible, setMoreSheetVisible] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showTrending, setShowTrending] = useState(false);

  useEffect(() => {
    console.log('🏠 Index screen - Posts updated:', posts.length);
    console.log('🏠 Index screen - First post:', posts[0] ? JSON.stringify(posts[0], null, 2) : 'No posts');
    setLoadingMore(false);
  }, [posts]);

  const fetchSuggestions = React.useCallback(async () => {
    try {
      const postsApi = (await import('../../services/postsApi')).default;
      const response = await postsApi.getPostSuggestions(5);
      setSuggestions(response.suggestions || response || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  const fetchTrending = React.useCallback(async () => {
    try {
      const postsApi = (await import('../../services/postsApi')).default;
      const response = await postsApi.getTrendingPosts(1, 5, '24h');
      setTrendingPosts(response.posts || response || []);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      setTrendingPosts([]);
    }
  }, []);

  const fetchRankings = React.useCallback(async () => {
    try {
      setLoadingRankings(true);
      const response = await userApi.getRankings('weekly');
      setRankings((response.rankings || response || []).slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  }, []);

  useEffect(() => {
    if (isPremium) {
      fetchRankings();
    }
    fetchSuggestions();
    fetchTrending();
  }, [isPremium, fetchRankings, fetchSuggestions, fetchTrending]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshFeed();
    setRefreshing(false);
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchMore();
  }, [loadingMore, hasMore, fetchMore]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FCD34D';
      case 2: return '#9CA3AF';
      case 3: return '#FB923C';
      default: return '#E5E7EB';
    }
  };

  const colors = isDark ? {
    bg: theme.colors.dark.bg,
    card: theme.colors.dark.card,
    text: theme.colors.dark.text,
    gray500: '#6B7280',
    border: '#1F2937',
  } : {
    bg: '#FFFFFF',
    card: '#FFFFFF',
    text: '#111827',
    gray500: '#6B7280',
    border: '#F3F4F6',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMoreSheetVisible(true)}
        >
          <Ionicons name="menu" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/search' as any)}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (!loadingMore && hasMore) {
              loadMore();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Stories */}
        <View style={[styles.storiesSection, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <StoryRow stories={stories} />
        </View>

        {/* Featured Post */}
        {featuredPost && (
          <View style={[styles.featuredSection, { backgroundColor: colors.bg }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={18} color="#FBBF24" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured</Text>
            </View>
            <PostCard post={featuredPost} />
          </View>
        )}

        {/* Store Teaser */}
        <View style={[styles.storeSection, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bag-handle" size={18} color={theme.colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Fashion Store</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeScroll}>
            {storeItems.length === 0 ? (
              [0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.storeItem, { backgroundColor: colors.card }]}>
                  <SkeletonLoader height={160} />
                  <View style={styles.storeItemInfo}>
                    <SkeletonLoader height={14} style={{ width: '80%' }} />
                    <SkeletonLoader height={16} style={{ width: '40%', marginTop: 6 }} />
                  </View>
                </View>
              ))
            ) : (
              storeItems.slice(0, 6).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.storeItem, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/product/${item.id}` as any)}
                >
                  <Image source={{ uri: item.images[0] }} style={styles.storeItemImage} />
                  <View style={styles.storeItemInfo}>
                    <Text style={[styles.storeItemName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.storeItemPrice, { color: currentColors.primary }]}>
                      ₵{item.price}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: currentColors.primary }]}
            onPress={() => router.push('/store' as any)}
          >
            <Text style={styles.viewAllButtonText}>View All Items</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Rankings */}
        {isPremium ? (
          <View style={[styles.rankingsSection, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
            <View style={styles.rankingHeader}>
              <View style={styles.rankingHeaderLeft}>
                <Ionicons name="trophy" size={18} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Top Creators
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/rankings' as any)}>
                <Text style={[styles.viewAllLink, { color: currentColors.primary }]}>
                  View all →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rankingsTeaser}>
              {loadingRankings ? (
                <ActivityIndicator color={currentColors.primary} />
              ) : (
                rankings.map((ranking: any, index: number) => (
                  <View
                    key={ranking.userId || index}
                    style={[styles.rankingItem, { backgroundColor: colors.card }]}
                  >
                    <View
                      style={[
                        styles.rankingBadge,
                        { backgroundColor: getRankColor(index + 1) }
                      ]}
                    >
                      <Text style={styles.rankingBadgeText}>{index + 1}</Text>
                    </View>
                    <Avatar uri={ranking.avatar} size={36} />
                    <View style={styles.rankingUserInfo}>
                      <Text style={[styles.rankingUserName, { color: colors.text }]}>
                        {ranking.name}
                      </Text>
                      <Text style={[styles.rankingScore, { color: colors.gray500 }]}>
                        {ranking.score} pts
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.rankingCTACard, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
            <View style={styles.rankingCTAContent}>
              <View style={[styles.rankingIcon, { backgroundColor: '#8B5CF6' }]}>
                <Ionicons name="trophy" size={24} color="white" />
              </View>
              <View style={styles.rankingCTAText}>
                <Text style={[styles.rankingCTATitle, { color: colors.text }]}>
                  Join the Competition!
                </Text>
                <Text style={[styles.rankingCTASubtitle, { color: colors.gray500 }]}>
                  Compete for ₵150 monthly prizes
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.upgradeButton, { backgroundColor: '#8B5CF6' }]}
                onPress={() => router.push('/subscription' as any)}
              >
                <Ionicons name="star" size={16} color="white" />
                <Text style={styles.upgradeButtonText}>Upgrade</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Post Suggestions */}
        {suggestions.length > 0 && showSuggestions && (
          <View style={[styles.suggestionsSection, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons name="sparkles" size={18} color="#8B5CF6" />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Suggested for You
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Ionicons name="close" size={18} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {suggestions.map((suggestion: any) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={[styles.suggestionCard, { backgroundColor: colors.card }]}
                  onPress={() => router.push(`/post/${suggestion.id}` as any)}
                >
                  <Image
                    source={{ uri: suggestion.media?.url || suggestion.media?.thumbnail || '' }}
                    style={styles.suggestionImage}
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'transparent']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={styles.suggestionOverlay}
                  >                    <Text style={styles.suggestionUser} numberOfLines={1}>
                      {suggestion.user?.name || 'User'}
                    </Text>
                    <View style={styles.suggestionStats}>
                      <Ionicons name="heart" size={12} color="white" />
                      <Text style={styles.suggestionStatText}>
                        {suggestion.likesCount || 0}
                      </Text>
                    </View>
                  </LinearGradient> 
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Feed Section Header */}
        <View style={[styles.feedHeader, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
          <Text style={[styles.feedHeaderText, { color: colors.text }]}>Latest Posts</Text>
        </View>

        {/* Feed */}
        <View style={[styles.feed, { backgroundColor: colors.bg }]}>
          {posts.length === 0 ? (
            [0, 1, 2].map((i) => (
              <View key={i} style={[styles.skeletonPost, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <View style={styles.skeletonHeader}>
                  <SkeletonLoader height={40} width={40} borderRadius={20} />
                  <View style={{ flex: 1 }}>
                    <SkeletonLoader height={12} style={{ width: '40%' }} />
                    <SkeletonLoader height={10} style={{ width: '30%', marginTop: 6 }} />
                  </View>
                </View>
                <SkeletonLoader height={400} />
                <View style={{ padding: 12 }}>
                  <SkeletonLoader height={12} style={{ width: '60%' }} />
                </View>
              </View>
            ))
          ) : (
            posts
              .filter((post: any) => post && post.id)
              .map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
          )}

          {loadingMore && (
            <View style={[styles.loadingMore, { backgroundColor: colors.bg }]}>
              <ActivityIndicator size="small" color={currentColors.primary} />
              <Text style={[styles.loadingMoreText, { color: colors.gray500 }]}>Loading more posts...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <MoreSheet
        visible={moreSheetVisible}
        onClose={() => setMoreSheetVisible(false)}
      />

      <FloatingActionButtons />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  storiesSection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  featuredSection: {
    paddingTop: 16,
  },
  storeSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  storeScroll: {
    paddingLeft: 16,
  },
  storeItem: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeItemImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  storeItemInfo: {
    padding: 10,
  },
  storeItemName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  storeItemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rankingsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rankingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  rankingsTeaser: {
    paddingHorizontal: 16,
    gap: 8,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  rankingUserInfo: {
    flex: 1,
  },
  rankingUserName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  rankingScore: {
    fontSize: 13,
  },
  rankingCTACard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rankingCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankingCTAText: {
    flex: 1,
  },
  rankingCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rankingCTASubtitle: {
    fontSize: 13,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  horizontalScroll: {
    paddingLeft: 16,
  },
  suggestionCard: {
    width: 130,
    height: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  suggestionImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  suggestionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  suggestionUser: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  suggestionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionStatText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },
  feedHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  feedHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  feed: {
    paddingBottom: 20,
    marginHorizontal: 0,
  },
  skeletonPost: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginHorizontal: 0,
    width: '100%',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 13,
  },
});