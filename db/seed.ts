import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const creator = await prisma.creator.upsert({
    where: { username: 'ritika' },
    update: {},
    create: {
      username: 'ritika',
      name: 'Ritika Sharma',
      bio: "Illustrator from Jaipur. I make art that celebrates India's stories and colours.",
      tags: 'Illustration,Jaipur,Hindi & English',
      handle: 'ekcup.in/ritika'
    }
  });

  await prisma.membership.upsert({
    where: { id: creator.id + '_chai' },
    update: {},
    create: {
      id: creator.id + '_chai',
      creatorId: creator.id,
      name: 'Chai Dost',
      priceInPaise: 9900,
      perks: JSON.stringify(['Monthly notes', 'Supporter-only sketches'])
    }
  });

  await prisma.membership.upsert({
    where: { id: creator.id + '_rang' },
    update: {},
    create: {
      id: creator.id + '_rang',
      creatorId: creator.id,
      name: 'Rang Wala',
      priceInPaise: 29900,
      perks: JSON.stringify(['Art drops', 'Priority replies'])
    }
  });

  // sample supports
  for (const s of [
    { name: 'Anita', amount: 2900, cups: 1, message: 'Loved the Jaipur palette!' },
    { name: 'Rohit', amount: 8700, cups: 3, message: '' },
    { name: 'Neha', amount: 14500, cups: 5, message: 'Keep creating!' }
  ]) {
    await prisma.support.create({ data: { creatorId: creator.id, supporterName: s.name, amount: s.amount, cups: s.cups, message: s.message } });
  }

  console.log('Seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });