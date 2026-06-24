const {
  PrismaClient,
  UserRole,
  ProjectRole,
  TaskStatus,
  TaskPriority,
} = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@teamsync.dev" },
    update: { passwordHash, name: "Ava Admin", role: UserRole.ADMIN },
    create: {
      email: "admin@teamsync.dev",
      passwordHash,
      name: "Ava Admin",
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@teamsync.dev" },
    update: { passwordHash, name: "Maya Manager", role: UserRole.MANAGER },
    create: {
      email: "manager@teamsync.dev",
      passwordHash,
      name: "Maya Manager",
      role: UserRole.MANAGER,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@teamsync.dev" },
    update: { passwordHash, name: "Sam Member", role: UserRole.MEMBER },
    create: {
      email: "member@teamsync.dev",
      passwordHash,
      name: "Sam Member",
      role: UserRole.MEMBER,
    },
  });

  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: "11111111-1111-4111-8111-111111111111" },
      update: {
        name: "TeamSync Launch",
        description: "Build and launch the TeamSync assessment project.",
        ownerId: manager.id,
      },
      create: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "TeamSync Launch",
        description: "Build and launch the TeamSync assessment project.",
        ownerId: manager.id,
      },
    }),

    prisma.project.upsert({
      where: { id: "11111111-1111-4111-8111-111111111112" },
      update: {
        name: "Mobile App Improvements",
        description:
          "Demonstrates that project roles can differ from global user roles.",
        ownerId: admin.id,
      },
      create: {
        id: "11111111-1111-4111-8111-111111111112",
        name: "Mobile App Improvements",
        description:
          "Demonstrates that project roles can differ from global user roles.",
        ownerId: admin.id,
      },
    }),

    prisma.project.upsert({
      where: { id: "11111111-1111-4111-8111-111111111113" },
      update: {
        name: "API Stability",
        description:
          "Improve backend reliability, validation, and error handling.",
        ownerId: manager.id,
      },
      create: {
        id: "11111111-1111-4111-8111-111111111113",
        name: "API Stability",
        description:
          "Improve backend reliability, validation, and error handling.",
        ownerId: manager.id,
      },
    }),
  ]);

  const [launchProject, mobileProject, apiProject] = projects;

  const projectMemberships = [
    {
      project: launchProject,
      memberships: [
        { userId: admin.id, role: ProjectRole.MEMBER },
        { userId: manager.id, role: ProjectRole.MANAGER },
        { userId: member.id, role: ProjectRole.MEMBER },
      ],
    },
    {
      project: mobileProject,
      memberships: [
        { userId: admin.id, role: ProjectRole.MANAGER },
        { userId: manager.id, role: ProjectRole.MEMBER },
        { userId: member.id, role: ProjectRole.MANAGER },
      ],
    },
    {
      project: apiProject,
      memberships: [
        { userId: admin.id, role: ProjectRole.MEMBER },
        { userId: manager.id, role: ProjectRole.MANAGER },
        { userId: member.id, role: ProjectRole.MEMBER },
      ],
    },
  ];

  for (const { project, memberships } of projectMemberships) {
    for (const membership of memberships) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: project.id,
            userId: membership.userId,
          },
        },
        update: { role: membership.role },
        create: {
          projectId: project.id,
          userId: membership.userId,
          role: membership.role,
        },
      });
    }
  }

  const tasks = [
    {
      id: "22222222-2222-4222-8222-222222222221",
      projectId: launchProject.id,
      title: "Review database schema and security",
      description:
        "Review the core TeamSync entities, relationships, and security decisions.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: admin.id,
      dueDate: new Date("2026-06-24T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      projectId: launchProject.id,
      title: "Build authentication endpoints",
      description: "Add registration, login, refresh tokens, and guards.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: manager.id,
      dueDate: new Date("2026-06-25T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222223",
      projectId: launchProject.id,
      title: "Create the project dashboard",
      description: "Implement the responsive task list and filters.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      assigneeId: member.id,
      dueDate: new Date("2026-06-26T12:00:00.000Z"),
    },

    {
      id: "22222222-2222-4222-8222-222222222224",
      projectId: mobileProject.id,
      title: "Implement the mobile task list",
      description:
        "Lead the project as a project-level manager despite having the global MEMBER role.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: member.id,
      dueDate: new Date("2026-06-27T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222225",
      projectId: mobileProject.id,
      title: "Review mobile security",
      description:
        "Review SecureStore token handling and notification registration.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: admin.id,
      dueDate: new Date("2026-06-28T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222226",
      projectId: mobileProject.id,
      title: "Improve mobile loading states",
      description: "Add empty, loading, and error states for task screens.",
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      assigneeId: member.id,
      dueDate: new Date("2026-06-29T12:00:00.000Z"),
    },

    {
      id: "22222222-2222-4222-8222-222222222227",
      projectId: apiProject.id,
      title: "Add API validation",
      description: "Validate request payloads using DTOs and class-validator.",
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      assigneeId: manager.id,
      dueDate: new Date("2026-06-30T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222228",
      projectId: apiProject.id,
      title: "Audit API error responses",
      description:
        "Confirm validation and business errors use a safe, consistent response shape.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      assigneeId: admin.id,
      dueDate: new Date("2026-07-01T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222229",
      projectId: apiProject.id,
      title: "Write authorization guards",
      description: "Protect project and task routes based on user roles.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: manager.id,
      dueDate: new Date("2026-07-02T12:00:00.000Z"),
    },
    {
      id: "22222222-2222-4222-8222-222222222230",
      projectId: launchProject.id,
      title: "Approve the release walkthrough",
      description:
        "Verify the API, web app, mobile app, and architecture decisions before submission.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: admin.id,
      dueDate: new Date("2026-07-03T12:00:00.000Z"),
    },
  ];

  for (const task of tasks) {
    const { id, ...taskData } = task;
    await prisma.task.upsert({
      where: { id: task.id },
      update: taskData,
      create: { id, ...taskData },
    });
  }

  console.log(
    `Seeded 3 users, ${projects.length} projects, and ${tasks.length} tasks.`,
  );
  console.log("Task assignments: Admin 4, Manager 3, Member 3.");
  console.log("Login password for all users: Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
