import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#E5E5E5',
  neutral300: '#D4D4D4',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral700: '#404040',
  neutral900: '#171717',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const sharedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral50,
  },
  screenPadding: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  h1: {
    color: colors.neutral900,
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    color: colors.neutral900,
    fontSize: 22,
    fontWeight: '600',
  },
  bodyText: {
    color: colors.neutral600,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  caption: {
    color: colors.neutral500,
    fontSize: 13,
    fontWeight: '400',
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.neutral700,
    fontSize: 13,
  },
  input: {
    minHeight: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral900,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
