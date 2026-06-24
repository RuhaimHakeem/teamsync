import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppButton } from "../components/AppButton";
import { StatusBadge } from "../components/StatusBadge";
import { createComment } from "../lib/api";
import { colors, spacing, sharedStyles } from "../theme";
import type { Comment, TaskDetail, User } from "../types";
import { formatDate } from "../utils/date";

type TaskDetailScreenProps = {
  user: User | null;
  taskDetail: TaskDetail | null;
  commentBody: string;
  isAddingComment: boolean;
  onBack: () => void;
  onCommentBodyChange: (body: string) => void;
  onOptimisticComment: (taskDetail: TaskDetail) => void;
  onAddingCommentChange: (isAdding: boolean) => void;
};

export function TaskDetailScreen({
  user,
  taskDetail,
  commentBody,
  isAddingComment,
  onBack,
  onCommentBodyChange,
  onOptimisticComment,
  onAddingCommentChange,
}: TaskDetailScreenProps) {
  async function addComment() {
    const body = commentBody.trim();
    if (!body || !taskDetail || !user) return;

    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      taskId: taskDetail.id,
      authorId: user.id,
      body,
      createdAt: new Date().toISOString(),
      author: { id: user.id, name: user.name, email: user.email },
    };

    const previousDetail = taskDetail;
    onOptimisticComment({
      ...taskDetail,
      comments: [...taskDetail.comments, optimisticComment],
    });
    onCommentBodyChange("");
    onAddingCommentChange(true);

    try {
      const savedComment = await createComment(taskDetail.id, body);
      onOptimisticComment({
        ...previousDetail,
        comments: previousDetail.comments.concat(savedComment),
      });
    } catch (error) {
      onOptimisticComment(previousDetail);
      Alert.alert(
        "Comment not added",
        error instanceof Error ? error.message : "Try again.",
      );
    } finally {
      onAddingCommentChange(false);
    }
  }

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppButton
          label="← Back to tasks"
          onPress={onBack}
          variant="secondary"
        />

        {!taskDetail ? (
          <View style={styles.centeredBlock}>
            <ActivityIndicator />
            <Text style={sharedStyles.caption}>Loading task...</Text>
          </View>
        ) : (
          <View style={sharedStyles.card}>
            <Text style={sharedStyles.h1}>{taskDetail.title}</Text>
            <Text style={sharedStyles.bodyText}>
              {taskDetail.description || "No description added."}
            </Text>
            <View style={sharedStyles.metaRow}>
              <StatusBadge
                label={taskDetail.status}
                status={taskDetail.status}
              />
              <StatusBadge label={taskDetail.priority} />
            </View>
            <Text style={sharedStyles.caption}>
              Due: {formatDate(taskDetail.dueDate)}
            </Text>

            <Text style={sharedStyles.h2}>Comments</Text>
            {taskDetail.comments.length === 0 ? (
              <Text style={sharedStyles.caption}>No comments yet.</Text>
            ) : (
              taskDetail.comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <Text style={styles.commentAuthor}>
                    {comment.author.name}
                  </Text>
                  <Text style={sharedStyles.bodyText}>{comment.body}</Text>
                </View>
              ))
            )}

            <TextInput
              multiline
              onChangeText={onCommentBodyChange}
              placeholder="Add a comment..."
              style={[sharedStyles.input, styles.commentInput]}
              value={commentBody}
            />
            <AppButton
              disabled={isAddingComment || !commentBody.trim()}
              label={isAddingComment ? "Adding..." : "Add comment"}
              onPress={addComment}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  centeredBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  commentInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  comment: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.md,
    gap: spacing.xs,
  },
  commentAuthor: {
    color: colors.neutral900,
    fontSize: 13,
    fontWeight: "700",
  },
});
