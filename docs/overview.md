# プロジェクト概要

**Nippou Builder** は、日報作成を支援するWebアプリです。Cloudflare Pages上で動作し、タスクの記録・フォーマット・複数端末間での同期機能を提供します。

## 主な機能

- **タスク記録** — 開始時刻・終了時刻・内容を入力して記録
- **日報自動フォーマット** — タスクを日本語日報形式に自動整形（時間計算・タスクのグループ化）
- **マルチデバイス同期** — 共有コードを使い複数端末でタスクを共有
- **ローカルフォールバック** — 未接続時は localStorage にタスクを保持
- **PC/モバイル対応** — PC用カスタム時刻ピッカーとモバイル用ネイティブピッカーの2UI

## 技術スタック

| レイヤー | 技術 |
|--------|------|
| フロントエンド | Astro v6 + React v19 + TypeScript |
| バックエンド | Cloudflare Pages Functions |
| データベース | Cloudflare D1 (SQLite) |
| デプロイ | Cloudflare Pages + Wrangler |
| アイコン | Lucide React |

## ディレクトリ構成

```
nippou_builder/
├── src/                   # フロントエンドソース
│   ├── components/        # Reactコンポーネント
│   ├── pages/             # Astroページ
│   ├── App.tsx            # メインアプリケーション
│   ├── api.ts             # APIクライアント
│   ├── types.ts           # TypeScript型定義
│   └── utils.ts           # ユーティリティ（パース・フォーマット）
├── functions/             # Cloudflare Pages Functions（サーバーレスAPI）
│   ├── api/               # APIエンドポイント
│   └── _lib/              # DB操作ライブラリ
├── migrations/            # DBマイグレーションSQL
├── public/                # 静的アセット
├── docs/                  # プロジェクト文書（このフォルダー）
├── astro.config.mjs
├── tsconfig.json
└── wrangler.toml
```

## 関連ドキュメント

- [アーキテクチャ](./architecture.md) — データフローと設計判断
- [API仕様](./api.md) — エンドポイント一覧
- [コンポーネント](./components.md) — フロントエンドコンポーネント詳細
- [開発ガイド](./development.md) — セットアップ・開発・デプロイ手順
