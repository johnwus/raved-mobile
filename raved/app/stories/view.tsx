import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StoryViewer } from '../../components/stories/StoryViewer';
import { usePosts } from '../../hooks/usePosts';

export default function StoryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { stories } = usePosts();
  const [visible, setVisible] = useState(true);

  const storyId = params.storyId as string;
  const initialIndex = stories.findIndex(s => s.id === storyId);

  const handleClose = () => {
    setVisible(false);
    router.back();
  };

  return (
    <StoryViewer
      visible={visible}
      stories={stories}
      initialIndex={initialIndex >= 0 ? initialIndex : 0}
      onClose={handleClose}
    />
  );
}

