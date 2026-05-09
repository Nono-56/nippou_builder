# Nippou Builder

日報作成を支援する Web アプリです。現在の本番構成は Dokploy 上の Docker で、フロントエンドを Nginx、API を FastAPI、永続化を SQLite で動かします。

## できること

- ユーザー別ワークスペースでのタスク追加・削除・一覧表示
- 日報用テキストの自動整形
- 月曜 6:00 から翌月曜 5:59 までの週合計時間表示
- `コンゴー｜作業内容` や `dc25|作業内容` のような内容から、`|` / `｜` より前の分類別に週合計を集計
- 管理パネルでのユーザー作成・削除
- Docker 上の Nginx + FastAPI + SQLite 構成

## セットアップ

```bash
npm install
copy .env.example .env
docker compose up --build -d
```

既定では `http://localhost:8001` で確認できます。ラズパイ側 Cloudflare Tunnel は、この `http://localhost:8001` をドメインに紐づける前提です。

公開ポートを変える場合は `.env` の `APP_PORT` を変更してください。

```env
APP_PORT=8001
```

SQLite は Docker named volume の `nippou_data` に保存されます。コンテナを作り直しても、この volume を削除しない限り DB は保持されます。

## 開発

フロントエンドだけを確認する場合:

```bash
npm run dev
```

本番ビルド確認:

```bash
npm run build
```

Docker で全体を確認:

```bash
docker compose up --build
```

## 主要 URL

- `/` - owner ワークスペース
- `/pc` - owner ワークスペースの PC 版
- `/:username` - ユーザー別ワークスペース
- `/:username/pc` - ユーザー別ワークスペースの PC 版
- `/admin` - 管理パネル

## 同期仕様

- ユーザー名ごとにサーバー側 SQLite のタスクリストを共有します。
- 画面は 10 秒ごと、およびタブ復帰時に再同期します。
- 共有コード同期と Cloudflare Pages/D1 構成は廃止済みです。
