import express from 'express';
// 生成した Prisma Client をインポートする
import { PrismaClient } from './generated/prisma/client';

const prisma = new PrismaClient({
  // クエリが実行されたときに実際に実行したクエリをログに表示する設定
  log: ['query'],
});

const app = express();

// 環境変数が設定されていれば、そこからポート番号を取得する。なければ 8888 を使う
const PORT = process.env.PORT || 8888;

// EJS を「ビューエンジン（view engine）」として設定する。これでHTMLをよしなに作ってくれる
app.set('view engine', 'ejs');
// EJSのテンプレートファイルが置いてある場所（viewsフォルダ）を指定する
app.set('views', './views');

// フォームから送信されたデータを受け取れるようにするための設定
app.use(express.urlencoded({ extended: true }));

// ルートパス（'/'）にアクセスがあったときの処理
app.get('/', async (req, res) => {
  // データベースから全てのユーザーを取得する
  const users = await prisma.user.findMany();
  // 'index.ejs' ファイルを使ってHTMLを生成し、ユーザー一覧データを渡す
  res.render('index', { users });
});

// '/users' にPOSTリクエストがあったときの処理（ユーザー追加フォームからの送信）
app.post('/users', async (req, res) => {
  const name = req.body.name; // フォームから送信された名前を取得
  if (name) {
    // データベースに新しいユーザーを作成する
    const newUser = await prisma.user.create({
      data: { name },
    });
    console.log('新しいユーザーを追加しました:', newUser);
  }
  // ユーザー追加後、ルートパスにリダイレクトして一覧を再表示する
  res.redirect('/');
});

// サーバーを起動する
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});