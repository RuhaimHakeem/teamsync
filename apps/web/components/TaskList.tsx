"use client";

import Link from "next/link";
import type {
  PaginatedTasks,
  Project,
  TaskPriority,
  TaskStatus,
} from "../lib/types";

export type TaskFilters = {
  status: "" | TaskStatus;
  priority: "" | TaskPriority;
  assignee: string;
  page: number;
};

type TaskListProps = {
  project: Project;
  filters: TaskFilters;
  tasks?: PaginatedTasks;
  isLoading: boolean;
  error?: Error | null;
  onFiltersChange: (filters: TaskFilters) => void;
};

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function badgeClass(value: string) {
  if (value === "HIGH" || value === "TODO") return "border-danger text-danger";
  if (value === "MEDIUM" || value === "IN_PROGRESS")
    return "border-warning text-warning";
  return "border-success text-success";
}

export function TaskList({
  project,
  filters,
  tasks,
  isLoading,
  error,
  onFiltersChange,
}: TaskListProps) {
  function updateFilter(next: Partial<TaskFilters>) {
    onFiltersChange({ ...filters, ...next, page: next.page ?? 1 });
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <div className="rounded-[8px] border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
          <div>
            <p className="text-[13px] font-normal text-neutral-500">
              Current project
            </p>
            <h1 className="text-[28px] font-bold leading-tight text-neutral-900">
              {project.name}
            </h1>
            {project.description ? (
              <p className="mt-1 text-[15px] font-normal text-neutral-600">
                {project.description}
              </p>
            ) : null}
          </div>
          <div className="text-[15px] font-normal text-neutral-500">
            {tasks?.meta.total ?? 0} matching tasks
          </div>
        </div>

        <div className="mt-4 grid gap-3 tablet:grid-cols-3">
          <label className="block">
            <span className="text-[13px] font-normal uppercase tracking-wide text-neutral-500">
              Status
            </span>
            <select
              className="mt-1 w-full rounded-[6px] border border-neutral-300 bg-white px-3 py-2 text-[15px]"
              value={filters.status}
              onChange={(event) =>
                updateFilter({
                  status: event.target.value as TaskFilters["status"],
                })
              }
            >
              <option value="">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[13px] font-normal uppercase tracking-wide text-neutral-500">
              Priority
            </span>
            <select
              className="mt-1 w-full rounded-[6px] border border-neutral-300 bg-white px-3 py-2 text-[15px]"
              value={filters.priority}
              onChange={(event) =>
                updateFilter({
                  priority: event.target.value as TaskFilters["priority"],
                })
              }
            >
              <option value="">All priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[13px] font-normal uppercase tracking-wide text-neutral-500">
              Assignee
            </span>
            <select
              className="mt-1 w-full rounded-[6px] border border-neutral-300 bg-white px-3 py-2 text-[15px]"
              value={filters.assignee}
              onChange={(event) =>
                updateFilter({ assignee: event.target.value })
              }
            >
              <option value="">Everyone</option>
              {project.members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-[8px] border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-[15px] font-normal text-neutral-500">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="p-6">
            <p className="text-[15px] font-semibold text-danger">
              Could not load tasks
            </p>
            <p className="mt-1 text-[13px] font-normal text-danger">
              {error.message}
            </p>
          </div>
        ) : !tasks || tasks.data.length === 0 ? (
          <div className="p-6 text-[15px] font-normal text-neutral-500">
            No tasks match these filters.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {tasks.data.map((task) => (
              <Link
                className="block p-4 transition hover:bg-neutral-50"
                href={`/tasks/${task.id}`}
                key={task.id}
              >
                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:justify-between">
                  <div>
                    <h2 className="text-[22px] font-semibold leading-tight text-neutral-900">
                      {task.title}
                    </h2>
                    <p className="mt-1 text-[15px] font-normal text-neutral-500">
                      Assigned to {task.assignee.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-[6px] border bg-white px-2 py-1 text-[13px] font-normal ${badgeClass(task.status)}`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <span
                      className={`rounded-[6px] border bg-white px-2 py-1 text-[13px] font-normal ${badgeClass(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[13px] font-normal text-neutral-500">
                  {formatDate(task.dueDate)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          className="rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] font-semibold text-neutral-700"
          disabled={!tasks || filters.page <= 1}
          onClick={() => updateFilter({ page: filters.page - 1 })}
          type="button"
        >
          Previous
        </button>
        <span className="text-[15px] font-normal text-neutral-500">
          Page {tasks?.meta.page ?? filters.page} of{" "}
          {tasks?.meta.totalPages || 1}
        </span>
        <button
          className="rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] font-semibold text-neutral-700"
          disabled={!tasks || filters.page >= tasks.meta.totalPages}
          onClick={() => updateFilter({ page: filters.page + 1 })}
          type="button"
        >
          Next
        </button>
      </div>
    </section>
  );
}
