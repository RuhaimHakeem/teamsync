import { Pressable, Text, View } from 'react-native';
import { sharedStyles } from '../theme';
import type { Task } from '../types';
import { formatDate } from '../utils/date';
import { StatusBadge } from './StatusBadge';

type TaskCardProps = {
  task: Task;
  onPress: () => void;
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <Pressable onPress={onPress} style={sharedStyles.card}>
      <Text style={sharedStyles.h2}>{task.title}</Text>
      <Text style={sharedStyles.caption}>{task.project?.name ?? 'Project'}</Text>
      <View style={sharedStyles.metaRow}>
        <StatusBadge label={task.status} status={task.status} />
        <StatusBadge label={task.priority} />
        <Text style={sharedStyles.caption}>{formatDate(task.dueDate)}</Text>
      </View>
    </Pressable>
  );
}
