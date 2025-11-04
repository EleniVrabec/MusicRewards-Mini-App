// Toast Component - Global toast notifications
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useToastStore } from '../../stores/toastStore';
import { THEME } from '../../constants/theme';
import { GlassCard } from './GlassCard';

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const hideToast = useToastStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onHide={() => hideToast(toast.id)} />
      ))}
    </View>
  );
};

interface ToastItemProps {
  toast: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  onHide: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const slideAnim = new Animated.Value(-100);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Slide in and fade in
    const animation = Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
    
    animation.start();
    
    // Cleanup: stop animation on unmount
    return () => {
      animation.stop();
    };
  }, []);

  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return THEME.colors.secondary;
      case 'error':
        return '#FF6B6B';
      case 'warning':
        return THEME.colors.accent;
      case 'info':
      default:
        return THEME.colors.primary;
    }
  };

  const getIcon = () => {
    const iconSize = 20;
    const iconColor = THEME.colors.text.primary;
    switch (toast.type) {
      case 'success':
        return <MaterialIcons name="check-circle" size={iconSize} color={iconColor} />;
      case 'error':
        return <MaterialIcons name="error" size={iconSize} color={iconColor} />;
      case 'warning':
        return <MaterialIcons name="warning" size={iconSize} color={iconColor} />;
      case 'info':
      default:
        return <MaterialIcons name="info" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={onHide} activeOpacity={0.8}>
        <GlassCard
          style={{
            ...styles.toast,
            borderLeftWidth: 4,
            borderLeftColor: getToastColor(),
          }}
        >
          <View style={styles.icon}>{getIcon()}</View>
          <Text style={styles.message}>{toast.message}</Text>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastWrapper: {
    width: '100%',
    marginBottom: THEME.spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
  },
  icon: {
    marginRight: THEME.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.primary,
    fontWeight: '500',
  },
});

