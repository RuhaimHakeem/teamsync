'use client';

import type { Project, User } from '../lib/types';

type ProjectSidebarProps = {
  projects: Project[];
  selectedProjectId?: string;
  user: User | null;
  onSelectProject: (projectId: string) => void;
  onLogout: () => void;
};

export function ProjectSidebar({
  projects,
  selectedProjectId,
  user,
  onSelectProject,
  onLogout,
}: ProjectSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-neutral-200 p-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-primary">TeamSync</p>
        <h2 className="mt-2 text-[22px] font-semibold leading-tight text-neutral-900">Projects</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {projects.length === 0 ? (
          <p className="rounded-[8px] bg-neutral-50 p-3 text-[15px] font-normal text-neutral-500">No projects yet.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => {
              const selected = project.id === selectedProjectId;
              return (
                <button
                  className={`w-full rounded-[8px] border px-3 py-3 text-left transition ${
                    selected
                      ? 'border-primary bg-neutral-50 text-neutral-900'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  type="button"
                >
                  <span className="block font-semibold">{project.name}</span>
                  <span className="mt-1 block text-[13px] font-normal text-neutral-500">
                    {project._count?.tasks ?? 0} tasks · {project.members.length} members
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 p-4">
        {user ? (
          <div className="mb-3">
            <p className="text-[15px] font-semibold text-neutral-900">{user.name}</p>
            <p className="text-[13px] font-normal text-neutral-500">{user.role}</p>
          </div>
        ) : null}
        <button
          className="w-full rounded-[6px] border border-neutral-300 px-3 py-2 text-[15px] font-semibold text-neutral-700 hover:bg-neutral-50"
          onClick={onLogout}
          type="button"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
