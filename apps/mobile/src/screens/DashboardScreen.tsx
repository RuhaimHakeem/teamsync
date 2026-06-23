import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CachedDataBanner } from '../components/CachedDataBanner';
import { ScreenHeader } from '../components/ScreenHeader';
import { TaskCard } from '../components/TaskCard';
import { spacing, sharedStyles } from '../theme';
import type { Task, User } from '../types';

type DashboardScreenProps = {
  user: User | null;
  tasks: Task[];
  isLoading: boolean;
  isRefreshing: boolean;
  isShowingCachedData: boolean;
  error: string;
  onRefresh: () => void;
  onOpenTask: (taskId: string) => void;
  onLogout: () => void;
};

export function DashboardScreen({
  user,
  tasks,
  isLoading,
  isRefreshing,
  isShowingCachedData,
  error,
  onRefresh,
  onOpenTask,
  onLogout,
}: DashboardScreenProps) {
  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <ScreenHeader
        actionLabel="Logout"
        onActionPress={onLogout}
        subtitle={user ? `Signed in as ${user.name}` : undefined}
        title="My tasks"
      />

      {isShowingCachedData ? <CachedDataBanner /> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {isLoading ? (
        <View style={styles.centeredBlock}>
          <ActivityIndicator />
          <Text style={sharedStyles.caption}>Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={tasks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={sharedStyles.caption}>No assigned tasks found.</Text>}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={() => onOpenTask(item.id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  centeredBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  errorText: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...sharedStyles.errorText,
  },
});
