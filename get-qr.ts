import prisma from './src/config/database';
prisma.conferenceSession.findMany({ where: { status: 'ACTIVE' }, select: { id: true, title: true, qrToken: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); prisma.$disconnect(); });
