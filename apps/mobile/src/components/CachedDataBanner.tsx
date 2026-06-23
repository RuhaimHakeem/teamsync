import { StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export function CachedDataBanner() {
  return <Text style={styles.banner}>Showing cached data</Text>;
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: colors.white,
    padding: spacing.md,
    color: colors.warning,
    fontSize: 13,
  },
});
