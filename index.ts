// 生成した Prisma Client をインポートする。場所が重要じゃぞ。
import { PrismaClient } from "./generated/prisma/client";
const prisma = new PrismaClient({
  // 実行されたクエリをログに表示するための設定じゃ
  log: ['query'],
});

async function main() {
  console.log("Prisma Client を初期化しました。");

  // まずは今のユーザー一覧を取得してみる
  const usersBefore = await prisma.user.findMany();
  console.log("Before ユーザー一覧:", usersBefore);

  // 新しいユーザーを追加する
  const newUser = await prisma.user.create({
    data: {
      name: `新しいユーザー ${new Date().toISOString()}`,
    },
  });
  console.log("新しいユーザーを追加しました:", newUser);

  // 追加後にもう一度ユーザー一覧を取得する
  const usersAfter = await prisma.user.findMany();
  console.log("After ユーザー一覧:", usersAfter);
}

// main 関数を実行する
main()
  .catch(e => {
    // もしエラーが起きたら、内容を表示する
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // 終わったら、データベースとの接続を切る。これは大事な作法じゃ。
    await prisma.$disconnect();
    console.log("Prisma Client を切断しました。");
  });