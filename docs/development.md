# 開発ガイド

## セットアップ

```bash
npm install
copy .env.example .env
```

## ローカル開発

フロントエンドだけを確認する場合:

```bash
npm run dev
```

Docker で API と Nginx も含めて確認する場合:

```bash
docker compose up --build
```

既定の確認先は `http://localhost:8001` です。

## スクリプト一覧

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | Astro 開発サーバー起動 |
| `npm run dev:5001` | Astro 開発サーバーを 127.0.0.1:5001 で起動 |
| `npm run build` | 本番用静的ビルド |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm test` | 現状は自動テスト未設定メッセージを表示 |

## デプロイ

Dokploy でこのリポジトリを Docker Compose アプリとしてデプロイします。

- `.env` の `APP_PORT` は既定で `8001`
- ラズパイ側 Cloudflare Tunnel は `http://localhost:8001` に向ける
- Cloudflare Tunnel の token や hostname はリポジトリでは管理しない

## DB

SQLite は Docker named volume の `nippou_data` に保存します。FastAPI 起動時に必要なテーブルとインデックスを作成します。
