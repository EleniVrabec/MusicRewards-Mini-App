// Confirmation Modal Component - Reusable themed confirmation dialog
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore, selectThemeMode } from '../../stores/themeStore';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  variant?: 'primary' | 'destructive';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  icon = 'warning',
  iconColor,
  variant = 'primary',
}) => {
  const THEME = useTheme();
  const themeMode = useThemeStore(selectThemeMode);
  // Memoize styles based on themeMode to prevent unnecessary re-renders
  const styles = useMemo(() => createStyles(THEME), [themeMode]);
  const iconColorValue = iconColor || THEME.colors.accent;
  // Map destructive variant to primary (GlassButton doesn't have destructive variant)
  const buttonVariant = variant === 'destructive' ? 'primary' : variant;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <GlassCard style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <MaterialIcons 
              name={icon} 
              size={32} 
              color={iconColorValue} 
            />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.modalButtons}>
            <GlassButton
              title={cancelText}
              onPress={onCancel}
              variant="secondary"
              style={styles.modalButton}
              accessibilityLabel={`Cancel: ${title}`}
              accessibilityHint="Double tap to cancel this action"
            />
            <GlassButton
              title={confirmText}
              onPress={onConfirm}
              variant={buttonVariant}
              style={styles.modalButton}
              accessibilityLabel={`Confirm: ${title}`}
              accessibilityHint="Double tap to confirm this action"
            />
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const createStyles = (THEME: ReturnType<typeof useTheme>) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: THEME.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  modalTitle: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginLeft: THEME.spacing.md,
    flex: 1,
  },
  modalMessage: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    lineHeight: 22,
    marginBottom: THEME.spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

