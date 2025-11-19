import '../services/i18n';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../hooks/useAuth';
import { StoreProvider } from '../hooks/useStore';
import { ToastProvider } from '../components/providers/ToastProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { LogBox} from 'react-native';

LogBox.ignoreLogs([
  // React Native warnings
  "Warning: useInsertionEffect must not schedule updates.",
  "Warning: Can't perform a React state update on an unmounted component.",
  "Warning: Failed prop type:",
  "Warning: Each child in a list should have a unique",
  "Warning: React does not recognize the",
  "Warning: validateDOMNesting",
  "Warning: componentWillReceiveProps has been renamed",
  "Warning: componentWillMount has been renamed",
  "Warning: componentWillUpdate has been renamed",
  
  // UIFrameGuarded specific warnings
  "UIFrameGuarded",
  "Unable to find viewState for tag",
  "Surface stopped",
  "View state not found",
  "Component state not found",
  
  // Expo specific warnings
  "expo-notifications: Android Push notifications",
  "expo-notifications functionality is not fully supported in Expo Go",
  "expo-secure-store:",
  "expo-camera:",
  "expo-location:",
  "expo-image-picker:",
  "expo-font:",
  "expo-splash-screen:",
  "expo-status-bar:",
  "expo-linear-gradient:",
  "expo-haptics:",
  "expo-av:",
  "expo-barcode-scanner:",
  
  // Metro bundler warnings
  "Metro waiting on",
  "Bundler cache is empty",
  "Failed to construct transformer",
  "Failed to start watch mode",
  
  // Network and API warnings
  "Network request failed",
  "fetch failed",
  "XMLHttpRequest",
  "WebSocket connection",
  
  // React Navigation warnings
  "Non-serializable values were found in the navigation state",
  "The action 'NAVIGATE' with payload",
  "The action 'GO_BACK' was not handled by any navigator",
  
  // AsyncStorage warnings
  "AsyncStorage has been extracted from react-native",
  
  // Reanimated warnings
  "Reanimated 2",
  "react-native-reanimated",
  
  // General warnings
  "Require cycle:",
  "Module not found:",
  "Unable to resolve module",
  "Error: ENOSPC: System limit for number of file watchers reached",
  "Error: EMFILE: too many open files",
  "Error: EACCES: permission denied",
  "Error: ENOENT: no such file or directory",
  
  // Web specific warnings
  "Warning: ReactDOM.render is deprecated",
  "Warning: findDOMNode is deprecated",
  "Warning: componentWillReceiveProps has been renamed",
  
  // Image loading warnings
  "Image source",
  "Image loading failed",
  "Failed to load image",
  
  // Console warnings
  "console.warn",
  "console.error",
  
  // Performance warnings
  "Warning: Maximum update depth exceeded",
  "Warning: setState(...): Can only update a mounted or mounting component",
  
  // Development warnings
  "Warning: React DevTools",
  "Warning: React does not recognize the",
  
  // Generic error patterns
  /^Warning:.*$/,
  /^Error:.*$/,
  /^Failed to.*$/,
  /^Unable to.*$/,
  /^Module.*not found.*$/,
  /^.*is deprecated.*$/,
]);

// Disable error popups completely in development
if (__DEV__) {
  try {
    LogBox.ignoreLogs(['Warning:', 'Error:', 'UIFrameGuarded']);
  } catch {
    console.log('LogBox.ignoreLogs not available');
  }
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    // Request permissions for notifications
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();

    // Set up notification listeners
    const _notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const _responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      // Cleanup listeners
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
            <StoreProvider>
              <ToastProvider>
                <StatusBar style="auto" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="product/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="stories/create" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="stories/view" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="store" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="cart" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="checkout" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="edit-profile" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="profile-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="avatar-picker" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="privacy-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="language-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="notifications" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="notification-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="connections" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="subscription" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="rankings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="themes" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="create-event" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="event/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="seller-dashboard" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="add-item" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="chat" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="chat/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="comments" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="similar-items" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="database-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="api-settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="help" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                  <Stack.Screen name="about" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                </Stack>
              </ToastProvider>
            </StoreProvider>
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
