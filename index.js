// node.jsの標準ライブラリであるhttpとurlをインポートする
// 'node:' をつけることで、コアモジュールであることを明示しているのじゃ
import http from 'node:http';
import { URL } from 'node:url';

// PORTという環境変数でポート番号が指定されていればそれを使う。なければ8888番を使う
const PORT = process.env.PORT || 8888;

// httpサーバーを作成する
const server = http.createServer((req, res) => {
  // リクエストURLをパースして、パス名やクエリパラメータを取得しやすくする
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;
  console.log(`Request received for: ${pathname}`); // どのパスへのリクエストかログに出す

  // ヘッダーに文字コードをUTF-8に指定する。これで日本語が文字化けしなくなるのじゃ
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  // パス名に応じて処理を分岐する
  if (pathname === '/') {
    console.log("Root path handler is executed."); // ルートパスが実行されたことをログに出す
    res.writeHead(200); // ステータスコード200 (OK) を返す
    res.end('こんにちは！');
  } else if (pathname === '/ask') {
    console.log("Ask path handler is executed."); // /askパスが実行されたことをログに出す
    // 'q'という名前のクエリパラメータを取得する
    const question = requestUrl.searchParams.get('q');
    if (question) {
      res.writeHead(200); // ステータスコード200 (OK) を返す
      res.end(`Your question is '${question}'`);
    } else {
      res.writeHead(400); // ステータスコード400 (Bad Request) を返す
      res.end('Question not provided.');
    }
  } else {
    console.log("404 Not Found handler is executed."); // 404ハンドラが実行されたことをログに出す
    res.writeHead(404); // ステータスコード404 (Not Found) を返す
    res.end('Not Found');
  }
});

// 指定したポートでサーバーを起動する
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});