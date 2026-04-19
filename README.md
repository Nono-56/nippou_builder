# Nippou Builder

日報補助アプリです。現在のローカル運用構成は、フロントエンドを Nginx、API を FastAPI、永続化を SQLite、公開を Cloudflare Tunnel で行います。

## できること

- タスクの追加と削除
- 日報用テキストの自動整形
- 共有コードを使った複数端末間同期
- Docker 上の Nginx + FastAPI 構成
- Cloudflare Tunnel 経由での外部公開

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. Docker でローカル起動する場合は以下です。

```bash
docker compose up --build -d
```

3. アプリは `http://localhost:8080` で確認できます。

SQLite の実ファイルはローカルの `./data/nippou.db` に保存されます。コンテナを作り直しても、このファイルは手元に残ります。

4. フロントエンドだけを確認する場合は以下です。

```bash
npm run dev
```

5. Cloudflare Pages + D1 の開発系コマンドも残していますが、現在の正本 DB は Docker の SQLite です。

6. Wrangler で Pages へ直接デプロイする場合は以下です。

```bash
npm run cf:deploy
```

Cloudflare Pages のビルド設定をダッシュボードで使う場合は、`wrangler deploy` ではなく以下にしてください。

- Build command: `npm run build`
- Build output directory: `dist`

補足:

- ホストの `80` 番ポートが他プロセスに使われている環境では、`.env` の `APP_PORT` で公開ポートを変えられます。既定値は `8080` です。

## Cloudflare Tunnel で公開する

`cloudflared` はホスト実行ではなく Docker イメージで動かします。トンネル先は Compose ネットワーク内の `nginx:80` です。認証は `.env` の token で行います。

1. Cloudflare Zero Trust / Tunnel で対象トンネルの token を発行します。

```bash
CLOUDFLARE_TUNNEL_TOKEN=...
```

2. ルートに `.env` を作ります。

```bash
copy .env.example .env
```

3. `.env` の `CLOUDFLARE_TUNNEL_TOKEN` を実値に置き換えます。

4. 全体を起動します。

```bash
docker compose up --build -d
```

5. 公開 URL へアクセスします。

補足:

- `docker compose` はルートの `.env` を自動で読み、`cloudflared` コンテナに token を渡します。
- origin の向き先は `nginx:80` です。公開 hostname やルーティングは Cloudflare 側の tunnel 設定で管理します。
- SQLite は `./data/nippou.db` に残るので、コンテナを消しても DB ファイルは保持されます。
- `.env` は機密情報なので Git には含めません。

## 同期仕様

- 同じ共有コードを入力した端末同士で同じタスクリストを共有します。
- 同期接続後はサーバー側のタスク一覧が正本になります。
- 同期中は 10 秒ごと、およびタブ復帰時に再同期します。
- 共有コードそのものは保存せず、サーバー側ではハッシュ化して扱います。
