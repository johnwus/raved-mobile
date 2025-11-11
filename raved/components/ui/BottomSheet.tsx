import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ViewStyle,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type SheetState = 'collapsed' | 'expanded' | 'default';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | string;
  showHandle?: boolean;
  allowCollapse?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  height = '90%',
  showHandle = true,
  allowCollapse = true,
}) => {
  const { isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const heightAnim = useRef(new Animated.Value(SCREEN_HEIGHT * 0.6)).current;
  const [sheetState, setSheetState] = useState<SheetState>('default');
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const getSheetHeight = (state: SheetState): number => {
    switch (state) {
      case 'collapsed':
        return SCREEN_HEIGHT * 0.6; // 60vh
      case 'expanded':
        return SCREEN_HEIGHT * 0.95; // 95vh
      default:
        return SCREEN_HEIGHT * 0.9; // Default
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        setIsDragging(true);
        startY.current = gestureState.moveY;
        currentY.current = gestureState.moveY;
      },
      onPanResponderMove: (_, gestureState) => {
        currentY.current = gestureState.moveY;
        const deltaY = currentY.current - startY.current;
        
        if (deltaY > 0) {
          // Dragging down
          slideAnim.setValue(Math.min(deltaY, SCREEN_HEIGHT));
        } else if (deltaY < 0 && allowCollapse) {
          // Dragging up (only if allowCollapse)
          const newHeight = getSheetHeight(sheetState) + Math.abs(deltaY);
          if (newHeight <= SCREEN_HEIGHT * 0.95) {
            heightAnim.setValue(newHeight);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        const deltaY = currentY.current - startY.current;

        if (deltaY > 100) {
          // Swipe down - collapse or close
          if (sheetState === 'expanded' && allowCollapse) {
            setSheetState('collapsed');
            Animated.timing(heightAnim, {
              toValue: getSheetHeight('collapsed'),
              duration: 400,
              useNativeDriver: false,
            }).start();
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
          } else {
            onClose();
          }
        } else if (deltaY < -100 && allowCollapse) {
          // Swipe up - expand
          setSheetState('expanded');
          Animated.timing(heightAnim, {
            toValue: getSheetHeight('expanded'),
            duration: 400,
            useNativeDriver: false,
          }).start();
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start();
        } else {
          // Return to current state
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start();
          Animated.timing(heightAnim, {
            toValue: getSheetHeight(sheetState),
            duration: 400,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setSheetState('default');
      heightAnim.setValue(getSheetHeight('default'));
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400, // .4s exactly as HTML
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // cubic-bezier(0.25, 0.46, 0.45, 0.94) - exact easing from HTML
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 400, // .4s exactly as HTML
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // cubic-bezier(0.25, 0.46, 0.45, 0.94) - exact easing from HTML
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleDoubleTap = () => {
    if (!allowCollapse) return;
    
    if (sheetState === 'collapsed') {
      setSheetState('expanded');
      Animated.timing(heightAnim, {
        toValue: getSheetHeight('expanded'),
        duration: 400,
        useNativeDriver: false,
      }).start();
    } else {
      setSheetState('collapsed');
      Animated.timing(heightAnim, {
        toValue: getSheetHeight('collapsed'),
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  };

  if (!visible) return null;

  const getStaticHeight = () => {
    if (allowCollapse && sheetState !== 'default') {
      return getSheetHeight(sheetState);
    }
    if (typeof height === 'number') {
      return height;
    }
    return SCREEN_HEIGHT * 0.9;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: visible ? 1 : 0 }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.sheet,
            isDark && styles.sheetDark,
            allowCollapse && sheetState !== 'default' 
              ? { height: heightAnim, maxHeight: typeof height === 'string' ? height : undefined, transform: [{ translateY: slideAnim }] }
              : { height: getStaticHeight(), maxHeight: typeof height === 'string' ? height : undefined, transform: [{ translateY: slideAnim }] },
          ]}
          {...(showHandle ? panResponder.panHandlers : {})}
        >
          <SafeAreaView style={styles.safeArea}>
            {showHandle && (
              <TouchableOpacity
                style={styles.handleContainer}
                onPress={handleDoubleTap}
                activeOpacity={0.7}
              >
                <View style={[styles.handle, isDark && styles.handleDark]} />
              </TouchableOpacity>
            )}
            {children}
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Exactly as HTML: rgba(0,0,0,0.4)
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 10,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  sheetDark: {
    backgroundColor: '#171923',
  },
  safeArea: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  handleDark: {
    backgroundColor: '#374151',
  },
});

