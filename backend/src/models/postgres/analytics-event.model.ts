export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id: string;
  event_type: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  viewport_size?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'counter' | 'gauge' | 'histogram';
  tags: Record<string, string>;
  timestamp: Date;
  created_at: Date;
}

export interface AnalyticsReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  report_name: string;
  date_range_start: Date;
  date_range_end: Date;
  data: Record<string, any>;
  generated_at: Date;
  created_at: Date;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
  created_at: Date;
}

export interface ABTest {
  id: string;
  test_name: string;
  test_description?: string;
  feature_name: string;
  variants: string[];
  weights?: number[];
  start_date: Date;
  end_date?: Date;
  status: 'active' | 'paused' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface ABTestVariant {
  id: string;
  test_id: string;
  variant_name: string;
  variant_value: string;
  weight: number;
  created_at: Date;
}

export interface ABTestResult {
  id: string;
  test_id: string;
  variant_name: string;
  user_id: string;
  event_type: string;
  event_value?: number;
  timestamp: Date;
  created_at: Date;
}