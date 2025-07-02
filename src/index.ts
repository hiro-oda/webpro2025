import express, { Request, Response } from 'express';
import path from 'path';
// 生成した Prisma Client をインポートする
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

const app = express();
const PORT = process.env.PORT || 8888;

// JSONリクエストボディをパースするためのミドルウェア
app.use(express.json());
// 静的ファイル（HTML, CSS, JS）を配信するためのミドルウェア
// プロジェクトルートにある 'public' フォルダを指定
app.use(express.static(path.join(__dirname, '..', 'public')));

// クイズのセッション情報（正解データ）をサーバー側で保持する
// 本番環境ではRedisやDBなど、より堅牢な方法を検討します
let quizSession: { answer?: { price: number } } = {};

/**
 * API: ランダムな株価データを取得してクイズとして出題
 */
app.get('/api/stock-price/random', async (req: Request, res: Response) => {
  try {
    const totalCount = await prisma.stockPrice.count();
    const dataPoints = 6; // 5日間表示 + 1日正解

    if (totalCount < dataPoints) {
      return res.status(404).json({ message: "クイズを作成するのに十分なデータがありません。" });
    }

    const skip = Math.max(0, Math.floor(Math.random() * (totalCount - dataPoints)));
    
    const data = await prisma.stockPrice.findMany({
      take: dataPoints,
      skip: skip,
      orderBy: { date: 'asc' },
    });

    const quizData = data.slice(0, dataPoints - 1); // ユーザーに見せるデータ
    const answerData = data[dataPoints - 1];      // 正解データ

    // セッションに正解データを保存
    quizSession.answer = { price: answerData.price };

    res.json(quizData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

/**
 * API: ユーザーの予測を受け取り、正解と比較して結果を返す
 */
app.post('/api/predict', (req: Request, res: Response) => {
  const predictedValue: number = req.body.predictedValue;
  const actualValue = quizSession.answer?.price;

  if (typeof predictedValue !== 'number') {
    return res.status(400).json({ message: '予測値が不正です。' });
  }

  if (actualValue === undefined) {
    return res.status(400).json({ message: "有効なクイズセッションがありません。ページを再読み込みしてください。" });
  }

  const error = predictedValue - actualValue;
  res.json({
    actualValue: actualValue,
    error: error,
    message: Math.abs(error) < actualValue * 0.02 ? '素晴らしい！' : '惜しい！',
  });
});

// サーバーを起動する
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// import express from 'express';
// // 生成した Prisma Client をインポートする
// import { PrismaClient } from './generated/prisma/client';

// const prisma = new PrismaClient({
//   // クエリが実行されたときに実際に実行したクエリをログに表示する設定
//   log: ['query'],
// });

// const app = express();

// // 環境変数が設定されていれば、そこからポート番号を取得する。なければ 8888 を使う
// const PORT = process.env.PORT || 8888;

// // EJS を「ビューエンジン（view engine）」として設定する。これでHTMLをよしなに作ってくれる
// app.set('view engine', 'ejs');
// // EJSのテンプレートファイルが置いてある場所（viewsフォルダ）を指定する
// app.set('views', './views');

// // フォームから送信されたデータを受け取れるようにするための設定
// app.use(express.urlencoded({ extended: true }));

// // ルートパス（'/'）にアクセスがあったときの処理
// app.get('/', async (req, res) => {
//   // データベースから全てのユーザーを取得する
//   const users = await prisma.user.findMany();
//   // 'index.ejs' ファイルを使ってHTMLを生成し、ユーザー一覧データを渡す
//   res.render('index', { users });
// });

// // '/users' にPOSTリクエストがあったときの処理（ユーザー追加フォームからの送信）
// app.post('/users', async (req, res) => {
//   const name = req.body.name; // フォームから送信された名前を取得
//   if (name) {
//     // データベースに新しいユーザーを作成する
//     const newUser = await prisma.user.create({
//       data: { name },
//     });
//     console.log('新しいユーザーを追加しました:', newUser);
//   }
//   // ユーザー追加後、ルートパスにリダイレクトして一覧を再表示する
//   res.redirect('/');
// });

// // サーバーを起動する
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });