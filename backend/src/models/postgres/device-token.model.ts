export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_id?: string;
  app_version?: string;
  active: boolean;
  last_used_at?: Date;
  created_at: Date;
  updated_at: Date;
}