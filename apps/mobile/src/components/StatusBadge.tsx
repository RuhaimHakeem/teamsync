import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';
import type { TaskStatus } from '../types';

type StatusBadgeProps = {
  label: string;
  status?: TaskStatus;
};

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <Text style={[styles.badge, status ? statusStyle(status) : null]}>
      {label.replace('_', ' ')}
    </Text>
  );
}

function statusStyle(status: TaskStatus) {
  if (status === 'DONE') return styles.success;
  if (status === 'IN_PROGRESS') return styles.warning;
  return styles.danger;
}

const styles = StyleSheet.create({
  badge: {
    overflow: 'hidden',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.neutral700,
    fontSize: 13,
  },
  success: {
    borderColor: colors.success,
    color: colors.success,
  },
  warning: {
    borderColor: colors.warning,
    color: colors.warning,
  },
  danger: {
    borderColor: colors.danger,
    color: colors.danger,
  },
});
