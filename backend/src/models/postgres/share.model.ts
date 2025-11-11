export interface Share {
  id: number;
  contentType: 'post' | 'profile' | 'event' | 'product';
  contentId: string;
  userId: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'whatsapp' | 'native' | 'link';
  shareUrl: string;
  referralCode?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}