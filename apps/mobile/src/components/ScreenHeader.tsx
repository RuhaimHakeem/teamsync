import { StyleSheet, Text, View } from 'react-native';
import { spacing, sharedStyles } from '../theme';
import { AppButton } from './AppButton';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ScreenHeader({ title, subtitle, actionLabel, onActionPress }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleWrap}>
        <Text style={sharedStyles.eyebrow}>TEAMSYNC</Text>
        <Text style={sharedStyles.h1}>{title}</Text>
        {subtitle ? <Text style={sharedStyles.caption}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <AppButton label={actionLabel} onPress={onActionPress} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
});
