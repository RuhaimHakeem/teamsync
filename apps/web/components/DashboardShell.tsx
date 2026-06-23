"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  getProjectTasks,
  getProjects,
  logout,
} from "../lib/api";
import { ProjectSidebar } from "./ProjectSidebar";
import { TaskFilters, TaskList } from "./TaskList";

const initialFilters: TaskFilters = {
  status: "",
  priority: "",
  assignee: "",
  page: 1,
};

export function DashboardShell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [filters, setFilters] = useState<TaskFilters>(initialFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  useEffect(() => {
    if (!selectedProjectId && projectsQuery.data?.length) {
      setSelectedProjectId(projectsQuery.data[0].id);
    }
  }, [projectsQuery.data, selectedProjectId]);

  const selectedProject = projectsQuery.data?.find(
    (project) => project.id === selectedProjectId,
  );

  const taskQueryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: "5",
      sortBy: "dueDate",
      sortOrder: "asc",
    });

    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.assignee) params.set("assignee", filters.assignee);

    return params;
  }, [filters]);

  const tasksQuery = useQuery({
    queryKey: ["tasks", selectedProjectId, filters],
    queryFn: () => getProjectTasks(selectedProjectId!, taskQueryParams),
    enabled: Boolean(selectedProjectId),
  });

  async function handleLogout() {
    try {
      await logout();
    } catch {
    } finally {
      queryClient.removeQueries();
      router.push("/login");
    }
  }

  function handleProjectSelect(projectId: string) {
    setSelectedProjectId(projectId);
    setFilters(initialFilters);
    setDrawerOpen(false);
  }

  if (projectsQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center text-[15px] font-normal text-neutral-500">
        Loading dashboard...
      </main>
    );
  }

  if (projectsQuery.isError) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-[8px] border border-danger bg-white p-6 text-danger">
          <p className="text-[15px] font-semibold">Could not load projects</p>
          <p className="mt-1 text-[13px] font-normal">
            {projectsQuery.error.message}
          </p>
        </div>
      </main>
    );
  }

  const sidebar = (
    <ProjectSidebar
      projects={projectsQuery.data ?? []}
      selectedProjectId={selectedProjectId}
      user={userQuery.data ?? null}
      onLogout={() => {
        void handleLogout();
      }}
      onSelectProject={handleProjectSelect}
    />
  );

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-neutral-200 tablet:block">
          {sidebar}
        </aside>

        {drawerOpen ? (
          <div className="fixed inset-0 z-40 tablet:hidden">
            <button
              aria-label="Close project menu"
              className="absolute inset-0 bg-neutral-900/30"
              onClick={() => setDrawerOpen(false)}
              type="button"
            />
            <aside className="relative h-full w-72 max-w-[85vw] border-r border-neutral-200 shadow-xl">
              {sidebar}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 tablet:px-6">
            <button
              className="rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] font-semibold text-neutral-700 tablet:hidden"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              Projects
            </button>
            <div className="hidden tablet:block">
              <p className="text-[13px] font-normal text-neutral-500">
                Dashboard
              </p>
              <p className="text-[15px] font-semibold text-neutral-900">
                Welcome{userQuery.data ? `, ${userQuery.data.name}` : ""}
              </p>
            </div>
            <div className="text-[15px] font-semibold text-primary">
              {userQuery.data?.role}
            </div>
          </header>

          <div className="flex flex-1 p-4 tablet:p-6">
            {projectsQuery.data?.length === 0 ? (
              <section className="w-full rounded-[8px] border border-neutral-200 bg-white p-6 shadow-sm">
                <h1 className="text-[28px] font-bold leading-tight text-neutral-900">
                  No projects found
                </h1>
                <p className="mt-2 text-[15px] font-normal text-neutral-600">
                  Your account is not a member of any project yet. Try the
                  seeded manager/member account.
                </p>
              </section>
            ) : selectedProject ? (
              <TaskList
                error={tasksQuery.error}
                filters={filters}
                isLoading={tasksQuery.isLoading}
                project={selectedProject}
                tasks={tasksQuery.data}
                onFiltersChange={setFilters}
              />
            ) : (
              <section className="w-full rounded-[8px] border border-neutral-200 bg-white p-6 text-[15px] font-normal text-neutral-500 shadow-sm">
                Select a project to view tasks.
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
