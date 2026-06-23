"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { addComment, getTask } from "../lib/api";

const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(2000, "Comment is too long"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function TaskDetail({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const taskQuery = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
  });

  const commentMutation = useMutation({
    mutationFn: (values: CommentFormValues) => addComment(taskId, values.body),
    onSuccess: async () => {
      reset();
      await queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 tablet:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          className="text-[15px] font-semibold text-primary hover:text-primary-dark"
          href="/dashboard"
        >
          ← Back to dashboard
        </Link>

        {taskQuery.isLoading ? (
          <div className="mt-4 rounded-[8px] border border-neutral-200 bg-white p-6 text-[15px] font-normal text-neutral-500 shadow-sm">
            Loading task...
          </div>
        ) : taskQuery.isError ? (
          <div className="mt-4 rounded-[8px] border border-danger bg-white p-6 text-danger shadow-sm">
            <p className="text-[15px] font-semibold">Could not load task</p>
            <p className="mt-1 text-[13px] font-normal">{taskQuery.error.message}</p>
          </div>
        ) : taskQuery.data ? (
          <div className="mt-4 space-y-4">
            <section className="rounded-[8px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
                <div>
                  <p className="text-[13px] font-normal text-neutral-500">
                    Task detail
                  </p>
                  <h1 className="mt-1 text-[28px] font-bold leading-tight text-neutral-900">
                    {taskQuery.data.title}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-[6px] border border-primary bg-white px-2 py-1 text-[13px] font-normal text-primary">
                    {taskQuery.data.status.replace("_", " ")}
                  </span>
                  <span className="rounded-[6px] border border-neutral-300 bg-white px-2 py-1 text-[13px] font-normal text-neutral-700">
                    {taskQuery.data.priority}
                  </span>
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line text-[15px] font-normal leading-6 text-neutral-700">
                {taskQuery.data.description || "No description added."}
              </p>

              <dl className="mt-6 grid gap-3 rounded-[8px] bg-neutral-50 p-4 text-[15px] font-normal tablet:grid-cols-2">
                <div>
                  <dt className="text-[13px] font-normal text-neutral-500">Assignee</dt>
                  <dd className="mt-1 text-neutral-900">
                    {taskQuery.data.assignee.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] font-normal text-neutral-500">Due date</dt>
                  <dd className="mt-1 text-neutral-900">
                    {formatDate(taskQuery.data.dueDate)}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-[8px] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-[22px] font-semibold leading-tight text-neutral-900">Comments</h2>

              <form
                className="mt-4 space-y-3"
                onSubmit={handleSubmit((values) =>
                  commentMutation.mutate(values),
                )}
              >
                <label className="block">
                  <span className="sr-only">Add comment</span>
                  <textarea
                    className="min-h-28 w-full rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Add a comment..."
                    {...register("body")}
                  />
                </label>
                {errors.body ? (
                  <p className="text-[13px] font-normal text-danger">{errors.body.message}</p>
                ) : null}
                {commentMutation.isError ? (
                  <p className="rounded-[8px] border border-danger bg-white px-3 py-2 text-[13px] font-normal text-danger">
                    {commentMutation.error.message}
                  </p>
                ) : null}
                <button
                  className="rounded-[6px] bg-primary px-4 py-2 text-[15px] font-semibold text-white hover:bg-primary-dark"
                  disabled={commentMutation.isPending}
                  type="submit"
                >
                  {commentMutation.isPending ? "Adding..." : "Add comment"}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                {taskQuery.data.comments.length === 0 ? (
                  <p className="rounded-[8px] bg-neutral-50 p-4 text-[15px] font-normal text-neutral-500">
                    No comments yet.
                  </p>
                ) : (
                  taskQuery.data.comments.map((comment) => (
                    <article
                      className="rounded-[8px] border border-neutral-200 p-4"
                      key={comment.id}
                    >
                      <div className="flex flex-col gap-1 tablet:flex-row tablet:items-center tablet:justify-between">
                        <p className="text-[15px] font-semibold text-neutral-900">
                          {comment.author.name}
                        </p>
                        <time className="text-[13px] font-normal text-neutral-500">
                          {formatDate(comment.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-[15px] font-normal leading-6 text-neutral-700">
                        {comment.body}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
