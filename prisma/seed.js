const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  // 既存のデータをすべて削除
  await prisma.stockPrice.deleteMany();

  const data = [];
  let currentDate = new Date('2024-01-01');
  let currentPrice = 150.0;

  // 200日分のサンプルデータを生成
  for (let i = 0; i < 200; i++) {
    data.push({
      tickerSymbol: 'TECH',
      date: new Date(currentDate),
      price: parseFloat(currentPrice.toFixed(2)),
    });
    // 日付を1日進める
    currentDate.setDate(currentDate.getDate() + 1);
    // 価格をランダムに変動させる
    currentPrice += (Math.random() - 0.48) * 5; 
    if (currentPrice < 50) currentPrice = 50; // 最低価格
  }

  await prisma.stockPrice.createMany({ data });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });