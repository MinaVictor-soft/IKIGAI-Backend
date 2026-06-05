import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create levels
  const levels = [
    { name: 'Newcomer', displayOrder: 1, minXp: 0, maxXp: 99, color: '#9CA3AF' },
    { name: 'Seeker', displayOrder: 2, minXp: 100, maxXp: 299, color: '#06B6D4' },
    { name: 'Explorer', displayOrder: 3, minXp: 300, maxXp: 599, color: '#7C3AED' },
    { name: 'Champion', displayOrder: 4, minXp: 600, maxXp: 999, color: '#F59E0B' },
    { name: 'Legend', displayOrder: 5, minXp: 1000, maxXp: null, color: '#EF4444' },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { name: level.name },
      update: level,
      create: level,
    });
  }
  console.log('  ✓ Levels created');

  // Common password for all seeded users: Ikigai@2026
  const passwordHash = await bcrypt.hash('Ikigai@2026', 12);

  // ============ SUPER ADMIN ============
  await prisma.user.upsert({
    where: { email: 'admin@ikigai.quest' } as any,
    update: {},
    create: {
      email: 'admin@ikigai.quest',
      passwordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('  ✓ Super Admin created (admin@ikigai.quest)');

  // ============ 4 ADMINS ============
  const admins = [
    { email: 'admin1@ikigai.quest', name: 'Admin One' },
    { email: 'admin2@ikigai.quest', name: 'Admin Two' },
    { email: 'admin3@ikigai.quest', name: 'Admin Three' },
    { email: 'admin4@ikigai.quest', name: 'Admin Four' },
  ];
  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email } as any,
      update: {},
      create: { ...admin, passwordHash, role: 'ADMIN' },
    });
  }
  console.log('  ✓ 4 Admins created');

  // ============ 20 STAFF ============
  const staffNames = [
    'Sarah Miller', 'David Wilson', 'Emily Davis', 'Michael Brown',
    'Jessica Taylor', 'Daniel Anderson', 'Ashley Thomas', 'Matthew Jackson',
    'Amanda White', 'Christopher Harris', 'Jennifer Martin', 'Joshua Thompson',
    'Stephanie Garcia', 'Andrew Martinez', 'Nicole Robinson', 'Ryan Clark',
    'Megan Lewis', 'Justin Walker', 'Rachel Hall', 'Brandon Allen',
  ];
  for (let i = 0; i < staffNames.length; i++) {
    await prisma.user.upsert({
      where: { email: `staff${i + 1}@ikigai.quest` } as any,
      update: {},
      create: {
        email: `staff${i + 1}@ikigai.quest`,
        passwordHash,
        name: staffNames[i],
        role: 'STAFF',
      },
    });
  }
  console.log('  ✓ 20 Staff created');

  // ============ 20 ATTENDEES ============
  const attendeeNames = [
    'Mark Aziz', 'Mina George', 'Marina Samir', 'Peter Fady',
    'Monica Hany', 'John Emad', 'Mary Magdy', 'Joseph Nabil',
    'Christine Ashraf', 'Andrew Maged', 'Irene Sherif', 'Samuel Wael',
    'Veronica Ramy', 'George Karim', 'Angela Tamer', 'David Bassem',
    'Sarah Khaled', 'Philip Youssef', 'Nadia Ayman', 'Thomas Mounir',
  ];
  for (let i = 0; i < attendeeNames.length; i++) {
    await prisma.user.upsert({
      where: { email: `attendee${i + 1}@ikigai.quest` } as any,
      update: {},
      create: {
        email: `attendee${i + 1}@ikigai.quest`,
        passwordHash,
        name: attendeeNames[i],
        role: 'ATTENDEE',
        church: ['St. Mark', 'St. George', 'St. Mary', 'St. Mina'][i % 4],
        diocese: ['Cairo', 'Alexandria', 'Giza', 'Assiut'][i % 4],
      },
    });
  }
  console.log('  ✓ 20 Attendees created');

  // ============ TRIBES ============
  const tribes = [
    { name: 'Vision', color: '#7C3AED', description: 'Team Vision' },
    { name: 'Impact', color: '#06B6D4', description: 'Team Impact' },
    { name: 'Unity', color: '#F59E0B', description: 'Team Unity' },
    { name: 'Grace', color: '#10B981', description: 'Team Grace' },
  ];

  const createdTribes = [];
  for (const tribe of tribes) {
    const t = await prisma.tribe.upsert({
      where: { name: tribe.name },
      update: tribe,
      create: tribe,
    });
    createdTribes.push(t);
  }
  console.log('  ✓ Tribes created');

  // Assign attendees to tribes (5 per tribe)
  const attendees = await prisma.user.findMany({
    where: { role: 'ATTENDEE', deletedAt: null },
    orderBy: { email: 'asc' },
  });
  for (let i = 0; i < attendees.length; i++) {
    const tribe = createdTribes[i % 4];
    await prisma.user.update({
      where: { id: attendees[i].id },
      data: { tribeId: tribe.id },
    });
    await prisma.tribe.update({
      where: { id: tribe.id },
      data: { memberCount: { increment: 1 } },
    });
  }
  console.log('  ✓ Attendees assigned to tribes (5 per tribe)');

  // ============ SYSTEM CONFIG ============
  const configs = [
    { key: 'xp.attendance', value: 15, description: 'XP for on-time attendance', category: 'XP_RULES' },
    { key: 'xp.attendance_late', value: 8, description: 'XP for late attendance', category: 'XP_RULES' },
    { key: 'xp.quiz_passed', value: 20, description: 'XP for passing a quiz', category: 'XP_RULES' },
    { key: 'xp.sports_win', value: 20, description: 'XP for winning a match', category: 'XP_RULES' },
    { key: 'xp.sports_draw', value: 10, description: 'XP for drawing a match', category: 'XP_RULES' },
    { key: 'xp.sports_loss', value: 5, description: 'XP for losing a match', category: 'XP_RULES' },
    { key: 'qr.rotation_minutes', value: 5, description: 'QR token rotation interval (minutes)', category: 'ATTENDANCE' },
    { key: 'admin.daily_xp_cap', value: 500, description: 'Max XP an ADMIN can award per day', category: 'LIMITS' },
    { key: 'admin.per_award_cap', value: 100, description: 'Max XP per single ADMIN award', category: 'LIMITS' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description },
      create: { key: config.key, value: config.value, description: config.description, category: config.category },
    });
  }
  console.log('  ✓ System config seeded');

  // ============ PUBLICATION CATEGORIES ============
  const pubCategories = [
    { name: 'MAGAZINE', labelEn: 'Magazine', labelAr: 'مجلة', color: '#6366F1', order: 1 },
    { name: 'PRAYER', labelEn: 'Prayer', labelAr: 'صلاة', color: '#EC4899', order: 2 },
    { name: 'KHELWA', labelEn: 'Khelwa', labelAr: 'خلوة', color: '#10B981', order: 3 },
    { name: 'ARTICLE', labelEn: 'Article', labelAr: 'مقال', color: '#F59E0B', order: 4 },
    { name: 'OTHER', labelEn: 'Other', labelAr: 'أخرى', color: '#8B5CF6', order: 5 },
  ];
  for (const cat of pubCategories) {
    await prisma.publicationCategory.upsert({
      where: { name: cat.name },
      update: { labelEn: cat.labelEn, labelAr: cat.labelAr, color: cat.color, order: cat.order },
      create: cat,
    });
  }
  console.log('  ✓ Publication categories seeded');

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Login credentials (all passwords: Ikigai@2026):');
  console.log('   Super Admin : admin@ikigai.quest');
  console.log('   Admins      : admin1@ikigai.quest ... admin4@ikigai.quest');
  console.log('   Staff       : staff1@ikigai.quest ... staff20@ikigai.quest');
  console.log('   Attendees   : attendee1@ikigai.quest ... attendee20@ikigai.quest');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
