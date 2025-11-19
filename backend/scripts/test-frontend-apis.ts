import fs from 'fs';

type Response = any;
type FetchFn = (input: string, init?: any) => Promise<Response>;
const fetchFn: FetchFn = (globalThis as any).fetch.bind(globalThis);

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api/v1';
const LOG_PATH = process.env.TEST_LOG_PATH || 'frontend-api-test-results.json';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TestContext {
  token?: string;
  refreshToken?: string;
  userId?: string;
  facultyId?: string;
  eventId?: string;
  postId?: string;
  storeItemId?: string;
  notificationId?: string;
  conversationId?: string;
  data: Record<string, any>;
}

interface TestResult {
  name: string;
  success: boolean;
  status?: number;
  description?: string;
  error?: string;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: any;
  auth?: boolean;
  headers?: Record<string, string>;
  rawBody?: BodyInit;
}

async function request(ctx: TestContext, options: RequestOptions) {
  const url = `${BASE_URL}${options.path}`;
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  let body: BodyInit | undefined = options.rawBody;

  if (!body && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  if (options.auth !== false && ctx.token) {
    headers['Authorization'] = `Bearer ${ctx.token}`;
  }

  const response = await fetchFn(url, {
    method: options.method,
    headers,
    body,
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch (err) {
    data = text;
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(
      `${options.method} ${options.path} failed with status ${response.status}: ${errorMessage}`,
    );
  }

  return { response, data };
}

const tests: Array<(ctx: TestContext) => Promise<TestResult>> = [];

tests.push(async (ctx) => {
  const maxAttempts = 5;
  let attempt = 0;
  let lastError: any;

  while (attempt < maxAttempts) {
    try {
      const res = await request(ctx, {
        method: 'POST',
        path: '/auth/login',
        body: { identifier: 'admin@raved.app', password: 'adminpassword' },
        auth: false,
      });
      ctx.token = res.data.token;
      ctx.refreshToken = res.data.refreshToken;
      ctx.userId = res.data.user?.id;
      return {
        name: 'Auth - Login',
        success: true,
        status: res.response.status,
        description: attempt > 0 ? `Authenticated after ${attempt + 1} attempts` : 'Authenticated as admin user',
      };
    } catch (error: any) {
      lastError = error;
      attempt += 1;
      if (attempt < maxAttempts) {
        await sleep(2000);
      }
    }
  }

  throw lastError || new Error('Login failed after retries');
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'POST',
    path: '/auth/refresh',
    body: { refreshToken: ctx.refreshToken },
  });
  ctx.token = res.data.token;
  ctx.refreshToken = res.data.refreshToken;
  return {
    name: 'Auth - Refresh Token',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/users/profile',
  });
  ctx.data.profile = res.data;
  return {
    name: 'User - Profile',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/rankings?period=weekly',
  });
  ctx.data.rankings = res.data;
  const otherUser = res.data.rankings?.find(
    (r: any) => r.user?.id && r.user.id !== ctx.userId,
  );
  if (otherUser) {
    ctx.data.otherUserId = otherUser.user.id;
  }
  return {
    name: 'User - Rankings',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/posts/feed?page=1&limit=10',
  });
  const posts = res.data?.posts || [];
  if (posts.length > 0) {
    ctx.postId = posts[0].id;
  }
  return {
    name: 'Posts - Feed',
    success: true,
    status: res.response.status,
    description: `Retrieved ${posts.length} posts`,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/posts/trending?page=1&limit=5&timeWindow=24h',
  });
  return {
    name: 'Posts - Trending',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/posts/suggestions?limit=5',
  });
  return {
    name: 'Posts - Suggestions',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/faculties',
  });
  const faculties = res.data?.faculties || [];
  if (faculties.length > 0) {
    ctx.facultyId = faculties[0].id;
  }
  return {
    name: 'Faculties - List',
    success: true,
    status: res.response.status,
    description: `Retrieved ${faculties.length} faculties`,
  };
});

tests.push(async (ctx) => {
  if (!ctx.facultyId) {
    return {
      name: 'Faculties - Stats',
      success: false,
      error: 'No facultyId available from previous test',
    };
  }
  const res = await request(ctx, {
    method: 'GET',
    path: `/faculties/${ctx.facultyId}/stats`,
  });
  return {
    name: 'Faculties - Stats',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/events?page=1&limit=10',
  });
  const events = res.data?.events || [];
  if (events.length > 0) {
    ctx.eventId = events[0].id;
  }
  return {
    name: 'Events - List',
    success: true,
    status: res.response.status,
    description: `Retrieved ${events.length} events`,
  };
});

