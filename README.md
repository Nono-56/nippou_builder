# Nippou Builder

Cloudflare Pages 上で動作する日報補助アプリです。フロントエンドは Astro + React、同期 API は Cloudflare Pages Functions、永続化は D1 を使います。

## できること

- タスクの追加と削除
- 日報用テキストの自動整形
- 共有コードを使った複数端末間同期
- Cloudflare Pages 上での静的配信 + Functions API 同居

## セットアップ

1. 依存関係をインストールします。

```bash
npm install
```

2. `wrangler.toml` の `database_id` を自分の D1 Database ID に置き換えます。

3. ローカル D1 を初期化します。

```bash
npm run db:migrate:local
```

4. フロントエンドだけを確認する場合は以下です。

```bash
npm run dev
```

5. Pages Functions + D1 を含めて確認する場合は以下です。

```bash
npm run cf:dev
```

6. Wrangler で Pages へ直接デプロイする場合は以下です。

```bash
npm run cf:deploy
```

Cloudflare Pages のビルド設定をダッシュボードで使う場合は、`wrangler deploy` ではなく以下にしてください。

- Build command: `npm run build`
- Build output directory: `dist`

## 同期仕様

- 同じ共有コードを入力した端末同士で同じタスクリストを共有します。
- 同期接続後はサーバー側のタスク一覧が正本になります。
- 同期中は 10 秒ごと、およびタブ復帰時に再同期します。
- 共有コードそのものは保存せず、サーバー側ではハッシュ化して扱います。
