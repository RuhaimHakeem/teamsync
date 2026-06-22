const { PrismaClient, UserRole, ProjectRole, TaskStatus, TaskPriority } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('Password123!', 10);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@teamsync.dev' },
    update: { passwordHash, name: 'Maya Manager', role: UserRole.MANAGER },
    create: {
      email: 'manager@teamsync.dev',
      passwordHash,
      name: 'Maya Manager',
      role: UserRole.MANAGER,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@teamsync.dev' },
    update: { passwordHash, name: 'Sam Member', role: UserRole.MEMBER },
    create: {
      email: 'member@teamsync.dev',
      passwordHash,
      name: 'Sam Member',
      role: UserRole.MEMBER,
    },
  });

  const project = await prisma.project.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'TeamSync Launch',
      description: 'Build and launch the TeamSync assessment project.',
      ownerId: manager.id,
      members: {
        create: [
          { userId: manager.id, role: ProjectRole.MANAGER },
          { userId: member.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  const tasks = [
    {
      id: '22222222-2222-4222-8222-222222222221',
      title: 'Design the database schema',
      description: 'Define the core TeamSync entities and relationships.',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      assigneeId: manager.id,
      dueDate: new Date('2026-06-24T12:00:00.000Z'),
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      title: 'Build authentication endpoints',
      description: 'Add registration, login, refresh tokens, and guards.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      assigneeId: manager.id,
      dueDate: new Date('2026-06-25T12:00:00.000Z'),
    },
    {
      id: '22222222-2222-4222-8222-222222222223',
      title: 'Create the project dashboard',
      description: 'Implement the responsive task list and filters.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      assigneeId: member.id,
      dueDate: new Date('2026-06-26T12:00:00.000Z'),
    },
    {
      id: '22222222-2222-4222-8222-222222222224',
      title: 'Implement the mobile task list',
      description: 'Show assigned tasks with pull-to-refresh and caching.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: member.id,
      dueDate: new Date('2026-06-27T12:00:00.000Z'),
    },
    {
      id: '22222222-2222-4222-8222-222222222225',
      title: 'Record the walkthrough',
      description: 'Demonstrate the API, web app, mobile app, and decisions.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      assigneeId: manager.id,
      dueDate: new Date('2026-06-28T12:00:00.000Z'),
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: { ...task, projectId: project.id },
    });
  }

  console.log('Seeded 2 users, 1 project, and 5 tasks.');
  console.log('Login password for both users: Password123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
