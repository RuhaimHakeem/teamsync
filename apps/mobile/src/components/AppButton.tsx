import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function AppButton({ label, onPress, disabled, variant = 'primary' }: AppButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled ? styles.disabledButton : null,
      ]}
    >
      <Text style={isPrimary ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    backgroundColor: colors.white,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryText: {
    color: colors.neutral700,
    fontSize: 15,
    fontWeight: '700',
  },
});