tests.push(async (ctx) => {
  if (!ctx.eventId) {
    return {
      name: 'Events - Detail',
      success: false,
      error: 'No eventId available from previous test',
    };
  }
  const res = await request(ctx, {
    method: 'GET',
    path: `/events/${ctx.eventId}`,
  });
  return {
    name: 'Events - Detail',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  if (!ctx.eventId) {
    return {
      name: 'Events - Toggle Attendance',
      success: false,
      error: 'No eventId available from previous test',
    };
  }
  const res = await request(ctx, {
    method: 'POST',
    path: `/events/${ctx.eventId}/attend`,
  });
  const attending = res.data?.attending;
  await request(ctx, {
    method: 'POST',
    path: `/events/${ctx.eventId}/attend`,
  });
  return {
    name: 'Events - Toggle Attendance',
    success: true,
    status: res.response.status,
    description: `Attending flag toggled to ${attending}`,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/notifications?page=1&limit=20',
  });
  const notifications = res.data?.notifications || [];
  if (notifications.length > 0) {
    ctx.notificationId = notifications[0].id;
  }
  return {
    name: 'Notifications - List',
    success: true,
    status: res.response.status,
    description: `Retrieved ${notifications.length} notifications`,
  };
});

tests.push(async (ctx) => {
  if (!ctx.notificationId) {
    return {
      name: 'Notifications - Mark As Read',
      success: false,
      error: 'No notification to mark as read',
    };
  }
  const res = await request(ctx, {
    method: 'PUT',
    path: `/notifications/${ctx.notificationId}/read`,
    body: {},
  });
  return {
    name: 'Notifications - Mark As Read',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'PUT',
    path: '/notifications/read-all',
    body: {},
  });
  return {
    name: 'Notifications - Mark All As Read',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/notifications/preferences',
  });
  ctx.data.notificationPreferences = res.data;
  return {
    name: 'Notifications - Preferences',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  try {
    // Always use a valid preferences object
    const payload = {
      pushEnabled: true,
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      messages: true,
      events: true,
      sales: true,
      marketing: false,
      soundEnabled: true,
      vibrationEnabled: true,
    };

    const res = await request(ctx, {
      method: 'PUT',
      path: '/notifications/preferences',
      body: { preferences: payload },
    });
    return {
      name: 'Notifications - Update Preferences',
      success: true,
      status: res.response.status,
    };
  } catch (error: any) {
    // Return a proper test result instead of throwing
    return {
      name: 'Notifications - Update Preferences',
      success: false,
      error: error?.message || String(error),
    };
  }
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/search/advanced?q=style&type=all&page=1&limit=10',
  });
  return {
    name: 'Search - Advanced',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/store/items?page=1&limit=10',
  });
  const items = res.data?.items || res.data?.storeItems || [];
  if (items.length > 0) {
    ctx.storeItemId = items[0].id || items[0].itemId;
  }
  return {
    name: 'Store - Items',
    success: true,
    status: res.response.status,
    description: `Retrieved ${items.length} items`,
  };
});

tests.push(async (ctx) => {
  if (!ctx.storeItemId) {
    return {
      name: 'Store - Item Detail',
      success: false,
      error: 'No store item id available',
    };
  }
  const res = await request(ctx, {
    method: 'GET',
    path: `/store/items/${ctx.storeItemId}`,
  });
  return {
    name: 'Store - Item Detail',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/subscriptions/plans',
  });
  ctx.data.plans = res.data;
  return {
    name: 'Subscriptions - Plans',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/subscriptions/status',
  });
  return {
    name: 'Subscriptions - Status',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: `/users/${ctx.userId}/posts?page=1&limit=10`,
  });
  return {
    name: 'User - Posts',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: `/users/${ctx.userId}/comments?page=1&limit=10`,
  });
  return {
    name: 'User - Comments',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: `/users/${ctx.userId}/liked-posts?page=1&limit=10`,
  });
  return {
    name: 'User - Liked Posts',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: `/users/${ctx.userId}/saved-posts?page=1&limit=10`,
  });
  return {
    name: 'User - Saved Posts',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/analytics/user?period=30d',
  });
  return {
    name: 'Analytics - User',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/analytics/store?period=30d',
  });
  return {
    name: 'Analytics - Store',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'POST',
    path: '/analytics/track',
    body: {
      eventType: 'test_event',
      eventCategory: 'automation',
      eventAction: 'run',
      eventLabel: 'frontend-api-test',
      eventValue: 1,
    },
  });
  return {
    name: 'Analytics - Track Event',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/notifications/preferences',
  });
  return {
    name: 'Notifications - Preferences (repeat)',
    success: true,
    status: res.response.status,
  };
});

