import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Avatar } from '../../components/ui/Avatar';
import { eventsApi } from '../../services/eventsApi';
import type { Event } from '../../services/eventsApi';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const data = await eventsApi.getEvent(id);
        if (data && data.event) {
          setEvent(data.event as Event);
          setAttending(!!data.event.attending);
        }
      } catch (e) {
        console.error('Failed to load event:', e);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleAttending = () => {
    setAttending(!attending);
    // TODO: Update event in store/state
  };

  // Handle missing date safely
  const isFull = event.maxAttendees ? event.attendees >= event.maxAttendees : false;
  const dateParts = event.date ? event.date.split('-') : ['2025', '01', '01'];
  const _month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(dateParts[1]) - 1];
  const _day = parseInt(dateParts[2]) || 1;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.eventImage} />
        </View>

        {/* Event Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Organizer */}
          <View style={styles.organizerRow}>
            <Avatar uri={event.organizer?.avatar || ''} size={20} />
            <Text style={styles.organizerText}>
              by {event.organizer?.name || 'Organizer'}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {event.date} • {event.time}
            </Text>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={2}>
              {event.location}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            {event.description}
          </Text>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {event.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.attendeeInfo}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.attendeeText}>
                {event.attendees}/{event.maxAttendees || '-'} attending
              </Text>
              {isFull && (
                <Text style={styles.fullText}>Full</Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.joinButton,
                attending && styles.joinButtonAttending,
                (isFull && !attending) && styles.joinButtonDisabled,
              ]}
              onPress={handleToggleAttending}
              disabled={isFull && !attending}
            >
              <Text
                style={[
                  styles.joinButtonText,
                  attending && styles.joinButtonTextAttending,
                  (isFull && !attending) && styles.joinButtonTextDisabled,
                ]}
              >
                {attending ? 'Attending' : isFull ? 'Full' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing[4],
  },
  imageContainer: {
    width: '100%',
    height: 192, // h-48 = 12rem = 192px
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[1],
  },
  title: {
    flex: 1,
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginRight: theme.spacing[2],
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginTop: theme.spacing[1],
  },
  organizerText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    marginTop: theme.spacing[2],
  },
  infoText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    flex: 1,
  },
  description: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    lineHeight: 20,
    marginTop: theme.spacing[3],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
  tag: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: theme.typography.fontSize[10],
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  attendeeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  fullText: {
    fontSize: theme.typography.fontSize[12],
    color: '#EF4444',
    marginLeft: theme.spacing[1],
    fontWeight: theme.typography.fontWeight.medium,
  },
  joinButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary,
    minWidth: 100,
    alignItems: 'center',
  },
  joinButtonAttending: {
    backgroundColor: '#D1FAE5', // green-100
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  joinButtonTextAttending: {
    color: '#065F46', // green-700
  },
  joinButtonTextDisabled: {
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  errorText: {
    fontSize: theme.typography.fontSize[16],
    color: '#6B7280',
  },
  backButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.primary,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