// Stories API tests
tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/stories',
  });
  ctx.data.stories = res.data;
  return {
    name: 'Stories - Get Stories',
    success: true,
    status: res.response.status,
    description: `Retrieved ${res.data?.storyGroups?.length || 0} story groups`,
  };
});

// Chats API tests
tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/chats',
  });
  const chats = res.data?.chats || [];
  if (chats.length > 0) {
    ctx.conversationId = chats[0].id;
  }
  return {
    name: 'Chats - Get Conversations',
    success: true,
    status: res.response.status,
    description: `Retrieved ${chats.length} conversations`,
  };
});

tests.push(async (ctx) => {
  if (!ctx.conversationId) {
    return {
      name: 'Chats - Get Messages',
      success: false,
      error: 'No conversation id available',
    };
  }
  const res = await request(ctx, {
    method: 'GET',
    path: `/chats/${ctx.conversationId}/messages?page=1&limit=50`,
  });
  return {
    name: 'Chats - Get Messages',
    success: true,
    status: res.response.status,
    description: `Retrieved ${res.data?.messages?.length || 0} messages`,
  };
});

// Connections API tests
tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/users/connections?type=all',
  });
  ctx.data.connections = res.data;
  const otherUser = res.data?.following?.[0] || res.data?.followers?.[0];
  if (otherUser) {
    ctx.data.otherUserId = otherUser.id;
  }
  return {
    name: 'Connections - Get Connections',
    success: true,
    status: res.response.status,
    description: `Following: ${res.data?.following?.length || 0}, Followers: ${res.data?.followers?.length || 0}`,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/connections/requests',
  });
  return {
    name: 'Connections - Get Pending Requests',
    success: true,
    status: res.response.status,
    description: `Retrieved ${res.data?.requests?.length || 0} pending requests`,
  };
});

// Settings API tests
tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/users/settings',
  });
  ctx.data.settings = res.data;
  return {
    name: 'Settings - Get User Settings',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const current = ctx.data.settings?.settings || {};
  const payload = {
    showOnlineStatus: current.showOnlineStatus !== false,
    readReceipts: current.readReceipts !== false,
    allowDownloads: current.allowDownloads || false,
  };

  const res = await request(ctx, {
    method: 'PUT',
    path: '/users/settings',
    body: payload,
  });
  return {
    name: 'Settings - Update User Settings',
    success: true,
    status: res.response.status,
  };
});

// Theme API tests
tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'GET',
    path: '/themes/users/theme',
  });
  return {
    name: 'Theme - Get User Theme',
    success: true,
    status: res.response.status,
  };
});

tests.push(async (ctx) => {
  const res = await request(ctx, {
    method: 'POST',
    path: '/themes/users/dark-mode',
    body: { darkMode: true },
  });
  return {
    name: 'Theme - Set Dark Mode',
    success: true,
    status: res.response.status,
  };
});

// Faculty Posts test
tests.push(async (ctx) => {
  const faculties = ctx.data.faculties || [];
  if (faculties.length === 0) {
    return {
      name: 'Posts - Faculty Posts',
      success: false,
      error: 'No faculty available for testing',
    };
  }
  const facultyId = faculties[0].faculty?.toLowerCase().replace(/\s+/g, '-') || 'administration';
  const res = await request(ctx, {
    method: 'GET',
    path: `/posts/faculty/${facultyId}?page=1&limit=10`,
  });
  return {
    name: 'Posts - Faculty Posts',
    success: true,
    status: res.response.status,
    description: `Retrieved ${res.data?.posts?.length || 0} posts for faculty`,
  };
});

async function runTests() {
  const ctx: TestContext = { data: {} };
  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      const result = await test(ctx);
      results.push(result);
      console.log(`✔️  ${result.name} (${result.status ?? 'n/a'})`);
    } catch (error: any) {
      console.error(`❌ ${error?.message || error}`);
      results.push({
        name: error?.name || 'Unknown Test',
        success: false,
        error: error?.message || String(error),
      });
    }
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify({ results, timestamp: new Date().toISOString() }, null, 2));
  console.log(`\nDetailed results saved to ${LOG_PATH}`);
}

runTests().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});


